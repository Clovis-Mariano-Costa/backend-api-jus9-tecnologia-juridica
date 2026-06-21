import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";
import test from "node:test";

const serverEntry = fileURLToPath(new URL("../src/server.js", import.meta.url));

async function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => resolve(address.port));
    });
  });
}

function startServer(extraEnv = {}) {
  const child = spawn(process.execPath, [serverEntry], {
    env: { ...process.env, ...extraEnv },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  return { child, stdout: () => stdout, stderr: () => stderr };
}

async function waitForServer(url, timeoutMs = 4000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      return await fetch(url);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }
  throw new Error(`Servidor nao respondeu em ${url}`);
}

async function stopServer(child) {
  if (child.exitCode !== null) return;
  child.kill();
  await new Promise((resolve) => child.once("exit", resolve));
}

test("localhost permanece disponivel sem token", async () => {
  const port = await freePort();
  const server = startServer({ HOST: "127.0.0.1", PORT: String(port), JUS9_PUBLIC_ACCESS_TOKEN: "" });
  try {
    const response = await waitForServer(`http://127.0.0.1:${port}/api/backend/readiness`);
    assert.equal(response.status, 200);
  } finally {
    await stopServer(server.child);
  }
});

test("exposicao externa falha fechada quando token nao foi configurado", async () => {
  const port = await freePort();
  const server = startServer({ HOST: "0.0.0.0", PORT: String(port), JUS9_PUBLIC_ACCESS_TOKEN: "" });
  const exitCode = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Servidor externo nao encerrou como esperado")), 4000);
    server.child.once("exit", (code) => {
      clearTimeout(timeout);
      resolve(code);
    });
  });
  assert.notEqual(exitCode, 0);
  assert.match(server.stderr(), /Exposicao externa recusada/);
});

test("exposicao externa exige bearer token quando autorizada", async () => {
  const port = await freePort();
  const token = "token-local-ficticio-para-regressao";
  const server = startServer({ HOST: "0.0.0.0", PORT: String(port), JUS9_PUBLIC_ACCESS_TOKEN: token });
  try {
    let response = await waitForServer(`http://127.0.0.1:${port}/api/backend/readiness`);
    assert.equal(response.status, 401);
    response = await fetch(`http://127.0.0.1:${port}/api/backend/readiness`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.equal(response.status, 200);
  } finally {
    await stopServer(server.child);
  }
});

test("metadata scan bloqueia COFRE_NAO_AUTOMATICO para leitura ou listagem", async () => {
  const port = await freePort();
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "jus9-drive-"));
  const cofre = path.join(root, "04_COFRE_NAO_AUTOMATICO");
  fs.mkdirSync(cofre);
  const server = startServer({ HOST: "127.0.0.1", PORT: String(port), JUS9_PUBLIC_ACCESS_TOKEN: "" });
  try {
    await waitForServer(`http://127.0.0.1:${port}/api/health`);
    const response = await fetch(`http://127.0.0.1:${port}/api/drive/metadata-scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rootPath: cofre, actor: "teste-regressao-cofre" })
    });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.match(payload.error, /rootPath sensivel/);
  } finally {
    await stopServer(server.child);
    fs.rmSync(root, { recursive: true, force: true });
  }
});
