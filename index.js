import { randomInt } from "node:crypto";
import { env, exit } from "node:process";

import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.get("/", async (req, res) => {
	return res.redirect(
		`https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_ID}&permissions=29362176&scope=bot`,
	);
});
app.get("/:page", async (req, res) => {
	return res.redirect(
		`https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_ID}&permissions=29362176&scope=bot`,
	);
});
app.listen(env.PORT || 3000, () => {
	console.log(`listening on port ${env.PORT || 3000}`);
});

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages],
});

// When the client is ready, run this code (only once)
client.once("ready", runYeet);

async function disconnectMember(channel, member, message = "Peszek") {
	// await member.voice.disconnect(message);
	// await channel.send(`${member} ${message}`);
	// if (!env.CI) {
	// 	console.log(
	// 		`Kicked ${member.user.username} from channel ${channel.name} in ${channel.guild.name} with message "${message}"`,
	// 	);
	// }
}

async function runYeet() {
	console.log("yeeting someone");
	for (const guild of client.guilds.cache.values()) {
		const channels = guild.channels.cache.filter(channel => channel.isVoiceBased());
		for (const channel of channels.values()) {
			if (channel.members.size === 0) continue;
			if (randomInt(10000) === 9999) {
				await Promise.all(channel.members.map(member => disconnectMember(channel, member, "miał peszek²")));
			}
			if (env.RANDOMLY_RUN != "true" || randomInt(0, 2 * channel.members.size + 100) > 100) {
				const member = channel.members.at(randomInt(channel.members.size));
				await disconnectMember(channel, member, "miał peszek");
			}
		}
	}
	if (env.CI) {
		exit();
	} else {
		setTimeout(runYeet, randomInt(300, 3600) * 1000);
	}
}

// Login to Discord with your client's token
client.login(env.DISCORD_TOKEN);
