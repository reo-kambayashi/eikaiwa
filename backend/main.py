"""FastAPI backend for the English Communication App."""

from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os

# Load environment variables from the `.env` file located at the project root.
# This allows developers to keep API keys outside of the source code.
load_dotenv()

# API keys read from the environment
GEMINI_API_KEY = os.getenv("GEMINI_API", "")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv(
    "GOOGLE_APPLICATION_CREDENTIALS", ""
)

app = FastAPI()


class Request(BaseModel):
    """Message sent from the frontend."""

    text: str


class Response(BaseModel):
    """Reply returned by the server."""

    reply: str


@app.post("/api/respond", response_model=Response)
async def respond(req: Request):
    """Echo the text received from the user."""

    # In a real app, integrate with GEMINI API or other services here.
    # Example:
    # if GEMINI_API_KEY:
    #     call_external_api(req.text, GEMINI_API_KEY)
    reply_text = f"You said: {req.text}"
    return Response(reply=reply_text)
