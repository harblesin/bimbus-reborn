import db from '../../server/Config/dbConfig';
import ytdl from '@distube/ytdl-core';
import { createAudioResource, StreamType } from '@discordjs/voice';

const createResource = (youtubeLink: string, volume: number) => {
    const stream = ytdl(youtubeLink, {
        filter: 'audioonly',
        highWaterMark: 1 << 30,
        liveBuffer: 20000,
        dlChunkSize: 4096,
        quality: 'lowestaudio'
    });
    const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
    });

    if (Number(resource.volume) !== volume) {
        resource?.volume?.setVolume(volume);
    }

    return resource;
}

const fetchSongs = async () => {
    try {
        let { rows } = await db.query('SELECT * FROM links ORDER BY position ASC');
        return rows;
    } catch (error) {
        console.log(`Error fetching links: ${error}`);
        return [];
    }
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

const logWrapper = (level: string, message: string) => {
    const now = new Date();
    return console.info(`${process.pid} | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | ${level} | ${message}`);
}

export {
    createResource,
    fetchSongs,
    stateChangeLogger,
    logWrapper
}