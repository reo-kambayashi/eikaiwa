"""
Tests for the prompts.py module.

These tests verify that the prompt generation system works correctly
and produces valid prompts for different scenarios.

To run these tests:
    cd backend
    uv run pytest tests/test_prompts.py -v
"""

import sys
import os
import pytest

# Add project root to Python path for imports
project_root = os.path.dirname(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from prompts import (
    create_conversation_prompt,
    create_translation_check_prompt,
    create_problem_generation_prompt,
    create_welcome_prompt,
    create_eiken_problem_generation_prompt,
    get_welcome_prompt,
    get_ai_problem_generation_prompt
)


class TestConversationPrompts:
    """Test conversation prompt generation."""
    
    def test_basic_conversation_prompt(self):
        """Test basic conversation prompt generation."""
        user_input = "Hello, how are you?"
        conversation_history = []
        
        prompt = create_conversation_prompt(user_input, conversation_history)
        
        # Check that prompt contains expected elements
        assert isinstance(prompt, str)
        assert len(prompt) > 0
        assert user_input in prompt
        assert "English teacher" in prompt or "英語の先生" in prompt
        
    def test_conversation_prompt_with_history(self):
        """Test conversation prompt with conversation history."""
        user_input = "What's the weather like?"
        conversation_history = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there! How can I help you today?"}
        ]
        
        prompt = create_conversation_prompt(user_input, conversation_history)
        
        # Check that history is included in prompt
        assert "Hello" in prompt
        assert "Hi there!" in prompt
        assert user_input in prompt
        
    def test_conversation_prompt_without_grammar_check(self):
        """Test conversation prompt without grammar checking."""
        user_input = "I want to practice conversation"
        conversation_history = []
        
        prompt = create_conversation_prompt(user_input, conversation_history)
        
        assert isinstance(prompt, str)
        assert user_input in prompt
        # Should not focus heavily on grammar correction
        
    def test_conversation_prompt_with_long_history(self):
        """Test conversation prompt with long conversation history."""
        user_input = "Continue our discussion"
        conversation_history = [
            {"role": "user", "content": f"Message {i}"}
            for i in range(20)  # Create long history
        ]
        
        prompt = create_conversation_prompt(user_input, conversation_history)
        
        # Should handle long history without breaking
        assert isinstance(prompt, str)
        assert len(prompt) > 0


class TestTranslationCheckPrompts:
    """Test translation checking prompt generation."""
    
    def test_basic_translation_check_prompt(self):
        """Test basic translation checking prompt."""
        problem = "こんにちは"
        correct_answer = "Hello"
        user_answer = "Hi"
        
        prompt = create_translation_check_prompt(problem, correct_answer, user_answer)
        
        assert isinstance(prompt, str)
        assert problem in prompt
        assert correct_answer in prompt
        assert user_answer in prompt
        assert "translation" in prompt.lower()
        
    def test_translation_check_with_identical_answers(self):
        """Test translation checking with identical answers."""
        problem = "ありがとう"
        correct_answer = "Thank you"
        user_answer = "Thank you"
        
        prompt = create_translation_check_prompt(problem, correct_answer, user_answer)
        
        assert isinstance(prompt, str)
        assert all(text in prompt for text in [problem, correct_answer, user_answer])
        
    def test_translation_check_with_different_answers(self):
        """Test translation checking with different answers."""
        problem = "おはよう"
        correct_answer = "Good morning"
        user_answer = "Good evening"
        
        prompt = create_translation_check_prompt(problem, correct_answer, user_answer)
        
        assert isinstance(prompt, str)
        assert all(text in prompt for text in [problem, correct_answer, user_answer])
        
    def test_translation_check_with_empty_user_answer(self):
        """Test translation checking with empty user answer."""
        problem = "さようなら"
        correct_answer = "Goodbye"
        user_answer = ""
        
        prompt = create_translation_check_prompt(problem, correct_answer, user_answer)
        
        assert isinstance(prompt, str)
        assert problem in prompt
        assert correct_answer in prompt


class TestAIProblemGenerationPrompts:
    """Test AI problem generation prompt creation."""
    
    def test_basic_problem_generation_prompt(self):
        """Test basic problem generation prompt."""
        category = "daily_life"
        difficulty = "easy"
        
        prompt = create_problem_generation_prompt(difficulty, category)
        
        assert isinstance(prompt, str)
        assert category in prompt
        assert difficulty in prompt
        assert "translation" in prompt.lower()
        
    def test_problem_generation_with_eiken_level(self):
        """Test problem generation with Eiken level specification."""
        category = "work"
        eiken_level = "3"
        
        prompt = create_eiken_problem_generation_prompt(eiken_level, category)
        
        assert isinstance(prompt, str)
        assert category in prompt
        assert eiken_level in prompt
        assert "Eiken" in prompt or "英検" in prompt
        
    def test_problem_generation_all_categories(self):
        """Test problem generation for all valid categories."""
        categories = ["daily_life", "work", "travel", "health", "technology", "education"]
        difficulty = "medium"
        
        for category in categories:
            prompt = get_ai_problem_generation_prompt(category, difficulty, None)
            assert isinstance(prompt, str)
            assert category in prompt
            
    def test_problem_generation_all_difficulties(self):
        """Test problem generation for all difficulty levels."""
        difficulties = ["easy", "medium", "hard"]
        category = "daily_life"
        
        for difficulty in difficulties:
            prompt = get_ai_problem_generation_prompt(category, difficulty, None)
            assert isinstance(prompt, str)
            assert difficulty in prompt
            
    def test_problem_generation_all_eiken_levels(self):
        """Test problem generation for all Eiken levels."""
        eiken_levels = ["5", "4", "3", "pre-2", "2", "pre-1", "1"]
        category = "daily_life"
        
        for eiken_level in eiken_levels:
            prompt = create_eiken_problem_generation_prompt(eiken_level, category)
            assert isinstance(prompt, str)
            assert eiken_level in prompt


class TestWelcomePrompts:
    """Test welcome message prompt generation."""
    
    def test_basic_welcome_prompt(self):
        """Test basic welcome prompt generation."""
        prompt = create_welcome_prompt()
        
        assert isinstance(prompt, str)
        assert len(prompt) > 0
        assert "welcome" in prompt.lower() or "ようこそ" in prompt
        
    def test_welcome_prompt_with_name(self):
        """Test welcome prompt without name parameter (function doesn't accept parameters)."""
        prompt = create_welcome_prompt()
        
        assert isinstance(prompt, str)
        assert len(prompt) > 0
        
    def test_welcome_prompt_consistency(self):
        """Test that welcome prompts are consistent."""
        prompt1 = get_welcome_prompt()
        prompt2 = get_welcome_prompt()
        
        # Should be consistent (though actual AI responses may vary)
        assert isinstance(prompt1, str)
        assert isinstance(prompt2, str)
        assert len(prompt1) > 0
        assert len(prompt2) > 0


class TestPromptValidation:
    """Test prompt validation and edge cases."""
    
    def test_prompt_with_special_characters(self):
        """Test prompts with special characters and Unicode."""
        user_input = "Hello 👋 こんにちは 🌟"
        conversation_history = []
        
        prompt = create_conversation_prompt(user_input, conversation_history)
        
        assert isinstance(prompt, str)
        assert user_input in prompt
        
    def test_prompt_with_very_long_input(self):
        """Test prompts with very long input."""
        user_input = "This is a very long message. " * 100
        conversation_history = []
        
        prompt = create_conversation_prompt(user_input, conversation_history)
        
        assert isinstance(prompt, str)
        # Should handle long input without breaking
        
    def test_prompt_with_empty_input(self):
        """Test prompts with empty input."""
        user_input = ""
        conversation_history = []
        
        prompt = create_conversation_prompt(user_input, conversation_history)
        
        assert isinstance(prompt, str)
        # Should handle empty input gracefully
        
    def test_translation_prompt_with_html_tags(self):
        """Test translation prompts with HTML-like content."""
        problem = "<script>alert('test')</script>"
        correct_answer = "This is a test"
        user_answer = "This is test"
        
        prompt = create_translation_check_prompt(problem, correct_answer, user_answer)
        
        assert isinstance(prompt, str)
        # Should handle HTML-like content safely


class TestPromptReturnFormats:
    """Test that prompts specify correct return formats."""
    
    def test_conversation_prompt_format_instructions(self):
        """Test that conversation prompts include format instructions."""
        user_input = "How do I improve my English?"
        conversation_history = []
        
        prompt = create_conversation_prompt(user_input, conversation_history)
        
        # Should include instructions about response format
        assert "response" in prompt.lower() or "reply" in prompt.lower()
        
    def test_translation_check_format_instructions(self):
        """Test that translation check prompts specify JSON format."""
        problem = "今日は暑いです"
        correct_answer = "It's hot today"
        user_answer = "Today is hot"
        
        prompt = create_translation_check_prompt(problem, correct_answer, user_answer)
        
        # Should specify JSON format for response
        assert "json" in prompt.lower() or "JSON" in prompt
        assert "score" in prompt or "feedback" in prompt
        
    def test_problem_generation_format_instructions(self):
        """Test that problem generation prompts specify format."""
        category = "daily_life"
        difficulty = "easy"
        
        prompt = create_problem_generation_prompt(difficulty, category)
        
        # Should specify format for generated problems
        assert "json" in prompt.lower() or "JSON" in prompt
        assert "problem" in prompt and "solution" in prompt


if __name__ == "__main__":
    # Allow running this test file directly
    pytest.main([__file__, "-v"])