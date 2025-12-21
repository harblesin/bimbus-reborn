import db from "../../server/Config/dbConfig";
import { createAudioResource, StreamType } from "@discordjs/voice";
import { spawn } from "child_process";
import { PassThrough } from "stream";

import { resolveYouTubeAudioUrl } from "../../server/resolveYouTubeAudio";

const createResource = async (youtubeLink: string, volume: number) => {
  const audioUrl = await resolveYouTubeAudioUrl(youtubeLink);

  const ff = spawn(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-reconnect",
      "1",
      "-reconnect_streamed",
      "1",
      "-reconnect_delay_max",
      "5",
      "-i",
      audioUrl,
      "-vn",
      "-ac",
      "2",
      "-ar",
      "48000",
      "-f",
      "ogg",
      "pipe:1",
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  const output = new PassThrough();
  (ff.stdout as any).pipe(output);

  const resource: any = createAudioResource(output, {
    inputType: StreamType.OggOpus,
    inlineVolume: true,
  });

  resource.volume?.setVolume(volume);
  resource.__cleanup = () => {
    try {
      output.destroy();
    } catch {}
    try {
      ff.kill("SIGKILL");
    } catch {}
  };

  return resource;
};

const fetchSongs = async () => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM links ORDER BY position ASC"
    );
    return rows;
  } catch (error) {
    console.log(`Error fetching links: ${error}`);
    return [];
  }
};

interface Status {
  status: string;
}

const stateChangeLogger = (level: string, _optionalData: string = "") => {
  return (oldState: Status, newState: Status) => {
    const stateChange = `${oldState.status}->${newState.status}`;
    logWrapper(level, stateChange);
  };
};

const logWrapper = (level: string, message: string) => {
  const now = new Date();
  return console.info(
    `${
      process.pid
    } | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | ${level} | ${message}`
  );
};

export { createResource, fetchSongs, stateChangeLogger, logWrapper };
