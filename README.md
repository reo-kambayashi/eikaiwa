# 🗣️ English Communication App

**日本人向け英語会話練習アプリ - AI powered English learning app for Japanese speakers**

このプロジェクトは、日本人の英語学習者がAIと対話しながら英語を練習するためのWebアプリケーションです。Google Gemini AIを活用し、音声認識・音声合成機能を備えた包括的な学習環境を提供します。

## ✨ 主な機能

- 🤖 **AI会話パートナー**: Google Gemini AIによる自然な英語会話
- 🎤 **音声認識**: Web Speech APIを使った音声入力
- 🔊 **音声合成**: Google Cloud TTSによる自然な音声出力
- 📊 **レベル別学習**: 初級・中級・上級に対応
- 📚 **4つの練習タイプ**: 
  - 日常会話 (Conversation)
  - 文法練習 (Grammar)
  - 語彙学習 (Vocabulary)
  - 発音練習 (Pronunciation)

## 🏗️ 技術スタック

- **フロントエンド**: React.js
- **バックエンド**: Python (FastAPI)
- **AI**: Google Gemini AI
- **音声**: Web Speech API, Google Cloud Text-to-Speech
- **パッケージ管理**: uv (Python), npm (JavaScript)

## 📁 プロジェクト構造

```
eikaiwa/
├── backend/           # Python FastAPIサーバー
│   ├── main.py       # メインアプリケーション
│   └── requirements.txt
├── frontend/         # React フロントエンド
│   ├── src/
│   │   ├── App.js   # メインReactコンポーネント
│   │   └── App.css  # スタイルシート
│   └── package.json
├── .env             # 環境変数（要設定）
├── .env.example     # 環境変数テンプレート
└── README.md        # このファイル
```

## 🚀 セットアップ手順

### 前提条件

- Python 3.11以上
- Node.js 16以上
- Google Cloud アカウント（TTS用）
- Google AI Studio アカウント（Gemini API用）

### 1. プロジェクトのクローン

```bash
git clone <repository-url>
cd eikaiwa
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集して以下の値を設定：

```env
# Google Gemini AI API キー (必須)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud TTS認証ファイル (任意 - TTSを使用する場合)
GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcloud/tts-service-account.json

# React フロントエンドの設定
REACT_APP_API_URL=http://localhost:8000
```

### 3. バックエンドのセットアップ

```bash
# uvのインストール (まだの場合)
curl -LsSf https://astral.sh/uv/install.sh | sh

# バックエンドディレクトリに移動
cd backend

# 仮想環境の作成と依存関係のインストール
uv venv .venv
uv pip install -r requirements.txt

# サーバーの起動
uv run uvicorn main:app --reload
```

サーバーは http://localhost:8000 で起動します。

### 4. Google Cloud TTS設定 (任意)

音声出力機能を使用する場合：

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. Text-to-Speech APIを有効化
3. サービスアカウントを作成してJSONキーをダウンロード
4. キーファイルを適切な場所に配置：

```bash
mkdir -p ~/.config/gcloud
mv ~/Downloads/your-service-account-key.json ~/.config/gcloud/tts-service-account.json
```

### 5. フロントエンドのセットアップ

```bash
# フロントエンドディレクトリに移動
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

フロントエンドは http://localhost:3000 で起動します。

## 🎯 使用方法

1. ブラウザで http://localhost:3000 にアクセス
2. 画面左側のパネルで学習レベルと練習タイプを選択
3. 以下の方法でAIと会話：
   - **テキスト入力**: 下部のテキストボックスに入力してEnterキーまたは送信ボタン
   - **音声入力**: マイクボタンをクリックして音声で話しかけ
4. AIの返答は自動的に音声で再生されます（設定で無効化可能）

## 🛠️ 開発者向け情報

### コードフォーマット

Pythonコードは `black` でフォーマットされています：

```bash
cd backend
uv run black --line-length 79 main.py
```

### テスト実行

```bash
# フロントエンドテスト
cd frontend
npm test

# バックエンドの動作確認
curl http://localhost:8000/api/status
```

### 新しい機能の追加

1. バックエンドのAPIエンドポイントを `backend/main.py` に追加
2. フロントエンドのUIコンポーネントを `frontend/src/App.js` に追加
3. 必要に応じてスタイルを `frontend/src/App.css` に追加

## 🐛 トラブルシューティング

### よくある問題

**1. 音声認識が動作しない**
- ブラウザがWebkitSpeechRecognitionをサポートしているか確認
- HTTPSまたはlocalhostでアクセスしているか確認

**2. TTS音声が再生されない**
- Google Cloud TTSの設定を確認
- ブラウザの音声再生許可を確認

**3. APIエラーが発生する**
- `.env`ファイルのAPI キーが正しく設定されているか確認
- バックエンドサーバーが起動しているか確認

### ログの確認

```bash
# バックエンドログ
cd backend
uv run uvicorn main:app --reload --log-level debug

# フロントエンドログ
# ブラウザの開発者ツール > Console タブを確認
```

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

プルリクエストや Issue の作成を歓迎します！

- コミットメッセージは英語で、動詞の命令形で記述
- Python コードは `black` でフォーマット（行長79）
- プルリクエストには変更内容と実行したテストの概要を記載

The app will be available at <http://localhost:3000>.
