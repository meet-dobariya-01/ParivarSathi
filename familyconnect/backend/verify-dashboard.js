import { spawn, execFileSync } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";

const backendDir = process.cwd();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mongo = await MongoMemoryServer.create();
const env = {
  ...process.env,
  DATABASE_URL: mongo.getUri(),
  PORT: "5011",
  NODE_ENV: "development",
};

const seed = spawn(process.execPath, ["src/seed.js"], {
  cwd: backendDir,
  env,
  stdio: "inherit",
});

await new Promise((resolve, reject) => {
  seed.on("exit", (code) => {
    if (code === 0) return resolve();
    reject(new Error(`seed failed with code ${code}`));
  });
  seed.on("error", reject);
});

const server = spawn(process.execPath, ["src/server.js"], {
  cwd: backendDir,
  env,
  stdio: "inherit",
});

try {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      execFileSync("curl.exe", [
        "-s",
        "http://127.0.0.1:5011/api/health",
      ], { stdio: "pipe" });
      break;
    } catch {
      await sleep(500);
    }
  }

  const loginRaw = execFileSync(
    "curl.exe",
    [
      "-s",
      "-X",
      "POST",
      "http://127.0.0.1:5011/api/auth/login",
      "-H",
      "Content-Type: application/json",
      "--data",
      JSON.stringify({ email: "officer@gujarat.gov.in", password: "Officer@123" }),
    ],
    { encoding: "utf8" }
  );

  const login = JSON.parse(loginRaw);
  if (!login.accessToken) {
    throw new Error(`Login failed: ${loginRaw}`);
  }

  const token = login.accessToken;
  const endpoints = [
    ["summary", "http://127.0.0.1:5011/api/dashboard/summary"],
    ["applications-by-scheme", "http://127.0.0.1:5011/api/dashboard/applications-by-scheme"],
    ["applications-by-status", "http://127.0.0.1:5011/api/dashboard/applications-by-status"],
    ["families-by-district", "http://127.0.0.1:5011/api/dashboard/families-by-district"],
  ];

  for (const [label, url] of endpoints) {
    const body = execFileSync("curl.exe", ["-s", "-H", `Authorization: Bearer ${token}`, url], {
      encoding: "utf8",
    });
    console.log(`\n=== ${label} ===`);
    console.log(body);
  }
} finally {
  server.kill("SIGTERM");
  await mongo.stop();
}
