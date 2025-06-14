"""FastAPI backend for the English Communication App."""

import os

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    level: str = "beginner"  # beginner, intermediate, advanced
    # conversation, grammar, vocabulary, pronunciation
    practice_type: str = "conversation"


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

        # Create specialized prompts based on practice type and level
        prompt = create_conversation_prompt(
            req.text, req.level, req.practice_type)

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


def create_conversation_prompt(user_text: str, level: str, practice_type: str) -> str:
    """
    Create specialized prompts for different types of English conversation practice.

    Args:
        user_text: The user's input message
        level: beginner, intermediate, or advanced
        practice_type: conversation, grammar, vocabulary, or pronunciation

    Returns:
        A formatted prompt string optimized for the specified practice type and level
    """

    # Base instructions for all practice types
    base_instructions = f"""
You are an expert English teacher and conversation partner specializing in helping Japanese learners.
Your student's English level is: {level.upper()}
Practice focus: {practice_type.upper()}

IMPORTANT GUIDELINES:
- Always be encouraging and supportive
- Use natural, conversational English
- Adapt your vocabulary and grammar complexity to the student's level
- Provide gentle corrections when needed
- Ask follow-up questions to keep the conversation flowing
- Use examples and explanations when helpful
"""

    # Level-specific adjustments
    level_adjustments = {
        "beginner": """
- Use simple vocabulary and sentence structures
- Speak more slowly and clearly
- Repeat important words or phrases
- Use basic grammar patterns
- Provide extra encouragement
""",
        "intermediate": """
- Use everyday vocabulary with some challenging words
- Mix simple and complex sentences
- Introduce idiomatic expressions occasionally
- Help with common grammar mistakes
- Encourage longer responses
""",
        "advanced": """
- Use sophisticated vocabulary and expressions
- Employ complex sentence structures
- Discuss abstract topics and nuanced ideas
- Focus on fluency and naturalness
- Challenge with advanced grammar and idioms
"""
    }

    # Practice type-specific instructions
    practice_instructions = {
        "conversation": f"""
CONVERSATION PRACTICE:
- Engage in natural, flowing dialogue
- Ask open-ended questions to encourage speaking
- Share relatable experiences or opinions
- Use appropriate conversational markers (Well, Actually, By the way, etc.)
- Keep the conversation interesting and relevant

{level_adjustments.get(level, level_adjustments["beginner"])}

Student's message: "{user_text}"

Respond naturally as a friendly conversation partner. Keep your response conversational and engaging.
""",

        "grammar": f"""
GRAMMAR PRACTICE:
- If there are grammar errors, gently correct them with explanations
- Provide the correct form and explain why it's correct
- Give 1-2 similar examples to reinforce the rule
- Praise what the student did correctly
- Suggest ways to practice this grammar point

{level_adjustments.get(level, level_adjustments["beginner"])}

Student's message: "{user_text}"

Focus on helping with grammar while maintaining a supportive, conversational tone.
""",

        "vocabulary": f"""
VOCABULARY PRACTICE:
- Introduce 2-3 new words related to the topic
- Explain meanings with simple definitions and examples
- Help with word usage and collocations
- Suggest synonyms or related expressions
- Encourage the student to use new vocabulary in context

{level_adjustments.get(level, level_adjustments["beginner"])}

Student's message: "{user_text}"

Help expand vocabulary while keeping the conversation natural and engaging.
""",

        "pronunciation": f"""
PRONUNCIATION PRACTICE:
- Focus on commonly mispronounced words by Japanese speakers
- Provide phonetic guidance when helpful
- Highlight rhythm and intonation patterns
- Suggest practice techniques for difficult sounds
- Be encouraging about pronunciation efforts

{level_adjustments.get(level, level_adjustments["beginner"])}

Student's message: "{user_text}"

Provide pronunciation guidance while maintaining conversational flow.
Note: You can use phonetic symbols like /θ/ for 'th' sound, /r/ vs /l/ distinction, etc.
"""
    }

    # Combine all instructions
    full_prompt = base_instructions + \
        practice_instructions.get(
            practice_type, practice_instructions["conversation"])

    return full_prompt
