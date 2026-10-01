const els = {
  topStatus: document.querySelector("#top-status"),
  serviceStatus: document.querySelector("#service-status"),
  serviceStatusNote: document.querySelector("#service-status-note"),
  appVersion: document.querySelector("#app-version"),
  footerVersion: document.querySelector("#footer-version"),
  environment: document.querySelector("#environment"),
  uptime: document.querySelector("#uptime"),
  nodeVersion: document.querySelector("#node-version"),
  processId: document.querySelector("#process-id"),
  protocol: document.querySelector("#protocol"),
  hostname: document.querySelector("#hostname"),
  serverTime: document.querySelector("#server-time"),
  refreshButton: document.querySelector("#refresh-status"),
  curlUrl: document.querySelector("#curl-url"),
  copyCurlButton: document.querySelector("#copy-curl"),
  metricStatus: document.querySelector("#metric-status"),
  metricVersion: document.querySelector("#metric-version"),
  metricEnvironment: document.querySelector("#metric-environment")
};

let uptimeTimer = null;

function formatUptime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}

function formatEnvironment(value) {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setTopStatus(mode, label) {
  els.topStatus.classList.remove("healthy", "error");
  if (mode) els.topStatus.classList.add(mode);
  els.topStatus.querySelector("span:last-child").textContent = label;
}

function startUptimeCounter(initialSeconds) {
  clearInterval(uptimeTimer);
  let seconds = Number(initialSeconds) || 0;
  els.uptime.textContent = formatUptime(seconds);

  uptimeTimer = setInterval(() => {
    seconds += 1;
    els.uptime.textContent = formatUptime(seconds);
  }, 1000);
}

function renderStatus(data) {
  const environment = formatEnvironment(data.environment);

  setTopStatus("healthy", "Service healthy");
  els.serviceStatus.textContent = "Healthy";
  els.serviceStatusNote.textContent = "Node.js API is responding";
  els.appVersion.textContent = `v${data.version}`;
  els.footerVersion.textContent = data.version;
  els.environment.textContent = environment;
  els.nodeVersion.textContent = data.runtime.node;
  els.processId.textContent = data.runtime.pid;
  els.protocol.textContent = data.deployment.protocol.toUpperCase();
  els.hostname.textContent = data.deployment.host;
  els.serverTime.textContent = new Date(data.timestamp).toLocaleString();
  els.curlUrl.textContent = `${window.location.origin}/health`;

  els.metricStatus.textContent = "Healthy";
  els.metricVersion.textContent = `v${data.version}`;
  els.metricEnvironment.textContent = environment;

  startUptimeCounter(data.runtime.uptimeSeconds);
}

function renderError() {
  setTopStatus("error", "Service unavailable");
  els.serviceStatus.textContent = "Unavailable";
  els.serviceStatusNote.textContent = "Could not reach /api/status";
  els.metricStatus.textContent = "Unavailable";
  clearInterval(uptimeTimer);
}

async function loadStatus() {
  els.refreshButton.disabled = true;
  els.refreshButton.textContent = "Refreshing...";

  try {
    const response = await fetch("/api/status", {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Status request failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    renderStatus(data);
  } catch (error) {
    console.error(error);
    renderError();
  } finally {
    els.refreshButton.disabled = false;
    els.refreshButton.textContent = "Refresh status";
  }
}

els.refreshButton.addEventListener("click", loadStatus);

els.copyCurlButton.addEventListener("click", async () => {
  const command = `curl ${window.location.origin}/health`;

  try {
    await navigator.clipboard.writeText(command);
    els.copyCurlButton.textContent = "Copied";
    setTimeout(() => {
      els.copyCurlButton.textContent = "Copy";
    }, 1500);
  } catch {
    els.copyCurlButton.textContent = "Select";
  }
});

loadStatus();
