// verify_prod.mjs
// Verification script for production build without external curl.
import { spawn } from "child_process";
import { setTimeout } from "timers/promises";
import process from "process";

const SERVER_CMD = "node";
const SERVER_ARGS = ["dist-server/server.mjs", "--prod"];
const PORT = process.env.PORT || "3000";
const BASE = `http://127.0.0.1:${PORT}`;

async function waitForHealth(retries = 20, delay = 200) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return true;
    } catch (_) {}
    await setTimeout(delay);
  }
  return false;
}

async function fetchStatus(path) {
  try {
    const res = await fetch(`${BASE}${path}`);
    return res.status;
  } catch (_) {
    return 0;
  }
}

async function main() {
  console.log("Starting server...");
  const srv = spawn(SERVER_CMD, SERVER_ARGS, { stdio: "inherit" });
  const health = await waitForHealth();
  if (!health) {
    console.error("Health check failed");
    srv.kill();
    process.exit(1);
  }
  console.log("Health ok. Running checks...");

  const checks = [
    { path: "/", expect: 200 },
    { path: "/menu", expect: 200 },
    { path: "/api/health", expect: 200 },
    { path: "/api/nonexistent", expect: 404 },
    { path: "/assets/nonexistent.js", expect: 404 },
  ];

  for (const c of checks) {
    const code = await fetchStatus(c.path);
    if (code !== c.expect) {
      console.error(`FAIL ${c.path}: expected ${c.expect}, got ${code}`);
      srv.kill();
      process.exit(1);
    } else {
      console.log(`OK ${c.path} -> ${code}`);
    }
  }

  console.log("All checks passed. Killing server.");
  srv.kill();
  process.exit(0);
}

main();