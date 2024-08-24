require("dotenv").config();
let youtubeLinks = require('../server/links.json');


const { Client, GatewayIntentBits } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const { createResource } = require("./utils");
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

client.once('ready', async () => {
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

    player.play(currentResource)


    player.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!');
    });
    player.on(AudioPlayerStatus.Idle, () => {
        console.log("The audio player is idle!");
        // player.pause();
        nextSong();
    });
    player.on(AudioPlayerStatus.Paused, () => {
        console.log('The audio player is paused!');
    })

});




// WEB COMMANDS


const webResume = async () => {
    player.unpause();
}

const webPause = () => {
    player.pause();
}

const webPlay = async (index) => {
    return new Promise(async (resolve, reject) => {
        if (!youtubeLinks[index]) {
            return resolve(false);
        }
        nowPlayingIndex = index;
        currentResource = createResource(youtubeLinks[nowPlayingIndex].link, currentVolume);
        player.play(currentResource)
        return resolve(youtubeLinks[index]);
    })
}

const webPrev = () => {
    if (nowPlayingIndex === 0) {
        nowPlayingIndex = youtubeLinks.length - 1;
    } else {
        nowPlayingIndex--
    }
    currentResource = createResource(youtubeLinks[nowPlayingIndex].link, currentVolume);
    player.play(currentResource);
    console.log("Now playing: ", youtubeLinks[nowPlayingIndex].title)
}

const nextSong = () => {
    if (nowPlayingIndex === youtubeLinks.length - 1) {
        nowPlayingIndex = 0;
    } else {
        nowPlayingIndex++
    }
    currentResource = createResource(youtubeLinks[nowPlayingIndex].link, currentVolume);
    player.play(currentResource);
    console.log("Now playing: ", youtubeLinks[nowPlayingIndex].title)
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

module.exports = {
    webPlay,
    webPause,
    nextSong,
    webPrev,
    webResume,
    volumeUp,
    volumeDown
}

// client.login(process.env.DISCORD_TOKEN);
