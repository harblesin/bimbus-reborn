const ytdl = require('@distube/ytdl-core');
const { createAudioResource, StreamType } = require('@discordjs/voice');
const db = require('../server/Config/dbConfig.ts');

const createResource = (youtubeLink, volume) => {
    const stream = ytdl(youtubeLink, { filter: 'audioonly' });
    const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
    });

    if(resource.volume !== volume) {
        resource.volume.setVolume(volume);
    }

    return resource;
}

const fetchSongs = async () => {
    let { rows } = await db.query('SELECT * FROM links ORDER BY position ASC');
    return rows;
}

module.exports = {
    createResource,
    fetchSongs
}