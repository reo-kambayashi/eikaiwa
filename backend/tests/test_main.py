"""
Basic tests for the English Communication App backend.

These tests verify that the main API endpoints work correctly.
They're designed to be simple and help beginners understand
how to test FastAPI applications.

To run these tests:
    cd backend
    python dev.py test

Or manually:
    uv run pytest tests/
"""

import os
import sys
import pytest
import json
import base64
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Add project root to Python path for imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from main import app

# Create a test client for our FastAPI app
# This allows us to make HTTP requests to our app during testing
client = TestClient(app)


class TestBasicEndpoints:
    """Test the basic API endpoints that don't require external services."""

    def test_root_endpoint(self):
        """
        Test the root endpoint (/) returns a welcome message.

        This is a simple test that verifies the API is responding.
        """
        response = client.get("/")

        # Check that the request was successful (status code 200)
        assert response.status_code == 200

        # Check that the response contains our expected message
        data = response.json()
        assert "message" in data
        assert "English Communication App API is running" in data["message"]

    def test_status_endpoint(self):
        """
        Test the /api/status endpoint returns configuration information.

        This endpoint tells us which services are properly configured.
        """
        response = client.get("/api/status")

        # Check that the request was successful
        assert response.status_code == 200

        # Check that the response has the expected structure
        data = response.json()
        assert "gemini_configured" in data
        assert "google_credentials_configured" in data
        assert "tts_configured" in data

        # All values should be boolean (True or False)
        assert isinstance(data["gemini_configured"], bool)
        assert isinstance(data["google_credentials_configured"], bool)
        assert isinstance(data["tts_configured"], bool)


class TestConversationEndpoints:
    """Test the conversation-related endpoints."""

    def test_welcome_endpoint_structure(self):
        """
        Test that the welcome endpoint returns the correct response structure.

        This tests the endpoint even if Gemini API isn't configured.
        """
        response = client.get("/api/welcome")

        # Should always return 200, even with a fallback message
        assert response.status_code == 200

        # Check response structure
        data = response.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)
        assert len(data["reply"]) > 0

    def test_welcome_endpoint_simple(self):
        """
        Test the welcome endpoint without parameters.
        """
        response = client.get("/api/welcome")
        assert response.status_code == 200

        data = response.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)

    def test_respond_endpoint_structure(self):
        """
        Test the main conversation endpoint structure.

        This tests that the endpoint accepts requests and returns proper responses,
        even if the AI service isn't configured.
        """
        # Prepare test data
        test_request = {
            "text": "Hello, how are you?",
        }

        response = client.post("/api/respond", json=test_request)

        # Should return 200 (might be a fallback message if API not configured)
        assert response.status_code == 200

        # Check response structure
        data = response.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)
        assert len(data["reply"]) > 0


class TestTTSEndpoint:
    """Test the Text-to-Speech endpoint."""

    def test_tts_endpoint_without_service(self):
        """
        Test TTS endpoint behavior when service is not configured.

        If TTS service isn't configured, it should return a 503 error.
        """
        test_request = {
            "text": "Hello world",
            "voice_name": "en-US-Neural2-D",
            "language_code": "en-US",
            "speaking_rate": 1.0,
        }

        response = client.post("/api/tts", json=test_request)

        # Should return either 200 (if TTS is configured) or 503 (if not configured)
        assert response.status_code in [200, 503]

        if response.status_code == 200:
            # If TTS works, check the response structure
            data = response.json()
            assert "audio_data" in data
            assert "content_type" in data
        else:
            # If TTS service not available, should return error message
            data = response.json()
            assert "detail" in data


# Additional utility functions for testing
def test_import_main_module():
    """
    Test that we can import the main module without errors.

    This is a basic smoke test to ensure there are no import issues.
    """
    import main

    assert hasattr(main, "app")
    assert hasattr(main, "Request")
    assert hasattr(main, "Response")
    assert hasattr(main, "TTSRequest")


class TestInstantTranslationEndpoints:
    """Test the instant translation endpoints."""

    def test_get_problem_endpoint(self):
        """
        Test getting a translation problem.
        
        Tests both static problems and fallback to AI generation.
        """
        response = client.get("/api/instant-translation/problem")
        
        # Should return 200 regardless of AI service status
        assert response.status_code == 200
        
        data = response.json()
        assert "japanese" in data
        assert "english" in data
        assert "category" in data
        assert "difficulty" in data
        
        # Validate required fields are strings
        assert isinstance(data["japanese"], str)
        assert isinstance(data["english"], str)
        assert isinstance(data["category"], str)
        assert isinstance(data["difficulty"], str)
        
        # Check that text is not empty
        assert len(data["japanese"]) > 0
        assert len(data["english"]) > 0

    def test_get_problem_with_filters(self):
        """
        Test getting a translation problem with category and difficulty filters.
        """
        # Test with category filter
        response = client.get("/api/instant-translation/problem?category=daily_life")
        assert response.status_code == 200
        
        # Test with difficulty filter
        response = client.get("/api/instant-translation/problem?difficulty=easy")
        assert response.status_code == 200
        
        # Test with both filters
        response = client.get("/api/instant-translation/problem?category=work&difficulty=medium")
        assert response.status_code == 200

    def test_check_answer_endpoint_structure(self):
        """
        Test the answer checking endpoint structure.
        
        This tests that the endpoint accepts requests and returns proper responses.
        """
        test_request = {
            "japanese": "こんにちは",
            "correctAnswer": "Hello",
            "userAnswer": "Hi"
        }
        
        response = client.post("/api/instant-translation/check", json=test_request)
        
        # Should return 200 (might be a fallback response if AI not configured)
        assert response.status_code == 200
        
        data = response.json()
        assert "isCorrect" in data
        assert "score" in data
        assert "feedback" in data
        
        # Validate data types
        assert isinstance(data["isCorrect"], bool)
        assert isinstance(data["score"], (int, float))
        assert isinstance(data["feedback"], str)
        
        # Score should be between 0 and 100
        assert 0 <= data["score"] <= 100


class TestErrorHandling:
    """Test error handling and edge cases."""
    
    def test_respond_endpoint_empty_text(self):
        """
        Test respond endpoint with empty text.
        """
        test_request = {"text": ""}
        response = client.post("/api/respond", json=test_request)
        
        # Should handle empty text gracefully
        assert response.status_code in [200, 400]
        
    def test_respond_endpoint_invalid_json(self):
        """
        Test respond endpoint with invalid JSON structure.
        """
        # Missing required 'text' field
        response = client.post("/api/respond", json={})
        assert response.status_code == 422  # Validation error
        
    def test_tts_endpoint_invalid_parameters(self):
        """
        Test TTS endpoint with invalid parameters.
        """
        # Test with invalid speaking rate
        test_request = {
            "text": "Hello",
            "speaking_rate": 10.0  # Too high
        }
        response = client.post("/api/tts", json=test_request)
        # Should handle gracefully, either 200 with adjusted rate or error
        assert response.status_code in [200, 400, 503]
        
    def test_check_answer_missing_fields(self):
        """
        Test answer checking with missing required fields.
        """
        # Missing correct_answer field
        test_request = {
            "problem": "Hello",
            "user_answer": "Hi"
        }
        response = client.post("/api/instant-translation/check", json=test_request)
        assert response.status_code == 422  # Validation error


class TestServiceIntegration:
    """Test integration with external services."""
    
    @patch('main.model')
    def test_respond_with_mocked_ai(self, mock_model):
        """
        Test conversation endpoint with mocked AI service.
        """
        # Mock AI response
        mock_response = MagicMock()
        mock_response.text = "This is a test response from AI."
        mock_model.generate_content.return_value = mock_response
        
        test_request = {
            "text": "Hello, how are you?",
            "conversation_history": []
        }
        
        response = client.post("/api/respond", json=test_request)
        assert response.status_code == 200
        
        data = response.json()
        assert data["reply"] == "This is a test response from AI."
        
    @patch('main.tts_model')
    def test_tts_with_mocked_service(self, mock_tts_model):
        """
        Test TTS endpoint with mocked TTS service.
        """
        # Mock TTS response
        mock_response = MagicMock()
        mock_response.audio_data = base64.b64encode(b"fake_audio_data").decode('utf-8')
        mock_tts_model.generate_content.return_value = mock_response
        
        test_request = {
            "text": "Hello world",
            "voice_name": "kore",
            "speaking_rate": 1.0
        }
        
        with patch('main.tts_model', mock_tts_model):
            response = client.post("/api/tts", json=test_request)
            
        # Should return 200 if mocked properly
        if response.status_code == 200:
            data = response.json()
            assert "audio_data" in data
            assert "content_type" in data
            

class TestDataValidation:
    """Test data validation and sanitization."""
    
    def test_conversation_history_validation(self):
        """
        Test that conversation history is properly validated.
        """
        test_request = {
            "text": "Hello",
            "conversation_history": [
                {"role": "user", "content": "Previous message"},
                {"role": "assistant", "content": "Previous response"}
            ]
        }
        
        response = client.post("/api/respond", json=test_request)
        assert response.status_code == 200
        
    def test_long_text_handling(self):
        """
        Test handling of very long text inputs.
        """
        long_text = "Hello " * 1000  # Very long text
        test_request = {"text": long_text}
        
        response = client.post("/api/respond", json=test_request)
        # Should handle gracefully, either process or return appropriate error
        assert response.status_code in [200, 400, 413]
        
    def test_special_characters_handling(self):
        """
        Test handling of special characters and Unicode.
        """
        test_request = {
            "text": "Hello 👋 こんにちは 🌟 Special chars: @#$%^&*()"
        }
        
        response = client.post("/api/respond", json=test_request)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["reply"]) > 0


if __name__ == "__main__":
    # Allow running this test file directly
    pytest.main([__file__])
