# ==============================================================================
# 日本人向け英会話学習アプリ - フロントエンドDockerfile
# 
# このファイルは、Reactを使用したフロントエンドの
# Dockerコンテナを構築するための設定です
# ==============================================================================

# Node.js 20のアルパインイメージを使用（セキュリティと軽量化）
FROM node:20-alpine

# アプリケーション情報をラベルとして追加
LABEL maintainer="Eikaiwa App Team"
LABEL description="React frontend for English Communication App"
LABEL version="0.1.0"

# 作業ディレクトリを設定（/app内でアプリケーションを実行）
WORKDIR /app

# package.jsonとpackage-lock.jsonを先にコピー
# Dockerのキャッシュ機能を活用して、依存関係の変更がない限り再インストールを避ける
COPY package*.json ./

# 本番用依存関係をインストール
# npm ci: package-lock.jsonを使用した確実なインストール
# --only=production: 本番用パッケージのみ
# --silent: 出力を最小限に抑制
RUN npm ci --only=production --silent

# 開発用依存関係もインストール（ビルドプロセスに必要）
# React Scriptsなどの開発ツールを含む
RUN npm ci --silent

# アプリケーションのソースコードをコピー
COPY . .

# セキュリティ強化：非rootユーザーでアプリケーションを実行
# Node.js用のグループとユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S react -u 1001

# アプリケーションファイルの所有者を非rootユーザーに変更
RUN chown -R react:nodejs /app

# 非rootユーザーに切り替え（セキュリティ向上）
USER react

# Reactアプリケーションが使用するポート3000を公開
# 開発サーバーのデフォルトポート
EXPOSE 3000

# React開発サーバーを起動
# npm start: package.jsonのstartスクリプトを実行
# 通常は react-scripts start コマンドが実行される
CMD ["npm", "start"]
