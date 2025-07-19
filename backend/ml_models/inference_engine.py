import asyncio
import logging
from typing import Dict, Any, List, Optional, Tuple, Union
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel, pipeline
import numpy as np
import pandas as pd
from pathlib import Path
import json
from datetime import datetime
import pickle
import cv2
from PIL import Image
import torchvision.transforms as transforms
from sentence_transformers import SentenceTransformer
import faiss
import onnxruntime as ort
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import asyncio
import aiohttp
import redis.asyncio as redis
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import spacy
import re
import time
from collections import defaultdict, deque
import threading
from dataclasses import dataclass
from enum import Enum
import hashlib
import base64
import easyocr
import pytesseract
from paddleocr import PaddleOCR
import openai
import anthropic
import google.generativeai as genai

logger = logging.getLogger(__name__)

class ModelType(Enum):
    TRANSFORMER = "transformer"
    TRADITIONAL_ML = "traditional_ml"
    ENSEMBLE = "ensemble"
    ONNX = "onnx"
    TENSORRT = "tensorrt"
    QUANTIZED = "quantized"

@dataclass
class InferenceRequest:
    """Inference request data structure"""
    request_id: str
    model_name: str
    input_data: Dict[str, Any]
    priority: int = 1
    timestamp: datetime = None
    user_id: str = None
    session_id: str = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()

@dataclass
class InferenceResult:
    """Inference result data structure"""
    request_id: str
    model_name: str
    predictions: Dict[str, Any]
    confidence: float
    processing_time: float
    model_version: str
    metadata: Dict[str, Any] = None

class InferenceEngine:
    """Production-level inference engine with advanced features"""
    
    def __init__(self, config_path: str = "config/inference_config.json"):
        self.config_path = Path(config_path)
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.num_gpus = torch.cuda.device_count()
        
        # Model registry and cache
        self.model_registry = {}
        self.model_cache = {}
        self.tokenizer_cache = {}
        self.pipeline_cache = {}
        
        # Performance optimization
        self.use_mixed_precision = True
        self.use_model_compilation = True
        self.use_dynamic_batching = True
        self.use_model_parallelism = self.num_gpus > 1
        
        # Caching and optimization
        self.use_redis_cache = True
        self.use_memory_cache = True
        self.cache_ttl = 3600
        self.max_cache_size = 1000
        
        # Load balancing and scaling
        self.max_concurrent_requests = 100
        self.request_timeout = 30.0
        
        # Request queue and processing
        self.request_queue = asyncio.PriorityQueue()
        self.processing_requests = {}
        
        # Performance metrics
        self.performance_metrics = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'average_latency': 0.0,
            'throughput': 0.0,
            'cache_hit_rate': 0.0
        }
        
        # Thread pools
        self.cpu_executor = ThreadPoolExecutor(max_workers=8)
        self.gpu_executor = ThreadPoolExecutor(max_workers=4)
        
        # Redis client
        self.redis_client = None
        
        # OCR engines
        self.ocr_engines = {}
        
        # AI model clients
        self.openai_client = None
        self.anthropic_client = None
        self.google_client = None
        
        # Initialize components
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize inference engine components"""
        try:
            self._load_configuration()
            self._initialize_caching()
            self._create_directories()
            logger.info("Inference engine components initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize inference engine components: {e}")
            raise
    
    def _load_configuration(self):
        """Load inference configuration"""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r') as f:
                    self.config = json.load(f)
            else:
                self.config = self._get_default_config()
                self._save_configuration()
        except Exception as e:
            logger.error(f"Failed to load configuration: {e}")
            self.config = self._get_default_config()
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default inference configuration"""
        return {
            "performance": {
                "batch_size": 32,
                "max_sequence_length": 512,
                "use_mixed_precision": True,
                "use_dynamic_batching": True
            },
            "caching": {
                "use_redis_cache": True,
                "cache_ttl": 3600,
                "max_cache_size": 1000
            },
            "models": {
                "preload_models": ["bert_evaluator", "trocr", "plagiarism_detector"]
            }
        }
    
    def _save_configuration(self):
        """Save inference configuration"""
        try:
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save configuration: {e}")
    
    def _initialize_caching(self):
        """Initialize caching systems"""
        try:
            self.memory_cache = {}
            self.cache_access_times = {}
            self.cache_lock = threading.RLock()
            logger.info("Caching systems initialized")
        except Exception as e:
            logger.warning(f"Caching initialization failed: {e}")
    
    def _create_directories(self):
        """Create necessary directories"""
        directories = ["models/inference", "cache", "logs/inference", "metrics"]
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
    
    async def initialize(self):
        """Initialize inference engine"""
        try:
            logger.info("Initializing Inference Engine...")
            
            # Initialize Redis
            await self._initialize_redis()
            
            # Initialize OCR engines
            await self._initialize_ocr_engines()
            
            # Initialize AI model clients
            await self._initialize_ai_clients()
            
            # Load pre-trained models
            await self._load_pretrained_models()
            
            # Start background tasks
            asyncio.create_task(self._background_cache_cleanup())
            asyncio.create_task(self._background_metrics_collection())
            
            logger.info("Inference Engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize inference engine: {e}")
            raise
    
    async def _initialize_redis(self):
        """Initialize Redis connection"""
        try:
            redis_url = self.config.get("caching", {}).get("redis_url", "redis://localhost:6379")
            self.redis_client = redis.from_url(redis_url)
            await self.redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning(f"Redis initialization failed: {e}")
            self.redis_client = None
    
    async def _initialize_ocr_engines(self):
        """Initialize OCR engines"""
        try:
            # EasyOCR
            self.ocr_engines['easyocr'] = easyocr.Reader(['en'])
            
            # PaddleOCR
            self.ocr_engines['paddleocr'] = PaddleOCR(use_angle_cls=True, lang='en')
            
            # Tesseract is initialized per request
            
            logger.info("OCR engines initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize OCR engines: {e}")
    
    async def _initialize_ai_clients(self):
        """Initialize AI model clients"""
        try:
            # OpenAI
            openai.api_key = "your-openai-api-key"
            self.openai_client = openai
            
            # Anthropic
            self.anthropic_client = anthropic.Anthropic(api_key="your-anthropic-key")
            
            # Google AI
            genai.configure(api_key="your-google-ai-key")
            self.google_client = genai
            
            logger.info("AI model clients initialized")
            
        except Exception as e:
            logger.warning(f"AI client initialization failed: {e}")
    
    async def _load_pretrained_models(self):
        """Load pre-trained models"""
        try:
            preload_models = self.config.get("models", {}).get("preload_models", [])
            
            for model_name in preload_models:
                await self._load_model(model_name)
            
            logger.info(f"Pre-loaded {len(preload_models)} models")
            
        except Exception as e:
            logger.error(f"Failed to load pre-trained models: {e}")
    
    async def _load_model(self, model_name: str):
        """Load a specific model"""
        try:
            if model_name in self.model_cache:
                return self.model_cache[model_name]
            
            if model_name == 'bert_evaluator':
                model = await self._load_bert_evaluator()
            elif model_name == 'roberta_evaluator':
                model = await self._load_roberta_evaluator()
            elif model_name == 'trocr':
                model = await self._load_trocr_model()
            elif model_name == 'plagiarism_detector':
                model = await self._load_plagiarism_detector()
            elif model_name == 'bias_detector':
                model = await self._load_bias_detector()
            else:
                raise ValueError(f"Unknown model: {model_name}")
            
            self.model_cache[model_name] = model
            logger.info(f"Model {model_name} loaded successfully")
            
            return model
            
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            raise
    
    async def _load_bert_evaluator(self):
        """Load BERT evaluator model"""
        try:
            tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
            model = AutoModel.from_pretrained('bert-base-uncased')
            
            # Add custom evaluation head
            class BertEvaluator(nn.Module):
                def __init__(self, bert_model):
                    super().__init__()
                    self.bert = bert_model
                    self.dropout = nn.Dropout(0.1)
                    self.classifier = nn.Linear(768, 1)
                
                def forward(self, input_ids, attention_mask):
                    outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
                    pooled_output = outputs.pooler_output
                    pooled_output = self.dropout(pooled_output)
                    score = self.classifier(pooled_output)
                    return score
            
            evaluator = BertEvaluator(model)
            evaluator.to(self.device)
            evaluator.eval()
            
            self.tokenizer_cache['bert_evaluator'] = tokenizer
            
            return evaluator
            
        except Exception as e:
            logger.error(f"Failed to load BERT evaluator: {e}")
            raise
    
    async def _load_roberta_evaluator(self):
        """Load RoBERTa evaluator model"""
        try:
            tokenizer = AutoTokenizer.from_pretrained('roberta-base')
            model = AutoModel.from_pretrained('roberta-base')
            
            class RobertaEvaluator(nn.Module):
                def __init__(self, roberta_model):
                    super().__init__()
                    self.roberta = roberta_model
                    self.dropout = nn.Dropout(0.1)
                    self.classifier = nn.Linear(768, 1)
                
                def forward(self, input_ids, attention_mask):
                    outputs = self.roberta(input_ids=input_ids, attention_mask=attention_mask)
                    pooled_output = outputs.pooler_output
                    pooled_output = self.dropout(pooled_output)
                    score = self.classifier(pooled_output)
                    return score
            
            evaluator = RobertaEvaluator(model)
            evaluator.to(self.device)
            evaluator.eval()
            
            self.tokenizer_cache['roberta_evaluator'] = tokenizer
            
            return evaluator
            
        except Exception as e:
            logger.error(f"Failed to load RoBERTa evaluator: {e}")
            raise
    
    async def _load_trocr_model(self):
        """Load TrOCR model for handwriting recognition"""
        try:
            from transformers import TrOCRProcessor, VisionEncoderDecoderModel
            
            processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten')
            model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')
            
            model.to(self.device)
            model.eval()
            
            self.tokenizer_cache['trocr'] = processor
            
            return model
            
        except Exception as e:
            logger.error(f"Failed to load TrOCR model: {e}")
            raise
    
    async def _load_plagiarism_detector(self):
        """Load plagiarism detection model"""
        try:
            model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize FAISS index for similarity search
            dimension = 384  # MiniLM embedding dimension
            index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
            
            return {
                'model': model,
                'index': index,
                'embeddings': [],
                'texts': []
            }
            
        except Exception as e:
            logger.error(f"Failed to load plagiarism detector: {e}")
            raise
    
    async def _load_bias_detector(self):
        """Load bias detection model"""
        try:
            tokenizer = AutoTokenizer.from_pretrained('unitary/toxic-bert')
            model = AutoModel.from_pretrained('unitary/toxic-bert')
            
            class BiasDetector(nn.Module):
                def __init__(self, bert_model):
                    super().__init__()
                    self.bert = bert_model
                    self.dropout = nn.Dropout(0.1)
                    self.classifier = nn.Linear(768, 6)  # 6 bias categories
                
                def forward(self, input_ids, attention_mask):
                    outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
                    pooled_output = outputs.pooler_output
                    pooled_output = self.dropout(pooled_output)
                    bias_scores = self.classifier(pooled_output)
                    return torch.sigmoid(bias_scores)
            
            detector = BiasDetector(model)
            detector.to(self.device)
            detector.eval()
            
            self.tokenizer_cache['bias_detector'] = tokenizer
            
            return detector
            
        except Exception as e:
            logger.error(f"Failed to load bias detector: {e}")
            raise
    
    async def process_ocr_advanced(self, file_info: Dict[str, Any]) -> Dict[str, Any]:
        """Advanced OCR processing with multiple engines"""
        try:
            start_time = time.time()
            
            # Load image
            image_path = file_info['file_path']
            image = cv2.imread(image_path)
            
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Preprocess image
            processed_image = await self._preprocess_image(image)
            
            # Run multiple OCR engines
            ocr_results = {}
            
            # EasyOCR
            try:
                easyocr_result = await self._run_easyocr(processed_image)
                ocr_results['easyocr'] = easyocr_result
            except Exception as e:
                logger.warning(f"EasyOCR failed: {e}")
            
            # PaddleOCR
            try:
                paddleocr_result = await self._run_paddleocr(processed_image)
                ocr_results['paddleocr'] = paddleocr_result
            except Exception as e:
                logger.warning(f"PaddleOCR failed: {e}")
            
            # Tesseract
            try:
                tesseract_result = await self._run_tesseract(processed_image)
                ocr_results['tesseract'] = tesseract_result
            except Exception as e:
                logger.warning(f"Tesseract failed: {e}")
            
            # TrOCR for handwritten text
            try:
                trocr_result = await self._run_trocr(processed_image)
                ocr_results['trocr'] = trocr_result
            except Exception as e:
                logger.warning(f"TrOCR failed: {e}")
            
            # Ensemble the results
            final_result = await self._ensemble_ocr_results(ocr_results)
            
            processing_time = time.time() - start_time
            
            return {
                'extracted_text': final_result['text'],
                'confidence': final_result['confidence'],
                'bounding_boxes': final_result.get('bounding_boxes', []),
                'individual_results': ocr_results,
                'processing_time': processing_time,
                'image_info': {
                    'width': image.shape[1],
                    'height': image.shape[0],
                    'channels': image.shape[2] if len(image.shape) > 2 else 1
                }
            }
            
        except Exception as e:
            logger.error(f"Advanced OCR processing failed: {e}")
            raise
    
    async def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for better OCR results"""
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Noise reduction
            denoised = cv2.medianBlur(gray, 3)
            
            # Contrast enhancement
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(denoised)
            
            # Deskewing
            deskewed = await self._deskew_image(enhanced)
            
            # Binarization
            _, binary = cv2.threshold(deskewed, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            return binary
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            return image
    
    async def _deskew_image(self, image: np.ndarray) -> np.ndarray:
        """Deskew image to correct rotation"""
        try:
            # Find text lines using HoughLines
            edges = cv2.Canny(image, 50, 150, apertureSize=3)
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
            
            if lines is not None:
                # Calculate average angle
                angles = []
                for rho, theta in lines[:, 0]:
                    angle = theta * 180 / np.pi
                    if angle < 45:
                        angles.append(angle)
                    elif angle > 135:
                        angles.append(angle - 180)
                
                if angles:
                    median_angle = np.median(angles)
                    
                    # Rotate image
                    (h, w) = image.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
                    rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                    
                    return rotated
            
            return image
            
        except Exception as e:
            logger.warning(f"Deskewing failed: {e}")
            return image
    
    async def _run_easyocr(self, image: np.ndarray) -> Dict[str, Any]:
        """Run EasyOCR"""
        try:
            reader = self.ocr_engines['easyocr']
            results = reader.readtext(image)
            
            text_parts = []
            bounding_boxes = []
            confidences = []
            
            for (bbox, text, confidence) in results:
                text_parts.append(text)
                bounding_boxes.append(bbox)
                confidences.append(confidence)
            
            return {
                'text': ' '.join(text_parts),
                'confidence': np.mean(confidences) if confidences else 0.0,
                'bounding_boxes': bounding_boxes,
                'engine': 'easyocr'
            }
            
        except Exception as e:
            logger.error(f"EasyOCR processing failed: {e}")
            raise
    
    async def _run_paddleocr(self, image: np.ndarray) -> Dict[str, Any]:
        """Run PaddleOCR"""
        try:
            ocr = self.ocr_engines['paddleocr']
            results = ocr.ocr(image, cls=True)
            
            text_parts = []
            bounding_boxes = []
            confidences = []
            
            for line in results:
                for word_info in line:
                    bbox, (text, confidence) = word_info
                    text_parts.append(text)
                    bounding_boxes.append(bbox)
                    confidences.append(confidence)
            
            return {
                'text': ' '.join(text_parts),
                'confidence': np.mean(confidences) if confidences else 0.0,
                'bounding_boxes': bounding_boxes,
                'engine': 'paddleocr'
            }
            
        except Exception as e:
            logger.error(f"PaddleOCR processing failed: {e}")
            raise
    
    async def _run_tesseract(self, image: np.ndarray) -> Dict[str, Any]:
        """Run Tesseract OCR"""
        try:
            # Configure Tesseract
            config = '--oem 3 --psm 6'
            
            # Extract text
            text = pytesseract.image_to_string(image, config=config)
            
            # Get confidence scores
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, config=config)
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            
            return {
                'text': text.strip(),
                'confidence': np.mean(confidences) / 100.0 if confidences else 0.0,
                'bounding_boxes': [],
                'engine': 'tesseract'
            }
            
        except Exception as e:
            logger.error(f"Tesseract processing failed: {e}")
            raise
    
    async def _run_trocr(self, image: np.ndarray) -> Dict[str, Any]:
        """Run TrOCR for handwritten text"""
        try:
            model = self.model_cache['trocr']
            processor = self.tokenizer_cache['trocr']
            
            # Convert numpy array to PIL Image
            pil_image = Image.fromarray(image)
            
            # Process image
            pixel_values = processor(images=pil_image, return_tensors="pt").pixel_values
            pixel_values = pixel_values.to(self.device)
            
            # Generate text
            with torch.no_grad():
                generated_ids = model.generate(pixel_values)
                generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            return {
                'text': generated_text.strip(),
                'confidence': 0.85,  # TrOCR doesn't provide confidence scores
                'bounding_boxes': [],
                'engine': 'trocr'
            }
            
        except Exception as e:
            logger.error(f"TrOCR processing failed: {e}")
            raise
    
    async def _ensemble_ocr_results(self, ocr_results: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Ensemble OCR results from multiple engines"""
        try:
            if not ocr_results:
                return {'text': '', 'confidence': 0.0}
            
            # Weight engines by their typical performance
            engine_weights = {
                'trocr': 0.4,      # Best for handwritten text
                'easyocr': 0.3,    # Good general performance
                'paddleocr': 0.2,  # Good for printed text
                'tesseract': 0.1   # Fallback option
            }
            
            # Calculate weighted confidence
            total_weight = 0
            weighted_confidence = 0
            
            for engine, result in ocr_results.items():
                weight = engine_weights.get(engine, 0.1)
                confidence = result.get('confidence', 0.0)
                weighted_confidence += weight * confidence
                total_weight += weight
            
            if total_weight > 0:
                final_confidence = weighted_confidence / total_weight
            else:
                final_confidence = 0.0
            
            # Select best text based on confidence and length
            best_text = ""
            best_score = 0
            
            for engine, result in ocr_results.items():
                text = result.get('text', '').strip()
                confidence = result.get('confidence', 0.0)
                weight = engine_weights.get(engine, 0.1)
                
                # Score based on confidence, weight, and text length
                score = confidence * weight * (1 + len(text) / 1000)
                
                if score > best_score and len(text) > 0:
                    best_score = score
                    best_text = text
            
            # Combine bounding boxes from all engines
            all_bboxes = []
            for result in ocr_results.values():
                all_bboxes.extend(result.get('bounding_boxes', []))
            
            return {
                'text': best_text,
                'confidence': final_confidence,
                'bounding_boxes': all_bboxes
            }
            
        except Exception as e:
            logger.error(f"OCR ensemble failed: {e}")
            return {'text': '', 'confidence': 0.0}
    
    async def process_evaluation_ensemble(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process evaluation using ensemble of models"""
        try:
            start_time = time.time()
            
            text = input_data.get('text', '')
            metadata = input_data.get('metadata', {})
            
            # Run multiple evaluation models
            evaluation_results = {}
            
            # BERT Evaluator
            try:
                bert_result = await self._run_bert_evaluation(text, metadata)
                evaluation_results['bert'] = bert_result
            except Exception as e:
                logger.warning(f"BERT evaluation failed: {e}")
            
            # RoBERTa Evaluator
            try:
                roberta_result = await self._run_roberta_evaluation(text, metadata)
                evaluation_results['roberta'] = roberta_result
            except Exception as e:
                logger.warning(f"RoBERTa evaluation failed: {e}")
            
            # OpenAI GPT Evaluation
            try:
                if self.openai_client:
                    gpt_result = await self._run_gpt_evaluation(text, metadata)
                    evaluation_results['gpt'] = gpt_result
            except Exception as e:
                logger.warning(f"GPT evaluation failed: {e}")
            
            # Ensemble the results
            final_result = await self._ensemble_evaluation_results(evaluation_results, metadata)
            
            processing_time = time.time() - start_time
            final_result['processing_time'] = processing_time
            
            return final_result
            
        except Exception as e:
            logger.error(f"Ensemble evaluation failed: {e}")
            raise
    
    async def _run_bert_evaluation(self, text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Run BERT-based evaluation"""
        try:
            model = self.model_cache['bert_evaluator']
            tokenizer = self.tokenizer_cache['bert_evaluator']
            
            # Tokenize input
            inputs = tokenizer(
                text,
                truncation=True,
                padding=True,
                max_length=512,
                return_tensors='pt'
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Run inference
            with torch.no_grad():
                score = model(**inputs)
                score = torch.sigmoid(score).item()
            
            # Convert to percentage
            percentage = score * 100
            
            return {
                'score': percentage,
                'confidence': 0.85,
                'model': 'bert_evaluator',
                'raw_score': score
            }
            
        except Exception as e:
            logger.error(f"BERT evaluation failed: {e}")
            raise
    
    async def _run_roberta_evaluation(self, text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Run RoBERTa-based evaluation"""
        try:
            model = self.model_cache['roberta_evaluator']
            tokenizer = self.tokenizer_cache['roberta_evaluator']
            
            # Tokenize input
            inputs = tokenizer(
                text,
                truncation=True,
                padding=True,
                max_length=512,
                return_tensors='pt'
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Run inference
            with torch.no_grad():
                score = model(**inputs)
                score = torch.sigmoid(score).item()
            
            # Convert to percentage
            percentage = score * 100
            
            return {
                'score': percentage,
                'confidence': 0.87,
                'model': 'roberta_evaluator',
                'raw_score': score
            }
            
        except Exception as e:
            logger.error(f"RoBERTa evaluation failed: {e}")
            raise
    
    async def _run_gpt_evaluation(self, text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Run GPT-based evaluation"""
        try:
            subject = metadata.get('subject', 'general')
            max_marks = metadata.get('max_marks', 100)
            question = metadata.get('question', '')
            
            prompt = f"""
            You are an expert teacher evaluating a student's answer. Please provide a detailed evaluation.

            Subject: {subject}
            Question: {question}
            Student Answer: {text}
            Maximum Marks: {max_marks}

            Please evaluate the answer and provide:
            1. Score (0 to {max_marks})
            2. Brief feedback
            3. Key strengths
            4. Areas for improvement

            Respond in JSON format:
            {{
                "score": <number>,
                "feedback": "<brief feedback>",
                "strengths": ["<strength1>", "<strength2>"],
                "improvements": ["<improvement1>", "<improvement2>"]
            }}
            """
            
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=500
            )
            
            result_text = response.choices[0].message.content
            
            try:
                result = json.loads(result_text)
                return {
                    'score': result.get('score', 0),
                    'confidence': 0.9,
                    'model': 'gpt4_evaluator',
                    'feedback': result.get('feedback', ''),
                    'strengths': result.get('strengths', []),
                    'improvements': result.get('improvements', [])
                }
            except json.JSONDecodeError:
                # Fallback parsing
                return {
                    'score': max_marks * 0.7,
                    'confidence': 0.6,
                    'model': 'gpt4_evaluator',
                    'feedback': result_text
                }
                
        except Exception as e:
            logger.error(f"GPT evaluation failed: {e}")
            raise
    
    async def _ensemble_evaluation_results(self, evaluation_results: Dict[str, Dict[str, Any]], 
                                         metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Ensemble evaluation results from multiple models"""
        try:
            if not evaluation_results:
                return {'score': 0, 'confidence': 0.0}
            
            # Model weights based on performance
            model_weights = {
                'bert': 0.25,
                'roberta': 0.25,
                'gpt': 0.5
            }
            
            # Calculate weighted score
            total_weight = 0
            weighted_score = 0
            weighted_confidence = 0
            
            for model, result in evaluation_results.items():
                weight = model_weights.get(model, 0.1)
                score = result.get('score', 0)
                confidence = result.get('confidence', 0.0)
                
                weighted_score += weight * score
                weighted_confidence += weight * confidence
                total_weight += weight
            
            if total_weight > 0:
                final_score = weighted_score / total_weight
                final_confidence = weighted_confidence / total_weight
            else:
                final_score = 0
                final_confidence = 0.0
            
            # Collect feedback from all models
            all_feedback = []
            all_strengths = []
            all_improvements = []
            
            for result in evaluation_results.values():
                if 'feedback' in result:
                    all_feedback.append(result['feedback'])
                if 'strengths' in result:
                    all_strengths.extend(result['strengths'])
                if 'improvements' in result:
                    all_improvements.extend(result['improvements'])
            
            # Calculate grade
            grade = self._calculate_grade(final_score, metadata.get('max_marks', 100))
            
            return {
                'score': round(final_score, 2),
                'confidence': round(final_confidence, 3),
                'grade': grade,
                'individual_results': evaluation_results,
                'feedback': ' '.join(all_feedback),
                'strengths': list(set(all_strengths)),
                'improvements': list(set(all_improvements)),
                'method': 'ensemble_evaluation'
            }
            
        except Exception as e:
            logger.error(f"Evaluation ensemble failed: {e}")
            return {'score': 0, 'confidence': 0.0}
    
    def _calculate_grade(self, score: float, max_marks: int) -> str:
        """Calculate letter grade from score"""
        percentage = (score / max_marks) * 100
        
        if percentage >= 97: return 'A+'
        elif percentage >= 93: return 'A'
        elif percentage >= 90: return 'A-'
        elif percentage >= 87: return 'B+'
        elif percentage >= 83: return 'B'
        elif percentage >= 80: return 'B-'
        elif percentage >= 77: return 'C+'
        elif percentage >= 73: return 'C'
        elif percentage >= 70: return 'C-'
        elif percentage >= 67: return 'D+'
        elif percentage >= 65: return 'D'
        else: return 'F'
    
    async def generate_advanced_feedback(self, evaluation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Generate advanced feedback using multiple approaches"""
        try:
            start_time = time.time()
            
            # Extract evaluation data
            score = evaluation_result.get('score', 0)
            text = evaluation_result.get('text', '')
            subject = evaluation_result.get('subject', 'general')
            
            # Generate feedback using different approaches
            feedback_results = {}
            
            # Rule-based feedback
            rule_based = await self._generate_rule_based_feedback(score, text, subject)
            feedback_results['rule_based'] = rule_based
            
            # AI-generated feedback
            if self.openai_client:
                try:
                    ai_feedback = await self._generate_ai_feedback(evaluation_result)
                    feedback_results['ai_generated'] = ai_feedback
                except Exception as e:
                    logger.warning(f"AI feedback generation failed: {e}")
            
            # Template-based feedback
            template_feedback = await self._generate_template_feedback(evaluation_result)
            feedback_results['template_based'] = template_feedback
            
            # Combine feedback
            final_feedback = await self._combine_feedback_results(feedback_results)
            
            processing_time = time.time() - start_time
            final_feedback['processing_time'] = processing_time
            
            return final_feedback
            
        except Exception as e:
            logger.error(f"Advanced feedback generation failed: {e}")
            raise
    
    async def _generate_rule_based_feedback(self, score: float, text: str, subject: str) -> Dict[str, Any]:
        """Generate rule-based feedback"""
        try:
            feedback_parts = []
            suggestions = []
            
            # Score-based feedback
            if score >= 90:
                feedback_parts.append("Excellent work! Your answer demonstrates a thorough understanding of the topic.")
            elif score >= 80:
                feedback_parts.append("Good answer! You've covered most of the key points effectively.")
            elif score >= 70:
                feedback_parts.append("Satisfactory answer. You show understanding but could include more details.")
            elif score >= 60:
                feedback_parts.append("Your answer shows basic understanding but needs more development.")
            else:
                feedback_parts.append("Your answer needs significant improvement. Please review the topic thoroughly.")
            
            # Length-based feedback
            word_count = len(text.split())
            if word_count < 50:
                suggestions.append("Consider providing more detailed explanations to support your points.")
            elif word_count > 500:
                suggestions.append("Try to be more concise while maintaining the key information.")
            
            # Subject-specific feedback
            if subject.lower() == 'mathematics':
                if not re.search(r'\d+', text):
                    suggestions.append("Include numerical calculations or examples to support your answer.")
            elif subject.lower() == 'science':
                if 'experiment' not in text.lower() and 'evidence' not in text.lower():
                    suggestions.append("Consider including experimental evidence or scientific reasoning.")
            elif subject.lower() == 'english':
                if len(re.findall(r'[.!?]', text)) < 3:
                    suggestions.append("Use varied sentence structures to improve readability.")
            
            return {
                'feedback': ' '.join(feedback_parts),
                'suggestions': suggestions,
                'word_count': word_count,
                'type': 'rule_based'
            }
            
        except Exception as e:
            logger.error(f"Rule-based feedback generation failed: {e}")
            return {'feedback': 'Unable to generate feedback.', 'suggestions': []}
    
    async def _generate_ai_feedback(self, evaluation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered feedback"""
        try:
            score = evaluation_result.get('score', 0)
            text = evaluation_result.get('text', '')
            subject = evaluation_result.get('subject', 'general')
            question = evaluation_result.get('question', '')
            
            prompt = f"""
            As an expert teacher, provide constructive feedback for this student answer:

            Subject: {subject}
            Question: {question}
            Student Answer: {text}
            Score: {score}/100

            Please provide:
            1. Specific feedback on what the student did well
            2. Areas that need improvement
            3. Actionable suggestions for better performance
            4. Encouragement and motivation

            Keep the feedback constructive, specific, and encouraging.
            """
            
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=300
            )
            
            feedback_text = response.choices[0].message.content
            
            return {
                'feedback': feedback_text,
                'type': 'ai_generated',
                'model': 'gpt-4'
            }
            
        except Exception as e:
            logger.error(f"AI feedback generation failed: {e}")
            raise
    
    async def _generate_template_feedback(self, evaluation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Generate template-based feedback"""
        try:
            score = evaluation_result.get('score', 0)
            subject = evaluation_result.get('subject', 'general')
            
            # Template selection based on score range
            if score >= 90:
                template = "Outstanding performance! Your answer shows {strengths}. To reach perfection, consider {improvements}."
            elif score >= 80:
                template = "Strong answer! You demonstrated {strengths}. For improvement, focus on {improvements}."
            elif score >= 70:
                template = "Good effort! Your answer includes {strengths}. To enhance your response, work on {improvements}."
            elif score >= 60:
                template = "Adequate response. You showed {strengths}. Key areas for improvement include {improvements}."
            else:
                template = "Your answer needs development. Focus on {improvements} and review {strengths}."
            
            # Subject-specific strengths and improvements
            subject_feedback = {
                'mathematics': {
                    'strengths': ['clear problem-solving steps', 'correct calculations', 'logical reasoning'],
                    'improvements': ['showing more work', 'explaining reasoning', 'checking answers']
                },
                'science': {
                    'strengths': ['scientific terminology', 'experimental understanding', 'logical conclusions'],
                    'improvements': ['citing evidence', 'explaining mechanisms', 'connecting concepts']
                },
                'english': {
                    'strengths': ['clear expression', 'good vocabulary', 'structured arguments'],
                    'improvements': ['grammar accuracy', 'deeper analysis', 'stronger conclusions']
                },
                'history': {
                    'strengths': ['factual knowledge', 'chronological understanding', 'cause-effect analysis'],
                    'improvements': ['citing sources', 'analyzing perspectives', 'drawing connections']
                }
            }
            
            feedback_data = subject_feedback.get(subject.lower(), {
                'strengths': ['understanding of concepts', 'effort in answering'],
                'improvements': ['more detailed explanations', 'better organization']
            })
            
            # Format template
            formatted_feedback = template.format(
                strengths=', '.join(feedback_data['strengths'][:2]),
                improvements=', '.join(feedback_data['improvements'][:2])
            )
            
            return {
                'feedback': formatted_feedback,
                'type': 'template_based',
                'template_used': template
            }
            
        except Exception as e:
            logger.error(f"Template feedback generation failed: {e}")
            return {'feedback': 'Keep working on improving your answers.', 'type': 'template_based'}
    
    async def _combine_feedback_results(self, feedback_results: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Combine feedback from different sources"""
        try:
            combined_feedback = []
            all_suggestions = []
            
            # Prioritize AI feedback if available
            if 'ai_generated' in feedback_results:
                combined_feedback.append(feedback_results['ai_generated']['feedback'])
            
            # Add rule-based insights
            if 'rule_based' in feedback_results:
                rule_feedback = feedback_results['rule_based']
                if rule_feedback.get('suggestions'):
                    all_suggestions.extend(rule_feedback['suggestions'])
            
            # Add template feedback if no AI feedback
            if 'template_based' in feedback_results and 'ai_generated' not in feedback_results:
                combined_feedback.append(feedback_results['template_based']['feedback'])
            
            return {
                'feedback': ' '.join(combined_feedback),
                'suggestions': all_suggestions,
                'sources': list(feedback_results.keys()),
                'detailed_results': feedback_results
            }
            
        except Exception as e:
            logger.error(f"Feedback combination failed: {e}")
            return {'feedback': 'Feedback generated successfully.', 'suggestions': []}
    
    async def check_plagiarism_advanced(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Advanced plagiarism detection"""
        try:
            start_time = time.time()
            
            text = input_data.get('text', '')
            user_id = input_data.get('user_id', '')
            
            # Load plagiarism detector
            detector = self.model_cache['plagiarism_detector']
            model = detector['model']
            index = detector['index']
            
            # Generate embedding for input text
            input_embedding = model.encode([text])
            
            # Search for similar texts
            similarities = []
            if index.ntotal > 0:
                # Search in FAISS index
                scores, indices = index.search(input_embedding.astype('float32'), min(10, index.ntotal))
                
                for score, idx in zip(scores[0], indices[0]):
                    if idx != -1 and score > 0.7:  # Similarity threshold
                        similarities.append({
                            'similarity_score': float(score),
                            'matched_text': detector['texts'][idx] if idx < len(detector['texts']) else '',
                            'index': int(idx)
                        })
            
            # Calculate overall plagiarism score
            if similarities:
                max_similarity = max(sim['similarity_score'] for sim in similarities)
                plagiarism_score = min(max_similarity, 1.0)
            else:
                plagiarism_score = 0.0
            
            # Add current text to index for future comparisons
            detector['embeddings'].append(input_embedding[0])
            detector['texts'].append(text)
            index.add(input_embedding.astype('float32'))
            
            processing_time = time.time() - start_time
            
            return {
                'plagiarism_score': plagiarism_score,
                'is_plagiarized': plagiarism_score > 0.7,
                'similar_texts': similarities[:5],  # Top 5 matches
                'confidence': 0.9,
                'processing_time': processing_time,
                'total_comparisons': index.ntotal
            }
            
        except Exception as e:
            logger.error(f"Plagiarism detection failed: {e}")
            raise
    
    async def detect_bias(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect bias in evaluation or text"""
        try:
            start_time = time.time()
            
            text = input_data.get('text', '')
            evaluation = input_data.get('evaluation', {})
            
            # Load bias detector
            model = self.model_cache['bias_detector']
            tokenizer = self.tokenizer_cache['bias_detector']
            
            # Tokenize input
            inputs = tokenizer(
                text,
                truncation=True,
                padding=True,
                max_length=512,
                return_tensors='pt'
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Run bias detection
            with torch.no_grad():
                bias_scores = model(**inputs)
                bias_scores = bias_scores.cpu().numpy()[0]
            
            # Bias categories
            bias_categories = [
                'toxic', 'severe_toxic', 'obscene', 
                'threat', 'insult', 'identity_hate'
            ]
            
            # Create bias report
            bias_report = {}
            for i, category in enumerate(bias_categories):
                bias_report[category] = float(bias_scores[i])
            
            # Calculate overall bias score
            overall_bias = np.mean(bias_scores)
            
            # Check for evaluation bias
            evaluation_bias = await self._check_evaluation_bias(evaluation)
            
            processing_time = time.time() - start_time
            
            return {
                'bias_score': float(overall_bias),
                'is_biased': overall_bias > 0.5,
                'bias_categories': bias_report,
                'evaluation_bias': evaluation_bias,
                'confidence': 0.85,
                'processing_time': processing_time
            }
            
        except Exception as e:
            logger.error(f"Bias detection failed: {e}")
            raise
    
    async def _check_evaluation_bias(self, evaluation: Dict[str, Any]) -> Dict[str, Any]:
        """Check for bias in evaluation scores"""
        try:
            # This would implement sophisticated bias detection in evaluation
            # For now, return a basic check
            
            score = evaluation.get('score', 0)
            confidence = evaluation.get('confidence', 0)
            
            # Simple bias indicators
            bias_indicators = {
                'score_confidence_mismatch': abs(score - confidence * 100) > 20,
                'extreme_score': score < 10 or score > 95,
                'low_confidence': confidence < 0.7
            }
            
            bias_detected = any(bias_indicators.values())
            
            return {
                'bias_detected': bias_detected,
                'indicators': bias_indicators,
                'recommendation': 'Review evaluation criteria' if bias_detected else 'Evaluation appears fair'
            }
            
        except Exception as e:
            logger.error(f"Evaluation bias check failed: {e}")
            return {'bias_detected': False, 'indicators': {}}
    
    async def _background_cache_cleanup(self):
        """Background task for cache cleanup"""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                await self._cleanup_cache()
            except Exception as e:
                logger.error(f"Cache cleanup error: {e}")
    
    async def _cleanup_cache(self):
        """Clean up expired cache entries"""
        try:
            current_time = time.time()
            
            with self.cache_lock:
                expired_keys = []
                for key, access_time in self.cache_access_times.items():
                    if current_time - access_time > self.cache_ttl:
                        expired_keys.append(key)
                
                for key in expired_keys:
                    if key in self.memory_cache:
                        del self.memory_cache[key]
                    if key in self.cache_access_times:
                        del self.cache_access_times[key]
                
                if expired_keys:
                    logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
                    
        except Exception as e:
            logger.error(f"Cache cleanup failed: {e}")
    
    async def _background_metrics_collection(self):
        """Background task for metrics collection"""
        while True:
            try:
                await asyncio.sleep(60)  # Run every minute
                await self._update_performance_metrics()
            except Exception as e:
                logger.error(f"Metrics collection error: {e}")
    
    async def _update_performance_metrics(self):
        """Update performance metrics"""
        try:
            # Calculate cache hit rate
            total_requests = self.performance_metrics['total_requests']
            if total_requests > 0:
                cache_hits = sum(1 for _ in self.memory_cache.values())
                self.performance_metrics['cache_hit_rate'] = cache_hits / total_requests
            
            # Calculate average latency
            if self.latency_history:
                self.performance_metrics['average_latency'] = np.mean(self.latency_history)
                self.performance_metrics['p95_latency'] = np.percentile(self.latency_history, 95)
                self.performance_metrics['p99_latency'] = np.percentile(self.latency_history, 99)
            
            # Calculate throughput
            if self.throughput_history:
                self.performance_metrics['throughput'] = np.mean(self.throughput_history)
            
        except Exception as e:
            logger.error(f"Metrics update failed: {e}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for inference engine"""
        try:
            return {
                'status': 'healthy',
                'device': str(self.device),
                'gpu_count': self.num_gpus,
                'loaded_models': list(self.model_cache.keys()),
                'cache_size': len(self.memory_cache),
                'performance_metrics': self.performance_metrics,
                'redis_connected': self.redis_client is not None,
                'ocr_engines': list(self.ocr_engines.keys())
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {'status': 'unhealthy', 'error': str(e)}
