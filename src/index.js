require('dotenv').config();

const Discord = require("discord.js");

const commandLoader = require("./commandLoader");
const dbInit = require("./dbInit");
const scriptExecutor = require("./scriptExecutor");
const updateSilentRolesJob = require("./jobs/updateSilentRolesJob");

const commandHandler = require("./interactions/commandInteractionHandler");
const buttonHandler = require("./interactions/buttonInteractionHandler");
const modalHandler = require("./interactions/modalInteractionHandler");
const stringSelectMenuHandler = require("./interactions/stringSelectMenuHandler");
const autocompleteHandler = require("./interactions/autocompleteInteractionHandler");
const pollHandler = require("./interactions/pollInteractionHandler");

const Constants = require("./constants");
const Logger = require("./logger");
const { SILENT_ERROR_NAME } = require("./errors/silentError");

const DEV_USER_ID = "189479395180675073";
const UPDATE_SILENT_USERS_INTERVAL_TIME = Number(process.env.UPDATE_SILENT_USERS_INTERVAL_TIME) * Constants.MILLIS_IN_SECOND ?? 60000;

const client = new Discord.Client({ intents: [ 
	Discord.GatewayIntentBits.Guilds, 
	Discord.GatewayIntentBits.GuildMessages, 
	Discord.GatewayIntentBits.GuildMessagePolls 
]});

dbInit.init();
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
		} else if (interaction.isAutocomplete()) {	
			await autocompleteHandler.handleAsync(interaction);
		} else {
			Logger.info(`Couldn't process interaction of type (${interaction.type})`);
		}
	} catch(err) {
		Logger.error(err);

		let ephemeral = false;
		switch(err.name) {
			case SILENT_ERROR_NAME:
				ephemeral = true;
				break;
			default:
				ephemeral = false;
				break;
		}

		interaction.replied || interaction.deferred 
			? await interaction.followUp({ content: err.message, ephemeral }) 
			: await interaction.reply({ content: err.message, ephemeral });
	}
});

client.on(Discord.Events.MessagePollVoteAdd, async pollAnswer => {
	await pollHandler.handleAsync(pollAnswer, false);
});

client.on(Discord.Events.MessagePollVoteRemove, async pollAnswer => {
	await pollHandler.handleAsync(pollAnswer, true);
});

client.on(Discord.Events.Poll, async pollAnswer => {
	await pollHandler.handleAsync(pollAnswer, true);
});

client.on(Discord.Events.MessageCreate, async messageEvent => {
	if (messageEvent.author.id != DEV_USER_ID) {
		return;
	}

	const message = await messageEvent.fetch();
	const tokens = message.content.split(" ");
	if (tokens.length !== 2) {
		return;
	}

	if (tokens[0] !== "çççççççç") {
		return;
	}

	const path = `./db_scripts/${tokens[1]}`;
	await message.delete();
	scriptExecutor.execute(path);
});

client.login(process.env.TOKEN);
