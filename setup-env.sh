#!/bin/bash

echo "VRChat Playtime Discord Bot の環境変数設定"
echo "=========================================="

# Steam API設定
echo ""
echo "Steam API設定:"
read -p "Steam APIキーを入力してください: " STEAM_API_KEY
read -p "SteamユーザーIDを入力してください: " STEAM_USER_ID

# Discord設定
echo ""
echo "Discord設定:"
read -p "Discord Webhook URLを入力してください: " DISCORD_WEBHOOK_URL

echo ""
echo "環境変数を設定しています..."

# 機密情報をsecretsとして設定
echo $STEAM_API_KEY | npx wrangler secret put STEAM_API_KEY
echo $DISCORD_WEBHOOK_URL | npx wrangler secret put DISCORD_WEBHOOK_URL

# 公開可能な情報をvarsとして設定
npx wrangler secret put STEAM_USER_ID <<< $STEAM_USER_ID

echo ""
echo "環境変数の設定が完了しました！"
echo ""
echo "次のコマンドでデプロイできます："
echo "npm run deploy"
echo ""
echo "開発環境でのテストは以下で実行できます："
echo "npm run dev"
