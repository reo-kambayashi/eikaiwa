# 📚 English Communication App - 使用説明書

## 🎯 概要
この英会話アプリは、日本人の英語学習者向けに特化したAI会話練習システムです。Google Gemini AIを活用して、個人のレベルと学習目的に合わせた英語練習を提供します。

## 🚀 アプリの起動方法

### 1. 環境準備
```bash
# プロジェクトディレクトリに移動
cd /Users/reo/Documents/eikaiwa

# 環境変数ファイルが存在することを確認
ls -la .env
```

### 2. バックエンドサーバーの起動
```bash
# バックエンドディレクトリに移動
cd backend

# サーバーを起動
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. フロントエンドサーバーの起動
```bash
# 新しいターミナルウィンドウで
cd frontend

# Reactアプリを起動
npm start
```

### 4. アプリへアクセス
- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000

## 🎮 基本的な使用方法

### 1. 学習設定の選択

#### 📊 English Level (英語レベル)
- **Beginner (初級)**: 基本的な語彙と文法で学習
- **Intermediate (中級)**: 日常会話レベルの表現を習得
- **Advanced (上級)**: 複雑な議論や抽象的な話題に挑戦

#### 🎯 Practice Type (練習タイプ)
- **Conversation (会話)**: 自然な対話の流れを重視した練習
- **Grammar (文法)**: 文法エラーの訂正と説明に特化
- **Vocabulary (語彙)**: 新しい単語と表現の習得に集中
- **Pronunciation (発音)**: 日本人が苦手な音の練習とコツ

#### 🎤 Voice Controls (音声制御)
- **Voice Input (音声入力)**: Web Speech APIを使用した音声認識機能
  - マイクボタン🎤をクリックして音声入力を開始
  - 英語で話すと自動的にテキストに変換
  - 音声認識中は赤いアニメーションで表示
- **Voice Output (音声出力)**: Google Cloud TTSを使用した音声合成機能
  - AIの返答を自動的に読み上げ
  - 自然な英語音声でリスニング練習も可能

### 2. チャットでの練習

1. **初回ウェルカムメッセージ**: アプリを開くと、AIが選択したレベルと練習タイプに基づいて自動的に挨拶してくれます
2. **メッセージ入力**: テキストボックスに英語でメッセージを入力
3. **送信方法**: 
   - 「Send」ボタンをクリック
   - Enterキーを押す
4. **AI応答**: 選択した設定に基づいてAIが適切な返答を生成

## 🎨 各練習モードの特徴

### 💬 Conversation Mode (会話モード)
**目的**: 自然な英語会話のスキル向上

**特徴**:
- 日常的な話題での対話
- オープンエンドの質問で会話継続
- レベルに応じた語彙調整
- 会話マーカー（"Well", "Actually"など）の習得

**使用例**:
```
入力: "I went to Tokyo yesterday"
応答: "That sounds exciting! What did you enjoy most about your visit to Tokyo? 
Did you try any local food or visit any interesting places?"
```

### 📝 Grammar Mode (文法モード)
**目的**: 正確な英語文法の習得

**特徴**:
- 文法エラーの優しい訂正
- 正しい形式とその理由の説明
- 類似例文の提供
- 練習方法の提案

**使用例**:
```
入力: "I went to shopping yesterday"
応答: "Good try! I can understand you perfectly. Just a small correction: 
we say 'I went shopping yesterday' (without 'to'). 
Examples: 'went swimming', 'went walking' - no 'to' needed for activities."
```

### 📖 Vocabulary Mode (語彙モード)
**目的**: 語彙力の拡充

**特徴**:
- トピック関連の新語彙導入（2-3語）
- 簡潔な定義と例文
- 語彙の正しい使用法
- 実際の会話での使用促進

**使用例**:
```
入力: "I like sushi"
応答: "Great! Let's expand your vocabulary. Instead of just 'like', you could say:
- 'adore' (love very much): 'I adore the fresh taste of sushi'
- 'appreciate' (recognize quality): 'I appreciate the artistry in sushi making'
Which word describes your feeling better?"
```

### 🗣️ Pronunciation Mode (発音モード)
**目的**: 正確な英語発音の習得

**特徴**:
- 日本人が苦手な音素に特化
- 音韻記号を使用した説明（/θ/, /r/, /l/）
- リズムとイントネーション指導
- 具体的な練習方法

**使用例**:
```
入力: "This is difficult"
応答: "Let's work on that 'th' sound! Put your tongue lightly between your teeth 
and blow air: /θɪs/. Practice: 'this', 'think', 'through'. 
The /r/ in 'really' should be stronger than Japanese 'r' - /ˈriːli/."
```

## 🔧 レベル別学習ガイド

### 🟢 Beginner (初級者向け)
**推奨設定**: Beginner + Conversation または Grammar

**学習のコツ**:
- 簡単な日常表現から始める
- 文法エラーを恐れずに話す
- 基本的な挨拶や自己紹介を練習

**よい練習例**:
- "Hello, my name is..."
- "I like..."
- "Yesterday I..."

### 🟡 Intermediate (中級者向け)
**推奨設定**: Intermediate + Vocabulary または Conversation

**学習のコツ**:
- より複雑な文構造に挑戦
- 感情や意見を表現する練習
- 慣用表現を積極的に使用

**よい練習例**:
- "I think that..."
- "In my opinion..."
- "What do you think about...?"

### 🔴 Advanced (上級者向け)
**推奨設定**: Advanced + Conversation または Pronunciation

**学習のコツ**:
- 抽象的なトピックを議論
- 複雑な議論構造を使用
- ニュアンスの違いに注意

**よい練習例**:
- "From my perspective..."
- "On the one hand... on the other hand..."
- "What are the implications of...?"

## 🛠️ トラブルシューティング

### サーバー接続エラー
**問題**: "Error contacting server" メッセージが表示

**解決方法**:
1. バックエンドサーバーが起動しているか確認
2. ポート8000が使用可能か確認: `lsof -i :8000`
3. 環境変数が正しく設定されているか確認

### Gemini API エラー
**問題**: "API key not configured" メッセージが表示

**解決方法**:
1. `.env`ファイルに`GEMINI_API_KEY`が設定されているか確認
2. APIキーが有効か [Google AI Studio](https://makersuite.google.com/app/apikey) で確認
3. サーバーを再起動

### フロントエンドの表示問題
**問題**: 設定パネルが表示されない

**解決方法**:
1. ブラウザのキャッシュをクリア（Cmd+Shift+R）
2. `npm start`でフロントエンドを再起動
3. コンソールエラーを確認（F12 > Console）

## 📈 効果的な学習方法

### 🎯 日々の練習ルーチン
1. **ウォームアップ** (5分): Beginnerレベルで簡単な挨拶
2. **メイン練習** (15-20分): 目標レベルで集中練習
3. **チャレンジ** (5分): 一段階上のレベルで挑戦

### 📝 学習記録のコツ
- 新しく学んだ語彙をメモ
- 訂正された文法ポイントを記録
- 上達した発音のコツを書き留める

### 🔄 継続的改善
- 週に1回レベル設定を見直し
- 異なる練習タイプを組み合わせ
- 実際の会話で学んだ表現を使用

## 🎊 学習成果の確認

### チェックポイント
- [ ] 自然な会話の維持ができる
- [ ] 文法エラーが減少している
- [ ] 新しい語彙を実際に使える
- [ ] 発音に自信が持てる

### 次のステップ
1. **レベルアップ**: より高いレベルに挑戦
2. **専門分野**: ビジネス英語や特定トピックに特化
3. **実践応用**: 実際の英語話者との会話に挑戦

---

## 📞 サポート情報

**開発者**: Gemini AI を活用した英会話学習システム
**更新日**: 2025年6月14日
**バージョン**: 1.0.0

学習を楽しんでください！ 🌟
