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


class InstantTranslationCheckRequest(BaseModel):
    """
    Request model for instant translation answer checking.

    Defines the structure for checking user answers against correct translations
    in the instant translation mode.
    """

    japanese: str  # Original Japanese text
    correctAnswer: str  # Correct English translation
    userAnswer: str  # User's English translation attempt


class InstantTranslationProblem(BaseModel):
    """
    Response model for instant translation problems.

    Contains a Japanese sentence to be translated to English.
    """

    japanese: str  # Japanese sentence to translate
    english: str  # Correct English translation
    difficulty: str = "medium"  # Problem difficulty level
    category: str = "general"  # Grammar or topic category


class InstantTranslationCheckResponse(BaseModel):
    """
    Response model for instant translation answer checking.

    Contains evaluation results and feedback for the user's translation attempt.
    """

    isCorrect: bool  # Whether the answer is correct
    feedback: str  # Detailed feedback on the translation
    score: int  # Numerical score (0-100)
    suggestions: list = []  # Alternative translations or improvements


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

    if not tts_client:
        raise HTTPException(
            status_code=503, detail="TTS service not available"
        )

    try:

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

    except HTTPException:
        # Propagate HTTP errors such as 503 without modification
        raise
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


# ============================================================================
# 瞬間英作文モード用のAPI エンドポイント
# ============================================================================

# 瞬間英作文の問題パターン
TRANSLATION_PROBLEMS = [
    {
        "japanese": "今日は天気がいいですね。",
        "english": "It's nice weather today.",
        "difficulty": "easy",
        "category": "weather",
    },
    {
        "japanese": "昨日、友達と映画を見に行きました。",
        "english": "I went to see a movie with my friend yesterday.",
        "difficulty": "medium",
        "category": "daily_life",
    },
    {
        "japanese": "来週の金曜日に会議があります。",
        "english": "There will be a meeting next Friday.",
        "difficulty": "medium",
        "category": "business",
    },
    {
        "japanese": "もしも時間があれば、一緒に買い物に行きませんか？",
        "english": "If you have time, would you like to go shopping together?",
        "difficulty": "hard",
        "category": "invitation",
    },
    {
        "japanese": "彼女は毎朝7時に起きます。",
        "english": "She gets up at 7 o'clock every morning.",
        "difficulty": "easy",
        "category": "daily_routine",
    },
    {
        "japanese": "この本は私にとって難しすぎます。",
        "english": "This book is too difficult for me.",
        "difficulty": "medium",
        "category": "opinion",
    },
    {
        "japanese": "電車が遅れているので、少し遅れるかもしれません。",
        "english": "The train is delayed, so I might be a little late.",
        "difficulty": "hard",
        "category": "transportation",
    },
    {
        "japanese": "夏休みに家族と北海道に行く予定です。",
        "english": "I'm planning to go to Hokkaido with my family during summer vacation.",
        "difficulty": "medium",
        "category": "travel",
    },
    {
        "japanese": "日本語を勉強するのは楽しいです。",
        "english": "Studying Japanese is fun.",
        "difficulty": "easy",
        "category": "learning",
    },
    {
        "japanese": "もし雨が降ったら、家にいるつもりです。",
        "english": "If it rains, I intend to stay home.",
        "difficulty": "hard",
        "category": "conditional",
    },
]


@app.get(
    "/api/instant-translation/problem",
    response_model=InstantTranslationProblem,
)
async def get_instant_translation_problem():
    """
    瞬間英作文の問題を取得するAPIエンドポイント

    ランダムに問題を選択して返します。
    将来的にはAIで動的に問題を生成することも可能です。
    """

    print("🔔 Instant translation problem request received")

    try:
        import random

        # ランダムに問題を選択
        problem = random.choice(TRANSLATION_PROBLEMS)

        return InstantTranslationProblem(
            japanese=problem["japanese"],
            english=problem["english"],
            difficulty=problem["difficulty"],
            category=problem["category"],
        )

    except Exception as e:
        print(f"Error generating instant translation problem: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate instant translation problem",
        )


@app.post(
    "/api/instant-translation/check",
    response_model=InstantTranslationCheckResponse,
)
async def check_instant_translation_answer(
    req: InstantTranslationCheckRequest,
):
    """
    瞬間英作文の回答をチェックするAPIエンドポイント

    ユーザーの回答を正解と比較し、AIを使って詳細なフィードバックを提供します。
    """

    print(f"🔔 Instant translation check request: '{req.userAnswer[:30]}...'")

    try:
        if not model:
            # Gemini APIが利用できない場合のシンプルな比較
            is_correct = (
                req.userAnswer.lower().strip()
                == req.correctAnswer.lower().strip()
            )
            return InstantTranslationCheckResponse(
                isCorrect=is_correct,
                feedback=(
                    "Good try! Keep practicing."
                    if is_correct
                    else "Close, but not quite right. Try again!"
                ),
                score=100 if is_correct else 50,
                suggestions=[],
            )

        # AIを使って詳細な回答チェック
        check_prompt = create_translation_check_prompt(
            req.japanese, req.correctAnswer, req.userAnswer
        )

        response = model.generate_content(check_prompt)

        if response.text:
            # AI応答から情報を抽出
            ai_feedback = response.text

            # 簡単な正解判定（AIの応答に基づく）
            is_correct = any(
                word in ai_feedback.lower()
                for word in ["correct", "good", "excellent", "right"]
            )

            # スコア計算（簡単な実装）
            score = 100 if is_correct else 70

            return InstantTranslationCheckResponse(
                isCorrect=is_correct,
                feedback=ai_feedback,
                score=score,
                suggestions=[],
            )
        else:
            # フォールバック応答
            return InstantTranslationCheckResponse(
                isCorrect=False,
                feedback="Sorry, I couldn't evaluate your answer properly. Please try again.",
                score=50,
                suggestions=[],
            )

    except Exception as e:
        print(f"Error checking instant translation answer: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to check instant translation answer",
        )


def create_translation_check_prompt(
    japanese: str, correct_answer: str, user_answer: str
) -> str:
    """
    瞬間英作文の回答チェック用プロンプトを作成

    Args:
        japanese: 日本語の原文
        correct_answer: 正解の英語
        user_answer: ユーザーの回答

    Returns:
        AIが回答を評価するためのプロンプト
    """

    prompt = f"""
あなたは経験豊富な英語教師です。日本人学習者の瞬間英作文の回答を評価してください。

【問題】
日本語: "{japanese}"
正解: "{correct_answer}"
学習者の回答: "{user_answer}"

【評価基準】
- 意味が正確に伝わっているか
- 文法が正しいか
- 自然な英語表現か
- 語彙の選択が適切か

【返答形式】
以下の形式で評価してください：
- 「Excellent!」「Good!」「Not quite right」のいずれかで始める
- 具体的な改善点やアドバイスを含める
- 励ましの言葉を含める
- 2-3文で簡潔にまとめる

日本人学習者にとって理解しやすく、学習意欲を高めるような評価をお願いします。
"""

    return prompt
