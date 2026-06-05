import { resolve } from "../core/resolve.js";

export async function route(pathname, searchParams) {
  if (pathname === "/api/health") {
    return { status: 200, body: { ok: true } };
  }
  if (pathname === "/api/stream") {
    const pageUrl = searchParams.get("url");
    if (!pageUrl) {
      return { status: 400, body: { error: "missing url" } };
    }
    try {
      return { status: 200, body: await resolve(pageUrl, searchParams.get("episode") ?? "1") };
    } catch (error) {
      return { status: 502, body: { error: error instanceof Error ? error.message : "resolve failed" } };
    }
  }
  return null;
}
