import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
if (existsSync(join(root, ".env"))) {
  for (const line of readFileSync(join(root, ".env"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}
const html = readFileSync(join(root, "dist", "index.html"));
const port = Number(process.env.PORT || 3000);
const rateLimit = new Map();
let marketCache = null;
let marketCachedAt = 0;

function sendJson(res, status, data, cache = "no-store") {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": cache });
  res.end(JSON.stringify(data));
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 4096) reject(new Error("too_large"));
    });
    req.on("end", () => { try { resolve(JSON.parse(body)); } catch { reject(new Error("invalid_json")); } });
    req.on("error", reject);
  });
}
function allowed(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0];
  const now = Date.now();
  const last = rateLimit.get(ip) || 0;
  if (now - last < 60_000) return false;
  rateLimit.set(ip, now);
  return true;
}
async function notify(req, res) {
  if (!allowed(req)) return sendJson(res, 200, { ok: true, throttled: true });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return sendJson(res, 503, { ok: false, error: "telegram_not_configured" });
  let body;
  try { body = await readJson(req); } catch { return sendJson(res, 400, { ok: false }); }
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const network = typeof body.network === "string" ? body.network.trim().slice(0, 60) : "Unknown EVM network";
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return sendJson(res, 400, { ok: false });
  const text = ["🔔 ChainLens wallet connected", `Wallet: ${address}`, `Network: ${network}`, `Time: ${new Date().toISOString()}`].join("\n");
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  sendJson(res, response.ok ? 200 : 502, { ok: response.ok });
}
async function markets(res) {
  try {
    if (!marketCache || Date.now() - marketCachedAt > 30_000) {
      const url = "https://api.coinpaprika.com/v1/tickers?quotes=USD";
      const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "ChainLens/1.0" } });
      if (!response.ok) throw new Error("market_upstream");
      const rows = await response.json();
      marketCache = rows.filter(coin => coin.rank > 0).sort((a, b) => a.rank - b.rank).slice(0, 10).map(coin => ({ id: coin.id, rank: coin.rank, name: coin.name, symbol: String(coin.symbol || "").toUpperCase(), price: coin.quotes?.USD?.price, change24h: coin.quotes?.USD?.percent_change_24h }));
      marketCachedAt = Date.now();
    }
    sendJson(res, 200, { ok: true, data: marketCache, updatedAt: new Date(marketCachedAt).toISOString() }, "public, max-age=30");
  } catch { sendJson(res, 502, { ok: false }); }
}

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (req.method === "POST" && url.pathname === "/api/wallet-login") return notify(req, res);
  if (req.method === "GET" && url.pathname === "/api/markets") return markets(res);
  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" });
    return res.end(html);
  }
  res.writeHead(404); res.end("Not found");
}).listen(port, () => console.log(`ChainLens listening on http://localhost:${port}`));
