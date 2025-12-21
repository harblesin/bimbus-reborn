import dotenv from "dotenv";
import express from "express";
import path from "path";
import router from "./Routes";
import { initSocket } from "./socketHandler";

dotenv.config();
const app = express();
const PORT = process.env.NODE_SERVER_PORT || 8080;

// Works in BOTH:
// - dev TS:    __dirname = .../server
// - prod JS:   __dirname = .../dist-server/server
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const BUILD_DIR = path.join(ROOT_DIR, "build");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

function startServer(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      app.use(express.urlencoded({ extended: true, limit: "1mb" }));
      app.use(express.json({ limit: "1mb" }));

      // CRA build output
      app.use(express.static(BUILD_DIR));

      // Optional (only if you actually have /public assets you serve at runtime)
      app.use(express.static(PUBLIC_DIR));

      app.use(router);

      // SPA fallback
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
