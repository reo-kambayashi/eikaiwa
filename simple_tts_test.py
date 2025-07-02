#!/usr/bin/env python3
"""
Simple Gemini TTS Test Script
"""

import requests
import json
import base64
import time

def test_tts():
    print("🎤 Testing Gemini TTS...")
    
    url = "http://localhost:8000/api/tts"
    data = {
        "text": "Hello, this is a TTS test.",
        "voice_name": "kore",
        "speaking_rate": 1.0
    }
    
    try:
        print(f"Sending request to {url}")
        response = requests.post(url, json=data, timeout=60)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            
            if result.get("audio_data"):
                print(f"🎵 Audio data length: {len(result['audio_data'])}")
                
                # Save audio
                audio_data = base64.b64decode(result["audio_data"])
                filename = f"test_audio_{int(time.time())}.wav"
                
                with open(filename, "wb") as f:
                    f.write(audio_data)
                
                print(f"💾 Saved as: {filename}")
            else:
                print("⚠️ No audio data - using browser TTS fallback")
                
        else:
            print(f"❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_tts()