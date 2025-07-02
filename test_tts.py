#!/usr/bin/env python3
"""
Gemini TTS Test Script
音声読み上げ機能のテストスクリプト
"""

import os
import sys
import base64
import requests
import json
from pathlib import Path
import time

def test_tts_endpoint():
    """Test the TTS endpoint"""
    print("🎤 Testing Gemini TTS endpoint...")
    
    # API endpoint
    api_url = "http://localhost:8000/api/tts"
    
    # Test data
    test_data = {
        "text": "Hello, this is a test of the Gemini TTS system. こんにちは、これはジェミニTTSシステムのテストです。",
        "voice_name": "kore",
        "speaking_rate": 1.0
    }
    
    try:
        # Make request
        print(f"📡 Sending request to {api_url}")
        print(f"📝 Text: {test_data['text']}")
        
        response = requests.post(api_url, json=test_data, timeout=60)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ TTS request successful!")
            
            # Check response structure
            if "audio_data" in result:
                if result["audio_data"]:
                    print(f"🎵 Audio data received: {len(result['audio_data'])} characters")
                    print(f"📄 Content type: {result.get('content_type', 'unknown')}")
                    
                    # Save audio file for testing
                    save_audio_file(result["audio_data"], result.get("content_type", "audio/wav"))
                    
                else:
                    print("⚠️  No audio data (using browser TTS fallback)")
                    if result.get("use_browser_tts"):
                        print(f"🔄 Fallback text: {result.get('fallback_text', '')}")
            
            return True
            
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"📝 Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the backend server running?")
        print("💡 Try running: make dev")
        return False
    except requests.exceptions.Timeout:
        print("❌ Request timeout - server might be processing")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def save_audio_file(audio_base64, content_type):
    """Save audio data to file"""
    try:
        # Decode base64 audio data
        audio_data = base64.b64decode(audio_base64)
        
        # Determine file extension
        extension = "wav"
        if "mp3" in content_type.lower():
            extension = "mp3"
        elif "ogg" in content_type.lower():
            extension = "ogg"
        
        # Create output filename
        timestamp = int(time.time())
        filename = f"tts_test_{timestamp}.{extension}"
        
        # Save file
        with open(filename, "wb") as f:
            f.write(audio_data)
        
        print(f"💾 Audio saved as: {filename}")
        print(f"📏 File size: {len(audio_data)} bytes")
        
        # Try to play the audio (macOS)
        if sys.platform == "darwin":
            print("🎵 Attempting to play audio...")
            os.system(f"afplay {filename}")
        
    except Exception as e:
        print(f"❌ Error saving audio: {str(e)}")

def test_server_status():
    """Test if server is running"""
    print("🔍 Checking server status...")
    
    try:
        response = requests.get("http://localhost:8000/api/status", timeout=30)
        if response.status_code == 200:
            status = response.json()
            print("✅ Server is running")
            print(f"🤖 Gemini available: {status.get('gemini_available', False)}")
            print(f"🔊 TTS available: {status.get('tts_available', False)}")
            return True
        else:
            print(f"⚠️  Server responding but status unclear: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server not responding - connection refused")
        return False
    except requests.exceptions.Timeout:
        print("❌ Server timeout - may be starting up")
        return False
    except Exception as e:
        print(f"❌ Server check error: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Gemini TTS Test Suite")
    print("=" * 40)
    
    # Check if server is running
    print("⏳ Waiting for server to be ready...")
    max_retries = 3
    for attempt in range(max_retries):
        if test_server_status():
            break
        if attempt < max_retries - 1:
            print(f"🔄 Retry {attempt + 1}/{max_retries} in 5 seconds...")
            time.sleep(5)
    else:
        print("\n💡 Server not responding. Please check:")
        print("   1. make dev")
        print("   2. Check if GEMINI_API_KEY is set in .env")
        print("   3. Check backend logs: make logs")
        sys.exit(1)
    
    print("\n" + "=" * 40)
    
    # Test TTS endpoint
    success = test_tts_endpoint()
    
    print("\n" + "=" * 40)
    if success:
        print("✅ TTS test completed successfully!")
    else:
        print("❌ TTS test failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()