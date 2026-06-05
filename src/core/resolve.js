import { parsePage } from "../embed/parse.js";
import { fetchStream } from "../ployan/stream.js";

export async function resolve(pageUrl, episode = "1") {
  const page = await parsePage(pageUrl);
  const stream = await fetchStream({
    origin: page.origin,
    mediaId: page.mediaId,
    episode,
    server: 1,
  });
  return { title: page.title, url: stream.url, mode: stream.mode };
}
