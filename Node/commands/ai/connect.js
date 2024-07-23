const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, EndBehaviorType, VoiceReceiver, entersState, createAudioResource, createAudioPlayer, NoSubscriberBehavior, StreamType,
    VoiceConnectionStatus
} = require('@discordjs/voice');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Connect to the server voice chat'),
    async execute(interaction) {
        // start the initialization to connect to specified discord voice chat
        await interaction.deferReply()
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

                    interaction.followUp(`Attemtping to join channel ${username} is in....`)
                    try {
                        const connection = joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: voiceChannel.guild.id,
                            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                            selfDeaf: false,
                            selfMute: false
                        });

                        queueConstruct.connection = connection;

                        interaction.followUp(`Connected to ${voiceChannel}`)

                        /**
                         *

                        try {
                            await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
                            const receiver = connection.receiver

                            receiver.speaking.on('start', userId => void)
                        }
                            */
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



