/*
const { OpusEncoder, EndBehaviorType } = require("@discordjs/opus");

const fs = require('fs');
const prism = require('prism-media');
const { pipeline, Transform } = require('stream');
const time = new Date().getTime();

module.export = function transcriptionDevice(userID, voiceConn) {
    console.log('1. Start speaking event triggered');

    const audioReceiveStream = voiceConn.receiver.subscribe(userID,{
        end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 500,
        }
    }).on('error', (error) => {
        console.log("audioReceiveStream error: ", error);
    });

    const filename = `./recordings/${userID}_${time}.pcm`;
    const out = fs.createWriteStream(filename);
    // Create a decoder to decode the Opus audio data into PCM
    const opusDecoder = new prism.opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });

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
}

 */