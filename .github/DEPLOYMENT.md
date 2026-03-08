# デプロイ手順

## Vercelへのデプロイ

### 初回セットアップ

1. **Vercelアカウントの作成**
   - https://vercel.com にアクセスしてアカウントを作成
   - GitHubアカウントと連携

2. **プロジェクトのインポート**
   - Vercelダッシュボードで「Add New Project」をクリック
   - GitHubリポジトリ `momoyama-tech/momolog_admin` を選択
   - Framework Preset: `SvelteKit` を選択

3. **環境変数の設定**
   - Vercelプロジェクト設定 → Environment Variables に以下を追加：
   ```
   PUBLIC_FIREBASE_API_KEY=your_api_key
   PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **GitHub Secretsの設定**
   - GitHubリポジトリ → Settings → Secrets and variables → Actions
   - 以下のSecretsを追加：
     - `VERCEL_TOKEN`: Vercel Settings → Tokens から生成
     - `VERCEL_ORG_ID`: Vercel Settings → General から取得
     - `VERCEL_PROJECT_ID`: Vercelプロジェクト Settings → General から取得
     - Firebase環境変数（上記と同じ）

### 自動デプロイ

- **mainブランチへのpush**: 本番環境に自動デプロイ
- **developブランチへのpush**: プレビュー環境に自動デプロイ
- **Pull Request**: プレビュー環境を自動作成

### 手動デプロイ

```bash
# Vercel CLIをインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ（プレビュー）
vercel

# デプロイ（本番）
vercel --prod
```

## Firebase Hostingへのデプロイ（代替案）

### セットアップ

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

### デプロイ

```bash
npm run build
firebase deploy --only hosting
```

## トラブルシューティング

### ビルドエラー
- 環境変数が正しく設定されているか確認
- `.env.example` と実際の環境変数を照合

### 認証エラー
- Firebase Authenticationが有効になっているか確認
- 認証ドメインがFirebaseコンソールで許可されているか確認
