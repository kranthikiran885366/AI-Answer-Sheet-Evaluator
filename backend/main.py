from fastapi import FastAPI, File, UploadFile, Form, WebSocket, WebSocketDisconnect, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import os
import logging
from pathlib import Path
import aiofiles
import jwt
from passlib.context import CryptContext
import redis.asyncio as redis
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlAlchemyIntegration
import uvicorn
from contextlib import asynccontextmanager

# Import our custom modules
from agents.agent_orchestrator import AgentOrchestrator
from agents.ocr_agent import OCRAgent
from agents.evaluation_agent import EvaluationAgent
from agents.feedback_agent import FeedbackAgent
from agents.plagiarism_agent import PlagiarismAgent
from agents.handwriting_agent import HandwritingAgent
from agents.formula_recognition_agent import FormulaRecognitionAgent
from agents.language_detection_agent import LanguageDetectionAgent
from agents.subject_classification_agent import SubjectClassificationAgent
from agents.answer_validation_agent import AnswerValidationAgent
from agents.grading_consistency_agent import GradingConsistencyAgent
from agents.performance_monitoring_agent import PerformanceMonitoringAgent
from agents.security_agent import SecurityAgent
from agents.data_privacy_agent import DataPrivacyAgent
from agents.model_optimization_agent import ModelOptimizationAgent
from agents.bias_detection_agent import BiasDetectionAgent
from agents.quality_assurance_agent import QualityAssuranceAgent
from agents.continuous_learning_agent import ContinuousLearningAgent

from databases.sql_config import get_db, User, Evaluation, Question, Subject, create_tables
from databases.mongodb_config import mongodb_manager, get_collections
from databases.redis_config import redis_manager
from databases.kafka_config import kafka_manager, publish_evaluation_request, publish_evaluation_result
from ml_models.advanced_model_manager import AdvancedModelManager
from ml_models.training_pipeline import TrainingPipeline
from ml_models.inference_engine import InferenceEngine
from data_pipeline.data_manager import DataManager
from continuous_learning.learning_pipeline import ContinuousLearningPipeline
from security.auth_manager import AuthManager
from monitoring.metrics_collector import MetricsCollector
from utils.file_handler import FileHandler
from utils.response_formatter import ResponseFormatter
from automation.auto_trainer import AutoTrainer
from automation.model_optimizer import ModelOptimizer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Sentry for error tracking
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[
        FastApiIntegration(auto_enabling_integrations=False),
        SqlAlchemyIntegration(),
    ],
    traces_sample_rate=1.0,
    environment=os.getenv("ENVIRONMENT", "development")
)

# Global variables for components
agent_orchestrator = None
advanced_model_manager = None
training_pipeline = None
inference_engine = None
data_manager = None
learning_pipeline = None
auth_manager = None
metrics_collector = None
file_handler = None
response_formatter = None
auto_trainer = None
model_optimizer = None

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

# Prometheus metrics
evaluation_counter = Counter('evaluations_total', 'Total number of evaluations')
evaluation_duration = Histogram('evaluation_duration_seconds', 'Time spent on evaluations')
ocr_counter = Counter('ocr_operations_total', 'Total OCR operations')
model_accuracy = Counter('model_accuracy_total', 'Model accuracy metrics')
websocket_connections = Counter('websocket_connections_total', 'Total WebSocket connections')
training_jobs = Counter('training_jobs_total', 'Total training jobs')
api_requests = Counter('api_requests_total', 'Total API requests', ['method', 'endpoint'])
error_counter = Counter('errors_total', 'Total errors', ['error_type'])

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(websocket)
        
        websocket_connections.inc()
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if user_id and user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: Dict[str, Any], user_id: str):
        if user_id in self.user_connections:
            disconnected = []
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to send WebSocket message: {e}")
                    disconnected.append(connection)
            
            for conn in disconnected:
                self.disconnect(conn, user_id)

    async def broadcast(self, message: Dict[str, Any]):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to broadcast message: {e}")
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting EvalAI Pro Advanced Backend...")
    
    global agent_orchestrator, advanced_model_manager, training_pipeline, inference_engine
    global data_manager, learning_pipeline, auth_manager, metrics_collector
    global file_handler, response_formatter, auto_trainer, model_optimizer
    
    try:
        # Initialize databases
        await mongodb_manager.connect()
        await redis_manager.connect()
        await kafka_manager.initialize()
        
        # Create SQL tables
        await create_tables()
        
        # Initialize components
        agent_orchestrator = AgentOrchestrator()
        await agent_orchestrator.initialize()
        
        advanced_model_manager = AdvancedModelManager()
        await advanced_model_manager.initialize()
        
        training_pipeline = TrainingPipeline()
        await training_pipeline.initialize()
        
        inference_engine = InferenceEngine()
        await inference_engine.initialize()
        
        data_manager = DataManager()
        await data_manager.initialize()
        
        learning_pipeline = ContinuousLearningPipeline()
        await learning_pipeline.initialize()
        await learning_pipeline.start_continuous_learning()
        
        auth_manager = AuthManager()
        metrics_collector = MetricsCollector()
        await metrics_collector.initialize()
        
        file_handler = FileHandler()
        response_formatter = ResponseFormatter()
        
        auto_trainer = AutoTrainer()
        await auto_trainer.initialize()
        await auto_trainer.start_auto_training()
        
        model_optimizer = ModelOptimizer()
        await model_optimizer.initialize()
        
        # Start background tasks
        asyncio.create_task(background_data_sync())
        asyncio.create_task(background_model_training())
        asyncio.create_task(background_health_check())
        asyncio.create_task(background_model_optimization())
        asyncio.create_task(background_automated_evaluation())
        
        logger.info("EvalAI Pro Advanced Backend started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise
    
    yield
    
    # Shutdown
    try:
        logger.info("Shutting down EvalAI Pro Advanced Backend...")
        
        if learning_pipeline:
            await learning_pipeline.stop_continuous_learning()
        
        if auto_trainer:
            await auto_trainer.stop_auto_training()
        
        await mongodb_manager.disconnect()
        await redis_manager.disconnect()
        await kafka_manager.shutdown()
        
        if agent_orchestrator:
            await agent_orchestrator.shutdown()
        
        if advanced_model_manager:
            await advanced_model_manager.shutdown()
        
        logger.info("EvalAI Pro Advanced Backend shut down successfully")
        
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="EvalAI Pro - Advanced AI Answer Sheet Evaluator",
    version="3.0.0",
    description="Production-ready AI-powered answer sheet evaluation system with advanced deep learning models, real-time processing, and comprehensive analytics",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
templates = Jinja2Templates(directory="templates")

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    api_requests.labels(method=request.method, endpoint=str(request.url.path)).inc()
    
    response = await call_next(request)
    
    # Log response time
    process_time = (datetime.utcnow() - start_time).total_seconds()
    logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
    
    return response

# Background tasks
async def background_data_sync():
    """Background task for data synchronization"""
    while True:
        try:
            if data_manager:
                await data_manager.sync_datasets()
            await asyncio.sleep(3600)  # Run every hour
        except Exception as e:
            logger.error(f"Background data sync error: {e}")
            error_counter.labels(error_type="data_sync").inc()
            await asyncio.sleep(300)

async def background_model_training():
    """Background task for model training"""
    while True:
        try:
            if advanced_model_manager:
                await advanced_model_manager.check_and_retrain_models()
            await asyncio.sleep(86400)  # Run daily
        except Exception as e:
            logger.error(f"Background model training error: {e}")
            error_counter.labels(error_type="model_training").inc()
            await asyncio.sleep(3600)

async def background_health_check():
    """Background health monitoring"""
    while True:
        try:
            if metrics_collector:
                await metrics_collector.collect_system_metrics()
            await asyncio.sleep(60)  # Run every minute
        except Exception as e:
            logger.error(f"Background health check error: {e}")
            error_counter.labels(error_type="health_check").inc()
            await asyncio.sleep(60)

async def background_model_optimization():
    """Background model optimization"""
    while True:
        try:
            if model_optimizer:
                await model_optimizer.optimize_models()
            await asyncio.sleep(21600)  # Run every 6 hours
        except Exception as e:
            logger.error(f"Background model optimization error: {e}")
            error_counter.labels(error_type="model_optimization").inc()
            await asyncio.sleep(1800)

async def background_automated_evaluation():
    """Background automated evaluation processing"""
    while True:
        try:
            if auto_trainer:
                await auto_trainer.process_pending_evaluations()
            await asyncio.sleep(300)  # Run every 5 minutes
        except Exception as e:
            logger.error(f"Background automated evaluation error: {e}")
            error_counter.labels(error_type="automated_evaluation").inc()
            await asyncio.sleep(60)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "3.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "services": {
                "database": "connected",
                "redis": "connected" if redis_manager.redis_client else "disconnected",
                "mongodb": "connected" if mongodb_manager.database else "disconnected",
                "kafka": "connected",
                "agents": await agent_orchestrator.health_check() if agent_orchestrator else {"status": "not_initialized"},
                "models": await advanced_model_manager.health_check() if advanced_model_manager else {"status": "not_initialized"},
                "data_pipeline": await data_manager.health_check() if data_manager else {"status": "not_initialized"},
                "learning_pipeline": await learning_pipeline.health_check() if learning_pipeline else {"status": "not_initialized"}
            },
            "metrics": {
                "total_evaluations": evaluation_counter._value._value,
                "active_connections": len(manager.active_connections),
                "total_training_jobs": training_jobs._value._value,
                "total_api_requests": api_requests._value._value
            }
        }
        
        return JSONResponse(content=health_status)
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        error_counter.labels(error_type="health_check").inc()
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

# Metrics endpoint for Prometheus
@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Authentication endpoints
@app.post("/api/auth/login")
async def login(credentials: dict):
    """User authentication"""
    try:
        username = credentials.get("username")
        password = credentials.get("password")
        
        if not username or not password:
            raise HTTPException(status_code=400, detail="Username and password required")
        
        user = await auth_manager.authenticate_user(username, password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        token = await auth_manager.create_access_token(user["id"])
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user,
            "expires_in": 3600
        }
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        error_counter.labels(error_type="authentication").inc()
        raise HTTPException(status_code=500, detail="Authentication failed")

@app.post("/api/auth/register")
async def register(user_data: dict):
    """User registration"""
    try:
        user = await auth_manager.create_user(user_data)
        token = await auth_manager.create_access_token(user["id"])
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user,
            "message": "User registered successfully"
        }
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        error_counter.labels(error_type="registration").inc()
        raise HTTPException(status_code=500, detail="Registration failed")

# File upload and processing endpoints
@app.post("/api/upload/answer-sheets")
async def upload_answer_sheets(
    files: List[UploadFile] = File(...),
    subject: str = Form(...),
    grade_level: str = Form(...),
    rubric_id: Optional[str] = Form(None),
    user_id: str = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Upload and process answer sheets"""
    try:
        evaluation_id = str(uuid.uuid4())
        
        # Save uploaded files
        file_paths = []
        for file in files:
            file_path = await file_handler.save_uploaded_file(file, evaluation_id)
            file_paths.append(file_path)
        
        # Create evaluation record
        evaluation_data = {
            "id": evaluation_id,
            "user_id": user_id,
            "subject": subject,
            "grade_level": grade_level,
            "rubric_id": rubric_id,
            "file_paths": file_paths,
            "status": "uploaded",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Store in database
        await mongodb_manager.store_evaluation(evaluation_data)
        
        # Queue for processing
        await kafka_manager.publish_evaluation_request({
            "evaluation_id": evaluation_id,
            "file_paths": file_paths,
            "subject": subject,
            "grade_level": grade_level,
            "rubric_id": rubric_id,
            "user_id": user_id
        })
        
        # Send WebSocket notification
        await manager.send_personal_message({
            "type": "upload_success",
            "data": {
                "evaluation_id": evaluation_id,
                "files_count": len(files),
                "status": "queued_for_processing"
            }
        }, user_id)
        
        # Start background processing
        background_tasks.add_task(process_evaluation, evaluation_id)
        
        evaluation_counter.inc()
        
        return {
            "evaluation_id": evaluation_id,
            "status": "uploaded",
            "files_processed": len(files),
            "message": "Files uploaded successfully and queued for processing"
        }
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        error_counter.labels(error_type="upload").inc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def process_evaluation(evaluation_id: str):
    """Background task to process evaluation"""
    try:
        with evaluation_duration.time():
            # Get evaluation data
            evaluation = await mongodb_manager.get_evaluation(evaluation_id)
            if not evaluation:
                raise Exception("Evaluation not found")
            
            # Update status
            await mongodb_manager.update_evaluation_status(evaluation_id, "processing")
            
            # Send processing notification
            await manager.send_personal_message({
                "type": "processing_started",
                "data": {"evaluation_id": evaluation_id}
            }, evaluation["user_id"])
            
            # Process with agent orchestrator
            result = await agent_orchestrator.process_evaluation(evaluation)
            
            # Store results
            await mongodb_manager.store_evaluation_results(evaluation_id, result)
            
            # Update status
            await mongodb_manager.update_evaluation_status(evaluation_id, "completed")
            
            # Send completion notification
            await manager.send_personal_message({
                "type": "evaluation_completed",
                "data": {
                    "evaluation_id": evaluation_id,
                    "results": result
                }
            }, evaluation["user_id"])
            
            # Publish results to Kafka
            await kafka_manager.publish_evaluation_result({
                "evaluation_id": evaluation_id,
                "results": result,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            logger.info(f"Evaluation {evaluation_id} completed successfully")
            
    except Exception as e:
        logger.error(f"Evaluation processing error: {e}")
        error_counter.labels(error_type="evaluation_processing").inc()
        
        # Update status to error
        await mongodb_manager.update_evaluation_status(evaluation_id, "error")
        
        # Send error notification
        await manager.send_personal_message({
            "type": "evaluation_error",
            "data": {
                "evaluation_id": evaluation_id,
                "error": str(e)
            }
        }, evaluation.get("user_id", "unknown"))

# OCR processing endpoint
@app.post("/api/ocr/process")
async def process_ocr(
    files: List[UploadFile] = File(...),
    language: str = Form("auto"),
    user_id: str = Form(...)
):
    """Process OCR on uploaded files"""
    try:
        ocr_results = []
        
        for file in files:
            # Save file temporarily
            temp_path = await file_handler.save_temp_file(file)
            
            # Process OCR
            ocr_result = await agent_orchestrator.process_ocr(temp_path, language)
            ocr_results.append({
                "filename": file.filename,
                "text": ocr_result["text"],
                "confidence": ocr_result["confidence"],
                "language_detected": ocr_result["language"],
                "processing_time": ocr_result["processing_time"]
            })
            
            # Clean up temp file
            await file_handler.cleanup_temp_file(temp_path)
        
        ocr_counter.inc(len(files))
        
        return {
            "results": ocr_results,
            "total_files": len(files),
            "status": "completed"
        }
        
    except Exception as e:
        logger.error(f"OCR processing error: {e}")
        error_counter.labels(error_type="ocr_processing").inc()
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

# AI evaluation endpoint
@app.post("/api/ai/evaluate")
async def ai_evaluate(
    evaluation_request: dict
):
    """AI-powered evaluation of answers"""
    try:
        # Extract request data
        answers = evaluation_request.get("answers", [])
        rubric = evaluation_request.get("rubric", {})
        subject = evaluation_request.get("subject", "general")
        
        # Process evaluation
        evaluation_results = await agent_orchestrator.evaluate_answers(
            answers=answers,
            rubric=rubric,
            subject=subject
        )
        
        return {
            "evaluation_id": str(uuid.uuid4()),
            "results": evaluation_results,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "completed"
        }
        
    except Exception as e:
        logger.error(f"AI evaluation error: {e}")
        error_counter.labels(error_type="ai_evaluation").inc()
        raise HTTPException(status_code=500, detail=f"AI evaluation failed: {str(e)}")

# Model management endpoints
@app.get("/api/models/status")
async def get_models_status():
    """Get status of all AI models"""
    try:
        if not advanced_model_manager:
            raise HTTPException(status_code=503, detail="Model manager not initialized")
        
        status = await advanced_model_manager.get_models_status()
        return status
        
    except Exception as e:
        logger.error(f"Model status error: {e}")
        error_counter.labels(error_type="model_status").inc()
        raise HTTPException(status_code=500, detail=f"Failed to get model status: {str(e)}")

@app.post("/api/models/train")
async def train_model(
    training_request: dict,
    background_tasks: BackgroundTasks
):
    """Start model training"""
    try:
        training_id = str(uuid.uuid4())
        
        # Queue training job
        background_tasks.add_task(
            run_training_job,
            training_id,
            training_request
        )
        
        training_jobs.inc()
        
        return {
            "training_id": training_id,
            "status": "queued",
            "message": "Training job queued successfully"
        }
        
    except Exception as e:
        logger.error(f"Model training error: {e}")
        error_counter.labels(error_type="model_training").inc()
        raise HTTPException(status_code=500, detail=f"Failed to start training: {str(e)}")

async def run_training_job(training_id: str, training_request: dict):
    """Background training job"""
    try:
        # Start training
        await training_pipeline.start_training(training_id, training_request)
        
        # Broadcast training completion
        await manager.broadcast({
            "type": "training_completed",
            "data": {
                "training_id": training_id,
                "status": "completed"
            }
        })
        
    except Exception as e:
        logger.error(f"Training job error: {e}")
        error_counter.labels(error_type="training_job").inc()
        
        await manager.broadcast({
            "type": "training_error",
            "data": {
                "training_id": training_id,
                "error": str(e)
            }
        })

# Analytics endpoints
@app.get("/api/analytics/dashboard")
async def get_analytics_dashboard(user_id: str):
    """Get analytics dashboard data"""
    try:
        analytics_data = await metrics_collector.get_dashboard_analytics(user_id)
        return analytics_data
        
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        error_counter.labels(error_type="analytics").inc()
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@app.get("/api/analytics/reports")
async def get_analytics_reports(
    report_type: str,
    start_date: str,
    end_date: str,
    user_id: str
):
    """Get detailed analytics reports"""
    try:
        reports = await metrics_collector.generate_reports(
            report_type=report_type,
            start_date=start_date,
            end_date=end_date,
            user_id=user_id
        )
        return reports
        
    except Exception as e:
        logger.error(f"Reports error: {e}")
        error_counter.labels(error_type="reports").inc()
        raise HTTPException(status_code=500, detail=f"Failed to generate reports: {str(e)}")

# Evaluation results endpoints
@app.get("/api/evaluations/{evaluation_id}")
async def get_evaluation_results(evaluation_id: str):
    """Get evaluation results"""
    try:
        evaluation = await mongodb_manager.get_evaluation_with_results(evaluation_id)
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        return evaluation
        
    except Exception as e:
        logger.error(f"Get evaluation error: {e}")
        error_counter.labels(error_type="get_evaluation").inc()
        raise HTTPException(status_code=500, detail=f"Failed to get evaluation: {str(e)}")

@app.get("/api/evaluations")
async def list_evaluations(
    user_id: str,
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None
):
    """List user evaluations"""
    try:
        evaluations = await mongodb_manager.list_user_evaluations(
            user_id=user_id,
            page=page,
            limit=limit,
            status=status
        )
        return evaluations
        
    except Exception as e:
        logger.error(f"List evaluations error: {e}")
        error_counter.labels(error_type="list_evaluations").inc()
        raise HTTPException(status_code=500, detail=f"Failed to list evaluations: {str(e)}")

# Rubric management endpoints
@app.post("/api/rubrics")
async def create_rubric(rubric_data: dict):
    """Create new rubric"""
    try:
        rubric_id = await mongodb_manager.create_rubric(rubric_data)
        return {
            "rubric_id": rubric_id,
            "status": "created",
            "message": "Rubric created successfully"
        }
        
    except Exception as e:
        logger.error(f"Create rubric error: {e}")
        error_counter.labels(error_type="create_rubric").inc()
        raise HTTPException(status_code=500, detail=f"Failed to create rubric: {str(e)}")

@app.get("/api/rubrics")
async def list_rubrics(
    subject: Optional[str] = None,
    grade_level: Optional[str] = None,
    user_id: Optional[str] = None
):
    """List available rubrics"""
    try:
        rubrics = await mongodb_manager.list_rubrics(
            subject=subject,
            grade_level=grade_level,
            user_id=user_id
        )
        return rubrics
        
    except Exception as e:
        logger.error(f"List rubrics error: {e}")
        error_counter.labels(error_type="list_rubrics").inc()
        raise HTTPException(status_code=500, detail=f"Failed to list rubrics: {str(e)}")

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket connection for real-time updates"""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message.get("type") == "subscribe":
                # Handle subscription to specific events
                pass
            else:
                logger.info(f"Received WebSocket message: {message}")
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        logger.info(f"WebSocket disconnected for user: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)

# Admin endpoints
@app.get("/api/admin/system-status")
async def get_system_status():
    """Get comprehensive system status (admin only)"""
    try:
        system_status = {
            "agents": await agent_orchestrator.get_detailed_status() if agent_orchestrator else {},
            "models": await advanced_model_manager.get_detailed_status() if advanced_model_manager else {},
            "databases": {
                "mongodb": await mongodb_manager.get_status(),
                "redis": await redis_manager.get_status(),
                "kafka": await kafka_manager.get_status()
            },
            "metrics": await metrics_collector.get_system_metrics() if metrics_collector else {},
            "performance": {
                "total_evaluations": evaluation_counter._value._value,
                "active_connections": len(manager.active_connections),
                "training_jobs": training_jobs._value._value,
                "error_rate": error_counter._value._value
            }
        }
        
        return system_status
        
    except Exception as e:
        logger.error(f"System status error: {e}")
        error_counter.labels(error_type="system_status").inc()
        raise HTTPException(status_code=500, detail=f"Failed to get system status: {str(e)}")

@app.post("/api/admin/system-maintenance")
async def trigger_system_maintenance(maintenance_request: dict):
    """Trigger system maintenance tasks"""
    try:
        maintenance_type = maintenance_request.get("type")
        
        if maintenance_type == "model_optimization":
            if model_optimizer:
                await model_optimizer.optimize_all_models()
        elif maintenance_type == "data_cleanup":
            if data_manager:
                await data_manager.cleanup_old_data()
        elif maintenance_type == "cache_refresh":
            if redis_manager:
                await redis_manager.refresh_cache()
        
        return {
            "status": "completed",
            "maintenance_type": maintenance_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"System maintenance error: {e}")
        error_counter.labels(error_type="system_maintenance").inc()
        raise HTTPException(status_code=500, detail=f"Maintenance failed: {str(e)}")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    error_counter.labels(error_type="unhandled").inc()
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if os.getenv("DEBUG") == "true" else "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Main entry point
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "false").lower() == "true",
        workers=int(os.getenv("WORKERS", 1)),
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )
