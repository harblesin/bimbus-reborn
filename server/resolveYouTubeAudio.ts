import { getYoutubeContext } from "./youtubeSession";

export async function resolveYouTubeAudioUrl(
  watchUrl: string
): Promise<string> {
  const context = await getYoutubeContext();
  const page = await context.newPage();

  const urls: string[] = [];
  page.on("request", (req) => {
    const u = req.url();
    if (u.includes("googlevideo.com/videoplayback")) urls.push(u);
  });

  await page.goto(watchUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  await page.close();

  const audioLike = urls.find((u) => u.includes("&mime=audio"));
  const anyPlayback = urls[0];

  const chosen = audioLike ?? anyPlayback;
  if (!chosen) {
    throw new Error("Could not resolve googlevideo videoplayback URL");
  }

  return chosen;
}
