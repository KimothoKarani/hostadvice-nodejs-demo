const express = require("express");
const path = require("path");
const packageJson = require("./package.json");

const app = express();

// SPanel can proxy a public HTTPS domain to this internal application port.
// 3100 keeps local testing aligned with the deployment tutorial.
const PORT = Number(process.env.PORT) || 3100;
const HOST = process.env.HOST || "0.0.0.0";

const startedAt = Date.now();

// Trust the first reverse proxy in front of Express.
// This makes protocol/IP handling more accurate when deployed behind SPanel.
app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0
}));

function uptimeSeconds() {
  return Math.floor((Date.now() - startedAt) / 1000);
}

function buildRuntimeStatus(req) {
  return {
    status: "healthy",
    application: "HostAdvice Node.js Demo",
    version: packageJson.version,
    environment: process.env.NODE_ENV || "development",
    runtime: {
      node: process.version,
      uptimeSeconds: uptimeSeconds(),
      pid: process.pid
    },
    deployment: {
      target: "ScalaHosting SPanel",
      protocol: req.protocol,
      host: req.get("host")
    },
    timestamp: new Date().toISOString()
  };
}

// Richer endpoint used by the dashboard UI.
app.get("/api/status", (req, res) => {
  res.json(buildRuntimeStatus(req));
});

// Minimal machine-readable endpoint for curl, uptime checks, and monitoring.
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: packageJson.version,
    uptimeSeconds: uptimeSeconds(),
    timestamp: new Date().toISOString()
  });
});

// Optional controlled error endpoint for a later logging/troubleshooting section.
// It is intentionally not linked from the public dashboard.
app.get("/api/test-error", (req, res) => {
  console.error(`[controlled-error] ${new Date().toISOString()} Intentional test failure requested.`);
  res.status(500).json({
    status: "error",
    message: "Intentional test error for log verification."
  });
});

// Friendly JSON response for unknown API routes.
app.use("/api", (req, res) => {
  res.status(404).json({
    status: "not_found",
    message: "API endpoint not found."
  });
});

// Let the public page handle any remaining normal browser route.
// Using middleware instead of a wildcard route keeps this compatible with Express 5.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log("");
  console.log("HostAdvice Node.js Demo is running");
  console.log(`Local URL:   http://localhost:${PORT}`);
  console.log(`Health:      http://localhost:${PORT}/health`);
  console.log(`API status:  http://localhost:${PORT}/api/status`);
  console.log("");
});
