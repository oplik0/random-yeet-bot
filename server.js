import bodyParser from "body-parser";
import express from "express";
import { env } from "node:process";

const app = express();
const port = env.PORT || 3333;

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));

app.get("/health", async (req, res) => {
	res.json({ status: "up" });
});
app.get("/", async (req, res) => {
	res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_ID}&permissions=29362176&scope=bot`);
	return `go to https://discord.com/api/oauth2/authorize?client_id=${env.DISCORD_ID}&permissions=29362176&scope=bot`;
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
