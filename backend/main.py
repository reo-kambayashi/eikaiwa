"""FastAPI backend for the English Communication App."""

import os

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Load environment variables from the `.env` file located at the project root.
# This allows developers to keep API keys outside of the source code.
load_dotenv()

# API keys read from the environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS", ""
)

# Configure Gemini API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

app = FastAPI()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "English Communication App API is running"}


@app.get("/api/status")
async def api_status():
    """Check API configuration status."""
    return {
        "gemini_configured": bool(GEMINI_API_KEY and model),
        "google_credentials_configured": bool(GOOGLE_APPLICATION_CREDENTIALS)
    }


class Request(BaseModel):
    """Message sent from the frontend."""

    text: str


class Response(BaseModel):
    """Reply returned by the server."""

    reply: str


@app.post("/api/respond", response_model=Response)
async def respond(req: Request):
    """Generate a response using Gemini API for English conversation practice."""

    try:
        if not model:
            # Fallback response if Gemini API is not configured
            return Response(reply="API key not configured. Please set GEMINI_API_KEY environment variable.")

        # Create a prompt for English conversation practice
        prompt = f"""
        You are an English conversation partner for Japanese people learning English.
        Please respond to the following message in a helpful, encouraging way.
        Keep your response conversational and at an appropriate level for English learners.
        
        User message: {req.text}
        """

        # Generate response using Gemini
        response = model.generate_content(prompt)

        if response.text:
            return Response(reply=response.text)
        else:
            return Response(reply="Sorry, I couldn't generate a response. Please try again.")

    except Exception as e:
        # Log the error in production, but don't expose internal details
        print(f"Error generating response: {str(e)}")
        return Response(reply="Sorry, there was an error processing your request. Please try again.")
