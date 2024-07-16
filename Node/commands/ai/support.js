const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { spawn } = require('child_process')
const console = require("node:console");
const path = require('path');
const pyenv = path.join(__dirname, '../../../.venv/Scripts/python.exe', )
const scriptPath = path.join(__dirname, './response.py');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Ask the Bot for general IT Support!')
        .addStringOption(option =>
            option
                .setName('problem')
                .setDescription('Please describe the problem you have with your computer and remember to add brand and model.')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('problem');
        console.log(message);
        const command = spawn(pyenv, [scriptPath, interaction.user.id, message]);

        let result = '';

        await command.stdout.on('data', function(data){
            result += data.toString();
            console.log(result)

            const embed = new EmbedBuilder()
                .setTitle(`Support Request: ${message} `)
                .setDescription(`${result}`)
                .setTimestamp();

            interaction.followUp({embeds: [embed] });
        } );
        await wait(10000)
        await command.on('close', function(code){
            if (code === 0) {
                console.log('Command executed successfully');
            } else {
                console.log(`Command exited with code ${code}`);
            }
        });
    }
}