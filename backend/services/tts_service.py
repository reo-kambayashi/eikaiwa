"""
TTS (Text-to-Speech) service for voice synthesis functionality.
"""

import os
import tempfile

from config import tts_model


def synthesize_speech(text: str, language: str = "japanese") -> str:
    """
    テキストを音声に変換し、一時ファイルのパスを返す
    
    Args:
        text: 合成する文字列
        language: 言語 ("japanese" または "english")
    
    Returns:
        音声ファイルの一時ファイルパス
    """
    try:
        # 現在は日本語のみ対応
        response = tts_model.generate_content(text)
        
        # 一時ファイルを作成
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(response.audio)
            tmp_file.flush()
            return tmp_file.name
            
    except Exception as e:
        print(f"TTS synthesis error: {e}")
        raise
