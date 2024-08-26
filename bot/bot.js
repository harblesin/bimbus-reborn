require("dotenv").config();
// let youtubeLinks = require('../server/links.json');

const { Client, GatewayIntentBits } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { createResource, fetchSongs } = require("./utils");
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
        const songs = await fetchSongs();
        currentResource = createResource(songs[nowPlayingIndex].link, currentVolume);
    
        player.play(currentResource);
    
        player.on(AudioPlayerStatus.Playing, async () => {
            console.log('The audio player has started playing!');
            let songs = await fetchSongs();
            getIO().emit('nowPlayingUpdate', { message: `Song has changed to: ${songs[nowPlayingIndex].title}`, id: songs[nowPlayingIndex].id });
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
        let songs = await fetchSongs();
        let index = songs.map(link => link.id).indexOf(id);
        if (!songs[index]) {
            return resolve(false);
        }
        nowPlayingIndex = index;
        currentResource = createResource(songs[nowPlayingIndex].link, currentVolume);
        player.play(currentResource);
        return resolve(songs[index]);
    })
}

const prevSong = async () => {
    let songs = await fetchSongs();
    if (nowPlayingIndex === 0) {
        nowPlayingIndex = songs.length - 1;
    } else {
        nowPlayingIndex--
    }
    currentResource = createResource(songs[nowPlayingIndex].link, currentVolume);
    player.play(currentResource);
    console.log("Now playing: ", songs[nowPlayingIndex].title)
}

const nextSong = async () => {
    let songs = await fetchSongs();
    if (nowPlayingIndex === songs.length - 1) {
        nowPlayingIndex = 0;
    } else {
        nowPlayingIndex++
    }
    currentResource = createResource(songs[nowPlayingIndex].link, currentVolume);
    player.play(currentResource);
    console.log("Now playing: ", songs[nowPlayingIndex].title)
}

const volumeDown = () => {
    if (currentVolume < .02) {
        return;
    }
    currentVolume = currentVolume - .02;
    currentResource.volume.setVolume(currentVolume);
    console.log("Volume has been set to: ", currentVolume)
}


const volumeUp = () => {
    if (currentVolume > .95) {
        return;
    }
    currentVolume = currentVolume + .02;
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
    prevSong,
    webResume,
    volumeUp,
    volumeDown,
    getNowPlaying
}

client.login(process.env.DISCORD_TOKEN);
