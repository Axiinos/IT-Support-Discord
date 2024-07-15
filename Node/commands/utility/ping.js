const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with a Pong..or something else?'),
    async execute(interaction) {
        await interaction.reply({ content: 'is this really a pong?', ephemeral: true})
    },
};