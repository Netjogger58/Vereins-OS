#!/usr/bin/env node
/**
 * Watchdog fir Vereins-OS
 * - Start de Server (npm run dev)
 * - Kontrolléiert all 30s op http://localhost:3000 äntwert
 * - Wann de Server 3x net äntwert (90s): kill + automatesche Restart
 * - Alles gëtt an watchdog.log protokolléiert
 *
 * Benotzung:  node watchdog.cjs        (amplaz npm run dev)
 * Stoppen:    Ctrl+C  (stoppt Watchdog + Server zesummen)
 */
const { spawn, execSync } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const PORT = 3000;
const CHECK_INTERVAL_MS = 30_000;   // all 30s préiwen
const TIMEOUT_MS = 10_000;          // 10s Äntwert-Timeout pro Check
const MAX_FAILS = 3;                // no 3 Feeler => Restart
const STARTUP_GRACE_MS = 20_000;    // 20s Zäit fir eropzefueren
const LOG_FILE = path.join(__dirname, "watchdog.log");

let child = null;
let fails = 0;
let restarts = 0;
let stopping = false;
let lastStart = 0;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + "\n"); } catch {}
}

function killPort() {
  try { execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null`, { stdio: "ignore" }); } catch {}
}

function startServer() {
  killPort();
  lastStart = Date.now();
  fails = 0;
  log(`Server gëtt gestart (Restart #${restarts})...`);
  child = spawn("npm", ["run", "dev"], { cwd: __dirname, stdio: ["ignore", "pipe", "pipe"] });

  child.stdout.on("data", d => process.stdout.write(d));
  child.stderr.on("data", d => {
    process.stderr.write(d);
    try { fs.appendFileSync(LOG_FILE, `[STDERR] ${d}`); } catch {}
  });

  child.on("exit", (code) => {
    if (stopping) return;
    log(`Server-Prozess ass eriwwer (Code ${code}) — automatesche Restart an 3s...`);
    restarts++;
    setTimeout(startServer, 3000);
  });
}

function healthCheck() {
  if (stopping || !child) return;
  if (Date.now() - lastStart < STARTUP_GRACE_MS) return; // nach an der Startphase

  const req = http.get({ host: "localhost", port: PORT, path: "/", timeout: TIMEOUT_MS }, res => {
    res.resume();
    if (fails > 0) log(`Server äntwert erëm (Status ${res.statusCode}).`);
    fails = 0;
  });

  const onFail = (reason) => {
    fails++;
    log(`Health-Check FEELER ${fails}/${MAX_FAILS} (${reason})`);
    if (fails >= MAX_FAILS) {
      log(`Server hänkt zanter ~${(MAX_FAILS * CHECK_INTERVAL_MS) / 1000}s — FORCE RESTART!`);
      restarts++;
      try { child.kill("SIGKILL"); } catch {}
      // exit-Handler mécht de Restart
    }
  };

  req.on("timeout", () => { req.destroy(); onFail("Timeout") });
  req.on("error", (e) => onFail(e.code || e.message));
}

process.on("SIGINT", () => {
  stopping = true;
  log("Watchdog gëtt gestoppt (Ctrl+C)...");
  try { child?.kill("SIGTERM"); } catch {}
  killPort();
  process.exit(0);
});

log("═══ Watchdog gestart ═══");
startServer();
setInterval(healthCheck, CHECK_INTERVAL_MS);
