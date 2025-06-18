import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock, AsyncMock
import json
import io
from main import app

client = TestClient(app)

class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_register_user(self):
        """Test user registration"""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword",
            "role": "student"
        }
        
        with patch('sqlite3.connect') as mock_connect:
            mock_cursor = Mock()
            mock_cursor.fetchone.return_value = None  # User doesn't exist
            mock_cursor.lastrowid = 1
            mock_connect.return_value.__enter__.return_value.cursor.return_value = mock_cursor
            
            response = client.post("/api/auth/register", json=user_data)
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["user"]["username"] == "testuser"
    
    def test_login_user(self):
        """Test user login"""
        login_data = {
            "username": "testuser",
            "password": "testpassword"
        }
        
        with patch('sqlite3.connect') as mock_connect:
            mock_cursor = Mock()
            # Mock user exists with hashed password
            mock_cursor.fetchone.return_value = (1, "testuser", "test@example.com", "$2b$12$hash", "student")
            mock_connect.return_value.__enter__.return_value.cursor.return_value = mock_cursor
            
            with patch('passlib.context.CryptContext.verify', return_value=True):
                response = client.post("/api/auth/login", json=login_data)
                assert response.status_code == 200
                data = response.json()
                assert "access_token" in data

class TestEvaluationEndpoints:
    """Test evaluation endpoints"""
    
    @pytest.fixture
    def auth_headers(self):
        """Create authentication headers"""
        with patch('jwt.decode', return_value={"sub": "testuser", "user_id": 1}):
            return {"Authorization": "Bearer test-token"}
    
    def test_upload_answer_sheet(self, auth_headers):
        """Test answer sheet upload"""
        # Create a test file
        test_file = io.BytesIO(b"test file content")
        test_file.name = "test.jpg"
        
        files = {"file": ("test.jpg", test_file, "image/jpeg")}
        data = {
            "student_name": "Test Student",
            "subject": "Mathematics",
            "exam_type": "Quiz"
        }
        
        with patch('sqlite3.connect') as mock_connect:
            mock_cursor = Mock()
            mock_cursor.fetchone.return_value = (1,)  # User ID
            mock_connect.return_value.__enter__.return_value.cursor.return_value = mock_cursor
            
            with patch('main.upload_to_s3', return_value="s3://bucket/file.jpg"):
                with patch('main.extract_text_from_image', return_value="Extracted text"):
                    response = client.post(
                        "/api/upload-answer-sheet",
                        files=files,
                        data=data,
                        headers=auth_headers
                    )
                    assert response.status_code == 200
                    result = response.json()
                    assert "evaluation_id" in result
                    assert result["extracted_text"] == "Extracted text"
    
    def test_evaluate_answer(self, auth_headers):
        """Test answer evaluation"""
        evaluation_data = {
            "evaluation_id": "test-id",
            "extracted_text": "Test answer text",
            "subject": "Mathematics",
            "exam_type": "Quiz"
        }
        
        mock_result = {
            "score": 85,
            "grade": "B+",
            "feedback": "Good work",
            "suggestions": "Keep practicing",
            "points_covered": ["basics"],
            "points_missed": ["advanced"],
            "confidence": 85.0
        }
        
        with patch('sqlite3.connect') as mock_connect:
            mock_cursor = Mock()
            mock_cursor.fetchone.return_value = ("Question text", "Model answer")
            mock_connect.return_value.__enter__.return_value.cursor.return_value = mock_cursor
            
            with patch('main.evaluate_with_ai', return_value=mock_result):
                response = client.post(
                    "/api/evaluate-answer",
                    json=evaluation_data,
                    headers=auth_headers
                )
                assert response.status_code == 200
                result = response.json()
                assert result["score"] == 85
                assert result["grade"] == "B+"

class TestDashboardEndpoints:
    """Test dashboard endpoints"""
    
    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        with patch('sqlite3.connect') as mock_connect:
            mock_cursor = Mock()
            # Mock database responses
            mock_cursor.fetchone.side_effect = [
                (100,),  # total evaluations
                (78.5,),  # average score
                (2.3,),   # average processing time
            ]
            mock_cursor.fetchall.side_effect = [
                [("Student 1", "Math", 85, "A", "2024-01-01")],  # recent evaluations
                [("Math", 85.0, 50), ("Science", 78.0, 30)]      # subject performance
            ]
            mock_connect.return_value.__enter__.return_value.cursor.return_value = mock_cursor
            
            with patch('jwt.decode', return_value={"sub": "testuser", "user_id": 1}):
                response = client.get(
                    "/api/dashboard-stats",
                    headers={"Authorization": "Bearer test-token"}
                )
                assert response.status_code == 200
                data = response.json()
                assert "stats" in data
                assert data["stats"]["totalEvaluations"] == 100

class TestHealthEndpoints:
    """Test health and monitoring endpoints"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data
    
    def test_metrics_endpoint(self):
        """Test Prometheus metrics endpoint"""
        response = client.get("/metrics")
        assert response.status_code == 200
        # Should return Prometheus format
        assert "# HELP" in response.text or "# TYPE" in response.text
