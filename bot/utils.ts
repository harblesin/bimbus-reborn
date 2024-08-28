const ytdl = require('@distube/ytdl-core');
const { createAudioResource, StreamType } = require('@discordjs/voice');
const db = require('../server/Config/dbConfig.ts');

const createResource = (youtubeLink: string, volume: number) => {
    const stream = ytdl(youtubeLink, { filter: 'audioonly', liveBuffer: 2000, highWaterMark: 1 << 25});
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
        console.info(logWrapper(level, stateChange))
    }
};

const logWrapper = (level:string , message: string) => {
    const now = new Date();
    return `[${process.pid}][${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}][${level}][${message}]`;
}

export {
    createResource,
    fetchSongs,
    stateChangeLogger,
    logWrapper
}