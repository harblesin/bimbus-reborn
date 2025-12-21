import dotenv from "dotenv";
import express from "express";
import path from "path";
import router from "./Routes";
import { initSocket } from "./socketHandler";

dotenv.config();
const app = express();
const PORT = process.env.NODE_SERVER_PORT || 8080;

// __dirname when compiled is: dist-server/server
// go up TWO levels to repo root: dist-server/server -> dist-server -> repo root
const ROOT_DIR = path.resolve(__dirname, "../..");
const BUILD_DIR = path.join(ROOT_DIR, "build");

function startServer(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      app.use(express.urlencoded({ extended: true, limit: "1mb" }));
      app.use(express.json({ limit: "1mb" }));

      // API routes FIRST
      app.use(router);

      // Serve React build static assets
      app.use(express.static(BUILD_DIR));

      // React catch-all LAST
      app.get("*", (_req, res) => {
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
