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
	try {
		if (interaction.isButton()) {
			Logger.debug(`Processing button interaction (${interaction.customId})`);
			await buttonHandler.handleAsync(interaction);
		} else if (interaction.isModalSubmit()) {
			Logger.debug(`Processing modal submit interaction (${interaction.customId})`);
			await modalHandler.handleAsync(interaction);
		} else if (interaction.isStringSelectMenu()) {
			Logger.debug(`Processing string select menu interaction (${interaction.customId})`);
			await stringSelectMenuHandler.handleAsync(interaction);
		} else if (interaction.isChatInputCommand()) {
			Logger.debug(`Processing chat interaction (${interaction.commandName})`);
			await commandHandler.handleAsync(interaction);
		} else {
			Logger.info(`Couldn't process interaction of type (${interaction.type})`);
		}
	} catch(err) {
		Logger.error(err);
		interaction.replied || interaction.deferred 
                ? await interaction.followUp(`There was an error while executing this command: ${err}`)
                : await interaction.editReply({ content: `There was an error while executing this command: ${err}`});
	}
});

client.login(process.env.TOKEN);
