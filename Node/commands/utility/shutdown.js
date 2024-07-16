const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const process = require("node:process");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Turn off the NodeJS server.'),
    async execute(interaction) {
        await interaction.reply('Attempting to shut down...');
        await interaction.followUp({content: 'https://j.gifs.com/m21ZlB.gif'})
        process.exit();
    }
}