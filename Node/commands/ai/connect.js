const { SlashCommandBuilder, Snowflake } = require('discord.js');
const { joinVoiceChannel, VoiceReceiver, entersState, createAudioResource, createAudioPlayer, NoSubscriberBehavior, StreamType,
    VoiceConnectionStatus, EndBehaviorType
} = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { Transform, pipeline} = require('stream');
const prism = require('prism-media');
const { encodeWav } = require('../../process/converttowave.js')
const wait = require('node:timers/promises').setTimeout;


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


                        try {
                            await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
                            const receiver = connection.receiver

                            var timeuser = {};
                            let time

                            const time_run = 500;

                            receiver.speaking.on('start', (userId) => {
                                console.log('1. Start speaking event triggered');

                                const audioReceiveStream = receiver.subscribe(userId, {
                                    end: {
                                        behavior: EndBehaviorType.AfterSilence,
                                        duration: time_run,
                                    }
                                }).on('error', (error) => {
                                    console.log("audioReceiveStream error: ", error);
                                });
                                //timeuser.add(${userId})

                                time = new Date().getTime();


                                timeuser[userId] = time

                                const filename = `./recordings/${userId}_${time}.pcm`;
                                const out = fs.createWriteStream(filename);
                                // Create a decoder to decode the Opus audio data into PCM
                                const opusDecoder = new prism.opus.Decoder({frameSize: 960, channels: 2, rate: 48000});

                                // Let's add some logging to the stream to make sure data is flowing
                                const logStream = new Transform({
                                    transform(chunk, encoding, callback) {
                                        //console.log(`Received ${chunk.length} bytes of data.`);
                                        callback(null, chunk);
                                    }
                                });



                                pipeline(audioReceiveStream, opusDecoder, logStream, out, (err) => {
                                    if (err) {
                                        console.error('Pipeline failed.', err);
                                    } else {
                                        console.log('Pipeline succeeded.');
                                    }


                                });



                            });

                            receiver.speaking.on("end", (userId) => {

                                time = timeuser[userId]



                                console.log('1. end speaking event triggered');


                                const filename = `./recordings/${userId}_${time}.pcm`;
                                const pcmData = fs.readFileSync(filename)

                                const wavData = new encodeWav(pcmData, {
                                    numChannels:2,
                                    sampleRate: 48000,
                                    bitDepth: 16
                                })
                                fs.writeFileSync(`./recordings/${userId}_${time}.wav`, wavData)
                                fs.unlinkSync(`./recordings/${userId}_${time}.pcm`)
                            });
                        } catch (e) {
                            console.log('there was an error receiving audio from the connection....');
                        }

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



