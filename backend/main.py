"""
FastAPI backend for the English Communication App.

This backend server provides AI-powered English conversation practice
for Japanese learners using Google Gemini AI and Google Cloud TTS.

Key features:
- AI conversation responses using Gemini
- Text-to-speech synthesis for pronunciation practice
- Grammar checking and feedback
- Voice input and output customization
"""

import base64
import io
import os

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response as FastAPIResponse
from google.cloud import texttospeech
from pydantic import BaseModel

# Load environment variables from the `.env` file located at the project root.
# This allows developers to keep API keys outside of the source code for security.
# The load_dotenv() function automatically reads the .env file from the project root.
load_dotenv()

# API keys and credentials read from environment variables
# These are set in the .env file and loaded at runtime
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS", ""
)

# Configure Gemini AI model for conversation generation
# The gemini-2.5-flash model provides fast, high-quality responses
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")
else:
    model = None

# Configure Google Cloud Text-to-Speech client
# This handles the conversion of AI responses to natural-sounding speech
tts_client = None
try:
    # Only initialize TTS if credentials file exists and is accessible
    if GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(
        GOOGLE_APPLICATION_CREDENTIALS
    ):
        tts_client = texttospeech.TextToSpeechClient()
except Exception as e:
    # Print warning but don't crash - TTS is optional
    print(f"Warning: Could not initialize TTS client: {e}")
    tts_client = None

# Create FastAPI application instance
app = FastAPI()

# Add CORS middleware to allow frontend connections from React development server
# This is necessary for the frontend (localhost:3000) to communicate with backend (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
# Pydantic models define the structure of requests and responses
# These ensure type safety and automatic validation


class Request(BaseModel):
    """
    Request model for conversation API calls from the frontend.

    This defines what data the frontend must send when requesting
    an AI response for English conversation practice.
    """

    text: str  # The user's input text or speech transcription
    conversation_history: list = []  # Previous messages for context
    enable_grammar_check: bool = True  # Whether to enable grammar checking


class Response(BaseModel):
    """
    Response model returned by the API to the frontend.

    Contains the AI's response text that will be displayed
    and potentially converted to speech.
    """

    reply: str  # The AI's response text


class TTSRequest(BaseModel):
    """
    Request model for text-to-speech synthesis.

    Defines parameters for converting text to natural-sounding speech
    using Google Cloud TTS service.
    """

    text: str  # Text to convert to speech
    voice_name: str = "en-US-Neural2-D"  # Default: female English voice
    language_code: str = "en-US"  # Language and region code
    speaking_rate: float = 1.0  # Speech speed (0.25-4.0, 1.0 = normal)


# API Endpoints
# These endpoints handle communication between the frontend and backend


@app.get("/")
async def root():
    """
    Health check endpoint - confirms the API server is running.

    This is useful for monitoring and debugging server status.
    Returns a simple JSON message when the server is operational.
    """
    return {"message": "English Communication App API is running"}


@app.get("/health")
async def health_check():
    """
    Health check endpoint for Docker container monitoring.

    This endpoint is used by Docker's HEALTHCHECK instruction
    to verify that the application is running properly.

    Returns:
        dict: Simple status message indicating the service is healthy
    """
    return {"status": "healthy", "service": "eikaiwa-backend"}


@app.get("/api/status")
async def api_status():
    """
    Configuration status endpoint - checks if required services are available.

    Returns the status of:
    - Gemini AI API (for conversation generation)
    - Google Cloud credentials (for authentication)
    - TTS service (for speech synthesis)

    This helps users troubleshoot configuration issues.
    """
    return {
        "gemini_configured": bool(GEMINI_API_KEY and model),
        "google_credentials_configured": bool(GOOGLE_APPLICATION_CREDENTIALS),
        "tts_configured": bool(tts_client),
    }


@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using Google Cloud TTS."""

    try:
        if not tts_client:
            raise HTTPException(
                status_code=503, detail="TTS service not available"
            )

        # Create synthesis input
        synthesis_input = texttospeech.SynthesisInput(text=request.text)

        # Build voice selection parameters
        voice = texttospeech.VoiceSelectionParams(
            language_code=request.language_code, name=request.voice_name
        )

        # Select audio file type
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=request.speaking_rate,
        )

        # Perform text-to-speech request
        response = tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        # Encode audio content to base64
        audio_base64 = base64.b64encode(response.audio_content).decode("utf-8")

        return {"audio_data": audio_base64, "content_type": "audio/mpeg"}

    except Exception as e:
        print(f"TTS Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"TTS generation failed: {str(e)}"
        )


@app.get("/api/welcome", response_model=Response)
async def get_welcome_message():
    """Generate a personalized welcome message."""

    print("🔔 Welcome request received")

    try:
        if not model:
            return Response(
                reply="Hello! Welcome to English Communication App! Please set up your API key to get started."
            )

        welcome_prompt = create_welcome_prompt()
        response = model.generate_content(welcome_prompt)

        if response.text:
            return Response(reply=response.text)
        else:
            return Response(
                reply="Hello! Welcome to English Communication App! Let's start practicing English together!"
            )

    except Exception as e:
        print(f"Error generating welcome message: {str(e)}")
        return Response(
            reply="Hello! Welcome to English Communication App! I'm here to help you practice English. How are you today?"
        )


@app.post("/api/respond", response_model=Response)
async def respond(req: Request):
    """Generate a response using Gemini API for English conversation practice."""

    print(f"🔔 Response request received: text='{req.text[:50]}...'")

    try:
        if not model:
            # Fallback response if Gemini API is not configured
            return Response(
                reply="API key not configured. Please set GEMINI_API_KEY environment variable."
            )

        # Create conversation prompt
        prompt = create_conversation_prompt(req.text, req.conversation_history)

        # Generate response using Gemini
        response = model.generate_content(prompt)

        if response.text:
            return Response(reply=response.text)
        else:
            return Response(
                reply="Sorry, I couldn't generate a response. Please try again."
            )

    except Exception as e:
        # Log the error in production, but don't expose internal details
        print(f"Error generating response: {str(e)}")
        return Response(
            reply="Sorry, there was an error processing your request. Please try again."
        )


def create_conversation_prompt(
    user_text: str, conversation_history: list = None
) -> str:
    """
    Create prompts for English conversation practice.

    Args:
        user_text: The user's input message
        conversation_history: Previous messages for context

    Returns:
        A formatted prompt string optimized for conversation practice
    """

    # Format conversation history for context
    history_context = ""
    if conversation_history and len(conversation_history) > 0:
        history_context = "\n\nCONVERSATION HISTORY (for context):\n"
        # Show last 10 messages to avoid token limit issues
        recent_history = (
            conversation_history[-10:]
            if len(conversation_history) > 10
            else conversation_history
        )
        for msg in recent_history:
            sender = msg.get("sender", "Unknown")
            text = msg.get("text", "")
            history_context += f"{sender}: {text}\n"
        history_context += "\n"

    # Simplified conversation prompt
    prompt = f"""
You are an expert English teacher and conversation partner specializing in helping Japanese learners.

IMPORTANT GUIDELINES:
- Always be encouraging and supportive
- Use natural, conversational English
- Provide gentle corrections when needed
- Ask follow-up questions to keep the conversation flowing
- Use examples and explanations when helpful
- Reference previous parts of the conversation when relevant
- Keep responses concise and engaging (1-3 sentences)
- Focus on practical, everyday English
{history_context}

CURRENT MESSAGE FROM STUDENT:
"{user_text}"

Please respond naturally as a friendly English teacher and conversation partner.
"""

    return prompt


def create_welcome_prompt() -> str:
    """Create a welcome prompt for new users."""

    prompt = """
You are an expert English teacher and conversation partner specializing in helping Japanese learners.

Please create a warm, encouraging welcome message for a new student starting English conversation practice.

GUIDELINES:
- Keep it friendly and encouraging
- Mention that you're here to help with English conversation
- Invite them to start practicing by asking a question or sharing something about themselves
- Keep it concise (2-3 sentences)
- Use clear, natural English

Please respond with a welcoming message to get the conversation started.
"""

    return prompt
