import pytest
import asyncio
import os
from pathlib import Path

# Test configuration
TEST_CONFIG = {
    'openai': {
        'api_key': os.getenv('OPENAI_API_KEY_TEST', 'test-key'),
        'model_name': 'gpt-3.5-turbo',
        'max_tokens': 500
    },
    'google': {
        'api_key': os.getenv('GOOGLE_AI_API_KEY_TEST', 'test-key'),
        'model_name': 'gemini-pro'
    },
    'claude': {
        'api_key': os.getenv('CLAUDE_API_KEY_TEST', 'test-key'),
        'model_name': 'claude-3-sonnet-20240229'
    },
    'local': {
        'model_dir': 'test_models'
    }
}

# Test data
SAMPLE_EVALUATION_REQUEST = {
    'text': 'Photosynthesis is the process by which plants make food using sunlight, water, and carbon dioxide.',
    'subject': 'Biology',
    'exam_type': 'Quiz',
    'question_context': 'Explain the process of photosynthesis',
    'max_score': 100
}

SAMPLE_IMAGE_BYTES = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'

@pytest.fixture
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def test_config():
    """Provide test configuration"""
    return TEST_CONFIG

@pytest.fixture
def sample_request():
    """Provide sample evaluation request"""
    return SAMPLE_EVALUATION_REQUEST

@pytest.fixture
def sample_image():
    """Provide sample image bytes"""
    return SAMPLE_IMAGE_BYTES
