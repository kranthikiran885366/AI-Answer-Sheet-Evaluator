import asyncio
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import aiohttp
import aiofiles
import zipfile
import tarfile
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import torch
from transformers import AutoTokenizer, AutoModel
import datasets
from datasets import Dataset, DatasetDict
import kaggle
import requests
import os
import hashlib
import pickle

logger = logging.getLogger(__name__)

class DataManager:
    """Manages educational datasets for AI model training and evaluation"""
    
    def __init__(self, base_path: str = "data"):
        self.base_path = Path(base_path)
        self.datasets_registry = {}
        self.download_queue = asyncio.Queue()
        self.processing_queue = asyncio.Queue()
        self.is_running = False
        
        # Create directory structure
        self._create_directory_structure()
        
        # Load existing registry
        self._load_datasets_registry()
        
        # Dataset sources configuration
        self.dataset_sources = {
            "kaggle": {
                "api_key": os.getenv("KAGGLE_API_KEY"),
                "username": os.getenv("KAGGLE_USERNAME")
            },
            "huggingface": {
                "token": os.getenv("HUGGINGFACE_TOKEN")
            },
            "openml": {
                "api_key": os.getenv("OPENML_API_KEY")
            }
        }
    
    def _create_directory_structure(self):
        """Create comprehensive directory structure for data management"""
        directories = [
            "raw",                    # Raw downloaded datasets
            "processed",              # Processed datasets
            "splits",                 # Train/validation/test splits
            "embeddings",             # Pre-computed embeddings
            "synthetic",              # Synthetically generated data
            "evaluation",             # Evaluation datasets
            "subject_specific",       # Subject-specific datasets
            "real_time",             # Real-time collected data
            "feedback",              # User feedback data
            "annotations",           # Human annotations
            "metadata",              # Dataset metadata
            "cache",                 # Cached processed data
            "exports",               # Exported datasets
            "backups",               # Dataset backups
            "quality_checks",        # Data quality reports
            "statistics"             # Dataset statistics
        ]
        
        for directory in directories:
            (self.base_path / directory).mkdir(parents=True, exist_ok=True)
        
        # Create subject-specific directories
        subjects = [
            "mathematics", "physics", "chemistry", "biology", 
            "english", "history", "computer_science", "geography",
            "economics", "psychology", "philosophy", "art"
        ]
        
        for subject in subjects:
            (self.base_path / "subject_specific" / subject).mkdir(parents=True, exist_ok=True)
            (self.base_path / "processed" / subject).mkdir(parents=True, exist_ok=True)
            (self.base_path / "splits" / subject).mkdir(parents=True, exist_ok=True)
    
    def _load_datasets_registry(self):
        """Load datasets registry from metadata"""
        registry_file = self.base_path / "metadata" / "datasets_registry.json"
        if registry_file.exists():
            with open(registry_file, 'r') as f:
                self.datasets_registry = json.load(f)
        else:
            self.datasets_registry = {}
    
    def _save_datasets_registry(self):
        """Save datasets registry to metadata"""
        registry_file = self.base_path / "metadata" / "datasets_registry.json"
        with open(registry_file, 'w') as f:
            json.dump(self.datasets_registry, f, indent=2, default=str)
    
    async def initialize(self):
        """Initialize data manager"""
        try:
            logger.info("Initializing Data Manager...")
            
            # Start background workers
            self.is_running = True
            asyncio.create_task(self._download_worker())
            asyncio.create_task(self._processing_worker())
            asyncio.create_task(self._quality_check_worker())
            
            # Download essential datasets
            await self._download_essential_datasets()
            
            # Process existing datasets
            await self._process_existing_datasets()
            
            logger.info("Data Manager initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Data Manager: {e}")
            raise
    
    async def _download_essential_datasets(self):
        """Download essential educational datasets"""
        essential_datasets = [
            {
                "name": "asap_aes",
                "source": "kaggle",
                "dataset_id": "c/asap-aes",
                "description": "Automated Student Assessment Prize - Automated Essay Scoring",
                "subject": "english",
                "type": "text",
                "priority": 1
            },
            {
                "name": "math_word_problems",
                "source": "huggingface",
                "dataset_id": "microsoft/orca-math-word-problems-200k",
                "description": "Mathematical word problems dataset",
                "subject": "mathematics",
                "type": "text",
                "priority": 1
            },
            {
                "name": "science_qa",
                "source": "huggingface",
                "dataset_id": "derek-thomas/ScienceQA",
                "description": "Science Question Answering dataset",
                "subject": "science",
                "type": "multimodal",
                "priority": 1
            },
            {
                "name": "student_performance",
                "source": "kaggle",
                "dataset_id": "spscientist/students-performance-in-exams",
                "description": "Student performance in exams dataset",
                "subject": "general",
                "type": "tabular",
                "priority": 2
            },
            {
                "name": "handwriting_recognition",
                "source": "kaggle",
                "dataset_id": "landlord/handwriting-recognition",
                "description": "Handwriting recognition dataset",
                "subject": "general",
                "type": "image",
                "priority": 1
            },
            {
                "name": "educational_text_classification",
                "source": "huggingface",
                "dataset_id": "education_text_classification",
                "description": "Educational text classification dataset",
                "subject": "general",
                "type": "text",
                "priority": 2
            }
        ]
        
        for dataset_info in essential_datasets:
            if dataset_info["name"] not in self.datasets_registry:
                await self.download_queue.put(dataset_info)
    
    async def _download_worker(self):
        """Background worker for downloading datasets"""
        while self.is_running:
            try:
                dataset_info = await self.download_queue.get()
                await self._download_dataset(dataset_info)
                self.download_queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Download worker error: {e}")
                await asyncio.sleep(60)
    
    async def _processing_worker(self):
        """Background worker for processing datasets"""
        while self.is_running:
            try:
                dataset_info = await self.processing_queue.get()
                await self._process_dataset(dataset_info)
                self.processing_queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Processing worker error: {e}")
                await asyncio.sleep(60)
    
    async def _quality_check_worker(self):
        """Background worker for data quality checks"""
        while self.is_running:
            try:
                await self._perform_quality_checks()
                await asyncio.sleep(3600)  # Run every hour
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Quality check worker error: {e}")
                await asyncio.sleep(300)
    
    async def _download_dataset(self, dataset_info: Dict[str, Any]):
        """Download a single dataset"""
        try:
            dataset_name = dataset_info["name"]
            source = dataset_info["source"]
            
            logger.info(f"Downloading dataset: {dataset_name} from {source}")
            
            if source == "kaggle":
                await self._download_from_kaggle(dataset_info)
            elif source == "huggingface":
                await self._download_from_huggingface(dataset_info)
            elif source == "openml":
                await self._download_from_openml(dataset_info)
            elif source == "url":
                await self._download_from_url(dataset_info)
            else:
                logger.warning(f"Unknown dataset source: {source}")
                return
            
            # Update registry
            self.datasets_registry[dataset_name] = {
                **dataset_info,
                "downloaded_at": datetime.utcnow().isoformat(),
                "status": "downloaded",
                "file_path": str(self.base_path / "raw" / dataset_name)
            }
            
            self._save_datasets_registry()
            
            # Queue for processing
            await self.processing_queue.put(dataset_info)
            
            logger.info(f"Successfully downloaded dataset: {dataset_name}")
            
        except Exception as e:
            logger.error(f"Failed to download dataset {dataset_info['name']}: {e}")
    
    async def _download_from_kaggle(self, dataset_info: Dict[str, Any]):
        """Download dataset from Kaggle"""
        try:
            from kaggle.api.kaggle_api_extended import KaggleApi
            
            api = KaggleApi()
            api.authenticate()
            
            dataset_path = self.base_path / "raw" / dataset_info["name"]
            dataset_path.mkdir(exist_ok=True)
            
            if dataset_info["dataset_id"].startswith("c/"):
                # Competition dataset
                competition_name = dataset_info["dataset_id"][2:]
                api.competition_download_files(competition_name, path=str(dataset_path))
            else:
                # Regular dataset
                api.dataset_download_files(
                    dataset_info["dataset_id"], 
                    path=str(dataset_path), 
                    unzip=True
                )
            
        except Exception as e:
            logger.error(f"Kaggle download error: {e}")
            raise
    
    async def _download_from_huggingface(self, dataset_info: Dict[str, Any]):
        """Download dataset from Hugging Face"""
        try:
            from datasets import load_dataset
            
            dataset = load_dataset(dataset_info["dataset_id"])
            
            # Save dataset
            dataset_path = self.base_path / "raw" / dataset_info["name"]
            dataset_path.mkdir(exist_ok=True)
            
            dataset.save_to_disk(str(dataset_path))
            
        except Exception as e:
            logger.error(f"Hugging Face download error: {e}")
            raise
    
    async def _download_from_openml(self, dataset_info: Dict[str, Any]):
        """Download dataset from OpenML"""
        try:
            import openml
            
            dataset_id = int(dataset_info["dataset_id"])
            dataset = openml.datasets.get_dataset(dataset_id)
            
            X, y, categorical_indicator, attribute_names = dataset.get_data(
                dataset_format="dataframe", target=dataset.default_target_attribute
            )
            
            # Save as CSV
            dataset_path = self.base_path / "raw" / dataset_info["name"]
            dataset_path.mkdir(exist_ok=True)
            
            df = pd.concat([X, y], axis=1)
            df.to_csv(dataset_path / "data.csv", index=False)
            
            # Save metadata
            metadata = {
                "name": dataset.name,
                "description": dataset.description,
                "attributes": attribute_names,
                "target": dataset.default_target_attribute,
                "instances": dataset.qualities["NumberOfInstances"],
                "features": dataset.qualities["NumberOfFeatures"]
            }
            
            with open(dataset_path / "metadata.json", 'w') as f:
                json.dump(metadata, f, indent=2)
            
        except Exception as e:
            logger.error(f"OpenML download error: {e}")
            raise
    
    async def _download_from_url(self, dataset_info: Dict[str, Any]):
        """Download dataset from URL"""
        try:
            url = dataset_info["url"]
            dataset_path = self.base_path / "raw" / dataset_info["name"]
            dataset_path.mkdir(exist_ok=True)
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        filename = url.split("/")[-1]
                        file_path = dataset_path / filename
                        
                        async with aiofiles.open(file_path, 'wb') as f:
                            async for chunk in response.content.iter_chunked(8192):
                                await f.write(chunk)
                        
                        # Extract if compressed
                        if filename.endswith('.zip'):
                            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                                zip_ref.extractall(dataset_path)
                        elif filename.endswith('.tar.gz'):
                            with tarfile.open(file_path, 'r:gz') as tar_ref:
                                tar_ref.extractall(dataset_path)
                    else:
                        raise Exception(f"HTTP {response.status}")
            
        except Exception as e:
            logger.error(f"URL download error: {e}")
            raise
    
    async def _process_dataset(self, dataset_info: Dict[str, Any]):
        """Process downloaded dataset"""
        try:
            dataset_name = dataset_info["name"]
            logger.info(f"Processing dataset: {dataset_name}")
            
            raw_path = self.base_path / "raw" / dataset_name
            processed_path = self.base_path / "processed" / dataset_name
            processed_path.mkdir(exist_ok=True)
            
            # Load and process based on type
            if dataset_info["type"] == "text":
                await self._process_text_dataset(raw_path, processed_path, dataset_info)
            elif dataset_info["type"] == "image":
                await self._process_image_dataset(raw_path, processed_path, dataset_info)
            elif dataset_info["type"] == "tabular":
                await self._process_tabular_dataset(raw_path, processed_path, dataset_info)
            elif dataset_info["type"] == "multimodal":
                await self._process_multimodal_dataset(raw_path, processed_path, dataset_info)
            
            # Create train/validation/test splits
            await self._create_dataset_splits(processed_path, dataset_info)
            
            # Generate statistics
            await self._generate_dataset_statistics(processed_path, dataset_info)
            
            # Update registry
            self.datasets_registry[dataset_name]["status"] = "processed"
            self.datasets_registry[dataset_name]["processed_at"] = datetime.utcnow().isoformat()
            self.datasets_registry[dataset_name]["processed_path"] = str(processed_path)
            
            self._save_datasets_registry()
            
            logger.info(f"Successfully processed dataset: {dataset_name}")
            
        except Exception as e:
            logger.error(f"Failed to process dataset {dataset_info['name']}: {e}")
    
    async def _process_text_dataset(self, raw_path: Path, processed_path: Path, dataset_info: Dict[str, Any]):
        """Process text-based dataset"""
        try:
            # Find text files
            text_files = list(raw_path.glob("*.csv")) + list(raw_path.glob("*.json")) + list(raw_path.glob("*.txt"))
            
            if not text_files:
                # Try to load from Hugging Face format
                try:
                    from datasets import load_from_disk
                    dataset = load_from_disk(str(raw_path))
                    
                    # Convert to pandas DataFrame
                    if isinstance(dataset, datasets.DatasetDict):
                        # Combine all splits
                        dfs = []
                        for split_name, split_data in dataset.items():
                            df = split_data.to_pandas()
                            df['split'] = split_name
                            dfs.append(df)
                        combined_df = pd.concat(dfs, ignore_index=True)
                    else:
                        combined_df = dataset.to_pandas()
                    
                    # Save as CSV
                    combined_df.to_csv(processed_path / "data.csv", index=False)
                    
                except Exception as e:
                    logger.warning(f"Could not load Hugging Face dataset: {e}")
                    return
            else:
                # Process CSV/JSON files
                dfs = []
                for file_path in text_files:
                    if file_path.suffix == '.csv':
                        df = pd.read_csv(file_path)
                    elif file_path.suffix == '.json':
                        df = pd.read_json(file_path)
                    else:
                        continue
                    
                    dfs.append(df)
                
                if dfs:
                    combined_df = pd.concat(dfs, ignore_index=True)
                    
                    # Text preprocessing
                    text_columns = [col for col in combined_df.columns if 'text' in col.lower() or 'answer' in col.lower() or 'question' in col.lower()]
                    
                    for col in text_columns:
                        if col in combined_df.columns:
                            combined_df[col] = combined_df[col].astype(str)
                            combined_df[col] = combined_df[col].str.strip()
                            combined_df[col] = combined_df[col].str.replace(r'\s+', ' ', regex=True)
                    
                    # Remove duplicates
                    combined_df = combined_df.drop_duplicates()
                    
                    # Save processed data
                    combined_df.to_csv(processed_path / "data.csv", index=False)
                    
                    # Generate embeddings for text columns
                    await self._generate_text_embeddings(combined_df, text_columns, processed_path)
        
        except Exception as e:
            logger.error(f"Text dataset processing error: {e}")
            raise
    
    async def _process_image_dataset(self, raw_path: Path, processed_path: Path, dataset_info: Dict[str, Any]):
        """Process image-based dataset"""
        try:
            import cv2
            from PIL import Image
            
            # Find image files
            image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
            image_files = []
            
            for ext in image_extensions:
                image_files.extend(raw_path.glob(f"**/*{ext}"))
            
            if not image_files:
                logger.warning(f"No image files found in {raw_path}")
                return
            
            # Process images
            processed_images = []
            
            for img_path in image_files:
                try:
                    # Load image
                    image = cv2.imread(str(img_path))
                    if image is None:
                        continue
                    
                    # Basic preprocessing
                    # Resize to standard size
                    image = cv2.resize(image, (224, 224))
                    
                    # Normalize
                    image = image.astype(np.float32) / 255.0
                    
                    # Save processed image
                    processed_img_path = processed_path / f"processed_{img_path.name}"
                    cv2.imwrite(str(processed_img_path), (image * 255).astype(np.uint8))
                    
                    processed_images.append({
                        'original_path': str(img_path),
                        'processed_path': str(processed_img_path),
                        'filename': img_path.name
                    })
                    
                except Exception as e:
                    logger.warning(f"Failed to process image {img_path}: {e}")
            
            # Save image metadata
            metadata_df = pd.DataFrame(processed_images)
            metadata_df.to_csv(processed_path / "image_metadata.csv", index=False)
            
        except Exception as e:
            logger.error(f"Image dataset processing error: {e}")
            raise
    
    async def _process_tabular_dataset(self, raw_path: Path, processed_path: Path, dataset_info: Dict[str, Any]):
        """Process tabular dataset"""
        try:
            # Find CSV files
            csv_files = list(raw_path.glob("*.csv"))
            
            if not csv_files:
                logger.warning(f"No CSV files found in {raw_path}")
                return
            
            # Process CSV files
            dfs = []
            for csv_file in csv_files:
                df = pd.read_csv(csv_file)
                dfs.append(df)
            
            combined_df = pd.concat(dfs, ignore_index=True)
            
            # Data cleaning
            # Handle missing values
            numeric_columns = combined_df.select_dtypes(include=[np.number]).columns
            categorical_columns = combined_df.select_dtypes(include=['object']).columns
            
            # Fill numeric missing values with median
            for col in numeric_columns:
                combined_df[col].fillna(combined_df[col].median(), inplace=True)
            
            # Fill categorical missing values with mode
            for col in categorical_columns:
                combined_df[col].fillna(combined_df[col].mode()[0] if not combined_df[col].mode().empty else 'Unknown', inplace=True)
            
            # Remove duplicates
            combined_df = combined_df.drop_duplicates()
            
            # Encode categorical variables
            label_encoders = {}
            for col in categorical_columns:
                le = LabelEncoder()
                combined_df[f"{col}_encoded"] = le.fit_transform(combined_df[col])
                label_encoders[col] = le
            
            # Save processed data
            combined_df.to_csv(processed_path / "data.csv", index=False)
            
            # Save encoders
            with open(processed_path / "label_encoders.pkl", 'wb') as f:
                pickle.dump(label_encoders, f)
            
        except Exception as e:
            logger.error(f"Tabular dataset processing error: {e}")
            raise
    
    async def _process_multimodal_dataset(self, raw_path: Path, processed_path: Path, dataset_info: Dict[str, Any]):
        """Process multimodal dataset"""
        try:
            # Process both text and image components
            await self._process_text_dataset(raw_path, processed_path / "text", dataset_info)
            await self._process_image_dataset(raw_path, processed_path / "images", dataset_info)
            
            # Create multimodal mappings
            text_data = pd.read_csv(processed_path / "text" / "data.csv")
            image_metadata = pd.read_csv(processed_path / "images" / "image_metadata.csv")
            
            # Create combined dataset
            multimodal_data = []
            for idx, row in text_data.iterrows():
                # Find corresponding images (if any)
                corresponding_images = image_metadata[
                    image_metadata['filename'].str.contains(str(idx), na=False)
                ]
                
                multimodal_entry = {
                    'text_id': idx,
                    'text_content': row.get('text', ''),
                    'images': corresponding_images['processed_path'].tolist() if not corresponding_images.empty else []
                }
                multimodal_data.append(multimodal_entry)
            
            # Save multimodal mappings
            multimodal_df = pd.DataFrame(multimodal_data)
            multimodal_df.to_csv(processed_path / "multimodal_data.csv", index=False)
            
        except Exception as e:
            logger.error(f"Multimodal dataset processing error: {e}")
            raise
    
    async def _generate_text_embeddings(self, df: pd.DataFrame, text_columns: List[str], processed_path: Path):
        """Generate embeddings for text columns"""
        try:
            from sentence_transformers import SentenceTransformer
            
            # Load embedding model
            model = SentenceTransformer('all-MiniLM-L6-v2')
            
            embeddings_data = {}
            
            for col in text_columns:
                if col in df.columns:
                    texts = df[col].fillna('').astype(str).tolist()
                    embeddings = model.encode(texts)
                    embeddings_data[col] = embeddings
            
            # Save embeddings
            embeddings_path = processed_path / "embeddings"
            embeddings_path.mkdir(exist_ok=True)
            
            for col, embeddings in embeddings_data.items():
                np.save(embeddings_path / f"{col}_embeddings.npy", embeddings)
            
        except Exception as e:
            logger.warning(f"Failed to generate embeddings: {e}")
    
    async def _create_dataset_splits(self, processed_path: Path, dataset_info: Dict[str, Any]):
        """Create train/validation/test splits"""
        try:
            data_file = processed_path / "data.csv"
            if not data_file.exists():
                return
            
            df = pd.read_csv(data_file)
            
            # Create splits
            train_df, temp_df = train_test_split(df, test_size=0.3, random_state=42)
            val_df, test_df = train_test_split(temp_df, test_size=0.5, random_state=42)
            
            # Save splits
            splits_path = self.base_path / "splits" / dataset_info["name"]
            splits_path.mkdir(parents=True, exist_ok=True)
            
            train_df.to_csv(splits_path / "train.csv", index=False)
            val_df.to_csv(splits_path / "val.csv", index=False)
            test_df.to_csv(splits_path / "test.csv", index=False)
            
            # Save split info
            split_info = {
                "train_samples": len(train_df),
                "val_samples": len(val_df),
                "test_samples": len(test_df),
                "total_samples": len(df),
                "created_at": datetime.utcnow().isoformat()
            }
            
            with open(splits_path / "split_info.json", 'w') as f:
                json.dump(split_info, f, indent=2)
            
        except Exception as e:
            logger.error(f"Dataset splitting error: {e}")
            raise
    
    async def _generate_dataset_statistics(self, processed_path: Path, dataset_info: Dict[str, Any]):
        """Generate comprehensive dataset statistics"""
        try:
            data_file = processed_path / "data.csv"
            if not data_file.exists():
                return
            
            df = pd.read_csv(data_file)
            
            # Basic statistics
            stats = {
                "dataset_name": dataset_info["name"],
                "total_samples": len(df),
                "total_features": len(df.columns),
                "missing_values": df.isnull().sum().to_dict(),
                "data_types": df.dtypes.astype(str).to_dict(),
                "memory_usage": df.memory_usage(deep=True).sum(),
                "generated_at": datetime.utcnow().isoformat()
            }
            
            # Numeric statistics
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                stats["numeric_statistics"] = df[numeric_cols].describe().to_dict()
            
            # Categorical statistics
            categorical_cols = df.select_dtypes(include=['object']).columns
            if len(categorical_cols) > 0:
                stats["categorical_statistics"] = {}
                for col in categorical_cols:
                    stats["categorical_statistics"][col] = {
                        "unique_values": df[col].nunique(),
                        "most_frequent": df[col].mode().iloc[0] if not df[col].mode().empty else None,
                        "value_counts": df[col].value_counts().head(10).to_dict()
                    }
            
            # Save statistics
            stats_path = self.base_path / "statistics" / f"{dataset_info['name']}_stats.json"
            with open(stats_path, 'w') as f:
                json.dump(stats, f, indent=2, default=str)
            
        except Exception as e:
            logger.error(f"Statistics generation error: {e}")
    
    async def _perform_quality_checks(self):
        """Perform data quality checks on all datasets"""
        try:
            for dataset_name, dataset_info in self.datasets_registry.items():
                if dataset_info.get("status") == "processed":
                    await self._check_dataset_quality(dataset_name, dataset_info)
        except Exception as e:
            logger.error(f"Quality checks error: {e}")
    
    async def _check_dataset_quality(self, dataset_name: str, dataset_info: Dict[str, Any]):
        """Check quality of a specific dataset"""
        try:
            processed_path = Path(dataset_info.get("processed_path", ""))
            data_file = processed_path / "data.csv"
            
            if not data_file.exists():
                return
            
            df = pd.read_csv(data_file)
            
            quality_report = {
                "dataset_name": dataset_name,
                "check_timestamp": datetime.utcnow().isoformat(),
                "total_samples": len(df),
                "duplicate_rows": df.duplicated().sum(),
                "missing_data_percentage": (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100,
                "data_consistency": {},
                "outliers": {},
                "recommendations": []
            }
            
            # Check for outliers in numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                outliers = df[(df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))]
                quality_report["outliers"][col] = len(outliers)
            
            # Generate recommendations
            if quality_report["duplicate_rows"] > 0:
                quality_report["recommendations"].append("Remove duplicate rows")
            
            if quality_report["missing_data_percentage"] > 10:
                quality_report["recommendations"].append("Address missing data issues")
            
            # Save quality report
            quality_path = self.base_path / "quality_checks" / f"{dataset_name}_quality.json"
            with open(quality_path, 'w') as f:
                json.dump(quality_report, f, indent=2, default=str)
            
        except Exception as e:
            logger.error(f"Quality check error for {dataset_name}: {e}")
    
    async def sync_datasets(self):
        """Synchronize datasets with remote sources"""
        try:
            logger.info("Starting dataset synchronization...")
            
            # Check for updates to existing datasets
            for dataset_name, dataset_info in self.datasets_registry.items():
                if dataset_info.get("source") in ["kaggle", "huggingface"]:
                    await self._check_dataset_updates(dataset_name, dataset_info)
            
            # Download new datasets from curated list
            await self._download_new_datasets()
            
            logger.info("Dataset synchronization completed")
            
        except Exception as e:
            logger.error(f"Dataset synchronization error: {e}")
    
    async def _check_dataset_updates(self, dataset_name: str, dataset_info: Dict[str, Any]):
        """Check if dataset has updates"""
        try:
            # This would implement version checking logic
            # For now, we'll skip if dataset was updated recently
            last_updated = datetime.fromisoformat(dataset_info.get("downloaded_at", "2020-01-01T00:00:00"))
            if (datetime.utcnow() - last_updated).days < 30:
                return
            
            # Re-download if older than 30 days
            await self.download_queue.put(dataset_info)
            
        except Exception as e:
            logger.error(f"Update check error for {dataset_name}: {e}")
    
    async def _download_new_datasets(self):
        """Download new datasets from curated sources"""
        try:
            # Educational dataset sources
            new_datasets = [
                {
                    "name": "common_core_math",
                    "source": "url",
                    "url": "https://example.com/common_core_math.zip",
                    "description": "Common Core Mathematics problems",
                    "subject": "mathematics",
                    "type": "text",
                    "priority": 2
                },
                {
                    "name": "physics_problems",
                    "source": "url", 
                    "url": "https://example.com/physics_problems.zip",
                    "description": "Physics problem solving dataset",
                    "subject": "physics",
                    "type": "text",
                    "priority": 2
                }
            ]
            
            for dataset_info in new_datasets:
                if dataset_info["name"] not in self.datasets_registry:
                    await self.download_queue.put(dataset_info)
                    
        except Exception as e:
            logger.error(f"New dataset download error: {e}")
    
    async def get_available_datasets(self) -> Dict[str, Any]:
        """Get list of available datasets"""
        return {
            "datasets": self.datasets_registry,
            "total_datasets": len(self.datasets_registry),
            "by_subject": self._group_datasets_by_subject(),
            "by_status": self._group_datasets_by_status(),
            "storage_usage": await self._calculate_storage_usage()
        }
    
    def _group_datasets_by_subject(self) -> Dict[str, List[str]]:
        """Group datasets by subject"""
        by_subject = {}
        for name, info in self.datasets_registry.items():
            subject = info.get("subject", "general")
            if subject not in by_subject:
                by_subject[subject] = []
            by_subject[subject].append(name)
        return by_subject
    
    def _group_datasets_by_status(self) -> Dict[str, List[str]]:
        """Group datasets by status"""
        by_status = {}
        for name, info in self.datasets_registry.items():
            status = info.get("status", "unknown")
            if status not in by_status:
                by_status[status] = []
            by_status[status].append(name)
        return by_status
    
    async def _calculate_storage_usage(self) -> Dict[str, Any]:
        """Calculate storage usage"""
        try:
            total_size = 0
            for path in self.base_path.rglob("*"):
                if path.is_file():
                    total_size += path.stat().st_size
            
            return {
                "total_size_bytes": total_size,
                "total_size_gb": round(total_size / (1024**3), 2),
                "by_directory": {
                    "raw": self._get_directory_size(self.base_path / "raw"),
                    "processed": self._get_directory_size(self.base_path / "processed"),
                    "splits": self._get_directory_size(self.base_path / "splits"),
                    "embeddings": self._get_directory_size(self.base_path / "embeddings")
                }
            }
        except Exception as e:
            logger.error(f"Storage calculation error: {e}")
            return {"error": str(e)}
    
    def _get_directory_size(self, directory: Path) -> float:
        """Get size of directory in GB"""
        try:
            total_size = sum(f.stat().st_size for f in directory.rglob("*") if f.is_file())
            return round(total_size / (1024**3), 2)
        except:
            return 0.0
    
    async def download_datasets(self, dataset_names: List[str], user_id: str):
        """Download specific datasets"""
        try:
            for dataset_name in dataset_names:
                # Find dataset info or create new entry
                if dataset_name in self.datasets_registry:
                    dataset_info = self.datasets_registry[dataset_name]
                else:
                    # Create new dataset entry (would need more info in practice)
                    dataset_info = {
                        "name": dataset_name,
                        "source": "unknown",
                        "requested_by": user_id
                    }
                
                await self.download_queue.put(dataset_info)
            
            logger.info(f"Queued {len(dataset_names)} datasets for download")
            
        except Exception as e:
            logger.error(f"Dataset download queueing error: {e}")
            raise
    
    async def _process_existing_datasets(self):
        """Process any existing datasets that haven't been processed"""
        try:
            for dataset_name, dataset_info in self.datasets_registry.items():
                if dataset_info.get("status") == "downloaded" and "processed_at" not in dataset_info:
                    await self.processing_queue.put(dataset_info)
        except Exception as e:
            logger.error(f"Existing dataset processing error: {e}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        try:
            return {
                "status": "healthy" if self.is_running else "unhealthy",
                "datasets_count": len(self.datasets_registry),
                "download_queue_size": self.download_queue.qsize(),
                "processing_queue_size": self.processing_queue.qsize(),
                "storage_usage": await self._calculate_storage_usage(),
                "last_sync": datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
