export const host = process.env.HOST || "127.0.0.1";
export const port = Number(process.env.PORT) || 8765;

export function headers(referer) {
  const out = {
    "User-Agent":
      process.env.USER_AGENT ||
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  };
  if (referer) {
    out.Referer = referer;
  }
  return out;
}
