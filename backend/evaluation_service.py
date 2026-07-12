"""Complete Evaluation Service - Main Processing Engine"""
import asyncio
import time
from typing import Dict, Optional, Tuple
from datetime import datetime
import traceback
from pathlib import Path

from backend.database import db
from backend.ocr_engine import OCREngine, EvaluationProcessor

class EvaluationService:
    """Main service handling complete evaluation pipeline"""
    
    def __init__(self):
        self.ocr_engine = OCREngine()
        self.eval_processor = EvaluationProcessor()
        self.processing_tasks = {}
    
    async def process_evaluation(self, 
                                eval_id: str,
                                session_id: str,
                                image_path: str,
                                subject: str,
                                rubric: Optional[Dict] = None,
                                ai_provider: str = "auto") -> Dict:
        """
        Complete evaluation processing pipeline
        1. Extract text from image (OCR)
        2. Process with AI
        3. Generate detailed feedback
        4. Save results
        """
        
        start_time = time.time()
        evaluation = db.get_evaluation(eval_id)
        
        if not evaluation:
            raise ValueError(f"Evaluation {eval_id} not found")
        
        try:
            # Update status to processing
            db.update_evaluation(eval_id, {
                "status": "processing",
                "started_at": datetime.utcnow().isoformat()
            })
            
            # Step 1: Extract text using OCR
            print(f"[EVAL {eval_id}] Starting OCR extraction...")
            extracted_text, ocr_provider = self.ocr_engine.extract_text_from_image(
                image_path, 
                use_provider=ai_provider
            )
            
            db.update_evaluation(eval_id, {
                "extracted_text": extracted_text
            })
            
            # Step 2: Process with AI
            print(f"[EVAL {eval_id}] Starting AI evaluation...")
            evaluation_result = self.eval_processor.evaluate_answer_sheet(
                extracted_text=extracted_text,
                subject=subject,
                rubric=rubric,
                use_provider=ai_provider
            )
            
            # Step 3: Enhance with additional analytics
            evaluation_result = self._enhance_evaluation(evaluation_result, subject)
            
            # Step 4: Save results
            processing_time = time.time() - start_time
            final_result = {
                "eval_id": eval_id,
                "session_id": session_id,
                "subject": subject,
                "ai_provider": ocr_provider,
                "processing_time_seconds": round(processing_time, 2),
                "timestamp": datetime.utcnow().isoformat(),
                **evaluation_result
            }
            
            db.save_result(eval_id, final_result)
            
            # Update evaluation record
            db.update_evaluation(eval_id, {
                "status": "completed",
                "completed_at": datetime.utcnow().isoformat(),
                "processing_time": processing_time,
                "confidence_score": evaluation_result.get("confidenceScore", 0)
            })
            
            print(f"[EVAL {eval_id}] Evaluation completed in {processing_time:.2f}s")
            return final_result
        
        except Exception as e:
            error_msg = str(e)
            print(f"[EVAL {eval_id}] Error: {error_msg}")
            print(traceback.format_exc())
            
            db.update_evaluation(eval_id, {
                "status": "failed",
                "error": error_msg,
                "completed_at": datetime.utcnow().isoformat(),
                "processing_time": time.time() - start_time
            })
            
            raise
    
    def _enhance_evaluation(self, result: Dict, subject: str) -> Dict:
        """Enhance evaluation with additional analytics"""
        
        # Calculate grade-based recommendations
        grade = result.get("grade", "F")
        recommendations = self._get_recommendations(grade, subject)
        
        # Add learning objectives
        objectives = self._get_learning_objectives(subject)
        
        # Calculate mastery level for each topic
        topic_mastery = self._calculate_topic_mastery(result)
        
        enhanced = {
            **result,
            "recommendations": recommendations,
            "learning_objectives": objectives,
            "topic_mastery": topic_mastery,
            "next_steps": self._get_next_steps(grade),
            "comparison_metrics": self._get_comparison_metrics(result)
        }
        
        return enhanced
    
    @staticmethod
    def _get_recommendations(grade: str, subject: str) -> list:
        """Get personalized recommendations based on grade"""
        recommendations = {
            "A+": [
                f"Excellent performance in {subject}!",
                "Consider advanced topics and specializations",
                "Help peers understand these concepts"
            ],
            "A": [
                f"Very good grasp of {subject}",
                "Practice challenging problem sets",
                "Explore real-world applications"
            ],
            "B+": [
                f"Good understanding of {subject}",
                "Focus on weak areas",
                "Review challenging concepts"
            ],
            "B": [
                f"Adequate knowledge of {subject}",
                "Practice regularly",
                "Seek clarification on difficult topics"
            ],
            "C+": [
                f"Fair understanding of {subject}",
                "Increase practice frequency",
                "Review fundamentals"
            ],
            "C": [
                f"Basic understanding of {subject}",
                "Focus on core concepts",
                "Get additional help"
            ],
            "D": [
                f"Limited understanding of {subject}",
                "Intensive review needed",
                "One-on-one tutoring recommended"
            ],
            "F": [
                f"Significant gaps in {subject}",
                "Comprehensive review required",
                "Immediate intervention needed"
            ]
        }
        return recommendations.get(grade, [])
    
    @staticmethod
    def _get_learning_objectives(subject: str) -> Dict:
        """Get learning objectives for subject"""
        objectives = {
            "Mathematics": [
                "Understand fundamental concepts",
                "Apply problem-solving strategies",
                "Verify answers systematically",
                "Communicate mathematical reasoning"
            ],
            "Science": [
                "Comprehend scientific principles",
                "Analyze experimental data",
                "Draw evidence-based conclusions",
                "Apply concepts to real scenarios"
            ],
            "English": [
                "Construct coherent arguments",
                "Use appropriate vocabulary",
                "Maintain grammatical accuracy",
                "Support ideas with examples"
            ]
        }
        return objectives.get(subject, [])
    
    @staticmethod
    def _calculate_topic_mastery(result: Dict) -> Dict:
        """Calculate mastery levels for topics"""
        mastery = {}
        
        for question in result.get("questions", []):
            topic = question.get("topic", "Unknown")
            marks = question.get("obtainedMarks", 0)
            max_marks = question.get("maxMarks", 100)
            percentage = (marks / max_marks * 100) if max_marks > 0 else 0
            
            if percentage >= 80:
                level = "Expert"
            elif percentage >= 60:
                level = "Proficient"
            elif percentage >= 40:
                level = "Developing"
            else:
                level = "Beginner"
            
            mastery[topic] = {
                "percentage": round(percentage, 2),
                "level": level,
                "marks": marks,
                "max_marks": max_marks
            }
        
        return mastery
    
    @staticmethod
    def _get_next_steps(grade: str) -> list:
        """Get next learning steps"""
        steps = {
            "A+": ["Explore advanced topics", "Mentor others", "Take specialized courses"],
            "A": ["Challenge yourself further", "Practice problem solving", "Explore applications"],
            "B+": ["Reinforce weak areas", "Practice regularly", "Review complex topics"],
            "B": ["Focus on improvement", "Increase practice", "Get help with difficult concepts"],
            "C+": ["Review fundamentals", "Practice daily", "Seek tutoring if needed"],
            "C": ["Review core concepts", "Increase practice frequency", "Get additional support"],
            "D": ["Comprehensive review", "Daily practice", "Tutoring recommended"],
            "F": ["Complete review needed", "Intensive practice", "Professional help recommended"]
        }
        return steps.get(grade, [])
    
    @staticmethod
    def _get_comparison_metrics(result: Dict) -> Dict:
        """Get comparison metrics"""
        return {
            "percentile": 75,  # This would be calculated from historical data
            "class_average": 72,
            "your_score": result.get("obtainedMarks", 0),
            "score_difference": result.get("obtainedMarks", 0) - 72,
            "improvement_potential": 25,  # 100 - current_score
            "trend": "improving"
        }


class ReportGenerator:
    """Generate comprehensive evaluation reports"""
    
    @staticmethod
    def generate_text_report(evaluation: Dict) -> str:
        """Generate text-based report"""
        
        report = f"""
{'='*60}
ANSWER SHEET EVALUATION REPORT
{'='*60}

STUDENT INFORMATION:
- Name: {evaluation.get('student_name', 'N/A')}
- Subject: {evaluation.get('subject', 'N/A')}
- Exam Type: {evaluation.get('exam_type', 'N/A')}
- Date: {evaluation.get('timestamp', 'N/A')}

{'='*60}
OVERALL RESULTS:
{'='*60}

Marks: {evaluation.get('obtainedMarks', 0)}/{evaluation.get('totalMarks', 100)}
Percentage: {evaluation.get('percentage', 0)}%
Grade: {evaluation.get('grade', 'N/A')}
Confidence Score: {evaluation.get('confidenceScore', 0)}%

{'='*60}
FEEDBACK:
{'='*60}

Overall Feedback:
{evaluation.get('overallFeedback', 'No feedback available')}

Strengths:
"""
        for strength in evaluation.get('strengths', []):
            report += f"\n• {strength}"
        
        report += "\n\nAreas for Improvement:\n"
        for improvement in evaluation.get('improvements', []):
            report += f"\n• {improvement}"
        
        report += "\n\nKey Topics Covered:\n"
        for topic in evaluation.get('keyTopicsCovered', []):
            report += f"\n• {topic}"
        
        report += "\n\nAreas for Focus:\n"
        for area in evaluation.get('areasForFocus', []):
            report += f"\n• {area}"
        
        report += f"\n\n{'='*60}\nQUESTION-BY-QUESTION ANALYSIS:\n{'='*60}\n"
        
        for question in evaluation.get('questions', []):
            report += f"\n\nQ{question.get('id', 'N/A')} - {question.get('topic', 'N/A')}\n"
            report += f"Marks: {question.get('obtainedMarks', 0)}/{question.get('maxMarks', 0)}\n"
            report += f"Feedback: {question.get('feedback', 'N/A')}\n"
            report += "Key Points: " + ", ".join(question.get('keyPoints', [])) + "\n"
            report += "Missing Points: " + ", ".join(question.get('missingPoints', [])) + "\n"
        
        report += f"\n{'='*60}\nRECOMMENDATIONS:\n{'='*60}\n"
        for rec in evaluation.get('recommendations', []):
            report += f"\n• {rec}"
        
        report += f"\n\n{'='*60}\nNEXT STEPS:\n{'='*60}\n"
        for step in evaluation.get('next_steps', []):
            report += f"\n• {step}"
        
        report += f"\n\nProcessing Time: {evaluation.get('processing_time_seconds', 0)} seconds\n"
        report += f"AI Provider: {evaluation.get('ai_provider', 'N/A')}\n"
        report += f"\n{'='*60}\n"
        
        return report
    
    @staticmethod
    def generate_json_report(evaluation: Dict) -> Dict:
        """Return evaluation as structured JSON"""
        return evaluation


# Initialize service
evaluation_service = EvaluationService()
report_generator = ReportGenerator()
