"""
FastAPI backend for the English Communication App.

This backend server provides AI-powered English conversation practice
for Japanese learners using Google Gemini AI and Google Cloud TTS.

Key features:
- AI conversation responses using Gemini
- Text-to-speech synthesis for pronunciation practice
- Level-based learning (beginner, intermediate, advanced)
- Multiple practice types (conversation, grammar, vocabulary, pronunciation)
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
# The gemini-1.5-flash model provides fast, high-quality responses
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
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
    level: str = "beginner"  # Learning level: beginner, intermediate, advanced
    practice_type: str = (
        "conversation"  # Type: conversation, grammar, vocabulary, pronunciation
    )


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
async def get_welcome_message(
    level: str = "beginner", practice_type: str = "conversation"
):
    """Generate a personalized welcome message based on user settings."""

    try:
        if not model:
            return Response(
                reply="Hello! Welcome to English Communication App! Please set up your API key to get started."
            )

        welcome_prompt = create_welcome_prompt(level, practice_type)
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

    try:
        if not model:
            # Fallback response if Gemini API is not configured
            return Response(
                reply="API key not configured. Please set GEMINI_API_KEY environment variable."
            )

        # Create specialized prompts based on practice type and level
        prompt = create_conversation_prompt(
            req.text, req.level, req.practice_type
        )

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
    user_text: str, level: str, practice_type: str
) -> str:
    """
    Create specialized prompts for different types of English conversation practice.

    Args:
        user_text: The user's input message
        level: beginner, intermediate, or advanced
        practice_type: conversation, grammar, vocabulary, or pronunciation

    Returns:
        A formatted prompt string optimized for the specified practice type and level
    """

    # Base instructions for all practice types
    base_instructions = f"""
You are an expert English teacher and conversation partner specializing in helping Japanese learners.
Your student's English level is: {level.upper()}
Practice focus: {practice_type.upper()}

IMPORTANT GUIDELINES:
- Always be encouraging and supportive
- Use natural, conversational English
- Adapt your vocabulary and grammar complexity to the student's level
- Provide gentle corrections when needed
- Ask follow-up questions to keep the conversation flowing
- Use examples and explanations when helpful
"""

    # Level-specific adjustments
    level_adjustments = {
        "beginner": """
- Use simple vocabulary and sentence structures
- Speak more slowly and clearly
- Repeat important words or phrases
- Use basic grammar patterns
- Provide extra encouragement
""",
        "intermediate": """
- Use everyday vocabulary with some challenging words
- Mix simple and complex sentences
- Introduce idiomatic expressions occasionally
- Help with common grammar mistakes
- Encourage longer responses
""",
        "advanced": """
- Use sophisticated vocabulary and expressions
- Employ complex sentence structures
- Discuss abstract topics and nuanced ideas
- Focus on fluency and naturalness
- Challenge with advanced grammar and idioms
""",
    }

    # Practice type-specific instructions
    practice_instructions = {
        "conversation": f"""
CONVERSATION PRACTICE:
- Engage in natural, flowing dialogue
- Ask open-ended questions to encourage speaking
- Share relatable experiences or opinions
- Use appropriate conversational markers (Well, Actually, By the way, etc.)
- Keep the conversation interesting and relevant

{level_adjustments.get(level, level_adjustments["beginner"])}

Student's message: "{user_text}"

Respond naturally as a friendly conversation partner. Keep your response conversational and engaging.
""",
        "grammar": f"""
GRAMMAR PRACTICE:
- If there are grammar errors, gently correct them with explanations
- Provide the correct form and explain why it's correct
- Give 1-2 similar examples to reinforce the rule
- Praise what the student did correctly
- Suggest ways to practice this grammar point

{level_adjustments.get(level, level_adjustments["beginner"])}

Student's message: "{user_text}"

Focus on helping with grammar while maintaining a supportive, conversational tone.
""",
        "vocabulary": f"""
VOCABULARY PRACTICE:
- Introduce 2-3 new words related to the topic
- Explain meanings with simple definitions and examples
- Help with word usage and collocations
- Suggest synonyms or related expressions
- Encourage the student to use new vocabulary in context

{level_adjustments.get(level, level_adjustments["beginner"])}

Student's message: "{user_text}"

Help expand vocabulary while keeping the conversation natural and engaging.
""",
        "pronunciation": f"""
PRONUNCIATION PRACTICE:
- Focus on commonly mispronounced words by Japanese speakers
- Provide phonetic guidance when helpful
- Highlight rhythm and intonation patterns
- Suggest practice techniques for difficult sounds
- Be encouraging about pronunciation efforts

{level_adjustments.get(level, level_adjustments["beginner"])}

Student's message: "{user_text}"

Provide pronunciation guidance while maintaining conversational flow.
Note: You can use phonetic symbols like /θ/ for 'th' sound, /r/ vs /l/ distinction, etc.
""",
    }

    # Combine all instructions
    full_prompt = base_instructions + practice_instructions.get(
        practice_type, practice_instructions["conversation"]
    )

    return full_prompt


def create_welcome_prompt(level: str, practice_type: str) -> str:
    """
    Create a personalized welcome message based on user's level and practice type.

    Args:
        level: beginner, intermediate, or advanced
        practice_type: conversation, grammar, vocabulary, or pronunciation

    Returns:
        A welcoming prompt that encourages the user to start practicing
    """

    level_greetings = {
        "beginner": "I'm excited to help you start your English learning journey! Don't worry about making mistakes - that's how we learn.",
        "intermediate": "Great to see you continuing your English studies! You're doing wonderful, and I'm here to help you improve even more.",
        "advanced": "Welcome! I'm impressed by your dedication to mastering English. Let's work together to polish your skills to perfection.",
    }

    practice_introductions = {
        "conversation": "Let's have a natural conversation! I'll ask questions and share stories to help you practice speaking naturally.",
        "grammar": "I'll help you perfect your grammar by gently correcting mistakes and explaining the rules in simple terms.",
        "vocabulary": "We'll expand your vocabulary together! I'll introduce new words and help you use them in context.",
        "pronunciation": "Let's work on your pronunciation! I'll help you with tricky sounds and give you tips for speaking more clearly.",
    }

    base_welcome = f"""
You are a friendly English conversation partner welcoming a Japanese student.
The student is at {level.upper()} level and wants to practice {practice_type.upper()}.

Create a warm, encouraging welcome message that:
- Greets the student in a friendly way
- Acknowledges their level and practice focus
- Asks an engaging opening question to start the conversation
- Uses appropriate vocabulary for their level
- Shows enthusiasm and support

Make it feel like meeting a friendly teacher who genuinely cares about their progress.
Keep it conversational and encouraging, not formal or robotic.
"""

    return base_welcome
