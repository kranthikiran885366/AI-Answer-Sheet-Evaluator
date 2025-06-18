from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Union
import asyncio
import logging
from dataclasses import dataclass, field
from enum import Enum
import uuid
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class AgentType(Enum):
    OCR_AGENT = "ocr_agent"
    EVALUATION_AGENT = "evaluation_agent"
    FEEDBACK_AGENT = "feedback_agent"
    ORCHESTRATOR_AGENT = "orchestrator_agent"
    TRAINING_AGENT = "training_agent"
    QUALITY_ASSURANCE_AGENT = "qa_agent"

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

@dataclass
class AgentTask:
    task_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agent_type: AgentType = None
    task_type: str = ""
    input_data: Dict[str, Any] = field(default_factory=dict)
    output_data: Dict[str, Any] = field(default_factory=dict)
    status: TaskStatus = TaskStatus.PENDING
    priority: int = 1  # 1-10, 10 being highest
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AgentCapability:
    name: str
    description: str
    input_types: List[str]
    output_types: List[str]
    confidence_threshold: float = 0.8
    max_processing_time: int = 300  # seconds

class BaseAgent(ABC):
    """Base class for all AI agents in the system"""
    
    def __init__(self, agent_id: str, agent_type: AgentType, capabilities: List[AgentCapability]):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.capabilities = capabilities
        self.is_active = True
        self.current_tasks: Dict[str, AgentTask] = {}
        self.completed_tasks: List[str] = []
        self.performance_metrics = {
            'total_tasks': 0,
            'successful_tasks': 0,
            'failed_tasks': 0,
            'average_processing_time': 0.0,
            'average_confidence': 0.0
        }
        
    @abstractmethod
    async def process_task(self, task: AgentTask) -> AgentTask:
        """Process a given task and return the updated task with results"""
        pass
    
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the agent and its resources"""
        pass
    
    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check and return status"""
        pass
    
    async def execute_task(self, task: AgentTask) -> AgentTask:
        """Execute a task with proper error handling and metrics"""
        try:
            task.status = TaskStatus.IN_PROGRESS
            task.started_at = datetime.utcnow()
            self.current_tasks[task.task_id] = task
            
            # Process the task
            result_task = await self.process_task(task)
            
            # Update metrics
            result_task.completed_at = datetime.utcnow()
            result_task.status = TaskStatus.COMPLETED
            self._update_metrics(result_task, success=True)
            
            # Move to completed tasks
            self.completed_tasks.append(task.task_id)
            del self.current_tasks[task.task_id]
            
            return result_task
            
        except Exception as e:
            logger.error(f"Task {task.task_id} failed: {str(e)}")
            task.status = TaskStatus.FAILED
            task.error_message = str(e)
            task.completed_at = datetime.utcnow()
            self._update_metrics(task, success=False)
            
            if task.task_id in self.current_tasks:
                del self.current_tasks[task.task_id]
            
            return task
    
    def _update_metrics(self, task: AgentTask, success: bool):
        """Update performance metrics"""
        self.performance_metrics['total_tasks'] += 1
        
        if success:
            self.performance_metrics['successful_tasks'] += 1
        else:
            self.performance_metrics['failed_tasks'] += 1
        
        # Update average processing time
        if task.started_at and task.completed_at:
            processing_time = (task.completed_at - task.started_at).total_seconds()
            current_avg = self.performance_metrics['average_processing_time']
            total_tasks = self.performance_metrics['total_tasks']
            self.performance_metrics['average_processing_time'] = (
                (current_avg * (total_tasks - 1) + processing_time) / total_tasks
            )
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            'agent_id': self.agent_id,
            'agent_type': self.agent_type.value,
            'is_active': self.is_active,
            'current_tasks_count': len(self.current_tasks),
            'completed_tasks_count': len(self.completed_tasks),
            'performance_metrics': self.performance_metrics,
            'capabilities': [cap.name for cap in self.capabilities]
        }
