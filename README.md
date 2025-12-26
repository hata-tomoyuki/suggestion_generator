# 見積・提案書ジェネレーター

見積作成から提案書生成、レビュー、承認、共有まで一気通貫で行うNext.jsアプリケーション

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の内容を設定してください：

```bash
# .envファイルを作成
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/suggestion_generator?schema=public"

# NextAuth
AUTH_SECRET="your-secret-key-here-change-in-production"
AUTH_URL="http://localhost:3000"
EOF
```

または、手動で`.env`ファイルを作成して上記の内容をコピーしてください。

### 3. DockerでPostgreSQLを起動

```bash
docker-compose up -d
```

データベースが起動したことを確認:

```bash
docker-compose ps
```

### 4. データベースマイグレーション

```bash
npm run db:migrate
```

### 5. Prisma Clientの生成

```bash
npm run db:generate
```

### 6. Seedデータの投入（オプション）

```bash
npm run db:seed
```

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 使用方法

### ログイン

以下のテストアカウントでログインできます（現在は簡易認証のため、パスワードは任意です）:

- `admin@example.com` - 管理者
- `editor@example.com` - 編集者
- `pm@example.com` - PM承認者
- `sales@example.com` - 営業承認者
- `viewer@example.com` - 閲覧者

### 案件の作成と管理

1. `/quotes` で案件一覧を確認
2. 「新規作成」ボタンで案件を作成
3. 案件詳細ページで要件入力、提案書生成、承認フローを実行

## Dockerコマンド

### データベースの起動

```bash
docker-compose up -d
```

### データベースの停止

```bash
docker-compose down
```

### データベースの停止とデータ削除

```bash
docker-compose down -v
```

### データベースのログ確認

```bash
docker-compose logs -f postgres
```

## 技術スタック

- **フロントエンド**: Next.js 16.1.1 + React 19 + TypeScript + Tailwind CSS
- **バックエンド**: Server Actions + Prisma ORM
- **データベース**: PostgreSQL (Docker)
- **認証**: NextAuth.js v5

## プロジェクト構造

```
app/
  quotes/
    [id]/
      @form/          # Parallel Route: 要件入力
      @preview/       # Parallel Route: 提案書プレビュー
      @side/          # Parallel Route: 見積・承認・共有
      @modal/         # Intercepting Route: モーダル
lib/
  actions/            # Server Actions
  prisma.ts           # Prisma Client
components/           # Reactコンポーネント
prisma/
  schema.prisma       # Prismaスキーマ
  seed.ts             # Seedデータ
```
