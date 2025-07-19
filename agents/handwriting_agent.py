import asyncio
import logging
from typing import Dict, Any, List, Optional
import torch
import torch.nn as nn
import cv2
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import easyocr
from datetime import datetime

from .base_agent import BaseAgent, AgentTask, AgentType, AgentCapability, TaskStatus

logger = logging.getLogger(__name__)

class HandwritingAgent(BaseAgent):
    """Specialized agent for handwriting recognition and analysis"""
    
    def __init__(self, agent_id: str = "handwriting_agent_001"):
        capabilities = [
            AgentCapability(
                name="handwriting_recognition",
                description="Recognize handwritten text with high accuracy",
                input_types=["image/jpeg", "image/png"],
                output_types=["application/json"],
                confidence_threshold=0.8
            ),
            AgentCapability(
                name="handwriting_analysis",
                description="Analyze handwriting characteristics and quality",
                input_types=["image/jpeg", "image/png"],
                output_types=["application/json"],
                confidence_threshold=0.75
            ),
            AgentCapability(
                name="writing_style_detection",
                description="Detect writing style and characteristics",
                input_types=["image/jpeg", "image/png"],
                output_types=["application/json"],
                confidence_threshold=0.7
            )
        ]
        
        super().__init__(agent_id, AgentType.SPECIALIZED_AGENT, capabilities)
        
        # Models for handwriting recognition
        self.trocr_processor = None
        self.trocr_model = None
        self.easyocr_reader = None
        
        # Handwriting analysis models
        self.style_classifier = None
        self.quality_assessor = None
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((384, 384)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    async def initialize(self) -> bool:
        """Initialize handwriting recognition models"""
        try:
            logger.info("Initializing Handwriting Agent...")
            
            # Initialize TrOCR for handwritten text
            self.trocr_processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten')
            self.trocr_model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')
            
            # Initialize EasyOCR as backup
            self.easyocr_reader = easyocr.Reader(['en'])
            
            # Initialize custom handwriting analysis models
            await self._initialize_analysis_models()
            
            self.is_active = True
            logger.info("Handwriting Agent initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Handwriting Agent: {e}")
            return False
    
    async def _initialize_analysis_models(self):
        """Initialize handwriting analysis models"""
        try:
            # Style classifier for handwriting characteristics
            class HandwritingStyleClassifier(nn.Module):
                def __init__(self):
                    super().__init__()
                    self.backbone = torch.hub.load('pytorch/vision:v0.10.0', 'resnet50', pretrained=True)
                    self.backbone.fc = nn.Linear(2048, 512)
                    
                    # Style classification head
                    self.style_head = nn.Sequential(
                        nn.Linear(512, 256),
                        nn.ReLU(),
                        nn.Dropout(0.3),
                        nn.Linear(256, 10)  # 10 style categories
                    )
                    
                    # Quality assessment head
                    self.quality_head = nn.Sequential(
                        nn.Linear(512, 128),
                        nn.ReLU(),
                        nn.Dropout(0.2),
                        nn.Linear(128, 1)  # Quality score
                    )
                
                def forward(self, x):
                    features = self.backbone(x)
                    style_logits = self.style_head(features)
                    quality_score = torch.sigmoid(self.quality_head(features))
                    return style_logits, quality_score
            
            self.style_classifier = HandwritingStyleClassifier()
            self.style_classifier.eval()
            
            logger.info("Handwriting analysis models initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize analysis models: {e}")
    
    async def process_task(self, task: AgentTask) -> AgentTask:
        """Process handwriting-related tasks"""
        try:
            task.status = TaskStatus.PROCESSING
            task.started_at = datetime.utcnow()
            
            if task.task_type == "recognize_handwriting":
                result = await self._recognize_handwriting(task.input_data)
            elif task.task_type == "analyze_handwriting":
                result = await self._analyze_handwriting(task.input_data)
            elif task.task_type == "detect_writing_style":
                result = await self._detect_writing_style(task.input_data)
            elif task.task_type == "comprehensive_handwriting_analysis":
                result = await self._comprehensive_analysis(task.input_data)
            else:
                raise ValueError(f"Unknown task type: {task.task_type}")
            
            task.output_data = result
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            
            return task
            
        except Exception as e:
            logger.error(f"Handwriting task processing failed: {e}")
            task.status = TaskStatus.FAILED
            task.error_message = str(e)
            task.completed_at = datetime.utcnow()
            return task
    
    async def _recognize_handwriting(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Recognize handwritten text using multiple approaches"""
        try:
            image_path = input_data.get("file_path") or input_data.get("image_path")
            if not image_path:
                raise ValueError("No image path provided")
            
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Preprocess for better recognition
            processed_image = await self._preprocess_handwriting_image(image)
            
            # Method 1: TrOCR (best for handwriting)
            trocr_result = await self._recognize_with_trocr(processed_image)
            
            # Method 2: EasyOCR (backup method)
            easyocr_result = await self._recognize_with_easyocr(processed_image)
            
            # Method 3: Custom preprocessing + TrOCR
            enhanced_image = await self._enhance_handwriting_image(image)
            enhanced_result = await self._recognize_with_trocr(enhanced_image)
            
            # Ensemble results
            final_result = await self._ensemble_recognition_results([
                trocr_result, easyocr_result, enhanced_result
            ])
            
            return {
                "recognized_text": final_result["text"],
                "confidence": final_result["confidence"],
                "individual_results": {
                    "trocr": trocr_result,
                    "easyocr": easyocr_result,
                    "enhanced_trocr": enhanced_result
                },
                "image_info": {
                    "width": image.shape[1],
                    "height": image.shape[0],
                    "preprocessing_applied": True
                }
            }
            
        except Exception as e:
            logger.error(f"Handwriting recognition failed: {e}")
            raise
    
    async def _preprocess_handwriting_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image specifically for handwriting recognition"""
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Noise reduction
            denoised = cv2.medianBlur(gray, 3)
            
            # Contrast enhancement using CLAHE
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(denoised)
            
            # Morphological operations to clean up text
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            cleaned = cv2.morphologyEx(enhanced, cv2.MORPH_CLOSE, kernel)
            
            # Adaptive thresholding for better text separation
            binary = cv2.adaptiveThreshold(
                cleaned, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            return binary
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            return image
    
    async def _enhance_handwriting_image(self, image: np.ndarray) -> np.ndarray:
        """Apply advanced enhancement for difficult handwriting"""
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Apply Gaussian blur to reduce noise
            blurred = cv2.GaussianBlur(gray, (3, 3), 0)
            
            # Unsharp masking for better edge definition
            unsharp_mask = cv2.addWeighted(gray, 1.5, blurred, -0.5, 0)
            
            # Histogram equalization
            equalized = cv2.equalizeHist(unsharp_mask)
            
            # Bilateral filter to preserve edges while reducing noise
            filtered = cv2.bilateralFilter(equalized, 9, 75, 75)
            
            # Otsu's thresholding
            _, binary = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            return binary
            
        except Exception as e:
            logger.error(f"Image enhancement failed: {e}")
            return image
    
    async def _recognize_with_trocr(self, image: np.ndarray) -> Dict[str, Any]:
        """Recognize text using TrOCR model"""
        try:
            # Convert numpy array to PIL Image
            if len(image.shape) == 2:
                pil_image = Image.fromarray(image).convert('RGB')
            else:
                pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            
            # Process with TrOCR
            pixel_values = self.trocr_processor(images=pil_image, return_tensors="pt").pixel_values
            
            # Generate text
            with torch.no_grad():
                generated_ids = self.trocr_model.generate(pixel_values, max_length=512)
                generated_text = self.trocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            # Calculate confidence (TrOCR doesn't provide direct confidence)
            confidence = min(0.9, len(generated_text.strip()) / 100 + 0.7)
            
            return {
                "text": generated_text.strip(),
                "confidence": confidence,
                "method": "trocr"
            }
            
        except Exception as e:
            logger.error(f"TrOCR recognition failed: {e}")
            return {"text": "", "confidence": 0.0, "method": "trocr", "error": str(e)}
    
    async def _recognize_with_easyocr(self, image: np.ndarray) -> Dict[str, Any]:
        """Recognize text using EasyOCR"""
        try:
            results = self.easyocr_reader.readtext(image)
            
            if not results:
                return {"text": "", "confidence": 0.0, "method": "easyocr"}
            
            # Combine all detected text
            text_parts = []
            confidences = []
            
            for (bbox, text, confidence) in results:
                text_parts.append(text)
                confidences.append(confidence)
            
            combined_text = " ".join(text_parts)
            avg_confidence = np.mean(confidences) if confidences else 0.0
            
            return {
                "text": combined_text,
                "confidence": avg_confidence,
                "method": "easyocr",
                "word_count": len(text_parts)
            }
            
        except Exception as e:
            logger.error(f"EasyOCR recognition failed: {e}")
            return {"text": "", "confidence": 0.0, "method": "easyocr", "error": str(e)}
    
    async def _ensemble_recognition_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Ensemble multiple recognition results"""
        try:
            # Filter out failed results
            valid_results = [r for r in results if r.get("text") and r.get("confidence", 0) > 0.1]
            
            if not valid_results:
                return {"text": "", "confidence": 0.0}
            
            # Weight results by confidence and method preference
            method_weights = {
                "trocr": 0.6,
                "easyocr": 0.3,
                "enhanced_trocr": 0.1
            }
            
            # Calculate weighted scores
            weighted_results = []
            for result in valid_results:
                method = result.get("method", "unknown")
                weight = method_weights.get(method, 0.1)
                score = result["confidence"] * weight
                weighted_results.append((score, result))
            
            # Sort by weighted score
            weighted_results.sort(key=lambda x: x[0], reverse=True)
            
            # Select best result
            best_result = weighted_results[0][1]
            
            # If multiple results are close, try to combine them
            if len(weighted_results) > 1:
                second_best = weighted_results[1][1]
                if abs(weighted_results[0][0] - weighted_results[1][0]) < 0.1:
                    # Combine results if they're similar
                    combined_text = self._combine_similar_texts(
                        best_result["text"], 
                        second_best["text"]
                    )
                    if combined_text:
                        best_result["text"] = combined_text
                        best_result["confidence"] = min(1.0, best_result["confidence"] + 0.1)
            
            return {
                "text": best_result["text"],
                "confidence": best_result["confidence"],
                "ensemble_method": "weighted_confidence",
                "source_method": best_result.get("method", "unknown")
            }
            
        except Exception as e:
            logger.error(f"Result ensemble failed: {e}")
            return {"text": "", "confidence": 0.0}
    
    def _combine_similar_texts(self, text1: str, text2: str) -> str:
        """Combine similar texts to improve accuracy"""
        try:
            # Simple similarity check and combination
            words1 = text1.split()
            words2 = text2.split()
            
            # If one text is much longer and contains the other, use the longer one
            if len(words1) > len(words2) * 1.5 and text2.lower() in text1.lower():
                return text1
            elif len(words2) > len(words1) * 1.5 and text1.lower() in text2.lower():
                return text2
            
            # If texts are similar length, use the one with better formatting
            if abs(len(words1) - len(words2)) <= 2:
                # Prefer text with proper capitalization and punctuation
                score1 = sum(1 for c in text1 if c.isupper()) + sum(1 for c in text1 if c in '.,!?')
                score2 = sum(1 for c in text2 if c.isupper()) + sum(1 for c in text2 if c in '.,!?')
                
                return text1 if score1 >= score2 else text2
            
            return text1  # Default to first text
            
        except Exception as e:
            logger.error(f"Text combination failed: {e}")
            return text1
    
    async def _analyze_handwriting(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze handwriting characteristics"""
        try:
            image_path = input_data.get("file_path") or input_data.get("image_path")
            if not image_path:
                raise ValueError("No image path provided")
            
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Analyze various handwriting characteristics
            analysis_results = {}
            
            # 1. Line spacing analysis
            line_spacing = await self._analyze_line_spacing(image)
            analysis_results["line_spacing"] = line_spacing
            
            # 2. Character size consistency
            char_consistency = await self._analyze_character_consistency(image)
            analysis_results["character_consistency"] = char_consistency
            
            # 3. Writing slant analysis
            slant_analysis = await self._analyze_writing_slant(image)
            analysis_results["writing_slant"] = slant_analysis
            
            # 4. Pressure analysis (from line thickness)
            pressure_analysis = await self._analyze_writing_pressure(image)
            analysis_results["writing_pressure"] = pressure_analysis
            
            # 5. Overall legibility score
            legibility_score = await self._calculate_legibility_score(image)
            analysis_results["legibility_score"] = legibility_score
            
            # 6. Writing speed estimation
            speed_estimation = await self._estimate_writing_speed(image)
            analysis_results["writing_speed"] = speed_estimation
            
            return {
                "handwriting_analysis": analysis_results,
                "overall_quality": self._calculate_overall_quality(analysis_results),
                "recommendations": self._generate_handwriting_recommendations(analysis_results)
            }
            
        except Exception as e:
            logger.error(f"Handwriting analysis failed: {e}")
            raise
    
    async def _analyze_line_spacing(self, image: np.ndarray) -> Dict[str, Any]:
        """Analyze line spacing in handwriting"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            
            # Apply threshold to get binary image
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Find horizontal projection
            horizontal_projection = np.sum(binary, axis=1)
            
            # Find text lines (peaks in projection)
            line_positions = []
            in_line = False
            line_start = 0
            
            for i, value in enumerate(horizontal_projection):
                if value > np.mean(horizontal_projection) * 0.3 and not in_line:
                    line_start = i
                    in_line = True
                elif value <= np.mean(horizontal_projection) * 0.3 and in_line:
                    line_positions.append((line_start, i))
                    in_line = False
            
            if len(line_positions) < 2:
                return {"spacing": "insufficient_lines", "consistency": 0.0}
            
            # Calculate spacing between lines
            spacings = []
            for i in range(len(line_positions) - 1):
                spacing = line_positions[i + 1][0] - line_positions[i][1]
                spacings.append(spacing)
            
            avg_spacing = np.mean(spacings)
            spacing_std = np.std(spacings)
            consistency = max(0, 1 - (spacing_std / avg_spacing)) if avg_spacing > 0 else 0
            
            return {
                "average_spacing": float(avg_spacing),
                "spacing_consistency": float(consistency),
                "line_count": len(line_positions),
                "spacing_category": self._categorize_spacing(avg_spacing)
            }
            
        except Exception as e:
            logger.error(f"Line spacing analysis failed: {e}")
            return {"spacing": "analysis_failed", "consistency": 0.0}
    
    async def _analyze_character_consistency(self, image: np.ndarray) -> Dict[str, Any]:
        """Analyze character size and shape consistency"""
        try:
            # Convert to grayscale and binary
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Find contours (characters)
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if len(contours) < 5:
                return {"consistency": 0.0, "character_count": len(contours)}
            
            # Analyze character properties
            heights = []
            widths = []
            areas = []
            
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                area = cv2.contourArea(contour)
                
                # Filter out noise (very small contours)
                if area > 50:
                    heights.append(h)
                    widths.append(w)
                    areas.append(area)
            
            if len(heights) < 3:
                return {"consistency": 0.0, "character_count": len(heights)}
            
            # Calculate consistency metrics
            height_consistency = 1 - (np.std(heights) / np.mean(heights)) if np.mean(heights) > 0 else 0
            width_consistency = 1 - (np.std(widths) / np.mean(widths)) if np.mean(widths) > 0 else 0
            area_consistency = 1 - (np.std(areas) / np.mean(areas)) if np.mean(areas) > 0 else 0
            
            overall_consistency = (height_consistency + width_consistency + area_consistency) / 3
            
            return {
                "height_consistency": float(max(0, height_consistency)),
                "width_consistency": float(max(0, width_consistency)),
                "area_consistency": float(max(0, area_consistency)),
                "overall_consistency": float(max(0, overall_consistency)),
                "character_count": len(heights),
                "average_height": float(np.mean(heights)),
                "average_width": float(np.mean(widths))
            }
            
        except Exception as e:
            logger.error(f"Character consistency analysis failed: {e}")
            return {"consistency": 0.0, "character_count": 0}
    
    async def _analyze_writing_slant(self, image: np.ndarray) -> Dict[str, Any]:
        """Analyze writing slant/angle"""
        try:
            # Convert to grayscale and binary
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Find lines using HoughLines
            edges = cv2.Canny(binary, 50, 150, apertureSize=3)
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
            
            if lines is None or len(lines) < 3:
                return {"slant_angle": 0.0, "slant_consistency": 0.0, "slant_type": "vertical"}
            
            # Calculate angles
            angles = []
            for rho, theta in lines[:, 0]:
                angle = theta * 180 / np.pi
                # Convert to slant angle (deviation from vertical)
                if angle > 90:
                    angle = angle - 180
                angles.append(angle)
            
            # Filter outliers
            angles = [a for a in angles if abs(a) < 45]  # Reasonable slant range
            
            if not angles:
                return {"slant_angle": 0.0, "slant_consistency": 0.0, "slant_type": "vertical"}
            
            avg_angle = np.mean(angles)
            angle_std = np.std(angles)
            consistency = max(0, 1 - (angle_std / 10))  # Normalize by 10 degrees
            
            # Categorize slant
            if abs(avg_angle) < 5:
                slant_type = "vertical"
            elif avg_angle > 5:
                slant_type = "right_slant"
            else:
                slant_type = "left_slant"
            
            return {
                "slant_angle": float(avg_angle),
                "slant_consistency": float(consistency),
                "slant_type": slant_type,
                "angle_variation": float(angle_std)
            }
            
        except Exception as e:
            logger.error(f"Writing slant analysis failed: {e}")
            return {"slant_angle": 0.0, "slant_consistency": 0.0, "slant_type": "unknown"}
    
    async def _analyze_writing_pressure(self, image: np.ndarray) -> Dict[str, Any]:
        """Analyze writing pressure from line thickness"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            
            # Invert image so text is white on black
            inverted = 255 - gray
            
            # Apply morphological operations to analyze line thickness
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            opened = cv2.morphologyEx(inverted, cv2.MORPH_OPEN, kernel)
            
            # Calculate average line thickness
            non_zero_pixels = np.count_nonzero(opened)
            if non_zero_pixels == 0:
                return {"pressure": "light", "consistency": 0.0}
            
            # Analyze pixel intensity distribution
            text_pixels = opened[opened > 0]
            avg_intensity = np.mean(text_pixels)
            intensity_std = np.std(text_pixels)
            
            # Normalize pressure (0-1 scale)
            pressure_score = min(1.0, avg_intensity / 255)
            pressure_consistency = max(0, 1 - (intensity_std / avg_intensity)) if avg_intensity > 0 else 0
            
            # Categorize pressure
            if pressure_score < 0.3:
                pressure_category = "light"
            elif pressure_score < 0.7:
                pressure_category = "medium"
            else:
                pressure_category = "heavy"
            
            return {
                "pressure_score": float(pressure_score),
                "pressure_consistency": float(pressure_consistency),
                "pressure_category": pressure_category,
                "intensity_variation": float(intensity_std)
            }
            
        except Exception as e:
            logger.error(f"Writing pressure analysis failed: {e}")
            return {"pressure": "unknown", "consistency": 0.0}
    
    async def _calculate_legibility_score(self, image: np.ndarray) -> float:
        """Calculate overall legibility score"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            
            # Calculate various legibility factors
            factors = []
            
            # 1. Contrast factor
            contrast = np.std(gray)
            contrast_score = min(1.0, contrast / 50)  # Normalize
            factors.append(contrast_score)
            
            # 2. Sharpness factor (using Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            sharpness_score = min(1.0, laplacian_var / 500)  # Normalize
            factors.append(sharpness_score)
            
            # 3. Noise factor (inverse of noise level)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            noise_level = np.mean(np.abs(gray.astype(float) - blurred.astype(float)))
            noise_score = max(0, 1 - (noise_level / 20))  # Normalize
            factors.append(noise_score)
            
            # 4. Character separation (using morphological operations)
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
            separation_score = np.count_nonzero(opened) / np.count_nonzero(binary) if np.count_nonzero(binary) > 0 else 0
            factors.append(separation_score)
            
            # Calculate weighted average
            weights = [0.3, 0.3, 0.2, 0.2]  # Contrast and sharpness are most important
            legibility_score = sum(f * w for f, w in zip(factors, weights))
            
            return float(max(0, min(1, legibility_score)))
            
        except Exception as e:
            logger.error(f"Legibility calculation failed: {e}")
            return 0.5
    
    async def _estimate_writing_speed(self, image: np.ndarray) -> Dict[str, Any]:
        """Estimate writing speed from handwriting characteristics"""
        try:
            # Convert to grayscale and binary
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Analyze stroke characteristics
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if len(contours) < 3:
                return {"speed": "unknown", "confidence": 0.0}
            
            # Calculate stroke complexity
            total_perimeter = sum(cv2.arcLength(contour, True) for contour in contours)
            total_area = sum(cv2.contourArea(contour) for contour in contours)
            
            if total_area == 0:
                return {"speed": "unknown", "confidence": 0.0}
            
            # Complexity ratio (higher = more complex/slower writing)
            complexity_ratio = total_perimeter / total_area
            
            # Analyze character connections (faster writing tends to have more connections)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 1))
            connected = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            connection_ratio = np.count_nonzero(connected) / np.count_nonzero(binary)
            
            # Speed estimation based on complexity and connections
            speed_score = (1 - min(1, complexity_ratio / 0.5)) * 0.6 + connection_ratio * 0.4
            
            # Categorize speed
            if speed_score < 0.3:
                speed_category = "slow"
            elif speed_score < 0.7:
                speed_category = "medium"
            else:
                speed_category = "fast"
            
            return {
                "speed_score": float(speed_score),
                "speed_category": speed_category,
                "complexity_ratio": float(complexity_ratio),
                "connection_ratio": float(connection_ratio),
                "confidence": 0.7  # Moderate confidence for speed estimation
            }
            
        except Exception as e:
            logger.error(f"Writing speed estimation failed: {e}")
            return {"speed": "unknown", "confidence": 0.0}
    
    def _categorize_spacing(self, spacing: float) -> str:
        """Categorize line spacing"""
        if spacing < 20:
            return "tight"
        elif spacing < 40:
            return "normal"
        elif spacing < 60:
            return "wide"
        else:
            return "very_wide"
    
    def _calculate_overall_quality(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall handwriting quality score"""
        try:
            quality_factors = []
            
            # Line spacing quality
            line_spacing = analysis_results.get("line_spacing", {})
            spacing_quality = line_spacing.get("spacing_consistency", 0) * 0.2
            quality_factors.append(spacing_quality)
            
            # Character consistency quality
            char_consistency = analysis_results.get("character_consistency", {})
            consistency_quality = char_consistency.get("overall_consistency", 0) * 0.3
            quality_factors.append(consistency_quality)
            
            # Slant consistency quality
            slant_analysis = analysis_results.get("writing_slant", {})
            slant_quality = slant_analysis.get("slant_consistency", 0) * 0.2
            quality_factors.append(slant_quality)
            
            # Pressure consistency quality
            pressure_analysis = analysis_results.get("writing_pressure", {})
            pressure_quality = pressure_analysis.get("pressure_consistency", 0) * 0.1
            quality_factors.append(pressure_quality)
            
            # Legibility quality
            legibility_quality = analysis_results.get("legibility_score", 0) * 0.2
            quality_factors.append(legibility_quality)
            
            overall_score = sum(quality_factors)
            
            # Categorize quality
            if overall_score >= 0.8:
                quality_category = "excellent"
            elif overall_score >= 0.6:
                quality_category = "good"
            elif overall_score >= 0.4:
                quality_category = "fair"
            else:
                quality_category = "needs_improvement"
            
            return {
                "overall_score": float(overall_score),
                "quality_category": quality_category,
                "component_scores": {
                    "spacing": spacing_quality,
                    "consistency": consistency_quality,
                    "slant": slant_quality,
                    "pressure": pressure_quality,
                    "legibility": legibility_quality
                }
            }
            
        except Exception as e:
            logger.error(f"Quality calculation failed: {e}")
            return {"overall_score": 0.5, "quality_category": "unknown"}
    
    def _generate_handwriting_recommendations(self, analysis_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations for handwriting improvement"""
        try:
            recommendations = []
            
            # Line spacing recommendations
            line_spacing = analysis_results.get("line_spacing", {})
            if line_spacing.get("spacing_consistency", 1) < 0.6:
                recommendations.append("Practice maintaining consistent line spacing between sentences")
            
            # Character consistency recommendations
            char_consistency = analysis_results.get("character_consistency", {})
            if char_consistency.get("height_consistency", 1) < 0.6:
                recommendations.append("Focus on writing letters with consistent height")
            if char_consistency.get("width_consistency", 1) < 0.6:
                recommendations.append("Practice maintaining consistent letter width")
            
            # Slant recommendations
            slant_analysis = analysis_results.get("writing_slant", {})
            if slant_analysis.get("slant_consistency", 1) < 0.6:
                recommendations.append("Work on maintaining a consistent writing angle")
            
            # Pressure recommendations
            pressure_analysis = analysis_results.get("writing_pressure", {})
            if pressure_analysis.get("pressure_consistency", 1) < 0.6:
                recommendations.append("Practice applying consistent pressure while writing")
            
            # Legibility recommendations
            legibility_score = analysis_results.get("legibility_score", 1)
            if legibility_score < 0.6:
                recommendations.append("Focus on writing more clearly and distinctly")
                recommendations.append("Take more time to form each letter properly")
            
            # Speed recommendations
            speed_analysis = analysis_results.get("writing_speed", {})
            if speed_analysis.get("speed_category") == "fast":
                recommendations.append("Consider slowing down to improve letter formation")
            elif speed_analysis.get("speed_category") == "slow":
                recommendations.append("Practice writing exercises to improve fluency")
            
            # General recommendations if no specific issues
            if not recommendations:
                recommendations.append("Your handwriting shows good overall quality")
                recommendations.append("Continue practicing to maintain consistency")
            
            return recommendations[:5]  # Limit to top 5 recommendations
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return ["Continue practicing to improve handwriting quality"]
    
    async def _comprehensive_analysis(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform comprehensive handwriting analysis"""
        try:
            # Recognize text
            recognition_result = await self._recognize_handwriting(input_data)
            
            # Analyze handwriting characteristics
            analysis_result = await self._analyze_handwriting(input_data)
            
            # Detect writing style
            style_result = await self._detect_writing_style(input_data)
            
            return {
                "recognition": recognition_result,
                "analysis": analysis_result,
                "style": style_result,
                "comprehensive_score": self._calculate_comprehensive_score(
                    recognition_result, analysis_result, style_result
                ),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Comprehensive analysis failed: {e}")
            raise
    
    async def _detect_writing_style(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect writing style characteristics"""
        try:
            # This would use the style classifier model
            # For now, return basic style analysis
            
            image_path = input_data.get("file_path") or input_data.get("image_path")
            if not image_path:
                raise ValueError("No image path provided")
            
            # Load and analyze image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Basic style characteristics
            style_features = {
                "cursive_level": 0.5,  # Placeholder
                "print_level": 0.5,    # Placeholder
                "formality": 0.6,      # Placeholder
                "creativity": 0.4,     # Placeholder
                "maturity": 0.7        # Placeholder
            }
            
            return {
                "style_features": style_features,
                "dominant_style": "mixed",
                "confidence": 0.6
            }
            
        except Exception as e:
            logger.error(f"Style detection failed: {e}")
            return {"style_features": {}, "dominant_style": "unknown", "confidence": 0.0}
    
    def _calculate_comprehensive_score(self, recognition: Dict[str, Any], 
                                     analysis: Dict[str, Any], 
                                     style: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive handwriting score"""
        try:
            # Recognition score
            recognition_score = recognition.get("confidence", 0) * 0.4
            
            # Analysis score
            analysis_quality = analysis.get("overall_quality", {})
            analysis_score = analysis_quality.get("overall_score", 0) * 0.4
            
            # Style score
            style_confidence = style.get("confidence", 0) * 0.2
            
            comprehensive_score = recognition_score + analysis_score + style_confidence
            
            return {
                "comprehensive_score": float(comprehensive_score),
                "component_scores": {
                    "recognition": recognition_score,
                    "analysis": analysis_score,
                    "style": style_confidence
                },
                "grade": self._score_to_grade(comprehensive_score)
            }
            
        except Exception as e:
            logger.error(f"Comprehensive score calculation failed: {e}")
            return {"comprehensive_score": 0.5, "grade": "C"}
    
    def _score_to_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 0.9: return "A+"
        elif score >= 0.85: return "A"
        elif score >= 0.8: return "A-"
        elif score >= 0.75: return "B+"
        elif score >= 0.7: return "B"
        elif score >= 0.65: return "B-"
        elif score >= 0.6: return "C+"
        elif score >= 0.55: return "C"
        elif score >= 0.5: return "C-"
        else: return "D"
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        try:
            return {
                "agent_id": self.agent_id,
                "agent_type": self.agent_type.value,
                "status": "healthy" if self.is_active else "inactive",
                "capabilities": [cap.name for cap in self.capabilities],
                "models_loaded": {
                    "trocr": self.trocr_model is not None,
                    "easyocr": self.easyocr_reader is not None,
                    "style_classifier": self.style_classifier is not None
                },
                "last_health_check": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {
                "agent_id": self.agent_id,
                "status": "unhealthy",
                "error": str(e)
            }
