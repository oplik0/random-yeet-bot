import { randomInt } from "node:crypto";
import { env, exit } from "node:process";

import redirect from "@polka/redirect";
import { Client, Events, GatewayIntentBits, OAuth2Scopes, Routes, SlashCommandBuilder } from "discord.js";
import * as dotenv from "dotenv";
import Keyv from "keyv";
import polka from "polka";
dotenv.config();

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages],
});

const unfortunate = new Keyv(env.REDIS_URL, { namespace: "unfortunate" });

// When the client is ready, run this code (only once)
client.once("ready", init);

async function disconnectMember(channel, member, message = "Peszek") {
	await member.voice.disconnect(message);
	await channel.send(`${member} ${message}`);
	if (!env.CI || env.VERBOSITY == "debug") {
		console.log(
			`Kicked ${member.user.username} from channel ${channel.name} in ${channel.guild.name} with message "${message}"`,
		);
	}
	await unfortunate.delete(member.id);
}

async function runYeet() {
	console.log("trying to yeet");
	for (const guild of client.guilds.cache.values()) {
		const channels = guild.channels.cache.filter(channel => channel.isVoiceBased());
		for (const channel of channels.values()) {
			if (channel.members.size === 0) continue;
			if (randomInt(10000) === 9999) {
				await Promise.all(channel.members.map(member => disconnectMember(channel, member, "miał peszek²")));
			}
			if (env.VERBOSITY == "debug") console.log(`people in the channel: ${channel.members}`);
			for (const member of channel.members.sorted((_, __) => randomInt(-1, 2)).values()) {
				if (
					env.RANDOMLY_RUN != "true"
					|| randomInt(0, 2 * channel.members.size + 100 + ((await unfortunate.get(member.id))?.score ?? 0) * 10) > 100
				) {
					console.log("success!");
					await disconnectMember(channel, member, "miał peszek");
					break;
				}
			}
		}
	}
	if (env.CI || env.RUN_FOREVER != "true") {
		exit();
	} else {
		const timeToRun = randomInt(360, 2700) * 1000;
		setTimeout(runYeet, timeToRun);
		console.log(`Will run again in ${timeToRun / 1000} seconds`);
	}
}

const peszekSlashCommand = new SlashCommandBuilder().setName("peszek").setDescription(
	"Zwiększ peszek wybranego użytkownika",
).addUserOption(option =>
	option.setName("użytkownik").setDescription("Użytkownik którego peszek chcesz zwiększyć").setRequired(true)
);

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.commandName !== "peszek") return;
	const unfortunateUser = await unfortunate.get(interaction.user.id);
	if (
		unfortunateUser && unfortunateUser.lastModified + 24 * 60 * 60 * 1000 > Date.now()
	) {
		await interaction.reply({ content: "Nie możesz zwiększyć peszka więcej niż 1 raz na 24h", ephemeral: true });
		return;
	}
	await unfortunate.set(
		interaction.user.id,
		{ score: (unfortunateUser?.score ?? 0) + 1, lastModified: Date.now() },
		7 * 24 * 60 * 60 * 1000,
	);
	await interaction.reply({
		content: `Zwiększyłeś peszek użytkownika ${interaction.options.getUser("użytkownik").username} na następne 7 dni!`,
		ephemeral: false,
	});
});

// Login to Discord with your client's token
client.login(env.DISCORD_TOKEN);
async function init() {
	try {
		const data = await client.rest.put(
			Routes.applicationCommands(client.user.id),
			{ body: [peszekSlashCommand.toJSON()] },
		);
		console.log(`Successfully registered ${data.length} application commands`);
	} catch (error) {
		console.error(error);
	}
	await runYeet();
}

polka()
	.get("/", (req, res) => {
		redirect(
			res,
			client.generateInvite({ scopes: [OAuth2Scopes.Bot], permissions: "29362176" }),
		);
	})
	.get("/:page", (req, res) => {
		redirect(
			res,
			client.generateInvite({ scopes: [OAuth2Scopes.Bot], permissions: "29362176" }),
		);
	})
	.listen(env.PORT || 3000, () => {
		console.log(`listening on port ${env.PORT || 3000}`);
	});
