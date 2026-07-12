"""Complete Database Layer for Answer Sheet Evaluator"""
import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path
import uuid

class Database:
    """Comprehensive database management system"""
    
    def __init__(self):
        self.data_dir = Path("backend/data")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.users_file = self.data_dir / "users.json"
        self.evaluations_file = self.data_dir / "evaluations.json"
        self.results_file = self.data_dir / "results.json"
        self.rubrics_file = self.data_dir / "rubrics.json"
        self.submissions_file = self.data_dir / "submissions.json"
        self.templates_file = self.data_dir / "templates.json"
        
        self._init_files()
    
    def _init_files(self):
        """Initialize all database files"""
        if not self.users_file.exists():
            self._save_json(self.users_file, {})
        if not self.evaluations_file.exists():
            self._save_json(self.evaluations_file, {})
        if not self.results_file.exists():
            self._save_json(self.results_file, {})
        if not self.rubrics_file.exists():
            self._save_json(self.rubrics_file, self._default_rubrics())
        if not self.submissions_file.exists():
            self._save_json(self.submissions_file, {})
        if not self.templates_file.exists():
            self._save_json(self.templates_file, self._default_templates())
    
    def _save_json(self, file_path, data):
        """Save data to JSON file"""
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _load_json(self, file_path):
        """Load data from JSON file"""
        if not file_path.exists():
            return {}
        with open(file_path, 'r') as f:
            return json.load(f)
    
    # ==================== USER MANAGEMENT ====================
    
    def create_user(self, username: str, email: str, password_hash: str, 
                   role: str, name: str, institution: str) -> Dict:
        """Create new user"""
        users = self._load_json(self.users_file)
        user_id = str(uuid.uuid4())
        
        user = {
            "id": user_id,
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "role": role,
            "name": name,
            "institution": institution,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "stats": {
                "evaluations_count": 0,
                "total_marks_awarded": 0,
                "average_score": 0,
                "last_evaluation": None
            }
        }
        
        users[user_id] = user
        self._save_json(self.users_file, users)
        return user
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        users = self._load_json(self.users_file)
        return users.get(user_id)
    
    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username"""
        users = self._load_json(self.users_file)
        for user in users.values():
            if user["username"] == username:
                return user
        return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        users = self._load_json(self.users_file)
        for user in users.values():
            if user["email"] == email:
                return user
        return None
    
    def get_all_users(self) -> List[Dict]:
        """Get all users"""
        users = self._load_json(self.users_file)
        return list(users.values())
    
    # ==================== EVALUATION MANAGEMENT ====================
    
    def create_evaluation(self, user_id: str, session_id: str, 
                        metadata: Dict) -> Dict:
        """Create evaluation record"""
        evaluations = self._load_json(self.evaluations_file)
        eval_id = str(uuid.uuid4())
        
        evaluation = {
            "id": eval_id,
            "user_id": user_id,
            "session_id": session_id,
            "student_name": metadata.get("studentName", "Unknown"),
            "subject": metadata.get("subject", "General"),
            "exam_type": metadata.get("examType", "Exam"),
            "file_name": metadata.get("fileName", ""),
            "file_size": metadata.get("fileSize", 0),
            "rubric": metadata.get("rubric", ""),
            "status": "uploaded",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "started_at": None,
            "completed_at": None,
            "result": None,
            "extracted_text": "",
            "error": None,
            "confidence_score": 0,
            "processing_time": 0
        }
        
        evaluations[eval_id] = evaluation
        self._save_json(self.evaluations_file, evaluations)
        return evaluation
    
    def get_evaluation(self, eval_id: str) -> Optional[Dict]:
        """Get evaluation by ID"""
        evaluations = self._load_json(self.evaluations_file)
        return evaluations.get(eval_id)
    
    def get_user_evaluations(self, user_id: str) -> List[Dict]:
        """Get all evaluations for user"""
        evaluations = self._load_json(self.evaluations_file)
        return [e for e in evaluations.values() if e["user_id"] == user_id]
    
    def update_evaluation(self, eval_id: str, updates: Dict) -> Dict:
        """Update evaluation"""
        evaluations = self._load_json(self.evaluations_file)
        if eval_id not in evaluations:
            raise ValueError(f"Evaluation {eval_id} not found")
        
        evaluation = evaluations[eval_id]
        evaluation.update(updates)
        evaluation["updated_at"] = datetime.utcnow().isoformat()
        
        evaluations[eval_id] = evaluation
        self._save_json(self.evaluations_file, evaluations)
        return evaluation
    
    def delete_evaluation(self, eval_id: str) -> bool:
        """Delete evaluation"""
        evaluations = self._load_json(self.evaluations_file)
        if eval_id in evaluations:
            del evaluations[eval_id]
            self._save_json(self.evaluations_file, evaluations)
            return True
        return False
    
    # ==================== RESULTS MANAGEMENT ====================
    
    def save_result(self, eval_id: str, result: Dict) -> Dict:
        """Save evaluation result"""
        results = self._load_json(self.results_file)
        result["saved_at"] = datetime.utcnow().isoformat()
        results[eval_id] = result
        self._save_json(self.results_file, results)
        
        # Update evaluation with result
        self.update_evaluation(eval_id, {
            "result": result,
            "status": "completed",
            "completed_at": datetime.utcnow().isoformat()
        })
        
        return result
    
    def get_result(self, eval_id: str) -> Optional[Dict]:
        """Get evaluation result"""
        results = self._load_json(self.results_file)
        return results.get(eval_id)
    
    # ==================== RUBRICS MANAGEMENT ====================
    
    def get_rubrics(self) -> Dict:
        """Get all rubrics"""
        return self._load_json(self.rubrics_file)
    
    def get_rubric(self, subject: str) -> Optional[Dict]:
        """Get rubric by subject"""
        rubrics = self.get_rubrics()
        return rubrics.get(subject)
    
    def add_custom_rubric(self, subject: str, rubric_data: Dict) -> Dict:
        """Add custom rubric"""
        rubrics = self.get_rubrics()
        rubric_data["created_at"] = datetime.utcnow().isoformat()
        rubrics[subject] = rubric_data
        self._save_json(self.rubrics_file, rubrics)
        return rubric_data
    
    # ==================== SUBMISSIONS MANAGEMENT ====================
    
    def create_submission(self, user_id: str, eval_id: str, 
                         file_path: str) -> Dict:
        """Create submission record"""
        submissions = self._load_json(self.submissions_file)
        submission_id = str(uuid.uuid4())
        
        submission = {
            "id": submission_id,
            "user_id": user_id,
            "eval_id": eval_id,
            "file_path": file_path,
            "file_size": os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            "submitted_at": datetime.utcnow().isoformat(),
            "status": "received"
        }
        
        submissions[submission_id] = submission
        self._save_json(self.submissions_file, submissions)
        return submission
    
    def get_user_submissions(self, user_id: str) -> List[Dict]:
        """Get all submissions from user"""
        submissions = self._load_json(self.submissions_file)
        return [s for s in submissions.values() if s["user_id"] == user_id]
    
    # ==================== STATISTICS ====================
    
    def get_user_stats(self, user_id: str) -> Dict:
        """Get user statistics"""
        user = self.get_user_by_id(user_id)
        evaluations = self.get_user_evaluations(user_id)
        
        completed = [e for e in evaluations if e["status"] == "completed"]
        processing = [e for e in evaluations if e["status"] == "processing"]
        failed = [e for e in evaluations if e["status"] == "failed"]
        
        avg_score = 0
        if completed:
            scores = []
            for e in completed:
                if e["result"] and "obtainedMarks" in e["result"]:
                    scores.append(e["result"]["obtainedMarks"])
            avg_score = sum(scores) / len(scores) if scores else 0
        
        return {
            "user_id": user_id,
            "total_evaluations": len(evaluations),
            "completed_evaluations": len(completed),
            "processing_evaluations": len(processing),
            "failed_evaluations": len(failed),
            "average_score": round(avg_score, 2),
            "subjects": list(set(e["subject"] for e in evaluations)),
            "last_evaluation": max((e["created_at"] for e in evaluations), default=None)
        }
    
    def get_global_stats(self) -> Dict:
        """Get global statistics"""
        users = self.get_all_users()
        evaluations = self._load_json(self.evaluations_file)
        
        total_evals = len(evaluations)
        completed = len([e for e in evaluations.values() if e["status"] == "completed"])
        processing = len([e for e in evaluations.values() if e["status"] == "processing"])
        
        return {
            "total_users": len(users),
            "total_evaluations": total_evals,
            "completed_evaluations": completed,
            "processing_evaluations": processing,
            "completion_rate": (completed / total_evals * 100) if total_evals > 0 else 0,
            "average_processing_time": sum(e.get("processing_time", 0) for e in evaluations.values()) / total_evals if total_evals > 0 else 0
        }
    
    @staticmethod
    def _default_rubrics() -> Dict:
        """Default rubrics for common subjects"""
        return {
            "Mathematics": {
                "criteria": [
                    {"name": "Problem Understanding", "weight": 0.2},
                    {"name": "Solution Approach", "weight": 0.3},
                    {"name": "Calculation Accuracy", "weight": 0.3},
                    {"name": "Final Answer", "weight": 0.2}
                ],
                "total_marks": 100
            },
            "English": {
                "criteria": [
                    {"name": "Grammar & Spelling", "weight": 0.2},
                    {"name": "Vocabulary", "weight": 0.2},
                    {"name": "Content Quality", "weight": 0.4},
                    {"name": "Organization", "weight": 0.2}
                ],
                "total_marks": 100
            },
            "Science": {
                "criteria": [
                    {"name": "Concept Understanding", "weight": 0.25},
                    {"name": "Experimental Knowledge", "weight": 0.25},
                    {"name": "Calculations", "weight": 0.25},
                    {"name": "Reasoning", "weight": 0.25}
                ],
                "total_marks": 100
            }
        }
    
    @staticmethod
    def _default_templates() -> Dict:
        """Default feedback templates"""
        return {
            "strengths": [
                "Clear understanding of {topic}",
                "Excellent problem-solving approach",
                "Well-structured answer",
                "Accurate calculations throughout"
            ],
            "improvements": [
                "Provide more detailed explanations",
                "Include supporting examples",
                "Review calculation steps",
                "Expand on your reasoning"
            ],
            "overall": [
                "Good effort with room for improvement",
                "Solid understanding demonstrated",
                "Excellent work overall",
                "Needs more practice on specific areas"
            ]
        }


# Initialize global database instance
db = Database()
