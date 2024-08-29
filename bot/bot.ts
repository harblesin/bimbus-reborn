
require("dotenv").config();

const { Client, GatewayIntentBits } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { createResource, fetchSongs, stateChangeLogger, logWrapper } = require("./utils");
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
let currentResource: any = null;
let webPlayerIsPaused = false;

let guild: any;

client.once('ready', async () => {
    // Fetch the guild and channel
    guild = await client.guilds.fetch(process.env.DEFAULT_SERVER_ID);
    const channel = await guild.channels.fetch(process.env.DEFAULT_CHANNEL_ID);

    logWrapper('Client', `Bimbus has successfully logged into discord server: ${guild}!`)

    const connection = joinVoiceChannel({
        debuge: process.env.NODE_ENV === 'development' ? true : false,
        channelId: process.env.DEFAULT_CHANNEL_ID,
        guildId: process.env.DEFAULT_SERVER_ID,
        adapterCreator: guild.voiceAdapterCreator
    });

    logWrapper('Client', `Bimbus joined discord channel: ${channel}`)

    connection.subscribe(player);
    const songs = await fetchSongs();
    currentResource = createResource(songs[nowPlayingIndex].link, currentVolume);

    connection.on('stateChange', stateChangeLogger('Connection'))

    player.play(currentResource);
    player.on('stateChange', stateChangeLogger('Player'))
    player.on(AudioPlayerStatus.Playing, async () => {
        let songs = await fetchSongs();
        logWrapper('Player', `Now Playing: ${songs[nowPlayingIndex].title}`)
        getIO().emit('nowPlayingUpdate', { message: `Song has changed to: ${songs[nowPlayingIndex].title}`, id: songs[nowPlayingIndex].id });
    });
    player.on(AudioPlayerStatus.Idle, () => {
        nextSong();
    });
    player.on(AudioPlayerStatus.Paused, () => {
    });
    player.on('error', (error: any) => {
        console.warn(`Error: ${error.message} with resource ${error}`);
        nextSong();
    });

});

client.on('voiceStateUpdate', (oldState: any, newState: any) => {
    const botAccount: any = guild.members.cache.get(client.user.id);
    const currentChannel = botAccount.voice.channel.id;

    if (oldState.channel?.id !== currentChannel) {
        if (newState.channel?.id !== currentChannel) {
            return;
        } else if (player.state.status === AudioPlayerStatus.Paused && newState.channel.members.size > 1 && !webPlayerIsPaused) {
            logWrapper('Client', 'New User connected. Resuming Bimbus...')
            player.unpause();
        }
    } else if ((!newState.channel || newState.channel.members.size < 2) && oldState.channel?.id === currentChannel) {
        logWrapper('Client', 'No other users detected in channel. Pausing Bimbus...')
        player.pause();
    }

    if (newState.channel?.id !== currentChannel) {
        return;
    } else if (player.state.status === AudioPlayerStatus.Paused && newState.channel.members.size > 1 && !webPlayerIsPaused) {
        logWrapper('Client', 'New User connected. Resuming Bimbus...')
        player.unpause();
    }
})

// WEB COMMANDS

const webResume = async () => {
    player.unpause();
}

const webPause = () => {
    player.pause();
}

const webPlay = async (id: any) => {
    return new Promise(async (resolve, reject) => {
        let songs = await fetchSongs();
        let index = songs.map((link: any) => link.id).indexOf(id);
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
}

const volumeDown = () => {
    if (currentVolume < .02) {
        return;
    }
    currentVolume = currentVolume - .02;
    currentResource.volume.setVolume(currentVolume);
    logWrapper('Resource', `Volume has been set to: ${currentVolume}`)
}


const volumeUp = () => {
    if (currentVolume > .95) {
        return;
    }
    currentVolume = currentVolume + .02;
    currentResource.volume.setVolume(currentVolume);
    logWrapper('Resource', `Volume has been set to: ${currentVolume}`);
}

const getNowPlaying = () => {
    return nowPlayingIndex;
}

const updateNowPlayingIndex = async (oldList: any, updatedList: any) => {
    let nowPlayingId = oldList[nowPlayingIndex].id;
    let newIndex = updatedList.map((l: any) => l.id).findIndex((i: any) => i === nowPlayingId);
    if (newIndex < 0) {
        let songs = await fetchSongs();
        const idMap = oldList.map((song: any) => song.id);
        const lastItemId = oldList.at(-1).id;
        if (nowPlayingIndex === idMap.indexOf(lastItemId)) {
            nowPlayingIndex = 0;
        }
        currentResource = createResource(songs[nowPlayingIndex].link, currentVolume);
        player.play(currentResource);
    } else {
        nowPlayingIndex = newIndex;
    }
}

module.exports = {
    webPlay,
    webPause,
    nextSong,
    prevSong,
    webResume,
    volumeUp,
    volumeDown,
    getNowPlaying,
    updateNowPlayingIndex
}

client.login(process.env.DISCORD_TOKEN);
