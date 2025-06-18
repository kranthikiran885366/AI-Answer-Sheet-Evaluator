from fastapi import FastAPI, File, UploadFile, Form, WebSocket, WebSocketDisconnect, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
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

# Import our custom modules
from agents.agent_orchestrator import AgentOrchestrator
from agents.ocr_agent import OCRAgent
from agents.evaluation_agent import EvaluationAgent
from agents.feedback_agent import FeedbackAgent
from agents.plagiarism_agent import PlagiarismAgent
from databases.sql_config import get_db, User, Evaluation, Question, Subject
from databases.mongodb_config import mongodb_manager, get_collections
from databases.redis_config import redis_manager
from databases.kafka_config import kafka_manager, publish_evaluation_request, publish_evaluation_result
from data_pipeline.data_manager import DataManager
from ml_models.model_manager import ModelManager
from continuous_learning.learning_pipeline import ContinuousLearningPipeline
from security.auth_manager import AuthManager
from monitoring.metrics_collector import MetricsCollector
from utils.file_handler import FileHandler
from utils.response_formatter import ResponseFormatter

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

# Initialize FastAPI app
app = FastAPI(
    title="AI Answer Sheet Evaluator",
    version="3.0.0",
    description="Production-ready AI-powered answer sheet evaluation system with real-time processing",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

# Initialize components
agent_orchestrator = AgentOrchestrator()
data_manager = DataManager()
model_manager = ModelManager()
learning_pipeline = ContinuousLearningPipeline()
auth_manager = AuthManager()
metrics_collector = MetricsCollector()
file_handler = FileHandler()
response_formatter = ResponseFormatter()

# Prometheus metrics
evaluation_counter = Counter('evaluations_total', 'Total number of evaluations')
evaluation_duration = Histogram('evaluation_duration_seconds', 'Time spent on evaluations')
ocr_counter = Counter('ocr_operations_total', 'Total OCR operations')
model_accuracy = Counter('model_accuracy_total', 'Model accuracy metrics')
websocket_connections = Counter('websocket_connections_total', 'Total WebSocket connections')

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
            
            # Remove disconnected connections
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
        
        # Remove disconnected connections
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize all components on startup"""
    try:
        logger.info("Starting AI Answer Sheet Evaluator...")
        
        # Initialize databases
        await mongodb_manager.connect()
        await redis_manager.connect()
        await kafka_manager.initialize()
        
        # Initialize AI agents
        await agent_orchestrator.initialize()
        
        # Initialize data manager
        await data_manager.initialize()
        
        # Initialize model manager
        await model_manager.initialize()
        
        # Start continuous learning pipeline
        await learning_pipeline.initialize()
        await learning_pipeline.start_continuous_learning()
        
        # Initialize metrics collector
        await metrics_collector.initialize()
        
        # Start background tasks
        asyncio.create_task(background_data_sync())
        asyncio.create_task(background_model_training())
        asyncio.create_task(background_health_check())
        
        logger.info("AI Answer Sheet Evaluator started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    try:
        logger.info("Shutting down AI Answer Sheet Evaluator...")
        
        # Stop continuous learning
        await learning_pipeline.stop_continuous_learning()
        
        # Disconnect from databases
        await mongodb_manager.disconnect()
        await redis_manager.disconnect()
        await kafka_manager.shutdown()
        
        # Stop agents
        await agent_orchestrator.shutdown()
        
        logger.info("AI Answer Sheet Evaluator shut down successfully")
        
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Background tasks
async def background_data_sync():
    """Background task for data synchronization"""
    while True:
        try:
            await data_manager.sync_datasets()
            await asyncio.sleep(3600)  # Run every hour
        except Exception as e:
            logger.error(f"Background data sync error: {e}")
            await asyncio.sleep(300)  # Wait 5 minutes on error

async def background_model_training():
    """Background task for model training"""
    while True:
        try:
            await model_manager.check_and_retrain_models()
            await asyncio.sleep(86400)  # Run daily
        except Exception as e:
            logger.error(f"Background model training error: {e}")
            await asyncio.sleep(3600)  # Wait 1 hour on error

async def background_health_check():
    """Background health monitoring"""
    while True:
        try:
            await metrics_collector.collect_system_metrics()
            await asyncio.sleep(60)  # Run every minute
        except Exception as e:
            logger.error(f"Background health check error: {e}")
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
            "services": {
                "database": "connected",
                "redis": "connected" if redis_manager.redis_client else "disconnected",
                "mongodb": "connected" if mongodb_manager.database else "disconnected",
                "kafka": "connected",
                "agents": await agent_orchestrator.health_check(),
                "models": await model_manager.health_check(),
                "data_pipeline": await data_manager.health_check()
            },
            "metrics": await metrics_collector.get_current_metrics()
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}

# Metrics endpoint for Prometheus
@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()

# Authentication endpoints
@app.post("/api/auth/register")
async def register(user_data: dict, db=Depends(get_db)):
    """Register new user"""
    try:
        result = await auth_manager.register_user(user_data, db)
        return response_formatter.success(result)
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
async def login(credentials: dict, db=Depends(get_db)):
    """User login"""
    try:
        result = await auth_manager.authenticate_user(credentials, db)
        return response_formatter.success(result)
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/api/auth/refresh")
async def refresh_token(token_data: dict):
    """Refresh authentication token"""
    try:
        result = await auth_manager.refresh_token(token_data)
        return response_formatter.success(result)
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(status_code=401, detail=str(e))

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket connection for real-time updates"""
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            if message_data.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message_data.get("type") == "subscribe":
                # Handle subscription to specific channels
                pass
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)

# Upload answer sheet endpoint
@app.post("/api/upload-answer-sheet")
async def upload_answer_sheet(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    metadata: str = Form(...),
    current_user: dict = Depends(auth_manager.get_current_user)
):
    """Upload answer sheets for evaluation"""
    try:
        metadata_dict = json.loads(metadata)
        
        # Process files
        uploaded_files = []
        for file in files:
            file_info = await file_handler.save_uploaded_file(file, current_user["id"])
            uploaded_files.append(file_info)
        
        # Create evaluation request
        evaluation_request = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "files": uploaded_files,
            "metadata": metadata_dict,
            "status": "uploaded",
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Store in database
        collections = get_collections(mongodb_manager.database)
        await collections['evaluation_requests'].insert_one(evaluation_request)
        
        # Publish to Kafka for processing
        await publish_evaluation_request(evaluation_request)
        
        # Add background task for processing
        background_tasks.add_task(process_evaluation_request, evaluation_request)
        
        # Send real-time notification
        await manager.send_personal_message({
            "type": "upload_success",
            "data": evaluation_request
        }, current_user["id"])
        
        evaluation_counter.inc()
        
        return response_formatter.success({
            "evaluation_id": evaluation_request["id"],
            "status": "uploaded",
            "message": "Files uploaded successfully and queued for processing"
        })
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_evaluation_request(evaluation_request: Dict[str, Any]):
    """Process evaluation request using AI agents"""
    try:
        evaluation_id = evaluation_request["id"]
        user_id = evaluation_request["user_id"]
        
        # Update status
        await manager.send_personal_message({
            "type": "processing_started",
            "evaluation_id": evaluation_id
        }, user_id)
        
        # Process each file
        results = []
        for file_info in evaluation_request["files"]:
            # OCR Processing
            ocr_result = await agent_orchestrator.process_ocr(file_info)
            ocr_counter.inc()
            
            # AI Evaluation
            evaluation_result = await agent_orchestrator.process_evaluation({
                "text": ocr_result["extracted_text"],
                "metadata": evaluation_request["metadata"],
                "file_info": file_info
            })
            
            # Feedback Generation
            feedback_result = await agent_orchestrator.generate_feedback(evaluation_result)
            
            # Plagiarism Check
            plagiarism_result = await agent_orchestrator.check_plagiarism({
                "text": ocr_result["extracted_text"],
                "user_id": user_id
            })
            
            # Combine results
            complete_result = {
                "file_info": file_info,
                "ocr_result": ocr_result,
                "evaluation_result": evaluation_result,
                "feedback_result": feedback_result,
                "plagiarism_result": plagiarism_result,
                "processed_at": datetime.utcnow().isoformat()
            }
            
            results.append(complete_result)
        
        # Store final results
        final_evaluation = {
            "evaluation_id": evaluation_id,
            "user_id": user_id,
            "results": results,
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat()
        }
        
        collections = get_collections(mongodb_manager.database)
        await collections['evaluation_results'].insert_evaluation(final_evaluation)
        
        # Publish results
        await publish_evaluation_result(final_evaluation)
        
        # Send completion notification
        await manager.send_personal_message({
            "type": "evaluation_completed",
            "data": final_evaluation
        }, user_id)
        
        # Add to continuous learning pipeline
        await learning_pipeline.add_training_data({
            "evaluation_id": evaluation_id,
            "results": results,
            "user_feedback": None  # Will be updated when user provides feedback
        })
        
        evaluation_duration.observe(
            (datetime.utcnow() - datetime.fromisoformat(evaluation_request["created_at"])).total_seconds()
        )
        
    except Exception as e:
        logger.error(f"Evaluation processing error: {e}")
        
        # Send error notification
        await manager.send_personal_message({
            "type": "evaluation_error",
            "evaluation_id": evaluation_request["id"],
            "error": str(e)
        }, evaluation_request["user_id"])

# Get evaluation results
@app.get("/api/evaluations/{evaluation_id}")
async def get_evaluation_results(
    evaluation_id: str,
    current_user: dict = Depends(auth_manager.get_current_user)
):
    """Get evaluation results"""
    try:
        collections = get_collections(mongodb_manager.database)
        evaluation = await collections['evaluation_results'].get_evaluation(evaluation_id)
        
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        # Check if user has access
        if evaluation["user_id"] != current_user["id"] and current_user["role"] not in ["admin", "teacher"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return response_formatter.success(evaluation)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Dashboard endpoints
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(auth_manager.get_current_user)):
    """Get dashboard statistics"""
    try:
        collections = get_collections(mongodb_manager.database)
        
        if current_user["role"] == "student":
            stats = await collections['evaluation_results'].get_user_evaluations(
                current_user["id"], limit=100
            )
        else:
            stats = await collections['evaluation_results'].get_subject_statistics("all")
        
        return response_formatter.success(stats)
        
    except Exception as e:
        logger.error(f"Dashboard stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Model management endpoints
@app.get("/api/models/status")
async def get_model_status(current_user: dict = Depends(auth_manager.get_current_user)):
    """Get model status and performance"""
    try:
        if current_user["role"] not in ["admin", "teacher"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        status = await model_manager.get_model_status()
        return response_formatter.success(status)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Model status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/models/retrain")
async def trigger_model_retraining(
    background_tasks: BackgroundTasks,
    retrain_request: dict,
    current_user: dict = Depends(auth_manager.get_current_user)
):
    """Trigger model retraining"""
    try:
        if current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Add background task for retraining
        background_tasks.add_task(
            model_manager.retrain_models,
            retrain_request,
            current_user["id"]
        )
        
        return response_formatter.success({
            "message": "Model retraining initiated",
            "request_id": str(uuid.uuid4())
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Model retrain error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Data management endpoints
@app.get("/api/data/datasets")
async def get_datasets(current_user: dict = Depends(auth_manager.get_current_user)):
    """Get available datasets"""
    try:
        if current_user["role"] not in ["admin", "teacher"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        datasets = await data_manager.get_available_datasets()
        return response_formatter.success(datasets)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get datasets error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/data/download")
async def download_dataset(
    background_tasks: BackgroundTasks,
    download_request: dict,
    current_user: dict = Depends(auth_manager.get_current_user)
):
    """Download new datasets"""
    try:
        if current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Add background task for dataset download
        background_tasks.add_task(
            data_manager.download_datasets,
            download_request["datasets"],
            current_user["id"]
        )
        
        return response_formatter.success({
            "message": "Dataset download initiated",
            "datasets": download_request["datasets"]
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dataset download error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Feedback endpoints
@app.post("/api/evaluations/{evaluation_id}/feedback")
async def submit_feedback(
    evaluation_id: str,
    feedback_data: dict,
    current_user: dict = Depends(auth_manager.get_current_user)
):
    """Submit feedback on evaluation"""
    try:
        # Store feedback
        collections = get_collections(mongodb_manager.database)
        feedback_record = {
            "evaluation_id": evaluation_id,
            "user_id": current_user["id"],
            "feedback": feedback_data,
            "submitted_at": datetime.utcnow().isoformat()
        }
        
        await collections['user_feedback'].insert_one(feedback_record)
        
        # Add to continuous learning pipeline
        await learning_pipeline.add_feedback_data(feedback_record)
        
        return response_formatter.success({
            "message": "Feedback submitted successfully"
        })
        
    except Exception as e:
        logger.error(f"Feedback submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Export endpoints
@app.get("/api/evaluations/{evaluation_id}/export")
async def export_evaluation(
    evaluation_id: str,
    format: str = "pdf",
    current_user: dict = Depends(auth_manager.get_current_user)
):
    """Export evaluation results"""
    try:
        collections = get_collections(mongodb_manager.database)
        evaluation = await collections['evaluation_results'].get_evaluation(evaluation_id)
        
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        # Check access
        if evaluation["user_id"] != current_user["id"] and current_user["role"] not in ["admin", "teacher"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Generate export file
        export_file = await file_handler.export_evaluation(evaluation, format)
        
        return FileResponse(
            export_file,
            media_type="application/octet-stream",
            filename=f"evaluation_{evaluation_id}.{format}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info",
        access_log=True
    )
