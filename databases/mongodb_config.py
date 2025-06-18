from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "ai_evaluator")

class MongoDBManager:
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.database = None
        
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(MONGODB_URL)
            self.database = self.client[DATABASE_NAME]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
            
            # Create indexes
            await self._create_indexes()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    async def _create_indexes(self):
        """Create necessary indexes"""
        try:
            # Evaluation results indexes
            await self.database.evaluation_results.create_index([("user_id", 1), ("created_at", -1)])
            await self.database.evaluation_results.create_index([("question_id", 1)])
            await self.database.evaluation_results.create_index([("subject", 1)])
            
            # OCR results indexes
            await self.database.ocr_results.create_index([("image_hash", 1)])
            await self.database.ocr_results.create_index([("created_at", -1)])
            
            # Training data indexes
            await self.database.training_data.create_index([("subject", 1), ("question_type", 1)])
            await self.database.training_data.create_index([("created_at", -1)])
            
            # Model performance indexes
            await self.database.model_performance.create_index([("model_name", 1), ("timestamp", -1)])
            
            # User activity indexes
            await self.database.user_activity.create_index([("user_id", 1), ("timestamp", -1)])
            
            logger.info("MongoDB indexes created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create MongoDB indexes: {e}")

# Collections schemas and operations
class EvaluationResultsCollection:
    def __init__(self, db):
        self.collection = db.evaluation_results
    
    async def insert_evaluation(self, evaluation_data: Dict[str, Any]) -> str:
        """Insert evaluation result"""
        evaluation_data['created_at'] = datetime.utcnow()
        evaluation_data['updated_at'] = datetime.utcnow()
        
        result = await self.collection.insert_one(evaluation_data)
        return str(result.inserted_id)
    
    async def get_evaluation(self, evaluation_id: str) -> Optional[Dict[str, Any]]:
        """Get evaluation by ID"""
        from bson import ObjectId
        return await self.collection.find_one({"_id": ObjectId(evaluation_id)})
    
    async def get_user_evaluations(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get evaluations for a user"""
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_subject_statistics(self, subject: str) -> Dict[str, Any]:
        """Get statistics for a subject"""
        pipeline = [
            {"$match": {"subject": subject}},
            {"$group": {
                "_id": None,
                "total_evaluations": {"$sum": 1},
                "average_score": {"$avg": "$score"},
                "average_percentage": {"$avg": "$percentage"},
                "score_distribution": {
                    "$push": {
                        "score": "$score",
                        "percentage": "$percentage",
                        "grade": "$grade"
                    }
                }
            }}
        ]
        
        result = await self.collection.aggregate(pipeline).to_list(length=1)
        return result[0] if result else {}

class OCRResultsCollection:
    def __init__(self, db):
        self.collection = db.ocr_results
    
    async def insert_ocr_result(self, ocr_data: Dict[str, Any]) -> str:
        """Insert OCR result"""
        ocr_data['created_at'] = datetime.utcnow()
        
        result = await self.collection.insert_one(ocr_data)
        return str(result.inserted_id)
    
    async def get_ocr_result(self, image_hash: str) -> Optional[Dict[str, Any]]:
        """Get OCR result by image hash"""
        return await self.collection.find_one({"image_hash": image_hash})
    
    async def get_recent_ocr_results(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent OCR results"""
        cursor = self.collection.find().sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

class TrainingDataCollection:
    def __init__(self, db):
        self.collection = db.training_data
    
    async def insert_training_sample(self, sample_data: Dict[str, Any]) -> str:
        """Insert training sample"""
        sample_data['created_at'] = datetime.utcnow()
        
        result = await self.collection.insert_one(sample_data)
        return str(result.inserted_id)
    
    async def get_training_data(self, subject: str = None, question_type: str = None, 
                              limit: int = 1000) -> List[Dict[str, Any]]:
        """Get training data with filters"""
        query = {}
        if subject:
            query['subject'] = subject
        if question_type:
            query['question_type'] = question_type
        
        cursor = self.collection.find(query).limit(limit)
        return await cursor.to_list(length=limit)
    
    async def get_training_statistics(self) -> Dict[str, Any]:
        """Get training data statistics"""
        pipeline = [
            {"$group": {
                "_id": {
                    "subject": "$subject",
                    "question_type": "$question_type"
                },
                "count": {"$sum": 1},
                "avg_score": {"$avg": "$human_score"}
            }},
            {"$group": {
                "_id": None,
                "total_samples": {"$sum": "$count"},
                "by_subject": {
                    "$push": {
                        "subject": "$_id.subject",
                        "question_type": "$_id.question_type",
                        "count": "$count",
                        "avg_score": "$avg_score"
                    }
                }
            }}
        ]
        
        result = await self.collection.aggregate(pipeline).to_list(length=1)
        return result[0] if result else {}

class ModelPerformanceCollection:
    def __init__(self, db):
        self.collection = db.model_performance
    
    async def insert_performance_metric(self, metric_data: Dict[str, Any]) -> str:
        """Insert model performance metric"""
        metric_data['timestamp'] = datetime.utcnow()
        
        result = await self.collection.insert_one(metric_data)
        return str(result.inserted_id)
    
    async def get_model_performance(self, model_name: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get model performance over time"""
        from datetime import timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        cursor = self.collection.find({
            "model_name": model_name,
            "timestamp": {"$gte": start_date}
        }).sort("timestamp", -1)
        
        return await cursor.to_list(length=None)
    
    async def get_performance_comparison(self) -> Dict[str, Any]:
        """Compare performance across models"""
        pipeline = [
            {"$group": {
                "_id": "$model_name",
                "avg_accuracy": {"$avg": "$accuracy"},
                "avg_processing_time": {"$avg": "$processing_time"},
                "total_evaluations": {"$sum": "$evaluation_count"},
                "latest_update": {"$max": "$timestamp"}
            }},
            {"$sort": {"avg_accuracy": -1}}
        ]
        
        result = await self.collection.aggregate(pipeline).to_list(length=None)
        return {"models": result}

class UserActivityCollection:
    def __init__(self, db):
        self.collection = db.user_activity
    
    async def log_activity(self, activity_data: Dict[str, Any]) -> str:
        """Log user activity"""
        activity_data['timestamp'] = datetime.utcnow()
        
        result = await self.collection.insert_one(activity_data)
        return str(result.inserted_id)
    
    async def get_user_activity(self, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Get user activity"""
        from datetime import timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        cursor = self.collection.find({
            "user_id": user_id,
            "timestamp": {"$gte": start_date}
        }).sort("timestamp", -1)
        
        return await cursor.to_list(length=None)
    
    async def get_activity_statistics(self, days: int = 30) -> Dict[str, Any]:
        """Get activity statistics"""
        from datetime import timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        pipeline = [
            {"$match": {"timestamp": {"$gte": start_date}}},
            {"$group": {
                "_id": {
                    "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "activity_type": "$activity_type"
                },
                "count": {"$sum": 1}
            }},
            {"$group": {
                "_id": "$_id.date",
                "activities": {
                    "$push": {
                        "type": "$_id.activity_type",
                        "count": "$count"
                    }
                },
                "total": {"$sum": "$count"}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        result = await self.collection.aggregate(pipeline).to_list(length=None)
        return {"daily_activity": result}

# Global MongoDB manager instance
mongodb_manager = MongoDBManager()

# Collection instances
def get_collections(db):
    return {
        'evaluation_results': EvaluationResultsCollection(db),
        'ocr_results': OCRResultsCollection(db),
        'training_data': TrainingDataCollection(db),
        'model_performance': ModelPerformanceCollection(db),
        'user_activity': UserActivityCollection(db)
    }
