import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import net from "node:net";
import { fileURLToPath } from "node:url";
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
    stdio: ["ignore", "pipe", "pipe"],
  });
  return { child };
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

test("rotas DataJud declaram readiness e aliases sem API key", async () => {
  const port = await freePort();
  const server = startServer({ HOST: "127.0.0.1", PORT: String(port), JUS9_PUBLIC_ACCESS_TOKEN: "", DATAJUD_API_KEY: "" });
  try {
    await waitForServer(`http://127.0.0.1:${port}/api/health`);
    let response = await fetch(`http://127.0.0.1:${port}/api/judicial/datajud/readiness`);
    let payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.status, "missing-key");
    assert.equal(payload.apiKeyConfigured, false);

    response = await fetch(`http://127.0.0.1:${port}/api/judicial/datajud/tribunais`);
    payload = await response.json();
    assert.equal(response.status, 200);
    assert(payload.tribunais.some((item) => item.code === "tjsc"));
    assert(!JSON.stringify(payload).includes("DATAJUD_API_KEY"));
  } finally {
    await stopServer(server.child);
  }
});

test("consulta DataJud sem chave e parametros invalidos retornam erro controlado", async () => {
  const port = await freePort();
  const server = startServer({ HOST: "127.0.0.1", PORT: String(port), JUS9_PUBLIC_ACCESS_TOKEN: "", DATAJUD_API_KEY: "" });
  try {
    await waitForServer(`http://127.0.0.1:${port}/api/health`);
    let response = await fetch(`http://127.0.0.1:${port}/api/judicial/datajud/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numeroProcesso: "0000000-00.2024.8.24.0000", tribunal: "tjsc" }),
    });
    let payload = await response.json();
    assert.equal(response.status, 503);
    assert.equal(payload.error, "datajud_missing_key");

    response = await fetch(`http://127.0.0.1:${port}/api/judicial/datajud/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numeroProcesso: "abc", tribunal: "tjsc" }),
    });
    payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.error, "numero_cnj_invalido");
  } finally {
    await stopServer(server.child);
  }
});
