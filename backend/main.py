import asyncio
import logging
import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, List, Optional, Any
import json
import uuid
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import redis
from motor.motor_asyncio import AsyncIOMotorClient
import aiofiles
import numpy as np
from PIL import Image
import cv2
import pytesseract
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
import openai
from anthropic import Anthropic
import google.generativeai as genai
from kafka import KafkaProducer, KafkaConsumer
import boto3
from azure.storage.blob import BlobServiceClient
from google.cloud import storage as gcs
import prometheus_client
from prometheus_client import Counter, Histogram, Gauge
import structlog
from celery import Celery
import websockets
from websockets.exceptions import ConnectionClosed
import jwt
from passlib.context import CryptContext
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import schedule
import time
from concurrent.futures import ThreadPoolExecutor
import multiprocessing as mp
from dataclasses import dataclass
from enum import Enum
import hashlib
import base64
from cryptography.fernet import Fernet

# Import custom agents and modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from agents.agent_orchestrator import AgentOrchestrator
from agents.ocr_agent import OCRAgent
from agents.evaluation_agent import EvaluationAgent
from agents.handwriting_agent import HandwritingAgent
from ml_models.advanced_model_manager import AdvancedModelManager
from ml_models.training_pipeline import TrainingPipeline
from ml_models.inference_engine import InferenceEngine
from databases.mongodb_config import MongoDBConfig
from databases.redis_config import RedisConfig
from databases.sql_config import SQLConfig
from databases.kafka_config import KafkaConfig
from continuous_learning.continuous_trainer import ContinuousTrainer
from continuous_learning.learning_pipeline import LearningPipeline
from ai_agents.agent_manager import AIAgentManager
from data_pipeline.data_manager import DataManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = structlog.get_logger()

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Gauge('websocket_connections_active', 'Active WebSocket connections')
EVALUATION_COUNT = Counter('evaluations_total', 'Total evaluations processed')
OCR_PROCESSING_TIME = Histogram('ocr_processing_seconds', 'OCR processing time')
AI_MODEL_ACCURACY = Gauge('ai_model_accuracy', 'AI model accuracy', ['model_name'])

# Database models
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="student")
    institution = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    preferences = Column(JSON)

class EvaluationSession(Base):
    __tablename__ = "evaluation_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    user_id = Column(Integer)
    filename = Column(String)
    file_path = Column(String)
    status = Column(String, default="pending")
    ocr_result = Column(Text)
    evaluation_result = Column(JSON)
    accuracy_score = Column(Float)
    processing_time = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    metadata = Column(JSON)

class SystemMetrics(Base):
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String, index=True)
    metric_value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"
    institution: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    institution: Optional[str]
    is_active: bool
    created_at: datetime

class EvaluationRequest(BaseModel):
    subject: str
    grade_level: str
    rubric_id: Optional[str] = None
    custom_rubric: Optional[Dict] = None
    evaluation_type: str = "comprehensive"
    language: str = "en"

class EvaluationResponse(BaseModel):
    session_id: str
    status: str
    ocr_text: Optional[str] = None
    evaluation_result: Optional[Dict] = None
    accuracy_score: Optional[float] = None
    processing_time: Optional[float] = None
    feedback: Optional[str] = None
    suggestions: Optional[List[str]] = None

class SystemStatus(BaseModel):
    status: str
    uptime: float
    active_users: int
    total_evaluations: int
    system_load: Dict[str, float]
    ai_models_status: Dict[str, str]
    database_status: Dict[str, str]

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id:
            self.user_connections[user_id] = websocket
        ACTIVE_CONNECTIONS.set(len(self.active_connections))
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id and user_id in self.user_connections:
            del self.user_connections[user_id]
        ACTIVE_CONNECTIONS.set(len(self.active_connections))
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")

    async def send_to_user(self, message: str, user_id: str):
        if user_id in self.user_connections:
            try:
                await self.user_connections[user_id].send_text(message)
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for conn in disconnected:
            self.disconnect(conn)

# Global instances
manager = ConnectionManager()
agent_orchestrator = None
model_manager = None
training_pipeline = None
inference_engine = None
continuous_trainer = None
ai_agent_manager = None
data_manager = None

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Database setup
def get_database():
    database_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/evalai")
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal

def get_db():
    db = get_database()()
    try:
        yield db
    finally:
        db.close()

# Application lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global agent_orchestrator, model_manager, training_pipeline, inference_engine
    global continuous_trainer, ai_agent_manager, data_manager
    
    logger.info("Starting EvalAI Pro backend...")
    
    try:
        # Initialize core components
        agent_orchestrator = AgentOrchestrator()
        model_manager = AdvancedModelManager()
        training_pipeline = TrainingPipeline()
        inference_engine = InferenceEngine()
        continuous_trainer = ContinuousTrainer()
        ai_agent_manager = AIAgentManager()
        data_manager = DataManager()
        
        # Initialize databases
        mongodb_config = MongoDBConfig()
        redis_config = RedisConfig()
        sql_config = SQLConfig()
        kafka_config = KafkaConfig()
        
        await mongodb_config.connect()
        await redis_config.connect()
        await sql_config.connect()
        await kafka_config.connect()
        
        # Load AI models
        await model_manager.load_models()
        
        # Start background tasks
        asyncio.create_task(background_tasks())
        asyncio.create_task(system_monitoring())
        asyncio.create_task(continuous_learning_task())
        
        logger.info("EvalAI Pro backend started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start backend: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down EvalAI Pro backend...")
    
    try:
        # Cleanup resources
        if agent_orchestrator:
            await agent_orchestrator.cleanup()
        if model_manager:
            await model_manager.cleanup()
        if continuous_trainer:
            await continuous_trainer.stop()
        
        logger.info("EvalAI Pro backend shutdown complete")
        
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

# Create FastAPI app
app = FastAPI(
    title="EvalAI Pro API",
    description="Advanced AI-powered answer sheet evaluation system",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Background tasks
async def background_tasks():
    """Background tasks for system maintenance"""
    while True:
        try:
            # System health checks
            await perform_health_checks()
            
            # Cleanup old files
            await cleanup_old_files()
            
            # Update metrics
            await update_system_metrics()
            
            await asyncio.sleep(300)  # Run every 5 minutes
            
        except Exception as e:
            logger.error(f"Background task error: {e}")
            await asyncio.sleep(60)

async def system_monitoring():
    """System monitoring and alerting"""
    while True:
        try:
            # Monitor system resources
            cpu_usage = await get_cpu_usage()
            memory_usage = await get_memory_usage()
            disk_usage = await get_disk_usage()
            
            # Send alerts if thresholds exceeded
            if cpu_usage > 80:
                await send_alert("High CPU usage detected", f"CPU usage: {cpu_usage}%")
            
            if memory_usage > 85:
                await send_alert("High memory usage detected", f"Memory usage: {memory_usage}%")
            
            if disk_usage > 90:
                await send_alert("High disk usage detected", f"Disk usage: {disk_usage}%")
            
            await asyncio.sleep(60)  # Check every minute
            
        except Exception as e:
            logger.error(f"System monitoring error: {e}")
            await asyncio.sleep(60)

async def continuous_learning_task():
    """Continuous learning and model improvement"""
    while True:
        try:
            if continuous_trainer:
                await continuous_trainer.run_training_cycle()
            
            await asyncio.sleep(3600)  # Run every hour
            
        except Exception as e:
            logger.error(f"Continuous learning error: {e}")
            await asyncio.sleep(3600)

# Helper functions
async def perform_health_checks():
    """Perform system health checks"""
    try:
        # Check database connections
        # Check AI model status
        # Check external service connectivity
        pass
    except Exception as e:
        logger.error(f"Health check failed: {e}")

async def cleanup_old_files():
    """Clean up old uploaded files and temporary data"""
    try:
        # Remove files older than 30 days
        # Clean temporary processing files
        # Archive old evaluation results
        pass
    except Exception as e:
        logger.error(f"File cleanup failed: {e}")

async def update_system_metrics():
    """Update system performance metrics"""
    try:
        # Update Prometheus metrics
        # Store metrics in database
        pass
    except Exception as e:
        logger.error(f"Metrics update failed: {e}")

async def get_cpu_usage():
    """Get current CPU usage percentage"""
    # Implementation would use psutil or similar
    return 45.0

async def get_memory_usage():
    """Get current memory usage percentage"""
    # Implementation would use psutil or similar
    return 62.0

async def get_disk_usage():
    """Get current disk usage percentage"""
    # Implementation would use psutil or similar
    return 38.0

async def send_alert(title: str, message: str):
    """Send system alert to administrators"""
    try:
        # Send email alert
        # Send WebSocket notification
        # Log alert
        alert_data = {
            "type": "system_alert",
            "title": title,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "severity": "warning"
        }
        await manager.broadcast(json.dumps(alert_data))
        logger.warning(f"Alert sent: {title} - {message}")
    except Exception as e:
        logger.error(f"Failed to send alert: {e}")

# API Routes

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "EvalAI Pro API v3.0.0",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "3.0.0",
        "uptime": time.time() - app.state.start_time if hasattr(app.state, 'start_time') else 0
    }

@app.get("/status", response_model=SystemStatus)
async def get_system_status():
    """Get comprehensive system status"""
    try:
        return SystemStatus(
            status="operational",
            uptime=time.time() - app.state.start_time if hasattr(app.state, 'start_time') else 0,
            active_users=len(manager.user_connections),
            total_evaluations=1000,  # Get from database
            system_load={
                "cpu": await get_cpu_usage(),
                "memory": await get_memory_usage(),
                "disk": await get_disk_usage()
            },
            ai_models_status={
                "gpt-4": "active",
                "claude-3": "active",
                "ocr-engine": "active"
            },
            database_status={
                "postgresql": "connected",
                "mongodb": "connected",
                "redis": "connected"
            }
        )
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get system status")

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    evaluation_request: str = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: str = Depends(get_current_user)
):
    """Upload and process answer sheet"""
    try:
        REQUEST_COUNT.labels(method="POST", endpoint="/upload").inc()
        
        # Validate file
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.pdf')):
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Generate session ID
        session_id = str(uuid.uuid4())
        
        # Save uploaded file
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        file_path = upload_dir / f"{session_id}_{file.filename}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Parse evaluation request
        eval_req = None
        if evaluation_request:
            eval_req = EvaluationRequest.parse_raw(evaluation_request)
        
        # Start background processing
        background_tasks.add_task(
            process_evaluation,
            session_id,
            str(file_path),
            file.filename,
            eval_req,
            current_user
        )
        
        # Send WebSocket notification
        await manager.send_to_user(
            json.dumps({
                "type": "upload_started",
                "session_id": session_id,
                "filename": file.filename,
                "status": "processing"
            }),
            current_user
        )
        
        return {
            "session_id": session_id,
            "filename": file.filename,
            "status": "uploaded",
            "message": "File uploaded successfully. Processing started."
        }
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def process_evaluation(
    session_id: str,
    file_path: str,
    filename: str,
    eval_request: Optional[EvaluationRequest],
    user_id: str
):
    """Process evaluation in background"""
    start_time = time.time()
    
    try:
        # Update status
        await manager.send_to_user(
            json.dumps({
                "type": "processing_started",
                "session_id": session_id,
                "status": "ocr_processing"
            }),
            user_id
        )
        
        # OCR Processing
        ocr_start = time.time()
        ocr_agent = OCRAgent()
        ocr_result = await ocr_agent.process_image(file_path)
        ocr_time = time.time() - ocr_start
        
        OCR_PROCESSING_TIME.observe(ocr_time)
        
        await manager.send_to_user(
            json.dumps({
                "type": "ocr_complete",
                "session_id": session_id,
                "status": "ai_evaluation",
                "ocr_text": ocr_result.get("text", "")
            }),
            user_id
        )
        
        # AI Evaluation
        evaluation_agent = EvaluationAgent()
        evaluation_result = await evaluation_agent.evaluate_answer(
            ocr_result.get("text", ""),
            eval_request.dict() if eval_request else {}
        )
        
        # Calculate processing time
        total_time = time.time() - start_time
        
        # Store results in database
        # Implementation would store in database
        
        # Send completion notification
        await manager.send_to_user(
            json.dumps({
                "type": "evaluation_complete",
                "session_id": session_id,
                "filename": filename,
                "status": "completed",
                "processing_time": total_time,
                "accuracy_score": evaluation_result.get("accuracy_score", 0),
                "evaluation_result": evaluation_result
            }),
            user_id
        )
        
        EVALUATION_COUNT.inc()
        
    except Exception as e:
        logger.error(f"Processing error for session {session_id}: {e}")
        
        await manager.send_to_user(
            json.dumps({
                "type": "processing_error",
                "session_id": session_id,
                "status": "error",
                "error": str(e)
            }),
            user_id
        )

@app.get("/evaluation/{session_id}", response_model=EvaluationResponse)
async def get_evaluation_result(
    session_id: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get evaluation result by session ID"""
    try:
        # Get from database
        evaluation = db.query(EvaluationSession).filter(
            EvaluationSession.session_id == session_id
        ).first()
        
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        return EvaluationResponse(
            session_id=evaluation.session_id,
            status=evaluation.status,
            ocr_text=evaluation.ocr_result,
            evaluation_result=evaluation.evaluation_result,
            accuracy_score=evaluation.accuracy_score,
            processing_time=evaluation.processing_time
        )
        
    except Exception as e:
        logger.error(f"Error getting evaluation result: {e}")
        raise HTTPException(status_code=500, detail="Failed to get evaluation result")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    user_id = None
    try:
        await manager.connect(websocket)
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "auth":
                # Authenticate user
                token = message.get("token")
                if token:
                    try:
                        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                        user_id = payload.get("sub")
                        manager.user_connections[user_id] = websocket
                        
                        await websocket.send_text(json.dumps({
                            "type": "auth_success",
                            "user_id": user_id
                        }))
                    except jwt.PyJWTError:
                        await websocket.send_text(json.dumps({
                            "type": "auth_error",
                            "message": "Invalid token"
                        }))
            
            elif message.get("type") == "ping":
                await websocket.send_text(json.dumps({
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }))
            
            else:
                # Handle other message types
                await websocket.send_text(json.dumps({
                    "type": "message_received",
                    "original_message": message
                }))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)

@app.get("/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return Response(
        prometheus_client.generate_latest(),
        media_type="text/plain"
    )

# Additional API endpoints would be added here...
# - User management
# - Rubric management
# - Analytics endpoints
# - AI model management
# - System administration

if __name__ == "__main__":
    # Set start time
    app.state.start_time = time.time()
    
    # Create necessary directories
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    os.makedirs("static", exist_ok=True)
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )
