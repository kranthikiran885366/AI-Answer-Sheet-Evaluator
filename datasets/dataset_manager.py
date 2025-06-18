import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
import logging
from datetime import datetime
import asyncio
import aiohttp
import aiofiles
from pathlib import Path
import hashlib
import zipfile
import tarfile
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import torch
from torch.utils.data import Dataset, DataLoader
import pickle

logger = logging.getLogger(__name__)

class DatasetManager:
    """Manages educational datasets for AI model training"""
    
    def __init__(self, base_path: str = "datasets"):
        self.base_path = Path(base_path)
        self.datasets_info = {}
        self.downloaded_datasets = set()
        
        # Create directory structure
        self._create_directory_structure()
        
        # Load existing dataset info
        self._load_dataset_info()
    
    def _create_directory_structure(self):
        """Create necessary directory structure"""
        directories = [
            "raw",           # Raw downloaded datasets
            "processed",     # Processed datasets ready for training
            "splits",        # Train/validation/test splits
            "embeddings",    # Pre-computed embeddings
            "models",        # Trained model files
            "metadata",      # Dataset metadata and descriptions
            "synthetic",     # Synthetically generated data
            "evaluation",    # Evaluation datasets
            "subject_specific"  # Subject-specific datasets
        ]
        
        for directory in directories:
            (self.base_path / directory).mkdir(parents=True, exist_ok=True)
        
        # Create subject-specific directories
        subjects = ["mathematics", "physics", "chemistry", "biology", "english", "history", "computer_science"]
        for subject in subjects:
            (self.base_path / "subject_specific" / subject).mkdir(parents=True, exist_ok=True)
    
    def _load_dataset_info(self):
        """Load dataset information from metadata"""
        metadata_file = self.base_path / "metadata" / "datasets_info.json"
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                self.datasets_info = json.load(f)
    
    def _save_dataset_info(self):
        """Save dataset information to metadata"""
        metadata_file = self.base_path / "metadata" / "datasets_info.json"
        with open(metadata_file, 'w') as f:
            json.dump(self.datasets_info, f, indent=2, default=str)
    
    async def download_educational_datasets(self):
        """Download various educational datasets"""
        datasets_to_download = [
            {
                "name": "student_evaluation_dataset",
                "url": "https://archive.ics.uci.edu/ml/machine-learning-databases/00320/student.zip",
                "description": "Student performance in secondary education",
                "subject": "general",
                "type": "tabular"
            },
            {
                "name": "math_word_problems",
                "url": "https://github.com/chaochun/nlu-asdl-dataset/raw/master/data/math_word_problems.json",
                "description": "Mathematical word problems with solutions",
                "subject": "mathematics",
                "type": "text"
            },
            {
                "name": "science_qa_dataset",
                "url": "https://scienceqa.github.io/data/scienceqa.zip",
                "description": "Science question answering dataset",
                "subject": "science",
                "type": "multimodal"
            },
            {
                "name": "essay_scoring_dataset",
                "url": "https://www.kaggle.com/c/asap-aes/data",
                "description": "Automated essay scoring dataset",
                "subject": "english",
                "type": "text"
            }
        ]
        
        for dataset_info in datasets_to_download:
            try:
                await self._download_dataset(dataset_info)
            except Exception as e:
                logger.error(f"Failed to download {dataset_info['name']}: {e}")
    
    async def _download_dataset(self, dataset_info: Dict[str, Any]):
        """Download a single dataset"""
        dataset_name = dataset_info["name"]
        
        if dataset_name in self.downloaded_datasets:
            logger.info(f"Dataset {dataset_name} already downloaded")
            return
        
        logger.info(f"Downloading dataset: {dataset_name}")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(dataset_info["url"]) as response:
                    if response.status == 200:
                        # Determine file extension
                        content_type = response.headers.get('content-type', '')
                        if 'zip' in content_type or dataset_info["url"].endswith('.zip'):
                            file_extension = '.zip'
                        elif 'json' in content_type or dataset_info["url"].endswith('.json'):
                            file_extension = '.json'
                        elif 'csv' in content_type or dataset_info["url"].endswith('.csv'):
                            file_extension = '.csv'
                        else:
                            file_extension = '.data'
                        
                        # Save file
                        file_path = self.base_path / "raw" / f"{dataset_name}{file_extension}"
                        
                        async with aiofiles.open(file_path, 'wb') as f:
                            async for chunk in response.content.iter_chunked(8192):
                                await f.write(chunk)
                        
                        # Extract if zip file
                        if file_extension == '.zip':
                            await self._extract_zip(file_path, dataset_name)
                        
                        # Update dataset info
                        self.datasets_info[dataset_name] = {
                            **dataset_info,
                            "downloaded_at": datetime.utcnow().isoformat(),
                            "file_path": str(file_path),
                            "file_size": file_path.stat().st_size,
                            "status": "downloaded"
                        }
                        
                        self.downloaded_datasets.add(dataset_name)
                        self._save_dataset_info()
                        
                        logger.info(f"Successfully downloaded {dataset_name}")
                    else:
                        logger.error(f"Failed to download {dataset_name}: HTTP {response.status}")
                        
        except Exception as e:
            logger.error(f"Error downloading {dataset_name}: {e}")
    
    async def _extract_zip(self, zip_path: Path, dataset_name: str):
        """Extract zip file"""
        extract_path = self.base_path / "raw" / dataset_name
        extract_path.mkdir(exist_ok=True)
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        
        logger.info(f"Extracted {zip_path} to {extract_path}")
    
    async def create_synthetic_datasets(self):
        """Create synthetic educational datasets"""
        logger.info("Creating synthetic datasets...")
        
        # Mathematics dataset
        await self._create_math_dataset()
        
        # Science dataset
        await self._create_science_dataset()
        
        # Essay evaluation dataset
        await self._create_essay_dataset()
        
        # General Q&A dataset
        await self._create_qa_dataset()
    
    async def _create_math_dataset(self):
        """Create synthetic mathematics dataset"""
        logger.info("Creating synthetic mathematics dataset...")
        
        math_problems = []
        
        # Arithmetic problems
        for i in range(1000):
            a, b = np.random.randint(1, 100, 2)
            operation = np.random.choice(['+', '-', '*', '/'])
            
            if operation == '+':
                question = f"What is {a} + {b}?"
                answer = str(a + b)
                solution = f"To add {a} and {b}, we get {a + b}."
            elif operation == '-':
                question = f"What is {a} - {b}?"
                answer = str(a - b)
                solution = f"To subtract {b} from {a}, we get {a - b}."
            elif operation == '*':
                question = f"What is {a} × {b}?"
                answer = str(a * b)
                solution = f"To multiply {a} and {b}, we get {a * b}."
            else:  # division
                if b != 0:
                    question = f"What is {a} ÷ {b}? (Round to 2 decimal places)"
                    answer = str(round(a / b, 2))
                    solution = f"To divide {a} by {b}, we get {round(a / b, 2)}."
                else:
                    continue
            
            math_problems.append({
                'question': question,
                'answer': answer,
                'solution': solution,
                'difficulty': 'easy',
                'topic': 'arithmetic',
                'max_marks': 5
            })
        
        # Algebra problems
        for i in range(500):
            a, b, c = np.random.randint(1, 20, 3)
            
            question = f"Solve for x: {a}x + {b} = {c}"
            x = (c - b) / a
            answer = str(round(x, 2))
            solution = f"To solve {a}x + {b} = {c}, subtract {b} from both sides: {a}x = {c - b}, then divide by {a}: x = {round(x, 2)}"
            
            math_problems.append({
                'question': question,
                'answer': answer,
                'solution': solution,
                'difficulty': 'medium',
                'topic': 'algebra',
                'max_marks': 10
            })
        
        # Geometry problems
        for i in range(300):
            if np.random.choice([True, False]):
                # Rectangle area
                length, width = np.random.randint(5, 50, 2)
                question = f"Find the area of a rectangle with length {length} cm and width {width} cm."
                answer = str(length * width)
                solution = f"Area of rectangle = length × width = {length} × {width} = {length * width} cm²"
                topic = 'geometry_area'
            else:
                # Circle area
                radius = np.random.randint(5, 25)
                area = round(3.14159 * radius * radius, 2)
                question = f"Find the area of a circle with radius {radius} cm. (Use π = 3.14159)"
                answer = str(area)
                solution = f"Area of circle = πr² = 3.14159 × {radius}² = {area} cm²"
                topic = 'geometry_circle'
            
            math_problems.append({
                'question': question,
                'answer': answer,
                'solution': solution,
                'difficulty': 'medium',
                'topic': topic,
                'max_marks': 8
            })
        
        # Save mathematics dataset
        math_df = pd.DataFrame(math_problems)
        math_file = self.base_path / "synthetic" / "mathematics_dataset.csv"
        math_df.to_csv(math_file, index=False)
        
        # Update dataset info
        self.datasets_info["synthetic_mathematics"] = {
            "name": "synthetic_mathematics",
            "description": "Synthetically generated mathematics problems",
            "subject": "mathematics",
            "type": "text",
            "file_path": str(math_file),
            "samples": len(math_problems),
            "created_at": datetime.utcnow().isoformat(),
            "status": "ready"
        }
        
        logger.info(f"Created mathematics dataset with {len(math_problems)} problems")
    
    async def _create_science_dataset(self):
        """Create synthetic science dataset"""
        logger.info("Creating synthetic science dataset...")
        
        science_problems = []
        
        # Physics problems
        physics_topics = [
            {
                'topic': 'motion',
                'questions': [
                    "A car travels at 60 km/h for 2 hours. What distance does it cover?",
                    "An object falls from rest. What is its velocity after 3 seconds? (g = 9.8 m/s²)",
                    "A ball is thrown upward with initial velocity 20 m/s. What is its maximum height?"
                ]
            },
            {
                'topic': 'energy',
                'questions': [
                    "Calculate the kinetic energy of a 5 kg object moving at 10 m/s.",
                    "A 2 kg object is lifted to a height of 5 m. What is its potential energy?",
                    "A spring with constant k = 100 N/m is compressed by 0.2 m. What is the stored energy?"
                ]
            }
        ]
        
        for topic_info in physics_topics:
            for question in topic_info['questions']:
                # Generate sample answers (simplified)
                if 'distance' in question.lower():
                    answer = "120 km"
                    solution = "Distance = Speed × Time = 60 km/h × 2 h = 120 km"
                elif 'velocity' in question.lower() and 'falls' in question.lower():
                    answer = "29.4 m/s"
                    solution = "v = gt = 9.8 × 3 = 29.4 m/s"
                elif 'kinetic energy' in question.lower():
                    answer = "250 J"
                    solution = "KE = ½mv² = ½ × 5 × 10² = 250 J"
                else:
                    answer = "Sample answer"
                    solution = "Sample solution"
                
                science_problems.append({
                    'question': question,
                    'answer': answer,
                    'solution': solution,
                    'subject': 'physics',
                    'topic': topic_info['topic'],
                    'difficulty': 'medium',
                    'max_marks': 10
                })
        
        # Chemistry problems
        chemistry_questions = [
            {
                'question': "What is the molecular formula of water?",
                'answer': "H₂O",
                'solution': "Water consists of 2 hydrogen atoms and 1 oxygen atom, so its molecular formula is H₂O.",
                'topic': 'molecular_formulas'
            },
            {
                'question': "Balance the equation: H₂ + O₂ → H₂O",
                'answer': "2H₂ + O₂ → 2H₂O",
                'solution': "To balance: 2 hydrogen molecules react with 1 oxygen molecule to form 2 water molecules.",
                'topic': 'chemical_equations'
            }
        ]
        
        for chem_q in chemistry_questions:
            science_problems.append({
                **chem_q,
                'subject': 'chemistry',
                'difficulty': 'medium',
                'max_marks': 8
            })
        
        # Save science dataset
        science_df = pd.DataFrame(science_problems)
        science_file = self.base_path / "synthetic" / "science_dataset.csv"
        science_df.to_csv(science_file, index=False)
        
        # Update dataset info
        self.datasets_info["synthetic_science"] = {
            "name": "synthetic_science",
            "description": "Synthetically generated science problems",
            "subject": "science",
            "type": "text",
            "file_path": str(science_file),
            "samples": len(science_problems),
            "created_at": datetime.utcnow().isoformat(),
            "status": "ready"
        }
        
        logger.info(f"Created science dataset with {len(science_problems)} problems")
    
    async def _create_essay_dataset(self):
        """Create synthetic essay evaluation dataset"""
        logger.info("Creating synthetic essay dataset...")
        
        essay_samples = []
        
        # Essay prompts
        prompts = [
            "Discuss the importance of renewable energy sources.",
            "Explain the impact of social media on modern communication.",
            "Analyze the causes and effects of climate change.",
            "Describe the role of technology in education.",
            "Discuss the benefits and drawbacks of remote work."
        ]
        
        # Sample essays with different quality levels
        for prompt in prompts:
            # High quality essay
            high_quality = f"""
            {prompt}
            
            This is a comprehensive analysis of the topic. The essay demonstrates clear understanding,
            well-structured arguments, and excellent use of examples. The writing is coherent,
            grammatically correct, and shows critical thinking skills. The conclusion effectively
            summarizes the main points and provides thoughtful insights.
            """
            
            essay_samples.append({
                'prompt': prompt,
                'essay': high_quality.strip(),
                'score': 95,
                'grade': 'A',
                'feedback': 'Excellent work with clear arguments and good structure.',
                'rubric_scores': {
                    'content': 95,
                    'organization': 90,
                    'grammar': 95,
                    'vocabulary': 90
                }
            })
            
            # Medium quality essay
            medium_quality = f"""
            {prompt}
            
            This essay addresses the topic adequately. The arguments are present but could be
            more developed. The structure is generally good but some transitions could be improved.
            The writing is mostly clear with minor grammatical errors.
            """
            
            essay_samples.append({
                'prompt': prompt,
                'essay': medium_quality.strip(),
                'score': 75,
                'grade': 'B',
                'feedback': 'Good effort but could benefit from more detailed examples.',
                'rubric_scores': {
                    'content': 75,
                    'organization': 80,
                    'grammar': 70,
                    'vocabulary': 75
                }
            })
            
            # Low quality essay
            low_quality = f"""
            {prompt}
            
            This essay attempts to address the topic but lacks depth. The arguments are weak
            and not well supported. The structure is unclear and there are several grammatical
            errors that affect readability.
            """
            
            essay_samples.append({
                'prompt': prompt,
                'essay': low_quality.strip(),
                'score': 55,
                'grade': 'D',
                'feedback': 'Needs significant improvement in content development and grammar.',
                'rubric_scores': {
                    'content': 50,
                    'organization': 55,
                    'grammar': 45,
                    'vocabulary': 60
                }
            })
        
        # Save essay dataset
        essay_df = pd.DataFrame(essay_samples)
        essay_file = self.base_path / "synthetic" / "essay_dataset.csv"
        essay_df.to_csv(essay_file, index=False)
        
        # Update dataset info
        self.datasets_info["synthetic_essays"] = {
            "name": "synthetic_essays",
            "description": "Synthetically generated essay evaluation dataset",
            "subject": "english",
            "type": "text",
            "file_path": str(essay_file),
            "samples": len(essay_samples),
            "created_at": datetime.utcnow().isoformat(),
            "status": "ready"
        }
        
        logger.info(f"Created essay dataset with {len(essay_samples)} samples")
    
    async def _create_qa_dataset(self):
        """Create general Q&A dataset"""
        logger.info("Creating general Q&A dataset...")
        
        qa_samples = []
        
        # General knowledge questions
        general_questions = [
            {
                'question': "What is the capital of France?",
                'answer': "Paris",
                'explanation': "Paris is the capital and largest city of France.",
                'category': 'geography',
                'difficulty': 'easy'
            },
            {
                'question': "Who wrote Romeo and Juliet?",
                'answer': "William Shakespeare",
                'explanation': "Romeo and Juliet is a tragedy written by William Shakespeare in the early part of his career.",
                'category': 'literature',
                'difficulty': 'easy'
            },
            {
                'question': "What is photosynthesis?",
                'answer': "The process by which plants convert sunlight into energy",
                'explanation': "Photosynthesis is the process used by plants to convert light energy into chemical energy stored in glucose.",
                'category': 'biology',
                'difficulty': 'medium'
            }
        ]
        
        for q in general_questions:
            qa_samples.append({
                **q,
                'max_marks': 5 if q['difficulty'] == 'easy' else 10
            })
        
        # Save Q&A dataset
        qa_df = pd.DataFrame(qa_samples)
        qa_file = self.base_path / "synthetic" / "qa_dataset.csv"
        qa_df.to_csv(qa_file, index=False)
        
        # Update dataset info
        self.datasets_info["synthetic_qa"] = {
            "name": "synthetic_qa",
            "description": "General question-answer dataset",
            "subject": "general",
            "type": "text",
            "file_path": str(qa_file),
            "samples": len(qa_samples),
            "created_at": datetime.utcnow().isoformat(),
            "status": "ready"
        }
        
        logger.info(f"Created Q&A dataset with {len(qa_samples)} samples")
    
    async def process_datasets(self):
        """Process raw datasets for training"""
        logger.info("Processing datasets for training...")
        
        for dataset_name, dataset_info in self.datasets_info.items():
            if dataset_info.get('status') == 'ready' and 'processed' not in dataset_info:
                try:
                    await self._process_single_dataset(dataset_name, dataset_info)
                except Exception as e:
                    logger.error(f"Failed to process dataset {dataset_name}: {e}")
    
    async def _process_single_dataset(self, dataset_name: str, dataset_info: Dict[str, Any]):
        """Process a single dataset"""
        logger.info(f"Processing dataset: {dataset_name}")
        
        file_path = Path(dataset_info['file_path'])
        
        if not file_path.exists():
            logger.error(f"Dataset file not found: {file_path}")
            return
        
        # Load dataset
        if file_path.suffix == '.csv':
            df = pd.read_csv(file_path)
        elif file_path.suffix == '.json':
            df = pd.read_json(file_path)
        else:
            logger.warning(f"Unsupported file format: {file_path.suffix}")
            return
        
        # Basic preprocessing
        processed_df = await self._preprocess_dataframe(df, dataset_info)
        
        # Create train/validation/test splits
        train_df, temp_df = train_test_split(processed_df, test_size=0.3, random_state=42)
        val_df, test_df = train_test_split(temp_df, test_size=0.5, random_state=42)
        
        # Save splits
        splits_dir = self.base_path / "splits" / dataset_name
        splits_dir.mkdir(parents=True, exist_ok=True)
        
        train_df.to_csv(splits_dir / "train.csv", index=False)
        val_df.to_csv(splits_dir / "val.csv", index=False)
        test_df.to_csv(splits_dir / "test.csv", index=False)
        
        # Save processed dataset
        processed_file = self.base_path / "processed" / f"{dataset_name}_processed.csv"
        processed_df.to_csv(processed_file, index=False)
        
        # Update dataset info
        self.datasets_info[dataset_name].update({
            'processed': True,
            'processed_file': str(processed_file),
            'splits_dir': str(splits_dir),
            'train_samples': len(train_df),
            'val_samples': len(val_df),
            'test_samples': len(test_df),
            'processed_at': datetime.utcnow().isoformat()
        })
        
        self._save_dataset_info()
        logger.info(f"Successfully processed dataset: {dataset_name}")
    
    async def _preprocess_dataframe(self, df: pd.DataFrame, dataset_info: Dict[str, Any]) -> pd.DataFrame:
        """Preprocess dataframe based on dataset type"""
        processed_df = df.copy()
        
        # Text preprocessing for text-based datasets
        if dataset_info.get('type') == 'text':
            text_columns = ['question', 'answer', 'solution', 'essay', 'explanation']
            
            for col in text_columns:
                if col in processed_df.columns:
                    # Basic text cleaning
                    processed_df[col] = processed_df[col].astype(str)
                    processed_df[col] = processed_df[col].str.strip()
                    processed_df[col] = processed_df[col].replace('\n', ' ')
                    processed_df[col] = processed_df[col].replace('\t', ' ')
                    
                    # Remove extra whitespace
                    processed_df[col] = processed_df[col].str.replace(r'\s+', ' ', regex=True)
        
        # Handle missing values
        processed_df = processed_df.dropna(subset=['question', 'answer'] if 'question' in processed_df.columns else processed_df.columns[:2])
        
        # Add metadata columns
        processed_df['dataset_name'] = dataset_info['name']
        processed_df['subject'] = dataset_info.get('subject', '
