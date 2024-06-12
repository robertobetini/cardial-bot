require('dotenv').config();

const Discord = require("discord.js");

const commandLoader = require("./commandLoader");
const updateSilentRolesJob = require("./jobs/updateSilentRolesJob");

const commandHandler = require("./interactions/commandInteractionHandler");
const buttonHandler = require("./interactions/buttonInteractionHandler");
const modalHandler = require("./interactions/modalInteractionHandler");
const stringSelectMenuHandler = require("./interactions/stringSelectMenuHandler");

const Constants = require("./constants");
const Logger = require("./logger");

const UPDATE_SILENT_USERS_INTERVAL_TIME = Number(process.env.UPDATE_SILENT_USERS_INTERVAL_TIME) * Constants.MILLIS_IN_SECOND ?? 60000;

const client = new Discord.Client({ intents: [ Discord.GatewayIntentBits.Guilds ] });

commandLoader.loadAllCommands(client);
commandLoader.deployAllCommands()
    .then()
    .catch(err => Logger.error(err));

client.on("ready", () => {
	Logger.info("Bot is ready.");
	setInterval(async () => await updateSilentRolesJob.execute(), UPDATE_SILENT_USERS_INTERVAL_TIME);
});

client.on(Discord.Events.InteractionCreate, async interaction => {
	if (interaction.isButton()) {
		Logger.info(`Processing button interaction (${interaction.customId})`);
		await buttonHandler.handleAsync(interaction);
	}
	if (interaction.isModalSubmit()) {
		Logger.info(`Processing modal submit interaction (${interaction.customId})`);
		await modalHandler.handleAsync(interaction);
	}
	if (interaction.isStringSelectMenu()) {
		Logger.info(`Processing string select menu interaction (${interaction.customId})`);
		await stringSelectMenuHandler.handleAsync(interaction);
	}
	if (interaction.isChatInputCommand()) {
		Logger.info(`Processing chat interaction (${interaction.commandName})`);
		await commandHandler.handleAsync(interaction);
    }

	Logger.info(`Couldn't process interaction of type (${interaction.type})`);
});

client.login(process.env.TOKEN);
