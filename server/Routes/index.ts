import { Router } from "express";
import path from "path";

const router = Router();

// Resolve project root from compiled location too.
// In dist-server, __dirname = .../dist-server/server/Routes
// ../../../ gets you back to repo root.
const ROOT_DIR = path.resolve(__dirname, "../../../");
const BUILD_DIR = path.join(ROOT_DIR, "build");

router.get("/", (req, res) => {
  res.sendFile(path.join(BUILD_DIR, "index.html"));
});

export default router;
