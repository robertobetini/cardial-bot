const Discord = require("discord.js");

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName("canaldefault")
        .setDescription("Define o cargo de ADM")
        .addChannelOption(option =>
			option
				.setName("channel")
				.setDescription("O canal que receberá por padrão comunicações do bot")
				.setRequired(true)),
    async execute(interaction) {
        try {
            const channel = interaction.options.getChannel("channel");
    
            if (interaction.user.id !== interaction.guild.ownerId) {
                await interaction.editReply("Apenas o dono do servidor pode definir o canal padrão.");
            }
            
            await interaction.editReply(`Canal de comunicação padrão alterado para ${Discord.channelMention(channel.id)}.`);
        } catch(err) {
            await interaction.editReply(err.message);
        }
    }
}
