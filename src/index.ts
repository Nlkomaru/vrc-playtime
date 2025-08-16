/**
 * VRChat Playtime Discord Bot
 * 
 * Steam APIからVRChatのプレイ時間を取得してDiscordに送信するCloudflare Worker
 */

interface SteamGame {
	appid: number;
	playtime_2weeks: number;
	playtime_forever: number;
}

interface SteamResponse {
	response: {
		games: SteamGame[];
	};
}

interface DiscordWebhookPayload {
	content?: string;
	embeds?: Array<{
		title?: string;
		description?: string;
		color?: number;
		fields?: Array<{
			name: string;
			value: string;
			inline?: boolean;
		}>;
		timestamp?: string;
	}>;
}

export default {
	async fetch(req) {
		const url = new URL(req.url);
		url.pathname = '/__scheduled';
		url.searchParams.append('cron', '* * * * *');
		return new Response(`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`);
	},

	async scheduled(event, env, ctx): Promise<void> {
		try {
			console.log(`VRChat Playtime check triggered at ${event.cron}`);
			
			// Steam APIからVRChatのプレイ時間を取得
			const playtime = await getVRChatPlaytime(env);
			
			if (playtime !== null) {
				// Discordに送信
				await sendToDiscord(playtime, env);
				console.log(`Successfully sent playtime to Discord: ${playtime} hours`);
			} else {
				console.log('Failed to get VRChat playtime');
			}
		} catch (error) {
			console.error('Error in scheduled task:', error);
		}
	},
} satisfies ExportedHandler<Env>;

async function getVRChatPlaytime(env: Env): Promise<number | null> {
	try {
		const STEAM_API_KEY = env.STEAM_API_KEY;
		const STEAM_ID = env.STEAM_USER_ID;
		
		if (!STEAM_API_KEY || !STEAM_ID) {
			console.error('Missing Steam API credentials');
			return null;
		}

		const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&format=json`;
		const response = await fetch(url);
		
		if (!response.ok) {
			console.error(`Steam API request failed: ${response.status}`);
			return null;
		}

		const data = await response.json() as SteamResponse;
		const games = data.response.games;
		const vrchat = games.find((game: SteamGame) => game.appid === 438100);
		
		if (!vrchat) {
			console.error('VRChat not found in owned games');
			return null;
		}

		// 分を時間に変換
		const playtimeHours = Math.round((vrchat.playtime_forever / 60) * 100) / 100;
		return playtimeHours;
	} catch (error) {
		console.error('Error getting VRChat playtime:', error);
		return null;
	}
}

async function sendToDiscord(playtime: number, env: Env): Promise<void> {
	try {
		const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_URL;
		
		if (!DISCORD_WEBHOOK_URL) {
			console.error('Missing Discord webhook URL');
			return;
		}

		const payload: DiscordWebhookPayload = {
			embeds: [{
				title: '🎮 VRChat Playtime Update',
				description: 'Steamから取得したVRChatのプレイ時間です',
				color: 0x00ff00, // 緑色
				fields: [
					{
						name: '📊 総プレイ時間',
						value: `${playtime} 時間`,
						inline: true
					},
					{
						name: '⏰ 更新時刻',
						value: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
						inline: true
					}
				],
				timestamp: new Date().toISOString()
			}]
		};

		const response = await fetch(DISCORD_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			console.error(`Discord webhook failed: ${response.status}`);
		}
	} catch (error) {
		console.error('Error sending to Discord:', error);
	}
}
