"""OCR and Image Processing Engine"""
import base64
import os
from typing import Dict, Optional, Tuple
from pathlib import Path
import json
import requests
from datetime import datetime

class OCREngine:
    """Handles OCR and image processing"""
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    def extract_text_from_image(self, image_path: str, use_provider: str = "auto") -> Tuple[str, str]:
        """Extract text from image using OCR"""
        
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Read image and convert to base64
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
        
        # Get file extension to determine MIME type
        ext = Path(image_path).suffix.lower()
        mime_type = self._get_mime_type(ext)
        
        # Try providers in order
        if use_provider == "auto":
            if self.openai_key:
                text, provider = self._extract_with_openai(image_data, mime_type)
            elif self.gemini_key:
                text, provider = self._extract_with_gemini(image_data, mime_type)
            elif self.anthropic_key:
                text, provider = self._extract_with_anthropic(image_data, mime_type)
            else:
                text, provider = self._extract_demo(image_path)
        elif use_provider == "openai" and self.openai_key:
            text, provider = self._extract_with_openai(image_data, mime_type)
        elif use_provider == "gemini" and self.gemini_key:
            text, provider = self._extract_with_gemini(image_data, mime_type)
        elif use_provider == "anthropic" and self.anthropic_key:
            text, provider = self._extract_with_anthropic(image_data, mime_type)
        else:
            text, provider = self._extract_demo(image_path)
        
        return text, provider
    
    def _extract_with_openai(self, image_data: str, mime_type: str) -> Tuple[str, str]:
        """Extract text using OpenAI GPT-4 Vision"""
        try:
            headers = {
                "Authorization": f"Bearer {self.openai_key}",
                "Content-Type": "application/json",
            }
            
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extract ALL text from this answer sheet. Preserve the exact structure, questions, and answers. Format with clear sections.",
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{image_data}"
                                },
                            },
                        ],
                    }
                ],
                "max_tokens": 4000,
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30,
            )
            
            if response.status_code == 200:
                result = response.json()
                text = result["choices"][0]["message"]["content"]
                return text, "openai"
            else:
                raise Exception(f"OpenAI API error: {response.text}")
        
        except Exception as e:
            print(f"OpenAI extraction failed: {e}")
            raise
    
    def _extract_with_gemini(self, image_data: str, mime_type: str) -> Tuple[str, str]:
        """Extract text using Google Gemini"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}"
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": "Extract ALL text from this answer sheet. Preserve structure and formatting."
                            },
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": image_data
                                }
                            }
                        ]
                    }
                ]
            }
            
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                return text, "gemini"
            else:
                raise Exception(f"Gemini API error: {response.text}")
        
        except Exception as e:
            print(f"Gemini extraction failed: {e}")
            raise
    
    def _extract_with_anthropic(self, image_data: str, mime_type: str) -> Tuple[str, str]:
        """Extract text using Anthropic Claude"""
        try:
            headers = {
                "x-api-key": self.anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }
            
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 4000,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extract ALL text from this answer sheet precisely."
                            },
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": mime_type,
                                    "data": image_data,
                                },
                            },
                        ],
                    }
                ],
            }
            
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
                timeout=30,
            )
            
            if response.status_code == 200:
                result = response.json()
                text = result["content"][0]["text"]
                return text, "anthropic"
            else:
                raise Exception(f"Anthropic API error: {response.text}")
        
        except Exception as e:
            print(f"Anthropic extraction failed: {e}")
            raise
    
    def _extract_demo(self, image_path: str) -> Tuple[str, str]:
        """Demo extraction without API"""
        demo_text = f"""
        ANSWER SHEET - Demo Mode (No API configured)
        File: {Path(image_path).name}
        
        QUESTION 1:
        Student's Answer: [Visual content from image]
        The student has provided a comprehensive answer to the first question.
        
        QUESTION 2:
        Student's Answer: [Visual content from image]
        The response demonstrates good understanding of the subject matter.
        
        QUESTION 3:
        Student's Answer: [Visual content from image]
        The answer shows practical application of theoretical concepts.
        
        Note: For full OCR capabilities, configure OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY
        """
        return demo_text, "demo"
    
    @staticmethod
    def _get_mime_type(ext: str) -> str:
        """Get MIME type from file extension"""
        mime_types = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".tiff": "image/tiff",
            ".tif": "image/tiff",
        }
        return mime_types.get(ext, "image/jpeg")


class EvaluationProcessor:
    """Process extracted text and generate evaluations"""
    
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    def evaluate_answer_sheet(self, 
                            extracted_text: str,
                            subject: str,
                            rubric: Optional[Dict] = None,
                            use_provider: str = "auto") -> Dict:
        """Evaluate extracted text and generate results"""
        
        evaluation_prompt = self._build_evaluation_prompt(
            extracted_text, subject, rubric
        )
        
        # Try providers
        if use_provider == "auto":
            if self.openai_key:
                result = self._evaluate_with_openai(evaluation_prompt)
            elif self.gemini_key:
                result = self._evaluate_with_gemini(evaluation_prompt)
            elif self.anthropic_key:
                result = self._evaluate_with_anthropic(evaluation_prompt)
            else:
                result = self._evaluate_demo(subject)
        elif use_provider == "openai" and self.openai_key:
            result = self._evaluate_with_openai(evaluation_prompt)
        elif use_provider == "gemini" and self.gemini_key:
            result = self._evaluate_with_gemini(evaluation_prompt)
        elif use_provider == "anthropic" and self.anthropic_key:
            result = self._evaluate_with_anthropic(evaluation_prompt)
        else:
            result = self._evaluate_demo(subject)
        
        return result
    
    def _build_evaluation_prompt(self, extracted_text: str, subject: str, 
                                rubric: Optional[Dict]) -> str:
        """Build evaluation prompt for AI"""
        
        rubric_info = ""
        if rubric:
            rubric_info = f"\n\nCRITERIA:\n{json.dumps(rubric, indent=2)}"
        
        prompt = f"""You are an expert {subject} examiner. Evaluate this student answer sheet carefully.

SUBJECT: {subject}
{rubric_info}

EXTRACTED ANSWER SHEET TEXT:
{extracted_text}

Provide evaluation in VALID JSON format with these fields:
{{
  "obtainedMarks": <0-100>,
  "totalMarks": 100,
  "percentage": <0-100>,
  "grade": "<A+|A|B+|B|C+|C|D|F>",
  "confidenceScore": <0-100>,
  "overallFeedback": "<2-3 sentences>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "keyTopicsCovered": ["<topic1>", "<topic2>"],
  "areasForFocus": ["<area1>", "<area2>"],
  "questions": [
    {{
      "id": <number>,
      "topic": "<topic>",
      "obtainedMarks": <0-50>,
      "maxMarks": <number>,
      "feedback": "<feedback>",
      "keyPoints": ["<point1>", "<point2>"],
      "missingPoints": ["<point1>"]
    }}
  ]
}}

Return ONLY valid JSON, no extra text."""
        
        return prompt
    
    def _evaluate_with_openai(self, prompt: str) -> Dict:
        """Evaluate using OpenAI"""
        try:
            headers = {
                "Authorization": f"Bearer {self.openai_key}",
                "Content-Type": "application/json",
            }
            
            payload = {
                "model": "gpt-4o",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 3000,
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60,
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                return json.loads(content)
            else:
                raise Exception(f"OpenAI error: {response.text}")
        
        except Exception as e:
            print(f"OpenAI evaluation failed: {e}")
            raise
    
    def _evaluate_with_gemini(self, prompt: str) -> Dict:
        """Evaluate using Gemini"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.gemini_key}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"},
            }
            
            response = requests.post(url, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(content)
            else:
                raise Exception(f"Gemini error: {response.text}")
        
        except Exception as e:
            print(f"Gemini evaluation failed: {e}")
            raise
    
    def _evaluate_with_anthropic(self, prompt: str) -> Dict:
        """Evaluate using Anthropic"""
        try:
            headers = {
                "x-api-key": self.anthropic_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }
            
            payload = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 3000,
                "messages": [{"role": "user", "content": prompt}],
            }
            
            response = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload,
                timeout=60,
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["content"][0]["text"]
                return json.loads(content)
            else:
                raise Exception(f"Anthropic error: {response.text}")
        
        except Exception as e:
            print(f"Anthropic evaluation failed: {e}")
            raise
    
    @staticmethod
    def _evaluate_demo(subject: str) -> Dict:
        """Demo evaluation without API"""
        return {
            "obtainedMarks": 78,
            "totalMarks": 100,
            "percentage": 78,
            "grade": "B+",
            "confidenceScore": 85,
            "overallFeedback": f"Good understanding of {subject} concepts. Demonstrate more depth in complex topics for higher scores.",
            "strengths": [
                "Clear answer structure",
                "Good conceptual understanding",
                "Relevant examples provided"
            ],
            "improvements": [
                "Add more detailed explanations",
                "Include mathematical verification",
                "Improve handwriting clarity"
            ],
            "keyTopicsCovered": ["Core concepts", "Problem solving"],
            "areasForFocus": ["Advanced applications", "Edge cases"],
            "questions": [
                {
                    "id": 1,
                    "topic": "Fundamentals",
                    "obtainedMarks": 25,
                    "maxMarks": 30,
                    "feedback": "Good understanding with minor gaps",
                    "keyPoints": ["Concept A", "Concept B"],
                    "missingPoints": ["Advanced application"]
                }
            ]
        }
