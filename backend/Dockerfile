# ==============================================================================
# 日本人向け英会話学習アプリ - バックエンドDockerfile
# 
# このファイルは、FastAPI + uvを使用したPythonバックエンドの
# Dockerコンテナを構築するための設定です
# ==============================================================================

# Python 3.12のアルパインイメージを使用（軽量化とセキュリティ向上）
FROM python:3.12-alpine

# アプリケーション情報をラベルとして追加（運用時の管理に便利）
LABEL maintainer="Eikaiwa App Team"
LABEL description="FastAPI backend for English Communication App"
LABEL version="0.1.0"

# 作業ディレクトリを設定（/app内でアプリケーションを実行）
WORKDIR /app

# システムパッケージを更新し、Python拡張のビルドに必要なパッケージをインストール
# curl: ヘルスチェック用
# gcc, musl-dev: Pythonパッケージのコンパイルに必要
RUN apk update && apk add --no-cache \
    curl \
    gcc \
    musl-dev \
    && rm -rf /var/cache/apk/*

# Python依存関係管理ツールuvをインストール
# uvは高速なPythonパッケージマネージャーで、AGENTS.mdの要件
RUN pip install --no-cache-dir uv

# Pythonの依存関係設定ファイルをコピー
# 先にこれらのファイルをコピーすることで、Dockerのキャッシュ機能を活用
COPY requirements.txt pyproject.toml uv.lock ./

# Pythonパッケージの依存関係をインストール
# --system フラグでシステム全体にインストール（仮想環境不要）
RUN uv pip install --system -r requirements.txt

# アプリケーションのソースコードをコピー
COPY . .

# セキュリティ強化：非rootユーザーでアプリケーションを実行
# 専用ユーザー 'appuser' を作成
RUN adduser -D -s /bin/sh appuser

# アプリケーションファイルの所有者を変更
RUN chown -R appuser:appuser /app

# 非rootユーザーに切り替え
USER appuser

# アプリケーションが使用するポート8000を公開
# FastAPIのデフォルトポート
EXPOSE 8000

# ヘルスチェック設定
# コンテナの健康状態を監視し、ロードバランサーやオーケストレーションツールに状態を報告
# --interval=30s: 30秒間隔でチェック
# --timeout=10s: 10秒でタイムアウト
# --start-period=5s: 起動後5秒待ってからチェック開始
# --retries=3: 3回失敗したら不健康と判定
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 本番環境用のアプリケーション起動コマンド
# uv run: uvを使用してアプリケーションを実行
# uvicorn: ASGIサーバー（FastAPI用）
# main:app: main.pyファイルのappインスタンス
# --host 0.0.0.0: 全てのインターフェースからアクセス可能
# --port 8000: ポート8000で待ち受け
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
