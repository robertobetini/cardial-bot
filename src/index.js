require('dotenv').config();

const Discord = require("discord.js");

const commandLoader = require("./commandLoader");
const dbInit = require("./dbInit");
const sqlScriptExecutor = require("./sqlScriptExecutor");
const jsScriptExecutor = require("./jsScriptExecutor");
const updateSilentRolesJob = require("./jobs/updateSilentRolesJob");

const commandHandler = require("./interactions/commandInteractionHandler");
const buttonHandler = require("./interactions/buttonInteractionHandler");
const modalHandler = require("./interactions/modalInteractionHandler");
const stringSelectMenuHandler = require("./interactions/stringSelectMenuHandler");
const autocompleteHandler = require("./interactions/autocompleteInteractionHandler");
const pollHandler = require("./interactions/pollInteractionHandler");

const Constants = require("./constants");
const Logger = require("./logger");
const Cache = require("./cache");
const { SILENT_ERROR_NAME } = require("./errors/silentError");
const { randomUUID } = require("./utils");

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

const COLLECTOR_LIFETIME = Constants.INTERACTION_COLLECTOR_LIFETIME_IN_HOURS * Constants.HOUR_IN_MILLIS;
const collectors = {};

const handleError = async (interaction, err) => {
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

const createInteractionCollector = (message, componentType, lifetime, collectHandler, endHandler) => {
	const collectorId = randomUUID();
	collectors[collectorId] = message
		.createMessageComponentCollector({ componentType: componentType, time: lifetime })
		.on('collect', async interaction => {
			try { 
				const newMessage = await collectHandler(interaction);
				updateInteractionCollectors(newMessage, componentType, lifetime, collectHandler, endHandler);
			} catch (err) {
				await  handleError(interaction, err);
			}
		})
		.on('end', async collected => {
			Logger.info(`Stopping collecting interactions (total: ${collected.size}) from message: ${message?.id}, channel: ${message?.channel?.id}, guild: ${message?.guild?.id}`);
			delete collectors[collectorId];
			if (endHandler) {
				await endHandler(collected);
			}
		});
}

const updateInteractionCollectors = (message) => {
	if (!message) {
		return;
	}
	
	createInteractionCollector(message, Discord.ComponentType.Button, COLLECTOR_LIFETIME, buttonHandler.handleAsync);
	createInteractionCollector(message, Discord.ComponentType.StringSelect, COLLECTOR_LIFETIME, stringSelectMenuHandler.handleAsync);
}

client.on("ready", () => {
	Logger.info("Bot is ready.");
	setInterval(async () => await updateSilentRolesJob.execute(), UPDATE_SILENT_USERS_INTERVAL_TIME);
});

client.on(Discord.Events.InteractionCreate, async interaction => {
	try {
		if (interaction.isButton()) {
			return;
		} else if (interaction.isModalSubmit()) {
			await modalHandler.handleAsync(interaction);
		} else if (interaction.isStringSelectMenu()) {
			return;
		} else if (interaction.isChatInputCommand()) {
			const message = await commandHandler.handleAsync(interaction);
			updateInteractionCollectors(message);
		} else if (interaction.isAutocomplete()) {	
			await autocompleteHandler.handleAsync(interaction);
		} else {
			Logger.info(`Couldn't process interaction of type (${interaction.type})`);
		}
	} catch(err) {
		await  handleError(interaction, err);
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
	const botId = client.user.id;
	switch (messageEvent.author.id) {
		case DEV_USER_ID:
			await handleDevMessage(messageEvent);
			return;
		case botId:
			await handleBotMessage(messageEvent);
			return;
	}	
});

const handleDevMessage = async (messageEvent) => {
	const message = await messageEvent.fetch();
	const tokens = message.content.split(" ");

	if (tokens[0] === "####cache") {
		await message.channel.send("```js\n" + Cache.cacheSummary() + "\n```");
	}

	if (tokens.length !== 2) {
		return;
	}

	if (tokens[0] === "####sql") {
		const path = `./db_scripts/${tokens[1]}`;
		sqlScriptExecutor.execute(path);
		await message.delete();
	} else if (tokens[0] === "####js") {
		jsScriptExecutor.execute(tokens[1]);
		await message.delete();
	}
}

const handleBotMessage = async (messageEvent) => {
	// message type 46 is POLL_RESULT (not implemented in discord.js v14.15.3)
	if (messageEvent.type !== 46) {
		return;
	}

	Logger.info("Deleting bot poll result message");
	await messageEvent.delete();
}

client.login(process.env.TOKEN);
