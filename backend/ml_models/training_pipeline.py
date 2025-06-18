import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from transformers import AutoTokenizer, AutoModel, get_linear_schedule_with_warmup
import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import logging
from typing import Dict, Any, List, Optional
import os
import json
from pathlib import Path
import asyncio
from .dataset_manager import DatasetManager, AnswerDataset
import wandb
from tqdm import tqdm

logger = logging.getLogger(__name__)

class AnswerEvaluationModel(nn.Module):
    """Neural network model for answer evaluation"""
    
    def __init__(self, model_name: str = 'bert-base-uncased', num_subjects: int = 10):
        super().__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(0.3)
        
        # Score prediction head
        self.score_head = nn.Sequential(
            nn.Linear(self.bert.config.hidden_size, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 1)
        )
        
        # Subject classification head
        self.subject_head = nn.Sequential(
            nn.Linear(self.bert.config.hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_subjects)
        )
        
        # Quality classification head (5 levels)
        self.quality_head = nn.Sequential(
            nn.Linear(self.bert.config.hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 5)
        )
    
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        pooled_output = self.dropout(pooled_output)
        
        score = self.score_head(pooled_output)
        subject_logits = self.subject_head(pooled_output)
        quality_logits = self.quality_head(pooled_output)
        
        return {
            'score': score.squeeze(),
            'subject_logits': subject_logits,
            'quality_logits': quality_logits
        }

class TrainingPipeline:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model_dir = Path(config.get('model_dir', 'models'))
        self.model_dir.mkdir(exist_ok=True)
        
        # Initialize components
        self.dataset_manager = DatasetManager()
        self.tokenizer = None
        self.model = None
        
        # Training parameters
        self.batch_size = config.get('batch_size', 16)
        self.learning_rate = config.get('learning_rate', 2e-5)
        self.num_epochs = config.get('num_epochs', 5)
        self.max_length = config.get('max_length', 512)
        
        # Initialize wandb for experiment tracking
        if config.get('use_wandb', False):
            wandb.init(
                project="ai-answer-evaluator",
                config=config
            )
    
    async def setup(self):
        """Setup the training pipeline"""
        logger.info("Setting up training pipeline...")
        
        # Download datasets
        await self.dataset_manager.download_educational_datasets()
        
        # Initialize tokenizer
        model_name = self.config.get('model_name', 'bert-base-uncased')
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # Initialize model
        self.model = AnswerEvaluationModel(model_name)
        self.model.to(self.device)
        
        logger.info("Training pipeline setup complete")
    
    async def train_all_models(self):
        """Train models on all available datasets"""
        datasets = ['essay-scoring', 'math-answers', 'science-qa']
        
        for dataset_name in datasets:
            try:
                logger.info(f"Training model on {dataset_name} dataset")
                await self.train_model(dataset_name)
                
                # Save model checkpoint
                model_path = self.model_dir / f"model_{dataset_name}.pt"
                await self.save_model(model_path)
                
            except Exception as e:
                logger.error(f"Training failed for {dataset_name}: {e}")
    
    async def train_model(self, dataset_name: str):
        """Train model on specific dataset"""
        # Prepare data
        data = self.dataset_manager.prepare_training_data(dataset_name)
        
        train_dataset = AnswerDataset(data['train'], self.tokenizer, self.max_length)
        test_dataset = AnswerDataset(data['test'], self.tokenizer, self.max_length)
        
        train_loader = DataLoader(
            train_dataset, 
            batch_size=self.batch_size, 
            shuffle=True,
            num_workers=2
        )
        test_loader = DataLoader(
            test_dataset, 
            batch_size=self.batch_size, 
            shuffle=False,
            num_workers=2
        )
        
        # Setup optimizer and scheduler
        optimizer = optim.AdamW(self.model.parameters(), lr=self.learning_rate)
        total_steps = len(train_loader) * self.num_epochs
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=0,
            num_training_steps=total_steps
        )
        
        # Loss functions
        mse_loss = nn.MSELoss()
        ce_loss = nn.CrossEntropyLoss()
        
        # Training loop
        self.model.train()
        for epoch in range(self.num_epochs):
            total_loss = 0
            progress_bar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{self.num_epochs}")
            
            for batch in progress_bar:
                optimizer.zero_grad()
                
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                scores = batch['score'].to(self.device)
                
                outputs = self.model(input_ids, attention_mask)
                
                # Calculate losses
                score_loss = mse_loss(outputs['score'], scores)
                
                # Total loss (can add other losses here)
                loss = score_loss
                
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                optimizer.step()
                scheduler.step()
                
                total_loss += loss.item()
                progress_bar.set_postfix({'loss': loss.item()})
                
                # Log to wandb
                if hasattr(self, 'wandb') and wandb.run:
                    wandb.log({
                        'train_loss': loss.item(),
                        'score_loss': score_loss.item(),
                        'learning_rate': scheduler.get_last_lr()[0]
                    })
            
            avg_loss = total_loss / len(train_loader)
            logger.info(f"Epoch {epoch+1} - Average Loss: {avg_loss:.4f}")
            
            # Evaluate on test set
            test_metrics = await self.evaluate_model(test_loader)
            logger.info(f"Test Metrics: {test_metrics}")
            
            if hasattr(self, 'wandb') and wandb.run:
                wandb.log({
                    'epoch': epoch + 1,
                    'avg_train_loss': avg_loss,
                    **{f'test_{k}': v for k, v in test_metrics.items()}
                })
    
    async def evaluate_model(self, test_loader: DataLoader) -> Dict[str, float]:
        """Evaluate model performance"""
        self.model.eval()
        predictions = []
        actuals = []
        
        with torch.no_grad():
            for batch in test_loader:
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                scores = batch['score'].to(self.device)
                
                outputs = self.model(input_ids, attention_mask)
                
                predictions.extend(outputs['score'].cpu().numpy())
                actuals.extend(scores.cpu().numpy())
        
        # Calculate metrics
        mse = mean_squared_error(actuals, predictions)
        mae = mean_absolute_error(actuals, predictions)
        r2 = r2_score(actuals, predictions)
        
        self.model.train()
        
        return {
            'mse': mse,
            'mae': mae,
            'r2': r2,
            'rmse': np.sqrt(mse)
        }
    
    async def save_model(self, path: Path):
        """Save trained model"""
        torch.save({
            'model_state_dict': self.model.state_dict(),
            'tokenizer': self.tokenizer,
            'config': self.config
        }, path)
        logger.info(f"Model saved to {path}")
    
    async def load_model(self, path: Path):
        """Load trained model"""
        checkpoint = torch.load(path, map_location=self.device)
        
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.tokenizer = checkpoint['tokenizer']
        
        logger.info(f"Model loaded from {path}")
    
    async def fine_tune_on_custom_data(self, custom_data: pd.DataFrame):
        """Fine-tune model on custom institutional data"""
        logger.info("Fine-tuning model on custom data")
        
        # Split custom data
        train_data, test_data = train_test_split(custom_data, test_size=0.2, random_state=42)
        
        train_dataset = AnswerDataset(train_data, self.tokenizer, self.max_length)
        test_dataset = AnswerDataset(test_data, self.tokenizer, self.max_length)
        
        train_loader = DataLoader(train_dataset, batch_size=self.batch_size, shuffle=True)
        test_loader = DataLoader(test_dataset, batch_size=self.batch_size, shuffle=False)
        
        # Use lower learning rate for fine-tuning
        optimizer = optim.AdamW(self.model.parameters(), lr=self.learning_rate * 0.1)
        
        # Fine-tune for fewer epochs
        fine_tune_epochs = max(1, self.num_epochs // 2)
        
        for epoch in range(fine_tune_epochs):
            self.model.train()
            total_loss = 0
            
            for batch in train_loader:
                optimizer.zero_grad()
                
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                scores = batch['score'].to(self.device)
                
                outputs = self.model(input_ids, attention_mask)
                loss = nn.MSELoss()(outputs['score'], scores)
                
                loss.backward()
                optimizer.step()
                
                total_loss += loss.item()
            
            avg_loss = total_loss / len(train_loader)
            test_metrics = await self.evaluate_model(test_loader)
            
            logger.info(f"Fine-tune Epoch {epoch+1} - Loss: {avg_loss:.4f}, Test Metrics: {test_metrics}")
        
        logger.info("Fine-tuning completed")
    
    async def export_model_for_inference(self, model_path: Path, export_path: Path):
        """Export model for production inference"""
        # Load model
        await self.load_model(model_path)
        
        # Convert to TorchScript for faster inference
        self.model.eval()
        example_input = {
            'input_ids': torch.randint(0, 1000, (1, self.max_length)).to(self.device),
            'attention_mask': torch.ones(1, self.max_length).to(self.device)
        }
        
        traced_model = torch.jit.trace(self.model, (example_input['input_ids'], example_input['attention_mask']))
        traced_model.save(export_path)
        
        logger.info(f"Model exported for inference to {export_path}")
