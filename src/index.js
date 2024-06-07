const Discord = require("discord.js");

const commandLoader = require("./commandLoader");
const EmbededResponseService = require("./services/embededResponseService");

const commandHandler = require("./interactions/commandInteractionHandler");
const buttonHandler = require("./interactions/buttonInteractionHandler");
const modalHandler = require("./interactions/modalInteractionHandler");
const stringSelectMenuHandler = require("./interactions/stringSelectMenuHandler");

require('dotenv').config();

const MILLIS_IN_SECOND = 1000;
const UPDATE_SILENT_USERS_INTERVAL_TIME = Number(process.env.UPDATE_SILENT_USERS_INTERVAL_TIME) * MILLIS_IN_SECOND ?? 60000;

const client = new Discord.Client({ intents: [ Discord.GatewayIntentBits.Guilds ] });

commandLoader.loadAllCommands(client);
commandLoader.deployAllCommands()
    .then()
    .catch(err => console.error(err));

client.on("ready", () => {
	console.log("[INFO] Bot is ready.");
	setInterval(async () => await EmbededResponseService.updateUserSilentRoles(), UPDATE_SILENT_USERS_INTERVAL_TIME);
});

client.on(Discord.Events.InteractionCreate, async interaction => {
	if (interaction.isButton()) {
		console.log(`[INFO] Processing button interaction (${interaction.customId})`);
		await buttonHandler.handleAsync(interaction);
	}
	if (interaction.isModalSubmit()) {
		console.log(`[INFO] Processing modal submit interaction (${interaction.customId})`);
		await modalHandler.handleAsync(interaction);
	}
	if (interaction.isStringSelectMenu()) {
		console.log(`[INFO] Processing string select menu interaction (${interaction.customId})`);
		await stringSelectMenuHandler.handleAsync(interaction);
	}
	if (interaction.isChatInputCommand()) {
		console.log(`[INFO] Processing chat interaction (${interaction.commandName})`);
		await commandHandler.handleAsync(interaction);
    }
});

client.login(process.env.TOKEN);
