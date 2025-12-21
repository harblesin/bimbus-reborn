import dotenv from "dotenv";
import express from "express";
import path from "path";
import router from "./Routes";
import { initSocket } from "./socketHandler";

dotenv.config();
const app = express();
const PORT = process.env.NODE_SERVER_PORT || 8080;

// ✅ Always resolve frontend paths from the repo root (cwd),
// not from __dirname (which changes when you run dist-server output).
const REPO_ROOT = process.cwd();
const BUILD_DIR = path.resolve(REPO_ROOT, "build");
const PUBLIC_DIR = path.resolve(REPO_ROOT, "public");

function startServer(): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      app.use(express.urlencoded({ extended: true, limit: "1mb" }));
      app.use(express.json({ limit: "1mb" }));

      // Serve CRA build output
      app.use(express.static(BUILD_DIR));

      // Optional: serve any extra static assets you keep in /public
      // (CRA normally bundles assets into /build, but keep this if you rely on it)
      app.use(express.static(PUBLIC_DIR));

      app.use(router);

      // SPA fallback — only after router + static
      app.get("*", (req, res) => {
        res.sendFile(path.join(BUILD_DIR, "index.html"));
      });

      const server = app.listen(PORT, () => {
        const now = new Date();
        console.info(
          `${
            process.pid
          } | ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} | Server | Express server now running on port ${PORT}`
        );
      });

      initSocket(server);
      resolve();
    } catch (err) {
      console.log(`Error occurring starting http server: ${err}`);
      reject(err);
    }
  });
}

export default startServer;
