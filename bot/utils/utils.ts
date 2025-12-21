import db from "../../server/Config/dbConfig";
import ytdl from "@distube/ytdl-core";
import {
  createAudioResource,
  StreamType,
  AudioResource,
} from "@discordjs/voice";

const createResource = (youtubeLink: string, volume: number): AudioResource => {
  const stream = ytdl(youtubeLink, {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25,
    dlChunkSize: 1 << 20,
    liveBuffer: 20000,
    requestOptions: {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    },
  });

  stream.on("response", (res: any) => {
    console.info(
      `${process.pid} | Stream | response ${res.statusCode} | ${youtubeLink}`
    );
  });

  stream.on("error", (err: any) => {
    console.error(
      `${process.pid} | Stream | error: ${err?.message ?? String(err)} | ${
        (err as any)?.statusCode ? `status=${(err as any).statusCode}` : ""
      } | ${youtubeLink}`
    );
  });

  // @ts-ignore
  stream.on("info", (_info: any, format: any) => {
    console.info(
      `${process.pid} | Stream | format: ${format?.mimeType ?? "unknown"} | ${
        format?.audioBitrate ?? "?"
      }kbps | ${youtubeLink}`
    );
  });

  const resource = createAudioResource(stream as any, {
    inputType: StreamType.WebmOpus,
    inlineVolume: true,
  });

  resource.volume?.setVolume(volume);

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
