const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const pidFile = path.join(rootDir, "frontend-dev.pid");

if (process.platform === "win32" && !fs.existsSync(pidFile)) {
  console.log("On Windows, close the 'Frontend Dev' terminal window to stop frontend.");
  process.exit(0);
}

if (!fs.existsSync(pidFile)) {
  console.log("Frontend is not running (no PID file).");
  process.exit(0);
}

const pid = Number(fs.readFileSync(pidFile, "utf8").trim());

if (!Number.isInteger(pid)) {
  fs.rmSync(pidFile, { force: true });
  console.log("Invalid PID file removed.");
  process.exit(0);
}

if (process.platform === "win32") {
  spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
    stdio: "ignore",
    windowsHide: true
  });
} else {
  try {
    process.kill(pid, "SIGTERM");
  } catch {}
}

fs.rmSync(pidFile, { force: true });
console.log(`Stopped frontend process (PID ${pid}).`);
