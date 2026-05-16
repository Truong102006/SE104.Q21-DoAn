const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const pidFile = path.join(rootDir, "frontend-dev.pid");
const outLog = path.join(rootDir, "frontend-dev.log");
const errLog = path.join(rootDir, "frontend-dev.err.log");

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

if (fs.existsSync(pidFile)) {
  const oldPid = Number(fs.readFileSync(pidFile, "utf8").trim());
  if (Number.isInteger(oldPid) && isRunning(oldPid)) {
    console.log(`Frontend is already running (PID ${oldPid}).`);
    process.exit(0);
  }
  fs.rmSync(pidFile, { force: true });
}

if (process.platform !== "win32") {
  const out = fs.openSync(outLog, "a");
  const err = fs.openSync(errLog, "a");
  const child = spawn("npm", ["--prefix", "frontend", "run", "dev"], {
    cwd: rootDir,
    detached: true,
    stdio: ["ignore", out, err]
  });
  child.unref();
  fs.writeFileSync(pidFile, String(child.pid));
  console.log(`Frontend started in background (PID ${child.pid}).`);
  console.log(`Logs: ${outLog}`);
  process.exit(0);
}

// On Windows, keep dev server in a dedicated visible terminal to avoid
// detached-process instability and make runtime errors visible.
const npmCmd = `"C:\\Program Files\\nodejs\\npm.cmd"`;
const cmdLine = `cd /d "${rootDir}" && ${npmCmd} --prefix frontend run dev`;
spawn("cmd.exe", ["/d", "/c", "start", "\"Frontend Dev\"", "cmd.exe", "/k", cmdLine], {
  cwd: rootDir,
  detached: true,
  windowsHide: false,
  stdio: "ignore"
}).unref();

if (fs.existsSync(pidFile)) {
  fs.rmSync(pidFile, { force: true });
}

console.log("Opened a dedicated Frontend Dev terminal window.");
console.log("Keep that window open while developing.");
