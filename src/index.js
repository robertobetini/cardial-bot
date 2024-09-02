require('dotenv').config();

const Discord = require("discord.js");

const commandLoader = require("./commandLoader");
const dbInit = require("./dbInit");
const sqlScriptExecutor = require("./sqlScriptExecutor");
const jsScriptExecutor = require("./jsScriptExecutor");

const updateSilentRolesJob = require("./jobs/updateSilentRolesJob");
const monitoringJob = require("./jobs/monitoringJob");

const commandHandler = require("./interactions/commandInteractionHandler");
const buttonHandler = require("./interactions/buttonInteractionHandler");
const modalHandler = require("./interactions/modalInteractionHandler");
const stringSelectMenuHandler = require("./interactions/stringSelectMenuHandler");
const autocompleteHandler = require("./interactions/autocompleteInteractionHandler");
const pollHandler = require("./interactions/pollInteractionHandler");

const Constants = require("./constants");
const Logger = require("./logger");
const Cache = require("./cache");
const { SilentError } = require("./errors/silentError");
const { randomUUID } = require("./utils");

const DEV_USER_ID = "189479395180675073";
const UPDATE_SILENT_USERS_INTERVAL_TIME = Number(process.env.UPDATE_SILENT_USERS_INTERVAL_TIME) * Constants.MILLIS_IN_SECOND ?? 60000;
const MONITORING_INTERVAL_TIME = Constants.MONITORING_INTERVAL_IN_SECONDS * Constants.MILLIS_IN_SECOND;

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
	if (err instanceof SilentError) {
		ephemeral = true
	} else if (err instanceof Discord.DiscordAPIError) {
		if (err.message.includes("Unknown interaction")) {
			Logger.warn("An interaction response exceeded time limit (3.0s)");
			return;
		} else if (err.message.includes("Unknown Message")) {
			Logger.warn("Tried to modify or delete an already deleted message");
			return;
		}
	} else {
		ephemeral = false;
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
			const timeLabel = `Interaction ${interaction.id} time`;
			Logger.time(timeLabel);
			try { 
				const newMessage = await collectHandler(interaction);
				updateInteractionCollectors(newMessage, componentType, lifetime, collectHandler, endHandler);
			} catch (err) {
				await  handleError(interaction, err);
			} finally {
				Logger.timeEnd(timeLabel);
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
	if (Constants.PERFORMANCE_MONITOR_CHANNEL_ID) {
		setInterval(async () => await monitoringJob.execute(client), MONITORING_INTERVAL_TIME);
	}
});

client.on(Discord.Events.InteractionCreate, async interaction => {
	const timeLabel = `Interaction ${interaction.id} time`;
	let logTime = false;

	try {
		if (interaction.isButton()) {
			return;
		} else if (interaction.isModalSubmit()) {
			logTime = true;
			Logger.time(timeLabel);
			await modalHandler.handleAsync(interaction);
		} else if (interaction.isStringSelectMenu()) {
			return;
		} else if (interaction.isChatInputCommand()) {
			logTime = true;
			Logger.time(timeLabel);
			const message = await commandHandler.handleAsync(interaction);
			updateInteractionCollectors(message);
		} else if (interaction.isAutocomplete()) {
			logTime = true;
			Logger.time(timeLabel);
			await autocompleteHandler.handleAsync(interaction);
		} else {
			Logger.info(`Couldn't process interaction of type (${interaction.type})`);
		}
	} catch(err) {
		logTime = true;
		Logger.time(timeLabel);
		await  handleError(interaction, err);
	} finally {
		if (logTime) {
			Logger.timeEnd(timeLabel);
		}
	}
});

client.on(Discord.Events.MessagePollVoteAdd, async pollAnswer => {
	const timeLabel = `Interaction (poll) ${pollAnswer.id} time`;
	Logger.time(timeLabel);
	await pollHandler.handleAsync(pollAnswer, false);
	Logger.timeEnd(timeLabel);
});

client.on(Discord.Events.MessagePollVoteRemove, async pollAnswer => {
	const timeLabel = `Interaction (poll) ${pollAnswer.id} time`;
	Logger.time(timeLabel);
	await pollHandler.handleAsync(pollAnswer, true);
	Logger.timeEnd(timeLabel);
});

client.on(Discord.Events.Poll, async pollAnswer => {
	const timeLabel = `Interaction (poll) ${pollAnswer.id} time`;
	Logger.time(timeLabel);
	await pollHandler.handleAsync(pollAnswer, true);
	Logger.timeEnd(timeLabel);
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
