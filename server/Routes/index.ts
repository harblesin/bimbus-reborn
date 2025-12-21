import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

const REPO_ROOT = process.cwd();
const BUILD_INDEX = path.resolve(REPO_ROOT, "build", "index.html");
const PUBLIC_INDEX = path.resolve(REPO_ROOT, "public", "index.html");

// ... your API routes above this ...

router.get("*", (req, res) => {
  if (fs.existsSync(BUILD_INDEX)) {
    return res.sendFile(BUILD_INDEX);
  }
  if (fs.existsSync(PUBLIC_INDEX)) {
    return res.sendFile(PUBLIC_INDEX);
  }

  return res
    .status(500)
    .send(
      `Frontend not found. Expected:\n- ${BUILD_INDEX}\n- ${PUBLIC_INDEX}\n\ncwd=${REPO_ROOT}`
    );
});

export default router;
