import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import uuid

from .base_agent import BaseAgent, AgentTask, TaskStatus
from .ocr_agent import OCRAgent
from .evaluation_agent import EvaluationAgent
from .feedback_agent import FeedbackAgent
from .plagiarism_agent import PlagiarismAgent
from .quality_assurance_agent import QualityAssuranceAgent
from .bias_detection_agent import BiasDetectionAgent
from .continuous_learning_agent import ContinuousLearningAgent
from .handwriting_agent import HandwritingAgent
from .formula_recognition_agent import FormulaRecognitionAgent
from .language_detection_agent import LanguageDetectionAgent
from .subject_classification_agent import SubjectClassificationAgent
from .answer_validation_agent import AnswerValidationAgent
from .grading_consistency_agent import GradingConsistencyAgent
from .performance_monitoring_agent import PerformanceMonitoringAgent
from .security_agent import SecurityAgent
from .data_privacy_agent import DataPrivacyAgent
from .model_optimization_agent import ModelOptimizationAgent

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """Orchestrates all AI agents for comprehensive answer sheet evaluation"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.task_queue = asyncio.Queue()
        self.result_cache = {}
        self.is_running = False
        self.processing_stats = {
            'total_tasks': 0,
            'completed_tasks': 0,
            'failed_tasks': 0,
            'average_processing_time': 0.0
        }
        
    async def initialize(self):
        """Initialize all agents"""
        try:
            logger.info("Initializing Agent Orchestrator...")
            
            # Core processing agents
            ocr_agent = OCRAgent("ocr_agent_001")
            await ocr_agent.initialize()
            self.agents["ocr"] = ocr_agent
            
            evaluation_agent = EvaluationAgent("evaluation_agent_001")
            await evaluation_agent.initialize()
            self.agents["evaluation"] = evaluation_agent
            
            feedback_agent = FeedbackAgent("feedback_agent_001")
            await feedback_agent.initialize()
            self.agents["feedback"] = feedback_agent
            
            # Quality and validation agents
            plagiarism_agent = PlagiarismAgent("plagiarism_agent_001")
            await plagiarism_agent.initialize()
            self.agents["plagiarism"] = plagiarism_agent
            
            qa_agent = QualityAssuranceAgent("qa_agent_001")
            await qa_agent.initialize()
            self.agents["quality_assurance"] = qa_agent
            
            bias_agent = BiasDetectionAgent("bias_agent_001")
            await bias_agent.initialize()
            self.agents["bias_detection"] = bias_agent
            
            # Specialized recognition agents
            handwriting_agent = HandwritingAgent("handwriting_agent_001")
            await handwriting_agent.initialize()
            self.agents["handwriting"] = handwriting_agent
            
            formula_agent = FormulaRecognitionAgent("formula_agent_001")
            await formula_agent.initialize()
            self.agents["formula_recognition"] = formula_agent
            
            # Language and subject agents
            language_agent = LanguageDetectionAgent("language_agent_001")
            await language_agent.initialize()
            self.agents["language_detection"] = language_agent
            
            subject_agent = SubjectClassificationAgent("subject_agent_001")
            await subject_agent.initialize()
            self.agents["subject_classification"] = subject_agent
            
            # Validation and consistency agents
            validation_agent = AnswerValidationAgent("validation_agent_001")
            await validation_agent.initialize()
            self.agents["answer_validation"] = validation_agent
            
            consistency_agent = GradingConsistencyAgent("consistency_agent_001")
            await consistency_agent.initialize()
            self.agents["grading_consistency"] = consistency_agent
            
            # System agents
            performance_agent = PerformanceMonitoringAgent("performance_agent_001")
            await performance_agent.initialize()
            self.agents["performance_monitoring"] = performance_agent
            
            security_agent = SecurityAgent("security_agent_001")
            await security_agent.initialize()
            self.agents["security"] = security_agent
            
            privacy_agent = DataPrivacyAgent("privacy_agent_001")
            await privacy_agent.initialize()
            self.agents["data_privacy"] = privacy_agent
            
            optimization_agent = ModelOptimizationAgent("optimization_agent_001")
            await optimization_agent.initialize()
            self.agents["model_optimization"] = optimization_agent
            
            # Learning and adaptation agent
            learning_agent = ContinuousLearningAgent("learning_agent_001")
            await learning_agent.initialize()
            self.agents["continuous_learning"] = learning_agent
            
            self.is_running = True
            logger.info(f"Agent Orchestrator initialized with {len(self.agents)} agents")
            
        except Exception as e:
            logger.error(f"Failed to initialize Agent Orchestrator: {e}")
            raise
    
    async def shutdown(self):
        """Shutdown all agents"""
        try:
            self.is_running = False
            
            for agent_name, agent in self.agents.items():
                await agent.shutdown()
                logger.info(f"Agent {agent_name} shut down")
            
            logger.info("Agent Orchestrator shut down successfully")
            
        except Exception as e:
            logger.error(f"Error during Agent Orchestrator shutdown: {e}")
    
    async def process_comprehensive_evaluation(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process comprehensive evaluation using all agents"""
        try:
            evaluation_id = str(uuid.uuid4())
            start_time = datetime.utcnow()
            
            logger.info(f"Starting comprehensive evaluation: {evaluation_id}")
            
            # Stage 1: Security and Privacy Check
            security_result = await self._run_security_checks(request_data)
            if not security_result['is_secure']:
                return {
                    'evaluation_id': evaluation_id,
                    'status': 'rejected',
                    'reason': 'Security validation failed',
                    'details': security_result
                }
            
            # Stage 2: Language Detection and Subject Classification
            language_results = []
            subject_results = []
            
            for file_info in request_data["files"]:
                # Quick OCR for language detection
                quick_ocr = await self.agents["ocr"].process_task(AgentTask(
                    task_id=str(uuid.uuid4()),
                    task_type="quick_extract",
                    input_data=file_info
                ))
                
                if quick_ocr.status == TaskStatus.COMPLETED:
                    sample_text = quick_ocr.output_data.get("extracted_text", "")[:500]
                    
                    # Language detection
                    lang_task = await self.agents["language_detection"].process_task(AgentTask(
                        task_id=str(uuid.uuid4()),
                        task_type="detect_language",
                        input_data={"text": sample_text}
                    ))
                    language_results.append(lang_task.output_data)
                    
                    # Subject classification
                    subject_task = await self.agents["subject_classification"].process_task(AgentTask(
                        task_id=str(uuid.uuid4()),
                        task_type="classify_subject",
                        input_data={"text": sample_text, "metadata": request_data["metadata"]}
                    ))
                    subject_results.append(subject_task.output_data)
            
            # Stage 3: Advanced OCR Processing
            ocr_results = []
            for i, file_info in enumerate(request_data["files"]):
                # Determine OCR strategy based on detected language and subject
                ocr_strategy = self._determine_ocr_strategy(
                    language_results[i] if i < len(language_results) else {},
                    subject_results[i] if i < len(subject_results) else {}
                )
                
                ocr_task = AgentTask(
                    task_id=str(uuid.uuid4()),
                    task_type="advanced_extract",
                    input_data={
                        **file_info,
                        "ocr_strategy": ocr_strategy,
                        "language": language_results[i].get("language", "en") if i < len(language_results) else "en",
                        "subject": subject_results[i].get("subject", "general") if i < len(subject_results) else "general"
                    }
                )
                
                ocr_result = await self.agents["ocr"].process_task(ocr_task)
                if ocr_result.status == TaskStatus.COMPLETED:
                    ocr_results.append({
                        "file_info": file_info,
                        "ocr_result": ocr_result.output_data,
                        "language": language_results[i] if i < len(language_results) else {},
                        "subject": subject_results[i] if i < len(subject_results) else {}
                    })
            
            # Stage 4: Handwriting and Formula Recognition
            enhanced_ocr_results = []
            for ocr_data in ocr_results:
                enhanced_result = dict(ocr_data)
                
                # Handwriting recognition for better accuracy
                if ocr_data["ocr_result"].get("contains_handwriting", False):
                    handwriting_task = await self.agents["handwriting"].process_task(AgentTask(
                        task_id=str(uuid.uuid4()),
                        task_type="recognize_handwriting",
                        input_data=ocr_data["file_info"]
                    ))
                    if handwriting_task.status == TaskStatus.COMPLETED:
                        enhanced_result["handwriting_result"] = handwriting_task.output_data
                
                # Formula recognition for STEM subjects
                if ocr_data["subject"].get("subject", "").lower() in ["mathematics", "physics", "chemistry"]:
                    formula_task = await self.agents["formula_recognition"].process_task(AgentTask(
                        task_id=str(uuid.uuid4()),
                        task_type="recognize_formulas",
                        input_data={
                            "text": ocr_data["ocr_result"]["extracted_text"],
                            "image_path": ocr_data["file_info"]["file_path"]
                        }
                    ))
                    if formula_task.status == TaskStatus.COMPLETED:
                        enhanced_result["formula_result"] = formula_task.output_data
                
                enhanced_ocr_results.append(enhanced_result)
            
            # Stage 5: Answer Validation
            validated_results = []
            for enhanced_data in enhanced_ocr_results:
                validation_task = await self.agents["answer_validation"].process_task(AgentTask(
                    task_id=str(uuid.uuid4()),
                    task_type="validate_answer",
                    input_data={
                        "text": enhanced_data["ocr_result"]["extracted_text"],
                        "subject": enhanced_data["subject"].get("subject", "general"),
                        "question": request_data["metadata"].get("question", ""),
                        "expected_format": request_data["metadata"].get("expected_format", "text")
                    }
                ))
                
                if validation_task.status == TaskStatus.COMPLETED:
                    enhanced_data["validation_result"] = validation_task.output_data
                
                validated_results.append(enhanced_data)
            
            # Stage 6: Multi-Model Evaluation
            evaluation_results = []
            for validated_data in validated_results:
                evaluation_input = {
                    "text": validated_data["ocr_result"]["extracted_text"],
                    "metadata": {
                        **request_data["metadata"],
                        "language": validated_data["language"].get("language", "en"),
                        "subject": validated_data["subject"].get("subject", "general"),
                        "validation_score": validated_data.get("validation_result", {}).get("score", 1.0)
                    },
                    "file_info": validated_data["file_info"]
                }
                
                evaluation_task = await self.agents["evaluation"].process_task(AgentTask(
                    task_id=str(uuid.uuid4()),
                    task_type="comprehensive_evaluate",
                    input_data=evaluation_input
                ))
                
                if evaluation_task.status == TaskStatus.COMPLETED:
                    evaluation_results.append({
                        "file_info": validated_data["file_info"],
                        "evaluation_result": evaluation_task.output_data,
                        "ocr_data": validated_data
                    })
            
            # Stage 7: Quality Assurance and Consistency Check
            qa_results = []
            for eval_data in evaluation_results:
                # Quality assurance
                qa_task = await self.agents["quality_assurance"].process_task(AgentTask(
                    task_id=str(uuid.uuid4()),
                    task_type="quality_check",
                    input_data={
                        "evaluation_result": eval_data["evaluation_result"],
                        "original_data": eval_data["ocr_data"],
                        "metadata": request_data["metadata"]
                    }
                ))
                
                qa_result = qa_task.output_data if qa_task.status == TaskStatus.COMPLETED else {}
                
                # Grading consistency check
                consistency_task = await self.agents["grading_consistency"].process_task(AgentTask(
                    task_id=str(uuid.uuid4()),
                    task_type="check_consistency",
                    input_data={
                        "evaluation_result": eval_data["evaluation_result"],
                        "subject": eval_data["ocr_data"]["subject"].get("subject", "general"),
                        "historical_data": await self._get_historical_grading_data(request_data["user_id"])
                    }
                ))
                
                consistency_result = consistency_task.output_data if consistency_task.status == TaskStatus.COMPLETED else {}
                
                qa_results.append({
                    **eval_data,
                    "qa_result": qa_result,
                    "consistency_result": consistency_result
                })
            
            # Stage 8: Bias Detection
            bias_results = []
            for qa_data in qa_results:
                bias_task = await self.agents["bias_detection"].process_task(AgentTask(
                    task_id=str(uuid.uuid4()),
                    task_type="detect_bias",
                    input_data={
                        "text": qa_data["ocr_data"]["ocr_result"]["extracted_text"],
                        "evaluation_result": qa_data["evaluation_result"],
                        "student_info": request_data.get("student_info", {}),
                        "grader_info": request_data.get("grader_info", {})
                    }
                ))
                
                bias_result = bias_task.output_data if bias_task.status == TaskStatus.COMPLETED else {}
                bias_results.append({
                    **qa_data,
                    "bias_result": bias_result
                })
            
            # Stage 9: Plagiarism Detection
            plagiarism_results = []
            for bias_data in bias_results:
                plagiarism_task = await self.agents["plagiarism"].process_task(AgentTask(
                    task_id=str(uuid.uuid4()),
                    task_type="comprehensive_check",
                    input_data={
                        "text": bias_data["ocr_data"]["ocr_result"]["extracted_text"],
                        "user_id": request_data["user_id"],
                        "subject": bias_data["ocr_data"]["subject"].get("subject", "general"),
                        "assignment_id": request_data["metadata"].get("assignment_id", ""),
                        "check_internet": True,
                        "check_database": True,
                        "check_peer_submissions": True
                    }
                ))
                
                plagiarism_result = plagiarism_task.output_data if plagiarism_task.status == TaskStatus.COMPLETED else {}
                plagiarism_results.append({
                    **bias_data,
                    "plagiarism_result": plagiarism_result
                })
            
            # Stage 10: Advanced Feedback Generation
            feedback_results = []
            for plag_data in plagiarism_results:
                feedback_task = await self.agents["feedback"].process_task(AgentTask(
                    task_id=str(uuid.uuid4()),
                    task_type="generate_comprehensive_feedback",
                    input_data={
                        "evaluation_result": plag_data["evaluation_result"],
                        "qa_result": plag_data["qa_result"],
                        "bias_result": plag_data["bias_result"],
                        "plagiarism_result": plag_data["plagiarism_result"],
                        "student_level": request_data.get("student_info", {}).get("level", "intermediate"),
                        "subject": plag_data["ocr_data"]["subject"].get("subject", "general"),
                        "language": plag_data["ocr_data"]["language"].get("language", "en")
                    }
                ))
                
                feedback_result = feedback_task.output_data if feedback_task.status == TaskStatus.COMPLETED else {}
                feedback_results.append({
                    **plag_data,
                    "feedback_result": feedback_result
                })
            
            # Stage 11: Performance Monitoring
            performance_task = await self.agents["performance_monitoring"].process_task(AgentTask(
                task_id=str(uuid.uuid4()),
                task_type="monitor_evaluation",
                input_data={
                    "evaluation_id": evaluation_id,
                    "processing_stages": [
                        "security_check", "language_detection", "subject_classification",
                        "ocr_processing", "handwriting_recognition", "formula_recognition",
                        "answer_validation", "evaluation", "quality_assurance",
                        "bias_detection", "plagiarism_check", "feedback_generation"
                    ],
                    "results": feedback_results,
                    "start_time": start_time.isoformat()
                }
            ))
            
            performance_result = performance_task.output_data if performance_task.status == TaskStatus.COMPLETED else {}
            
            # Stage 12: Continuous Learning Update
            learning_data = {
                "evaluation_id": evaluation_id,
                "user_id": request_data["user_id"],
                "results": feedback_results,
                "metadata": request_data["metadata"],
                "performance_metrics": performance_result,
                "processing_time": (datetime.utcnow() - start_time).total_seconds()
            }
            
            learning_task = AgentTask(
                task_id=str(uuid.uuid4()),
                task_type="update_learning",
                input_data=learning_data,
                priority=2,
                created_at=datetime.utcnow()
            )
            
            # Process learning update in background
            asyncio.create_task(
                self.agents["continuous_learning"].process_task(learning_task)
            )
            
            # Compile final comprehensive results
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            comprehensive_result = {
                "evaluation_id": evaluation_id,
                "user_id": request_data["user_id"],
                "status": "completed",
                "processing_time": processing_time,
                "completed_at": datetime.utcnow().isoformat(),
                
                # Core results
                "ocr_results": [r["ocr_data"]["ocr_result"] for r in feedback_results],
                "evaluation_results": [r["evaluation_result"] for r in feedback_results],
                "feedback_results": [r["feedback_result"] for r in feedback_results],
                
                # Quality and validation results
                "quality_assurance": [r["qa_result"] for r in feedback_results],
                "consistency_check": [r["consistency_result"] for r in feedback_results],
                "bias_detection": [r["bias_result"] for r in feedback_results],
                "plagiarism_detection": [r["plagiarism_result"] for r in feedback_results],
                
                # Metadata and classification
                "language_detection": language_results,
                "subject_classification": subject_results,
                "security_validation": security_result,
                
                # Performance and monitoring
                "performance_metrics": performance_result,
                
                # Summary statistics
                "summary": self._generate_comprehensive_summary(feedback_results, performance_result),
                
                # Recommendations and next steps
                "recommendations": self._generate_recommendations(feedback_results),
                
                # Confidence and reliability scores
                "confidence_metrics": self._calculate_confidence_metrics(feedback_results)
            }
            
            # Update processing statistics
            self.processing_stats['total_tasks'] += 1
            self.processing_stats['completed_tasks'] += 1
            self.processing_stats['average_processing_time'] = (
                (self.processing_stats['average_processing_time'] * (self.processing_stats['completed_tasks'] - 1) + processing_time) /
                self.processing_stats['completed_tasks']
            )
            
            logger.info(f"Comprehensive evaluation completed: {evaluation_id} in {processing_time:.2f}s")
            
            return comprehensive_result
            
        except Exception as e:
            logger.error(f"Comprehensive evaluation error: {e}")
            self.processing_stats['failed_tasks'] += 1
            raise
    
    def _determine_ocr_strategy(self, language_result: Dict[str, Any], subject_result: Dict[str, Any]) -> str:
        """Determine optimal OCR strategy based on language and subject"""
        try:
            language = language_result.get("language", "en")
            subject = subject_result.get("subject", "general")
            confidence = language_result.get("confidence", 0.5)
            
            # Strategy selection logic
            if subject.lower() in ["mathematics", "physics", "chemistry"]:
                if confidence > 0.8:
                    return "formula_enhanced"
                else:
                    return "multi_engine_stem"
            elif language != "en":
                return "multilingual_optimized"
            elif subject.lower() in ["english", "literature"]:
                return "text_optimized"
            else:
                return "general_purpose"
                
        except Exception as e:
            logger.warning(f"OCR strategy determination failed: {e}")
            return "general_purpose"
    
    async def _get_historical_grading_data(self, user_id: str) -> Dict[str, Any]:
        """Get historical grading data for consistency checking"""
        try:
            # This would fetch historical data from database
            # For now, return mock data
            return {
                "average_score": 75.5,
                "score_variance": 12.3,
                "grading_pattern": "consistent",
                "subject_performance": {
                    "mathematics": 78.2,
                    "science": 72.1,
                    "english": 76.8
                }
            }
        except Exception as e:
            logger.error(f"Failed to get historical grading data: {e}")
            return {}
    
    async def _run_security_checks(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run comprehensive security checks"""
        try:
            security_task = await self.agents["security"].process_task(AgentTask(
                task_id=str(uuid.uuid4()),
                task_type="comprehensive_security_check",
                input_data=request_data
            ))
            
            if security_task.status == TaskStatus.COMPLETED:
                return security_task.output_data
            else:
                return {"is_secure": False, "reason": "Security check failed"}
                
        except Exception as e:
            logger.error(f"Security check failed: {e}")
            return {"is_secure": False, "reason": f"Security check error: {e}"}
    
    def _generate_comprehensive_summary(self, results: List[Dict[str, Any]], 
                                      performance_result: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive evaluation summary"""
        try:
            total_files = len(results)
            
            # Calculate overall scores
            total_score = sum(r["evaluation_result"].get("score", 0) for r in results)
            max_possible_score = sum(r["evaluation_result"].get("max_score", 100) for r in results)
            overall_percentage = (total_score / max_possible_score * 100) if max_possible_score > 0 else 0
            
            # Quality metrics
            avg_confidence = sum(r["evaluation_result"].get("confidence", 0) for r in results) / total_files if total_files > 0 else 0
            avg_qa_score = sum(r["qa_result"].get("quality_score", 0) for r in results) / total_files if total_files > 0 else 0
            
            # Issue detection
            plagiarism_detected = any(r["plagiarism_result"].get("is_plagiarized", False) for r in results)
            bias_detected = any(r["bias_result"].get("is_biased", False) for r in results)
            consistency_issues = any(r["consistency_result"].get("has_issues", False) for r in results)
            
            # Performance metrics
            processing_efficiency = performance_result.get("efficiency_score", 0.8)
            resource_utilization = performance_result.get("resource_utilization", 0.7)
            
            return {
                "total_files_processed": total_files,
                "overall_score": round(total_score, 2),
                "overall_percentage": round(overall_percentage, 2),
                "overall_grade": self._calculate_grade(overall_percentage),
                "average_confidence": round(avg_confidence, 3),
                "average_quality_score": round(avg_qa_score, 3),
                "issues_detected": {
                    "plagiarism": plagiarism_detected,
                    "bias": bias_detected,
                    "consistency": consistency_issues
                },
                "performance_metrics": {
                    "processing_efficiency": processing_efficiency,
                    "resource_utilization": resource_utilization,
                    "overall_performance": (processing_efficiency + resource_utilization) / 2
                },
                "recommendation": self._get_overall_recommendation(overall_percentage, plagiarism_detected, bias_detected)
            }
            
        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            return {"error": "Failed to generate summary"}
    
    def _generate_recommendations(self, results: List[Dict[str, Any]]) -> List[str]:
        """Generate actionable recommendations"""
        try:
            recommendations = []
            
            # Analyze results for patterns
            scores = [r["evaluation_result"].get("score", 0) for r in results]
            avg_score = sum(scores) / len(scores) if scores else 0
            
            # Score-based recommendations
            if avg_score < 60:
                recommendations.append("Consider additional study time and review of fundamental concepts")
                recommendations.append("Seek help from instructors or tutoring services")
            elif avg_score < 80:
                recommendations.append("Focus on improving weak areas identified in the feedback")
                recommendations.append("Practice more problems in challenging topics")
            else:
                recommendations.append("Excellent work! Continue maintaining this level of performance")
                recommendations.append("Consider helping peers or exploring advanced topics")
            
            # Issue-specific recommendations
            if any(r["plagiarism_result"].get("is_plagiarized", False) for r in results):
                recommendations.append("Review academic integrity policies and proper citation methods")
                recommendations.append("Ensure all work is original and properly attributed")
            
            if any(r["bias_result"].get("is_biased", False) for r in results):
                recommendations.append("Review answers for potential bias or inappropriate content")
                recommendations.append("Focus on objective, fact-based responses")
            
            # Quality-based recommendations
            low_confidence_results = [r for r in results if r["evaluation_result"].get("confidence", 1) < 0.7]
            if low_confidence_results:
                recommendations.append("Some answers may need clarification - consider providing more detailed explanations")
            
            return recommendations[:5]  # Limit to top 5 recommendations
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return ["Continue working hard and seek feedback for improvement"]
    
    def _calculate_confidence_metrics(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate comprehensive confidence metrics"""
        try:
            if not results:
                return {"overall_confidence": 0.0}
            
            # Evaluation confidence
            eval_confidences = [r["evaluation_result"].get("confidence", 0) for r in results]
            avg_eval_confidence = sum(eval_confidences) / len(eval_confidences)
            
            # OCR confidence
            ocr_confidences = [r["ocr_data"]["ocr_result"].get("confidence", 0) for r in results]
            avg_ocr_confidence = sum(ocr_confidences) / len(ocr_confidences)
            
            # Quality assurance confidence
            qa_confidences = [r["qa_result"].get("confidence", 0) for r in results]
            avg_qa_confidence = sum(qa_confidences) / len(qa_confidences) if qa_confidences else 0
            
            # Overall confidence (weighted average)
            overall_confidence = (
                avg_eval_confidence * 0.5 +
                avg_ocr_confidence * 0.3 +
                avg_qa_confidence * 0.2
            )
            
            return {
                "overall_confidence": round(overall_confidence, 3),
                "evaluation_confidence": round(avg_eval_confidence, 3),
                "ocr_confidence": round(avg_ocr_confidence, 3),
                "qa_confidence": round(avg_qa_confidence, 3),
                "confidence_level": self._get_confidence_level(overall_confidence)
            }
            
        except Exception as e:
            logger.error(f"Confidence metrics calculation failed: {e}")
            return {"overall_confidence": 0.5, "confidence_level": "medium"}
    
    def _calculate_grade(self, percentage: float) -> str:
        """Calculate letter grade from percentage"""
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
    
    def _get_overall_recommendation(self, percentage: float, plagiarism: bool, bias: bool) -> str:
        """Get overall recommendation based on results"""
        if plagiarism:
            return "URGENT: Address plagiarism concerns before proceeding"
        elif bias:
            return "Review content for potential bias and resubmit"
        elif percentage >= 90:
            return "Excellent work! Continue this level of performance"
        elif percentage >= 80:
            return "Good performance with room for improvement"
        elif percentage >= 70:
            return "Satisfactory work - focus on identified weak areas"
        elif percentage >= 60:
            return "Needs improvement - consider additional study and support"
        else:
            return "Significant improvement needed - seek immediate academic support"
    
    def _get_confidence_level(self, confidence: float) -> str:
        """Get confidence level description"""
        if confidence >= 0.9: return "very_high"
        elif confidence >= 0.8: return "high"
        elif confidence >= 0.7: return "medium"
        elif confidence >= 0.6: return "low"
        else: return "very_low"
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on all agents"""
        health_status = {
            "orchestrator_status": "healthy" if self.is_running else "unhealthy",
            "total_agents": len(self.agents),
            "processing_stats": self.processing_stats,
            "agents": {}
        }
        
        for agent_name, agent in self.agents.items():
            try:
                agent_health = await agent.health_check()
                health_status["agents"][agent_name] = agent_health
            except Exception as e:
                health_status["agents"][agent_name] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
        
        return health_status
