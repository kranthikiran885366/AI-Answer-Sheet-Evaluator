from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/ai_evaluator")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200))
    role = Column(String(50), default="student")  # student, teacher, admin
    institution = Column(String(200))
    class_grade = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    evaluations = relationship("Evaluation", back_populates="user")
    questions = relationship("Question", back_populates="created_by_user")

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text)
    grade_level = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    questions = relationship("Question", back_populates="subject")
    evaluations = relationship("Evaluation", back_populates="subject")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(Text, nullable=False)
    model_answer = Column(Text, nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    max_marks = Column(Integer, nullable=False, default=10)
    difficulty_level = Column(String(20), default="medium")  # easy, medium, hard
    question_type = Column(String(50), default="descriptive")  # descriptive, mcq, numerical
    rubric = Column(JSON)  # Detailed scoring rubric
    keywords = Column(JSON)  # Important keywords for evaluation
    learning_objectives = Column(JSON)  # Learning objectives covered
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subject = relationship("Subject", back_populates="questions")
    created_by_user = relationship("User", back_populates="questions")
    evaluations = relationship("Evaluation", back_populates="question")

class Evaluation(Base):
    __tablename__ = "evaluations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    
    # Answer data
    student_answer = Column(Text, nullable=False)
    extracted_text = Column(Text)  # OCR extracted text
    image_path = Column(String(500))  # Path to uploaded image
    
    # Evaluation results
    score = Column(Float, nullable=False)
    max_score = Column(Float, nullable=False)
    percentage = Column(Float)
    grade = Column(String(5))
    
    # AI evaluation details
    evaluation_method = Column(String(100))  # Which AI model/method was used
    confidence_score = Column(Float)
    processing_time = Column(Float)  # Time taken for evaluation
    
    # Feedback
    detailed_feedback = Column(Text)
    points_covered = Column(JSON)
    points_missed = Column(JSON)
    improvement_suggestions = Column(Text)
    
    # Rubric breakdown
    rubric_scores = Column(JSON)
    
    # Quality assurance
    is_reviewed = Column(Boolean, default=False)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    review_comments = Column(Text)
    
    # Metadata
    exam_type = Column(String(100))  # quiz, midterm, final, etc.
    evaluation_mode = Column(String(50))  # auto, assisted, manual
    status = Column(String(50), default="completed")  # pending, processing, completed, failed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="evaluations", foreign_keys=[user_id])
    question = relationship("Question", back_populates="evaluations")
    subject = relationship("Subject", back_populates="evaluations")
    reviewer = relationship("User", foreign_keys=[reviewer_id])

class AIModel(Base):
    __tablename__ = "ai_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    model_type = Column(String(50))  # ocr, evaluation, feedback
    provider = Column(String(50))  # openai, google, local, etc.
    model_path = Column(String(500))
    configuration = Column(JSON)
    performance_metrics = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TrainingSession(Base):
    __tablename__ = "training_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ai_models.id"), nullable=False)
    dataset_name = Column(String(200))
    training_config = Column(JSON)
    
    # Training metrics
    initial_accuracy = Column(Float)
    final_accuracy = Column(Float)
    loss_history = Column(JSON)
    training_time = Column(Float)
    
    # Status
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    error_message = Column(Text)
    
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    model = relationship("AIModel")

class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    dataset_type = Column(String(50))  # training, validation, test
    subject = Column(String(100))
    file_path = Column(String(500))
    size = Column(Integer)  # Number of samples
    format = Column(String(50))  # csv, json, etc.
    metadata = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemMetrics(Base):
    __tablename__ = "system_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_type = Column(String(50))  # performance, accuracy, usage
    component = Column(String(100))  # ocr_agent, evaluation_agent, etc.
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
