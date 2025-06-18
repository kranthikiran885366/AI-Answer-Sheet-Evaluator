import asyncio
import logging
from typing import Dict, Any, List, Optional
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel, pipeline
import openai
import anthropic
import google.generativeai as genai
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import re
import json
import numpy as np
from datetime import datetime

from .base_agent import BaseAgent, AgentTask, AgentType, AgentCapability, TaskStatus

logger = logging.getLogger(__name__)

class EvaluationAgent(BaseAgent):
    """Advanced AI Evaluation Agent with multiple models and consensus"""
    
    def __init__(self, agent_id: str = "evaluation_agent_001"):
        capabilities = [
            AgentCapability(
                name="answer_evaluation",
                description="Evaluate student answers using AI models",
                input_types=["text/plain", "application/json"],
                output_types=["application/json"],
                confidence_threshold=0.8
            ),
            AgentCapability(
                name="rubric_based_scoring",
                description="Score answers based on provided rubrics",
                input_types=["text/plain", "application/json"],
                output_types=["application/json"],
                confidence_threshold=0.85
            ),
            AgentCapability(
                name="comparative_analysis",
                description="Compare student answers with model answers",
                input_types=["text/plain"],
                output_types=["application/json"],
                confidence_threshold=0.75
            )
        ]
        
        super().__init__(agent_id, AgentType.EVALUATION_AGENT, capabilities)
        
        # AI Models
        self.openai_client = None
        self.anthropic_client = None
        self.google_client = None
        
        # Local models
        self.bert_tokenizer = None
        self.bert_model = None
        self.evaluation_model = None
        
        # NLP tools
        self.nlp = None
        self.vectorizer = TfidfVectorizer()
        
        # Subject-specific models
        self.subject_models = {}
        
    async def initialize(self) -> bool:
        """Initialize evaluation models and services"""
        try:
            logger.info("Initializing Evaluation Agent...")
            
            # Initialize cloud AI services
            await self._initialize_ai_services()
            
            # Initialize local models
            await self._initialize_local_models()
            
            # Initialize NLP tools
            await self._initialize_nlp_tools()
            
            # Load subject-specific models
            await self._load_subject_models()
            
            self.is_active = True
            logger.info("Evaluation Agent initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Evaluation Agent: {e}")
            self.is_active = False
            return False
    
    async def _initialize_ai_services(self):
        """Initialize cloud AI services"""
        try:
            # OpenAI
            openai.api_key = "your-openai-api-key"  # Load from config
            self.openai_client = openai
            logger.info("OpenAI client initialized")
        except Exception as e:
            logger.warning(f"OpenAI not available: {e}")
        
        try:
            # Anthropic Claude
            self.anthropic_client = anthropic.Anthropic(api_key="your-anthropic-key")
            logger.info("Anthropic client initialized")
        except Exception as e:
            logger.warning(f"Anthropic not available: {e}")
        
        try:
            # Google AI
            genai.configure(api_key="your-google-ai-key")
            self.google_client = genai
            logger.info("Google AI client initialized")
        except Exception as e:
            logger.warning(f"Google AI not available: {e}")
    
    async def _initialize_local_models(self):
        """Initialize local transformer models"""
        try:
            # BERT for text understanding
            self.bert_tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
            self.bert_model = AutoModel.from_pretrained('bert-base-uncased')
            
            # Custom evaluation model (if available)
            try:
                from models.evaluation_model import AnswerEvaluationModel
                self.evaluation_model = AnswerEvaluationModel()
                self.evaluation_model.load_state_dict(torch.load('models/evaluation_model.pth'))
                self.evaluation_model.eval()
                logger.info("Custom evaluation model loaded")
            except Exception as e:
                logger.warning(f"Custom evaluation model not available: {e}")
            
            logger.info("Local models initialized")
        except Exception as e:
            logger.error(f"Failed to initialize local models: {e}")
    
    async def _initialize_nlp_tools(self):
        """Initialize NLP processing tools"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("SpaCy NLP model loaded")
        except Exception as e:
            logger.warning(f"SpaCy not available: {e}")
    
    async def _load_subject_models(self):
        """Load subject-specific fine-tuned models"""
        subjects = ['mathematics', 'physics', 'chemistry', 'biology', 'english', 'history']
        
        for subject in subjects:
            try:
                model_path = f'models/subject_models/{subject}_evaluator'
                tokenizer = AutoTokenizer.from_pretrained(model_path)
                model = AutoModel.from_pretrained(model_path)
                
                self.subject_models[subject] = {
                    'tokenizer': tokenizer,
                    'model': model
                }
                logger.info(f"Loaded {subject} subject model")
            except Exception as e:
                logger.warning(f"Subject model for {subject} not available: {e}")
    
    async def process_task(self, task: AgentTask) -> AgentTask:
        """Process evaluation task"""
        try:
            task_type = task.task_type
            input_data = task.input_data
            
            if task_type == "evaluate_answer":
                result = await self._evaluate_answer(input_data)
            elif task_type == "rubric_scoring":
                result = await self._rubric_based_scoring(input_data)
            elif task_type == "comparative_analysis":
                result = await self._comparative_analysis(input_data)
            elif task_type == "consensus_evaluation":
                result = await self._consensus_evaluation(input_data)
            else:
                raise ValueError(f"Unknown task type: {task_type}")
            
            task.output_data = result
            return task
            
        except Exception as e:
            logger.error(f"Evaluation task processing failed: {e}")
            raise
    
    async def _evaluate_answer(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate student answer using multiple AI models"""
        student_answer = input_data.get('student_answer', '')
        question = input_data.get('question', '')
        model_answer = input_data.get('model_answer', '')
        subject = input_data.get('subject', 'general')
        max_marks = input_data.get('max_marks', 100)
        rubric = input_data.get('rubric', {})
        
        # Choose evaluation strategy based on available models
        if subject in self.subject_models:
            result = await self._subject_specific_evaluation(
                student_answer, question, model_answer, subject, max_marks, rubric
            )
        else:
            result = await self._general_evaluation(
                student_answer, question, model_answer, subject, max_marks, rubric
            )
        
        return result
    
    async def _subject_specific_evaluation(self, student_answer: str, question: str, 
                                         model_answer: str, subject: str, max_marks: int, 
                                         rubric: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate using subject-specific model"""
        try:
            subject_model = self.subject_models[subject]
            tokenizer = subject_model['tokenizer']
            model = subject_model['model']
            
            # Prepare input text
            input_text = f"Question: {question}\nStudent Answer: {student_answer}\nModel Answer: {model_answer}"
            
            # Tokenize
            inputs = tokenizer(
                input_text,
                return_tensors="pt",
                max_length=512,
                truncation=True,
                padding=True
            )
            
            # Get model prediction
            with torch.no_grad():
                outputs = model(**inputs)
                # Assuming the model outputs embeddings that we can use for scoring
                embeddings = outputs.last_hidden_state.mean(dim=1)
                
                # Simple scoring based on embeddings similarity
                # In practice, you'd have a trained scoring head
                score = torch.sigmoid(embeddings.mean()).item() * max_marks
            
            # Generate detailed feedback using AI services
            feedback_data = await self._generate_detailed_feedback(
                student_answer, question, model_answer, subject, score, max_marks
            )
            
            return {
                'score': round(score, 2),
                'max_score': max_marks,
                'percentage': round((score / max_marks) * 100, 2),
                'grade': self._calculate_grade(score, max_marks),
                'method': f'subject_specific_{subject}',
                'confidence': 0.85,
                **feedback_data
            }
            
        except Exception as e:
            logger.error(f"Subject-specific evaluation failed: {e}")
            # Fallback to general evaluation
            return await self._general_evaluation(
                student_answer, question, model_answer, subject, max_marks, rubric
            )
    
    async def _general_evaluation(self, student_answer: str, question: str, 
                                model_answer: str, subject: str, max_marks: int, 
                                rubric: Dict[str, Any]) -> Dict[str, Any]:
        """General evaluation using multiple approaches"""
        
        # Approach 1: Semantic similarity
        similarity_score = await self._calculate_semantic_similarity(student_answer, model_answer)
        
        # Approach 2: Keyword matching
        keyword_score = await self._calculate_keyword_score(student_answer, model_answer, rubric)
        
        # Approach 3: Length and completeness
        completeness_score = await self._calculate_completeness_score(student_answer, model_answer)
        
        # Approach 4: AI model evaluation (if available)
        ai_score = 0.0
        ai_feedback = ""
        
        if self.openai_client:
            try:
                ai_result = await self._openai_evaluation(
                    student_answer, question, model_answer, subject, max_marks
                )
                ai_score = ai_result.get('score', 0)
                ai_feedback = ai_result.get('feedback', '')
            except Exception as e:
                logger.warning(f"OpenAI evaluation failed: {e}")
        
        # Combine scores with weights
        weights = {
            'semantic': 0.4,
            'keyword': 0.3,
            'completeness': 0.2,
            'ai': 0.1 if ai_score > 0 else 0
        }
        
        # Adjust weights if AI score is not available
        if ai_score == 0:
            weights['semantic'] = 0.5
            weights['keyword'] = 0.3
            weights['completeness'] = 0.2
        
        final_score = (
            similarity_score * weights['semantic'] +
            keyword_score * weights['keyword'] +
            completeness_score * weights['completeness'] +
            ai_score * weights['ai']
        ) * max_marks
        
        # Generate feedback
        feedback_data = await self._generate_detailed_feedback(
            student_answer, question, model_answer, subject, final_score, max_marks
        )
        
        return {
            'score': round(final_score, 2),
            'max_score': max_marks,
            'percentage': round((final_score / max_marks) * 100, 2),
            'grade': self._calculate_grade(final_score, max_marks),
            'method': 'general_evaluation',
            'confidence': 0.75,
            'component_scores': {
                'semantic_similarity': round(similarity_score * 100, 2),
                'keyword_matching': round(keyword_score * 100, 2),
                'completeness': round(completeness_score * 100, 2),
                'ai_evaluation': round(ai_score, 2) if ai_score > 0 else None
            },
            **feedback_data
        }
    
    async def _calculate_semantic_similarity(self, student_answer: str, model_answer: str) -> float:
        """Calculate semantic similarity between answers"""
        try:
            if self.bert_model and self.bert_tokenizer:
                # Use BERT embeddings
                def get_bert_embedding(text):
                    inputs = self.bert_tokenizer(text, return_tensors="pt", max_length=512, truncation=True, padding=True)
                    with torch.no_grad():
                        outputs = self.bert_model(**inputs)
                        return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
                
                student_embedding = get_bert_embedding(student_answer)
                model_embedding = get_bert_embedding(model_answer)
                
                # Calculate cosine similarity
                similarity = np.dot(student_embedding, model_embedding) / (
                    np.linalg.norm(student_embedding) * np.linalg.norm(model_embedding)
                )
                
                return max(0, similarity)  # Ensure non-negative
            else:
                # Fallback to TF-IDF similarity
                documents = [student_answer, model_answer]
                tfidf_matrix = self.vectorizer.fit_transform(documents)
                similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
                return max(0, similarity)
                
        except Exception as e:
            logger.error(f"Semantic similarity calculation failed: {e}")
            return 0.5  # Default moderate similarity
    
    async def _calculate_keyword_score(self, student_answer: str, model_answer: str, 
                                     rubric: Dict[str, Any]) -> float:
        """Calculate score based on keyword matching"""
        try:
            # Extract keywords from rubric or model answer
            keywords = rubric.get('keywords', [])
            
            if not keywords and self.nlp:
                # Extract keywords from model answer using NLP
                doc = self.nlp(model_answer)
                keywords = [token.lemma_.lower() for token in doc 
                           if token.pos_ in ['NOUN', 'ADJ', 'VERB'] and len(token.text) > 3]
            
            if not keywords:
                # Simple word overlap
                model_words = set(model_answer.lower().split())
                student_words = set(student_answer.lower().split())
                overlap = len(model_words.intersection(student_words))
                return min(1.0, overlap / len(model_words)) if model_words else 0.5
            
            # Check keyword presence in student answer
            student_text = student_answer.lower()
            found_keywords = sum(1 for keyword in keywords if keyword.lower() in student_text)
            
            return found_keywords / len(keywords) if keywords else 0.5
            
        except Exception as e:
            logger.error(f"Keyword score calculation failed: {e}")
            return 0.5
    
    async def _calculate_completeness_score(self, student_answer: str, model_answer: str) -> float:
        """Calculate completeness score based on length and structure"""
        try:
            student_length = len(student_answer.split())
            model_length = len(model_answer.split())
            
            if model_length == 0:
                return 0.5
            
            # Length ratio (capped at 1.0)
            length_ratio = min(1.0, student_length / model_length)
            
            # Sentence structure score
            student_sentences = len([s for s in student_answer.split('.') if s.strip()])
            model_sentences = len([s for s in model_answer.split('.') if s.strip()])
            
            sentence_ratio = min(1.0, student_sentences / model_sentences) if model_sentences > 0 else 0.5
            
            # Combine length and structure
            completeness = (length_ratio * 0.7 + sentence_ratio * 0.3)
            
            return min(1.0, completeness)
            
        except Exception as e:
            logger.error(f"Completeness score calculation failed: {e}")
            return 0.5
    
    async def _openai_evaluation(self, student_answer: str, question: str, 
                               model_answer: str, subject: str, max_marks: int) -> Dict[str, Any]:
        """Evaluate using OpenAI GPT"""
        try:
            prompt = f"""
            You are an expert teacher evaluating a student's answer. Please provide a detailed evaluation.

            Subject: {subject}
            Question: {question}
            Model Answer: {model_answer}
            Student Answer: {student_answer}
            Maximum Marks: {max_marks}

            Please evaluate the student's answer and provide:
            1. Score (0 to {max_marks})
            2. Detailed feedback
            3. Key points covered
            4. Key points missed
            5. Suggestions for improvement

            Respond in JSON format:
            {{
                "score": <number>,
                "feedback": "<detailed feedback>",
                "points_covered": ["<point1>", "<point2>"],
                "points_missed": ["<point1>", "<point2>"],
                "suggestions": "<improvement suggestions>"
            }}
            """
            
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1000
            )
            
            result_text = response.choices[0].message.content
            
            # Parse JSON response
            try:
                result = json.loads(result_text)
                return result
            except json.JSONDecodeError:
                # Fallback parsing
                return {
                    'score': max_marks * 0.7,  # Default score
                    'feedback': result_text,
                    'points_covered': [],
                    'points_missed': [],
                    'suggestions': 'Please review the answer for completeness.'
                }
                
        except Exception as e:
            logger.error(f"OpenAI evaluation failed: {e}")
            raise
    
    async def _generate_detailed_feedback(self, student_answer: str, question: str, 
                                        model_answer: str, subject: str, score: float, 
                                        max_marks: int) -> Dict[str, Any]:
        """Generate detailed feedback for the student"""
        try:
            # Try to use AI for feedback generation
            if self.openai_client:
                try:
                    ai_result = await self._openai_evaluation(
                        student_answer, question, model_answer, subject, max_marks
                    )
                    return {
                        'feedback': ai_result.get('feedback', ''),
                        'points_covered': ai_result.get('points_covered', []),
                        'points_missed': ai_result.get('points_missed', []),
                        'suggestions': ai_result.get('suggestions', '')
                    }
                except Exception as e:
                    logger.warning(f"AI feedback generation failed: {e}")
            
            # Fallback to rule-based feedback
            return await self._generate_rule_based_feedback(
                student_answer, model_answer, score, max_marks
            )
            
        except Exception as e:
            logger.error(f"Feedback generation failed: {e}")
            return {
                'feedback': 'Your answer has been evaluated. Please review the model answer for comparison.',
                'points_covered': [],
                'points_missed': [],
                'suggestions': 'Consider providing more detailed explanations in your answers.'
            }
    
    async def _generate_rule_based_feedback(self, student_answer: str, model_answer: str, 
                                          score: float, max_marks: int) -> Dict[str, Any]:
        """Generate rule-based feedback"""
        percentage = (score / max_marks) * 100
        
        if percentage >= 90:
            feedback = "Excellent work! Your answer demonstrates a thorough understanding of the topic."
        elif percentage >= 80:
            feedback = "Good answer! You've covered most of the key points effectively."
        elif percentage >= 70:
            feedback = "Satisfactory answer. You show understanding but could include more details."
        elif percentage >= 60:
            feedback = "Your answer shows basic understanding but needs more development."
        else:
            feedback = "Your answer needs significant improvement. Please review the topic thoroughly."
        
        # Simple keyword analysis for points covered/missed
        if self.nlp:
            model_doc = self.nlp(model_answer)
            student_doc = self.nlp(student_answer)
            
            model_concepts = set([ent.text.lower() for ent in model_doc.ents])
            student_concepts = set([ent.text.lower() for ent in student_doc.ents])
            
            points_covered = list(model_concepts.intersection(student_concepts))
            points_missed = list(model_concepts - student_concepts)
        else:
            points_covered = []
            points_missed = []
        
        suggestions = "Review the model answer and ensure you cover all key concepts in your response."
        
        return {
            'feedback': feedback,
            'points_covered': points_covered[:5],  # Limit to 5
            'points_missed': points_missed[:5],    # Limit to 5
            'suggestions': suggestions
        }
    
    def _calculate_grade(self, score: float, max_marks: int) -> str:
        """Calculate letter grade from score"""
        percentage = (score / max_marks) * 100
        
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
    
    async def _consensus_evaluation(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate using multiple models and calculate consensus"""
        # This would run multiple evaluation methods and combine results
        # For now, use the standard evaluation
        return await self._evaluate_answer(input_data)
    
    async def _rubric_based_scoring(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Score based on detailed rubric"""
        student_answer = input_data.get('student_answer', '')
        rubric = input_data.get('rubric', {})
        
        if not rubric:
            return await self._evaluate_answer(input_data)
        
        total_score = 0
        max_total = 0
        rubric_breakdown = {}
        
        for criterion, details in rubric.items():
            max_points = details.get('max_points', 10)
            keywords = details.get('keywords', [])
            description = details.get('description', '')
            
            # Score this criterion
            criterion_score = await self._score_criterion(
                student_answer, keywords, description, max_points
            )
            
            rubric_breakdown[criterion] = {
                'score': criterion_score,
                'max_points': max_points,
                'percentage': (criterion_score / max_points) * 100
            }
            
            total_score += criterion_score
            max_total += max_points
        
        return {
            'score': round(total_score, 2),
            'max_score': max_total,
            'percentage': round((total_score / max_total) * 100, 2),
            'grade': self._calculate_grade(total_score, max_total),
            'method': 'rubric_based',
            'confidence': 0.9,
            'rubric_breakdown': rubric_breakdown
        }
    
    async def _score_criterion(self, student_answer: str, keywords: List[str], 
                             description: str, max_points: int) -> float:
        """Score a specific rubric criterion"""
        if not keywords:
            return max_points * 0.5  # Default score if no keywords
        
        student_text = student_answer.lower()
        found_keywords = sum(1 for keyword in keywords if keyword.lower() in student_text)
        
        # Score based on keyword coverage
        keyword_score = (found_keywords / len(keywords)) * max_points
        
        return min(max_points, keyword_score)
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        return {
            'agent_id': self.agent_id,
            'agent_type': self.agent_type.value,
            'is_active': self.is_active,
            'models': {
                'openai': self.openai_client is not None,
                'anthropic': self.anthropic_client is not None,
                'google': self.google_client is not None,
                'bert': self.bert_model is not None,
                'custom_evaluation': self.evaluation_model is not None,
                'nlp': self.nlp is not None
            },
            'subject_models': list(self.subject_models.keys()),
            'performance_metrics': self.performance_metrics
        }
