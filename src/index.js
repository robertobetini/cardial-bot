const Discord = require("discord.js");

const commandLoader =  require("./commandLoader");
const StatusService = require("./services/statusService");

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
	if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = interaction.client.commands.get(interaction.commandName);
	
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	// reply at command acknowledgement and later edit to avoid losing interaction
	await interaction.reply(".");

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp("There was an error while executing this command!");
		} else {
			await interaction.editReply("There was an error while executing this command!");
		}
	}
});

client.login(process.env.TOKEN);
