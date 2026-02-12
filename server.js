const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing ?url= parameter" });
  }

  try {
    console.log("[Proxy] Fetching:", targetUrl);
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);

    const buffer = await response.buffer();
    res.status(response.status).send(buffer);
  } catch (err) {
    console.error("[Proxy] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Proxy running on port " + PORT);
});


