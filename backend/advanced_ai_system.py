import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import numpy as np
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel, pipeline
import cv2
import pytesseract
from PIL import Image
import io
import openai
import google.generativeai as genai
import anthropic
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import re
import json
from dataclasses import dataclass
from enum import Enum
import aiohttp
import aiofiles
from concurrent.futures import ThreadPoolExecutor
import redis
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import boto3
from botocore.exceptions import ClientError
import wandb
from prometheus_client import Counter, Histogram, Gauge
import sentry_sdk

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Sentry for error tracking
sentry_sdk.init(dsn="your-sentry-dsn")

# Prometheus metrics
evaluation_counter = Counter('evaluations_total', 'Total evaluations processed')
evaluation_duration = Histogram('evaluation_duration_seconds', 'Time spent on evaluations')
model_accuracy = Gauge('model_accuracy', 'Current model accuracy')
active_connections = Gauge('websocket_connections', 'Active WebSocket connections')

class EvaluationMode(Enum):
    QUICK = "quick"
    DETAILED = "detailed"
    CONSENSUS = "consensus"
    EXPLAINABLE = "explainable"

class SubjectType(Enum):
    MATHEMATICS = "mathematics"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"
    BIOLOGY = "biology"
    ENGLISH = "english"
    HISTORY = "history"
    GEOGRAPHY = "geography"
    COMPUTER_SCIENCE = "computer_science"

@dataclass
class EvaluationRequest:
    student_id: str
    answer_text: str
    question_text: str
    model_answer: str
    subject: SubjectType
    max_marks: int
    rubric: Dict[str, Any]
    mode: EvaluationMode = EvaluationMode.DETAILED
    custom_instructions: Optional[str] = None

@dataclass
class EvaluationResult:
    score: float
    max_score: float
    percentage: float
    grade: str
    detailed_feedback: str
    improvement_suggestions: List[str]
    concept_coverage: Dict[str, float]
    grammar_score: Optional[float]
    plagiarism_score: float
    confidence: float
    processing_time: float
    explanation: str
    rubric_breakdown: Dict[str, Any]

class AdvancedOCREngine:
    """Advanced OCR with multiple engines and preprocessing"""
    
    def __init__(self):
        self.engines = {
            'tesseract': self._tesseract_ocr,
            'easyocr': self._easyocr_ocr,
            'paddleocr': self._paddleocr_ocr
        }
        self.nlp = spacy.load("en_core_web_sm")
        
    async def extract_text(self, image_bytes: bytes, language: str = 'en') -> Dict[str, Any]:
        """Extract text using multiple OCR engines with consensus"""
        try:
            # Preprocess image
            processed_image = await self._preprocess_image(image_bytes)
            
            # Run multiple OCR engines
            results = {}
            for engine_name, engine_func in self.engines.items():
                try:
                    result = await engine_func(processed_image, language)
                    results[engine_name] = result
                except Exception as e:
                    logger.warning(f"OCR engine {engine_name} failed: {e}")
            
            # Consensus and confidence scoring
            final_text, confidence = self._calculate_ocr_consensus(results)
            
            # Post-processing
            cleaned_text = self._post_process_text(final_text)
            
            return {
                'text': cleaned_text,
                'confidence': confidence,
                'engine_results': results,
                'language': language,
                'word_count': len(cleaned_text.split()),
                'line_count': len(cleaned_text.split('\n'))
            }
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            raise
    
    async def _preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """Advanced image preprocessing for better OCR"""
        # Convert to OpenCV format
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Noise reduction
        denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
        
        # Convert to grayscale
        gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
        
        # Adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Deskew correction
        coords = np.column_stack(np.where(thresh > 0))
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        
        (h, w) = thresh.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
        return rotated
    
    async def _tesseract_ocr(self, image: np.ndarray, language: str) -> str:
        """Tesseract OCR with custom configuration"""
        config = '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,!?()[]{}:;-+*/=<>%$@#&'
        return pytesseract.image_to_string(image, lang=language, config=config)
    
    async def _easyocr_ocr(self, image: np.ndarray, language: str) -> str:
        """EasyOCR implementation"""
        try:
            import easyocr
            reader = easyocr.Reader([language])
            results = reader.readtext(image)
            return ' '.join([result[1] for result in results])
        except ImportError:
            logger.warning("EasyOCR not available")
            return ""
    
    async def _paddleocr_ocr(self, image: np.ndarray, language: str) -> str:
        """PaddleOCR implementation"""
        try:
            from paddleocr import PaddleOCR
            ocr = PaddleOCR(use_angle_cls=True, lang=language)
            results = ocr.ocr(image, cls=True)
            return ' '.join([line[1][0] for line in results[0] if line])
        except ImportError:
            logger.warning("PaddleOCR not available")
            return ""
    
    def _calculate_ocr_consensus(self, results: Dict[str, str]) -> tuple:
        """Calculate consensus from multiple OCR results"""
        if not results:
            return "", 0.0
        
        if len(results) == 1:
            return list(results.values())[0], 0.8
        
        # Simple consensus: use the longest result as base
        texts = list(results.values())
        base_text = max(texts, key=len)
        
        # Calculate similarity scores
        vectorizer = TfidfVectorizer()
        try:
            tfidf_matrix = vectorizer.fit_transform(texts)
            similarities = cosine_similarity(tfidf_matrix)
            avg_similarity = np.mean(similarities)
            confidence = min(avg_similarity * 1.2, 1.0)
        except:
            confidence = 0.7
        
        return base_text, confidence
    
    def _post_process_text(self, text: str) -> str:
        """Post-process extracted text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Fix common OCR errors
        corrections = {
            '0': 'O', '1': 'I', '5': 'S', '8': 'B',
            'rn': 'm', 'vv': 'w', 'nn': 'n'
        }
        
        for wrong, correct in corrections.items():
            text = text.replace(wrong, correct)
        
        return text.strip()

class MultiModalAIEvaluator:
    """Advanced AI evaluator with multiple providers and consensus"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.providers = {}
        self.nlp = spacy.load("en_core_web_sm")
        self.setup_providers()
        
        # Initialize plagiarism detector
        self.plagiarism_threshold = 0.8
        
        # Load subject-specific models
        self.subject_models = {}
        self.load_subject_models()
    
    def setup_providers(self):
        """Setup AI providers"""
        # OpenAI
        if self.config.get('openai_api_key'):
            openai.api_key = self.config['openai_api_key']
            self.providers['openai'] = self._openai_evaluate
        
        # Google AI
        if self.config.get('google_api_key'):
            genai.configure(api_key=self.config['google_api_key'])
            self.providers['google'] = self._google_evaluate
        
        # Anthropic Claude
        if self.config.get('anthropic_api_key'):
            self.anthropic_client = anthropic.Anthropic(api_key=self.config['anthropic_api_key'])
            self.providers['claude'] = self._claude_evaluate
        
        # Local models
        self.providers['local'] = self._local_evaluate
    
    def load_subject_models(self):
        """Load subject-specific fine-tuned models"""
        for subject in SubjectType:
            try:
                model_path = f"models/{subject.value}_evaluator"
                tokenizer = AutoTokenizer.from_pretrained(model_path)
                model = AutoModel.from_pretrained(model_path)
                self.subject_models[subject] = {
                    'tokenizer': tokenizer,
                    'model': model
                }
            except:
                logger.warning(f"Subject model for {subject.value} not found")
    
    async def evaluate_answer(self, request: EvaluationRequest) -> EvaluationResult:
        """Main evaluation function with multiple AI providers"""
        start_time = datetime.now()
        
        try:
            # Preprocessing
            processed_request = await self._preprocess_request(request)
            
            # Choose evaluation strategy
            if request.mode == EvaluationMode.CONSENSUS:
                result = await self._consensus_evaluation(processed_request)
            elif request.mode == EvaluationMode.EXPLAINABLE:
                result = await self._explainable_evaluation(processed_request)
            else:
                result = await self._single_provider_evaluation(processed_request)
            
            # Post-processing
            final_result = await self._postprocess_result(result, request)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            final_result.processing_time = processing_time
            
            # Update metrics
            evaluation_counter.inc()
            evaluation_duration.observe(processing_time)
            
            return final_result
            
        except Exception as e:
            logger.error(f"Evaluation failed: {e}")
            sentry_sdk.capture_exception(e)
            raise
    
    async def _preprocess_request(self, request: EvaluationRequest) -> EvaluationRequest:
        """Preprocess evaluation request"""
        # Clean and normalize text
        request.answer_text = self._clean_text(request.answer_text)
        request.question_text = self._clean_text(request.question_text)
        request.model_answer = self._clean_text(request.model_answer)
        
        # Extract key concepts
        answer_concepts = self._extract_concepts(request.answer_text)
        model_concepts = self._extract_concepts(request.model_answer)
        
        # Add concept analysis to rubric
        request.rubric['concepts'] = {
            'answer_concepts': answer_concepts,
            'model_concepts': model_concepts,
            'concept_overlap': len(set(answer_concepts) & set(model_concepts))
        }
        
        return request
    
    async def _consensus_evaluation(self, request: EvaluationRequest) -> EvaluationResult:
        """Evaluate using multiple providers and calculate consensus"""
        results = []
        
        # Run evaluation with all available providers
        tasks = []
        for provider_name, provider_func in self.providers.items():
            task = asyncio.create_task(self._safe_evaluate(provider_func, request, provider_name))
            tasks.append(task)
        
        # Wait for all evaluations
        provider_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter successful results
        for result in provider_results:
            if isinstance(result, EvaluationResult):
                results.append(result)
        
        if not results:
            raise Exception("All AI providers failed")
        
        # Calculate consensus
        return self._calculate_consensus(results)
    
    async def _explainable_evaluation(self, request: EvaluationRequest) -> EvaluationResult:
        """Evaluation with detailed explanations"""
        # Use the best available provider for explainable AI
        if 'openai' in self.providers:
            result = await self._openai_evaluate(request, explain=True)
        elif 'claude' in self.providers:
            result = await self._claude_evaluate(request, explain=True)
        else:
            result = await self._local_evaluate(request, explain=True)
        
        # Add detailed explanations
        result.explanation = await self._generate_explanation(request, result)
        
        return result
    
    async def _single_provider_evaluation(self, request: EvaluationRequest) -> EvaluationResult:
        """Single provider evaluation"""
        # Choose best available provider
        provider_priority = ['openai', 'claude', 'google', 'local']
        
        for provider in provider_priority:
            if provider in self.providers:
                return await self.providers[provider](request)
        
        raise Exception("No AI providers available")
    
    async def _openai_evaluate(self, request: EvaluationRequest, explain: bool = False) -> EvaluationResult:
        """OpenAI GPT-4 evaluation"""
        prompt = self._build_evaluation_prompt(request, explain)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are an expert teacher and evaluator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            result_text = response.choices[0].message.content
            return self._parse_evaluation_result(result_text, request)
            
        except Exception as e:
            logger.error(f"OpenAI evaluation failed: {e}")
            raise
    
    async def _google_evaluate(self, request: EvaluationRequest, explain: bool = False) -> EvaluationResult:
        """Google Gemini evaluation"""
        prompt = self._build_evaluation_prompt(request, explain)
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = await model.generate_content_async(prompt)
            
            result_text = response.text
            return self._parse_evaluation_result(result_text, request)
            
        except Exception as e:
            logger.error(f"Google AI evaluation failed: {e}")
            raise
    
    async def _claude_evaluate(self, request: EvaluationRequest, explain: bool = False) -> EvaluationResult:
        """Anthropic Claude evaluation"""
        prompt = self._build_evaluation_prompt(request, explain)
        
        try:
            response = await self.anthropic_client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            result_text = response.content[0].text
            return self._parse_evaluation_result(result_text, request)
            
        except Exception as e:
            logger.error(f"Claude evaluation failed: {e}")
            raise
    
    async def _local_evaluate(self, request: EvaluationRequest, explain: bool = False) -> EvaluationResult:
        """Local model evaluation"""
        try:
            # Use subject-specific model if available
            if request.subject in self.subject_models:
                return await self._subject_specific_evaluate(request)
            
            # Fallback to rule-based evaluation
            return await self._rule_based_evaluate(request)
            
        except Exception as e:
            logger.error(f"Local evaluation failed: {e}")
            raise
    
    async def _subject_specific_evaluate(self, request: EvaluationRequest) -> EvaluationResult:
        """Evaluate using subject-specific fine-tuned model"""
        model_info = self.subject_models[request.subject]
        tokenizer = model_info['tokenizer']
        model = model_info['model']
        
        # Tokenize input
        inputs = tokenizer(
            f"Question: {request.question_text}\nAnswer: {request.answer_text}\nModel Answer: {request.model_answer}",
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        )
        
        # Get model prediction
        with torch.no_grad():
            outputs = model(**inputs)
            # Assuming the model outputs a score
            score = torch.sigmoid(outputs.last_hidden_state.mean()).item() * request.max_marks
        
        # Generate basic feedback
        feedback = f"Based on subject-specific analysis, your answer demonstrates understanding of key concepts."
        
        return EvaluationResult(
            score=score,
            max_score=request.max_marks,
            percentage=(score / request.max_marks) * 100,
            grade=self._calculate_grade(score, request.max_marks),
            detailed_feedback=feedback,
            improvement_suggestions=["Consider adding more specific examples"],
            concept_coverage={},
            grammar_score=None,
            plagiarism_score=0.0,
            confidence=0.85,
            processing_time=0.0,
            explanation="Evaluated using subject-specific AI model",
            rubric_breakdown={}
        )
    
    async def _rule_based_evaluate(self, request: EvaluationRequest) -> EvaluationResult:
        """Rule-based evaluation as fallback"""
        # Calculate similarity with model answer
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([request.answer_text, request.model_answer])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        
        # Basic scoring
        base_score = similarity * request.max_marks
        
        # Adjust for length and completeness
        answer_length = len(request.answer_text.split())
        model_length = len(request.model_answer.split())
        length_ratio = min(answer_length / model_length, 1.0) if model_length > 0 else 0.5
        
        final_score = base_score * (0.7 + 0.3 * length_ratio)
        
        return EvaluationResult(
            score=final_score,
            max_score=request.max_marks,
            percentage=(final_score / request.max_marks) * 100,
            grade=self._calculate_grade(final_score, request.max_marks),
            detailed_feedback=f"Your answer shows {similarity:.1%} similarity to the model answer.",
            improvement_suggestions=["Provide more detailed explanations", "Include specific examples"],
            concept_coverage={},
            grammar_score=None,
            plagiarism_score=0.0,
            confidence=0.7,
            processing_time=0.0,
            explanation="Evaluated using rule-based similarity analysis",
            rubric_breakdown={}
        )
    
    def _build_evaluation_prompt(self, request: EvaluationRequest, explain: bool = False) -> str:
        """Build comprehensive evaluation prompt"""
        prompt = f"""
        You are an expert teacher evaluating a student's answer. Please provide a comprehensive evaluation.

        QUESTION: {request.question_text}
        
        STUDENT'S ANSWER: {request.answer_text}
        
        MODEL ANSWER: {request.model_answer}
        
        SUBJECT: {request.subject.value}
        MAXIMUM MARKS: {request.max_marks}
        
        RUBRIC: {json.dumps(request.rubric, indent=2)}
        
        Please evaluate the student's answer and provide:
        1. Score (out of {request.max_marks})
        2. Grade (A+, A, B+, B, C+, C, D, F)
        3. Detailed feedback (2-3 sentences)
        4. Specific improvement suggestions
        5. Concept coverage analysis
        6. Grammar assessment (if applicable)
        7. Confidence level (0-100%)
        
        {"8. Detailed explanation of scoring rationale" if explain else ""}
        
        Format your response as JSON with the following structure:
        {{
            "score": <number>,
            "grade": "<letter>",
            "detailed_feedback": "<string>",
            "improvement_suggestions": ["<suggestion1>", "<suggestion2>"],
            "concept_coverage": {{"<concept>": <coverage_percentage>}},
            "grammar_score": <number or null>,
            "confidence": <number>,
            {"explanation": "<detailed_explanation>," if explain else ""}
            "rubric_breakdown": {{"<criterion>": <score>}}
        }}
        """
        
        return prompt
    
    def _parse_evaluation_result(self, result_text: str, request: EvaluationRequest) -> EvaluationResult:
        """Parse AI evaluation result"""
        try:
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                result_data = json.loads(json_match.group())
            else:
                raise ValueError("No JSON found in response")
            
            return EvaluationResult(
                score=float(result_data.get('score', 0)),
                max_score=request.max_marks,
                percentage=(float(result_data.get('score', 0)) / request.max_marks) * 100,
                grade=result_data.get('grade', 'F'),
                detailed_feedback=result_data.get('detailed_feedback', ''),
                improvement_suggestions=result_data.get('improvement_suggestions', []),
                concept_coverage=result_data.get('concept_coverage', {}),
                grammar_score=result_data.get('grammar_score'),
                plagiarism_score=0.0,  # Will be calculated separately
                confidence=float(result_data.get('confidence', 70)) / 100,
                processing_time=0.0,
                explanation=result_data.get('explanation', ''),
                rubric_breakdown=result_data.get('rubric_breakdown', {})
            )
            
        except Exception as e:
            logger.error(f"Failed to parse evaluation result: {e}")
            # Return fallback result
            return EvaluationResult(
                score=0,
                max_score=request.max_marks,
                percentage=0,
                grade='F',
                detailed_feedback="Unable to evaluate answer properly.",
                improvement_suggestions=["Please try again"],
                concept_coverage={},
                grammar_score=None,
                plagiarism_score=0.0,
                confidence=0.1,
                processing_time=0.0,
                explanation="Evaluation parsing failed",
                rubric_breakdown={}
            )
    
    async def _safe_evaluate(self, provider_func, request: EvaluationRequest, provider_name: str) -> EvaluationResult:
        """Safely evaluate with timeout and error handling"""
        try:
            result = await asyncio.wait_for(provider_func(request), timeout=30.0)
            logger.info(f"Evaluation successful with {provider_name}")
            return result
        except asyncio.TimeoutError:
            logger.error(f"Evaluation timeout for {provider_name}")
            raise
        except Exception as e:
            logger.error(f"Evaluation failed for {provider_name}: {e}")
            raise
    
    def _calculate_consensus(self, results: List[EvaluationResult]) -> EvaluationResult:
        """Calculate consensus from multiple evaluation results"""
        if len(results) == 1:
            return results[0]
        
        # Calculate weighted average score
        scores = [r.score for r in results]
        confidences = [r.confidence for r in results]
        
        # Weight by confidence
        weighted_score = sum(s * c for s, c in zip(scores, confidences)) / sum(confidences)
        
        # Use the grade from the result closest to weighted score
        closest_result = min(results, key=lambda r: abs(r.score - weighted_score))
        
        # Combine feedback
        combined_feedback = " ".join([r.detailed_feedback for r in results])[:500]
        
        # Combine suggestions
        all_suggestions = []
        for r in results:
            all_suggestions.extend(r.improvement_suggestions)
        unique_suggestions = list(set(all_suggestions))[:5]
        
        # Average confidence
        avg_confidence = sum(confidences) / len(confidences)
        
        return EvaluationResult(
            score=weighted_score,
            max_score=results[0].max_score,
            percentage=(weighted_score / results[0].max_score) * 100,
            grade=closest_result.grade,
            detailed_feedback=combined_feedback,
            improvement_suggestions=unique_suggestions,
            concept_coverage={},
            grammar_score=None,
            plagiarism_score=0.0,
            confidence=avg_confidence,
            processing_time=0.0,
            explanation="Consensus evaluation from multiple AI providers",
            rubric_breakdown={}
        )
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?;:()\-]', '', text)
        return text.strip()
    
    def _extract_concepts(self, text: str) -> List[str]:
        """Extract key concepts from text using NLP"""
        doc = self.nlp(text)
        concepts = []
        
        # Extract named entities
        for ent in doc.ents:
            concepts.append(ent.text.lower())
        
        # Extract noun phrases
        for chunk in doc.noun_chunks:
            concepts.append(chunk.text.lower())
        
        # Extract important keywords
        for token in doc:
            if token.pos_ in ['NOUN', 'ADJ'] and len(token.text) > 3:
                concepts.append(token.lemma_.lower())
        
        return list(set(concepts))
    
    def _calculate_grade(self, score: float, max_score: float) -> str:
        """Calculate letter grade from score"""
        percentage = (score / max_score) * 100
        
        if percentage >= 97: return 'A+'
        elif percentage >= 93: return 'A'
        elif percentage >= 90: return 'A-'
        elif percentage >= 87: return 'B+'
        elif percentage >= 83: return 'B'
        elif percentage >= 80: return 'B-'
        elif percentage >= 77: return 'C+'
        elif percentage >= 73: return 'C'
        elif percentage >= 70: return 'C-'
        elif percentage >= 67: return 'D+'
        elif percentage >= 65: return 'D'
        else: return 'F'
    
    async def _generate_explanation(self, request: EvaluationRequest, result: EvaluationResult) -> str:
        """Generate detailed explanation for the evaluation"""
        explanation = f"""
        EVALUATION EXPLANATION:
        
        Score: {result.score}/{result.max_score} ({result.percentage:.1f}%)
        Grade: {result.grade}
        
        SCORING BREAKDOWN:
        - Content Accuracy: Based on similarity to model answer and concept coverage
        - Completeness: Evaluated against rubric requirements
        - Clarity: Assessment of explanation quality and structure
        
        KEY FACTORS:
        - Your answer covered {len(result.concept_coverage)} key concepts
        - Confidence level: {result.confidence:.1%}
        - Areas for improvement: {', '.join(result.improvement_suggestions[:3])}
        
        This evaluation was performed using advanced AI analysis with explainable scoring.
        """
        
        return explanation.strip()
    
    async def _postprocess_result(self, result: EvaluationResult, request: EvaluationRequest) -> EvaluationResult:
        """Post-process evaluation result"""
        # Check for plagiarism
        result.plagiarism_score = await self._check_plagiarism(request.answer_text)
        
        # Adjust score if high plagiarism detected
        if result.plagiarism_score > self.plagiarism_threshold:
            result.score *= 0.5  # Reduce score by 50%
            result.detailed_feedback += " Note: Potential plagiarism detected."
        
        # Update percentage and grade
        result.percentage = (result.score / result.max_score) * 100
        result.grade = self._calculate_grade(result.score, result.max_score)
        
        return result
    
    async def _check_plagiarism(self, text: str) -> float:
        """Check for plagiarism (simplified implementation)"""
        # This would typically check against a database of known answers
        # For now, return a low score
        return 0.1

# Database Models
Base = declarative_base()

class Evaluation(Base):
    __tablename__ = 'evaluations'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(String(100), nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=False)
    model_answer = Column(Text, nullable=False)
    subject = Column(String(50), nullable=False)
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    grade = Column(String(5), nullable=False)
    feedback = Column(Text)
    confidence = Column(Float)
    processing_time = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Student(Base):
    __tablename__ = 'students'
    
    id = Column(Integer, primary_key=True)
    student_id = Column(String(100), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    email = Column(String(200))
    class_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

class Question(Base):
    __tablename__ = 'questions'
    
    id = Column(Integer, primary_key=True)
    question_text = Column(Text, nullable=False)
    model_answer = Column(Text, nullable=False)
    subject = Column(String(50), nullable=False)
    max_marks = Column(Integer, nullable=False)
    rubric = Column(Text)  # JSON string
    difficulty_level = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

# Main Application Class
class AdvancedAIEvaluationSystem:
    """Main system orchestrating all components"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.ocr_engine = AdvancedOCREngine()
        self.ai_evaluator = MultiModalAIEvaluator(config)
        self.setup_database()
        self.setup_redis()
        self.setup_storage()
        
        # Initialize monitoring
        if config.get('wandb_project'):
            wandb.init(project=config['wandb_project'])
    
    def setup_database(self):
        """Setup database connection"""
        db_url = self.config.get('database_url', 'sqlite:///evaluations.db')
        self.engine = create_engine(db_url)
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
    
    def setup_redis(self):
        """Setup Redis for caching"""
        redis_url = self.config.get('redis_url', 'redis://localhost:6379')
        try:
            self.redis_client = redis.from_url(redis_url)
        except:
            logger.warning("Redis not available")
            self.redis_client = None
    
    def setup_storage(self):
        """Setup cloud storage"""
        if self.config.get('aws_access_key'):
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.config['aws_access_key'],
                aws_secret_access_key=self.config['aws_secret_key'],
                region_name=self.config.get('aws_region', 'us-east-1')
            )
        else:
            self.s3_client = None
    
    async def process_answer_sheet(self, image_bytes: bytes, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Complete pipeline: OCR + Evaluation"""
        try:
            # Step 1: OCR
            ocr_result = await self.ocr_engine.extract_text(image_bytes)
            
            # Step 2: Parse questions and answers
            parsed_content = await self._parse_answer_sheet(ocr_result['text'], metadata)
            
            # Step 3: Evaluate each answer
            evaluation_results = []
            for item in parsed_content:
                request = EvaluationRequest(
                    student_id=metadata['student_id'],
                    answer_text=item['answer'],
                    question_text=item['question'],
                    model_answer=item['model_answer'],
                    subject=SubjectType(metadata['subject']),
                    max_marks=item['max_marks'],
                    rubric=item.get('rubric', {}),
                    mode=EvaluationMode(metadata.get('mode', 'detailed'))
                )
                
                result = await self.ai_evaluator.evaluate_answer(request)
                evaluation_results.append(result)
            
            # Step 4: Generate comprehensive report
            report = await self._generate_report(evaluation_results, metadata)
            
            # Step 5: Store results
            await self._store_results(evaluation_results, metadata)
            
            return {
                'ocr_result': ocr_result,
                'evaluations': evaluation_results,
                'report': report,
                'total_score': sum(r.score for r in evaluation_results),
                'max_total_score': sum(r.max_score for r in evaluation_results),
                'overall_grade': self._calculate_overall_grade(evaluation_results)
            }
            
        except Exception as e:
            logger.error(f"Answer sheet processing failed: {e}")
            sentry_sdk.capture_exception(e)
            raise
    
    async def _parse_answer_sheet(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse OCR text into questions and answers"""
        # This would be more sophisticated in practice
        # For now, return a simple structure
        return [
            {
                'question': 'Sample question from OCR',
                'answer': text[:200],  # First 200 chars as answer
                'model_answer': 'Sample model answer',
                'max_marks': 10,
                'rubric': {}
            }
        ]
    
    async def _generate_report(self, results: List[EvaluationResult], metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive evaluation report"""
        total_score = sum(r.score for r in results)
        max_total = sum(r.max_score for r in results)
        percentage = (total_score / max_total) * 100 if max_total > 0 else 0
        
        return {
            'student_id': metadata['student_id'],
            'subject': metadata['subject'],
            'total_score': total_score,
            'max_score': max_total,
            'percentage': percentage,
            'overall_grade': self._calculate_overall_grade(results),
            'question_count': len(results),
            'average_confidence': sum(r.confidence for r in results) / len(results),
            'processing_time': sum(r.processing_time for r in results),
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def _calculate_overall_grade(self, results: List[EvaluationResult]) -> str:
        """Calculate overall grade from all results"""
        if not results:
            return 'F'
        
        total_score = sum(r.score for r in results)
        max_total = sum(r.max_score for r in results)
        
        return self.ai_evaluator._calculate_grade(total_score, max_total)
    
    async def _store_results(self, results: List[EvaluationResult], metadata: Dict[str, Any]):
        """Store evaluation results in database"""
        session = self.SessionLocal()
        try:
            for result in results:
                evaluation = Evaluation(
                    student_id=metadata['student_id'],
                    question_text="",  # Would be filled from parsed content
                    answer_text="",    # Would be filled from parsed content
                    model_answer="",   # Would be filled from parsed content
                    subject=metadata['subject'],
                    score=result.score,
                    max_score=result.max_score,
                    grade=result.grade,
                    feedback=result.detailed_feedback,
                    confidence=result.confidence,
                    processing_time=result.processing_time
                )
                session.add(evaluation)
            
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to store results: {e}")
            raise
        finally:
            session.close()
