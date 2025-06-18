import os
import asyncio
import aiohttp
import aiofiles
import zipfile
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import logging
from pathlib import Path
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer
import kaggle

logger = logging.getLogger(__name__)

class DatasetManager:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.datasets = {}
        self.kaggle_api = None
        self._setup_kaggle()
        
    def _setup_kaggle(self):
        """Setup Kaggle API for dataset downloads"""
        try:
            from kaggle.api.kaggle_api_extended import KaggleApi
            self.kaggle_api = KaggleApi()
            self.kaggle_api.authenticate()
            logger.info("Kaggle API authenticated successfully")
        except Exception as e:
            logger.warning(f"Kaggle API setup failed: {e}")
    
    async def download_educational_datasets(self):
        """Download relevant educational datasets"""
        datasets_to_download = [
            {
                'name': 'student-performance',
                'kaggle_id': 'spscientist/students-performance-in-exams',
                'description': 'Student performance in exams dataset'
            },
            {
                'name': 'essay-scoring',
                'kaggle_id': 'c/asap-aes',
                'description': 'Automated Essay Scoring dataset'
            },
            {
                'name': 'math-answers',
                'kaggle_id': 'rishidamarla/mathematical-reasoning-dataset',
                'description': 'Mathematical reasoning dataset'
            },
            {
                'name': 'science-qa',
                'kaggle_id': 'divyansh22/science-question-answer-dataset',
                'description': 'Science Q&A dataset'
            }
        ]
        
        for dataset_info in datasets_to_download:
            try:
                await self._download_kaggle_dataset(dataset_info)
            except Exception as e:
                logger.error(f"Failed to download {dataset_info['name']}: {e}")
                # Create synthetic dataset as fallback
                await self._create_synthetic_dataset(dataset_info['name'])
    
    async def _download_kaggle_dataset(self, dataset_info: Dict[str, str]):
        """Download dataset from Kaggle"""
        if not self.kaggle_api:
            raise Exception("Kaggle API not available")
        
        dataset_path = self.data_dir / dataset_info['name']
        dataset_path.mkdir(exist_ok=True)
        
        logger.info(f"Downloading {dataset_info['name']} from Kaggle...")
        
        # Download dataset
        await asyncio.to_thread(
            self.kaggle_api.dataset_download_files,
            dataset_info['kaggle_id'],
            path=str(dataset_path),
            unzip=True
        )
        
        logger.info(f"Downloaded {dataset_info['name']} successfully")
        
        # Process and store dataset info
        self.datasets[dataset_info['name']] = {
            'path': dataset_path,
            'description': dataset_info['description'],
            'downloaded': True
        }
    
    async def _create_synthetic_dataset(self, dataset_name: str):
        """Create synthetic dataset for training"""
        logger.info(f"Creating synthetic dataset: {dataset_name}")
        
        dataset_path = self.data_dir / dataset_name
        dataset_path.mkdir(exist_ok=True)
        
        if dataset_name == 'student-performance':
            await self._create_student_performance_dataset(dataset_path)
        elif dataset_name == 'essay-scoring':
            await self._create_essay_scoring_dataset(dataset_path)
        elif dataset_name == 'math-answers':
            await self._create_math_answers_dataset(dataset_path)
        elif dataset_name == 'science-qa':
            await self._create_science_qa_dataset(dataset_path)
        
        self.datasets[dataset_name] = {
            'path': dataset_path,
            'description': f'Synthetic {dataset_name} dataset',
            'downloaded': True
        }
    
    async def _create_student_performance_dataset(self, path: Path):
        """Create synthetic student performance dataset"""
        np.random.seed(42)
        
        subjects = ['math', 'reading', 'writing', 'science', 'history']
        exam_types = ['quiz', 'midterm', 'final', 'assignment']
        
        data = []
        for i in range(1000):
            student_id = f"student_{i:04d}"
            subject = np.random.choice(subjects)
            exam_type = np.random.choice(exam_types)
            
            # Generate correlated scores
            base_ability = np.random.normal(75, 15)
            score = max(0, min(100, base_ability + np.random.normal(0, 10)))
            
            data.append({
                'student_id': student_id,
                'subject': subject,
                'exam_type': exam_type,
                'score': round(score, 1),
                'study_time': max(0, np.random.normal(5, 2)),
                'previous_score': max(0, min(100, score + np.random.normal(0, 5)))
            })
        
        df = pd.DataFrame(data)
        df.to_csv(path / 'student_performance.csv', index=False)
        logger.info(f"Created student performance dataset with {len(data)} records")
    
    async def _create_essay_scoring_dataset(self, path: Path):
        """Create synthetic essay scoring dataset"""
        essay_templates = [
            "The importance of {topic} cannot be overstated. In today's world, {topic} plays a crucial role in {context}. For example, {example}. Furthermore, {additional_point}. In conclusion, {conclusion}.",
            "When considering {topic}, we must examine multiple perspectives. On one hand, {perspective1}. On the other hand, {perspective2}. The evidence suggests that {evidence}. Therefore, {conclusion}.",
            "{topic} is a complex issue that requires careful analysis. Research shows that {research_point}. Additionally, experts argue that {expert_opinion}. Based on this information, {conclusion}."
        ]
        
        topics = ['education', 'technology', 'environment', 'healthcare', 'economics']
        
        data = []
        for i in range(500):
            topic = np.random.choice(topics)
            template = np.random.choice(essay_templates)
            
            # Generate essay content
            essay = template.format(
                topic=topic,
                context=f"{topic} development",
                example=f"studies in {topic}",
                additional_point=f"the impact of {topic}",
                conclusion=f"{topic} remains important",
                perspective1=f"{topic} benefits society",
                perspective2=f"{topic} has challenges",
                evidence=f"{topic} research",
                research_point=f"{topic} trends",
                expert_opinion=f"{topic} best practices"
            )
            
            # Generate score based on essay quality indicators
            word_count = len(essay.split())
            complexity_score = len(set(essay.split())) / len(essay.split())
            
            base_score = 50 + (word_count / 10) + (complexity_score * 30)
            score = max(0, min(100, base_score + np.random.normal(0, 10)))
            
            data.append({
                'essay_id': f"essay_{i:04d}",
                'essay_text': essay,
                'topic': topic,
                'score': round(score, 1),
                'word_count': word_count
            })
        
        df = pd.DataFrame(data)
        df.to_csv(path / 'essay_scoring.csv', index=False)
        logger.info(f"Created essay scoring dataset with {len(data)} records")
    
    async def _create_math_answers_dataset(self, path: Path):
        """Create synthetic math answers dataset"""
        question_types = ['algebra', 'geometry', 'calculus', 'statistics', 'trigonometry']
        
        data = []
        for i in range(300):
            question_type = np.random.choice(question_types)
            
            # Generate question and answer based on type
            if question_type == 'algebra':
                question = f"Solve for x: {np.random.randint(2, 10)}x + {np.random.randint(1, 20)} = {np.random.randint(20, 50)}"
                correct_answer = "x = (result - constant) / coefficient"
            elif question_type == 'geometry':
                question = f"Find the area of a rectangle with length {np.random.randint(5, 20)} and width {np.random.randint(3, 15)}"
                correct_answer = "Area = length × width"
            else:
                question = f"Calculate the {question_type} problem"
                correct_answer = f"Solution using {question_type} methods"
            
            # Generate student answer with varying quality
            quality = np.random.choice(['excellent', 'good', 'fair', 'poor'])
            
            if quality == 'excellent':
                student_answer = correct_answer + " with detailed steps and explanation"
                score = np.random.uniform(90, 100)
            elif quality == 'good':
                student_answer = correct_answer + " with some steps shown"
                score = np.random.uniform(75, 89)
            elif quality == 'fair':
                student_answer = "Partial solution with basic understanding"
                score = np.random.uniform(60, 74)
            else:
                student_answer = "Incomplete or incorrect solution"
                score = np.random.uniform(0, 59)
            
            data.append({
                'question_id': f"math_{i:04d}",
                'question_type': question_type,
                'question_text': question,
                'correct_answer': correct_answer,
                'student_answer': student_answer,
                'score': round(score, 1)
            })
        
        df = pd.DataFrame(data)
        df.to_csv(path / 'math_answers.csv', index=False)
        logger.info(f"Created math answers dataset with {len(data)} records")
    
    async def _create_science_qa_dataset(self, path: Path):
        """Create synthetic science Q&A dataset"""
        subjects = ['biology', 'chemistry', 'physics', 'earth_science']
        
        data = []
        for i in range(400):
            subject = np.random.choice(subjects)
            
            # Generate subject-specific questions
            if subject == 'biology':
                question = "Explain the process of photosynthesis"
                key_points = ['chlorophyll', 'sunlight', 'carbon dioxide', 'oxygen', 'glucose']
            elif subject == 'chemistry':
                question = "Describe the structure of an atom"
                key_points = ['nucleus', 'protons', 'neutrons', 'electrons', 'orbitals']
            elif subject == 'physics':
                question = "Explain Newton's laws of motion"
                key_points = ['inertia', 'force', 'acceleration', 'action', 'reaction']
            else:
                question = "Describe the water cycle"
                key_points = ['evaporation', 'condensation', 'precipitation', 'collection']
            
            # Generate student answer with varying completeness
            num_points = np.random.randint(1, len(key_points) + 1)
            covered_points = np.random.choice(key_points, num_points, replace=False)
            
            student_answer = f"The answer involves {', '.join(covered_points)}"
            score = (len(covered_points) / len(key_points)) * 100 + np.random.normal(0, 10)
            score = max(0, min(100, score))
            
            data.append({
                'question_id': f"science_{i:04d}",
                'subject': subject,
                'question_text': question,
                'key_points': json.dumps(key_points),
                'student_answer': student_answer,
                'covered_points': json.dumps(list(covered_points)),
                'score': round(score, 1)
            })
        
        df = pd.DataFrame(data)
        df.to_csv(path / 'science_qa.csv', index=False)
        logger.info(f"Created science Q&A dataset with {len(data)} records")
    
    def get_dataset(self, name: str) -> Optional[pd.DataFrame]:
        """Load and return a dataset"""
        if name not in self.datasets:
            return None
        
        dataset_path = self.datasets[name]['path']
        csv_files = list(dataset_path.glob('*.csv'))
        
        if not csv_files:
            return None
        
        # Load the first CSV file found
        return pd.read_csv(csv_files[0])
    
    def prepare_training_data(self, dataset_name: str, test_size: float = 0.2) -> Dict[str, Any]:
        """Prepare data for training"""
        df = self.get_dataset(dataset_name)
        if df is None:
            raise ValueError(f"Dataset {dataset_name} not found")
        
        # Split data
        train_df, test_df = train_test_split(df, test_size=test_size, random_state=42)
        
        return {
            'train': train_df,
            'test': test_df,
            'full': df,
            'features': list(df.columns),
            'size': len(df)
        }

class AnswerDataset(Dataset):
    """PyTorch dataset for answer evaluation training"""
    
    def __init__(self, dataframe: pd.DataFrame, tokenizer, max_length: int = 512):
        self.data = dataframe
        self.tokenizer = tokenizer
        self.max_length = max_length
        
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        row = self.data.iloc[idx]
        
        # Get text and score
        text = str(row.get('student_answer', ''))
        score = float(row.get('score', 0))
        
        # Tokenize text
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'score': torch.tensor(score, dtype=torch.float)
        }
