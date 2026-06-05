import { getText } from "../lib/http.js";

const MEDIA_ID = [
  /id=mid[^>]*data-id=(\d+)/,
  /id=["']mid["'][^>]*data-id=["'](\d+)["']/,
  /id=["']watch-block["'][^>]*data-id=["'](\d+)["']/,
  /data-id=["'](\d+)["']/,
];
const PLY_URL = /const\s+plyURL\s*=\s*["']([A-Za-z0-9+/=]+)["']/;

function b64(value) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function mediaId(html, pageUrl) {
  for (const pattern of MEDIA_ID) {
    const match = html.match(pattern);
    if (match) {
      return match[1];
    }
  }
  const slug = pageUrl.match(/-(\d+)\/?$/);
  if (slug) {
    return slug[1];
  }
  throw new Error("media id not found");
}

function playerOrigin(html) {
  const match = html.match(PLY_URL);
  if (!match) {
    throw new Error("plyURL not found");
  }
  const origin = b64(match[1]).replace(/\/$/, "");
  if (!origin.startsWith("http")) {
    throw new Error("invalid plyURL");
  }
  return origin;
}

export async function parsePage(pageUrl) {
  const html = await getText(pageUrl, new URL(pageUrl).origin + "/");
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  return {
    mediaId: mediaId(html, pageUrl),
    origin: playerOrigin(html),
    title: titleMatch ? titleMatch[1].split("|")[0].trim() : null,
  };
}
