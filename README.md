# VRChat Playtime Discord Bot

VRChatのプレイ時間をSteam APIから取得して、Discordに定期送信するCloudflare Workerです。

## 機能

- Steam APIからVRChatのプレイ時間を自動取得
- 毎日午前9時に実行（cron設定）
- Discord Webhookを使用して美しいEmbed形式で送信
- エラーハンドリングとログ出力

## セットアップ

### 1. 必要な環境変数の設定

以下の環境変数を設定する必要があります：

#### Steam API設定
- `STEAM_API_KEY`: Steam APIキー（[Steam Community](https://steamcommunity.com/dev/apikey)で取得）
- `STEAM_USER_ID`: SteamユーザーID（SteamプロフィールのURLから取得可能）

#### Discord設定
- `DISCORD_WEBHOOK_URL`: Discord WebhookのURL（Discordサーバーの設定から作成）

### 2. 環境変数の設定方法

#### 開発環境
```bash
# 機密情報はsecretsとして設定
npx wrangler secret put STEAM_API_KEY
npx wrangler secret put DISCORD_WEBHOOK_URL

# 公開可能な情報はvarsとして設定
npx wrangler secret put STEAM_USER_ID
```

#### 本番環境
```bash
# 機密情報
npx wrangler secret put STEAM_API_KEY --env production
npx wrangler secret put DISCORD_WEBHOOK_URL --env production

# 公開可能な情報
npx wrangler secret put STEAM_USER_ID --env production
```

### 3. Steam APIキーの取得方法

1. [Steam Community](https://steamcommunity.com/dev/apikey)にアクセス
2. Steamアカウントでログイン
3. ドメイン名を入力（任意の文字列でOK）
4. APIキーを取得

### 4. SteamユーザーIDの取得方法

1. Steamプロフィールページにアクセス
2. URLの数字部分がユーザーID（例：`https://steamcommunity.com/profiles/76561198012345678`の`76561198012345678`）

### 5. Discord Webhookの作成方法

1. Discordサーバーの設定 → 統合 → Webhook
2. 新しいWebhookを作成
3. Webhook URLをコピー

## 使用方法

### 開発環境での実行
```bash
npm run dev
```

### 本番環境へのデプロイ
```bash
npm run deploy
```

## Cron設定

現在の設定では毎日午前9時に実行されます：
- `"0 9 * * *"` = 毎日午前9時

他の間隔に変更したい場合は、`wrangler.jsonc`の`triggers.crons`を編集してください。

## カスタマイズ

### プレイ時間の表示形式
`src/index.ts`の`sendToDiscord`関数でDiscordのEmbed形式をカスタマイズできます。

### 実行間隔の変更
`wrangler.jsonc`のcron設定を変更することで、実行間隔を調整できます。

## トラブルシューティング

### よくあるエラー

1. **Steam API認証エラー**
   - APIキーが正しく設定されているか確認
   - SteamユーザーIDが正しいか確認

2. **Discord送信エラー**
   - Webhook URLが正しく設定されているか確認
   - Discordサーバーの権限設定を確認

3. **VRChatが見つからない**
   - SteamライブラリにVRChatが含まれているか確認
   - アプリID（438100）が正しいか確認

## ライセンス

MIT License
# vrc-playtime
