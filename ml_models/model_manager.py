import asyncio
import logging
from typing import Dict, Any, List, Optional
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel, AutoConfig, Trainer, TrainingArguments
from datasets import Dataset, DatasetDict
import numpy as np
import pandas as pd
from pathlib import Path
import json
from datetime import datetime, timedelta
import pickle
import wandb
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
import optuna
from torch.utils.data import DataLoader
import mlflow
import mlflow.pytorch
from huggingface_hub import HfApi, Repository
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

class ModelManager:
    """Manages AI models for answer sheet evaluation"""
    
    def __init__(self, models_path: str = "models"):
        self.models_path = Path(models_path)
        self.models_registry = {}
        self.active_models = {}
        self.training_queue = asyncio.Queue()
        self.is_running = False
        
        # Model configurations
        self.model_configs = {
            "ocr_model": {
                "base_model": "microsoft/trocr-base-handwritten",
                "task": "ocr",
                "subjects": ["general"],
                "priority": 1
            },
            "evaluation_model": {
                "base_model": "bert-base-uncased",
                "task": "evaluation",
                "subjects": ["general"],
                "priority": 1
            },
            "math_evaluation_model": {
                "base_model": "microsoft/DialoGPT-medium",
                "task": "evaluation",
                "subjects": ["mathematics"],
                "priority": 2
            },
            "science_evaluation_model": {
                "base_model": "allenai/scibert_scivocab_uncased",
                "task": "evaluation", 
                "subjects": ["physics", "chemistry", "biology"],
                "priority": 2
            },
            "english_evaluation_model": {
                "base_model": "roberta-base",
                "task": "evaluation",
                "subjects": ["english"],
                "priority": 2
            },
            "feedback_model": {
                "base_model": "facebook/bart-large",
                "task": "feedback_generation",
                "subjects": ["general"],
                "priority": 2
            },
            "plagiarism_model": {
                "base_model": "sentence-transformers/all-MiniLM-L6-v2",
                "task": "plagiarism_detection",
                "subjects": ["general"],
                "priority": 2
            }
        }
        
        # Cloud storage configuration
        self.s3_client = None
        self.model_bucket = "ai-evaluator-models"
        
        # Experiment tracking
        self.mlflow_tracking_uri = "http://localhost:5000"
        self.wandb_project = "ai-answer-evaluator"
        
        # Create directory structure
        self._create_directory_structure()
        
        # Load existing registry
        self._load_models_registry()
    
    def _create_directory_structure(self):
        """Create model directory structure"""
        directories = [
            "checkpoints",        # Model checkpoints
            "fine_tuned",        # Fine-tuned models
            "experiments",       # Experiment results
            "evaluations",       # Model evaluations
            "deployments",       # Deployed models
            "backups",          # Model backups
            "metadata",         # Model metadata
            "logs",             # Training logs
            "hyperparameters",  # Hyperparameter tuning results
            "benchmarks"        # Benchmark results
        ]
        
        for directory in directories:
            (self.models_path / directory).mkdir(parents=True, exist_ok=True)
    
    def _load_models_registry(self):
        """Load models registry"""
        registry_file = self.models_path / "metadata" / "models_registry.json"
        if registry_file.exists():
            with open(registry_file, 'r') as f:
                self.models_registry = json.load(f)
        else:
            self.models_registry = {}
    
    def _save_models_registry(self):
        """Save models registry"""
        registry_file = self.models_path / "metadata" / "models_registry.json"
        with open(registry_file, 'w') as f:
            json.dump(self.models_registry, f, indent=2, default=str)
    
    async def initialize(self):
        """Initialize model manager"""
        try:
            logger.info("Initializing Model Manager...")
            
            # Initialize cloud storage
            await self._initialize_cloud_storage()
            
            # Initialize experiment tracking
            await self._initialize_experiment_tracking()
            
            # Load existing models
            await self._load_existing_models()
            
            # Start background workers
            self.is_running = True
            asyncio.create_task(self._training_worker())
            asyncio.create_task(self._model_monitoring_worker())
            
            # Download and initialize base models
            await self._initialize_base_models()
            
            logger.info("Model Manager initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Model Manager: {e}")
            raise
    
    async def _initialize_cloud_storage(self):
        """Initialize cloud storage for models"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                region_name=os.getenv("AWS_REGION", "us-east-1")
            )
            
            # Create bucket if it doesn't exist
            try:
                self.s3_client.head_bucket(Bucket=self.model_bucket)
            except ClientError:
                self.s3_client.create_bucket(Bucket=self.model_bucket)
            
            logger.info("Cloud storage initialized")
            
        except Exception as e:
            logger.warning(f"Cloud storage initialization failed: {e}")
    
    async def _initialize_experiment_tracking(self):
        """Initialize experiment tracking"""
        try:
            # Initialize MLflow
            mlflow.set_tracking_uri(self.mlflow_tracking_uri)
            
            # Initialize Weights & Biases
            if os.getenv("WANDB_API_KEY"):
                wandb.login(key=os.getenv("WANDB_API_KEY"))
            
            logger.info("Experiment tracking initialized")
            
        except Exception as e:
            logger.warning(f"Experiment tracking initialization failed: {e}")
    
    async def _load_existing_models(self):
        """Load existing models from registry"""
        try:
            for model_name, model_info in self.models_registry.items():
                if model_info.get("status") == "deployed":
                    await self._load_model(model_name, model_info)
        except Exception as e:
            logger.error(f"Failed to load existing models: {e}")
    
    async def _initialize_base_models(self):
        """Initialize base models"""
        try:
            for model_name, config in self.model_configs.items():
                if model_name not in self.models_registry:
                    await self._download_base_model(model_name, config)
        except Exception as e:
            logger.error(f"Failed to initialize base models: {e}")
    
    async def _download_base_model(self, model_name: str, config: Dict[str, Any]):
        """Download base model"""
        try:
            logger.info(f"Downloading base model: {model_name}")
            
            base_model = config["base_model"]
            model_path = self.models_path / "checkpoints" / model_name
            model_path.mkdir(exist_ok=True)
            
            # Download tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained(base_model)
            model = AutoModel.from_pretrained(base_model)
            
            # Save locally
            tokenizer.save_pretrained(str(model_path))
            model.save_pretrained(str(model_path))
            
            # Update registry
            self.models_registry[model_name] = {
                "name": model_name,
                "base_model": base_model,
                "task": config["task"],
                "subjects": config["subjects"],
                "status": "downloaded",
                "path": str(model_path),
                "downloaded_at": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "performance_metrics": {}
            }
            
            self._save_models_registry()
            
            logger.info(f"Successfully downloaded base model: {model_name}")
            
        except Exception as e:
            logger.error(f"Failed to download base model {model_name}: {e}")
    
    async def _training_worker(self):
        """Background worker for model training"""
        while self.is_running:
            try:
                training_job = await self.training_queue.get()
                await self._train_model(training_job)
                self.training_queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Training worker error: {e}")
                await asyncio.sleep(60)
    
    async def _model_monitoring_worker(self):
        """Background worker for model monitoring"""
        while self.is_running:
            try:
                await self._monitor_model_performance()
                await asyncio.sleep(3600)  # Check every hour
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Model monitoring error: {e}")
                await asyncio.sleep(300)
    
    async def _train_model(self, training_job: Dict[str, Any]):
        """Train a model"""
        try:
            model_name = training_job["model_name"]
            dataset_path = training_job["dataset_path"]
            training_config = training_job.get("config", {})
            
            logger.info(f"Starting training for model: {model_name}")
            
            # Start MLflow run
            with mlflow.start_run(run_name=f"{model_name}_training"):
                # Log parameters
                mlflow.log_params(training_config)
                
                # Initialize Weights & Biases
                wandb.init(
                    project=self.wandb_project,
                    name=f"{model_name}_training",
                    config=training_config
                )
                
                # Load dataset
                train_dataset, val_dataset = await self._load_training_dataset(dataset_path)
                
                # Load base model
                base_model_info = self.models_registry[model_name]
                tokenizer = AutoTokenizer.from_pretrained(base_model_info["path"])
                model = AutoModel.from_pretrained(base_model_info["path"])
                
                # Create custom model for the task
                custom_model = await self._create_task_specific_model(model, training_job["task"])
                
                # Training arguments
                training_args = TrainingArguments(
                    output_dir=str(self.models_path / "experiments" / model_name),
                    num_train_epochs=training_config.get("epochs", 3),
                    per_device_train_batch_size=training_config.get("batch_size", 16),
                    per_device_eval_batch_size=training_config.get("eval_batch_size", 16),
                    warmup_steps=training_config.get("warmup_steps", 500),
                    weight_decay=training_config.get("weight_decay", 0.01),
                    logging_dir=str(self.models_path / "logs" / model_name),
                    logging_steps=100,
                    evaluation_strategy="steps",
                    eval_steps=500,
                    save_steps=1000,
                    save_total_limit=3,
                    load_best_model_at_end=True,
                    metric_for_best_model="eval_loss",
                    greater_is_better=False,
                    report_to=["wandb", "mlflow"]
                )
                
                # Create trainer
                trainer = Trainer(
                    model=custom_model,
                    args=training_args,
                    train_dataset=train_dataset,
                    eval_dataset=val_dataset,
                    tokenizer=tokenizer,
                    compute_metrics=self._compute_metrics
                )
                
                # Train model
                training_result = trainer.train()
                
                # Evaluate model
                eval_result = trainer.evaluate()
                
                # Save fine-tuned model
                fine_tuned_path = self.models_path / "fine_tuned" / model_name
                trainer.save_model(str(fine_tuned_path))
                tokenizer.save_pretrained(str(fine_tuned_path))
                
                # Log metrics
                mlflow.log_metrics(eval_result)
                wandb.log(eval_result)
                
                # Update registry
                self.models_registry[model_name].update({
                    "status": "trained",
                    "fine_tuned_path": str(fine_tuned_path),
                    "trained_at": datetime.utcnow().isoformat(),
                    "training_metrics": training_result.metrics,
                    "evaluation_metrics": eval_result,
                    "version": self._increment_version(self.models_registry[model_name]["version"])
                })
                
                self._save_models_registry()
                
                # Upload to cloud storage
                if self.s3_client:
                    await self._upload_model_to_cloud(model_name, fine_tuned_path)
                
                wandb.finish()
                
                logger.info(f"Successfully trained model: {model_name}")
                
        except Exception as e:
            logger.error(f"Model training failed for {training_job['model_name']}: {e}")
            wandb.finish()
    
    async def _load_training_dataset(self, dataset_path: str) -> tuple:
        """Load training dataset"""
        try:
            # Load train and validation splits
            train_df = pd.read_csv(f"{dataset_path}/train.csv")
            val_df = pd.read_csv(f"{dataset_path}/val.csv")
            
            # Convert to Hugging Face datasets
            train_dataset = Dataset.from_pandas(train_df)
            val_dataset = Dataset.from_pandas(val_df)
            
            return train_dataset, val_dataset
            
        except Exception as e:
            logger.error(f"Failed to load training dataset: {e}")
            raise
    
    async def _create_task_specific_model(self, base_model: nn.Module, task: str) -> nn.Module:
        """Create task-specific model architecture"""
        try:
            if task == "evaluation":
                return EvaluationModel(base_model)
            elif task == "feedback_generation":
                return FeedbackGenerationModel(base_model)
            elif task == "plagiarism_detection":
                return PlagiarismDetectionModel(base_model)
            elif task == "ocr":
                return OCRModel(base_model)
            else:
                return base_model
        except Exception as e:
            logger.error(f"Failed to create task-specific model: {e}")
            raise
    
    def _compute_metrics(self, eval_pred):
        """Compute evaluation metrics"""
        predictions, labels = eval_pred
        predictions = np.argmax(predictions, axis=1)
        
        return {
            'accuracy': accuracy_score(labels, predictions),
            'f1': f1_score(labels, predictions, average='weighted'),
            'precision': precision_score(labels, predictions, average='weighted'),
            'recall': recall_score(labels, predictions, average='weighted')
        }
    
    def _increment_version(self, current_version: str) -> str:
        """Increment model version"""
        try:
            major, minor, patch = map(int, current_version.split('.'))
            return f"{major}.{minor}.{patch + 1}"
        except:
            return "1.0.1"
    
    async def _upload_model_to_cloud(self, model_name: str, model_path: Path):
        """Upload model to cloud storage"""
        try:
            for file_path in model_path.rglob("*"):
                if file_path.is_file():
                    key = f"models/{model_name}/{file_path.relative_to(model_path)}"
                    self.s3_client.upload_file(str(file_path), self.model_bucket, key)
            
            logger.info(f"Uploaded model {model_name} to cloud storage")
            
        except Exception as e:
            logger.error(f"Failed to upload model to cloud: {e}")
    
    async def _monitor_model_performance(self):
        """Monitor performance of deployed models"""
        try:
            for model_name, model_info in self.models_registry.items():
                if model_info.get("status") == "deployed":
                    await self._check_model_performance(model_name, model_info)
        except Exception as e:
            logger.error(f"Model performance monitoring error: {e}")
    
    async def _check_model_performance(self, model_name: str, model_info: Dict[str, Any]):
        """Check performance of a specific model"""
        try:
            # This would implement performance monitoring logic
            # For now, we'll simulate performance metrics
            current_performance = {
                "accuracy": np.random.uniform(0.8, 0.95),
                "latency": np.random.uniform(100, 500),  # milliseconds
                "throughput": np.random.uniform(50, 200),  # requests per second
                "error_rate": np.random.uniform(0.01, 0.05),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Store performance metrics
            performance_file = self.models_path / "evaluations" / f"{model_name}_performance.json"
            
            if performance_file.exists():
                with open(performance_file, 'r') as f:
                    performance_history = json.load(f)
            else:
                performance_history = []
            
            performance_history.append(current_performance)
            
            # Keep only last 100 entries
            performance_history = performance_history[-100:]
            
            with open(performance_file, 'w') as f:
                json.dump(performance_history, f, indent=2)
            
            # Check if retraining is needed
            if current_performance["accuracy"] < 0.85:
                logger.warning(f"Model {model_name} performance degraded, scheduling retraining")
                await self._schedule_retraining(model_name)
            
        except Exception as e:
            logger.error(f"Performance check error for {model_name}: {e}")
    
    async def _schedule_retraining(self, model_name: str):
        """Schedule model retraining"""
        try:
            training_job = {
                "model_name": model_name,
                "dataset_path": "data/processed/latest",
                "config": {
                    "epochs": 5,
                    "batch_size": 16,
                    "learning_rate": 2e-5
                },
                "priority": 1,
                "scheduled_at": datetime.utcnow().isoformat()
            }
            
            await self.training_queue.put(training_job)
            
        except Exception as e:
            logger.error(f"Failed to schedule retraining for {model_name}: {e}")
    
    async def retrain_models(self, retrain_request: Dict[str, Any], user_id: str):
        """Trigger model retraining"""
        try:
            models_to_retrain = retrain_request.get("models", [])
            training_config = retrain_request.get("config", {})
            
            for model_name in models_to_retrain:
                if model_name in self.models_registry:
                    training_job = {
                        "model_name": model_name,
                        "dataset_path": retrain_request.get("dataset_path", "data/processed/latest"),
                        "config": training_config,
                        "requested_by": user_id,
                        "priority": 1
                    }
                    
                    await self.training_queue.put(training_job)
            
            logger.info(f"Scheduled retraining for {len(models_to_retrain)} models")
            
        except Exception as e:
            logger.error(f"Model retraining error: {e}")
            raise
    
    async def check_and_retrain_models(self):
        """Check if models need retraining and trigger if necessary"""
        try:
            for model_name, model_info in self.models_registry.items():
                # Check if model is old
                trained_at = datetime.fromisoformat(model_info.get("trained_at", "2020-01-01T00:00:00"))
                if (datetime.utcnow() - trained_at).days > 30:
                    await self._schedule_retraining(model_name)
                
                # Check performance metrics
                performance_file = self.models_path / "evaluations" / f"{model_name}_performance.json"
                if performance_file.exists():
                    with open(performance_file, 'r') as f:
                        performance_history = json.load(f)
                    
                    if performance_history:
                        latest_performance = performance_history[-1]
                        if latest_performance.get("accuracy", 1.0) < 0.85:
                            await self._schedule_retraining(model_name)
        
        except Exception as e:
            logger.error(f"Model check and retrain error: {e}")
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get status of all models"""
        try:
            model_status = {
                "total_models": len(self.models_registry),
                "models": {},
                "training_queue_size": self.training_queue.qsize(),
                "storage_usage": await self._calculate_model_storage()
            }
            
            for model_name, model_info in self.models_registry.items():
                # Get latest performance metrics
                performance_file = self.models_path / "evaluations" / f"{model_name}_performance.json"
                latest_performance = None
                
                if performance_file.exists():
                    with open(performance_file, 'r') as f:
                        performance_history = json.load(f)
                    if performance_history:
                        latest_performance = performance_history[-1]
                
                model_status["models"][model_name] = {
                    **model_info,
                    "latest_performance": latest_performance,
                    "is_active": model_name in self.active_models
                }
            
            return model_status
            
        except Exception as e:
            logger.error(f"Get model status error: {e}")
            return {"error": str(e)}
    
    async def _calculate_model_storage(self) -> Dict[str, Any]:
        """Calculate model storage usage"""
        try:
            total_size = 0
            for path in self.models_path.rglob("*"):
                if path.is_file():
                    total_size += path.stat().st_size
            
            return {
                "total_size_bytes": total_size,
                "total_size_gb": round(total_size / (1024**3), 2),
                "by_directory": {
                    "checkpoints": self._get_directory_size(self.models_path / "checkpoints"),
                    "fine_tuned": self._get_directory_size(self.models_path / "fine_tuned"),
                    "experiments": self._get_directory_size(self.models_path / "experiments")
                }
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _get_directory_size(self, directory: Path) -> float:
        """Get directory size in GB"""
        try:
            total_size = sum(f.stat().st_size for f in directory.rglob("*") if f.is_file())
            return round(total_size / (1024**3), 2)
        except:
            return 0.0
    
    async def _load_model(self, model_name: str, model_info: Dict[str, Any]):
        """Load model into memory"""
        try:
            model_path = model_info.get("fine_tuned_path") or model_info.get("path")
            
            tokenizer = AutoTokenizer.from_pretrained(model_path)
            model = AutoModel.from_pretrained(model_path)
            
            self.active_models[model_name] = {
                "tokenizer": tokenizer,
                "model": model,
                "loaded_at": datetime.utcnow().isoformat()
            }
            
            logger.info(f"Loaded model: {model_name}")
            
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        try:
            return {
                "status": "healthy" if self.is_running else "unhealthy",
                "total_models": len(self.models_registry),
                "active_models": len(self.active_models),
                "training_queue_size": self.training_queue.qsize(),
                "cloud_storage": "connected" if self.s3_client else "disconnected",
                "experiment_tracking": "enabled"
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}

# Custom model architectures
class EvaluationModel(nn.Module):
    """Custom model for answer evaluation"""
    
    def __init__(self, base_model):
        super().__init__()
        self.base_model = base_model
        self.dropout = nn.Dropout(0.3)
        self.classifier = nn.Linear(base_model.config.hidden_size, 1)  # Score prediction
        self.grade_classifier = nn.Linear(base_model.config.hidden_size, 13)  # Grade classification
    
    def forward(self, input_ids, attention_mask):
        outputs = self.base_model(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        pooled_output = self.dropout(pooled_output)
        
        score = self.classifier(pooled_output)
        grade_logits = self.grade_classifier(pooled_output)
        
        return {
            'score': score.squeeze(),
            'grade_logits': grade_logits
        }

class FeedbackGenerationModel(nn.Module):
    """Custom model for feedback generation"""
    
    def __init__(self, base_model):
        super().__init__()
        self.base_model = base_model
        self.generation_head = nn.Linear(base_model.config.hidden_size, base_model.config.vocab_size)
    
    def forward(self, input_ids, attention_mask):
        outputs = self.base_model(input_ids=input_ids, attention_mask=attention_mask)
        sequence_output = outputs.last_hidden_state
        
        generation_logits = self.generation_head(sequence_output)
        
        return {
            'logits': generation_logits
        }

class PlagiarismDetectionModel(nn.Module):
    """Custom model for plagiarism detection"""
    
    def __init__(self, base_model):
        super().__init__()
        self.base_model = base_model
        self.similarity_head = nn.Linear(base_model.config.hidden_size * 2, 1)
    
    def forward(self, input_ids_1, attention_mask_1, input_ids_2, attention_mask_2):
        outputs_1 = self.base_model(input_ids=input_ids_1, attention_mask=attention_mask_1)
        outputs_2 = self.base_model(input_ids=input_ids_2, attention_mask=attention_mask_2)
        
        pooled_1 = outputs_1.pooler_output
        pooled_2 = outputs_2.pooler_output
        
        combined = torch.cat([pooled_1, pooled_2], dim=1)
        similarity_score = torch.sigmoid(self.similarity_head(combined))
        
        return {
            'similarity_score': similarity_score.squeeze()
        }

class OCRModel(nn.Module):
    """Custom model for OCR"""
    
    def __init__(self, base_model):
        super().__init__()
        self.base_model = base_model
    
    def forward(self, pixel_values):
        return self.base_model(pixel_values=pixel_values)
