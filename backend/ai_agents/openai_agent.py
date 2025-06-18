import openai
import asyncio
import json
import time
from typing import Dict, Any, List
from .base_agent import BaseAIAgent, EvaluationRequest, EvaluationResult, AIProvider
import logging

logger = logging.getLogger(__name__)

class OpenAIAgent(BaseAIAgent):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(AIProvider.OPENAI, config)
        openai.api_key = config.get('api_key')
        self.model = config.get('model_name', 'gpt-4')
        self.vision_model = config.get('vision_model', 'gpt-4-vision-preview')
        
    async def evaluate_answer(self, request: EvaluationRequest) -> EvaluationResult:
        start_time = time.time()
        
        try:
            prompt = self._create_evaluation_prompt(request)
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert teacher and evaluator."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            result_data = json.loads(response.choices[0].message.content)
            processing_time = time.time() - start_time
            
            return EvaluationResult(
                score=result_data.get('score', 0),
                grade=result_data.get('grade', 'F'),
                feedback=result_data.get('feedback', ''),
                suggestions=result_data.get('suggestions', ''),
                points_covered=result_data.get('points_covered', []),
                points_missed=result_data.get('points_missed', []),
                confidence=result_data.get('confidence', 0.0),
                provider=self.provider.value,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"OpenAI evaluation error: {e}")
            raise
    
    async def extract_text(self, image_bytes: bytes) -> str:
        try:
            import base64
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            
            response = await openai.ChatCompletion.acreate(
                model=self.vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extract all text from this answer sheet image. Maintain the structure and formatting."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=2000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI OCR error: {e}")
            return "Error extracting text with OpenAI Vision"
    
    async def generate_feedback(self, score: int, subject: str, answer: str) -> str:
        try:
            prompt = f"""
            Generate personalized feedback for a {subject} answer that scored {score}/100.
            
            Answer: {answer}
            
            Provide constructive, encouraging feedback that helps the student improve.
            """
            
            response = await openai.ChatCompletion.acreate(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI feedback error: {e}")
            return "Unable to generate personalized feedback at this time."
    
    async def health_check(self) -> bool:
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=5
            )
            return True
        except Exception:
            return False
    
    def _create_evaluation_prompt(self, request: EvaluationRequest) -> str:
        return f"""
        Evaluate this {request.subject} {request.exam_type} answer and provide a comprehensive assessment.
        
        Question Context: {request.question_context}
        Rubric: {request.rubric}
        Maximum Score: {request.max_score}
        
        Student Answer:
        {request.text}
        
        Provide your evaluation in JSON format with the following structure:
        {{
            "score": <integer from 0 to {request.max_score}>,
            "grade": "<letter grade A+ to F>",
            "feedback": "<detailed constructive feedback>",
            "suggestions": "<specific improvement suggestions>",
            "points_covered": ["<list of key points covered>"],
            "points_missed": ["<list of key points missed>"],
            "confidence": <float from 0 to 100 representing your confidence in this evaluation>
        }}
        
        Be fair, constructive, and encouraging while maintaining academic standards.
        """
