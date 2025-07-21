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

import asyncio
import base64
import os
from concurrent.futures import ThreadPoolExecutor

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
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
    # Initialize Gemini TTS model
    tts_model = genai.GenerativeModel("gemini-2.5-flash-preview-tts")
else:
    model = None
    tts_model = None

# スレッドプールエグゼキューターを設定（AI処理を非同期化するため）
executor = ThreadPoolExecutor(max_workers=4)

# メモリキャッシュ（単一ユーザー用の高速化）
response_cache = {}
CACHE_TTL = 300  # 5分間のキャッシュ

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


class JapaneseConsultationRequest(BaseModel):
    """
    Request model for Japanese consultation and dictionary features.
    
    For asking questions about English expressions, grammar, or vocabulary
    with responses in Japanese.
    """
    
    text: str  # User's question in Japanese or English
    conversation_history: list = []  # Previous consultation messages


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
    using Gemini 2.5 Flash Preview TTS service.
    """

    text: str  # Text to convert to speech
    voice_name: str = (
        "Kore"  # Default: bright female English voice for Gemini TTS
    )
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


class CombinedResponse(BaseModel):
    """
    Combined response model for simultaneous text and audio generation.

    Contains both AI text response and TTS audio data for optimized performance.
    """

    reply: str  # The AI's text response
    audio_data: str = ""  # Base64 encoded audio data
    content_type: str = "text/plain"  # Audio MIME type
    use_browser_tts: bool = False  # Whether to fallback to browser TTS
    fallback_text: str = ""  # Text for browser TTS fallback
    processing_time: float = 0.0  # Total processing time in seconds


# API Endpoints
# These endpoints handle communication between the frontend and backend

# 必要なモジュールのインポートを追加
import time


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
        "google_credentials_configured": bool(
            GOOGLE_APPLICATION_CREDENTIALS
            and os.path.exists(GOOGLE_APPLICATION_CREDENTIALS)
        ),
        "gemini_tts_configured": bool(GEMINI_API_KEY and tts_model),
        "tts_configured": bool(tts_model),
    }


@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech using Gemini TTS."""

    if not tts_model:
        raise HTTPException(
            status_code=503, detail="TTS service not available"
        )

    try:
        # TTSキャッシュチェック
        import time

        tts_cache_key = f"tts_{hash(request.text)}_{request.voice_name}_{request.speaking_rate}"
        if tts_cache_key in response_cache:
            cached_data, timestamp = response_cache[tts_cache_key]
            if time.time() - timestamp < CACHE_TTL:
                print(f"✅ TTS Cache hit for: {request.text[:30]}...")
                return cached_data

        # Gemini 2.5 Flash Preview TTS with dictionary-based config
        content = request.text

        # Configure generation with dictionary format
        generation_config = {
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {
                    "prebuilt_voice_config": {"voice_name": request.voice_name}
                }
            },
        }

        # Generate audio using Gemini TTS model (非同期実行)
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            executor,
            lambda: tts_model.generate_content(
                contents=content, generation_config=generation_config
            ),
        )

        # Extract audio data from response
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                for part in candidate.content.parts:
                    if hasattr(part, "inline_data") and part.inline_data:
                        # Found audio data - extract properly
                        audio_data = part.inline_data.data
                        mime_type = part.inline_data.mime_type or "audio/wav"

                        print(
                            f"🎵 Audio data found: type={type(audio_data)}, mime_type={mime_type}"
                        )

                        # Handle different data types from Gemini
                        if isinstance(audio_data, bytes):
                            # If bytes, encode to base64
                            audio_base64 = base64.b64encode(audio_data).decode(
                                "utf-8"
                            )
                            print(
                                f"🔄 Encoded bytes to base64: {len(audio_data)} bytes -> {len(audio_base64)} chars"
                            )
                        elif isinstance(audio_data, str):
                            # If already string, assume it's base64
                            audio_base64 = audio_data
                            print(
                                f"🔄 Using string as base64: {len(audio_base64)} chars"
                            )
                        else:
                            print(
                                f"❌ Unexpected audio data type: {type(audio_data)}"
                            )
                            raise ValueError(
                                f"Unexpected audio data type: {type(audio_data)}"
                            )

                        # Validate base64 data
                        try:
                            # Test decode to verify it's valid base64
                            decoded_test = base64.b64decode(audio_base64)
                            print(
                                f"✅ Base64 validation successful: {len(decoded_test)} bytes decoded"
                            )
                        except Exception as b64_error:
                            print(f"❌ Base64 validation failed: {b64_error}")
                            raise ValueError(
                                f"Invalid base64 audio data: {b64_error}"
                            )

                        result = {
                            "audio_data": audio_base64,
                            "content_type": mime_type,
                            "original_size": (
                                len(audio_data)
                                if isinstance(audio_data, (bytes, str))
                                else 0
                            ),
                        }
                        # TTSレスポンスをキャッシュに保存
                        response_cache[tts_cache_key] = (result, time.time())
                        return result

        # If no audio data found, fallback to browser TTS
        print("No audio data found in Gemini TTS response")
        fallback_result = {
            "audio_data": "",
            "content_type": "text/plain",
            "fallback_text": request.text,
            "use_browser_tts": True,
        }
        # フォールバック結果もキャッシュ
        response_cache[tts_cache_key] = (fallback_result, time.time())
        return fallback_result

    except HTTPException:
        # Propagate HTTP errors such as 503 without modification
        raise
    except Exception as e:
        print(f"Gemini TTS Error: {str(e)}")
        # Fallback to browser TTS
        error_result = {
            "audio_data": "",
            "content_type": "text/plain",
            "fallback_text": request.text,
            "use_browser_tts": True,
            "error": str(e),
        }
        # エラー結果は短時間キャッシュ（30秒）
        response_cache[tts_cache_key] = (
            error_result,
            time.time() - CACHE_TTL + 30,
        )
        return error_result


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
        # AI生成を非同期実行
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            executor, lambda: model.generate_content(welcome_prompt)
        )

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

        # キャッシュチェック
        cache_key = (
            f"response_{hash(req.text)}_{hash(str(req.conversation_history))}"
        )
        import time

        if cache_key in response_cache:
            cached_data, timestamp = response_cache[cache_key]
            if time.time() - timestamp < CACHE_TTL:
                print(f"✅ Cache hit for response: {req.text[:30]}...")
                return Response(reply=cached_data)

        # Create conversation prompt
        prompt = create_conversation_prompt(req.text, req.conversation_history)

        # Generate response using Gemini (非同期実行)
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            executor, lambda: model.generate_content(prompt)
        )

        if response.text:
            # レスポンスをキャッシュに保存
            response_cache[cache_key] = (response.text, time.time())
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


@app.post("/api/japanese-consultation", response_model=Response)
async def japanese_consultation(req: JapaneseConsultationRequest):
    """Generate Japanese consultation response for English expression and grammar questions."""

    print(f"🔔 Japanese consultation request: text='{req.text[:50]}...'")

    try:
        if not model:
            # Fallback response if Gemini API is not configured
            return Response(
                reply="申し訳ありませんが、APIキーが設定されていません。GEMINI_API_KEYを設定してください。"
            )

        # キャッシュチェック
        cache_key = (
            f"consultation_{hash(req.text)}_{hash(str(req.conversation_history))}"
        )
        import time

        if cache_key in response_cache:
            cached_data, timestamp = response_cache[cache_key]
            if time.time() - timestamp < CACHE_TTL:
                print(f"✅ Cache hit for consultation: {req.text[:30]}...")
                return Response(reply=cached_data)

        # Create Japanese consultation prompt
        prompt = create_japanese_consultation_prompt(
            req.text, "general", req.conversation_history
        )

        # Generate response using Gemini (非同期実行)
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            executor, lambda: model.generate_content(prompt)
        )

        if response.text:
            # レスポンスをキャッシュに保存
            response_cache[cache_key] = (response.text, time.time())
            return Response(reply=response.text)
        else:
            return Response(
                reply="申し訳ありませんが、回答を生成できませんでした。もう一度お試しください。"
            )

    except Exception as e:
        # Log the error in production, but don't expose internal details
        print(f"Error generating Japanese consultation response: {str(e)}")
        return Response(
            reply="申し訳ありませんが、エラーが発生しました。もう一度お試しください。"
        )


@app.post("/api/respond-with-audio", response_model=CombinedResponse)
async def respond_with_audio(
    req: Request, voice_name: str = "Kore", speaking_rate: float = 1.0
):
    """
    Generate both text response and audio simultaneously for optimal performance.

    This endpoint combines conversation generation and TTS processing
    to reduce total response time for single-user scenarios.
    """

    print(
        f"🔔 Combined response request: text='{req.text[:50]}...', voice={voice_name}"
    )
    start_time = time.time()

    try:
        if not model:
            return CombinedResponse(
                reply="API key not configured. Please set GEMINI_API_KEY environment variable.",
                use_browser_tts=True,
                fallback_text="API key not configured. Please set GEMINI_API_KEY environment variable.",
            )

        # キャッシュチェック
        import time

        cache_key = (
            f"response_{hash(req.text)}_{hash(str(req.conversation_history))}"
        )

        # テキストレスポンスを生成
        prompt = create_conversation_prompt(req.text, req.conversation_history)
        loop = asyncio.get_event_loop()

        # AIレスポンス生成を非同期実行
        response_future = loop.run_in_executor(
            executor, lambda: model.generate_content(prompt)
        )

        # AIレスポンスを待つ
        ai_response = await response_future

        if not ai_response.text:
            return CombinedResponse(
                reply="Sorry, I couldn't generate a response. Please try again.",
                use_browser_tts=True,
                fallback_text="Sorry, I couldn't generate a response. Please try again.",
            )

        reply_text = ai_response.text

        # TTS生成を並列実行（AIレスポンス後）
        if tts_model:
            tts_cache_key = (
                f"tts_{hash(reply_text)}_{voice_name}_{speaking_rate}"
            )

            # TTSキャッシュチェック
            if tts_cache_key in response_cache:
                cached_tts, timestamp = response_cache[tts_cache_key]
                if time.time() - timestamp < CACHE_TTL:
                    print(f"✅ TTS Cache hit for combined response")
                    processing_time = time.time() - start_time
                    return CombinedResponse(
                        reply=reply_text,
                        audio_data=cached_tts.get("audio_data", ""),
                        content_type=cached_tts.get(
                            "content_type", "text/plain"
                        ),
                        use_browser_tts=cached_tts.get(
                            "use_browser_tts", False
                        ),
                        fallback_text=cached_tts.get(
                            "fallback_text", reply_text
                        ),
                        processing_time=processing_time,
                    )

            # TTS生成設定
            generation_config = {
                "response_modalities": ["AUDIO"],
                "speech_config": {
                    "voice_config": {
                        "prebuilt_voice_config": {"voice_name": voice_name}
                    }
                },
            }

            try:
                # TTS生成を非同期実行
                tts_response = await loop.run_in_executor(
                    executor,
                    lambda: tts_model.generate_content(
                        contents=reply_text,
                        generation_config=generation_config,
                    ),
                )

                # TTSオーディオデータを抽出
                audio_data = ""
                content_type = "text/plain"
                use_browser_tts = True

                if (
                    tts_response.candidates
                    and len(tts_response.candidates) > 0
                ):
                    candidate = tts_response.candidates[0]
                    if candidate.content and candidate.content.parts:
                        for part in candidate.content.parts:
                            if (
                                hasattr(part, "inline_data")
                                and part.inline_data
                            ):
                                raw_audio = part.inline_data.data
                                content_type = (
                                    part.inline_data.mime_type or "audio/wav"
                                )

                                if isinstance(raw_audio, bytes):
                                    audio_data = base64.b64encode(
                                        raw_audio
                                    ).decode("utf-8")
                                elif isinstance(raw_audio, str):
                                    audio_data = raw_audio

                                if audio_data:
                                    use_browser_tts = False
                                    break

                # TTS結果をキャッシュ
                tts_result = {
                    "audio_data": audio_data,
                    "content_type": content_type,
                    "use_browser_tts": use_browser_tts,
                    "fallback_text": reply_text if use_browser_tts else "",
                }
                response_cache[tts_cache_key] = (tts_result, time.time())

                processing_time = time.time() - start_time
                print(
                    f"⚙️ Combined processing completed in {processing_time:.2f}s"
                )

                return CombinedResponse(
                    reply=reply_text,
                    audio_data=audio_data,
                    content_type=content_type,
                    use_browser_tts=use_browser_tts,
                    fallback_text=reply_text if use_browser_tts else "",
                    processing_time=processing_time,
                )

            except Exception as tts_error:
                print(f"TTS Error in combined response: {str(tts_error)}")
                # TTSエラー時はブラウザTTSにフォールバック
                processing_time = time.time() - start_time
                return CombinedResponse(
                    reply=reply_text,
                    use_browser_tts=True,
                    fallback_text=reply_text,
                    processing_time=processing_time,
                )

        # TTSモデルが無い場合
        processing_time = time.time() - start_time
        return CombinedResponse(
            reply=reply_text,
            use_browser_tts=True,
            fallback_text=reply_text,
            processing_time=processing_time,
        )

    except Exception as e:
        print(f"Error in combined response: {str(e)}")
        processing_time = time.time() - start_time
        return CombinedResponse(
            reply="Sorry, there was an error processing your request. Please try again.",
            use_browser_tts=True,
            fallback_text="Sorry, there was an error processing your request. Please try again.",
            processing_time=processing_time,
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


def create_japanese_consultation_prompt(
    user_text: str, consultation_type: str = "general", conversation_history: list = None
) -> str:
    """
    Create prompts for Japanese consultation about English expressions and grammar.

    Args:
        user_text: The user's question in Japanese or English
        consultation_type: Type of consultation (kept for API compatibility)
        conversation_history: Previous consultation messages for context

    Returns:
        A formatted prompt string optimized for Japanese consultation responses
    """

    # Format conversation history for context
    history_context = ""
    if conversation_history and len(conversation_history) > 0:
        history_context = "\n\n相談履歴（参考情報）:\n"
        # Show last 8 messages to avoid token limit issues
        recent_history = (
            conversation_history[-8:]
            if len(conversation_history) > 8
            else conversation_history
        )
        for msg in recent_history:
            sender = msg.get("sender", "Unknown")
            text = msg.get("text", "")
            history_context += f"{sender}: {text}\n"
        history_context += "\n"

    # Simple Japanese consultation prompt
    prompt = f"""
あなたは日本人の英語学習者を専門とする、経験豊富で親切な英語教師です。

【重要な指示】:
- 必ず日本語で回答してください
- 簡潔で分かりやすい説明を心がけてください（2-3文程度）
- 1つの具体的な例文を含めてください
- 一目で読める短さにしてください
- 要点だけを簡潔に答えてください
{history_context}

【学習者からの質問】:
"{user_text}"

上記の質問に対して、日本語で簡潔に回答してください。例文は1つだけ、説明は2-3文以内でお願いします。
"""

    return prompt


def optimize_cache_cleanup():
    """
    キャッシュのクリーンアップを実行（メモリ使用量を最適化）
    """
    import time

    current_time = time.time()
    expired_keys = []

    for key, (data, timestamp) in response_cache.items():
        if current_time - timestamp > CACHE_TTL:
            expired_keys.append(key)

    for key in expired_keys:
        del response_cache[key]

    print(f"🧹 Cache cleanup: removed {len(expired_keys)} expired entries")


# アプリケーション起動時にキャッシュクリーンアップを定期実行するためのタスク
import threading
import time


def periodic_cache_cleanup():
    """定期的なキャッシュクリーンアップ"""
    while True:
        time.sleep(300)  # 5分毎に実行
        optimize_cache_cleanup()


# バックグラウンドでキャッシュクリーンアップを開始
cleanup_thread = threading.Thread(target=periodic_cache_cleanup, daemon=True)
cleanup_thread.start()


# ============================================================================
# 瞬間英作文モード用のAPI エンドポイント
# ============================================================================

# ============================================================================
# リスニング問題モード用のAPI エンドポイント
# ============================================================================


# リスニング問題の応答モデル
class ListeningProblem(BaseModel):
    """
    リスニング問題のレスポンスモデル
    """

    question: str  # 問題文（音声で読み上げる）
    choices: list  # 選択肢のリスト
    correct_answer: str  # 正解
    difficulty: str  # 難易度（easy, medium, hard）
    category: str  # カテゴリ
    explanation: str  # 解説（任意）


class ListeningAnswerRequest(BaseModel):
    """
    リスニング問題の回答チェック用リクエストモデル
    """

    question: str  # 問題文
    user_answer: str  # ユーザーの回答
    correct_answer: str  # 正解
    choices: list  # 選択肢


class ListeningAnswerResponse(BaseModel):
    """
    リスニング問題の回答チェック用レスポンスモデル
    """

    is_correct: bool  # 正解かどうか
    feedback: str  # フィードバック
    explanation: str  # 解説


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
    # 追加のwork/businessカテゴリ問題
    {
        "japanese": "プロジェクトの進捗はいかがですか？",
        "english": "How is the progress of the project?",
        "difficulty": "medium",
        "category": "work",
    },
    {
        "japanese": "来月から新しい部署に異動することになりました。",
        "english": "I will be transferred to a new department starting next month.",
        "difficulty": "hard",
        "category": "work",
    },
    {
        "japanese": "この提案書について質問があります。",
        "english": "I have a question about this proposal.",
        "difficulty": "medium",
        "category": "work",
    },
    {
        "japanese": "会議の資料を準備する必要があります。",
        "english": "I need to prepare materials for the meeting.",
        "difficulty": "easy",
        "category": "work",
    },
    {
        "japanese": "締切を延長していただくことは可能でしょうか？",
        "english": "Would it be possible to extend the deadline?",
        "difficulty": "hard",
        "category": "work",
    },
    # technology カテゴリ
    {
        "japanese": "新しいアプリをダウンロードしました。",
        "english": "I downloaded a new app.",
        "difficulty": "easy",
        "category": "technology",
    },
    {
        "japanese": "コンピューターが動かなくなってしまいました。",
        "english": "My computer has stopped working.",
        "difficulty": "medium",
        "category": "technology",
    },
    {
        "japanese": "このソフトウェアは非常に使いやすいです。",
        "english": "This software is very user-friendly.",
        "difficulty": "medium",
        "category": "technology",
    },
    # health カテゴリ
    {
        "japanese": "頭が痛いので病院に行きます。",
        "english": "I have a headache, so I'm going to the hospital.",
        "difficulty": "easy",
        "category": "health",
    },
    {
        "japanese": "毎日運動するように心がけています。",
        "english": "I try to exercise every day.",
        "difficulty": "medium",
        "category": "health",
    },
    {
        "japanese": "バランスの取れた食事を摂ることが大切です。",
        "english": "It's important to have a balanced diet.",
        "difficulty": "hard",
        "category": "health",
    },
    # education カテゴリ
    {
        "japanese": "大学で経済学を専攻しています。",
        "english": "I'm majoring in economics at university.",
        "difficulty": "medium",
        "category": "education",
    },
    {
        "japanese": "図書館で宿題をしています。",
        "english": "I'm doing my homework at the library.",
        "difficulty": "easy",
        "category": "education",
    },
    {
        "japanese": "今度の試験の準備をしなければなりません。",
        "english": "I have to prepare for the upcoming exam.",
        "difficulty": "medium",
        "category": "education",
    },
]


@app.get(
    "/api/instant-translation/problem",
    response_model=InstantTranslationProblem,
)
async def get_instant_translation_problem(
    difficulty: str = "all",
    category: str = "all",
    eiken_level: str = "",
    long_text_mode: bool = False,
):
    """
    瞬間英作文の問題を取得するAPIエンドポイント

    難易度、カテゴリ、英検レベルに基づいて適切な問題を返します。
    英検レベルが指定されている場合は、AIを使って動的に問題を生成します。

    Args:
        difficulty: 問題の難易度 (all, basic, intermediate, advanced)
        category: 問題のカテゴリ (all, daily_life, work, travel, etc.)
        eiken_level: 英検レベル (5, 4, 3, pre-2, 2, pre-1, 1)
    """

    print(
        f"🔔 Instant translation problem request: difficulty={difficulty}, category={category}, eiken_level={eiken_level}, long_text_mode={long_text_mode}"
    )

    try:
        import json
        import random

        # 英検レベルが指定されていて、AIが利用可能な場合はAI生成を試行
        if eiken_level and eiken_level.strip() and model:
            print(f"🤖 Generating AI problem for Eiken level {eiken_level}")

            try:
                # カテゴリのマッピング
                category_for_ai = category if category != "all" else "general"

                # AI問題生成プロンプトを作成
                ai_prompt = create_eiken_problem_generation_prompt(
                    eiken_level, category_for_ai, long_text_mode
                )

                # AIに問題生成を依頼（非同期実行）
                loop = asyncio.get_event_loop()
                ai_response = await loop.run_in_executor(
                    executor, lambda: model.generate_content(ai_prompt)
                )

                if ai_response.text:
                    # AIの応答をパースしてJSONを抽出
                    ai_text = ai_response.text.strip()

                    # JSONブロックを探す
                    json_start = ai_text.find("{")
                    json_end = ai_text.rfind("}") + 1

                    if json_start != -1 and json_end > json_start:
                        json_text = ai_text[json_start:json_end]

                        try:
                            ai_problem = json.loads(json_text)

                            # 必要なフィールドが含まれているかチェック
                            if all(
                                key in ai_problem
                                for key in ["japanese", "english"]
                            ):
                                print(f"✅ AI generated problem successfully")

                                # 難易度とカテゴリを調整
                                eiken_to_difficulty = {
                                    "5": "easy",
                                    "4": "easy",
                                    "3": "medium",
                                    "pre-2": "medium",
                                    "2": "medium",
                                    "pre-1": "hard",
                                    "1": "hard",
                                }

                                return InstantTranslationProblem(
                                    japanese=ai_problem["japanese"],
                                    english=ai_problem["english"],
                                    difficulty=ai_problem.get(
                                        "difficulty",
                                        eiken_to_difficulty.get(
                                            eiken_level, "medium"
                                        ),
                                    ),
                                    category=ai_problem.get(
                                        "category", category_for_ai
                                    ),
                                )
                            else:
                                print(
                                    f"⚠️ AI response missing required fields, falling back to static problems"
                                )
                        except json.JSONDecodeError as e:
                            print(
                                f"⚠️ Failed to parse AI JSON response: {e}, falling back to static problems"
                            )
                    else:
                        print(
                            f"⚠️ No valid JSON found in AI response, falling back to static problems"
                        )
                else:
                    print(
                        f"⚠️ Empty AI response, falling back to static problems"
                    )

            except Exception as e:
                print(
                    f"⚠️ AI problem generation failed: {e}, falling back to static problems"
                )

        # 静的問題リストからの選択（フォールバック）
        print(f"📚 Using static problem list")

        # 英検レベルを難易度にマッピング
        eiken_to_difficulty = {
            "5": "easy",
            "4": "easy",
            "3": "medium",
            "pre-2": "medium",
            "2": "medium",
            "pre-1": "hard",
            "1": "hard",
        }

        # 難易度の決定 - 英検レベルが指定されている場合は優先
        if eiken_level and eiken_level in eiken_to_difficulty:
            target_difficulty = eiken_to_difficulty[eiken_level]
        elif difficulty != "all":
            # フロントエンドの難易度をバックエンドの形式に変換
            difficulty_mapping = {
                "basic": "easy",
                "intermediate": "medium",
                "advanced": "hard",
            }
            target_difficulty = difficulty_mapping.get(difficulty, "medium")
        else:
            target_difficulty = "all"

        # 問題フィルタリング
        filtered_problems = []

        # 難易度フィルタ
        if target_difficulty == "all":
            filtered_problems = TRANSLATION_PROBLEMS.copy()
        else:
            filtered_problems = [
                p
                for p in TRANSLATION_PROBLEMS
                if p["difficulty"] == target_difficulty
            ]

        # カテゴリフィルタ
        if category != "all":
            # フロントエンドのカテゴリ名をバックエンドの形式に変換
            category_mapping = {
                "daily_life": ["daily_life", "daily_routine", "preferences"],
                "work": ["business", "work"],
                "travel": ["travel", "transportation"],
                "education": ["learning", "education"],
                "technology": ["technology"],
                "health": ["health"],
                "culture": ["general"],  # 今後追加予定
                "environment": ["general"],  # 今後追加予定
            }

            target_categories = category_mapping.get(category, [category])
            filtered_problems = [
                p
                for p in filtered_problems
                if p["category"] in target_categories
            ]
        # 利用可能な問題がない場合のフォールバック
        if not filtered_problems:
            print(f"No problems found for filters, using fallback")
            filtered_problems = TRANSLATION_PROBLEMS.copy()

        # ランダムに問題を選択
        problem = random.choice(filtered_problems)

        return InstantTranslationProblem(
            japanese=problem["japanese"],
            english=problem["english"],
            difficulty=problem["difficulty"],
            category=problem["category"],
        )

    except Exception as e:
        print(f"Error generating instant translation problem: {str(e)}")
        # エラー時のフォールバック問題
        fallback_problem = {
            "japanese": "私は毎日英語を勉強しています。",
            "english": "I study English every day.",
            "difficulty": "easy",
            "category": "daily_life",
        }

        return InstantTranslationProblem(
            japanese=fallback_problem["japanese"],
            english=fallback_problem["english"],
            difficulty=fallback_problem["difficulty"],
            category=fallback_problem["category"],
        )


# ============================================================================
# リスニング問題取得エンドポイント
# ============================================================================


@app.get("/api/listening/problem", response_model=ListeningProblem)
async def get_listening_problem(
    category: str = "any",
    difficulty: str = "medium",
    _t: str = None,  # キャッシュバスティング用タイムスタンプパラメータ（使用しない）
):
    """
    Trivia APIを使用してリスニング問題を取得するエンドポイント

    Args:
        category: 問題のカテゴリ (any, sports, science, history, etc.)
        difficulty: 難易度 (easy, medium, hard)
        _t: キャッシュバスティング用タイムスタンプ（内部では使用しない）

    Returns:
        ListeningProblem: 問題文、選択肢、正解、難易度、カテゴリを含む
    """
    try:
        import httpx

        # Open Trivia Database APIのパラメータ設定
        base_url = "https://opentdb.com/api.php"
        params = {
            "amount": 1,  # 1問取得
            "type": "multiple",  # 多肢選択問題
            "difficulty": difficulty,
            "encode": "url3986",  # RFC 3986 URL エンコーディング
        }

        # カテゴリマッピング（Open Trivia DBのカテゴリID）
        category_mapping = {
            "any": None,
            "general": 9,
            "books": 10,
            "film": 11,
            "music": 12,
            "television": 14,
            "science": 17,
            "computers": 18,
            "math": 19,
            "mythology": 20,
            "sports": 21,
            "geography": 22,
            "history": 23,
            "politics": 24,
            "art": 25,
            "celebrities": 26,
            "animals": 27,
            "vehicles": 28,
        }

        # カテゴリが指定されている場合はパラメータに追加
        if category != "any" and category in category_mapping:
            params["category"] = category_mapping[category]

        # Trivia APIから問題を取得（レート制限考慮）
        import asyncio
        import time

        # レート制限チェック（5秒間隔）
        current_time = time.time()
        if hasattr(get_listening_problem, "_last_request_time"):
            time_since_last = (
                current_time - get_listening_problem._last_request_time
            )
            if time_since_last < 5.0:
                wait_time = 5.0 - time_since_last
                print(f"⏳ Rate limit: waiting {wait_time:.1f} seconds")
                await asyncio.sleep(wait_time)

        get_listening_problem._last_request_time = time.time()

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()

        # レスポンスコードチェック
        response_code = data.get("response_code", -1)

        if response_code == 1:
            raise Exception(
                "API Error: Not enough questions for the specified criteria"
            )
        elif response_code == 2:
            raise Exception("API Error: Invalid parameters")
        elif response_code == 3:
            raise Exception("API Error: Token not found")
        elif response_code == 4:
            raise Exception("API Error: Token exhausted")
        elif response_code == 5:
            raise Exception("API Error: Rate limit exceeded")
        elif response_code != 0:
            raise Exception(
                f"API Error: Unknown response code {response_code}"
            )

        if not data.get("results"):
            raise Exception("No questions returned from API")

        # 問題データを抽出
        question_data = data["results"][0]

        # URL エンコーディングをデコード
        import urllib.parse

        question = urllib.parse.unquote(question_data["question"])
        correct_answer = urllib.parse.unquote(question_data["correct_answer"])
        incorrect_answers = [
            urllib.parse.unquote(ans)
            for ans in question_data["incorrect_answers"]
        ]

        # 選択肢をシャッフル
        import random

        choices = [correct_answer] + incorrect_answers
        random.shuffle(choices)

        return ListeningProblem(
            question=question,
            choices=choices,
            correct_answer=correct_answer,
            difficulty=question_data["difficulty"],
            category=question_data["category"],
            explanation="",  # Trivia APIには解説がないため空文字
        )

    except Exception as e:
        print(f"Error fetching listening problem: {str(e)}")

        # 充実したフォールバック問題セット
        fallback_problems = [
            {
                "question": "What is the capital of Japan?",
                "choices": ["Tokyo", "Osaka", "Kyoto", "Hiroshima"],
                "correct_answer": "Tokyo",
                "difficulty": "easy",
                "category": "Geography",
            },
            {
                "question": "Which planet is known as the Red Planet?",
                "choices": ["Venus", "Mars", "Jupiter", "Saturn"],
                "correct_answer": "Mars",
                "difficulty": "easy",
                "category": "Science",
            },
            {
                "question": "How many continents are there on Earth?",
                "choices": ["5", "6", "7", "8"],
                "correct_answer": "7",
                "difficulty": "medium",
                "category": "Geography",
            },
            {
                "question": "What is the largest mammal in the world?",
                "choices": [
                    "Elephant",
                    "Blue Whale",
                    "Giraffe",
                    "Hippopotamus",
                ],
                "correct_answer": "Blue Whale",
                "difficulty": "medium",
                "category": "Science",
            },
        ]

        # 難易度に応じてフォールバック問題を選択
        suitable_problems = [
            p for p in fallback_problems if p["difficulty"] == difficulty
        ]
        if not suitable_problems:
            suitable_problems = (
                fallback_problems  # 適切な難易度がない場合は全て
            )

        import random

        selected_problem = random.choice(suitable_problems)

        return ListeningProblem(
            question=selected_problem["question"],
            choices=selected_problem["choices"],
            correct_answer=selected_problem["correct_answer"],
            difficulty=selected_problem["difficulty"],
            category=selected_problem["category"],
            explanation="This is a fallback question due to external API issues.",
        )


# ============================================================================
# リスニング問題回答チェックエンドポイント
# ============================================================================


@app.post("/api/listening/check", response_model=ListeningAnswerResponse)
async def check_listening_answer(req: ListeningAnswerRequest):
    """
    リスニング問題の回答をチェックし、フィードバックを提供するエンドポイント

    Args:
        req: ユーザーの回答データ

    Returns:
        ListeningAnswerResponse: 正解判定、フィードバック、解説
    """
    try:
        # 正解判定（大文字小文字を無視）
        is_correct = (
            req.user_answer.strip().lower()
            == req.correct_answer.strip().lower()
        )

        # AIを使用してフィードバック生成
        if model:
            prompt = f"""
あなたは英語学習者向けのリスニング問題チューターです。
以下のリスニング問題の回答について、励ましとともにフィードバックを提供してください。

問題: {req.question}
選択肢: {', '.join(req.choices)}
正解: {req.correct_answer}
ユーザーの回答: {req.user_answer}
正解判定: {'正解' if is_correct else '不正解'}

フィードバックは以下の要素を含めてください：
1. 正解・不正解の判定
2. 正解の理由や背景知識
3. 学習者への励ましの言葉
4. 日本語で100文字以内

回答形式：JSON
{{
    "feedback": "フィードバック文",
    "explanation": "解説文"
}}
"""

            try:
                ai_response = model.generate_content(prompt)
                if ai_response.text:
                    import json
                    import re

                    # JSONを抽出
                    json_match = re.search(
                        r"\{.*\}", ai_response.text, re.DOTALL
                    )
                    if json_match:
                        response_data = json.loads(json_match.group())
                        feedback = response_data.get("feedback", "")
                        explanation = response_data.get("explanation", "")
                    else:
                        raise Exception("No JSON found in AI response")
                else:
                    raise Exception("Empty AI response")

            except Exception as e:
                print(f"AI feedback generation failed: {e}")
                # フォールバックフィードバック
                if is_correct:
                    feedback = "正解です！よくできました。"
                    explanation = f"答えは「{req.correct_answer}」です。"
                else:
                    feedback = (
                        f"惜しい！正解は「{req.correct_answer}」でした。"
                    )
                    explanation = "次回も頑張りましょう！"
        else:
            # Gemini APIが利用できない場合のシンプルなフィードバック
            if is_correct:
                feedback = "正解です！素晴らしい！"
                explanation = f"答えは「{req.correct_answer}」です。"
            else:
                feedback = (
                    f"不正解です。正解は「{req.correct_answer}」でした。"
                )
                explanation = "次回も頑張ってください！"

        return ListeningAnswerResponse(
            is_correct=is_correct, feedback=feedback, explanation=explanation
        )

    except Exception as e:
        print(f"Error checking listening answer: {str(e)}")
        return ListeningAnswerResponse(
            is_correct=False,
            feedback="回答の確認中にエラーが発生しました。",
            explanation="もう一度お試しください。",
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

        # AIを使って詳細な回答チェック（非同期実行）
        check_prompt = create_translation_check_prompt(
            req.japanese, req.correctAnswer, req.userAnswer
        )

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            executor, lambda: model.generate_content(check_prompt)
        )

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


@app.get(
    "/api/eiken-translation-problem",
    response_model=InstantTranslationProblem,
)
async def get_eiken_translation_problem(
    difficulty: str = "all", category: str = "all", eiken_level: str = ""
):
    """
    英検対応瞬間英作文問題取得APIエンドポイント

    フロントエンド互換性のためのエイリアスエンドポイント。
    /api/instant-translation/problemと同じ機能を提供します。

    Args:
        difficulty: 問題の難易度 (all, basic, intermediate, advanced)
        category: 問題のカテゴリ (all, daily_life, work, travel, etc.)
        eiken_level: 英検レベル (5, 4, 3, pre-2, 2, pre-1, 1)
    """

    # 既存の関数を呼び出して重複を避ける
    return await get_instant_translation_problem(
        difficulty, category, eiken_level, False
    )


def create_eiken_problem_generation_prompt(
    eiken_level: str, category: str = "general", long_text_mode: bool = False
) -> str:
    """
    英検レベルに応じた瞬間英作文問題を生成するためのプロンプトを作成

    Args:
        eiken_level: 英検レベル (5, 4, 3, pre-2, 2, pre-1, 1)
        category: 問題のカテゴリ (daily_life, work, travel, etc.)

    Returns:
        AIが問題を生成するためのプロンプト
    """

    # 英検レベル別の特徴定義
    eiken_characteristics = {
        "5": {
            "description": "英検5級 (中学初級レベル)",
            "grammar": "現在形、過去形、be動詞、一般動詞の基本形",
            "vocabulary": "中学1年生レベルの基本語彙 (約600語)",
            "sentence_structure": "シンプルな単文中心",
            "examples": [
                "I am a student.",
                "I go to school.",
                "It is sunny today.",
            ],
        },
        "4": {
            "description": "英検4級 (中学中級レベル)",
            "grammar": "助動詞 (can, will, must)、未来形、進行形",
            "vocabulary": "中学2年生レベルの語彙 (約1300語)",
            "sentence_structure": "助動詞を含む文、疑問文・否定文",
            "examples": [
                "I can play tennis.",
                "Will you help me?",
                "She is reading a book.",
            ],
        },
        "3": {
            "description": "英検3級 (中学卒業レベル)",
            "grammar": "受動態、現在完了、不定詞、動名詞",
            "vocabulary": "中学3年生レベルの語彙 (約2100語)",
            "sentence_structure": "複文構造、接続詞を使った文",
            "examples": [
                "This book was written by him.",
                "I have been to Tokyo.",
                "I want to learn English.",
            ],
        },
        "pre-2": {
            "description": "英検準2級 (高校中級レベル)",
            "grammar": "関係代名詞、仮定法の基本、分詞",
            "vocabulary": "高校基礎レベルの語彙 (約3600語)",
            "sentence_structure": "関係詞を使った複文、より複雑な構造",
            "examples": [
                "The man who is standing there is my teacher.",
                "If I were you, I would study harder.",
            ],
        },
        "2": {
            "description": "英検2級 (高校卒業レベル)",
            "grammar": "仮定法、複雑な時制、高度な文型",
            "vocabulary": "高校卒業レベルの語彙 (約5100語)",
            "sentence_structure": "複雑な複文、論理的な文構造",
            "examples": [
                "If I had studied harder, I could have passed the exam.",
                "Having finished my homework, I went to bed.",
            ],
        },
        "pre-1": {
            "description": "英検準1級 (大学中級レベル)",
            "grammar": "高度な文法構造、論理的表現",
            "vocabulary": "大学中級レベルの語彙 (約7500語)",
            "sentence_structure": "学術的・ビジネス的表現",
            "examples": [
                "The proposal is likely to be implemented next year.",
                "It is essential that we address this issue promptly.",
            ],
        },
        "1": {
            "description": "英検1級 (大学上級レベル)",
            "grammar": "最高レベルの文法、慣用表現",
            "vocabulary": "大学上級レベルの語彙 (約10000-15000語)",
            "sentence_structure": "高度な論理構造、専門的表現",
            "examples": [
                "The ramifications of this decision could be far-reaching.",
                "Notwithstanding the challenges, we must persevere.",
            ],
        },
    }

    # カテゴリ別のトピック
    category_topics = {
        "daily_life": ["家族", "食事", "買い物", "趣味", "天気"],
        "work": ["仕事", "会議", "プロジェクト", "同僚", "スケジュール"],
        "travel": ["旅行", "交通", "宿泊", "観光", "文化"],
        "education": ["学校", "勉強", "試験", "図書館", "授業"],
        "health": ["健康", "病気", "運動", "食事", "病院"],
        "technology": [
            "コンピューター",
            "スマートフォン",
            "インターネット",
            "アプリ",
            "SNS",
        ],
        "general": ["一般的な話題", "日常的な表現", "基本的な会話"],
    }

    eiken_info = eiken_characteristics.get(
        eiken_level, eiken_characteristics["3"]
    )
    topics = category_topics.get(category, category_topics["general"])

    prompt = f"""
あなたは英検対策の専門家です。以下の条件に従って瞬間英作文の問題を1つ作成してください。

【対象レベル】
{eiken_info['description']}

【文法レベル】
{eiken_info['grammar']}

【語彙レベル】
{eiken_info['vocabulary']}

【文構造】
{eiken_info['sentence_structure']}

【参考例文】
{', '.join(eiken_info['examples'])}

【問題カテゴリ】
{category} - トピック例: {', '.join(topics)}

【作成条件】
1. 指定された英検レベルに適した語彙・文法のみを使用
2. 日本人学習者にとって実用性の高い表現
3. 自然で適切な英語表現
4. 指定されたカテゴリに関連する内容
5. {"複数文で構成する（長文モード）" if long_text_mode else "短い1文のみで構成する（デフォルト）"}

【出力形式】
以下のJSON形式で出力してください：
{{
    "japanese": "日本語の文章",
    "english": "対応する英語の文章",
    "difficulty": "easy/medium/hard",
    "category": "カテゴリ名"
}}

{"2-3文からなる" if long_text_mode else "1つの"}問題を作成してください。
"""

    return prompt
