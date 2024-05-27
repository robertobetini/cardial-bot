const Discord = require("discord.js");

const commandLoader = require("./commandLoader");
const StatusService = require("./services/statusService");

const commandHandler = require("./interactions/commandInteractionHandler");
const buttonHandler = require("./interactions/buttonInteractionHandler");

require('dotenv').config();

const MILLIS_IN_SECOND = 1000;
const UPDATE_SILENT_USERS_INTERVAL_TIME = Number(process.env.UPDATE_SILENT_USERS_INTERVAL_TIME) * MILLIS_IN_SECOND ?? 60000;

const client = new Discord.Client({ intents: [ Discord.GatewayIntentBits.Guilds ] });

commandLoader.loadAllCommands(client);
commandLoader.deployAllCommands()
    .then()
    .catch(err => console.log(err));

client.on("ready", () => {
	console.log("Bot is ready.");
	setInterval(async () => await StatusService.updateUserSilentRoles(), UPDATE_SILENT_USERS_INTERVAL_TIME);
});

client.on(Discord.Events.InteractionCreate, async interaction => {
	if (interaction.isButton()) {
		await buttonHandler.handleAsync(interaction);
	}
	if (interaction.isChatInputCommand()) {
		await commandHandler.handleAsync(interaction);
    }
});

client.login(process.env.TOKEN);
