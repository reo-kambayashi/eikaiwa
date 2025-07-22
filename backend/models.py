"""
Pydantic models for request/response validation.
英語学習アプリ用のリクエスト・レスポンスモデル定義

このファイルには、FastAPI エンドポイントで使用される
全てのリクエスト・レスポンスモデルが定義されています。
Pydanticを使用して型安全性と自動バリデーションを提供します。
"""

from typing import List

from pydantic import BaseModel

# ============================================================================
# 基本的な会話API用モデル
# ============================================================================

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


# ============================================================================
# 音声合成(TTS)用モデル
# ============================================================================

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


# ============================================================================
# 瞬間英作文モード用モデル
# ============================================================================

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


# ============================================================================
# リスニング問題モード用モデル
# ============================================================================

class ListeningProblem(BaseModel):
    """
    リスニング問題のレスポンスモデル
    
    Trivia APIから取得した問題データを構造化して返します。
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


class ListeningTranslateRequest(BaseModel):
    """
    リスニング問題翻訳用リクエストモデル
    """
    question: str  # 翻訳する英語の問題文


class ListeningTranslateResponse(BaseModel):
    """
    リスニング問題翻訳用レスポンスモデル
    """
    japanese_translation: str  # 日本語翻訳
