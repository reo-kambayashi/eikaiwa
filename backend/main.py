from fastapi import FastAPI
from pydantic import BaseModel

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

    # In a real app, integrate with GEMINI API or other services here
    reply_text = f"You said: {req.text}"
    return Response(reply=reply_text)
