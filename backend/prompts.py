# -*- coding: utf-8 -*-
"""
AI英会話練習アプリ用プロンプトテンプレート集
==============================================

このファイルには、英語学習支援アプリで使用される全てのプロンプトテンプレートが
統合されています。プロンプトの管理と編集を容易にするため、機能別に整理されています。

使用方法:
  from prompts import PromptTemplates
  templates = PromptTemplates()
  prompt = templates.get_conversation_prompt(user_text="Hello", history=chat_history)
"""

from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum


class DifficultyLevel(Enum):
    """難易度レベル定義"""

    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class EikenLevel(Enum):
    """英検レベル定義（3級〜1級）"""

    GRADE_3 = "grade_3"
    GRADE_PRE_2 = "grade_pre_2"
    GRADE_2 = "grade_2"
    GRADE_PRE_1 = "grade_pre_1"
    GRADE_1 = "grade_1"


class CategoryType(Enum):
    """問題カテゴリ定義"""

    DAILY = "daily"
    BUSINESS = "business"
    TRAVEL = "travel"
    FOOD = "food"
    HOBBY = "hobby"


@dataclass
class ChatMessage:
    """チャットメッセージのデータ構造"""

    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None


class PromptTemplates:
    """
    プロンプトテンプレート管理クラス

    全てのAIプロンプトを統一的に管理し、動的に生成します。
    プロンプトの変更や追加は、このクラスを通じて行います。
    """

    def __init__(self):
        """プロンプトテンプレートの初期化"""
        self.difficulty_descriptions = {
            DifficultyLevel.EASY: "中学レベルの基本的な文法と語彙",
            DifficultyLevel.MEDIUM: "高校レベルの文法と日常会話語彙",
            DifficultyLevel.HARD: "大学レベルの複雑な文法と専門語彙",
        }

        self.eiken_descriptions = {
            EikenLevel.GRADE_3: {
                "level": "英検3級レベル",
                "description": "中学校卒業程度の英語力",
                "grammar": "現在・過去・未来の基本時制、助動詞can/will/may、基本的な疑問文・否定文",
                "vocabulary": "身近な話題の基本語彙（約1300語）",
                "topics": "家族、学校、趣味、日常生活、簡単な社会問題",
                "writing_style": "1〜2文の短い英作文、基本的な表現の組み合わせ",
            },
            EikenLevel.GRADE_PRE_2: {
                "level": "英検準2級レベル",
                "description": "高校中級程度の英語力",
                "grammar": "現在完了形、受動態、不定詞・動名詞、比較級・最上級、関係代名詞の基本",
                "vocabulary": "日常会話と学習に必要な語彙（約2600語）",
                "topics": "学校生活、友人関係、将来の夢、環境問題、健康、文化の違い",
                "writing_style": "2〜3文の複文構造、理由や意見を含む表現",
            },
            EikenLevel.GRADE_2: {
                "level": "英検2級レベル",
                "description": "高校卒業程度の英語力",
                "grammar": "完了進行形、関係代名詞・関係副詞、仮定法、分詞構文、間接疑問文",
                "vocabulary": "社会生活に必要な語彙（約3800語）",
                "topics": "社会問題、環境、科学技術、国際関係、教育、メディア、ボランティア",
                "writing_style": "3〜4文の論理的な文章、具体例や理由を含む説明",
            },
            EikenLevel.GRADE_PRE_1: {
                "level": "英検準1級レベル",
                "description": "大学中級程度の英語力",
                "grammar": "複雑な文法構造、倒置、省略、強調構文、高度な時制の一致",
                "vocabulary": "幅広い分野の語彙（約7500語）、学術的・専門的表現",
                "topics": "政治、経済、医療、科学研究、哲学、国際問題、文化論、社会制度",
                "writing_style": "5〜6文の高度な論理展開、抽象的概念の説明、批判的思考",
            },
            EikenLevel.GRADE_1: {
                "level": "英検1級レベル",
                "description": "大学上級程度の英語力",
                "grammar": "ネイティブレベルの複雑な文法、慣用表現、高度な語法",
                "vocabulary": "専門分野を含む幅広い語彙（約10000語以上）、比喩表現、学術用語",
                "topics": "高度な社会問題、学術研究、哲学的議論、国際政治、経済理論、科学論文レベル",
                "writing_style": "複数段落の高度な論述、批判的分析、創造的表現、ネイティブレベルの自然さ",
            },
        }

        self.category_descriptions = {
            CategoryType.DAILY: "日常生活でよく使われる表現",
            CategoryType.BUSINESS: "ビジネスシーンでの実用的な表現",
            CategoryType.TRAVEL: "旅行先で役立つ会話表現",
            CategoryType.FOOD: "食事や料理に関する表現",
            CategoryType.HOBBY: "趣味や娯楽に関する表現",
        }

    def get_conversation_prompt(
        self, user_text: str, chat_history: Optional[List[ChatMessage]] = None
    ) -> str:
        """
        英会話レッスン用のメインプロンプトを生成

        Args:
            user_text: ユーザーからの入力メッセージ
            chat_history: 過去の会話履歴（オプション）

        Returns:
            完全な会話プロンプト文字列
        """
        # 会話履歴をコンテキストとして構築
        history_context = ""
        if chat_history and len(chat_history) > 0:
            history_context = "\n\nCONVERSATION HISTORY:\n"
            for msg in chat_history[-5:]:  # 最新5メッセージのみ使用
                role = "Student" if msg.role == "user" else "Teacher"
                history_context += f"{role}: {msg.content}\n"
            history_context += "\nPlease reference this conversation history in your response when relevant."

        prompt = f"""You are an expert English teacher and conversation partner specializing in helping Japanese learners.

IMPORTANT GUIDELINES:
- Always be encouraging and supportive
- Use natural, conversational English
- Provide gentle corrections when needed
- Ask follow-up questions to keep the conversation flowing
- Use examples and explanations when helpful
- Reference previous parts of the conversation when relevant
- Keep responses concise and engaging (1-3 sentences)
- Focus on practical, everyday English
- Be patient and understanding of language learning challenges
- Celebrate progress and efforts, not just perfection

TEACHING STYLE:
- Use the sandwich method for corrections (positive → correction → positive)
- Provide alternative expressions when appropriate
- Explain cultural context when relevant
- Encourage natural conversation flow over perfect grammar{history_context}

CURRENT MESSAGE FROM STUDENT:
"{user_text}"

Please respond naturally as a friendly English teacher and conversation partner. Focus on maintaining engagement while providing educational value."""

        return prompt.strip()

    def get_welcome_prompt(self) -> str:
        """
        新規ユーザー向けウェルカムメッセージプロンプト

        Returns:
            ウェルカムメッセージ生成用プロンプト
        """
        prompt = """You are an expert English teacher and conversation partner specializing in helping Japanese learners.

Please create a warm, encouraging welcome message for a new student starting English conversation practice.

GUIDELINES:
- Keep it friendly and encouraging
- Mention that you're here to help with English conversation
- Invite them to start practicing by asking a question or sharing something about themselves
- Use clear, natural English that's appropriate for learners
- Show enthusiasm for helping them improve
- Keep it concise (2-3 sentences)
- Make them feel comfortable about making mistakes

TONE:
- Warm and approachable
- Professional but friendly
- Motivating and supportive

Please respond with a welcoming message to get the conversation started."""

        return prompt.strip()

    def get_problem_generation_prompt(
        self, difficulty: DifficultyLevel, category: CategoryType
    ) -> str:
        """
        瞬間英作文問題生成プロンプト

        Args:
            difficulty: 問題の難易度レベル
            category: 問題のカテゴリ

        Returns:
            問題生成用プロンプト文字列
        """
        difficulty_desc = self.difficulty_descriptions[difficulty]
        category_desc = self.category_descriptions[category]

        prompt = f"""あなたは日本人の英語学習者向けの瞬間英作文問題を作成する専門家です。

以下の条件で新しい問題を1つ作成してください：

【難易度】: {difficulty.value} - {difficulty_desc}
【カテゴリ】: {category.value} - {category_desc}

【作成条件】:
- 日本人が実際に使いそうな自然な日本語文
- 英語学習に適した実用的な表現
- 文法的に正確で自然な英語訳
- 学習者のレベルに適した語彙と文法構造
- 文化的に適切で現代的な内容
- 暗記ではなく理解を促す問題設計

【避けるべき要素】:
- 古い表現や不自然な日本語
- 複雑すぎる文法構造（難易度に応じて調整）
- 文化的に不適切な内容
- 実用性の低い表現

【出力形式】:
日本語: [日本語の文章]
英語: [対応する英語の文章]

例：
日本語: 今日は忙しい一日でした。
英語: Today was a busy day.

新しい問題を作成してください。"""

        return prompt.strip()

    def get_eiken_problem_generation_prompt(
        self, eiken_level: EikenLevel, category: CategoryType = None
    ) -> str:
        """
        英検レベル別瞬間英作文問題生成プロンプト

        Args:
            eiken_level: 英検レベル（3級〜1級）
            category: 問題のカテゴリ（オプション）

        Returns:
            英検レベル対応問題生成用プロンプト文字列
        """
        eiken_info = self.eiken_descriptions[eiken_level]
        category_text = ""
        if category:
            category_desc = self.category_descriptions[category]
            category_text = (
                f"\n【カテゴリ】: {category.value} - {category_desc}"
            )

        prompt = f"""あなたは日本人の英語学習者向けの英検対応瞬間英作文問題を作成する専門家です。

以下の条件で新しい問題を1つ作成してください：

【英検レベル】: {eiken_info['level']}
【対象レベル】: {eiken_info['description']}
【使用文法】: {eiken_info['grammar']}
【語彙レベル】: {eiken_info['vocabulary']}
【推奨トピック】: {eiken_info['topics']}
【作文スタイル】: {eiken_info['writing_style']}{category_text}

【作成条件】:
- 英検{eiken_level.value.replace('grade_', '').replace('_', '級・')}級レベルに適した問題
- 日本人が実際に使いそうな自然な日本語文
- 英検試験で出題されそうな実用的な表現
- 指定された文法項目を含む自然な英語訳
- 学習者のレベルに適した語彙と文法構造
- 英検の出題傾向に沿った現代的な内容
- 単なる暗記ではなく理解を促す問題設計

【避けるべき要素】:
- レベルに対して簡単すぎる・難しすぎる表現
- 古い表現や不自然な日本語
- 英検の出題範囲を超えた複雑な文法構造
- 文化的に不適切な内容
- 実用性の低い表現

【特別な指示】:
- 英検{eiken_level.value.replace('grade_', '').replace('_', '級・')}級の語彙・文法レベルを厳密に守る
- 英検試験の実際の出題形式を意識する
- 学習者がレベルアップを実感できる適切な難易度設定
- 英検合格に直結する実用的な表現を優先

【出力形式】:
日本語: [日本語の文章]
英語: [対応する英語の文章]

例（英検3級レベルの場合）：
日本語: 私は毎日英語を勉強しています。
英語: I study English every day.

新しい英検{eiken_level.value.replace('grade_', '').replace('_', '級・')}級レベルの問題を作成してください。"""

        return prompt.strip()

    def get_translation_check_prompt(
        self, japanese: str, correct_answer: str, user_answer: str
    ) -> str:
        """
        翻訳回答評価・フィードバックプロンプト

        Args:
            japanese: 日本語の問題文
            correct_answer: 正解の英語文
            user_answer: ユーザーの回答

        Returns:
            評価・フィードバック生成用プロンプト
        """
        prompt = f"""あなたは経験豊富な英語教師です。日本人学習者の瞬間英作文の回答を評価してください。

【問題】
日本語: "{japanese}"
正解: "{correct_answer}"
学習者の回答: "{user_answer}"

【評価基準】
- 意味が正確に伝わっているか
- 文法が正しいか
- 自然な英語表現か
- 語彙の選択が適切か
- コミュニケーション効果があるか

【評価レベル】
- Excellent: 完璧または非常に良い回答
- Good: 良い回答（小さな改善点があっても意味は通じる）
- Not quite right: 改善が必要な回答

【返答形式】
以下の形式で評価してください：
- 「Excellent!」「Good!」「Not quite right」のいずれかで始める
- 具体的な改善点やアドバイスを含める（必要に応じて）
- 代替表現の提案（適切な場合）
- 励ましの言葉を含める
- 2-3文で簡潔にまとめる
- 学習者の努力を認める

【教育方針】
- ポジティブで建設的なフィードバック
- 間違いを恐れない学習環境の構築
- 実用的で覚えやすいアドバイス
- 日本人学習者にとって理解しやすい説明

日本人学習者にとって理解しやすく、学習意欲を高めるような評価をお願いします。"""

        return prompt.strip()

    def get_error_recovery_prompt(self, error_context: str) -> str:
        """
        エラー発生時の復旧メッセージプロンプト

        Args:
            error_context: エラーの文脈情報

        Returns:
            エラー復旧メッセージ生成用プロンプト
        """
        prompt = f"""You are a helpful English teacher. There was a technical issue with the previous interaction.

Context: {error_context}

Please provide a brief, friendly message to the student that:
- Acknowledges there was a technical issue
- Reassures them it's not their fault
- Encourages them to try again or continue the conversation
- Maintains a positive learning atmosphere
- Keeps the message short and clear

Respond as the friendly English teacher you are."""

        return prompt.strip()

    def get_custom_lesson_prompt(
        self,
        lesson_topic: str,
        student_level: str,
        focus_skills: List[str] = None,
    ) -> str:
        """
        カスタムレッスン用プロンプト生成

        Args:
            lesson_topic: レッスンのトピック
            student_level: 学習者のレベル
            focus_skills: 重点的に練習したいスキル（オプション）

        Returns:
            カスタムレッスン用プロンプト
        """
        focus_text = ""
        if focus_skills:
            focus_text = f"\nFOCUS SKILLS: {', '.join(focus_skills)}"

        prompt = f"""You are creating a custom English lesson for a Japanese learner.

LESSON DETAILS:
- Topic: {lesson_topic}
- Student Level: {student_level}
- Learning Goals: Practical conversation skills{focus_text}

LESSON APPROACH:
- Start with relevant vocabulary introduction
- Use real-life scenarios and examples
- Encourage active participation
- Provide immediate feedback
- Keep explanations clear and concise
- Build confidence through positive reinforcement

Please begin the lesson with an engaging introduction to the topic and invite the student to participate actively."""

        return prompt.strip()

    def get_grammar_explanation_prompt(
        self, grammar_point: str, example_sentence: str = None
    ) -> str:
        """
        文法説明用プロンプト

        Args:
            grammar_point: 説明したい文法項目
            example_sentence: 例文（オプション）

        Returns:
            文法説明用プロンプト
        """
        example_text = ""
        if example_sentence:
            example_text = f"\nExample sentence: {example_sentence}"

        prompt = f"""You are an English grammar expert helping Japanese learners.

Please explain this grammar point: {grammar_point}{example_text}

EXPLANATION GUIDELINES:
- Use simple, clear language
- Provide practical examples
- Compare with Japanese grammar when helpful
- Include common mistakes to avoid
- Give usage tips for natural conversation
- Keep the explanation concise but comprehensive
- End with a question to check understanding

Focus on practical usage rather than complex grammatical terminology."""

        return prompt.strip()

    def get_pronunciation_practice_prompt(
        self, target_words: List[str]
    ) -> str:
        """
        発音練習用プロンプト

        Args:
            target_words: 練習対象の単語リスト

        Returns:
            発音練習用プロンプト
        """
        words_text = ", ".join(target_words)

        prompt = f"""You are a pronunciation coach for Japanese English learners.

TARGET WORDS: {words_text}

Please provide pronunciation guidance that includes:
- Clear pronunciation tips for each word
- Common pronunciation mistakes Japanese speakers make
- Mouth position and tongue placement tips
- Rhythm and stress patterns
- Practice sentences using these words
- Encouraging feedback approach

Focus on the most important pronunciation points that will help Japanese learners sound more natural."""

        return prompt.strip()


# プロンプトテンプレートのシングルトンインスタンス
prompt_templates = PromptTemplates()


# 便利な関数群（後方互換性のため）
def create_conversation_prompt(
    user_text: str, chat_history: List[Dict] = None
) -> str:
    """後方互換性のための関数"""
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
    """後方互換性のための関数"""
    return prompt_templates.get_welcome_prompt()


def create_problem_generation_prompt(difficulty: str, category: str) -> str:
    """後方互換性のための関数"""
    diff_level = getattr(
        DifficultyLevel, difficulty.upper(), DifficultyLevel.MEDIUM
    )
    cat_type = getattr(CategoryType, category.upper(), CategoryType.DAILY)
    return prompt_templates.get_problem_generation_prompt(diff_level, cat_type)


def create_translation_check_prompt(
    japanese: str, correct_answer: str, user_answer: str
) -> str:
    """後方互換性のための関数"""
    return prompt_templates.get_translation_check_prompt(
        japanese, correct_answer, user_answer
    )


def create_eiken_problem_generation_prompt(
    eiken_level: str, category: str = None
) -> str:
    """英検レベル対応問題生成プロンプト（後方互換性）"""
    # 文字列からEnumに変換
    eiken_enum = getattr(
        EikenLevel, f"GRADE_{eiken_level.upper()}", EikenLevel.GRADE_3
    )
    cat_enum = None
    if category:
        cat_enum = getattr(CategoryType, category.upper(), CategoryType.DAILY)
    return prompt_templates.get_eiken_problem_generation_prompt(
        eiken_enum, cat_enum
    )


# 使用例とテスト用のサンプルコード
if __name__ == "__main__":
    # 使用例
    templates = PromptTemplates()

    # 会話プロンプトの例
    conversation_prompt = templates.get_conversation_prompt(
        user_text="I want to learn about cooking",
        chat_history=[
            ChatMessage(role="user", content="Hello"),
            ChatMessage(role="assistant", content="Hello! Nice to meet you!"),
        ],
    )
    print("=== 会話プロンプト例 ===")
    print(conversation_prompt)
    print("\n")

    # 問題生成プロンプトの例
    problem_prompt = templates.get_problem_generation_prompt(
        difficulty=DifficultyLevel.MEDIUM, category=CategoryType.FOOD
    )
    print("=== 問題生成プロンプト例 ===")
    print(problem_prompt)
    print("\n")

    # 翻訳チェックプロンプトの例
    check_prompt = templates.get_translation_check_prompt(
        japanese="今日は忙しい一日でした。",
        correct_answer="Today was a busy day.",
        user_answer="Today is busy day.",
    )
    print("=== 翻訳チェックプロンプト例 ===")
    print(check_prompt)
