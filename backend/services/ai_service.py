"""
Gemini AI integration service.
Google Gemini AIとの統合サービス

このファイルには、Gemini AIを使用した各種プロンプト作成機能と
AI応答生成に関するユーティリティ関数が含まれています。
"""

def create_conversation_prompt(
    user_text: str, conversation_history: list = None
) -> str:
    """
    Create prompts for English conversation practice.
    英会話練習用のプロンプトを作成します。

    Args:
        user_text: The user's input message (ユーザーの入力メッセージ)
        conversation_history: Previous messages for context (文脈のための過去のメッセージ)

    Returns:
        A formatted prompt string optimized for conversation practice
        (会話練習に最適化されたプロンプト文字列)
    """

    # Format conversation history for context
    history_context = ""
    if conversation_history and len(conversation_history) > 0:
        history_context = "\n\nCONVERSATION HISTORY (for context):\n"
        # Show last 10 messages to avoid token limit issues
        recent_history = (
            conversation_history[-10:]
            if len(conversation_history) > 10
            else conversation_history
        )
        for msg in recent_history:
            sender = msg.get("sender", "Unknown")
            text = msg.get("text", "")
            history_context += f"{sender}: {text}\n"
        history_context += "\n"

    # Simplified conversation prompt
    prompt = f"""
You are an expert English teacher and conversation partner specializing in helping Japanese learners.

IMPORTANT GUIDELINES:
- Always be encouraging and supportive
- Use natural, conversational English
- Provide gentle corrections when needed
- Ask follow-up questions to keep the conversation flowing
- Use examples and explanations when helpful
- Reference previous parts of the conversation when relevant
- Keep responses concise and engaging (1-3 sentences)
- Focus on practical, everyday English
{history_context}

CURRENT MESSAGE FROM STUDENT:
"{user_text}"

Please respond naturally as a friendly English teacher and conversation partner.
"""

    return prompt


def create_welcome_prompt() -> str:
    """
    Create a welcome prompt for new users.
    新規ユーザー向けのウェルカムプロンプトを作成します。
    """

    prompt = """
You are an expert English teacher and conversation partner specializing in helping Japanese learners.

Please create a warm, encouraging welcome message for a new student starting English conversation practice.

GUIDELINES:
- Keep it friendly and encouraging
- Mention that you're here to help with English conversation
- Invite them to start practicing by asking a question or sharing something about themselves
- Keep it concise (2-3 sentences)
- Use clear, natural English

Please respond with a welcoming message to get the conversation started.
"""

    return prompt


def create_japanese_consultation_prompt(
    user_text: str, consultation_type: str = "general", conversation_history: list = None
) -> str:
    """
    Create prompts for Japanese consultation about English expressions and grammar.
    英語表現や文法に関する日本語相談用のプロンプトを作成します。

    Args:
        user_text: The user's question in Japanese or English (日本語または英語での質問)
        consultation_type: Type of consultation (相談のタイプ - API互換性のために保持)
        conversation_history: Previous consultation messages for context (文脈のための過去の相談メッセージ)

    Returns:
        A formatted prompt string optimized for Japanese consultation responses
        (日本語相談回答に最適化されたプロンプト文字列)
    """

    # Format conversation history for context
    history_context = ""
    if conversation_history and len(conversation_history) > 0:
        history_context = "\n\n相談履歴（参考情報）:\n"
        # Show last 8 messages to avoid token limit issues
        recent_history = (
            conversation_history[-8:]
            if len(conversation_history) > 8
            else conversation_history
        )
        for msg in recent_history:
            sender = msg.get("sender", "Unknown")
            text = msg.get("text", "")
            history_context += f"{sender}: {text}\n"
        history_context += "\n"

    # Simple Japanese consultation prompt
    prompt = f"""
あなたは日本人の英語学習者を専門とする、経験豊富で親切な英語教師です。

【重要な指示】:
- 必ず日本語で回答してください
- 簡潔で分かりやすい説明を心がけてください（2-3文程度）
- 1つの具体的な例文を含めてください
- 一目で読める短さにしてください
- 要点だけを簡潔に答えてください
{history_context}

【学習者からの質問】:
"{user_text}"

上記の質問に対して、日本語で簡潔に回答してください。例文は1つだけ、説明は2-3文以内でお願いします。
"""

    return prompt


def create_translation_check_prompt(
    japanese: str, correct_answer: str, user_answer: str
) -> str:
    """
    瞬間英作文の回答チェック用プロンプトを作成
    英作文の回答を評価するためのプロンプトを生成します。

    Args:
        japanese: 日本語の原文
        correct_answer: 正解の英語
        user_answer: ユーザーの回答

    Returns:
        AIが回答を評価するためのプロンプト
    """

    prompt = f"""
あなたは経験豊富な英語教師です。日本人学習者の瞬間英作文の回答を評価してください。

【問題】
日本語: "{japanese}"
正解: "{correct_answer}"
学習者の回答: "{user_answer}"

【評価基準】
- 意味が正確に伝わっているか
- 文法が正しいか
- 自然な英語表現か
- 語彙の選択が適切か

【返答形式】
以下の形式で評価してください：
- 「Excellent!」「Good!」「Not quite right」のいずれかで始める
- 具体的な改善点やアドバイスを含める
- 励ましの言葉を含める
- 2-3文で簡潔にまとめる

日本人学習者にとって理解しやすく、学習意欲を高めるような評価をお願いします。
"""

    return prompt


def create_eiken_problem_generation_prompt(
    eiken_level: str, category: str = "general", long_text_mode: bool = False
) -> str:
    """
    英検レベルに応じた瞬間英作文問題を生成するためのプロンプトを作成
    英検対応の問題生成用プロンプトを作成します。

    Args:
        eiken_level: 英検レベル (5, 4, 3, pre-2, 2, pre-1, 1)
        category: 問題のカテゴリ (daily_life, work, travel, etc.)
        long_text_mode: 長文モードかどうか

    Returns:
        AIが問題を生成するためのプロンプト
    """

    # 英検レベル別の特徴定義
    eiken_characteristics = {
        "5": {
            "description": "英検5級 (中学初級レベル)",
            "grammar": "現在形、過去形、be動詞、一般動詞の基本形",
            "vocabulary": "中学1年生レベルの基本語彙 (約600語)",
            "sentence_structure": "シンプルな単文中心",
            "examples": [
                "I am a student.",
                "I go to school.",
                "It is sunny today.",
            ],
        },
        "4": {
            "description": "英検4級 (中学中級レベル)",
            "grammar": "助動詞 (can, will, must)、未来形、進行形",
            "vocabulary": "中学2年生レベルの語彙 (約1300語)",
            "sentence_structure": "助動詞を含む文、疑問文・否定文",
            "examples": [
                "I can play tennis.",
                "Will you help me?",
                "She is reading a book.",
            ],
        },
        "3": {
            "description": "英検3級 (中学卒業レベル)",
            "grammar": "受動態、現在完了、不定詞、動名詞",
            "vocabulary": "中学3年生レベルの語彙 (約2100語)",
            "sentence_structure": "複文構造、接続詞を使った文",
            "examples": [
                "This book was written by him.",
                "I have been to Tokyo.",
                "I want to learn English.",
            ],
        },
        "pre-2": {
            "description": "英検準2級 (高校中級レベル)",
            "grammar": "関係代名詞、仮定法の基本、分詞",
            "vocabulary": "高校基礎レベルの語彙 (約3600語)",
            "sentence_structure": "関係詞を使った複文、より複雑な構造",
            "examples": [
                "The man who is standing there is my teacher.",
                "If I were you, I would study harder.",
            ],
        },
        "2": {
            "description": "英検2級 (高校卒業レベル)",
            "grammar": "仮定法、複雑な時制、高度な文型",
            "vocabulary": "高校卒業レベルの語彙 (約5100語)",
            "sentence_structure": "複雑な複文、論理的な文構造",
            "examples": [
                "If I had studied harder, I could have passed the exam.",
                "Having finished my homework, I went to bed.",
            ],
        },
        "pre-1": {
            "description": "英検準1級 (大学中級レベル)",
            "grammar": "高度な文法構造、論理的表現",
            "vocabulary": "大学中級レベルの語彙 (約7500語)",
            "sentence_structure": "学術的・ビジネス的表現",
            "examples": [
                "The proposal is likely to be implemented next year.",
                "It is essential that we address this issue promptly.",
            ],
        },
        "1": {
            "description": "英検1級 (大学上級レベル)",
            "grammar": "最高レベルの文法、慣用表現",
            "vocabulary": "大学上級レベルの語彙 (約10000-15000語)",
            "sentence_structure": "高度な論理構造、専門的表現",
            "examples": [
                "The ramifications of this decision could be far-reaching.",
                "Notwithstanding the challenges, we must persevere.",
            ],
        },
    }

    # カテゴリ別のトピック
    category_topics = {
        "daily_life": ["家族", "食事", "買い物", "趣味", "天気"],
        "work": ["仕事", "会議", "プロジェクト", "同僚", "スケジュール"],
        "travel": ["旅行", "交通", "宿泊", "観光", "文化"],
        "education": ["学校", "勉強", "試験", "図書館", "授業"],
        "health": ["健康", "病気", "運動", "食事", "病院"],
        "technology": [
            "コンピューター",
            "スマートフォン",
            "インターネット",
            "アプリ",
            "SNS",
        ],
        "general": ["一般的な話題", "日常的な表現", "基本的な会話"],
    }

    eiken_info = eiken_characteristics.get(
        eiken_level, eiken_characteristics["3"]
    )
    topics = category_topics.get(category, category_topics["general"])

    length_instruction = ""
    if long_text_mode:
        length_instruction = """
【長文モード指示】
- 3-5文程度の長めの日本語文を作成
- 複数の文法事項を含む複合的な内容
- より実践的で自然な文章構成
"""

    prompt = f"""
あなたは英検対策の専門家です。以下の条件に従って瞬間英作文の問題を1つ作成してください。

【対象レベル】
{eiken_info['description']}

【文法要件】
{eiken_info['grammar']}

【語彙レベル】
{eiken_info['vocabulary']}

【文構造】
{eiken_info['sentence_structure']}

【参考例文】
{', '.join(eiken_info['examples'])}

【トピック】
以下のトピックから選択: {', '.join(topics)}

【カテゴリ】
{category}
{length_instruction}

【出力形式】
以下のJSONフォーマットで1問作成してください：

{{
    "japanese": "日本語の問題文",
    "english": "対応する自然な英語",
    "difficulty": "{eiken_level}",
    "category": "{category}"
}}

注意事項:
- 日本人学習者が間違いやすいポイントを含める
- 実生活で使える実用的な表現
- 指定レベルに適した語彙・文法のみ使用
- JSONのみを返答してください
"""

    return prompt
