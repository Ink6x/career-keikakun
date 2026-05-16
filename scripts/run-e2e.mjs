import { spawn, spawnSync } from "node:child_process";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const isWindows = process.platform === "win32";
const rawUserArgs = process.argv.slice(2);
const userArgs = rawUserArgs[0] === "--" ? rawUserArgs.slice(1) : rawUserArgs;
const port = process.env.E2E_PORT ?? "41362";
const baseURL = process.env.BASE_URL ?? `http://127.0.0.1:${port}`;
const shouldStartServer = !process.env.BASE_URL;

let serverProcess;

try {
  if (shouldStartServer) {
    serverProcess = spawnCommand(
      corepackExecutable(),
      ["pnpm", "exec", "next", "dev", "--hostname", "127.0.0.1", "--port", port],
      {
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"]
      }
    );

    serverProcess.stdout?.on("data", (chunk) => {
      process.stdout.write(`[next] ${chunk}`);
    });
    serverProcess.stderr?.on("data", (chunk) => {
      process.stderr.write(`[next] ${chunk}`);
    });

    await waitForServer(baseURL);
  }

  const exitCode = await runPlaywright(baseURL, userArgs);
  process.exitCode = exitCode;
} finally {
  if (serverProcess?.pid) {
    killProcessTree(serverProcess.pid);
  }
}

function spawnCommand(command, args, options) {
  if (isWindows) {
    return spawn(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", quoteCommand([command, ...args])], {
      ...options,
      shell: false,
      windowsHide: true
    });
  }

  return spawn(command, args, {
    ...options,
    shell: false,
    windowsHide: true
  });
}

async function waitForServer(url) {
  const startedAt = Date.now();
  const timeoutMs = 120000;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      await delay(1000);
    }
  }

  throw new Error(`Dev server did not become ready at ${url}`);
}

function runPlaywright(url, args) {
  return new Promise((resolve) => {
    let settled = false;
    let output = "";
    const child = spawnCommand(corepackExecutable(), ["pnpm", "exec", "playwright", "test", ...args], {
      env: {
        ...process.env,
        BASE_URL: url,
        PLAYWRIGHT_SKIP_WEB_SERVER: "1"
      },
      stdio: ["ignore", "pipe", "pipe"]
    });

    child.stdout?.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);

      if (/\b\d+\s+passed\b/.test(output) && !settled) {
        settled = true;
        killProcessTree(child.pid);
        resolve(0);
      }

      if (/\b\d+\s+failed\b/.test(output) && !settled) {
        settled = true;
        killProcessTree(child.pid);
        resolve(1);
      }
    });
    child.stderr?.on("data", (chunk) => {
      process.stderr.write(chunk);
    });
    child.on("close", (code) => {
      if (!settled) {
        settled = true;
        resolve(code ?? 1);
      }
    });
  });
}

function corepackExecutable() {
  return "corepack";
}

function quoteCommand(parts) {
  return parts.map(quoteCmdArg).join(" ");
}

function quoteCmdArg(value) {
  if (/^[A-Za-z0-9_./:=@-]+$/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

function killProcessTree(pid) {
  if (isWindows) {
    spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], {
      stdio: "ignore"
    });
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // The process may already have exited.
  }
}
