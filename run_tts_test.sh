#!/bin/bash

echo "🚀 Running TTS Test in background..."

# Wait for server to be ready
echo "⏳ Waiting for server to initialize..."
sleep 10

# Run the test
cd backend
uv run python ../test_tts.py