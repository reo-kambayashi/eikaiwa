# テストドキュメント / Testing Documentation

このドキュメントでは、English Communication Appの包括的なテスト戦略とテストケースについて説明します。

## 概要 / Overview

このアプリケーションには、フロントエンド（React）とバックエンド（FastAPI）の両方に対して包括的なテストスイートが実装されています。テストは機能テスト、統合テスト、エラーハンドリングテスト、アクセシビリティテストを含みます。

## テスト実行方法 / How to Run Tests

### バックエンドテスト / Backend Tests

```bash
# 推奨方法 (Makefileを使用)
make test-backend

# または直接実行
cd backend
uv run pytest tests/ -v

# カバレッジ付きで実行
uv run pytest tests/ -v --cov=. --cov-report=html
```

### フロントエンドテスト / Frontend Tests

```bash
# 推奨方法 (Makefileを使用)
make test-frontend

# または直接実行
cd frontend
npm test

# カバレッジ付きで実行
npm test -- --coverage --watchAll=false

# CI環境での実行
npm run test:ci
```

### 全テスト実行 / Run All Tests

```bash
make test
```

## バックエンドテスト / Backend Tests

### ファイル構成 / File Structure

```
backend/tests/
├── test_main.py         # メインAPIエンドポイントのテスト
├── test_prompts.py      # プロンプト生成システムのテスト
└── README.md           # テスト実行方法の説明
```

### テストカテゴリ / Test Categories

#### 1. 基本エンドポイントテスト / Basic Endpoint Tests
- **対象**: `/`, `/api/status`
- **テスト内容**: 
  - エンドポイントの基本的な応答確認
  - ステータスコードの検証
  - レスポンス構造の確認
  - サービス設定状態の検証

#### 2. 会話エンドポイントテスト / Conversation Endpoint Tests
- **対象**: `/api/welcome`, `/api/respond`
- **テスト内容**:
  - AIサービス利用可能時と不可能時の両方の動作
  - リクエスト/レスポンス構造の検証
  - 会話履歴の処理
  - フォールバック応答の確認

#### 3. TTS（音声合成）エンドポイントテスト / TTS Endpoint Tests
- **対象**: `/api/tts`
- **テスト内容**:
  - 音声合成サービスの可用性確認
  - 無効なパラメータのハンドリング
  - レスポンス形式の検証

#### 4. 翻訳練習エンドポイントテスト / Translation Practice Endpoint Tests
- **対象**: `/api/instant-translation/problem`, `/api/instant-translation/check`
- **テスト内容**:
  - 問題取得の動作確認
  - フィルタリング機能（カテゴリ、難易度、英検レベル）
  - 回答チェック機能
  - スコアリングシステム

#### 5. エラーハンドリングテスト / Error Handling Tests
- **テスト内容**:
  - 空のリクエストの処理
  - 無効なJSONの処理
  - 必須フィールド不足の処理
  - 異常なパラメータ値の処理

#### 6. サービス統合テスト / Service Integration Tests
- **テスト内容**:
  - モックされたAIサービスとの統合
  - モックされたTTSサービスとの統合
  - 外部サービス障害時のフォールバック

#### 7. データ検証テスト / Data Validation Tests
- **テスト内容**:
  - 会話履歴の検証
  - 長文テキストの処理
  - 特殊文字・Unicode文字の処理

### プロンプトシステムテスト / Prompt System Tests

#### 1. 会話プロンプトテスト / Conversation Prompt Tests
- 基本的な会話プロンプト生成
- 会話履歴を含むプロンプト生成
- 文法チェック有無の設定
- 長い会話履歴の処理

#### 2. 翻訳チェックプロンプトテスト / Translation Check Prompt Tests
- 基本的な翻訳チェックプロンプト
- 同一回答・異なる回答の処理
- 空の回答の処理
- JSON形式指定の確認

#### 3. AI問題生成プロンプトテスト / AI Problem Generation Prompt Tests
- カテゴリ別問題生成
- 難易度別問題生成
- 英検レベル別問題生成
- 複数フィルタの組み合わせ

#### 4. ウェルカムプロンプトテスト / Welcome Prompt Tests
- 基本的なウェルカムメッセージ
- ユーザー名指定時の処理
- プロンプトの一貫性確認

## フロントエンドテスト / Frontend Tests

### ファイル構成 / File Structure

```
frontend/src/
├── App.test.js                              # メインアプリケーションテスト
├── hooks/__tests__/                         # カスタムフックテスト
│   ├── useChat.test.js                     # チャット機能テスト
│   ├── useVoiceInput.test.js               # 音声入力テスト
│   └── useProblemManager.test.js           # 問題管理テスト
└── components/__tests__/                    # コンポーネントテスト
    ├── ChatBox.test.js                     # チャットボックステスト
    └── InstantTranslation.test.js          # 翻訳練習テスト
```

### テストカテゴリ / Test Categories

#### 1. アプリケーション統合テスト / Application Integration Tests
- **対象**: `App.js`
- **テスト内容**:
  - ヘッダーレンダリング
  - モード切り替え（チャット ↔ 翻訳練習）
  - 設定パネルの表示
  - キーボードショートカット
  - ウェルカムメッセージ表示
  - エラーハンドリング
  - アクセシビリティ機能

#### 2. カスタムフックテスト / Custom Hook Tests

##### useChat Hook Tests
- 初期状態の確認
- メッセージ送信と会話履歴管理
- ローディング状態の処理
- APIエラーのハンドリング
- 会話履歴のクリア
- ウェルカムメッセージの取得
- 空メッセージ・空白文字の処理
- 会話履歴制限機能

##### useVoiceInput Hook Tests
- 音声認識サポート検出
- 音声認識の開始・停止
- 音声認識結果の処理
- 中間結果の処理
- 各種エラーの処理（権限拒否、ネットワークエラーなど）
- イベントリスナーのクリーンアップ
- 設定の正しい適用

##### useProblemManager Hook Tests
- 初期状態の確認
- 問題取得の成功・失敗処理
- ローディング状態の管理
- フィルタリング機能（カテゴリ、難易度、英検レベル）
- 問題データの検証
- 複数フィルタの組み合わせ
- 長文問題の処理

#### 3. コンポーネントテスト / Component Tests

##### ChatBox Component Tests
- 基本的なレンダリング
- メッセージ表示の正しさ
- ユーザー・AIメッセージのスタイリング
- ローディングインジケーター
- タイムスタンプ表示
- 特殊文字・長文メッセージの処理
- メッセージ順序の確認
- 自動スクロール機能
- アクセシビリティ属性

##### InstantTranslation Component Tests
- 基本的なレンダリング
- 問題表示
- ローディング・エラー状態
- 回答入力・送信
- 結果表示とフィードバック
- 次の問題へのナビゲーション
- 設定パネルの表示・更新
- キーボードショートカット
- 正解・不正解の視覚的フィードバック
- 長文問題の処理
- 英検レベル表示

### モックとテストユーティリティ / Mocks and Test Utilities

#### APIモック / API Mocks
- すべての外部API呼び出しをモック化
- 成功・失敗パターンの両方をテスト
- レスポンスデータの構造検証

#### ブラウザAPIモック / Browser API Mocks
- Web Speech API (`SpeechRecognition`)
- Audio API
- Intersection Observer (自動スクロール用)

#### カスタムフックモック / Custom Hook Mocks
- 各コンポーネントテストで必要なフックをモック化
- 様々な状態（ローディング、エラー、成功）の模擬

## テスト実行結果の確認 / Test Result Verification

### バックエンド / Backend

```bash
# テスト実行後の出力例
====== test session starts ======
backend/tests/test_main.py::TestBasicEndpoints::test_root_endpoint PASSED
backend/tests/test_main.py::TestBasicEndpoints::test_status_endpoint PASSED
backend/tests/test_prompts.py::TestConversationPrompts::test_basic_conversation_prompt PASSED
...
====== X passed in Xs ======
```

### フロントエンド / Frontend

```bash
# テスト実行後の出力例
PASS src/App.test.js
PASS src/hooks/__tests__/useChat.test.js
PASS src/components/__tests__/ChatBox.test.js
...

Test Suites: X passed, X total
Tests:       X passed, X total
Snapshots:   X total
Time:        Xs
```

## カバレッジレポート / Coverage Reports

### バックエンドカバレッジ / Backend Coverage
- HTMLレポート: `backend/htmlcov/index.html`
- 主要モジュールの90%以上のカバレッジを目標

### フロントエンドカバレッジ / Frontend Coverage
- HTMLレポート: `frontend/coverage/lcov-report/index.html`
- コンポーネントとフックの85%以上のカバレッジを目標

## 継続的インテグレーション / Continuous Integration

### GitHub Actions (推奨)
```yaml
# .github/workflows/test.yml の例
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: make test
```

## テストのベストプラクティス / Testing Best Practices

### 1. テスト原則 / Testing Principles
- **明確性**: テストの目的が明確
- **独立性**: テスト間の依存関係なし
- **再現性**: 一貫した結果
- **速度**: 迅速な実行

### 2. テストパターン / Test Patterns
- **AAA (Arrange, Act, Assert)**: テスト構造の統一
- **Given-When-Then**: 行動駆動開発スタイル
- **モック使用**: 外部依存の分離

### 3. エラーハンドリングテスト / Error Handling Tests
- **ネットワークエラー**: 接続失敗、タイムアウト
- **データエラー**: 不正な形式、欠損データ
- **権限エラー**: マイクアクセス拒否など
- **サービスエラー**: AI/TTSサービス障害

### 4. アクセシビリティテスト / Accessibility Tests
- **キーボードナビゲーション**
- **ARIA属性の確認**
- **スクリーンリーダー対応**

## トラブルシューティング / Troubleshooting

### よくある問題 / Common Issues

1. **テスト環境の設定問題**
   ```bash
   # 依存関係の再インストール
   cd backend && uv sync
   cd frontend && npm install
   ```

2. **モックの設定問題**
   - `jest.clearAllMocks()`の確実な実行
   - モック関数の戻り値設定確認

3. **非同期テストの問題**
   - `await waitFor()`の適切な使用
   - `act()`でのstate更新のラップ

4. **ブラウザAPI模擬の問題**
   - Web Speech APIの適切なモック設定
   - イベントリスナーの模擬

## 今後の拡張 / Future Enhancements

### 計画中のテスト拡張 / Planned Test Extensions

1. **E2Eテスト**: Playwright/Cypressを使用
2. **パフォーマンステスト**: Core Web Vitalsの測定
3. **視覚回帰テスト**: スクリーンショット比較
4. **セキュリティテスト**: 入力検証とサニタイゼーション
5. **ロードテスト**: 大量データ処理の確認

### テストメトリクス / Test Metrics

- **テストカバレッジ**: バックエンド90%以上、フロントエンド85%以上
- **テスト実行時間**: 全テスト5分以内
- **失敗率**: 1%未満
- **保守性**: 新機能追加時のテスト更新コスト最小化

## まとめ / Conclusion

この包括的なテストスイートにより、English Communication Appの品質と信頼性が確保されています。新機能の追加や変更時には、該当するテストケースの追加・更新も併せて行うことを推奨します。

テストに関する質問や改善提案がある場合は、プロジェクトの開発チームまでお問い合わせください。