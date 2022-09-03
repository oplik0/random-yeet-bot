import { randomInt } from "node:crypto";
import { env, exit } from "node:process";

import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import express from "express";

const app = express();
const port = process.env.PORT || 3333;

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));

app.get("/", async (req, res) => {
	res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_ID}&permissions=29362176&scope=bot`);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages],
});

// When the client is ready, run this code (only once)
client.once("ready", runYeet);

async function disconnectMember(channel, member, message = "Peszek") {
	await member.voice.disconnect(message);
	await channel.send(`${member} ${message}`);
	if (!env.CI) {
		console.log(
			`Kicked ${member.user.username} from channel ${channel.name} in ${channel.guild.name} with message "${message}"`,
		);
	}
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
