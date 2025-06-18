import cv2
import numpy as np
import pytesseract
from PIL import Image
import io
import asyncio
import aiohttp
import base64
from typing import Dict, Any, List, Optional
import logging
import torch
import torchvision.transforms as transforms
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import easyocr
import paddleocr
from .base_agent import BaseAgent, AgentTask, AgentType, AgentCapability, TaskStatus

logger = logging.getLogger(__name__)

class OCRAgent(BaseAgent):
    """Advanced OCR Agent with multiple engines and preprocessing"""
    
    def __init__(self, agent_id: str = "ocr_agent_001"):
        capabilities = [
            AgentCapability(
                name="text_extraction",
                description="Extract text from images using multiple OCR engines",
                input_types=["image/jpeg", "image/png", "image/tiff", "application/pdf"],
                output_types=["text/plain", "application/json"],
                confidence_threshold=0.7
            ),
            AgentCapability(
                name="handwriting_recognition",
                description="Recognize handwritten text",
                input_types=["image/jpeg", "image/png"],
                output_types=["text/plain", "application/json"],
                confidence_threshold=0.6
            ),
            AgentCapability(
                name="mathematical_formula_recognition",
                description="Extract mathematical formulas and equations",
                input_types=["image/jpeg", "image/png"],
                output_types=["text/plain", "application/json"],
                confidence_threshold=0.8
            )
        ]
        
        super().__init__(agent_id, AgentType.OCR_AGENT, capabilities)
        
        # OCR engines
        self.tesseract_config = '--oem 3 --psm 6'
        self.easyocr_reader = None
        self.paddleocr_reader = None
        self.trocr_processor = None
        self.trocr_model = None
        
        # Google Vision API
        self.google_vision_client = None
        
        # AWS Textract
        self.textract_client = None
        
    async def initialize(self) -> bool:
        """Initialize OCR engines and models"""
        try:
            logger.info("Initializing OCR Agent...")
            
            # Initialize EasyOCR
            try:
                self.easyocr_reader = easyocr.Reader(['en'])
                logger.info("EasyOCR initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize EasyOCR: {e}")
            
            # Initialize PaddleOCR
            try:
                self.paddleocr_reader = paddleocr.PaddleOCR(use_angle_cls=True, lang='en')
                logger.info("PaddleOCR initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize PaddleOCR: {e}")
            
            # Initialize TrOCR for handwriting
            try:
                self.trocr_processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten')
                self.trocr_model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')
                logger.info("TrOCR initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize TrOCR: {e}")
            
            # Initialize cloud services
            await self._initialize_cloud_services()
            
            self.is_active = True
            logger.info("OCR Agent initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize OCR Agent: {e}")
            self.is_active = False
            return False
    
    async def _initialize_cloud_services(self):
        """Initialize cloud OCR services"""
        try:
            # Google Vision API
            from google.cloud import vision
            self.google_vision_client = vision.ImageAnnotatorClient()
            logger.info("Google Vision API initialized")
        except Exception as e:
            logger.warning(f"Google Vision API not available: {e}")
        
        try:
            # AWS Textract
            import boto3
            self.textract_client = boto3.client('textract')
            logger.info("AWS Textract initialized")
        except Exception as e:
            logger.warning(f"AWS Textract not available: {e}")
    
    async def process_task(self, task: AgentTask) -> AgentTask:
        """Process OCR task"""
        try:
            task_type = task.task_type
            input_data = task.input_data
            
            if task_type == "extract_text":
                result = await self._extract_text(input_data)
            elif task_type == "extract_handwriting":
                result = await self._extract_handwriting(input_data)
            elif task_type == "extract_formulas":
                result = await self._extract_mathematical_formulas(input_data)
            else:
                raise ValueError(f"Unknown task type: {task_type}")
            
            task.output_data = result
            return task
            
        except Exception as e:
            logger.error(f"OCR task processing failed: {e}")
            raise
    
    async def _extract_text(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text using multiple OCR engines"""
        image_data = input_data.get('image_data')
        image_format = input_data.get('format', 'jpeg')
        language = input_data.get('language', 'en')
        
        if not image_data:
            raise ValueError("No image data provided")
        
        # Preprocess image
        processed_image = await self._preprocess_image(image_data)
        
        # Run multiple OCR engines
        ocr_results = {}
        
        # Tesseract OCR
        try:
            tesseract_result = await self._tesseract_ocr(processed_image, language)
            ocr_results['tesseract'] = tesseract_result
        except Exception as e:
            logger.warning(f"Tesseract OCR failed: {e}")
        
        # EasyOCR
        if self.easyocr_reader:
            try:
                easyocr_result = await self._easyocr_ocr(processed_image)
                ocr_results['easyocr'] = easyocr_result
            except Exception as e:
                logger.warning(f"EasyOCR failed: {e}")
        
        # PaddleOCR
        if self.paddleocr_reader:
            try:
                paddleocr_result = await self._paddleocr_ocr(processed_image)
                ocr_results['paddleocr'] = paddleocr_result
            except Exception as e:
                logger.warning(f"PaddleOCR failed: {e}")
        
        # Google Vision API
        if self.google_vision_client:
            try:
                google_result = await self._google_vision_ocr(image_data)
                ocr_results['google_vision'] = google_result
            except Exception as e:
                logger.warning(f"Google Vision OCR failed: {e}")
        
        # AWS Textract
        if self.textract_client:
            try:
                textract_result = await self._aws_textract_ocr(image_data)
                ocr_results['aws_textract'] = textract_result
            except Exception as e:
                logger.warning(f"AWS Textract failed: {e}")
        
        # Calculate consensus
        final_text, confidence = self._calculate_consensus(ocr_results)
        
        return {
            'extracted_text': final_text,
            'confidence': confidence,
            'ocr_results': ocr_results,
            'language': language,
            'word_count': len(final_text.split()),
            'line_count': len(final_text.split('\n'))
        }
    
    async def _extract_handwriting(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract handwritten text using TrOCR"""
        image_data = input_data.get('image_data')
        
        if not image_data or not self.trocr_model:
            return await self._extract_text(input_data)  # Fallback to regular OCR
        
        try:
            # Convert image data to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Process with TrOCR
            pixel_values = self.trocr_processor(image, return_tensors="pt").pixel_values
            generated_ids = self.trocr_model.generate(pixel_values)
            generated_text = self.trocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            return {
                'extracted_text': generated_text,
                'confidence': 0.85,  # TrOCR doesn't provide confidence scores
                'method': 'trocr_handwriting',
                'word_count': len(generated_text.split())
            }
            
        except Exception as e:
            logger.error(f"Handwriting recognition failed: {e}")
            # Fallback to regular OCR
            return await self._extract_text(input_data)
    
    async def _extract_mathematical_formulas(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract mathematical formulas and equations"""
        # For now, use regular OCR with math-specific preprocessing
        # In production, you might use specialized models like MathPix or custom trained models
        
        image_data = input_data.get('image_data')
        processed_image = await self._preprocess_image_for_math(image_data)
        
        # Use Tesseract with math-specific configuration
        math_config = '--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789+-*/=()[]{}^√∫∑∏αβγδεζηθικλμνξοπρστυφχψω'
        
        try:
            text = pytesseract.image_to_string(processed_image, config=math_config)
            
            # Post-process mathematical expressions
            processed_text = self._postprocess_math_text(text)
            
            return {
                'extracted_text': processed_text,
                'confidence': 0.7,  # Lower confidence for math formulas
                'method': 'tesseract_math',
                'formula_count': processed_text.count('='),
                'contains_symbols': any(symbol in processed_text for symbol in ['∫', '∑', '√', '^'])
            }
            
        except Exception as e:
            logger.error(f"Mathematical formula extraction failed: {e}")
            return await self._extract_text(input_data)
    
    async def _preprocess_image(self, image_data: bytes) -> np.ndarray:
        """Advanced image preprocessing for better OCR"""
        # Convert to OpenCV format
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Resize if too large
        height, width = image.shape[:2]
        if width > 2000 or height > 2000:
            scale = min(2000/width, 2000/height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        # Noise reduction
        denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
        
        # Convert to grayscale
        gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
        
        # Adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Deskew correction
        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) > 0:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            
            if abs(angle) > 0.5:  # Only correct if angle is significant
                (h, w) = thresh.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                thresh = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
        # Morphological operations to clean up
        kernel = np.ones((1, 1), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return thresh
    
    async def _preprocess_image_for_math(self, image_data: bytes) -> np.ndarray:
        """Specialized preprocessing for mathematical formulas"""
        # Start with regular preprocessing
        image = await self._preprocess_image(image_data)
        
        # Additional processing for math symbols
        # Enhance contrast for better symbol recognition
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(image)
        
        # Dilate slightly to connect broken parts of symbols
        kernel = np.ones((2, 2), np.uint8)
        dilated = cv2.dilate(enhanced, kernel, iterations=1)
        
        return dilated
    
    async def _tesseract_ocr(self, image: np.ndarray, language: str) -> Dict[str, Any]:
        """Tesseract OCR with confidence scores"""
        try:
            # Get text with confidence
            data = pytesseract.image_to_data(image, lang=language, config=self.tesseract_config, output_type=pytesseract.Output.DICT)
            
            # Filter out low confidence words
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            words = [data['text'][i] for i, conf in enumerate(data['conf']) if int(conf) > 30]
            
            text = ' '.join(words)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'text': text,
                'confidence': avg_confidence / 100,
                'word_confidences': confidences
            }
        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            return {'text': '', 'confidence': 0.0}
    
    async def _easyocr_ocr(self, image: np.ndarray) -> Dict[str, Any]:
        """EasyOCR processing"""
        try:
            results = self.easyocr_reader.readtext(image)
            
            text_parts = []
            confidences = []
            
            for (bbox, text, confidence) in results:
                if confidence > 0.3:  # Filter low confidence
                    text_parts.append(text)
                    confidences.append(confidence)
            
            full_text = ' '.join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'text': full_text,
                'confidence': avg_confidence,
                'word_confidences': confidences
            }
        except Exception as e:
            logger.error(f"EasyOCR failed: {e}")
            return {'text': '', 'confidence': 0.0}
    
    async def _paddleocr_ocr(self, image: np.ndarray) -> Dict[str, Any]:
        """PaddleOCR processing"""
        try:
            results = self.paddleocr_reader.ocr(image, cls=True)
            
            text_parts = []
            confidences = []
            
            for line in results[0]:
                if line:
                    text, confidence = line[1]
                    if confidence > 0.3:
                        text_parts.append(text)
                        confidences.append(confidence)
            
            full_text = ' '.join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'text': full_text,
                'confidence': avg_confidence,
                'word_confidences': confidences
            }
        except Exception as e:
            logger.error(f"PaddleOCR failed: {e}")
            return {'text': '', 'confidence': 0.0}
    
    async def _google_vision_ocr(self, image_data: bytes) -> Dict[str, Any]:
        """Google Vision API OCR"""
        try:
            from google.cloud import vision
            
            image = vision.Image(content=image_data)
            response = self.google_vision_client.text_detection(image=image)
            texts = response.text_annotations
            
            if texts:
                full_text = texts[0].description
                # Google Vision doesn't provide word-level confidence, so estimate
                confidence = 0.9  # Generally high confidence
                
                return {
                    'text': full_text,
                    'confidence': confidence
                }
            else:
                return {'text': '', 'confidence': 0.0}
                
        except Exception as e:
            logger.error(f"Google Vision OCR failed: {e}")
            return {'text': '', 'confidence': 0.0}
    
    async def _aws_textract_ocr(self, image_data: bytes) -> Dict[str, Any]:
        """AWS Textract OCR"""
        try:
            response = self.textract_client.detect_document_text(
                Document={'Bytes': image_data}
            )
            
            text_parts = []
            confidences = []
            
            for block in response['Blocks']:
                if block['BlockType'] == 'WORD':
                    text_parts.append(block['Text'])
                    confidences.append(block['Confidence'] / 100)
            
            full_text = ' '.join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                'text': full_text,
                'confidence': avg_confidence,
                'word_confidences': confidences
            }
        except Exception as e:
            logger.error(f"AWS Textract failed: {e}")
            return {'text': '', 'confidence': 0.0}
    
    def _calculate_consensus(self, ocr_results: Dict[str, Dict[str, Any]]) -> tuple:
        """Calculate consensus from multiple OCR results"""
        if not ocr_results:
            return "", 0.0
        
        if len(ocr_results) == 1:
            result = list(ocr_results.values())[0]
            return result.get('text', ''), result.get('confidence', 0.0)
        
        # Weight results by confidence
        weighted_texts = []
        total_weight = 0
        
        for engine, result in ocr_results.items():
            text = result.get('text', '')
            confidence = result.get('confidence', 0.0)
            
            if text and confidence > 0.3:  # Only consider reasonable results
                weighted_texts.append((text, confidence))
                total_weight += confidence
        
        if not weighted_texts:
            return "", 0.0
        
        # For now, use the highest confidence result
        # In production, you might implement more sophisticated consensus algorithms
        best_result = max(weighted_texts, key=lambda x: x[1])
        
        # Calculate average confidence
        avg_confidence = total_weight / len(weighted_texts)
        
        return best_result[0], avg_confidence
    
    def _postprocess_math_text(self, text: str) -> str:
        """Post-process mathematical text"""
        # Replace common OCR errors in math
        replacements = {
            'O': '0',  # Letter O to zero
            'l': '1',  # Letter l to one
            'S': '5',  # Letter S to five
            'B': '8',  # Letter B to eight
            'x': '×',  # x to multiplication
            '/': '÷',  # slash to division (optional)
        }
        
        processed_text = text
        for old, new in replacements.items():
            processed_text = processed_text.replace(old, new)
        
        return processed_text
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        status = {
            'agent_id': self.agent_id,
            'agent_type': self.agent_type.value,
            'is_active': self.is_active,
            'engines': {
                'tesseract': True,  # Always available
                'easyocr': self.easyocr_reader is not None,
                'paddleocr': self.paddleocr_reader is not None,
                'trocr': self.trocr_model is not None,
                'google_vision': self.google_vision_client is not None,
                'aws_textract': self.textract_client is not None
            },
            'performance_metrics': self.performance_metrics
        }
        
        return status
