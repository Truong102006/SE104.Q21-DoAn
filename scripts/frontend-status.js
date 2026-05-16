const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const rootDir = path.resolve(__dirname, "..");
const pidFile = path.join(rootDir, "frontend-dev.pid");

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function checkHttp() {
  return new Promise((resolve) => {
    const req = http.get("http://127.0.0.1:3000/login", (res) => {
      resolve(res.statusCode || 0);
      res.resume();
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve(0);
    });

    req.on("error", () => resolve(0));
  });
}

(async () => {
  let pid = null;
  if (fs.existsSync(pidFile)) {
    pid = Number(fs.readFileSync(pidFile, "utf8").trim());
  }

  const alive = Number.isInteger(pid) && isRunning(pid);
  const statusCode = await checkHttp();

  console.log(`PID file: ${fs.existsSync(pidFile) ? "yes" : "no"}`);
  console.log(`Process alive: ${alive ? `yes (PID ${pid})` : "no"}`);
  console.log(`HTTP 127.0.0.1:3000/login: ${statusCode || "down"}`);
})();
