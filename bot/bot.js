require("dotenv").config();
let youtubeLinks = require('../server/links.json');

const { Client, GatewayIntentBits } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { createResource } = require("./utils");
const { getIO } = require("../server/socketHandler");
const player = createAudioPlayer();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
});
let nowPlayingIndex = 0;
let currentVolume = .1;
let currentResource = null;

client.once('ready', () => {
    setTimeout( async () => {
        // Fetch the guild and channel
        const guild = await client.guilds.fetch(process.env.DEFAULT_SERVER_ID);
        const channel = await guild.channels.fetch(process.env.DEFAULT_CHANNEL_ID);
    
        const connection = joinVoiceChannel({
            channelId: process.env.DEFAULT_CHANNEL_ID,
            guildId: process.env.DEFAULT_SERVER_ID,
            adapterCreator: guild.voiceAdapterCreator
        });
    
        connection.subscribe(player);
        currentResource = createResource(youtubeLinks[nowPlayingIndex].link, currentVolume);
    
        player.play(currentResource);
    
        player.on(AudioPlayerStatus.Playing, () => {
            console.log('The audio player has started playing!');
            // const io = require("../server/server");
            getIO().emit('nowPlayingUpdate', { message: `Song has changed to: ${youtubeLinks[nowPlayingIndex].title}`, id: youtubeLinks[nowPlayingIndex].id });
        });
        player.on(AudioPlayerStatus.Idle, () => {
            console.log("The audio player is idle!");
            nextSong();
        });
        player.on(AudioPlayerStatus.Paused, () => {
            console.log('The audio player is paused!');
        })

    }, 2000)

});

// WEB COMMANDS

const webResume = async () => {
    player.unpause();
}

const webPause = () => {
    player.pause();
}

const webPlay = async (id) => {
    return new Promise(async (resolve, reject) => {
        let index = youtubeLinks.map(link => link.id).indexOf(id);
        if (!youtubeLinks[index]) {
            return resolve(false);
        }
        nowPlayingIndex = index;
        currentResource = createResource(youtubeLinks[nowPlayingIndex].link, currentVolume);
        player.play(currentResource);
        return resolve(youtubeLinks[index]);
    })
}

const webPrev = () => {
    const currentLinks = require('../server/links.json');
    if (nowPlayingIndex === 0) {
        nowPlayingIndex = youtubeLinks.length - 1;
    } else {
        nowPlayingIndex--
    }
    currentResource = createResource(currentLinks[nowPlayingIndex].link, currentVolume);
    player.play(currentResource);
    console.log("Now playing: ", currentLinks[nowPlayingIndex].title)
}

const nextSong = () => {
    const currentLinks = require('../server/links.json');
    if (nowPlayingIndex === youtubeLinks.length - 1) {
        nowPlayingIndex = 0;
    } else {
        nowPlayingIndex++
    }
    currentResource = createResource(currentLinks[nowPlayingIndex].link, currentVolume);
    player.play(currentResource);
    console.log("Now playing: ", currentLinks[nowPlayingIndex].title)
}

const volumeDown = () => {
    if (currentVolume < .05) {
        return;
    }
    currentVolume = currentVolume - .05;
    currentResource.volume.setVolume(currentVolume);
    console.log("Volume has been set to: ", currentVolume)
}


const volumeUp = () => {
    if (currentVolume > .95) {
        return;
    }
    currentVolume = currentVolume + .05;
    currentResource.volume.setVolume(currentVolume);
    console.log("Volume has been set to: ", currentVolume)
}

const getNowPlaying = () => {
    return nowPlayingIndex;
}

module.exports = {
    webPlay,
    webPause,
    nextSong,
    webPrev,
    webResume,
    volumeUp,
    volumeDown,
    getNowPlaying
}

client.login(process.env.DISCORD_TOKEN);
