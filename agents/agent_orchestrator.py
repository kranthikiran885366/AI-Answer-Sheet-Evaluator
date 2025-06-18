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

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """Orchestrates all AI agents for comprehensive answer sheet evaluation"""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.task_queue = asyncio.Queue()
        self.result_cache = {}
        self.is_running = False
        
    async def initialize(self):
        """Initialize all agents"""
        try:
            logger.info("Initializing Agent Orchestrator...")
            
            # Initialize OCR Agent
            ocr_agent = OCRAgent("ocr_agent_001")
            await ocr_agent.initialize()
            self.agents["ocr"] = ocr_agent
            
            # Initialize Evaluation Agent
            evaluation_agent = EvaluationAgent("evaluation_agent_001")
            await evaluation_agent.initialize()
            self.agents["evaluation"] = evaluation_agent
            
            # Initialize Feedback Agent
            feedback_agent = FeedbackAgent("feedback_agent_001")
            await feedback_agent.initialize()
            self.agents["feedback"] = feedback_agent
            
            # Initialize Plagiarism Agent
            plagiarism_agent = PlagiarismAgent("plagiarism_agent_001")
            await plagiarism_agent.initialize()
            self.agents["plagiarism"] = plagiarism_agent
            
            # Initialize Quality Assurance Agent
            qa_agent = QualityAssuranceAgent("qa_agent_001")
            await qa_agent.initialize()
            self.agents["quality_assurance"] = qa_agent
            
            # Initialize Bias Detection Agent
            bias_agent = BiasDetectionAgent("bias_agent_001")
            await bias_agent.initialize()
            self.agents["bias_detection"] = bias_agent
            
            # Initialize Continuous Learning Agent
            learning_agent = ContinuousLearningAgent("learning_agent_001")
            await learning_agent.initialize()
            self.agents["continuous_learning"] = learning_agent
            
            self.is_running = True
            logger.info("Agent Orchestrator initialized successfully")
            
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
    
    async def process_ocr(self, file_info: Dict[str, Any]) -> Dict[str, Any]:
        """Process OCR using OCR agent"""
        try:
            task = AgentTask(
                task_id=str(uuid.uuid4()),
                task_type="extract_text",
                input_data={
                    "file_path": file_info["file_path"],
                    "file_type": file_info["file_type"],
                    "language": file_info.get("language", "en"),
                    "preprocessing_options": {
                        "deskew": True,
                        "denoise": True,
                        "enhance_contrast": True,
                        "detect_handwriting": True
                    }
                },
                priority=1,
                created_at=datetime.utcnow()
            )
            
            # Process with OCR agent
            result_task = await self.agents["ocr"].process_task(task)
            
            if result_task.status == TaskStatus.COMPLETED:
                return result_task.output_data
            else:
                raise Exception(f"OCR processing failed: {result_task.error_message}")
                
        except Exception as e:
            logger.error(f"OCR processing error: {e}")
            raise
    
    async def process_evaluation(self, evaluation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process evaluation using multiple agents"""
        try:
            # Primary evaluation
            evaluation_task = AgentTask(
                task_id=str(uuid.uuid4()),
                task_type="evaluate_answer",
                input_data=evaluation_data,
                priority=1,
                created_at=datetime.utcnow()
            )
            
            evaluation_result = await self.agents["evaluation"].process_task(evaluation_task)
            
            if evaluation_result.status != TaskStatus.COMPLETED:
                raise Exception(f"Evaluation failed: {evaluation_result.error_message}")
            
            # Quality assurance check
            qa_task = AgentTask(
                task_id=str(uuid.uuid4()),
                task_type="quality_check",
                input_data={
                    "evaluation_result": evaluation_result.output_data,
                    "original_data": evaluation_data
                },
                priority=1,
                created_at=datetime.utcnow()
            )
            
            qa_result = await self.agents["quality_assurance"].process_task(qa_task)
            
            # Bias detection
            bias_task = AgentTask(
                task_id=str(uuid.uuid4()),
                task_type="detect_bias",
                input_data={
                    "evaluation_result": evaluation_result.output_data,
                    "student_info": evaluation_data.get("student_info", {})
                },
                priority=1,
                created_at=datetime.utcnow()
            )
            
            bias_result = await self.agents["bias_detection"].process_task(bias_task)
            
            # Combine results
            final_result = {
                "evaluation": evaluation_result.output_data,
                "quality_assurance": qa_result.output_data if qa_result.status == TaskStatus.COMPLETED else None,
                "bias_detection": bias_result.output_data if bias_result.status == TaskStatus.COMPLETED else None,
                "confidence_score": self._calculate_confidence_score(
                    evaluation_result.output_data,
                    qa_result.output_data if qa_result.status == TaskStatus.COMPLETED else None,
                    bias_result.output_data if bias_result.status == TaskStatus.COMPLETED else None
                )
            }
            
            return final_result
            
        except Exception as e:
            logger.error(f"Evaluation processing error: {e}")
            raise
    
    async def generate_feedback(self, evaluation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Generate feedback using feedback agent"""
        try:
            feedback_task = AgentTask(
                task_id=str(uuid.uuid4()),
                task_type="generate_feedback",
                input_data=evaluation_result,
                priority=1,
                created_at=datetime.utcnow()
            )
            
            result_task = await self.agents["feedback"].process_task(feedback_task)
            
            if result_task.status == TaskStatus.COMPLETED:
                return result_task.output_data
            else:
                raise Exception(f"Feedback generation failed: {result_task.error_message}")
                
        except Exception as e:
            logger.error(f"Feedback generation error: {e}")
            raise
    
    async def check_plagiarism(self, plagiarism_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check for plagiarism using plagiarism agent"""
        try:
            plagiarism_task = AgentTask(
                task_id=str(uuid.uuid4()),
                task_type="check_plagiarism",
                input_data=plagiarism_data,
                priority=1,
                created_at=datetime.utcnow()
            )
            
            result_task = await self.agents["plagiarism"].process_task(plagiarism_task)
            
            if result_task.status == TaskStatus.COMPLETED:
                return result_task.output_data
            else:
                raise Exception(f"Plagiarism check failed: {result_task.error_message}")
                
        except Exception as e:
            logger.error(f"Plagiarism check error: {e}")
            raise
    
    async def process_comprehensive_evaluation(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process comprehensive evaluation using all agents"""
        try:
            evaluation_id = str(uuid.uuid4())
            start_time = datetime.utcnow()
            
            logger.info(f"Starting comprehensive evaluation: {evaluation_id}")
            
            # Step 1: OCR Processing
            ocr_results = []
            for file_info in request_data["files"]:
                ocr_result = await self.process_ocr(file_info)
                ocr_results.append({
                    "file_info": file_info,
                    "ocr_result": ocr_result
                })
            
            # Step 2: Evaluation Processing
            evaluation_results = []
            for ocr_data in ocr_results:
                evaluation_input = {
                    "text": ocr_data["ocr_result"]["extracted_text"],
                    "metadata": request_data["metadata"],
                    "file_info": ocr_data["file_info"]
                }
                
                evaluation_result = await self.process_evaluation(evaluation_input)
                evaluation_results.append({
                    "file_info": ocr_data["file_info"],
                    "evaluation_result": evaluation_result
                })
            
            # Step 3: Feedback Generation
            feedback_results = []
            for eval_data in evaluation_results:
                feedback_result = await self.generate_feedback(eval_data["evaluation_result"])
                feedback_results.append({
                    "file_info": eval_data["file_info"],
                    "feedback_result": feedback_result
                })
            
            # Step 4: Plagiarism Check
            plagiarism_results = []
            for ocr_data in ocr_results:
                plagiarism_input = {
                    "text": ocr_data["ocr_result"]["extracted_text"],
                    "user_id": request_data["user_id"],
                    "subject": request_data["metadata"].get("subject")
                }
                
                plagiarism_result = await self.check_plagiarism(plagiarism_input)
                plagiarism_results.append({
                    "file_info": ocr_data["file_info"],
                    "plagiarism_result": plagiarism_result
                })
            
            # Step 5: Continuous Learning Update
            learning_data = {
                "evaluation_id": evaluation_id,
                "ocr_results": ocr_results,
                "evaluation_results": evaluation_results,
                "feedback_results": feedback_results,
                "plagiarism_results": plagiarism_results,
                "metadata": request_data["metadata"]
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
            
            # Compile final results
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            comprehensive_result = {
                "evaluation_id": evaluation_id,
                "user_id": request_data["user_id"],
                "ocr_results": ocr_results,
                "evaluation_results": evaluation_results,
                "feedback_results": feedback_results,
                "plagiarism_results": plagiarism_results,
                "processing_time": processing_time,
                "status": "completed",
                "completed_at": datetime.utcnow().isoformat(),
                "summary": self._generate_evaluation_summary(
                    evaluation_results, feedback_results, plagiarism_results
                )
            }
            
            logger.info(f"Comprehensive evaluation completed: {evaluation_id} in {processing_time:.2f}s")
            
            return comprehensive_result
            
        except Exception as e:
            logger.error(f"Comprehensive evaluation error: {e}")
            raise
    
    def _calculate_confidence_score(self, evaluation_result: Dict[str, Any], 
                                  qa_result: Optional[Dict[str, Any]], 
                                  bias_result: Optional[Dict[str, Any]]) -> float:
        """Calculate overall confidence score"""
        base_confidence = evaluation_result.get("confidence", 0.7)
        
        # Adjust based on QA results
        if qa_result and qa_result.get("quality_score"):
            qa_adjustment = (qa_result["quality_score"] - 0.5) * 0.2
            base_confidence += qa_adjustment
        
        # Adjust based on bias detection
        if bias_result and bias_result.get("bias_score"):
            bias_adjustment = (0.5 - bias_result["bias_score"]) * 0.1
            base_confidence += bias_adjustment
        
        return max(0.0, min(1.0, base_confidence))
    
    def _generate_evaluation_summary(self, evaluation_results: List[Dict[str, Any]], 
                                   feedback_results: List[Dict[str, Any]], 
                                   plagiarism_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate evaluation summary"""
        total_score = 0
        max_score = 0
        total_files = len(evaluation_results)
        
        for result in evaluation_results:
            eval_data = result["evaluation_result"]["evaluation"]
            total_score += eval_data.get("score", 0)
            max_score += eval_data.get("max_score", 100)
        
        # Check for plagiarism issues
        plagiarism_detected = any(
            result["plagiarism_result"].get("plagiarism_score", 0) > 0.7
            for result in plagiarism_results
        )
        
        return {
            "total_files_processed": total_files,
            "overall_score": total_score,
            "overall_max_score": max_score,
            "overall_percentage": (total_score / max_score * 100) if max_score > 0 else 0,
            "plagiarism_detected": plagiarism_detected,
            "average_confidence": sum(
                result["evaluation_result"].get("confidence_score", 0.7)
                for result in evaluation_results
            ) / total_files if total_files > 0 else 0
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on all agents"""
        health_status = {
            "orchestrator_status": "healthy" if self.is_running else "unhealthy",
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
