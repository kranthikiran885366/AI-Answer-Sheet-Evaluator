from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from aiokafka.errors import KafkaError
import json
import logging
from typing import Dict, Any, List, Optional, Callable
import asyncio
from datetime import datetime
import os

logger = logging.getLogger(__name__)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_SECURITY_PROTOCOL = os.getenv("KAFKA_SECURITY_PROTOCOL", "PLAINTEXT")

class KafkaManager:
    def __init__(self):
        self.producer: AIOKafkaProducer = None
        self.consumers: Dict[str, AIOKafkaConsumer] = {}
        self.consumer_tasks: Dict[str, asyncio.Task] = {}
        
    async def initialize(self):
        """Initialize Kafka producer"""
        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                security_protocol=KAFKA_SECURITY_PROTOCOL,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                key_serializer=lambda k: k.encode('utf-8') if k else None,
                compression_type='gzip',
                acks='all',  # Wait for all replicas
                retries=3,
                max_in_flight_requests_per_connection=1,  # Ensure ordering
                enable_idempotence=True  # Prevent duplicates
            )
            
            await self.producer.start()
            logger.info("Kafka producer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Kafka producer: {e}")
            raise
    
    async def shutdown(self):
        """Shutdown Kafka connections"""
        try:
            # Stop all consumer tasks
            for task_name, task in self.consumer_tasks.items():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
                logger.info(f"Stopped consumer task: {task_name}")
            
            # Stop all consumers
            for consumer_name, consumer in self.consumers.items():
                await consumer.stop()
                logger.info(f"Stopped consumer: {consumer_name}")
            
            # Stop producer
            if self.producer:
                await self.producer.stop()
                logger.info("Kafka producer stopped")
                
        except Exception as e:
            logger.error(f"Error during Kafka shutdown: {e}")
    
    async def produce_message(self, topic: str, message: Dict[str, Any], 
                            key: str = None, partition: int = None) -> bool:
        """Produce message to Kafka topic"""
        try:
            if not self.producer:
                logger.error("Kafka producer not initialized")
                return False
            
            # Add metadata
            enriched_message = {
                'timestamp': datetime.utcnow().isoformat(),
                'producer_id': 'ai_evaluator',
                'data': message
            }
            
            # Send message
            future = await self.producer.send(
                topic=topic,
                value=enriched_message,
                key=key,
                partition=partition
            )
            
            # Get metadata
            record_metadata = await future
            logger.debug(f"Message sent to {record_metadata.topic}:{record_metadata.partition}:{record_metadata.offset}")
            
            return True
            
        except KafkaError as e:
            logger.error(f"Kafka error while producing message: {e}")
            return False
        except Exception as e:
            logger.error(f"Error producing message to {topic}: {e}")
            return False
    
    async def create_consumer(self, consumer_name: str, topics: List[str], 
                            group_id: str, message_handler: Callable) -> bool:
        """Create and start a Kafka consumer"""
        try:
            consumer = AIOKafkaConsumer(
                *topics,
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                security_protocol=KAFKA_SECURITY_PROTOCOL,
                group_id=group_id,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                key_deserializer=lambda k: k.decode('utf-8') if k else None,
                auto_offset_reset='latest',  # Start from latest messages
                enable_auto_commit=False,  # Manual commit for reliability
                max_poll_records=100,
                session_timeout_ms=30000,
                heartbeat_interval_ms=10000
            )
            
            await consumer.start()
            self.consumers[consumer_name] = consumer
            
            # Start consumer task
            task = asyncio.create_task(
                self._consume_messages(consumer_name, consumer, message_handler)
            )
            self.consumer_tasks[consumer_name] = task
            
            logger.info(f"Consumer {consumer_name} started for topics: {topics}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create consumer {consumer_name}: {e}")
            return False
    
    async def _consume_messages(self, consumer_name: str, consumer: AIOKafkaConsumer, 
                              message_handler: Callable):
        """Consume messages from Kafka"""
        try:
            async for message in consumer:
                try:
                    # Process message
                    await message_handler(message)
                    
                    # Commit offset
                    await consumer.commit()
                    
                except Exception as e:
                    logger.error(f"Error processing message in {consumer_name}: {e}")
                    # Continue processing other messages
                    
        except asyncio.CancelledError:
            logger.info(f"Consumer {consumer_name} cancelled")
        except Exception as e:
            logger.error(f"Consumer {consumer_name} error: {e}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform Kafka health check"""
        try:
            # Check producer
            producer_healthy = self.producer is not None and not self.producer._closed
            
            # Check consumers
            consumer_status = {}
            for name, consumer in self.consumers.items():
                consumer_status[name] = {
                    'running': not consumer._closed,
                    'subscribed_topics': list(consumer.subscription())
                }
            
            return {
                'status': 'healthy' if producer_healthy else 'unhealthy',
                'producer': {
                    'initialized': producer_healthy,
                    'bootstrap_servers': KAFKA_BOOTSTRAP_SERVERS
                },
                'consumers': consumer_status,
                'active_consumer_tasks': len(self.consumer_tasks)
            }
            
        except Exception as e:
            logger.error(f"Kafka health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e)
            }

# Event handlers for different message types
class EventHandlers:
    def __init__(self, mongodb_manager, redis_manager):
        self.mongodb = mongodb_manager
        self.redis = redis_manager
    
    async def handle_evaluation_request(self, message):
        """Handle evaluation request events"""
        try:
            data = message.value.get('data', {})
            
            # Log the request
            await self.mongodb.database.user_activity.insert_one({
                'user_id': data.get('user_id'),
                'activity_type': 'evaluation_request',
                'details': data,
                'timestamp': datetime.utcnow()
            })
            
            # Cache the request for processing
            request_id = data.get('request_id')
            if request_id:
                await self.redis.set_cache(
                    f"evaluation_request:{request_id}",
                    data,
                    expire=3600
                )
            
            logger.info(f"Processed evaluation request: {request_id}")
            
        except Exception as e:
            logger.error(f"Error handling evaluation request: {e}")
    
    async def handle_evaluation_result(self, message):
        """Handle evaluation result events"""
        try:
            data = message.value.get('data', {})
            
            # Store result in MongoDB
            collections = get_collections(self.mongodb.database)
            await collections['evaluation_results'].insert_evaluation(data)
            
            # Update user statistics in Redis
            user_id = data.get('user_id')
            if user_id:
                await self.redis.increment_counter(f"user_evaluations:{user_id}")
                
                # Update subject statistics
                subject = data.get('subject')
                if subject:
                    await self.redis.increment_counter(f"subject_evaluations:{subject}")
            
            # Publish real-time notification
            await self.redis.publish_message(
                f"user_notifications:{user_id}",
                {
                    'type': 'evaluation_completed',
                    'evaluation_id': data.get('evaluation_id'),
                    'score': data.get('score'),
                    'subject': data.get('subject')
                }
            )
            
            logger.info(f"Processed evaluation result for user: {user_id}")
            
        except Exception as e:
            logger.error(f"Error handling evaluation result: {e}")
    
    async def handle_model_training(self, message):
        """Handle model training events"""
        try:
            data = message.value.get('data', {})
            
            # Log training event
            await self.mongodb.database.model_performance.insert_one({
                'model_name': data.get('model_name'),
                'event_type': 'training_started',
                'details': data,
                'timestamp': datetime.utcnow()
            })
            
            # Update training status in Redis
            model_name = data.get('model_name')
            if model_name:
                await self.redis.set_cache(
                    f"training_status:{model_name}",
                    {
                        'status': 'in_progress',
                        'started_at': datetime.utcnow().isoformat(),
                        'details': data
                    },
                    expire=86400  # 24 hours
                )
            
            logger.info(f"Processed training event for model: {model_name}")
            
        except Exception as e:
            logger.error(f"Error handling model training event: {e}")
    
    async def handle_system_metrics(self, message):
        """Handle system metrics events"""
        try:
            data = message.value.get('data', {})
            
            # Store metrics in time-series format
            await self.mongodb.database.system_metrics.insert_one({
                'metric_name': data.get('metric_name'),
                'metric_value': data.get('metric_value'),
                'component': data.get('component'),
                'timestamp': datetime.utcnow(),
                'metadata': data.get('metadata', {})
            })
            
            # Update real-time metrics in Redis
            metric_key = f"metrics:{data.get('component')}:{data.get('metric_name')}"
            await self.redis.set_cache(metric_key, data.get('metric_value'), expire=300)
            
            logger.debug(f"Processed system metric: {data.get('metric_name')}")
            
        except Exception as e:
            logger.error(f"Error handling system metrics: {e}")

# Global Kafka manager instance
kafka_manager = KafkaManager()

# Topic definitions
TOPICS = {
    'EVALUATION_REQUESTS': 'ai_evaluator.evaluation.requests',
    'EVALUATION_RESULTS': 'ai_evaluator.evaluation.results',
    'OCR_REQUESTS': 'ai_evaluator.ocr.requests',
    'OCR_RESULTS': 'ai_evaluator.ocr.results',
    'MODEL_TRAINING': 'ai_evaluator.model.training',
    'SYSTEM_METRICS': 'ai_evaluator.system.metrics',
    'USER_ACTIVITY': 'ai_evaluator.user.activity',
    'NOTIFICATIONS': 'ai_evaluator.notifications'
}

# Convenience functions
async def publish_evaluation_request(request_data: Dict[str, Any]) -> bool:
    """Publish evaluation request"""
    return await kafka_manager.produce_message(
        TOPICS['EVALUATION_REQUESTS'],
        request_data,
        key=request_data.get('user_id')
    )

async def publish_evaluation_result(result_data: Dict[str, Any]) -> bool:
    """Publish evaluation result"""
    return await kafka_manager.produce_message(
        TOPICS['EVALUATION_RESULTS'],
        result_data,
        key=result_data.get('user_id')
    )

async def publish_system_metric(metric_data: Dict[str, Any]) -> bool:
    """Publish system metric"""
    return await kafka_manager.produce_message(
        TOPICS['SYSTEM_METRICS'],
        metric_data,
        key=metric_data.get('component')
    )

# Import helper for collections
def get_collections(db):
    from .mongodb_config import get_collections
    return get_collections(db)
