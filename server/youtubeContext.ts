import path from "path";
import { chromium, BrowserContext } from "playwright";

let ctxPromise: Promise<BrowserContext> | null = null;

function waitForEnter(prompt: string) {
  return new Promise<void>((resolve) => {
    try {
      process.stdout.write(prompt);
    } catch {}

    const onData = () => {
      cleanup();
      resolve();
    };

    const onSigint = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      try {
        process.stdin.removeListener("data", onData);
      } catch {}
      try {
        process.removeListener("SIGINT", onSigint);
      } catch {}
    };

    try {
      process.stdin.resume();
    } catch {}

    process.stdin.once("data", onData);
    process.once("SIGINT", onSigint);
  });
}

async function isLoggedIn(context: BrowserContext): Promise<boolean> {
  const page = await context.newPage();
  await page.goto("https://www.youtube.com", { waitUntil: "domcontentloaded" });

  const signInLink = page.locator(
    'a[href*="accounts.google.com/ServiceLogin"]'
  );
  const signedOut = (await signInLink.count()) > 0;

  await page.close();
  return !signedOut;
}

async function openInteractiveLogin(userDataDir: string): Promise<void> {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await context.newPage();
  await page.goto("https://www.youtube.com", { waitUntil: "domcontentloaded" });

  console.log("");
  console.log("YouTube login required.");
  console.log("1) Finish logging in in the opened browser window.");
  console.log("2) Make sure you're on YouTube and signed in.");
  console.log("");

  await waitForEnter("Press Enter here once login is complete... ");

  const ok = await isLoggedIn(context);
  await context.close();

  if (!ok) throw new Error("Login not detected after interactive login.");
}

export async function getYoutubeContext(): Promise<BrowserContext> {
  if (ctxPromise) return ctxPromise;

  const userDataDir = path.join(process.cwd(), ".pw-yt-profile");

  ctxPromise = (async () => {
    let context = await chromium.launchPersistentContext(userDataDir, {
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    if (await isLoggedIn(context)) return context;

    await context.close();

    await openInteractiveLogin(userDataDir);

    context = await chromium.launchPersistentContext(userDataDir, {
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    return context;
  })();

  return ctxPromise;
}

export async function ensureYoutubeLogin(): Promise<void> {
  const ctx = await getYoutubeContext();
  const ok = await isLoggedIn(ctx);
  if (!ok) throw new Error("YouTube is not logged in.");
}
