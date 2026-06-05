import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { host, port } from "../lib/config.js";
import { route } from "../api/routes.js";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "../../public");
const assets = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/app.js": ["app.js", "application/javascript; charset=utf-8"],
  "/styles.css": ["styles.css", "text/css; charset=utf-8"],
};

function read(name) {
  return readFileSync(join(publicDir, name), "utf8");
}

function send(response, status, body, type) {
  response.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

createServer(async (request, response) => {
  const { pathname, searchParams } = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });
    response.end();
    return;
  }

  if (request.method !== "GET") {
    send(response, 405, "method not allowed", "text/plain");
    return;
  }

  const api = await route(pathname, searchParams);
  if (api) {
    send(response, api.status, JSON.stringify(api.body), "application/json");
    return;
  }

  const asset = assets[pathname];
  if (asset) {
    send(response, 200, read(asset[0]), asset[1]);
    return;
  }

  send(response, 404, "not found", "text/plain");
}).listen(port, host, () => {
  console.log(`http://${host}:${port}/`);
});
