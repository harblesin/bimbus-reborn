const ytdl = require('@distube/ytdl-core');
const { createAudioResource, StreamType } = require('@discordjs/voice');
const db = require('../server/Config/dbConfig.ts');

const createResource = (youtubeLink: string, volume: number) => {
    const stream = ytdl(youtubeLink, { 
        filter: 'audioonly',
        fmt: 'mp3',
        highWaterMark: 1 << 30,
        liveBuffer: 20000,
        dlChunkSize: 4096,
        bitrate: 128,
        quality: 'lowestaudio'
    });
    const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true,
        volume: volume
    });

    if(resource.volume !== volume) {
        resource.volume.setVolume(volume);
    }

    return resource;
}

const fetchSongs = async () => {
    let { rows } = await db.query('SELECT * FROM links ORDER BY position ASC');
    return rows;
};

interface Status {
    status: string
}

const stateChangeLogger = (level: string, optionalData: string = '') => {
    
    return (oldState: Status, newState: Status) => {
        let stateChange = `${oldState.status}->${newState.status}`
        logWrapper(level, stateChange);
    }
};

const logWrapper = (level:string , message: string) => {
    const now = new Date();
    return console.info(`${process.pid} | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | ${level} | ${message}`);
}

export {
    createResource,
    fetchSongs,
    stateChangeLogger,
    logWrapper
}