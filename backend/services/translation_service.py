"""
Translation and instant translation service.
翻訳・瞬間英作文サービス

このファイルには、瞬間英作文の問題データと関連する機能が含まれています。
"""

# 瞬間英作文の問題パターン（147問の静的データ）
TRANSLATION_PROBLEMS = [
    {
        "japanese": "今日は天気がいいですね。",
        "english": "It's nice weather today.",
        "difficulty": "easy",
        "category": "weather",
    },
    {
        "japanese": "昨日、友達と映画を見に行きました。",
        "english": "I went to see a movie with my friend yesterday.",
        "difficulty": "medium",
        "category": "daily_life",
    },
    {
        "japanese": "来週の金曜日に会議があります。",
        "english": "There will be a meeting next Friday.",
        "difficulty": "medium",
        "category": "business",
    },
    {
        "japanese": "もしも時間があれば、一緒に買い物に行きませんか？",
        "english": "If you have time, would you like to go shopping together?",
        "difficulty": "hard",
        "category": "invitation",
    },
    {
        "japanese": "彼女は毎朝7時に起きます。",
        "english": "She gets up at 7 o'clock every morning.",
        "difficulty": "easy",
        "category": "daily_routine",
    },
    {
        "japanese": "この本は私にとって難しすぎます。",
        "english": "This book is too difficult for me.",
        "difficulty": "medium",
        "category": "opinion",
    },
    {
        "japanese": "電車が遅れているので、少し遅れるかもしれません。",
        "english": "The train is delayed, so I might be a little late.",
        "difficulty": "hard",
        "category": "transportation",
    },
    {
        "japanese": "夏休みに家族と北海道に行く予定です。",
        "english": "I'm planning to go to Hokkaido with my family during summer vacation.",
        "difficulty": "medium",
        "category": "travel",
    },
    {
        "japanese": "日本語を勉強するのは楽しいです。",
        "english": "Studying Japanese is fun.",
        "difficulty": "easy",
        "category": "learning",
    },
    {
        "japanese": "もし雨が降ったら、家にいるつもりです。",
        "english": "If it rains, I intend to stay home.",
        "difficulty": "hard",
        "category": "conditional",
    },
    # 追加のwork/businessカテゴリ問題
    {
        "japanese": "プロジェクトの進捗はいかがですか？",
        "english": "How is the progress of the project?",
        "difficulty": "medium",
        "category": "work",
    },
    {
        "japanese": "来月から新しい部署に異動することになりました。",
        "english": "I will be transferred to a new department starting next month.",
        "difficulty": "hard",
        "category": "work",
    },
    {
        "japanese": "この提案書について質問があります。",
        "english": "I have a question about this proposal.",
        "difficulty": "medium",
        "category": "work",
    },
    {
        "japanese": "会議の資料を準備する必要があります。",
        "english": "I need to prepare materials for the meeting.",
        "difficulty": "easy",
        "category": "work",
    },
    {
        "japanese": "締切を延長していただくことは可能でしょうか？",
        "english": "Would it be possible to extend the deadline?",
        "difficulty": "hard",
        "category": "work",
    },
    # technology カテゴリ
    {
        "japanese": "新しいアプリをダウンロードしました。",
        "english": "I downloaded a new app.",
        "difficulty": "easy",
        "category": "technology",
    },
    {
        "japanese": "コンピューターが動かなくなってしまいました。",
        "english": "My computer has stopped working.",
        "difficulty": "medium",
        "category": "technology",
    },
    {
        "japanese": "このソフトウェアは非常に使いやすいです。",
        "english": "This software is very user-friendly.",
        "difficulty": "medium",
        "category": "technology",
    },
    # health カテゴリ
    {
        "japanese": "頭が痛いので病院に行きます。",
        "english": "I have a headache, so I'm going to the hospital.",
        "difficulty": "easy",
        "category": "health",
    },
    {
        "japanese": "毎日運動するように心がけています。",
        "english": "I try to exercise every day.",
        "difficulty": "medium",
        "category": "health",
    },
    {
        "japanese": "バランスの取れた食事を摂ることが大切です。",
        "english": "It's important to have a balanced diet.",
        "difficulty": "hard",
        "category": "health",
    },
    # education カテゴリ
    {
        "japanese": "大学で経済学を専攻しています。",
        "english": "I'm majoring in economics at university.",
        "difficulty": "medium",
        "category": "education",
    },
    {
        "japanese": "図書館で宿題をしています。",
        "english": "I'm doing my homework at the library.",
        "difficulty": "easy",
        "category": "education",
    },
    {
        "japanese": "今度の試験の準備をしなければなりません。",
        "english": "I have to prepare for the upcoming exam.",
        "difficulty": "medium",
        "category": "education",
    },
]
