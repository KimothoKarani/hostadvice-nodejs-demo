# HostAdvice Node.js Demo

This Node.js + Express app was created for HostAdvice's hands-on tutorial on deploying a Node.js application to ScalaHosting with SPanel.

It has a polished browser dashboard plus machine-readable endpoints so you can verify the deployment from both the browser and the command line.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm start
```

Then open:

- Dashboard: http://localhost:3100
- Health check: http://localhost:3100/health
- Runtime API: http://localhost:3100/api/status

For development with automatic restarts on supported Node.js versions:

```bash
npm run dev
```

## Important endpoints

### `GET /`

The visual dashboard.

### `GET /health`

A lightweight JSON endpoint for curl, monitoring, and deployment verification.

### `GET /api/status`

Provides the runtime information used by the dashboard.

### `GET /api/test-error`

Returns a deliberate HTTP 500 response and writes a controlled message to the application log. This exists only so the later SPanel tutorial can demonstrate log tracing safely.

## Deployment target

The app listens on:

```text
process.env.PORT || 3100
```

That makes it suitable for local testing now and for SPanel's Node.js Manager later.
