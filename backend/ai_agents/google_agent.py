import google.generativeai as genai
import asyncio
import json
import time
from typing import Dict, Any, List
from .base_agent import BaseAIAgent, EvaluationRequest, EvaluationResult, AIProvider
import logging

logger = logging.getLogger(__name__)

class GoogleAIAgent(BaseAIAgent):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(AIProvider.GOOGLE, config)
        genai.configure(api_key=config.get('api_key'))
        self.model = genai.GenerativeModel(config.get('model_name', 'gemini-pro'))
        self.vision_model = genai.GenerativeModel(config.get('vision_model', 'gemini-pro-vision'))
        
    async def evaluate_answer(self, request: EvaluationRequest) -> EvaluationResult:
        start_time = time.time()
        
        try:
            prompt = self._create_evaluation_prompt(request)
            
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=self.max_tokens,
                    temperature=self.temperature
                )
            )
            
            # Parse JSON response
            result_text = response.text
            # Clean up the response to extract JSON
            if "```json" in result_text:
                result_text = result_text.split("```json")[1].split("```")[0]
            elif "```" in result_text:
                result_text = result_text.split("```")[1]
            
            result_data = json.loads(result_text.strip())
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
            logger.error(f"Google AI evaluation error: {e}")
            raise
    
    async def extract_text(self, image_bytes: bytes) -> str:
        try:
            from PIL import Image
            import io
            
            image = Image.open(io.BytesIO(image_bytes))
            
            prompt = "Extract all text from this answer sheet image. Maintain the structure and formatting as much as possible."
            
            response = await asyncio.to_thread(
                self.vision_model.generate_content,
                [prompt, image]
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Google AI OCR error: {e}")
            return "Error extracting text with Google AI Vision"
    
    async def generate_feedback(self, score: int, subject: str, answer: str) -> str:
        try:
            prompt = f"""
            Generate personalized, encouraging feedback for a {subject} answer that scored {score}/100.
            
            Answer: {answer}
            
            Provide constructive feedback that helps the student improve while being supportive.
            """
            
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=300,
                    temperature=0.7
                )
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Google AI feedback error: {e}")
            return "Unable to generate personalized feedback at this time."
    
    async def health_check(self) -> bool:
        try:
            response = await asyncio.to_thread(
                self.model.generate_content,
                "Hello, respond with 'OK'"
            )
            return "OK" in response.text
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
        \`\`\`json
        {{
            "score": <integer from 0 to {request.max_score}>,
            "grade": "<letter grade A+ to F>",
            "feedback": "<detailed constructive feedback>",
            "suggestions": "<specific improvement suggestions>",
            "points_covered": ["<list of key points covered>"],
            "points_missed": ["<list of key points missed>"],
            "confidence": <float from 0 to 100 representing your confidence in this evaluation>
        }}
