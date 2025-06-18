import redis.asyncio as redis
import json
import pickle
from typing import Any, Optional, Dict, List
import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
REDIS_DB = int(os.getenv("REDIS_DB", "0"))

class RedisManager:
    def __init__(self):
        self.redis_client: redis.Redis = None
        
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.from_url(
                REDIS_URL,
                db=REDIS_DB,
                decode_responses=False,  # We'll handle encoding ourselves
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # Test connection
            await self.redis_client.ping()
            logger.info("Connected to Redis successfully")
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Disconnected from Redis")
    
    # Caching operations
    async def set_cache(self, key: str, value: Any, expire: int = 3600) -> bool:
        """Set cache with expiration"""
        try:
            serialized_value = pickle.dumps(value)
            return await self.redis_client.setex(key, expire, serialized_value)
        except Exception as e:
            logger.error(f"Failed to set cache for key {key}: {e}")
            return False
    
    async def get_cache(self, key: str) -> Optional[Any]:
        """Get cached value"""
        try:
            value = await self.redis_client.get(key)
            if value:
                return pickle.loads(value)
            return None
        except Exception as e:
            logger.error(f"Failed to get cache for key {key}: {e}")
            return None
    
    async def delete_cache(self, key: str) -> bool:
        """Delete cached value"""
        try:
            return bool(await self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Failed to delete cache for key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        try:
            return bool(await self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Failed to check existence of key {key}: {e}")
            return False
    
    # Session management
    async def set_session(self, session_id: str, session_data: Dict[str, Any], 
                         expire: int = 86400) -> bool:
        """Set session data"""
        key = f"session:{session_id}"
        return await self.set_cache(key, session_data, expire)
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        key = f"session:{session_id}"
        return await self.get_cache(key)
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        key = f"session:{session_id}"
        return await self.delete_cache(key)
    
    # Rate limiting
    async def check_rate_limit(self, identifier: str, limit: int, window: int) -> Dict[str, Any]:
        """Check rate limit using sliding window"""
        key = f"rate_limit:{identifier}"
        now = datetime.utcnow().timestamp()
        
        try:
            # Remove old entries
            await self.redis_client.zremrangebyscore(key, 0, now - window)
            
            # Count current requests
            current_count = await self.redis_client.zcard(key)
            
            if current_count >= limit:
                # Get the oldest entry to calculate reset time
                oldest = await self.redis_client.zrange(key, 0, 0, withscores=True)
                reset_time = oldest[0][1] + window if oldest else now + window
                
                return {
                    'allowed': False,
                    'count': current_count,
                    'limit': limit,
                    'reset_time': reset_time,
                    'retry_after': reset_time - now
                }
            
            # Add current request
            await self.redis_client.zadd(key, {str(now): now})
            await self.redis_client.expire(key, window)
            
            return {
                'allowed': True,
                'count': current_count + 1,
                'limit': limit,
                'reset_time': now + window,
                'retry_after': 0
            }
            
        except Exception as e:
            logger.error(f"Rate limit check failed for {identifier}: {e}")
            # Allow request on error
            return {
                'allowed': True,
                'count': 0,
                'limit': limit,
                'reset_time': now + window,
                'retry_after': 0
            }
    
    # Task queue operations
    async def enqueue_task(self, queue_name: str, task_data: Dict[str, Any], 
                          priority: int = 1) -> bool:
        """Enqueue task with priority"""
        try:
            task_json = json.dumps({
                'id': task_data.get('id', str(datetime.utcnow().timestamp())),
                'data': task_data,
                'created_at': datetime.utcnow().isoformat(),
                'priority': priority
            })
            
            # Use sorted set for priority queue
            score = -priority  # Negative for descending order (higher priority first)
            return bool(await self.redis_client.zadd(f"queue:{queue_name}", {task_json: score}))
            
        except Exception as e:
            logger.error(f"Failed to enqueue task to {queue_name}: {e}")
            return False
    
    async def dequeue_task(self, queue_name: str) -> Optional[Dict[str, Any]]:
        """Dequeue highest priority task"""
        try:
            # Get highest priority task (lowest score due to negative priority)
            result = await self.redis_client.zpopmin(f"queue:{queue_name}")
            
            if result:
                task_json, score = result[0]
                return json.loads(task_json)
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to dequeue task from {queue_name}: {e}")
            return None
    
    async def get_queue_size(self, queue_name: str) -> int:
        """Get queue size"""
        try:
            return await self.redis_client.zcard(f"queue:{queue_name}")
        except Exception as e:
            logger.error(f"Failed to get queue size for {queue_name}: {e}")
            return 0
    
    # Real-time features
    async def publish_message(self, channel: str, message: Dict[str, Any]) -> int:
        """Publish message to channel"""
        try:
            message_json = json.dumps({
                'timestamp': datetime.utcnow().isoformat(),
                'data': message
            })
            return await self.redis_client.publish(channel, message_json)
        except Exception as e:
            logger.error(f"Failed to publish message to {channel}: {e}")
            return 0
    
    async def subscribe_channel(self, channel: str):
        """Subscribe to channel"""
        try:
            pubsub = self.redis_client.pubsub()
            await pubsub.subscribe(channel)
            return pubsub
        except Exception as e:
            logger.error(f"Failed to subscribe to {channel}: {e}")
            return None
    
    # Metrics and monitoring
    async def increment_counter(self, key: str, amount: int = 1, expire: int = None) -> int:
        """Increment counter"""
        try:
            result = await self.redis_client.incrby(key, amount)
            if expire:
                await self.redis_client.expire(key, expire)
            return result
        except Exception as e:
            logger.error(f"Failed to increment counter {key}: {e}")
            return 0
    
    async def get_counter(self, key: str) -> int:
        """Get counter value"""
        try:
            value = await self.redis_client.get(key)
            return int(value) if value else 0
        except Exception as e:
            logger.error(f"Failed to get counter {key}: {e}")
            return 0
    
    # Distributed locks
    async def acquire_lock(self, lock_name: str, timeout: int = 10, 
                          blocking_timeout: int = 5) -> Optional[str]:
        """Acquire distributed lock"""
        try:
            import uuid
            lock_id = str(uuid.uuid4())
            key = f"lock:{lock_name}"
            
            # Try to acquire lock
            if await self.redis_client.set(key, lock_id, nx=True, ex=timeout):
                return lock_id
            
            # Wait for lock if blocking
            if blocking_timeout > 0:
                import asyncio
                start_time = datetime.utcnow()
                
                while (datetime.utcnow() - start_time).seconds < blocking_timeout:
                    await asyncio.sleep(0.1)
                    if await self.redis_client.set(key, lock_id, nx=True, ex=timeout):
                        return lock_id
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to acquire lock {lock_name}: {e}")
            return None
    
    async def release_lock(self, lock_name: str, lock_id: str) -> bool:
        """Release distributed lock"""
        try:
            key = f"lock:{lock_name}"
            
            # Lua script to ensure we only release our own lock
            lua_script = """
            if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end
            """
            
            result = await self.redis_client.eval(lua_script, 1, key, lock_id)
            return bool(result)
            
        except Exception as e:
            logger.error(f"Failed to release lock {lock_name}: {e}")
            return False
    
    # Health check
    async def health_check(self) -> Dict[str, Any]:
        """Perform Redis health check"""
        try:
            start_time = datetime.utcnow()
            await self.redis_client.ping()
            response_time = (datetime.utcnow() - start_time).total_seconds()
            
            info = await self.redis_client.info()
            
            return {
                'status': 'healthy',
                'response_time': response_time,
                'connected_clients': info.get('connected_clients', 0),
                'used_memory': info.get('used_memory_human', '0B'),
                'uptime': info.get('uptime_in_seconds', 0)
            }
            
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e)
            }

# Global Redis manager instance
redis_manager = RedisManager()

# Convenience functions
async def get_redis() -> RedisManager:
    """Get Redis manager instance"""
    return redis_manager

# Cache decorators
def cache_result(key_prefix: str, expire: int = 3600):
    """Decorator to cache function results"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key
            import hashlib
            key_data = f"{key_prefix}:{str(args)}:{str(kwargs)}"
            cache_key = hashlib.md5(key_data.encode()).hexdigest()
            
            # Try to get from cache
            cached_result = await redis_manager.get_cache(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await redis_manager.set_cache(cache_key, result, expire)
            
            return result
        return wrapper
    return decorator
