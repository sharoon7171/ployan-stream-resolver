import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { getJson } from "../lib/http.js";

function seal(plain) {
  const salt = randomBytes(8);
  const key = pbkdf2Sync("player", salt, 1000, 32, "sha256");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `${salt.toString("hex")}-${iv.toString("hex")}-${body.toString("hex")}${cipher.getAuthTag().toString("hex")}`;
}

function getToken(mediaId, episode, server) {
  return seal(`${mediaId}+${episode}+${server}+${Math.floor(Date.now() / 1000)}`);
}

export async function fetchStream({ origin, mediaId, episode, server }) {
  const base = origin.replace(/\/$/, "");
  const { status, body } = await getJson(`${base}/get/${getToken(mediaId, episode, server)}`, `${base}/`);
  if (status !== 200) {
    const detail = typeof body.info === "string" ? body.info : JSON.stringify(body);
    throw new Error(`ployan /get failed (${status}): ${detail}`);
  }
  if (!body.info) {
    throw new Error("ployan /get returned no info token");
  }
  return {
    mode: body.mode,
    url: body.mode === "direct" ? `${base}/hls/${body.info}/master.m3u8` : null,
  };
}
