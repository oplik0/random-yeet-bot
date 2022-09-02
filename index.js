import { randomInt } from "node:crypto";
import { env, exit } from "node:process";

import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// When the client is ready, run this code (only once)
client.once("ready", async () => {
	for (const guild of client.guilds.cache.values()) {
		const channels = guild.channels.cache.filter(channel => channel.isVoiceBased());
		for (const channel of channels.values()) {
			if (channel.members.size > 0 && (env.RANDOMLY_RUN != "true" || randomInt(0, 100) < 10)) {
				await channel.members.at(randomInt(channel.members.size)).voice.disconnect("Peszek");
			}
		}
		exit();
	}
});

// Login to Discord with your client's token
client.login(env.DISCORD_TOKEN);
