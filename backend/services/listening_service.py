"""
Listening practice service for audio-based learning exercises.
"""

import asyncio
import random
from typing import Any, Dict

from models import ListeningProblem


def get_trivia_categories() -> Dict[int, str]:
    """トリビアAPIのカテゴリマッピングを返す"""
    return {
        9: "General Knowledge",
        10: "Books",
        11: "Film", 
        12: "Music",
        14: "Television",
        15: "Video Games",
        16: "Board Games",
        17: "Science & Nature",
        18: "Computer Science",
        19: "Mathematics", 
        20: "Mythology",
        21: "Sports",
        22: "Geography",
        23: "History",
        24: "Politics",
        25: "Art",
        26: "Celebrities",
        27: "Animals",
        28: "Vehicles"
    }


async def fetch_trivia_question() -> ListeningProblem:
    """
    トリビアAPIから問題を取得し、ListeningProblem形式で返す
    
    Returns:
        ListeningProblem: リスニング練習用の問題
    """
    import httpx
    
    categories = get_trivia_categories()
    category_id = random.choice(list(categories.keys()))
    
    url = f"https://opentdb.com/api.php?amount=1&category={category_id}&type=multiple"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            data = response.json()
            
            if data["response_code"] == 0 and data["results"]:
                question_data = data["results"][0]
                
                # HTML entities のデコード
                import html
                question = html.unescape(question_data["question"])
                correct_answer = html.unescape(question_data["correct_answer"])
                incorrect_answers = [html.unescape(ans) for ans in question_data["incorrect_answers"]]
                
                # 答えの選択肢をシャッフル
                all_answers = [correct_answer] + incorrect_answers
                random.shuffle(all_answers)
                
                return ListeningProblem(
                    id=f"trivia_{random.randint(1000, 9999)}",
                    question=question,
                    correct_answer=correct_answer,
                    choices=all_answers,
                    category=categories.get(category_id, "General"),
                    difficulty=question_data["difficulty"],
                    explanation=f"This is a {question_data['difficulty']} level question from {categories.get(category_id, 'General')} category."
                )
    except Exception as e:
        print(f"Error fetching trivia question: {e}")
        # フォールバック問題を返す
        return ListeningProblem(
            id="fallback_001",
            question="What is the capital of Japan?",
            correct_answer="Tokyo",
            choices=["Tokyo", "Osaka", "Kyoto", "Hiroshima"],
            category="Geography",
            difficulty="easy",
            explanation="This is a basic geography question about Japan."
        )
