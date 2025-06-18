import asyncio
import logging
from typing import Dict, Any, List, Optional
from .base_agent import BaseAIAgent, EvaluationRequest, EvaluationResult, AIProvider
from .openai_agent import OpenAIAgent
from .google_agent import GoogleAIAgent
from .claude_agent import ClaudeAgent
from .local_agent import LocalAIAgent
import time
import statistics

logger = logging.getLogger(__name__)

class AIAgentManager:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.agents: Dict[AIProvider, BaseAIAgent] = {}
        self.fallback_order = [AIProvider.OPENAI, AIProvider.GOOGLE, AIProvider.CLAUDE, AIProvider.LOCAL]
        self.load_agents()
        
    def load_agents(self):
        """Load all available AI agents"""
        try:
            # Load OpenAI agent
            if self.config.get('openai', {}).get('api_key'):
                self.agents[AIProvider.OPENAI] = OpenAIAgent(self.config['openai'])
                logger.info("OpenAI agent loaded")
            
            # Load Google AI agent
            if self.config.get('google', {}).get('api_key'):
                self.agents[AIProvider.GOOGLE] = GoogleAIAgent(self.config['google'])
                logger.info("Google AI agent loaded")
            
            # Load Claude agent
            if self.config.get('claude', {}).get('api_key'):
                self.agents[AIProvider.CLAUDE] = ClaudeAgent(self.config['claude'])
                logger.info("Claude agent loaded")
            
            # Always load local agent as fallback
            self.agents[AIProvider.LOCAL] = LocalAIAgent(self.config.get('local', {}))
            logger.info("Local AI agent loaded")
            
        except Exception as e:
            logger.error(f"Error loading agents: {e}")
    
    async def evaluate_with_consensus(self, request: EvaluationRequest, providers: List[AIProvider] = None) -> EvaluationResult:
        """Evaluate using multiple providers and return consensus result"""
        if providers is None:
            providers = list(self.agents.keys())
        
        results = []
        tasks = []
        
        for provider in providers:
            if provider in self.agents:
                task = asyncio.create_task(
                    self._safe_evaluate(self.agents[provider], request)
                )
                tasks.append((provider, task))
        
        # Wait for all evaluations to complete
        for provider, task in tasks:
            try:
                result = await task
                if result:
                    results.append(result)
                    logger.info(f"Evaluation completed by {provider.value}")
            except Exception as e:
                logger.error(f"Evaluation failed for {provider.value}: {e}")
        
        if not results:
            raise Exception("All AI providers failed to evaluate")
        
        # Calculate consensus result
        return self._calculate_consensus(results)
    
    async def evaluate_with_fallback(self, request: EvaluationRequest) -> EvaluationResult:
        """Evaluate using fallback strategy - try providers in order until one succeeds"""
        for provider in self.fallback_order:
            if provider in self.agents:
                try:
                    result = await self._safe_evaluate(self.agents[provider], request)
                    if result:
                        logger.info(f"Evaluation successful with {provider.value}")
                        return result
                except Exception as e:
                    logger.warning(f"Evaluation failed with {provider.value}: {e}")
                    continue
        
        raise Exception("All AI providers failed to evaluate")
    
    async def extract_text_with_fallback(self, image_bytes: bytes) -> str:
        """Extract text using fallback strategy"""
        for provider in self.fallback_order:
            if provider in self.agents:
                try:
                    text = await self.agents[provider].extract_text(image_bytes)
                    if text and "Error" not in text:
                        logger.info(f"OCR successful with {provider.value}")
                        return text
                except Exception as e:
                    logger.warning(f"OCR failed with {provider.value}: {e}")
                    continue
        
        return "Failed to extract text from all providers"
    
    async def health_check_all(self) -> Dict[str, bool]:
        """Check health of all agents"""
        health_status = {}
        
        for provider, agent in self.agents.items():
            try:
                health_status[provider.value] = await agent.health_check()
            except Exception as e:
                logger.error(f"Health check failed for {provider.value}: {e}")
                health_status[provider.value] = False
        
        return health_status
    
    async def _safe_evaluate(self, agent: BaseAIAgent, request: EvaluationRequest) -> Optional[EvaluationResult]:
        """Safely evaluate with timeout and error handling"""
        try:
            # Set timeout for evaluation
            result = await asyncio.wait_for(
                agent.evaluate_answer(request),
                timeout=30.0  # 30 second timeout
            )
            return result
        except asyncio.TimeoutError:
            logger.error(f"Evaluation timeout for {agent.provider.value}")
            return None
        except Exception as e:
            logger.error(f"Evaluation error for {agent.provider.value}: {e}")
            return None
    
    def _calculate_consensus(self, results: List[EvaluationResult]) -> EvaluationResult:
        """Calculate consensus result from multiple evaluations"""
        if len(results) == 1:
            return results[0]
        
        # Calculate average score
        scores = [r.score for r in results]
        avg_score = int(statistics.mean(scores))
        
        # Calculate confidence as average
        confidences = [r.confidence for r in results]
        avg_confidence = statistics.mean(confidences)
        
        # Use the grade from the result closest to average score
        closest_result = min(results, key=lambda r: abs(r.score - avg_score))
        
        # Combine feedback from all results
        combined_feedback = " ".join([r.feedback for r in results])
        
        # Combine suggestions
        all_suggestions = []
        for r in results:
            if r.suggestions:
                all_suggestions.append(r.suggestions)
        combined_suggestions = " ".join(all_suggestions)
        
        # Combine points covered and missed
        all_points_covered = []
        all_points_missed = []
        for r in results:
            all_points_covered.extend(r.points_covered)
            all_points_missed.extend(r.points_missed)
        
        # Remove duplicates
        unique_points_covered = list(set(all_points_covered))
        unique_points_missed = list(set(all_points_missed))
        
        # Calculate average processing time
        avg_processing_time = statistics.mean([r.processing_time for r in results])
        
        return EvaluationResult(
            score=avg_score,
            grade=closest_result.grade,
            feedback=combined_feedback[:500],  # Limit length
            suggestions=combined_suggestions[:300],  # Limit length
            points_covered=unique_points_covered[:10],  # Limit to 10
            points_missed=unique_points_missed[:10],  # Limit to 10
            confidence=avg_confidence,
            provider="consensus",
            processing_time=avg_processing_time
        )
