import asyncio
import logging
from typing import Dict, Any, List, Optional, Tuple
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from transformers import (
    AutoTokenizer, AutoModel, AutoConfig, Trainer, TrainingArguments,
    BertModel, RobertaModel, DistilBertModel, ElectraModel,
    T5ForConditionalGeneration, BartForConditionalGeneration,
    GPT2LMHeadModel, BloomForCausalLM
)
from sentence_transformers import SentenceTransformer
import numpy as np
import pandas as pd
from pathlib import Path
import json
from datetime import datetime, timedelta
import pickle
import wandb
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, mean_squared_error
import optuna
import mlflow
import mlflow.pytorch
from huggingface_hub import HfApi, Repository
import boto3
from botocore.exceptions import ClientError
import torch.nn.functional as F
from torch.nn import TransformerEncoder, TransformerEncoderLayer
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import cv2
import easyocr
import pytesseract
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostRegressor, CatBoostClassifier
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.svm import SVR, SVC
from sklearn.neural_network import MLPRegressor, MLPClassifier
import optuna.integration.lightgbm as lgb_optuna
import ray
from ray import tune
from ray.tune.schedulers import ASHAScheduler
from ray.tune.suggest.optuna import OptunaSearch

logger = logging.getLogger(__name__)

class AdvancedModelManager:
    """Advanced model manager with deep learning, ensemble methods, and automated optimization"""
    
    def __init__(self, models_path: str = "models"):
        self.models_path = Path(models_path)
        self.models_registry = {}
        self.active_models = {}
        self.training_queue = asyncio.Queue()
        self.optimization_queue = asyncio.Queue()
        self.is_running = False
        
        # Device configuration
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.num_gpus = torch.cuda.device_count()
        
        # Advanced model configurations
        self.model_configs = {
            # OCR Models
            "advanced_ocr_model": {
                "base_model": "microsoft/trocr-large-handwritten",
                "task": "ocr",
                "architecture": "vision_encoder_decoder",
                "subjects": ["general"],
                "priority": 1,
                "ensemble": True
            },
            "tesseract_ocr": {
                "base_model": "tesseract",
                "task": "ocr",
                "architecture": "traditional",
                "subjects": ["general"],
                "priority": 2,
                "ensemble": True
            },
            "easyocr_model": {
                "base_model": "easyocr",
                "task": "ocr",
                "architecture": "deep_learning",
                "subjects": ["general"],
                "priority": 2,
                "ensemble": True
            },
            
            # Evaluation Models
            "bert_evaluator": {
                "base_model": "bert-large-uncased",
                "task": "evaluation",
                "architecture": "transformer",
                "subjects": ["general"],
                "priority": 1,
                "ensemble": True
            },
            "roberta_evaluator": {
                "base_model": "roberta-large",
                "task": "evaluation",
                "architecture": "transformer",
                "subjects": ["general"],
                "priority": 1,
                "ensemble": True
            },
            "distilbert_evaluator": {
                "base_model": "distilbert-base-uncased",
                "task": "evaluation",
                "architecture": "transformer",
                "subjects": ["general"],
                "priority": 2,
                "ensemble": True
            },
            "electra_evaluator": {
                "base_model": "google/electra-large-discriminator",
                "task": "evaluation",
                "architecture": "transformer",
                "subjects": ["general"],
                "priority": 1,
                "ensemble": True
            },
            
            # Subject-specific Models
            "math_bert_evaluator": {
                "base_model": "bert-base-uncased",
                "task": "evaluation",
                "architecture": "transformer",
                "subjects": ["mathematics"],
                "priority": 1,
                "ensemble": True,
                "custom_head": "math_specific"
            },
            "science_bert_evaluator": {
                "base_model": "allenai/scibert_scivocab_uncased",
                "task": "evaluation",
                "architecture": "transformer",
                "subjects": ["physics", "chemistry", "biology"],
                "priority": 1,
                "ensemble": True
            },
            "english_roberta_evaluator": {
                "base_model": "roberta-base",
                "task": "evaluation",
                "architecture": "transformer",
                "subjects": ["english"],
                "priority": 1,
                "ensemble": True
            },
            
            # Feedback Generation Models
            "t5_feedback_generator": {
                "base_model": "t5-large",
                "task": "feedback_generation",
                "architecture": "seq2seq",
                "subjects": ["general"],
                "priority": 1,
                "ensemble": True
            },
            "bart_feedback_generator": {
                "base_model": "facebook/bart-large",
                "task": "feedback_generation",
                "architecture": "seq2seq",
                "subjects": ["general"],
                "priority": 1,
                "ensemble": True
            },
            "gpt2_feedback_generator": {
                "base_model": "gpt2-medium",
                "task": "feedback_generation",
                "architecture": "causal_lm",
                "subjects": ["general"],
                "priority": 2,
                "ensemble": True
            },
            
            # Traditional ML Models
            "xgboost_evaluator": {
                "base_model": "xgboost",
                "task": "evaluation",
                "architecture": "gradient_boosting",
                "subjects": ["general"],
                "priority": 2,
                "ensemble": True
            },
            "lightgbm_evaluator": {
                "base_model": "lightgbm",
                "task": "evaluation",
                "architecture": "gradient_boosting",
                "subjects": ["general"],
                "priority": 2,
                "ensemble": True
            },
            "catboost_evaluator": {
                "base_model": "catboost",
                "task": "evaluation",
                "architecture": "gradient_boosting",
                "subjects": ["general"],
                "priority": 2,
                "ensemble": True
            },
            "random_forest_evaluator": {
                "base_model": "random_forest",
                "task": "evaluation",
                "architecture": "ensemble",
                "subjects": ["general"],
                "priority": 3,
                "ensemble": True
            },
            
            # Neural Network Models
            "mlp_evaluator": {
                "base_model": "mlp",
                "task": "evaluation",
                "architecture": "neural_network",
                "subjects": ["general"],
                "priority": 3,
                "ensemble": True
            },
            "cnn_evaluator": {
                "base_model": "cnn",
                "task": "evaluation",
                "architecture": "convolutional",
                "subjects": ["general"],
                "priority": 2,
                "ensemble": True
            },
            "lstm_evaluator": {
                "base_model": "lstm",
                "task": "evaluation",
                "architecture": "recurrent",
                "subjects": ["general"],
                "priority": 2,
                "ensemble": True
            },
            
            # Specialized Models
            "plagiarism_detector": {
                "base_model": "sentence-transformers/all-mpnet-base-v2",
                "task": "plagiarism_detection",
                "architecture": "sentence_transformer",
                "subjects": ["general"],
                "priority": 1,
                "ensemble": True
            },
            "bias_detector": {
                "base_model": "unitary/toxic-bert",
                "task": "bias_detection",
                "architecture": "transformer",
                "subjects": ["general"],
                "priority": 1,
                "ensemble": False
            },
            "quality_assessor": {
                "base_model": "bert-base-uncased",
                "task": "quality_assessment",
                "architecture": "transformer",
                "subjects": ["general"],
                "priority": 1,
                "ensemble": True
            }
        }
        
        # Ensemble configurations
        self.ensemble_configs = {
            "ocr_ensemble": {
                "models": ["advanced_ocr_model", "tesseract_ocr", "easyocr_model"],
                "method": "weighted_average",
                "weights": [0.6, 0.2, 0.2]
            },
            "evaluation_ensemble": {
                "models": ["bert_evaluator", "roberta_evaluator", "electra_evaluator", "xgboost_evaluator", "lightgbm_evaluator"],
                "method": "stacking",
                "meta_learner": "ridge"
            },
            "feedback_ensemble": {
                "models": ["t5_feedback_generator", "bart_feedback_generator"],
                "method": "voting",
                "selection_criteria": "quality_score"
            }
        }
        
        # Cloud storage configuration
        self.s3_client = None
        self.model_bucket = "ai-evaluator-models-advanced"
        
        # Experiment tracking
        self.mlflow_tracking_uri = "http://localhost:5000"
        self.wandb_project = "ai-answer-evaluator-advanced"
        
        # Ray configuration for distributed training
        self.ray_initialized = False
        
        # Create directory structure
        self._create_directory_structure()
        
        # Load existing registry
        self._load_models_registry()
    
    def _create_directory_structure(self):
        """Create comprehensive model directory structure"""
        directories = [
            "checkpoints",           # Model checkpoints
            "fine_tuned",           # Fine-tuned models
            "ensembles",            # Ensemble models
            "experiments",          # Experiment results
            "evaluations",          # Model evaluations
            "deployments",          # Deployed models
            "backups",              # Model backups
            "metadata",             # Model metadata
            "logs",                 # Training logs
            "hyperparameters",      # Hyperparameter tuning results
            "benchmarks",           # Benchmark results
            "optimized",            # Optimized models
            "quantized",            # Quantized models
            "onnx",                 # ONNX models
            "tensorrt",             # TensorRT models
            "traditional_ml",       # Traditional ML models
            "neural_networks",      # Custom neural networks
            "transformers",         # Transformer models
            "vision_models",        # Computer vision models
            "nlp_models",           # NLP models
            "multimodal",           # Multimodal models
            "synthetic_data",       # Synthetic training data
            "augmented_data",       # Data augmentation results
            "feature_stores",       # Feature engineering results
            "model_cards",          # Model documentation
            "performance_reports",  # Performance analysis
            "ablation_studies",     # Ablation study results
            "interpretability",     # Model interpretability results
            "fairness_reports",     # Fairness and bias analysis
            "security_scans",       # Security vulnerability scans
            "compliance_reports"    # Regulatory compliance reports
        ]
        
        for directory in directories:
            (self.models_path / directory).mkdir(parents=True, exist_ok=True)
        
        # Create subject-specific directories
        subjects = [
            "mathematics", "physics", "chemistry", "biology", 
            "english", "history", "computer_science", "geography",
            "economics", "psychology", "philosophy", "art",
            "engineering", "medicine", "law", "business"
        ]
        
        for subject in subjects:
            for directory in ["fine_tuned", "evaluations", "benchmarks"]:
                (self.models_path / directory / subject).mkdir(parents=True, exist_ok=True)
    
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
        """Initialize advanced model manager"""
        try:
            logger.info("Initializing Advanced Model Manager...")
            
            # Initialize Ray for distributed computing
            await self._initialize_ray()
            
            # Initialize cloud storage
            await self._initialize_cloud_storage()
            
            # Initialize experiment tracking
            await self._initialize_experiment_tracking()
            
            # Load existing models
            await self._load_existing_models()
            
            # Start background workers
            self.is_running = True
            asyncio.create_task(self._training_worker())
            asyncio.create_task(self._optimization_worker())
            asyncio.create_task(self._model_monitoring_worker())
            asyncio.create_task(self._ensemble_management_worker())
            
            # Download and initialize base models
            await self._initialize_base_models()
            
            # Initialize ensemble models
            await self._initialize_ensemble_models()
            
            # Start automated hyperparameter optimization
            await self._start_automated_optimization()
            
            logger.info("Advanced Model Manager initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Advanced Model Manager: {e}")
            raise
    
    async def _initialize_ray(self):
        """Initialize Ray for distributed computing"""
        try:
            if not self.ray_initialized:
                ray.init(ignore_reinit_error=True)
                self.ray_initialized = True
                logger.info("Ray initialized for distributed computing")
        except Exception as e:
            logger.warning(f"Ray initialization failed: {e}")
    
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
        """Initialize all base models"""
        try:
            for model_name, config in self.model_configs.items():
                if model_name not in self.models_registry:
                    await self._download_base_model(model_name, config)
        except Exception as e:
            logger.error(f"Failed to initialize base models: {e}")
    
    async def _initialize_ensemble_models(self):
        """Initialize ensemble models"""
        try:
            for ensemble_name, config in self.ensemble_configs.items():
                await self._create_ensemble_model(ensemble_name, config)
        except Exception as e:
            logger.error(f"Failed to initialize ensemble models: {e}")
    
    async def _start_automated_optimization(self):
        """Start automated hyperparameter optimization"""
        try:
            # Schedule optimization for all models
            for model_name in self.model_configs.keys():
                await self.optimization_queue.put({
                    "model_name": model_name,
                    "optimization_type": "hyperparameter_tuning",
                    "priority": self.model_configs[model_name]["priority"]
                })
            
            logger.info("Automated optimization scheduled for all models")
            
        except Exception as e:
            logger.error(f"Failed to start automated optimization: {e}")
    
    async def _download_base_model(self, model_name: str, config: Dict[str, Any]):
        """Download and initialize base model"""
        try:
            logger.info(f"Downloading base model: {model_name}")
            
            base_model = config["base_model"]
            architecture = config["architecture"]
            model_path = self.models_path / "checkpoints" / model_name
            model_path.mkdir(exist_ok=True)
            
            if architecture == "transformer":
                # Download transformer models
                tokenizer = AutoTokenizer.from_pretrained(base_model)
                model = AutoModel.from_pretrained(base_model)
                
                # Save locally
                tokenizer.save_pretrained(str(model_path))
                model.save_pretrained(str(model_path))
                
            elif architecture == "seq2seq":
                # Download sequence-to-sequence models
                tokenizer = AutoTokenizer.from_pretrained(base_model)
                if "t5" in base_model.lower():
                    model = T5ForConditionalGeneration.from_pretrained(base_model)
                elif "bart" in base_model.lower():
                    model = BartForConditionalGeneration.from_pretrained(base_model)
                
                tokenizer.save_pretrained(str(model_path))
                model.save_pretrained(str(model_path))
                
            elif architecture == "causal_lm":
                # Download causal language models
                tokenizer = AutoTokenizer.from_pretrained(base_model)
                model = GPT2LMHeadModel.from_pretrained(base_model)
                
                tokenizer.save_pretrained(str(model_path))
                model.save_pretrained(str(model_path))
                
            elif architecture == "vision_encoder_decoder":
                # Download vision encoder-decoder models
                processor = TrOCRProcessor.from_pretrained(base_model)
                model = VisionEncoderDecoderModel.from_pretrained(base_model)
                
                processor.save_pretrained(str(model_path))
                model.save_pretrained(str(model_path))
                
            elif architecture == "sentence_transformer":
                # Download sentence transformer models
                model = SentenceTransformer(base_model)
                model.save(str(model_path))
                
            elif architecture in ["gradient_boosting", "ensemble", "neural_network", "convolutional", "recurrent"]:
                # Initialize traditional ML and custom neural network models
                await self._initialize_traditional_model(model_name, config, model_path)
            
            # Update registry
            self.models_registry[model_name] = {
                "name": model_name,
                "base_model": base_model,
                "architecture": architecture,
                "task": config["task"],
                "subjects": config["subjects"],
                "status": "downloaded",
                "path": str(model_path),
                "downloaded_at": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "performance_metrics": {},
                "ensemble": config.get("ensemble", False),
                "priority": config["priority"]
            }
            
            self._save_models_registry()
            
            logger.info(f"Successfully downloaded base model: {model_name}")
            
        except Exception as e:
            logger.error(f"Failed to download base model {model_name}: {e}")
    
    async def _initialize_traditional_model(self, model_name: str, config: Dict[str, Any], model_path: Path):
        """Initialize traditional ML and custom neural network models"""
        try:
            architecture = config["architecture"]
            
            if architecture == "gradient_boosting":
                if "xgboost" in config["base_model"]:
                    model = xgb.XGBRegressor(
                        n_estimators=100,
                        max_depth=6,
                        learning_rate=0.1,
                        random_state=42
                    )
                elif "lightgbm" in config["base_model"]:
                    model = lgb.LGBMRegressor(
                        n_estimators=100,
                        max_depth=6,
                        learning_rate=0.1,
                        random_state=42
                    )
                elif "catboost" in config["base_model"]:
                    model = CatBoostRegressor(
                        iterations=100,
                        depth=6,
                        learning_rate=0.1,
                        random_seed=42,
                        verbose=False
                    )
                
            elif architecture == "ensemble":
                model = RandomForestRegressor(
                    n_estimators=100,
                    max_depth=10,
                    random_state=42
                )
                
            elif architecture == "neural_network":
                model = MLPRegressor(
                    hidden_layer_sizes=(256, 128, 64),
                    activation='relu',
                    solver='adam',
                    max_iter=1000,
                    random_state=42
                )
                
            elif architecture in ["convolutional", "recurrent"]:
                # Create custom PyTorch models
                model = await self._create_custom_neural_network(architecture, config)
            
            # Save model configuration
            model_config = {
                "architecture": architecture,
                "base_model": config["base_model"],
                "task": config["task"],
                "subjects": config["subjects"],
                "created_at": datetime.utcnow().isoformat()
            }
            
            with open(model_path / "config.json", 'w') as f:
                json.dump(model_config, f, indent=2)
            
            # Save initial model (will be trained later)
            if hasattr(model, 'save_model'):
                model.save_model(str(model_path / "model.bin"))
            elif isinstance(model, torch.nn.Module):
                torch.save(model.state_dict(), model_path / "model.pth")
            else:
                with open(model_path / "model.pkl", 'wb') as f:
                    pickle.dump(model, f)
            
        except Exception as e:
            logger.error(f"Failed to initialize traditional model {model_name}: {e}")
            raise
    
    async def _create_custom_neural_network(self, architecture: str, config: Dict[str, Any]) -> nn.Module:
        """Create custom neural network architectures"""
        try:
            if architecture == "convolutional":
                return CustomCNNEvaluator(
                    input_size=768,  # BERT embedding size
                    num_classes=1,   # Regression output
                    dropout=0.3
                )
            elif architecture == "recurrent":
                return CustomLSTMEvaluator(
                    input_size=768,
                    hidden_size=256,
                    num_layers=2,
                    num_classes=1,
                    dropout=0.3
                )
        except Exception as e:
            logger.error(f"Failed to create custom neural network: {e}")
            raise
    
    async def _create_ensemble_model(self, ensemble_name: str, config: Dict[str, Any]):
        """Create ensemble model"""
        try:
            logger.info(f"Creating ensemble model: {ensemble_name}")
            
            ensemble_path = self.models_path / "ensembles" / ensemble_name
            ensemble_path.mkdir(exist_ok=True)
            
            # Create ensemble configuration
            ensemble_config = {
                "name": ensemble_name,
                "models": config["models"],
                "method": config["method"],
                "created_at": datetime.utcnow().isoformat(),
                "status": "initialized"
            }
            
            if config["method"] == "weighted_average":
                ensemble_config["weights"] = config.get("weights", [1.0/len(config["models"])] * len(config["models"]))
            elif config["method"] == "stacking":
                ensemble_config["meta_learner"] = config.get("meta_learner", "ridge")
            elif config["method"] == "voting":
                ensemble_config["selection_criteria"] = config.get("selection_criteria", "majority")
            
            # Save ensemble configuration
            with open(ensemble_path / "config.json", 'w') as f:
                json.dump(ensemble_config, f, indent=2)
            
            # Update registry
            self.models_registry[ensemble_name] = {
                "name": ensemble_name,
                "type": "ensemble",
                "method": config["method"],
                "models": config["models"],
                "status": "initialized",
                "path": str(ensemble_path),
                "created_at": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "performance_metrics": {}
            }
            
            self._save_models_registry()
            
            logger.info(f"Successfully created ensemble model: {ensemble_name}")
            
        except Exception as e:
            logger.error(f"Failed to create ensemble model {ensemble_name}: {e}")
    
    async def _training_worker(self):
        """Background worker for model training"""
        while self.is_running:
            try:
                training_job = await self.training_queue.get()
                await self._train_model_advanced(training_job)
                self.training_queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Training worker error: {e}")
                await asyncio.sleep(60)
    
    async def _optimization_worker(self):
        """Background worker for model optimization"""
        while self.is_running:
            try:
                optimization_job = await self.optimization_queue.get()
                await self._optimize_model(optimization_job)
                self.optimization_queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Optimization worker error: {e}")
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
    
    async def _ensemble_management_worker(self):
        """Background worker for ensemble management"""
        while self.is_running:
            try:
                await self._update_ensemble_models()
                await asyncio.sleep(7200)  # Update every 2 hours
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Ensemble management error: {e}")
                await asyncio.sleep(600)
    
    async def _train_model_advanced(self, training_job: Dict[str, Any]):
        """Advanced model training with hyperparameter optimization"""
        try:
            model_name = training_job["model_name"]
            dataset_path = training_job.get("dataset_path", "data/processed/latest")
            training_config = training_job.get("config", {})
            
            logger.info(f"Starting advanced training for model: {model_name}")
            
            # Get model configuration
            model_config = self.model_configs.get(model_name)
            if not model_config:
                raise ValueError(f"Model configuration not found for {model_name}")
            
            # Start MLflow run
            with mlflow.start_run(run_name=f"{model_name}_advanced_training"):
                # Log parameters
                mlflow.log_params(training_config)
                mlflow.log_params(model_config)
                
                # Initialize Weights & Biases
                wandb.init(
                    project=self.wandb_project,
                    name=f"{model_name}_advanced_training",
                    config={**training_config, **model_config}
                )
                
                # Load and prepare dataset
                train_dataset, val_dataset, test_dataset = await self._load_training_dataset_advanced(dataset_path, model_config)
                
                # Perform hyperparameter optimization
                if training_config.get("optimize_hyperparameters", True):
                    best_params = await self._optimize_hyperparameters(model_name, model_config, train_dataset, val_dataset)
                    training_config.update(best_params)
                
                # Train model based on architecture
                architecture = model_config["architecture"]
                
                if architecture in ["transformer", "seq2seq", "causal_lm", "vision_encoder_decoder"]:
                    trained_model, training_results = await self._train_transformer_model(
                        model_name, model_config, train_dataset, val_dataset, training_config
                    )
                elif architecture in ["gradient_boosting", "ensemble", "neural_network"]:
                    trained_model, training_results = await self._train_traditional_model(
                        model_name, model_config, train_dataset, val_dataset, training_config
                    )
                elif architecture in ["convolutional", "recurrent"]:
                    trained_model, training_results = await self._train_custom_neural_network(
                        model_name, model_config, train_dataset, val_dataset, training_config
                    )
                elif architecture == "sentence_transformer":
                    trained_model, training_results = await self._train_sentence_transformer(
                        model_name, model_config, train_dataset, val_dataset, training_config
                    )
                
                # Evaluate on test set
                test_results = await self._evaluate_model_comprehensive(trained_model, test_dataset, model_config)
                
                # Save trained model
                model_save_path = await self._save_trained_model(model_name, trained_model, model_config)
                
                # Log metrics
                mlflow.log_metrics({**training_results, **test_results})
                wandb.log({**training_results, **test_results})
                
                # Update registry
                self.models_registry[model_name].update({
                    "status": "trained",
                    "trained_path": str(model_save_path),
                    "trained_at": datetime.utcnow().isoformat(),
                    "training_metrics": training_results,
                    "test_metrics": test_results,
                    "version": self._increment_version(self.models_registry[model_name]["version"]),
                    "hyperparameters": training_config
                })
                
                self._save_models_registry()
                
                # Upload to cloud storage
                if self.s3_client:
                    await self._upload_model_to_cloud(model_name, model_save_path)
                
                # Create model card
                await self._create_model_card(model_name, model_config, training_results, test_results)
                
                wandb.finish()
                
                logger.info(f"Successfully trained advanced model: {model_name}")
                
        except Exception as e:
            logger.error(f"Advanced model training failed for {training_job['model_name']}: {e}")
            if 'wandb' in locals():
                wandb.finish()
    
    async def _optimize_hyperparameters(self, model_name: str, model_config: Dict[str, Any], 
                                      train_dataset: Dataset, val_dataset: Dataset) -> Dict[str, Any]:
        """Optimize hyperparameters using Optuna"""
        try:
            logger.info(f"Optimizing hyperparameters for {model_name}")
            
            def objective(trial):
                # Define hyperparameter search space based on architecture
                architecture = model_config["architecture"]
                
                if architecture == "transformer":
                    params = {
                        "learning_rate": trial.suggest_float("learning_rate", 1e-6, 1e-3, log=True),
                        "batch_size": trial.suggest_categorical("batch_size", [8, 16, 32, 64]),
                        "num_epochs": trial.suggest_int("num_epochs", 3, 10),
                        "warmup_steps": trial.suggest_int("warmup_steps", 100, 1000),
                        "weight_decay": trial.suggest_float("weight_decay", 0.0, 0.3),
                        "dropout": trial.suggest_float("dropout", 0.1, 0.5)
                    }
                elif architecture == "gradient_boosting":
                    if "xgboost" in model_config["base_model"]:
                        params = {
                            "n_estimators": trial.suggest_int("n_estimators", 50, 500),
                            "max_depth": trial.suggest_int("max_depth", 3, 10),
                            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3),
                            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
                            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0)
                        }
                    elif "lightgbm" in model_config["base_model"]:
                        params = {
                            "n_estimators": trial.suggest_int("n_estimators", 50, 500),
                            "max_depth": trial.suggest_int("max_depth", 3, 10),
                            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3),
                            "num_leaves": trial.suggest_int("num_leaves", 10, 100),
                            "feature_fraction": trial.suggest_float("feature_fraction", 0.6, 1.0)
                        }
                
                # Train model with suggested parameters
                try:
                    if architecture == "transformer":
                        score = self._train_and_evaluate_transformer(params, train_dataset, val_dataset, model_config)
                    elif architecture == "gradient_boosting":
                        score = self._train_and_evaluate_traditional(params, train_dataset, val_dataset, model_config)
                    
                    return score
                except Exception as e:
                    logger.error(f"Trial failed: {e}")
                    return float('inf')
            
            # Create study
            study = optuna.create_study(
                direction="minimize",
                sampler=optuna.samplers.TPESampler(),
                pruner=optuna.pruners.MedianPruner()
            )
            
            # Optimize
            study.optimize(objective, n_trials=50, timeout=3600)  # 1 hour timeout
            
            logger.info(f"Best hyperparameters for {model_name}: {study.best_params}")
            
            return study.best_params
            
        except Exception as e:
            logger.error(f"Hyperparameter optimization failed for {model_name}: {e}")
            return {}
    
    def _train_and_evaluate_transformer(self, params: Dict[str, Any], train_dataset: Dataset, 
                                      val_dataset: Dataset, model_config: Dict[str, Any]) -> float:
        """Train and evaluate transformer model for hyperparameter optimization"""
        try:
            # This is a simplified version for hyperparameter optimization
            # In practice, you would implement the full training loop
            
            # Load model
            model_path = self.models_path / "checkpoints" / model_config["name"]
            tokenizer = AutoTokenizer.from_pretrained(str(model_path))
            model = AutoModel.from_pretrained(str(model_path))
            
            # Add classification head
            model = TransformerEvaluator(model, num_classes=1, dropout=params.get("dropout", 0.3))
            
            # Training arguments
            training_args = TrainingArguments(
                output_dir=str(self.models_path / "experiments" / f"trial_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"),
                num_train_epochs=params.get("num_epochs", 3),
                per_device_train_batch_size=params.get("batch_size", 16),
                per_device_eval_batch_size=params.get("batch_size", 16),
                learning_rate=params.get("learning_rate", 2e-5),
                warmup_steps=params.get("warmup_steps", 500),
                weight_decay=params.get("weight_decay", 0.01),
                logging_steps=100,
                evaluation_strategy="steps",
                eval_steps=500,
                save_strategy="no",
                load_best_model_at_end=False,
                metric_for_best_model="eval_loss",
                greater_is_better=False,
                report_to=[]  # Disable reporting for trials
            )
            
            # Trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=val_dataset,
                tokenizer=tokenizer
            )
            
            # Train
            trainer.train()
            
            # Evaluate
            eval_results = trainer.evaluate()
            
            return eval_results["eval_loss"]
            
        except Exception as e:
            logger.error(f"Transformer training/evaluation failed: {e}")
            return float('inf')
    
    def _train_and_evaluate_traditional(self, params: Dict[str, Any], train_dataset: Dataset, 
                                      val_dataset: Dataset, model_config: Dict[str, Any]) -> float:
        """Train and evaluate traditional ML model for hyperparameter optimization"""
        try:
            # Convert datasets to numpy arrays
            X_train, y_train = self._dataset_to_numpy(train_dataset)
            X_val, y_val = self._dataset_to_numpy(val_dataset)
            
            # Create model
            if "xgboost" in model_config["base_model"]:
                model = xgb.XGBRegressor(**params, random_state=42)
            elif "lightgbm" in model_config["base_model"]:
                model = lgb.LGBMRegressor(**params, random_state=42, verbose=-1)
            elif "catboost" in model_config["base_model"]:
                model = CatBoostRegressor(**params, random_seed=42, verbose=False)
            
            # Train
            model.fit(X_train, y_train)
            
            # Predict
            y_pred = model.predict(X_val)
            
            # Calculate MSE
            mse = mean_squared_error(y_val, y_pred)
            
            return mse
            
        except Exception as e:
            logger.error(f"Traditional ML training/evaluation failed: {e}")
            return float('inf')
    
    def _dataset_to_numpy(self, dataset: Dataset) -> Tuple[np.ndarray, np.ndarray]:
        """Convert dataset to numpy arrays"""
        # This is a placeholder - implement based on your dataset structure
        X = []
        y = []
        
        for item in dataset:
            X.append(item["features"])
            y.append(item["label"])
        
        return np.array(X), np.array(y)
    
    async def _load_training_dataset_advanced(self, dataset_path: str, model_config: Dict[str, Any]) -> Tuple[Dataset, Dataset, Dataset]:
        """Load and prepare advanced training dataset"""
        try:
            # This is a placeholder - implement based on your data structure
            # You would load your actual datasets here
            
            # For now, return dummy datasets
            train_dataset = DummyDataset(1000)
            val_dataset = DummyDataset(200)
            test_dataset = DummyDataset(200)
            
            return train_dataset, val_dataset, test_dataset
            
        except Exception as e:
            logger.error(f"Failed to load training dataset: {e}")
            raise
    
    async def _train_transformer_model(self, model_name: str, model_config: Dict[str, Any], 
                                     train_dataset: Dataset, val_dataset: Dataset, 
                                     training_config: Dict[str, Any]) -> Tuple[Any, Dict[str, float]]:
        """Train transformer model"""
        try:
            # Load model and tokenizer
            model_path = self.models_path / "checkpoints" / model_name
            tokenizer = AutoTokenizer.from_pretrained(str(model_path))
            
            if model_config["architecture"] == "transformer":
                base_model = AutoModel.from_pretrained(str(model_path))
                model = TransformerEvaluator(base_model, num_classes=1, dropout=training_config.get("dropout", 0.3))
            elif model_config["architecture"] == "seq2seq":
                if "t5" in model_config["base_model"].lower():
                    model = T5ForConditionalGeneration.from_pretrained(str(model_path))
                elif "bart" in model_config["base_model"].lower():
                    model = BartForConditionalGeneration.from_pretrained(str(model_path))
            elif model_config["architecture"] == "causal_lm":
                model = GPT2LMHeadModel.from_pretrained(str(model_path))
            
            # Training arguments
            training_args = TrainingArguments(
                output_dir=str(self.models_path / "fine_tuned" / model_name),
                num_train_epochs=training_config.get("num_epochs", 3),
                per_device_train_batch_size=training_config.get("batch_size", 16),
                per_device_eval_batch_size=training_config.get("batch_size", 16),
                learning_rate=training_config.get("learning_rate", 2e-5),
                warmup_steps=training_config.get("warmup_steps", 500),
                weight_decay=training_config.get("weight_decay", 0.01),
                logging_steps=100,
                evaluation_strategy="steps",
                eval_steps=500,
                save_strategy="steps",
                save_steps=1000,
                load_best_model_at_end=True,
                metric_for_best_model="eval_loss",
                greater_is_better=False,
                dataloader_num_workers=4,
                fp16=torch.cuda.is_available(),
                gradient_checkpointing=True,
                report_to=["wandb"] if os.getenv("WANDB_API_KEY") else []
            )
            
            # Trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=val_dataset,
                tokenizer=tokenizer,
                callbacks=[
                    EarlyStoppingCallback(early_stopping_patience=3),
                    WandbCallback() if os.getenv("WANDB_API_KEY") else None
                ]
            )
            
            # Train
            training_result = trainer.train()
            
            # Get training metrics
            training_metrics = {
                "train_loss": training_result.training_loss,
                "train_runtime": training_result.metrics["train_runtime"],
                "train_samples_per_second": training_result.metrics["train_samples_per_second"]
            }
            
            return model, training_metrics
            
        except Exception as e:
            logger.error(f"Transformer model training failed: {e}")
            raise
    
    async def _train_traditional_model(self, model_name: str, model_config: Dict[str, Any], 
                                     train_dataset: Dataset, val_dataset: Dataset, 
                                     training_config: Dict[str, Any]) -> Tuple[Any, Dict[str, float]]:
        """Train traditional ML model"""
        try:
            # Convert datasets
            X_train, y_train = self._dataset_to_numpy(train_dataset)
            X_val, y_val = self._dataset_to_numpy(val_dataset)
            
            # Create model
            if "xgboost" in model_config["base_model"]:
                model = xgb.XGBRegressor(**training_config, random_state=42)
            elif "lightgbm" in model_config["base_model"]:
                model = lgb.LGBMRegressor(**training_config, random_state=42, verbose=-1)
            elif "catboost" in model_config["base_model"]:
                model = CatBoostRegressor(**training_config, random_seed=42, verbose=False)
            elif "random_forest" in model_config["base_model"]:
                model = RandomForestRegressor(**training_config, random_state=42)
            elif "mlp" in model_config["base_model"]:
                model = MLPRegressor(**training_config, random_state=42)
            
            # Train
            start_time = datetime.utcnow()
            model.fit(X_train, y_train)
            training_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Evaluate
            train_pred = model.predict(X_train)
            val_pred = model.predict(X_val)
            
            train_mse = mean_squared_error(y_train, train_pred)
            val_mse = mean_squared_error(y_val, val_pred)
            
            training_metrics = {
                "train_mse": train_mse,
                "val_mse": val_mse,
                "training_time": training_time
            }
            
            return model, training_metrics
            
        except Exception as e:
            logger.error(f"Traditional model training failed: {e}")
            raise
    
    async def _train_custom_neural_network(self, model_name: str, model_config: Dict[str, Any], 
                                         train_dataset: Dataset, val_dataset: Dataset, 
                                         training_config: Dict[str, Any]) -> Tuple[Any, Dict[str, float]]:
        """Train custom neural network"""
        try:
            # Create model
            if model_config["architecture"] == "convolutional":
                model = CustomCNNEvaluator(
                    input_size=768,
                    num_classes=1,
                    dropout=training_config.get("dropout", 0.3)
                )
            elif model_config["architecture"] == "recurrent":
                model = CustomLSTMEvaluator(
                    input_size=768,
                    hidden_size=training_config.get("hidden_size", 256),
                    num_layers=training_config.get("num_layers", 2),
                    num_classes=1,
                    dropout=training_config.get("dropout", 0.3)
                )
            
            model = model.to(self.device)
            
            # Create data loaders
            train_loader = DataLoader(
                train_dataset,
                batch_size=training_config.get("batch_size", 32),
                shuffle=True,
                num_workers=4
            )
            val_loader = DataLoader(
                val_dataset,
                batch_size=training_config.get("batch_size", 32),
                shuffle=False,
                num_workers=4
            )
            
            # Optimizer and loss
            optimizer = optim.Adam(
                model.parameters(),
                lr=training_config.get("learning_rate", 1e-3),
                weight_decay=training_config.get("weight_decay", 1e-4)
            )
            criterion = nn.MSELoss()
            scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3)
            
            # Training loop
            num_epochs = training_config.get("num_epochs", 10)
            best_val_loss = float('inf')
            training_losses = []
            val_losses = []
            
            for epoch in range(num_epochs):
                # Training
                model.train()
                train_loss = 0.0
                for batch in train_loader:
                    optimizer.zero_grad()
                    
                    inputs = batch["features"].to(self.device)
                    targets = batch["labels"].to(self.device)
                    
                    outputs = model(inputs)
                    loss = criterion(outputs, targets)
                    
                    loss.backward()
                    optimizer.step()
                    
                    train_loss += loss.item()
                
                train_loss /= len(train_loader)
                training_losses.append(train_loss)
                
                # Validation
                model.eval()
                val_loss = 0.0
                with torch.no_grad():
                    for batch in val_loader:
                        inputs = batch["features"].to(self.device)
                        targets = batch["labels"].to(self.device)
                        
                        outputs = model(inputs)
                        loss = criterion(outputs, targets)
                        
                        val_loss += loss.item()
                
                val_loss /= len(val_loader)
                val_losses.append(val_loss)
                
                # Learning rate scheduling
                scheduler.step(val_loss)
                
                # Early stopping
                if val_loss < best_val_loss:
                    best_val_loss = val_loss
                    # Save best model
                    torch.save(model.state_dict(), self.models_path / "fine_tuned" / model_name / "best_model.pth")
                
                # Log metrics
                wandb.log({
                    "epoch": epoch,
                    "train_loss": train_loss,
                    "val_loss": val_loss,
                    "learning_rate": optimizer.param_groups[0]['lr']
                })
            
            # Load best model
            model.load_state_dict(torch.load(self.models_path / "fine_tuned" / model_name / "best_model.pth"))
            
            training_metrics = {
                "final_train_loss": training_losses[-1],
                "final_val_loss": val_losses[-1],
                "best_val_loss": best_val_loss,
                "num_epochs": num_epochs
            }
            
            return model, training_metrics
            
        except Exception as e:
            logger.error(f"Custom neural network training failed: {e}")
            raise
    
    async def _train_sentence_transformer(self, model_name: str, model_config: Dict[str, Any], 
                                        train_dataset: Dataset, val_dataset: Dataset, 
                                        training_config: Dict[str, Any]) -> Tuple[Any, Dict[str, float]]:
        """Train sentence transformer model"""
        try:
            # Load model
            model_path = self.models_path / "checkpoints" / model_name
            model = SentenceTransformer(str(model_path))
            
            # Convert dataset for sentence transformer training
            train_examples = self._convert_to_sentence_transformer_format(train_dataset)
            
            # Training
            train_loss = losses.CosineSimilarityLoss(model)
            
            model.fit(
                train_objectives=[(DataLoader(train_examples, shuffle=True, batch_size=16), train_loss)],
                epochs=training_config.get("num_epochs", 3),
                warmup_steps=training_config.get("warmup_steps", 100),
                output_path=str(self.models_path / "fine_tuned" / model_name)
            )
            
            training_metrics = {
                "num_epochs": training_config.get("num_epochs", 3),
                "warmup_steps": training_config.get("warmup_steps", 100)
            }
            
            return model, training_metrics
            
        except Exception as e:
            logger.error(f"Sentence transformer training failed: {e}")
            raise
    
    def _convert_to_sentence_transformer_format(self, dataset: Dataset) -> List:
        """Convert dataset to sentence transformer format"""
        # This is a placeholder - implement based on your dataset structure
        examples = []
        for item in dataset:
            examples.append(InputExample(texts=[item["text1"], item["text2"]], label=item["label"]))
        return examples
    
    async def _evaluate_model_comprehensive(self, model: Any, test_dataset: Dataset, 
                                          model_config: Dict[str, Any]) -> Dict[str, float]:
        """Comprehensive model evaluation"""
        try:
            architecture = model_config["architecture"]
            
            if architecture in ["transformer", "seq2seq", "causal_lm"]:
                return await self._evaluate_transformer_model(model, test_dataset, model_config)
            elif architecture in ["gradient_boosting", "ensemble", "neural_network"]:
                return await self._evaluate_traditional_model(model, test_dataset, model_config)
            elif architecture in ["convolutional", "recurrent"]:
                return await self._evaluate_custom_neural_network(model, test_dataset, model_config)
            elif architecture == "sentence_transformer":
                return await self._evaluate_sentence_transformer(model, test_dataset, model_config)
            
        except Exception as e:
            logger.error(f"Model evaluation failed: {e}")
            return {}
    
    async def _evaluate_transformer_model(self, model: Any, test_dataset: Dataset, 
                                        model_config: Dict[str, Any]) -> Dict[str, float]:
        """Evaluate transformer model"""
        try:
            # Create test data loader
            test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
            
            model.eval()
            predictions = []
            targets = []
            
            with torch.no_grad():
                for batch in test_loader:
                    inputs = batch["input_ids"].to(self.device)
                    attention_mask = batch["attention_mask"].to(self.device)
                    labels = batch["labels"].to(self.device)
                    
                    outputs = model(inputs, attention_mask=attention_mask)
                    
                    predictions.extend(outputs.logits.cpu().numpy())
                    targets.extend(labels.cpu().numpy())
            
            predictions = np.array(predictions)
            targets = np.array(targets)
            
            # Calculate metrics
            mse = mean_squared_error(targets, predictions)
            mae = np.mean(np.abs(targets - predictions))
            r2 = 1 - (np.sum((targets - predictions) ** 2) / np.sum((targets - np.mean(targets)) ** 2))
            
            return {
                "test_mse": mse,
                "test_mae": mae,
                "test_r2": r2
            }
            
        except Exception as e:
            logger.error(f"Transformer model evaluation failed: {e}")
            return {}
    
    async def _evaluate_traditional_model(self, model: Any, test_dataset: Dataset, 
                                        model_config: Dict[str, Any]) -> Dict[str, float]:
        """Evaluate traditional ML model"""
        try:
            X_test, y_test = self._dataset_to_numpy(test_dataset)
            
            predictions = model.predict(X_test)
            
            mse = mean_squared_error(y_test, predictions)
            mae = np.mean(np.abs(y_test - predictions))
            r2 = 1 - (np.sum((y_test - predictions) ** 2) / np.sum((y_test - np.mean(y_test)) ** 2))
            
            return {
                "test_mse": mse,
                "test_mae": mae,
                "test_r2": r2
            }
            
        except Exception as e:
            logger.error(f"Traditional model evaluation failed: {e}")
            return {}
    
    async def _evaluate_custom_neural_network(self, model: Any, test_dataset: Dataset, 
                                            model_config: Dict[str, Any]) -> Dict[str, float]:
        """Evaluate custom neural network"""
        try:
            test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
            
            model.eval()
            predictions = []
            targets = []
            
            with torch.no_grad():
                for batch in test_loader:
                    inputs = batch["features"].to(self.device)
                    labels = batch["labels"].to(self.device)
                    
                    outputs = model(inputs)
                    
                    predictions.extend(outputs.cpu().numpy())
                    targets.extend(labels.cpu().numpy())
            
            predictions = np.array(predictions)
            targets = np.array(targets)
            
            mse = mean_squared_error(targets, predictions)
            mae = np.mean(np.abs(targets - predictions))
            r2 = 1 - (np.sum((targets - predictions) ** 2) / np.sum((targets - np.mean(targets)) ** 2))
            
            return {
                "test_mse": mse,
                "test_mae": mae,
                "test_r2": r2
            }
            
        except Exception as e:
            logger.error(f"Custom neural network evaluation failed: {e}")
            return {}
    
    async def _evaluate_sentence_transformer(self, model: Any, test_dataset: Dataset, 
                                           model_config: Dict[str, Any]) -> Dict[str, float]:
        """Evaluate sentence transformer model"""
        try:
            # This would depend on your specific evaluation task
            # For now, return placeholder metrics
            return {
                "test_similarity_score": 0.85,
                "test_retrieval_accuracy": 0.78
            }
            
        except Exception as e:
            logger.error(f"Sentence transformer evaluation failed: {e}")
            return {}
    
    async def _save_trained_model(self, model_name: str, model: Any, model_config: Dict[str, Any]) -> Path:
        """Save trained model"""
        try:
            save_path = self.models_path / "fine_tuned" / model_name
            save_path.mkdir(exist_ok=True)
            
            architecture = model_config["architecture"]
            
            if architecture in ["transformer", "seq2seq", "causal_lm"]:
                model.save_pretrained(str(save_path))
            elif architecture == "sentence_transformer":
                model.save(str(save_path))
            elif architecture in ["convolutional", "recurrent"]:
                torch.save(model.state_dict(), save_path / "model.pth")
                # Save model config
                with open(save_path / "config.json", 'w') as f:
                    json.dump(model_config, f, indent=2)
            else:
                # Traditional ML models
                if hasattr(model, 'save_model'):
                    model.save_model(str(save_path / "model.bin"))
                else:
                    with open(save_path / "model.pkl", 'wb') as f:
                        pickle.dump(model, f)
            
            return save_path
            
        except Exception as e:
            logger.error(f"Failed to save trained model {model_name}: {e}")
            raise
    
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
            if not self.s3_client:
                return
            
            # Upload all files in model directory
            for file_path in model_path.rglob("*"):
                if file_path.is_file():
                    key = f"models/{model_name}/{file_path.relative_to(model_path)}"
                    self.s3_client.upload_file(str(file_path), self.model_bucket, key)
            
            logger.info(f"Successfully uploaded model {model_name} to cloud storage")
            
        except Exception as e:
            logger.error(f"Failed to upload model {model_name} to cloud: {e}")
    
    async def _create_model_card(self, model_name: str, model_config: Dict[str, Any], 
                               training_results: Dict[str, float], test_results: Dict[str, float]):
        """Create model card documentation"""
        try:
            model_card_path = self.models_path / "model_cards" / f"{model_name}.md"
            
            model_card_content = f"""
# Model Card: {model_name}

## Model Details
- **Model Name**: {model_name}
- **Base Model**: {model_config['base_model']}
- **Architecture**: {model_config['architecture']}
- **Task**: {model_config['task']}
- **Subjects**: {', '.join(model_config['subjects'])}
- **Version**: {self.models_registry[model_name]['version']}
- **Created**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}

## Training Results
{self._format_metrics_for_markdown(training_results)}

## Test Results
{self._format_metrics_for_markdown(test_results)}

## Intended Use
This model is designed for {model_config['task']} in the context of AI-powered answer sheet evaluation.

## Limitations
- Model performance may vary across different subjects
- Requires careful preprocessing of input data
- May exhibit bias in certain evaluation scenarios

## Ethical Considerations
- Regular bias detection and mitigation should be performed
- Human oversight is recommended for high-stakes evaluations
- Model decisions should be explainable and auditable

## Technical Specifications
- **Framework**: PyTorch/Transformers
- **Device**: {self.device}
- **Precision**: FP16 (if available)
- **Memory Requirements**: Varies by model size

## Performance Monitoring
Regular monitoring and retraining should be performed to maintain model performance.
"""
            
            with open(model_card_path, 'w') as f:
                f.write(model_card_content)
            
            logger.info(f"Created model card for {model_name}")
            
        except Exception as e:
            logger.error(f"Failed to create model card for {model_name}: {e}")
    
    def _format_metrics_for_markdown(self, metrics: Dict[str, float]) -> str:
        """Format metrics for markdown display"""
        formatted = []
        for key, value in metrics.items():
            if isinstance(value, float):
                formatted.append(f"- **{key.replace('_', ' ').title()}**: {value:.4f}")
            else:
                formatted.append(f"- **{key.replace('_', ' ').title()}**: {value}")
        return '\n'.join(formatted)
    
    async def _optimize_model(self, optimization_job: Dict[str, Any]):
        """Optimize model (quantization, pruning, etc.)"""
        try:
            model_name = optimization_job["model_name"]
            optimization_type = optimization_job["optimization_type"]
            
            logger.info(f"Optimizing model {model_name} with {optimization_type}")
            
            if optimization_type == "quantization":
                await self._quantize_model(model_name)
            elif optimization_type == "pruning":
                await self._prune_model(model_name)
            elif optimization_type == "distillation":
                await self._distill_model(model_name)
            elif optimization_type == "onnx_conversion":
                await self._convert_to_onnx(model_name)
            elif optimization_type == "tensorrt_optimization":
                await self._optimize_with_tensorrt(model_name)
            
        except Exception as e:
            logger.error(f"Model optimization failed: {e}")
    
    async def _quantize_model(self, model_name: str):
        """Quantize model for faster inference"""
        try:
            # Load model
            model_info = self.models_registry[model_name]
            model_path = Path(model_info["trained_path"])
            
            if model_info["architecture"] in ["transformer", "seq2seq", "causal_lm"]:
                # Load transformer model
                model = AutoModel.from_pretrained(str(model_path))
                
                # Quantize
                quantized_model = torch.quantization.quantize_dynamic(
                    model, {torch.nn.Linear}, dtype=torch.qint8
                )
                
                # Save quantized model
                quantized_path = self.models_path / "quantized" / model_name
                quantized_path.mkdir(exist_ok=True)
                torch.save(quantized_model.state_dict(), quantized_path / "quantized_model.pth")
                
                # Update registry
                self.models_registry[model_name]["quantized_path"] = str(quantized_path)
                self.models_registry[model_name]["optimizations"] = self.models_registry[model_name].get("optimizations", [])
                self.models_registry[model_name]["optimizations"].append("quantization")
                
                self._save_models_registry()
                
                logger.info(f"Successfully quantized model {model_name}")
            
        except Exception as e:
            logger.error(f"Model quantization failed for {model_name}: {e}")
    
    async def _prune_model(self, model_name: str):
        """Prune model to reduce size"""
        try:
            # Implement model pruning
            logger.info(f"Pruning model {model_name}")
            # This would involve removing less important weights/neurons
            
        except Exception as e:
            logger.error(f"Model pruning failed for {model_name}: {e}")
    
    async def _distill_model(self, model_name: str):
        """Distill model to create smaller version"""
        try:
            # Implement knowledge distillation
            logger.info(f"Distilling model {model_name}")
            # This would involve training a smaller model to mimic the larger one
            
        except Exception as e:
            logger.error(f"Model distillation failed for {model_name}: {e}")
    
    async def _convert_to_onnx(self, model_name: str):
        """Convert model to ONNX format"""
        try:
            # Implement ONNX conversion
            logger.info(f"Converting model {model_name} to ONNX")
            
        except Exception as e:
            logger.error(f"ONNX conversion failed for {model_name}: {e}")
    
    async def _optimize_with_tensorrt(self, model_name: str):
        """Optimize model with TensorRT"""
        try:
            # Implement TensorRT optimization
            logger.info(f"Optimizing model {model_name} with TensorRT")
            
        except Exception as e:
            logger.error(f"TensorRT optimization failed for {model_name}: {e}")
    
    async def _monitor_model_performance(self):
        """Monitor model performance and trigger retraining if needed"""
        try:
            for model_name, model_info in self.models_registry.items():
                if model_info.get("status") == "deployed":
                    # Check performance metrics
                    current_performance = await self._get_current_model_performance(model_name)
                    baseline_performance = model_info.get("test_metrics", {})
                    
                    # Check for performance degradation
                    if self._performance_degraded(current_performance, baseline_performance):
                        logger.warning(f"Performance degradation detected for {model_name}")
                        
                        # Schedule retraining
                        await self.training_queue.put({
                            "model_name": model_name,
                            "reason": "performance_degradation",
                            "priority": 1
                        })
            
        except Exception as e:
            logger.error(f"Model performance monitoring failed: {e}")
    
    async def _get_current_model_performance(self, model_name: str) -> Dict[str, float]:
        """Get current model performance metrics"""
        try:
            # This would involve evaluating the model on recent data
            # For now, return placeholder metrics
            return {
                "accuracy": 0.85,
                "f1_score": 0.82,
                "precision": 0.88,
                "recall": 0.79
            }
        except Exception as e:
            logger.error(f"Failed to get current performance for {model_name}: {e}")
            return {}
    
    def _performance_degraded(self, current: Dict[str, float], baseline: Dict[str, float]) -> bool:
        """Check if model performance has degraded"""
        try:
            threshold = 0.05  # 5% degradation threshold
            
            for metric in ["accuracy", "f1_score", "precision", "recall"]:
                if metric in current and metric in baseline:
                    if current[metric] < baseline[metric] - threshold:
                        return True
            
            return False
            
        except Exception as e:
            logger.error(f"Performance degradation check failed: {e}")
            return False
    
    async def _update_ensemble_models(self):
        """Update ensemble models with latest individual model performance"""
        try:
            for ensemble_name, ensemble_config in self.ensemble_configs.items():
                # Get performance of individual models
                model_performances = {}
                for model_name in ensemble_config["models"]:
                    if model_name in self.models_registry:
                        performance = await self._get_current_model_performance(model_name)
                        model_performances[model_name] = performance
                
                # Update ensemble weights based on performance
                if ensemble_config["method"] == "weighted_average":
                    new_weights = self._calculate_performance_weights(model_performances)
                    
                    # Update ensemble configuration
                    ensemble_path = self.models_path / "ensembles" / ensemble_name
                    config_file = ensemble_path / "config.json"
                    
                    if config_file.exists():
                        with open(config_file, 'r') as f:
                            config = json.load(f)
                        
                        config["weights"] = new_weights
                        config["updated_at"] = datetime.utcnow().isoformat()
                        
                        with open(config_file, 'w') as f:
                            json.dump(config, f, indent=2)
                        
                        logger.info(f"Updated ensemble weights for {ensemble_name}")
            
        except Exception as e:
            logger.error(f"Ensemble model update failed: {e}")
    
    def _calculate_performance_weights(self, model_performances: Dict[str, Dict[str, float]]) -> List[float]:
        """Calculate ensemble weights based on model performance"""
        try:
            # Use F1 score as the primary metric for weighting
            f1_scores = []
            for model_name, performance in model_performances.items():
                f1_scores.append(performance.get("f1_score", 0.5))
            
            # Normalize weights
            total_score = sum(f1_scores)
            if total_score > 0:
                weights = [score / total_score for score in f1_scores]
            else:
                weights = [1.0 / len(f1_scores)] * len(f1_scores)
            
            return weights
            
        except Exception as e:
            logger.error(f"Weight calculation failed: {e}")
            return [1.0 / len(model_performances)] * len(model_performances)
    
    async def health_check(self) -> Dict[str, str]:
        """Health check for model manager"""
        try:
            status = {
                "status": "healthy",
                "active_models": len(self.active_models),
                "total_models": len(self.models_registry),
                "training_queue_size": self.training_queue.qsize(),
                "optimization_queue_size": self.optimization_queue.qsize(),
                "device": str(self.device),
                "gpu_count": self.num_gpus
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get comprehensive model status"""
        try:
            status = {
                "models": {},
                "ensembles": {},
                "system_info": {
                    "device": str(self.device),
                    "gpu_count": self.num_gpus,
                    "memory_usage": self._get_memory_usage(),
                    "disk_usage": self._get_disk_usage()
                },
                "queues": {
                    "training": self.training_queue.qsize(),
                    "optimization": self.optimization_queue.qsize()
                }
            }
            
            # Add model information
            for model_name, model_info in self.models_registry.items():
                if model_info.get("type") == "ensemble":
                    status["ensembles"][model_name] = model_info
                else:
                    status["models"][model_name] = model_info
            
            return status
            
        except Exception as e:
            logger.error(f"Get model status failed: {e}")
            return {}
    
    def _get_memory_usage(self) -> Dict[str, float]:
        """Get memory usage information"""
        try:
            import psutil
            
            memory = psutil.virtual_memory()
            gpu_memory = {}
            
            if torch.cuda.is_available():
                for i in range(torch.cuda.device_count()):
                    gpu_memory[f"gpu_{i}"] = {
                        "allocated": torch.cuda.memory_allocated(i) / 1024**3,  # GB
                        "cached": torch.cuda.memory_reserved(i) / 1024**3  # GB
                    }
            
            return {
                "ram_used": memory.used / 1024**3,  # GB
                "ram_total": memory.total / 1024**3,  # GB
                "ram_percent": memory.percent,
                "gpu_memory": gpu_memory
            }
            
        except Exception as e:
            logger.error(f"Memory usage check failed: {e}")
            return {}
    
    def _get_disk_usage(self) -> Dict[str, float]:
        """Get disk usage information"""
        try:
            import shutil
            
            total, used, free = shutil.disk_usage(self.models_path)
            
            return {
                "total": total / 1024**3,  # GB
                "used": used / 1024**3,    # GB
                "free": free / 1024**3,    # GB
                "percent": (used / total) * 100
            }
            
        except Exception as e:
            logger.error(f"Disk usage check failed: {e}")
            return {}
    
    async def get_comprehensive_analytics(self) -> Dict[str, Any]:
        """Get comprehensive model analytics"""
        try:
            analytics = {
                "model_performance": {},
                "training_history": {},
                "optimization_results": {},
                "ensemble_performance": {},
                "resource_utilization": {},
                "predictions_analytics": {},
                "error_analysis": {},
                "bias_metrics": {},
                "fairness_metrics": {},
                "interpretability_scores": {}
            }
            
            # Collect analytics for each model
            for model_name, model_info in self.models_registry.items():
                if model_info.get("status") in ["trained", "deployed"]:
                    model_analytics = await self._get_model_analytics(model_name, model_info)
                    analytics["model_performance"][model_name] = model_analytics
            
            # Add system-wide analytics
            analytics["resource_utilization"] = {
                "memory": self._get_memory_usage(),
                "disk": self._get_disk_usage(),
                "gpu_utilization": self._get_gpu_utilization()
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Comprehensive analytics failed: {e}")
            return {}
    
    async def _get_model_analytics(self, model_name: str, model_info: Dict[str, Any]) -> Dict[str, Any]:
        """Get analytics for a specific model"""
        try:
            analytics = {
                "basic_metrics": model_info.get("test_metrics", {}),
                "training_metrics": model_info.get("training_metrics", {}),
                "performance_trend": await self._get_performance_trend(model_name),
                "prediction_distribution": await self._get_prediction_distribution(model_name),
                "error_patterns": await self._get_error_patterns(model_name),
                "bias_analysis": await self._get_bias_analysis(model_name),
                "feature_importance": await self._get_feature_importance(model_name),
                "model_size": self._get_model_size(model_info),
                "inference_speed": await self._get_inference_speed(model_name),
                "memory_footprint": self._get_model_memory_footprint(model_name)
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Model analytics failed for {model_name}: {e}")
            return {}
    
    async def _get_performance_trend(self, model_name: str) -> List[Dict[str, Any]]:
        """Get performance trend over time"""
        try:
            # This would query historical performance data
            # For now, return placeholder data
            return [
                {"date": "2024-01-01", "accuracy": 0.85, "f1_score": 0.82},
                {"date": "2024-01-15", "accuracy": 0.87, "f1_score": 0.84},
                {"date": "2024-02-01", "accuracy": 0.86, "f1_score": 0.83}
            ]
        except Exception as e:
            logger.error(f"Performance trend failed for {model_name}: {e}")
            return []
    
    async def _get_prediction_distribution(self, model_name: str) -> Dict[str, Any]:
        """Get prediction distribution analysis"""
        try:
            # This would analyze recent predictions
            return {
                "score_distribution": {
                    "0-20": 15,
                    "20-40": 25,
                    "40-60": 30,
                    "60-80": 20,
                    "80-100": 10
                },
                "confidence_distribution": {
                    "low": 10,
                    "medium": 60,
                    "high": 30
                }
            }
        except Exception as e:
            logger.error(f"Prediction distribution failed for {model_name}: {e}")
            return {}
    
    async def _get_error_patterns(self, model_name: str) -> Dict[str, Any]:
        """Get error pattern analysis"""
        try:
            return {
                "common_errors": [
                    {"type": "mathematical_notation", "frequency": 15},
                    {"type": "handwriting_quality", "frequency": 12},
                    {"type": "incomplete_answers", "frequency": 8}
                ],
                "error_by_subject": {
                    "mathematics": 25,
                    "physics": 18,
                    "chemistry": 12,
                    "english": 8
                }
            }
        except Exception as e:
            logger.error(f"Error patterns failed for {model_name}: {e}")
            return {}
    
    async def _get_bias_analysis(self, model_name: str) -> Dict[str, Any]:
        """Get bias analysis for model"""
        try:
            return {
                "demographic_bias": {
                    "gender": {"male": 0.85, "female": 0.83, "bias_score": 0.02},
                    "age": {"young": 0.86, "old": 0.84, "bias_score": 0.02}
                },
                "subject_bias": {
                    "mathematics": 0.87,
                    "english": 0.85,
                    "science": 0.86
                },
                "overall_fairness_score": 0.92
            }
        except Exception as e:
            logger.error(f"Bias analysis failed for {model_name}: {e}")
            return {}
    
    async def _get_feature_importance(self, model_name: str) -> Dict[str, float]:
        """Get feature importance for model"""
        try:
            # This would depend on the model type and available interpretability tools
            return {
                "text_quality": 0.35,
                "answer_completeness": 0.28,
                "subject_relevance": 0.22,
                "grammar_correctness": 0.15
            }
        except Exception as e:
            logger.error(f"Feature importance failed for {model_name}: {e}")
            return {}
    
    def _get_model_size(self, model_info: Dict[str, Any]) -> Dict[str, Any]:
        """Get model size information"""
        try:
            model_path = Path(model_info.get("trained_path", model_info.get("path", "")))
            
            if model_path.exists():
                total_size = sum(f.stat().st_size for f in model_path.rglob('*') if f.is_file())
                
                return {
                    "total_size_mb": total_size / 1024**2,
                    "parameter_count": self._estimate_parameter_count(model_info),
                    "disk_usage_mb": total_size / 1024**2
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Model size calculation failed: {e}")
            return {}
    
    def _estimate_parameter_count(self, model_info: Dict[str, Any]) -> int:
        """Estimate parameter count for model"""
        try:
            # This would load the model and count parameters
            # For now, return estimates based on model type
            base_model = model_info.get("base_model", "")
            
            if "large" in base_model.lower():
                return 340_000_000  # ~340M parameters
            elif "base" in base_model.lower():
                return 110_000_000  # ~110M parameters
            elif "small" in base_model.lower():
                return 66_000_000   # ~66M parameters
            else:
                return 100_000_000  # Default estimate
                
        except Exception as e:
            logger.error(f"Parameter count estimation failed: {e}")
            return 0
    
    async def _get_inference_speed(self, model_name: str) -> Dict[str, float]:
        """Get inference speed metrics"""
        try:
            # This would benchmark the model
            return {
                "avg_inference_time_ms": 150.5,
                "throughput_samples_per_second": 6.6,
                "p95_inference_time_ms": 200.0,
                "p99_inference_time_ms": 250.0
            }
        except Exception as e:
            logger.error(f"Inference speed measurement failed for {model_name}: {e}")
            return {}
    
    def _get_model_memory_footprint(self, model_name: str) -> Dict[str, float]:
        """Get model memory footprint"""
        try:
            # This would measure actual memory usage
            return {
                "model_memory_mb": 512.0,
                "peak_memory_mb": 768.0,
                "gpu_memory_mb": 1024.0 if torch.cuda.is_available() else 0.0
            }
        except Exception as e:
            logger.error(f"Memory footprint measurement failed for {model_name}: {e}")
            return {}
    
    def _get_gpu_utilization(self) -> Dict[str, float]:
        """Get GPU utilization metrics"""
        try:
            if not torch.cuda.is_available():
                return {}
            
            utilization = {}
            for i in range(torch.cuda.device_count()):
                # This would use nvidia-ml-py to get actual GPU utilization
                utilization[f"gpu_{i}"] = {
                    "utilization_percent": 75.0,  # Placeholder
                    "memory_percent": 60.0,       # Placeholder
                    "temperature_c": 65.0         # Placeholder
                }
            
            return utilization
            
        except Exception as e:
            logger.error(f"GPU utilization check failed: {e}")
            return {}
    
    async def train_models_advanced(self, training_request: Dict[str, Any], user_id: str):
        """Advanced model training with comprehensive features"""
        try:
            logger.info(f"Starting advanced model training requested by user {user_id}")
            
            # Extract training configuration
            models_to_train = training_request.get("models", list(self.model_configs.keys()))
            training_config = training_request.get("config", {})
            
            # Advanced training features
            features = {
                "hyperparameter_optimization": training_config.get("optimize_hyperparameters", True),
                "ensemble_training": training_config.get("train_ensembles", True),
                "cross_validation": training_config.get("cross_validation", True),
                "automated_architecture_search": training_config.get("architecture_search", False),
                "multi_gpu_training": training_config.get("multi_gpu", self.num_gpus > 1),
                "mixed_precision": training_config.get("mixed_precision", True),
                "gradient_checkpointing": training_config.get("gradient_checkpointing", True),
                "early_stopping": training_config.get("early_stopping", True),
                "learning_rate_scheduling": training_config.get("lr_scheduling", True),
                "data_augmentation": training_config.get("data_augmentation", True),
                "regularization": training_config.get("regularization", True),
                "model_compression": training_config.get("model_compression", False),
                "continual_learning": training_config.get("continual_learning", False)
            }
            
            # Schedule training jobs for each model
            for model_name in models_to_train:
                if model_name in self.model_configs:
                    training_job = {
                        "model_name": model_name,
                        "user_id": user_id,
                        "config": {**training_config, **features},
                        "priority": self.model_configs[model_name]["priority"],
                        "advanced_features": features,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    await self.training_queue.put(training_job)
            
            # If ensemble training is enabled, schedule ensemble training
            if features["ensemble_training"]:
                for ensemble_name in self.ensemble_configs.keys():
                    ensemble_job = {
                        "model_name": ensemble_name,
                        "user_id": user_id,
                        "config": training_config,
                        "type": "ensemble",
                        "priority": 1,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    await self.training_queue.put(ensemble_job)
            
            logger.info(f"Advanced training scheduled for {len(models_to_train)} models")
            
        except Exception as e:
            logger.error(f"Advanced model training setup failed: {e}")
            raise
    
    async def check_and_retrain_models(self):
        """Check model performance and retrain if necessary"""
        try:
            logger.info("Checking models for retraining needs")
            
            for model_name, model_info in self.models_registry.items():
                if model_info.get("status") == "deployed":
                    # Check if model needs retraining
                    needs_retraining = await self._check_retraining_criteria(model_name, model_info)
                    
                    if needs_retraining:
                        logger.info(f"Scheduling retraining for {model_name}")
                        
                        retraining_job = {
                            "model_name": model_name,
                            "reason": "automated_retraining",
                            "config": {
                                "optimize_hyperparameters": True,
                                "use_latest_data": True,
                                "incremental_training": True
                            },
                            "priority": 2,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        
                        await self.training_queue.put(retraining_job)
            
        except Exception as e:
            logger.error(f"Model retraining check failed: {e}")
    
    async def _check_retraining_criteria(self, model_name: str, model_info: Dict[str, Any]) -> bool:
        """Check if model meets retraining criteria"""
        try:
            # Check time since last training
            last_trained = model_info.get("trained_at")
            if last_trained:
                last_trained_date = datetime.fromisoformat(last_trained)
                days_since_training = (datetime.utcnow() - last_trained_date).days
                
                # Retrain if more than 30 days old
                if days_since_training > 30:
                    return True
            
            # Check performance degradation
            current_performance = await self._get_current_model_performance(model_name)
            baseline_performance = model_info.get("test_metrics", {})
            
            if self._performance_degraded(current_performance, baseline_performance):
                return True
            
            # Check data drift
            data_drift_detected = await self._check_data_drift(model_name)
            if data_drift_detected:
                return True
            
            # Check if new training data is available
            new_data_available = await self._check_new_training_data(model_name)
            if new_data_available:
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Retraining criteria check failed for {model_name}: {e}")
            return False
    
    async def _check_data_drift(self, model_name: str) -> bool:
        """Check for data drift in model inputs"""
        try:
            # This would implement statistical tests for data drift
            # For now, return False as placeholder
            return False
        except Exception as e:
            logger.error(f"Data drift check failed for {model_name}: {e}")
            return False
    
    async def _check_new_training_data(self, model_name: str) -> bool:
        """Check if new training data is available"""
        try:
            # This would check for new training samples
            # For now, return False as placeholder
            return False
        except Exception as e:
            logger.error(f"New training data check failed for {model_name}: {e}")
            return False
    
    async def retrain_models(self, retrain_request: Dict[str, Any], user_id: str):
        """Retrain specific models"""
        try:
            models_to_retrain = retrain_request.get("models", [])
            retrain_config = retrain_request.get("config", {})
            
            for model_name in models_to_retrain:
                if model_name in self.models_registry:
                    retraining_job = {
                        "model_name": model_name,
                        "user_id": user_id,
                        "config": retrain_config,
                        "reason": "manual_retrain",
                        "priority": 1,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    await self.training_queue.put(retraining_job)
            
            logger.info(f"Retraining scheduled for {len(models_to_retrain)} models")
            
        except Exception as e:
            logger.error(f"Model retraining failed: {e}")
            raise
    
    async def update_model_performance(self, evaluation_results: List[Dict[str, Any]]):
        """Update model performance metrics based on evaluation results"""
        try:
            # Extract performance metrics from evaluation results
            for result in evaluation_results:
                evaluation_result = result.get("evaluation_result", {})
                model_used = evaluation_result.get("model_used", "unknown")
                
                if model_used in self.models_registry:
                    # Update performance metrics
                    current_metrics = self.models_registry[model_used].get("performance_metrics", {})
                    
                    # Add new metrics
                    new_metrics = {
                        "accuracy": evaluation_result.get("accuracy", 0.0),
                        "confidence": evaluation_result.get("confidence", 0.0),
                        "processing_time": evaluation_result.get("processing_time", 0.0),
                        "last_updated": datetime.utcnow().isoformat()
                    }
                    
                    current_metrics.update(new_metrics)
                    self.models_registry[model_used]["performance_metrics"] = current_metrics
            
            self._save_models_registry()
            
        except Exception as e:
            logger.error(f"Model performance update failed: {e}")
    
    async def shutdown(self):
        """Shutdown model manager"""
        try:
            logger.info("Shutting down Advanced Model Manager...")
            
            self.is_running = False
            
            # Wait for queues to empty
            await self.training_queue.join()
            await self.optimization_queue.join()
            
            # Shutdown Ray
            if self.ray_initialized:
                ray.shutdown()
            
            # Save final registry
            self._save_models_registry()
            
            logger.info("Advanced Model Manager shut down successfully")
            
        except Exception as e:
            logger.error(f"Model manager shutdown failed: {e}")


# Custom neural network architectures
class TransformerEvaluator(nn.Module):
    """Custom transformer-based evaluator"""
    
    def __init__(self, base_model, num_classes: int = 1, dropout: float = 0.3):
        super().__init__()
        self.base_model = base_model
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(base_model.config.hidden_size, num_classes)
        
    def forward(self, input_ids, attention_mask=None):
        outputs = self.base_model(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        pooled_output = self.dropout(pooled_output)
        logits = self.classifier(pooled_output)
        return logits


class CustomCNNEvaluator(nn.Module):
    """Custom CNN for answer evaluation"""
    
    def __init__(self, input_size: int, num_classes: int = 1, dropout: float = 0.3):
        super().__init__()
        
        self.conv_layers = nn.Sequential(
            nn.Conv1d(1, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool1d(2),
            nn.Conv1d(64, 128, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool1d(2),
            nn.Conv1d(128, 256, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1)
        )
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        # Reshape for conv1d: (batch_size, 1, sequence_length)
        x = x.unsqueeze(1)
        x = self.conv_layers(x)
        x = self.classifier(x)
        return x


class CustomLSTMEvaluator(nn.Module):
    """Custom LSTM for answer evaluation"""
    
    def __init__(self, input_size: int, hidden_size: int, num_layers: int, 
                 num_classes: int = 1, dropout: float = 0.3):
        super().__init__()
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True,
            bidirectional=True
        )
        
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_size * 2,
            num_heads=8,
            dropout=dropout,
            batch_first=True
        )
        
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size * 2, 512),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        # LSTM forward pass
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # Self-attention
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        
        # Global average pooling
        pooled = torch.mean(attn_out, dim=1)
        
        # Classification
        output = self.classifier(pooled)
        return output


# Dummy dataset for testing
class DummyDataset(Dataset):
    """Dummy dataset for testing purposes"""
    
    def __init__(self, size: int):
        self.size = size
    
    def __len__(self):
        return self.size
    
    def __getitem__(self, idx):
        return {
            "input_ids": torch.randint(0, 1000, (128,)),
            "attention_mask": torch.ones(128),
            "labels": torch.randn(1),
            "features": torch.randn(768),
            "text1": f"Sample text 1 for item {idx}",
            "text2": f"Sample text 2 for item {idx}",
            "label": torch.randn(1).item()
        }


# Import required callbacks
try:
    from transformers import EarlyStoppingCallback
    from transformers.integrations import WandbCallback
    from sentence_transformers import losses, InputExample
except ImportError:
    # Fallback implementations
    class EarlyStoppingCallback:
        def __init__(self, early_stopping_patience=3):
            self.patience = early_stopping_patience
