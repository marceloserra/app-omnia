const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8082;
const LOG_FILE = path.join(__dirname, "../../omnia-telemetry.jsonl");

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const entry = JSON.parse(body);
        const logLine = JSON.stringify({
          timestamp: new Date().toISOString(),
          ...entry,
        }) + "\n";

        fs.appendFile(LOG_FILE, logLine, (err) => {
          if (err) console.error("Failed to write to telemetry log:", err);
        });

        // Print to console nicely
        const color = entry.level === "error" ? "\x1b[31m" : entry.level === "warn" ? "\x1b[33m" : "\x1b[32m";
        console.log(`${color}[TELEMETRY][${entry.tag}] ${entry.message}\x1b[0m`);
        if (entry.error) console.log(`\x1b[90m${entry.error}\x1b[0m`);

        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 [AI Telemetry] Listening on http://0.0.0.0:${PORT}`);
  console.log(`📝 Appending logs to: ${LOG_FILE}\n`);
});
