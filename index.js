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
			if (channel.members.size === 0) continue;
			if (randomInt(10000) === 9999) {
				await Promise.all(channel.members.map(member => disconnectMember(member, "Peszek²")));
			}
			if ((env.RANDOMLY_RUN != "true" || randomInt(0, channel.members.size + 11) > 10)) {
				const member = channel.members.at(randomInt(channel.members.size));
				disconnectMember(member, "Peszek");
			}
		}
		exit();
	}
});

async function disconnectMember(member, message = "Peszek") {
	await member.voice.disconnect(message);
	const DMChannel = await member.createDM();
	await DMChannel.send(message);
}

// Login to Discord with your client's token
client.login(env.DISCORD_TOKEN);
