from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import asyncio
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class AIProvider(Enum):
    OPENAI = "openai"
    GOOGLE = "google"
    CLAUDE = "claude"
    LOCAL = "local"

@dataclass
class EvaluationRequest:
    text: str
    subject: str
    exam_type: str
    question_context: str = ""
    rubric: str = ""
    max_score: int = 100

@dataclass
class EvaluationResult:
    score: int
    grade: str
    feedback: str
    suggestions: str
    points_covered: List[str]
    points_missed: List[str]
    confidence: float
    provider: str
    processing_time: float

class BaseAIAgent(ABC):
    def __init__(self, provider: AIProvider, config: Dict[str, Any]):
        self.provider = provider
        self.config = config
        self.model_name = config.get('model_name', 'default')
        self.max_tokens = config.get('max_tokens', 1000)
        self.temperature = config.get('temperature', 0.3)
        
    @abstractmethod
    async def evaluate_answer(self, request: EvaluationRequest) -> EvaluationResult:
        """Evaluate an answer and return detailed results"""
        pass
    
    @abstractmethod
    async def extract_text(self, image_bytes: bytes) -> str:
        """Extract text from image using OCR"""
        pass
    
    @abstractmethod
    async def generate_feedback(self, score: int, subject: str, answer: str) -> str:
        """Generate personalized feedback"""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the AI service is available"""
        pass
