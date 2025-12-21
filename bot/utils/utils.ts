import db from "../../server/Config/dbConfig";
import { createAudioResource, StreamType } from "@discordjs/voice";
import { spawn } from "child_process";
import { PassThrough } from "stream";

const createResource = (youtubeLink: string, volume: number) => {
  const yt = spawn(
    "yt-dlp",
    [
      "-f",
      "bestaudio/best",
      "-o",
      "-",
      "--no-playlist",
      "--quiet",
      "--no-warnings",
      youtubeLink,
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  const ff = spawn(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      "pipe:0",
      "-vn",
      "-ac",
      "2",
      "-ar",
      "48000",
      "-f",
      "ogg",
      "pipe:1",
    ],
    { stdio: ["pipe", "pipe", "pipe"] }
  );

  const output = new PassThrough();

  let closed = false;
  const closeAll = () => {
    if (closed) return;
    closed = true;

    try {
      output.end();
    } catch {}
    try {
      output.destroy();
    } catch {}

    try {
      yt.stdout?.unpipe();
    } catch {}
    try {
      ff.stdout?.unpipe();
    } catch {}

    try {
      yt.kill("SIGKILL");
    } catch {}
    try {
      ff.kill("SIGKILL");
    } catch {}
  };

  (yt.stdout as any).pipe(ff.stdin as any);
  (ff.stdout as any).pipe(output);

  yt.stderr.on("data", (d) => {
    const msg = d.toString().trim();
    if (msg) console.error(`${process.pid} | yt-dlp | ${msg}`);
  });

  ff.stderr.on("data", (d) => {
    const msg = d.toString().trim();
    if (msg) console.error(`${process.pid} | ffmpeg | ${msg}`);
  });

  yt.on("exit", (code, signal) => {
    if (closed) return;
    console.error(
      `${process.pid} | yt-dlp | exit code=${code} signal=${signal} | ${youtubeLink}`
    );
    closeAll();
  });

  ff.on("exit", (code, signal) => {
    if (closed) return;
    console.error(
      `${process.pid} | ffmpeg | exit code=${code} signal=${signal} | ${youtubeLink}`
    );
    closeAll();
  });

  output.on("close", closeAll);
  output.on("error", closeAll);

  const resource: any = createAudioResource(output, {
    inputType: StreamType.OggOpus,
    inlineVolume: true,
  });

  resource.volume?.setVolume(volume);

  resource.__cleanup = closeAll;

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
