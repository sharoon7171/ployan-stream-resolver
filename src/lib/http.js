import { headers } from "./config.js";

export async function getText(url, referer) {
  const response = await fetch(url, { headers: headers(referer) });
  if (!response.ok) {
    throw new Error(`fetch failed (${response.status}): ${url}`);
  }
  return response.text();
}

export async function getJson(url, referer) {
  const response = await fetch(url, { headers: headers(referer) });
  return { status: response.status, body: await response.json() };
}
