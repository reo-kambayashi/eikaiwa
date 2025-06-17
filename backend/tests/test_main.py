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

import pytest
from fastapi.testclient import TestClient
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


if __name__ == "__main__":
    # Allow running this test file directly
    pytest.main([__file__])
