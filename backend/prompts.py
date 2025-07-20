# -*- coding: utf-8 -*-
"""
Prompt Templates for the AI English Conversation Practice App
==============================================================

This file centralizes all prompt templates used in the English learning application.
It is structured for easy management and modification of prompts.

Usage:
  from prompts import PromptTemplates
  templates = PromptTemplates()
  prompt = templates.get_conversation_prompt(user_text="Hello", history=chat_history)
"""

from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum


class DifficultyLevel(Enum):
    """Defines difficulty levels for problems."""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class EikenLevel(Enum):
    """Defines Eiken levels (Grade 5 to 1)."""

    GRADE_5 = "grade_5"
    GRADE_4 = "grade_4"
    GRADE_3 = "grade_3"
    GRADE_PRE_2 = "grade_pre_2"
    GRADE_2 = "grade_2"
    GRADE_PRE_1 = "grade_pre_1"
    GRADE_1 = "grade_1"


class CategoryType(Enum):
    """Defines problem categories."""

    DAILY = "daily"
    BUSINESS = "business"
    TRAVEL = "travel"
    FOOD = "food"
    HOBBY = "hobby"


@dataclass
class ChatMessage:
    """Data structure for a single chat message."""

    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None


class PromptTemplates:
    """
    Manages and generates all AI prompt templates for the application.
    All modifications and additions to prompts should be done through this class.
    """

    def __init__(self):
        """Initializes the prompt templates with detailed descriptions."""
        self.difficulty_descriptions = {
            DifficultyLevel.EASY: "Basic junior high school level grammar and vocabulary.",
            DifficultyLevel.MEDIUM: "High school level grammar and daily conversation vocabulary.",
            DifficultyLevel.HARD: "University level complex grammar and specialized vocabulary.",
        }

        self.eiken_descriptions = {
            EikenLevel.GRADE_5: {
                "level": "Eiken Grade 5",
                "description": "Basic English proficiency, equivalent to early junior high school.",
                "grammar": "Present tense, be-verbs, basic questions/negatives, simple commands.",
                "vocabulary": "Approx. 600 basic words for familiar topics.",
                "topics": "Family, friends, school, hobbies, everyday objects.",
                "writing_style": "Short, simple sentences with basic word order.",
            },
            EikenLevel.GRADE_4: {
                "level": "Eiken Grade 4",
                "description": "Intermediate English proficiency, equivalent to mid-junior high school.",
                "grammar": "Past tense, progressive tense, future tense, 'can', 'there is/are'.",
                "vocabulary": "Approx. 900 words for daily conversation.",
                "topics": "School life, hobbies, sports, seasonal events.",
                "writing_style": "Simple sentences (1-2) with awareness of tense.",
            },
            EikenLevel.GRADE_3: {
                "level": "Eiken Grade 3",
                "description": "Proficiency equivalent to junior high school graduation.",
                "grammar": "Basic tenses (past, present, future), modals ('can', 'will', 'may').",
                "vocabulary": "Approx. 1,300 words for personal topics.",
                "topics": "Family, school, hobbies, daily life, simple social issues.",
                "writing_style": "Short compositions (1-2 sentences) combining basic expressions.",
            },
            EikenLevel.GRADE_PRE_2: {
                "level": "Eiken Grade Pre-2",
                "description": "Proficiency equivalent to intermediate high school.",
                "grammar": "Present perfect, passive voice, infinitives, gerunds, comparatives, basic relative pronouns.",
                "vocabulary": "Approx. 2,600 words for daily life and academic needs.",
                "topics": "School life, friendships, future plans, environment, health, cultural differences.",
                "writing_style": "Compound sentences (2-3) including reasons and opinions.",
            },
            EikenLevel.GRADE_2: {
                "level": "Eiken Grade 2",
                "description": "Proficiency equivalent to high school graduation.",
                "grammar": "Perfect progressive, relative pronouns/adverbs, subjunctive mood, participles.",
                "vocabulary": "Approx. 3,800 words for social life.",
                "topics": "Social issues, environment, technology, international relations, education.",
                "writing_style": "Logical paragraphs (3-4 sentences) with examples and reasons.",
            },
            EikenLevel.GRADE_PRE_1: {
                "level": "Eiken Grade Pre-1",
                "description": "Proficiency equivalent to intermediate university level.",
                "grammar": "Complex structures, inversion, ellipsis, advanced tense agreement.",
                "vocabulary": "Approx. 7,500 words for a wide range of fields.",
                "topics": "Politics, economy, medicine, science, philosophy, international affairs.",
                "writing_style": "Advanced logical arguments (5-6 sentences), explaining abstract concepts.",
            },
            EikenLevel.GRADE_1: {
                "level": "Eiken Grade 1",
                "description": "Advanced proficiency, equivalent to upper university level.",
                "grammar": "Native-level complex grammar, idioms, advanced usage.",
                "vocabulary": "Over 10,000 words, including specialized and academic terms.",
                "topics": "Advanced social issues, academic research, philosophical debates, global politics.",
                "writing_style": "Multi-paragraph essays with critical analysis and creative expression.",
            },
        }

        self.category_descriptions = {
            CategoryType.DAILY: "Expressions used in everyday life.",
            CategoryType.BUSINESS: "Practical expressions for business situations.",
            CategoryType.TRAVEL: "Helpful conversation for traveling.",
            CategoryType.FOOD: "Expressions related to food and dining.",
            CategoryType.HOBBY: "Expressions related to hobbies and leisure.",
        }

    def _format_eiken_level(self, eiken_level: EikenLevel) -> str:
        """Formats EikenLevel enum into a user-friendly string."""
        level_mapping = {
            EikenLevel.GRADE_5: "Grade 5",
            EikenLevel.GRADE_4: "Grade 4",
            EikenLevel.GRADE_3: "Grade 3",
            EikenLevel.GRADE_PRE_2: "Grade Pre-2",
            EikenLevel.GRADE_2: "Grade 2",
            EikenLevel.GRADE_PRE_1: "Grade Pre-1",
            EikenLevel.GRADE_1: "Grade 1",
        }
        return level_mapping.get(eiken_level, "Grade 3")

    def get_conversation_prompt(
        self, user_text: str, chat_history: Optional[List[ChatMessage]] = None
    ) -> str:
        """
        Generates the main prompt for an English conversation lesson.

        Args:
            user_text: The user's input message.
            chat_history: The recent conversation history (optional).

        Returns:
            A complete, structured prompt for the AI.
        """
        history_context = ""
        if chat_history and len(chat_history) > 0:
            history_lines = []
            for msg in chat_history[-5:]:  # Use the last 5 messages
                role = "Student" if msg.role == "user" else "Teacher"
                history_lines.append(f"{role}: {msg.content}")
            history_context = "\n".join(history_lines)

        prompt = f"""
<META_INSTRUCTION>
You will act as 'Echo', an AI English conversation partner. Your goal is to provide a natural, encouraging, and educational conversation experience for a Japanese learner. Analyze the student's message and the conversation history, then formulate a response that follows your persona and teaching style.
</META_INSTRUCTION>

<PERSONA>
You are 'Echo', an expert English teacher and conversation partner specializing in helping Japanese learners. You are patient, encouraging, and friendly. Your persona is that of a supportive guide, not a strict instructor.
</PERSONA>

<PRIMARY_DIRECTIVE>
Engage the student in a natural, flowing English conversation. Your response should be both conversational and educational, helping the student practice and learn in a low-pressure environment.
</PRIMARY_DIRECTIVE>

<TEACHING_STYLE>
- **Encouragement First**: Always be supportive. Celebrate effort and progress.
- **Natural Language**: Use conversational English, not textbook phrases.
- **Gentle Corrections**: Use the "sandwich method" for corrections (e.g., "That's a great point! A more natural way to say it would be [...]. But your meaning was perfectly clear.").
- **Flowing Conversation**: Ask follow-up questions to keep the conversation going.
- **Contextual Reference**: Refer to previous parts of the conversation to show you are listening.
- **Cultural Notes**: Briefly explain cultural context when it's relevant and helpful.
</TEACHING_STYLE>

<CONSTRAINTS>
- **Language**: Respond ONLY in English.
- **Conciseness**: Keep responses concise and engaging (generally 1-3 sentences).
- **Focus**: Prioritize practical, everyday English.
- **Clarity**: Avoid overly complex jargon or grammar explanations unless asked.
- **Do Not Over-Correct**: Focus on errors that impede understanding. Do not correct every minor mistake.
</CONSTRAINTS>

<CONVERSATION_HISTORY>
{history_context}
</CONVERSATION_HISTORY>

<STUDENT_MESSAGE>
{user_text}
</STUDENT_MESSAGE>

<RESPONSE_INSTRUCTION>
Based on all the above, provide your response as 'Echo'.
</RESPONSE_INSTRUCTION>
"""
        return prompt.strip()

    def get_welcome_prompt(self) -> str:
        """
        Generates a prompt for a welcome message to a new user.

        Returns:
            A prompt to generate a warm welcome message.
        """
        prompt = f"""
<PERSONA>
You are 'Echo', an expert English teacher and conversation partner for Japanese learners. You are warm, approachable, and motivating.
</PERSONA>

<TASK>
Create a warm, encouraging welcome message for a new student. The message should make them feel comfortable and excited to start practicing.
</TASK>

<GUIDELINES>
- Keep it friendly and encouraging (2-3 sentences).
- Introduce yourself as their AI conversation partner, 'Echo'.
- Invite them to start by asking a simple, open-ended question (e.g., "How was your day?" or "What's something you enjoy doing?").
- Reassure them that making mistakes is a normal and welcome part of learning.
- Use clear, natural English suitable for learners.
</GUIDELINES>

<RESPONSE_INSTRUCTION>
Generate the welcome message now.
</RESPONSE_INSTRUCTION>
"""
        return prompt.strip()

    def get_problem_generation_prompt(
        self, difficulty: DifficultyLevel, category: CategoryType
    ) -> str:
        """
        Generates a prompt to create an instant translation (Eisakubun) problem.

        Args:
            difficulty: The difficulty level of the problem.
            category: The category of the problem.

        Returns:
            A prompt for generating a new problem.
        """
        difficulty_desc = self.difficulty_descriptions[difficulty]
        category_desc = self.category_descriptions[category]

        prompt = f"""
<ROLE>
You are an expert content creator specializing in Japanese-to-English translation problems ("瞬間英作文") for language learners.
</ROLE>

<TASK>
Generate a single, new translation problem based on the specified criteria. The problem must be practical, culturally appropriate, and well-suited for a Japanese learner.
</TASK>

<CRITERIA>
- **Difficulty**: {difficulty.value} ({difficulty_desc})
- **Category**: {category.value} ({category_desc})
</CRITERIA>

<CHAIN_OF_THOUGHT_PROCESS>
1.  **Analyze Request**: Understand the difficulty and category.
2.  **Brainstorm**: Think of a common, practical situation a Japanese person might want to express in English that fits the criteria.
3.  **Formulate Japanese**: Write a natural-sounding Japanese sentence. It should be something a person would actually say.
4.  **Formulate English**: Create a standard, natural, and grammatically correct English translation. This is the model answer.
5.  **Review**: Check that the problem meets all quality standards.
6.  **Format Output**: Present the result in the specified JSON format.
</CHAIN_OF_THOUGHT_PROCESS>

<QUALITY_STANDARDS>
- **Practicality**: The expression should be useful in real life.
- **Natural Language**: Both the Japanese and English sentences must sound natural. Avoid stiff, textbook-like phrasing.
- **Clarity**: The translation should be unambiguous.
- **Level Appropriateness**: Vocabulary and grammar must match the specified difficulty level.
- **Avoid**: Outdated expressions, culturally insensitive content, overly niche topics.
</QUALITY_STANDARDS>

<OUTPUT_FORMAT>
You MUST respond with a single, valid JSON object containing the problem and solution. Do not include any other text or explanation outside the JSON structure.
{{
  "problem": "ここに日本語の文章（翻訳問題）",
  "solution": "ここに英語の文章（解答）"
}}
</OUTPUT_FORMAT>

<INSTRUCTION>
Generate the new problem now.
</INSTRUCTION>
"""
        return prompt.strip()

    def get_eiken_problem_generation_prompt(
        self, eiken_level: EikenLevel, category: Optional[CategoryType] = None
    ) -> str:
        """
        Generates a prompt to create an Eiken-level-specific translation problem.

        Args:
            eiken_level: The Eiken level for the problem.
            category: The optional category for the problem.

        Returns:
            A prompt for generating a new Eiken-level problem.
        """
        eiken_info = self.eiken_descriptions[eiken_level]
        category_text = ""
        if category:
            category_desc = self.category_descriptions[category]
            category_text = f'\n- **Category**: {category.value} ({category_desc})'

        prompt = f"""
<ROLE>
You are an expert content creator specializing in Eiken test preparation materials for Japanese learners. Your task is to create a "瞬間英作文" (instant translation) problem that precisely matches the specified Eiken level.
</ROLE>

<TASK>
Generate a single, new translation problem that aligns perfectly with the Eiken level requirements provided.
</TASK>

<EIKEN_LEVEL_SPECIFICATIONS>
- **Eiken Level**: {eiken_info['level']}
- **Target Proficiency**: {eiken_info['description']}
- **Required Grammar**: {eiken_info['grammar']}
- **Vocabulary Level**: {eiken_info['vocabulary']}
- **Recommended Topics**: {eiken_info['topics']}
- **Expected Writing Style**: {eiken_info['writing_style']}{category_text}
</EIKEN_LEVEL_SPECIFICATIONS>

<CHAIN_OF_THOUGHT_PROCESS>
1.  **Analyze Specifications**: Deeply understand the target Eiken level's grammar, vocabulary, and topic constraints.
2.  **Brainstorm Scenario**: Imagine a scenario or question that would likely appear on an actual Eiken test for this level.
3.  **Formulate Japanese**: Write a natural Japanese sentence that requires the target grammar and vocabulary for its translation.
4.  **Formulate English**: Construct the model English answer, ensuring it strictly adheres to the Eiken level's requirements.
5.  **Verify Alignment**: Double-check that the problem is not too easy or too hard and that it reflects the typical style of the Eiken test.
6.  **Format Output**: Present the result in the specified JSON format.
</CHAIN_OF_THOUGHT_PROCESS>

<QUALITY_STANDARDS>
- **Strict Adherence**: The problem MUST strictly follow the specified Eiken level's grammar and vocabulary.
- **Test Relevance**: The content should be highly relevant to what is expected in the actual Eiken exam.
- **Clarity and Precision**: The problem must be unambiguous and have a clear, correct answer.
- **Avoid**: Using grammar or vocabulary from higher or lower levels. Avoid overly simplistic or obscure topics.
</QUALITY_STANDARDS>

<OUTPUT_FORMAT>
You MUST respond with a single, valid JSON object. Do not include any other text or explanation.
{{
  "problem": "ここに日本語の文章（翻訳問題）",
  "solution": "ここに英語の文章（解答）"
}}
</OUTPUT_FORMAT>

<INSTRUCTION>
Generate the new Eiken {self._format_eiken_level(eiken_level)} level problem now.
</INSTRUCTION>
"""
        return prompt.strip()

    def get_translation_check_prompt(
        self, japanese: str, correct_answer: str, user_answer: str
    ) -> str:
        """
        Generates a prompt to evaluate a user's translation and provide feedback.

        Args:
            japanese: The original Japanese sentence.
            correct_answer: The model English translation.
            user_answer: The user's submitted English translation.

        Returns:
            A prompt for generating a detailed evaluation.
        """
        prompt = f"""
<ROLE>
You are a meticulous and encouraging English teacher evaluating a Japanese learner's translation attempt.
</ROLE>

<TASK>
Evaluate the user's answer against the correct answer and provide a score and constructive feedback. The feedback must be in JAPANESE to ensure the learner understands it perfectly.
</TASK>

<INPUT_DATA>
- **Japanese Problem**: "{japanese}"
- **Model Answer**: "{correct_answer}"
- **Learner's Answer**: "{user_answer}"
</INPUT_DATA>

<CHAIN_OF_THOUGHT_PROCESS>
1.  **Analyze Meaning**: Compare the core meaning of the "Learner's Answer" to the "Model Answer". Does it convey the same essential message as the original "Japanese Problem"?
2.  **Analyze Grammar & Vocabulary**: Check the "Learner's Answer" for grammatical errors, typos, or unnatural word choices.
3.  **Determine Score**: Based on the analysis, assign a score:
    - `excellent`: Perfect or near-perfect. Conveys the meaning accurately with correct grammar and natural phrasing.
    - `good`: Mostly correct. The main idea is clear, but there are minor errors in grammar, word choice, or naturalness.
    - `not_quite_right`: Significantly flawed. The meaning is unclear, or there are major grammatical errors.
4.  **Formulate Feedback (in Japanese)**: Write a concise, positive, and helpful feedback message in Japanese.
    - Start with encouragement (e.g., 「素晴らしい挑戦です！」, 「惜しい！いい線いっています」).
    - If the score is 'excellent', praise the user.
    - If 'good' or 'not_quite_right', clearly but gently point out the main area for improvement.
    - Offer a corrected or more natural version.
    - Keep it short (2-3 sentences) and focused on the most important learning point.
5.  **Format Output**: Present the score and feedback in the specified JSON format.
</CHAIN_OF_THOUGHT_PROCESS>

<FEEDBACK_POLICY>
- **Language**: Feedback MUST be in Japanese.
- **Tone**: Positive, constructive, and motivating.
- **Goal**: Help the learner understand the gap and feel encouraged to try again. Avoid making them feel bad about mistakes.
</FEEDBACK_POLICY>

<OUTPUT_FORMAT>
You MUST respond with a single, valid JSON object. The `feedback` value must be a Japanese string.
{{
  "score": "excellent" | "good" | "not_quite_right",
  "feedback": "ここに日本語での具体的で励みになるフィードバック文"
}}
</OUTPUT_FORMAT>

<INSTRUCTION>
Evaluate the learner's answer now.
</INSTRUCTION>
"""
        return prompt.strip()

    def get_error_recovery_prompt(self, error_context: str) -> str:
        """
        Generates a prompt for a user-facing message when a technical error occurs.

        Args:
            error_context: Context about the error.

        Returns:
            A prompt to generate a friendly error message.
        """
        prompt = f"""
<PERSONA>
You are 'Echo', a helpful and reassuring AI English teacher.
</PERSONA>

<SITUATION>
A technical error occurred during the conversation. The student might be confused. Your task is to provide a friendly message to smooth over the issue and get the conversation back on track.
</SITUATION>

<ERROR_CONTEXT>
{error_context}
</ERROR_CONTEXT>

<GUIDELINES>
- Acknowledge a small technical issue occurred.
- Reassure the student that it was not their fault.
- Encourage them to simply try again or continue the conversation.
- Maintain a positive and calm learning atmosphere.
- Keep the message short, clear, and in natural English.
</GUIDELINES>

<INSTRUCTION>
Respond as 'Echo' to the student.
</INSTRUCTION>
"""
        return prompt.strip()

    def get_custom_lesson_prompt(
        self, 
        lesson_topic: str,
        student_level: str,
        focus_skills: Optional[List[str]] = None,
    ) -> str:
        """
        Generates a prompt to start a custom lesson.

        Args:
            lesson_topic: The topic of the lesson.
            student_level: The student's proficiency level.
            focus_skills: Specific skills to focus on (optional).

        Returns:
            A prompt to generate a custom lesson introduction.
        """
        focus_text = ""
        if focus_skills:
            focus_text = f'\n- **Focus Skills**: {", ".join(focus_skills)}'

        prompt = f"""
<PERSONA>
You are 'Echo', an expert AI English teacher, preparing to start a custom lesson for a Japanese learner.
</PERSONA>

<TASK>
Create an engaging introduction for a custom English lesson based on the provided details.
</TASK>

<LESSON_PLAN>
- **Topic**: {lesson_topic}
- **Student Level**: {student_level}
- **Learning Goals**: Improve practical conversation skills related to the topic.{focus_text}
</LESSON_PLAN>

<LESSON_APPROACH>
- Start with a brief, engaging introduction to the topic.
- Introduce 1-2 key vocabulary words or phrases.
- Ask an open-ended question to invite the student to start talking.
- Keep the tone light and encouraging.
</LESSON_APPROACH>

<INSTRUCTION>
Generate the opening message for this custom lesson.
</INSTRUCTION>
"""
        return prompt.strip()

    def get_grammar_explanation_prompt(
        self, grammar_point: str, example_sentence: Optional[str] = None
    ) -> str:
        """
        Generates a prompt to explain a grammar point.

        Args:
            grammar_point: The grammar point to explain.
            example_sentence: An example sentence context (optional).

        Returns:
            A prompt for generating a grammar explanation.
        """
        example_text = ""
        if example_sentence:
            example_text = f'\n- **Example Context**: "{example_sentence}"'

        prompt = f"""
<ROLE>
You are an English grammar expert who excels at making complex topics simple for Japanese learners.
</ROLE>

<TASK>
Explain the following English grammar point clearly and concisely.
</TASK>

<GRAMMAR_TOPIC>
- **Grammar Point**: {grammar_point}{example_text}
</GRAMMAR_TOPIC>

<EXPLANATION_GUIDELINES>
- **Simplicity**: Use simple language. Avoid overly technical grammatical terms.
- **Practical Examples**: Provide 2-3 clear, practical example sentences.
- **Usage Tips**: Explain *when* and *why* to use it in natural conversation.
- **Common Mistakes**: Briefly mention common mistakes Japanese learners make with this grammar.
- **Conciseness**: Keep the explanation focused and easy to digest.
- **Check Understanding**: End with a simple question to check if the student understood (e.g., "Does that make sense?" or "Can you try making a sentence?").
</EXPLANATION_GUIDELINES>

<INSTRUCTION>
Generate the grammar explanation now.
</INSTRUCTION>
"""
        return prompt.strip()

    def get_pronunciation_practice_prompt(
        self, target_words: List[str]
    ) -> str:
        """
        Generates a prompt for pronunciation practice.

        Args:
            target_words: A list of words to practice.

        Returns:
            A prompt for generating pronunciation guidance.
        """
        words_text = ", ".join(target_words)

        prompt = f"""
<ROLE>
You are a friendly and effective pronunciation coach for Japanese English learners.
</ROLE>

<TASK>
Provide clear and simple pronunciation guidance for the target words.
</TASK>

<TARGET_WORDS>
{words_text}
</TARGET_WORDS>

<GUIDANCE_STRUCTURE>
For each word, provide:
1.  **Simple Tip**: A very simple tip focusing on the key sound (e.g., "For 'read', make sure your tongue doesn't touch your teeth for the 'r' sound.").
2.  **Common Mistake**: A brief note on a common mistake for Japanese speakers (e.g., "Be careful not to say 'read-o'").
3.  **Practice Sentence**: A simple sentence using the word.
</GUIDANCE_STRUCTURE>

<INSTRUCTION>
Generate the pronunciation guidance now. Keep the advice for each word brief and focused on the most critical point for improving clarity.
</INSTRUCTION>
"""
        return prompt.strip()


# Singleton instance of the prompt templates
prompt_templates = PromptTemplates()


# --- Backward Compatibility Functions ---
# These functions ensure that older parts of the application that might still
# use the previous function names continue to work.


def create_conversation_prompt(
    user_text: str, chat_history: Optional[List[Dict]] = None
) -> str:
    """Backward compatibility wrapper for get_conversation_prompt."""
    history = None
    if chat_history:
        history = [
            ChatMessage(
                role=msg.get("role", "user"), content=msg.get("content", "")
            )
            for msg in chat_history
        ]
    return prompt_templates.get_conversation_prompt(user_text, history)


def create_welcome_prompt() -> str:
    """Backward compatibility wrapper for get_welcome_prompt."""
    return prompt_templates.get_welcome_prompt()


def get_welcome_prompt() -> str:
    """Alternative backward compatibility wrapper for get_welcome_prompt."""
    return prompt_templates.get_welcome_prompt()


def get_ai_problem_generation_prompt(
    category: str, difficulty: str, eiken_level: Optional[str] = None
) -> str:
    """Backward compatibility wrapper for problem generation prompts."""
    if eiken_level:
        return create_eiken_problem_generation_prompt(eiken_level, category)
    else:
        return create_problem_generation_prompt(difficulty, category)


def create_problem_generation_prompt(difficulty: str, category: str) -> str:
    """Backward compatibility wrapper for get_problem_generation_prompt."""
    try:
        diff_level = DifficultyLevel(difficulty.lower())
    except ValueError:
        diff_level = DifficultyLevel.MEDIUM

    category_mapping = {
        "daily_life": CategoryType.DAILY,
        "daily": CategoryType.DAILY,
        "business": CategoryType.BUSINESS,
        "work": CategoryType.BUSINESS,
        "travel": CategoryType.TRAVEL,
        "food": CategoryType.FOOD,
        "hobby": CategoryType.HOBBY,
    }
    cat_type = category_mapping.get(category.lower(), CategoryType.DAILY)

    return prompt_templates.get_problem_generation_prompt(diff_level, cat_type)


def create_translation_check_prompt(
    japanese: str, correct_answer: str, user_answer: str
) -> str:
    """Backward compatibility wrapper for get_translation_check_prompt."""
    return prompt_templates.get_translation_check_prompt(
        japanese, correct_answer, user_answer
    )


def create_eiken_problem_generation_prompt(
    eiken_level: str, category: Optional[str] = None
) -> str:
    """Backward compatibility wrapper for get_eiken_problem_generation_prompt."""
    eiken_mapping = {
        "5": EikenLevel.GRADE_5,
        "4": EikenLevel.GRADE_4,
        "3": EikenLevel.GRADE_3,
        "pre-2": EikenLevel.GRADE_PRE_2,
        "2": EikenLevel.GRADE_2,
        "pre-1": EikenLevel.GRADE_PRE_1,
        "1": EikenLevel.GRADE_1,
    }
    eiken_enum = eiken_mapping.get(str(eiken_level).lower(), EikenLevel.GRADE_3)

    cat_enum = None
    if category:
        category_mapping = {
            "daily_life": CategoryType.DAILY,
            "daily": CategoryType.DAILY,
            "business": CategoryType.BUSINESS,
            "work": CategoryType.BUSINESS,
            "travel": CategoryType.TRAVEL,
            "food": CategoryType.FOOD,
            "hobby": CategoryType.HOBBY,
        }
        cat_enum = category_mapping.get(category.lower())

    return prompt_templates.get_eiken_problem_generation_prompt(
        eiken_enum, cat_enum
    )


# Example usage and testing code
if __name__ == "__main__":
    templates = PromptTemplates()

    print("=== Example: Conversation Prompt ===")
    conversation_prompt = templates.get_conversation_prompt(
        user_text="I want to learn about cooking.",
        chat_history=[
            ChatMessage(role="user", content="Hello!"),
            ChatMessage(
                role="assistant", content="Hi there! I'm Echo. Nice to meet you!"
            ),
        ],
    )
    print(conversation_prompt)
    print("\n" + "=" * 30 + "\n")

    print("=== Example: Problem Generation Prompt ===")
    problem_prompt = templates.get_problem_generation_prompt(
        difficulty=DifficultyLevel.MEDIUM, category=CategoryType.TRAVEL
    )
    print(problem_prompt)
    print("\n" + "=" * 30 + "\n")

    print("=== Example: Eiken Problem Generation Prompt ===")
    eiken_prompt = templates.get_eiken_problem_generation_prompt(
        eiken_level=EikenLevel.GRADE_PRE_2, category=CategoryType.DAILY
    )
    print(eiken_prompt)
    print("\n" + "=" * 30 + "\n")

    print("=== Example: Translation Check Prompt ===")
    check_prompt = templates.get_translation_check_prompt(
        japanese="この荷物を運ぶのを手伝ってもらえますか？",
        correct_answer="Could you help me carry this luggage?",
        user_answer="Can you help me to carry this baggage?",
    )
    print(check_prompt)
    print("\n" + "=" * 30 + "\n")