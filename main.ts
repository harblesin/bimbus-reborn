import startServer from "./server/server";
import { ensureYoutubeLogin } from "./server/youtubeContext";

async function main() {
  await ensureYoutubeLogin(); // <--- add this
  await startServer();
}

main().catch((err) => {
  console.log(`Error occurring starting program: ${err}`);
});
