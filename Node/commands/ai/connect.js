const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, NoSubscriberBehavior, StreamType} = require('@discordjs/voice');
let clientMap;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Connect to the server voice chat'),
    async execute(interaction) {
        // start the initialization to connect to specified discord voice chat
        try{
            const username = interaction.member.user.username;
            const voiceChannel = interaction.member?.voice.channel;

            const queue = new Map();


            if (voiceChannel != null) {

                const serverQueue = queue.get(interaction.guild.id);

                if (!serverQueue) {

                    const queueConstruct = {
                        textChannel: interaction.channel,
                        voiceChannel: voiceChannel,
                        connection: null,
                    };

                    queue.set(interaction.guild.id, queueConstruct);

                    try {
                        const connection = joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: voiceChannel.guild.id,
                            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                            selfDeaf: false
                        });

                        queueConstruct.connection = connection;
                        interaction.channel.send(`Connecting to channel ${username} is in.`)
                    } catch (err) {
                        console.error(err);
                        queue.delete(interaction.guild.id);

                        interaction.channel.send('There was an error joining the channel.')
                    }
                }
            }
            else if (voiceChannel === null) {
                console.log(username + ' is not in the voice channel...')
                await interaction.reply('you have to be in voice chat!')
            }
        } catch (err) {
            console.log(err)
            interaction.channel.send(`An error occurred while connecting to the voice channel: ${err.message}`);
        }
    }
}



