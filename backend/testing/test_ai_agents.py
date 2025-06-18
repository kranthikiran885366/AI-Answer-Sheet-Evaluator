import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from ai_agents.base_agent import EvaluationRequest, EvaluationResult, AIProvider
from ai_agents.openai_agent import OpenAIAgent
from ai_agents.google_agent import GoogleAIAgent
from ai_agents.claude_agent import ClaudeAgent
from ai_agents.local_agent import LocalAIAgent
from ai_agents.agent_manager import AIAgentManager

class TestBaseAgent:
    """Test base agent functionality"""
    
    def test_evaluation_request_creation(self, sample_request):
        """Test EvaluationRequest creation"""
        request = EvaluationRequest(**sample_request)
        assert request.text == sample_request['text']
        assert request.subject == sample_request['subject']
        assert request.exam_type == sample_request['exam_type']

class TestOpenAIAgent:
    """Test OpenAI agent functionality"""
    
    @pytest.fixture
    def openai_agent(self, test_config):
        """Create OpenAI agent for testing"""
        return OpenAIAgent(test_config['openai'])
    
    @pytest.mark.asyncio
    async def test_health_check_success(self, openai_agent):
        """Test successful health check"""
        with patch('openai.ChatCompletion.acreate') as mock_create:
            mock_create.return_value = Mock(choices=[Mock(message=Mock(content="OK"))])
            result = await openai_agent.health_check()
            assert result is True
    
    @pytest.mark.asyncio
    async def test_health_check_failure(self, openai_agent):
        """Test failed health check"""
        with patch('openai.ChatCompletion.acreate', side_effect=Exception("API Error")):
            result = await openai_agent.health_check()
            assert result is False
    
    @pytest.mark.asyncio
    async def test_evaluate_answer(self, openai_agent, sample_request):
        """Test answer evaluation"""
        mock_response = {
            "score": 85,
            "grade": "B+",
            "feedback": "Good understanding demonstrated",
            "suggestions": "Add more examples",
            "points_covered": ["basic concepts"],
            "points_missed": ["advanced details"],
            "confidence": 88.5
        }
        
        with patch('openai.ChatCompletion.acreate') as mock_create:
            mock_create.return_value = Mock(
                choices=[Mock(message=Mock(content=str(mock_response).replace("'", '"')))]
            )
            
            request = EvaluationRequest(**sample_request)
            result = await openai_agent.evaluate_answer(request)
            
            assert isinstance(result, EvaluationResult)
            assert result.provider == AIProvider.OPENAI.value
            assert result.score >= 0
            assert result.confidence >= 0

class TestGoogleAIAgent:
    """Test Google AI agent functionality"""
    
    @pytest.fixture
    def google_agent(self, test_config):
        """Create Google AI agent for testing"""
        return GoogleAIAgent(test_config['google'])
    
    @pytest.mark.asyncio
    async def test_health_check(self, google_agent):
        """Test Google AI health check"""
        with patch('google.generativeai.GenerativeModel') as mock_model:
            mock_instance = Mock()
            mock_instance.generate_content.return_value = Mock(text="OK")
            mock_model.return_value = mock_instance
            
            result = await google_agent.health_check()
            assert result is True

class TestClaudeAgent:
    """Test Claude agent functionality"""
    
    @pytest.fixture
    def claude_agent(self, test_config):
        """Create Claude agent for testing"""
        return ClaudeAgent(test_config['claude'])
    
    @pytest.mark.asyncio
    async def test_health_check(self, claude_agent):
        """Test Claude health check"""
        with patch('anthropic.AsyncAnthropic') as mock_client:
            mock_instance = Mock()
            mock_instance.messages.create = AsyncMock(
                return_value=Mock(content=[Mock(text="OK")])
            )
            mock_client.return_value = mock_instance
            
            result = await claude_agent.health_check()
            assert result is True

class TestLocalAIAgent:
    """Test Local AI agent functionality"""
    
    @pytest.fixture
    def local_agent(self, test_config):
        """Create Local AI agent for testing"""
        with patch('torch.cuda.is_available', return_value=False):
            with patch.object(LocalAIAgent, 'load_models'):
                return LocalAIAgent(test_config['local'])
    
    @pytest.mark.asyncio
    async def test_extract_text_ocr(self, local_agent, sample_image):
        """Test OCR text extraction"""
        with patch('pytesseract.image_to_string', return_value="Sample extracted text"):
            result = await local_agent.extract_text(sample_image)
            assert "Sample extracted text" in result

class TestAIAgentManager:
    """Test AI Agent Manager functionality"""
    
    @pytest.fixture
    def agent_manager(self, test_config):
        """Create agent manager for testing"""
        with patch.object(AIAgentManager, 'load_agents'):
            manager = AIAgentManager(test_config)
            # Mock agents
            manager.agents = {
                AIProvider.LOCAL: Mock(spec=LocalAIAgent)
            }
            return manager
    
    @pytest.mark.asyncio
    async def test_health_check_all(self, agent_manager):
        """Test health check for all agents"""
        # Mock health check responses
        for provider, agent in agent_manager.agents.items():
            agent.health_check = AsyncMock(return_value=True)
        
        health_status = await agent_manager.health_check_all()
        assert all(status for status in health_status.values())
    
    @pytest.mark.asyncio
    async def test_evaluate_with_fallback(self, agent_manager, sample_request):
        """Test evaluation with fallback strategy"""
        mock_result = EvaluationResult(
            score=85,
            grade="B+",
            feedback="Good work",
            suggestions="Keep practicing",
            points_covered=["basics"],
            points_missed=["advanced"],
            confidence=85.0,
            provider="local",
            processing_time=1.5
        )
        
        # Mock successful evaluation
        agent_manager.agents[AIProvider.LOCAL].evaluate_answer = AsyncMock(return_value=mock_result)
        
        request = EvaluationRequest(**sample_request)
        result = await agent_manager.evaluate_with_fallback(request)
        
        assert isinstance(result, EvaluationResult)
        assert result.score == 85
