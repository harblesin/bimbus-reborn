const ytdl = require('@distube/ytdl-core');
const { createAudioResource, StreamType } = require('@discordjs/voice');

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

module.exports = {
    createResource
}