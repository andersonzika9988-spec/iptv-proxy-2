const express = require("express");
const http = require("http");
const https = require("https");
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/", (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send("Missing ?url= parameter");
  const parsedUrl = new URL(target);
  const client = parsedUrl.protocol === "https:" ? https : http;
  const proxyReq = client.request(target, {
    headers: { "User-Agent": "Mozilla/5.0" }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      "Access-Control-Allow-Origin": "*",
    });
    proxyRes.pipe(res);
  });
  proxyReq.on("error", (e) => res.status(502).send("Proxy error: " + e.message));
  proxyReq.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running on port " + PORT));
