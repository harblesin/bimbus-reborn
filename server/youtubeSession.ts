import { chromium, BrowserContext } from "playwright";
import path from "path";

let contextPromise: Promise<BrowserContext> | null = null;

export async function getYoutubeContext(): Promise<BrowserContext> {
  if (contextPromise) return contextPromise;

  const userDataDir = path.join(process.cwd(), ".pw-chrome-profile");

  contextPromise = chromium.launchPersistentContext(userDataDir, {
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  return contextPromise;
}
