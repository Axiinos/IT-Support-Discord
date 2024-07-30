const { SlashCommandBuilder, Snowflake, EmbedBuilder} = require('discord.js');
const { joinVoiceChannel, VoiceReceiver, entersState, createAudioResource, createAudioPlayer, NoSubscriberBehavior, StreamType,
    VoiceConnectionStatus, EndBehaviorType
} = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const { Transform, pipeline} = require('stream');
const prism = require('prism-media');
const { encodeWav } = require('../../process/converttowave.js')
const wait = require('node:timers/promises').setTimeout;
const { EventEmitter } = require('events')
const pyenv = path.join(__dirname, '../../../.venv/Scripts/python.exe', )
const whisperScriptPath = path.join(__dirname, './whisper_module.py');
const scriptPath = path.join(__dirname, './response.py');
const { spawn } = require('child_process')
const console = require("node:console");

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
                            const receiver = connection.receiver;
                            const fileReady = new EventEmitter();
                            const time_to = 500;

                            let listening = true;

                            fileReady.on('isReady', async (filePath, userId) => {
                                console.log('initializing Children')
                                const processVoice = spawn(pyenv, [whisperScriptPath, filePath]);


                                let voiceResult = '';
                                let textResult = '';


                                await processVoice.stdout.on('data', function(data){
                                    voiceResult += data.toString();
                                    console.log(voiceResult)
                                })
                                processVoice.stderr.on('data', function(data){
                                    console.error(`processVoice error:\n ${data}`);
                                })

                                processVoice.on("close", function(code) {

                                    console.log(`processVoice exited with code ${code}. attempting to process Results`)
                                    const processResult = spawn(pyenv, [scriptPath, userId, voiceResult])

                                    processResult.stdout.on('data',function(data){
                                    textResult += data.toString();
                                    console.log(textResult)

                                    const embed = new EmbedBuilder()
                                        .setTitle(`Support Request: ${voiceResult} `)
                                        .setDescription(`${textResult}`)
                                        .setTimestamp();
                                    interaction.followUp({embeds: [embed] });

                                    listening = true;

                                    processResult.stderr.on('data', function(data){
                                        console.error(`processResult error:\n ${data}`);
                                    })
                                    processResult.on('close', function(code) {
                                    if (code === 0) {
                                        console.log('Command executed successfully');
                                    } else {
                                        console.log(`Command exited with code ${code}`);
                                            }
                                        })
                                    })
                                })
                            })


                            receiver.speaking.on('start', (userId) => {
                                if (!listening) return;

                                console.log('1. Start speaking event triggered');

                                listening = false

                                // populate time with latest date time


                                const audioReceiveStream = receiver.subscribe(userId, {
                                    end: {
                                        behavior: EndBehaviorType.AfterSilence,
                                        duration: time_to,
                                    }
                                })

                                audioReceiveStream.on('error', (error) => {
                                    console.log("audioReceiveStream error: ", error);
                                });
                                const time = new Date().getTime();

                                const audioPath = `./recordings/${userId}_${time}.wav`




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
                                    // logStream end
                                });

                                pipeline(audioReceiveStream, opusDecoder, out, (err) => {
                                    if (err) {
                                        console.error('Pipeline failed.', err);
                                    } else {
                                        console.log('Pipeline succeeded.');
                                    }
                                    // Pipeline End
                                });
                                out.on('finish', () => {
                                    console.log('wrapping pcm to wav')
                                    const filename = `./recordings/${userId}_${time}.pcm`;
                                    const pcmData = fs.readFileSync(filename)

                                    const wavData = new encodeWav(pcmData, {
                                        numChannels:2,
                                        sampleRate: 48000,
                                        bitDepth: 16
                                    })
                                    fs.writeFileSync(`./recordings/${userId}_${time}.wav`, wavData)
                                    fs.unlinkSync(`./recordings/${userId}_${time}.pcm`)


                                    const wavFilePath = `recordings/${userId}_${time}.wav`;
                                    console.log('Emitting isReady signal to event listener fileReady')
                                    fileReady.emit('isReady', wavFilePath, userId);
                                });

                                // receiver.speaking.on end
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



