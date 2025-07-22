"""
Application configuration and environment setup.
アプリケーション設定と環境変数管理

このファイルには、アプリケーションの設定と環境変数の読み込み、
外部サービス（Gemini AI、TTS）の初期化が含まれています。
"""

import os
from concurrent.futures import ThreadPoolExecutor

import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from the `.env` file located at the project root.
# This allows developers to keep API keys outside of the source code for security.
# The load_dotenv() function automatically reads the .env file from the project root.
load_dotenv()

# ============================================================================
# 環境変数とAPI設定
# ============================================================================

# API keys and credentials read from environment variables
# These are set in the .env file and loaded at runtime
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS", ""
)

# ============================================================================
# Gemini AI モデル設定
# ============================================================================

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

# ============================================================================
# 並行処理・キャッシュ設定
# ============================================================================

# スレッドプールエグゼキューターを設定（AI処理を非同期化するため）
executor = ThreadPoolExecutor(max_workers=4)

# メモリキャッシュ（単一ユーザー用の高速化）
response_cache = {}
CACHE_TTL = 300  # 5分間のキャッシュ

# ============================================================================
# キャッシュ管理機能
# ============================================================================

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


def periodic_cache_cleanup():
    """定期的なキャッシュクリーンアップ"""
    import time
    
    while True:
        time.sleep(300)  # 5分毎に実行
        optimize_cache_cleanup()


# ============================================================================
# キャッシュクリーンアップの開始
# ============================================================================

# アプリケーション起動時にキャッシュクリーンアップを定期実行するためのタスク
import threading

# バックグラウンドでキャッシュクリーンアップを開始
cleanup_thread = threading.Thread(target=periodic_cache_cleanup, daemon=True)
cleanup_thread.start()
