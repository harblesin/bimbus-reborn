import dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  Guild,
  VoiceBasedChannel,
} from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  VoiceConnection,
} from "@discordjs/voice";

import {
  createResource,
  fetchSongs,
  stateChangeLogger,
  logWrapper,
} from "./utils/utils";
import { getIO } from "../server/socketHandler";

dotenv.config();

type EnvConfig = {
  DISCORD_TOKEN: string;
  DEFAULT_SERVER_ID: string;
  DEFAULT_CHANNEL_ID: string;
  NODE_ENV?: string;
};

function requireEnv(name: keyof EnvConfig): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const DISCORD_TOKEN = requireEnv("DISCORD_TOKEN");
const DEFAULT_SERVER_ID = requireEnv("DEFAULT_SERVER_ID");
const DEFAULT_CHANNEL_ID = requireEnv("DEFAULT_CHANNEL_ID");
const NODE_ENV = process.env.NODE_ENV;

// Voice + player state that web commands can rely on
let connection: VoiceConnection | null = null;

// Gate web commands until we're joined/subscribed
let readyResolve!: () => void;
const readyPromise = new Promise<void>((resolve) => {
  readyResolve = resolve;
});

const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play,
  },
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

let nowPlayingIndex = 0;
let currentVolume = 0.1;
let currentResource: any = null;
let webPlayerIsPaused = false;
let shuffle = false;

let guild: Guild | null = null;

async function safeFetchSongs() {
  const songs = await fetchSongs();
  if (!Array.isArray(songs) || songs.length === 0) {
    throw new Error("fetchSongs() returned an empty list.");
  }
  return songs;
}

async function playAtIndex(index: number) {
  await readyPromise;

  const songs = await safeFetchSongs();

  // clamp index
  if (index < 0) index = 0;
  if (index > songs.length - 1) index = songs.length - 1;

  nowPlayingIndex = index;
  currentResource = createResource(songs[nowPlayingIndex].link, currentVolume);

  // Force stop to avoid weird “already playing but silent” states
  player.stop(true);
  player.play(currentResource);
}

async function nextSong() {
  await readyPromise;

  const songs = await safeFetchSongs();

  if (shuffle) {
    nowPlayingIndex = Math.floor(Math.random() * songs.length);
  } else {
    nowPlayingIndex =
      nowPlayingIndex === songs.length - 1 ? 0 : nowPlayingIndex + 1;
  }

  currentResource = createResource(songs[nowPlayingIndex].link, currentVolume);
  player.stop(true);
  player.play(currentResource);
}

async function prevSong() {
  await readyPromise;

  const songs = await safeFetchSongs();

  if (shuffle) {
    nowPlayingIndex = Math.floor(Math.random() * songs.length);
  } else {
    nowPlayingIndex =
      nowPlayingIndex === 0 ? songs.length - 1 : nowPlayingIndex - 1;
  }

  currentResource = createResource(songs[nowPlayingIndex].link, currentVolume);
  player.stop(true);
  player.play(currentResource);
}

client.once("ready", async () => {
  guild = await client.guilds.fetch(DEFAULT_SERVER_ID);

  const channel = await guild.channels.fetch(DEFAULT_CHANNEL_ID);
  if (!channel) throw new Error(`Channel not found: ${DEFAULT_CHANNEL_ID}`);
  if (!channel.isVoiceBased()) {
    throw new Error(`Channel is not voice-based: ${DEFAULT_CHANNEL_ID}`);
  }

  const voiceChannel = channel as VoiceBasedChannel;

  logWrapper("Client", `Bimbus logged into discord server: ${guild.name}`);

  connection = joinVoiceChannel({
    debug: NODE_ENV === "development",
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  logWrapper("Client", `Bimbus joined discord channel: ${voiceChannel.name}`);

  connection.on("stateChange", stateChangeLogger("Connection"));

  connection.subscribe(player);
  player.on("stateChange", stateChangeLogger("Player"));

  // ✅ Unblock web commands now that we're subscribed
  readyResolve();

  // start playback
  await playAtIndex(nowPlayingIndex);

  player.on(AudioPlayerStatus.Playing, async () => {
    const songs = await safeFetchSongs();
    const current = songs[nowPlayingIndex];

    logWrapper("Player", `Now Playing: ${current.title}`);
    getIO().emit("nowPlayingUpdate", {
      message: `Song has changed to: ${current.title}`,
      id: current.id,
    });

    const me = guild?.members.me;
    const myChannel = me?.voice.channel;
    const memberCount = myChannel?.members?.size ?? 0;

    if (memberCount < 2) {
      logWrapper(
        "Client",
        "No other users detected in channel. Pausing Bimbus..."
      );
      player.pause();
    }
  });

  player.on(AudioPlayerStatus.Idle, () => {
    void nextSong();
  });

  player.on("error", (error: any) => {
    logWrapper(
      "Player",
      `Error thrown within player: ${error.message ?? String(error)}`
    );
    void nextSong();
  });
});

client.on("voiceStateUpdate", () => {
  if (!guild) return;
  if (webPlayerIsPaused) return;

  const me = guild.members.me;
  const myChannel = me?.voice.channel;
  const memberCount = myChannel?.members?.size ?? 0;

  if (memberCount > 1 && player.state.status === AudioPlayerStatus.Paused) {
    logWrapper("Client", "New user connected. Resuming Bimbus...");
    player.unpause();
    return;
  }

  if (memberCount < 2 && player.state.status === AudioPlayerStatus.Playing) {
    logWrapper(
      "Client",
      "No other users detected in channel. Pausing Bimbus..."
    );
    player.pause();
    return;
  }
});

// WEB COMMANDS

export const webResume = async () => {
  await readyPromise;
  webPlayerIsPaused = false;
  player.unpause();
};

export const webPause = async () => {
  await readyPromise;
  webPlayerIsPaused = true;
  player.pause();
};

export const webPlay = async (id: any) => {
  await readyPromise;

  // If the user hit "play", treat it as taking over from any prior web pause
  webPlayerIsPaused = false;

  const songs = await safeFetchSongs();
  const index = songs.findIndex((s: any) => s.id === id);
  if (index < 0) return false;

  await playAtIndex(index);
  return songs[index];
};

export const volumeDown = async () => {
  await readyPromise;

  if (!currentResource?.volume) return;
  if (currentVolume < 0.02) return;

  currentVolume = +(currentVolume - 0.02).toFixed(2);
  currentResource.volume.setVolume(currentVolume);
  logWrapper("Resource", `Volume has been set to: ${currentVolume}`);
};

export const volumeUp = async () => {
  await readyPromise;

  if (!currentResource?.volume) return;
  if (currentVolume > 0.95) return;

  currentVolume = +(currentVolume + 0.02).toFixed(2);
  currentResource.volume.setVolume(currentVolume);
  logWrapper("Resource", `Volume has been set to: ${currentVolume}`);
};

export const getNowPlaying = () => nowPlayingIndex;

export const updateNowPlayingIndex = async (
  oldList: any[],
  updatedList: any[]
) => {
  await readyPromise;

  if (!oldList?.length || !updatedList?.length) return;

  const nowPlayingId = oldList[nowPlayingIndex]?.id;
  if (!nowPlayingId) return;

  const newIndex = updatedList.findIndex((s: any) => s.id === nowPlayingId);

  if (newIndex < 0) {
    // current song removed; pick a safe next index
    const songs = await safeFetchSongs();
    if (nowPlayingIndex >= songs.length) nowPlayingIndex = 0;
    currentResource = createResource(
      songs[nowPlayingIndex].link,
      currentVolume
    );
    player.stop(true);
    player.play(currentResource);
  } else {
    nowPlayingIndex = newIndex;
  }
};

export const setShuffle = async () => {
  await readyPromise;

  shuffle = !shuffle;
  getIO().emit("shuffleUpdate", {
    message: "Shuffle value has been updated.",
    shuffle,
  });
};

export const getShuffle = () => shuffle;

export const api = {
  webPlay,
  webPause,
  nextSong,
  prevSong,
  webResume,
  volumeUp,
  volumeDown,
  getNowPlaying,
  updateNowPlayingIndex,
  setShuffle,
  getShuffle,
};

client.login(DISCORD_TOKEN);
