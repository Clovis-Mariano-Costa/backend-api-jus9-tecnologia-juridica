import assert from "node:assert/strict";
import test from "node:test";
import { getDataJudTribunal } from "../src/integrations/datajud/aliases.js";
import { buildHeaders, dataJudReadiness, postDatajudSearch } from "../src/integrations/datajud/client.js";

test("readiness declara missing-key sem segredo", () => {
  const readiness = dataJudReadiness({ DATAJUD_API_KEY: "" });
  assert.equal(readiness.status, "missing-key");
  assert.equal(readiness.apiKeyConfigured, false);
});

test("headers usam APIKey sem expor em readiness", () => {
  const headers = buildHeaders({ DATAJUD_API_KEY: "chave-ficticia" });
  assert.equal(headers.Authorization, "APIKey chave-ficticia");
  const readiness = dataJudReadiness({ DATAJUD_API_KEY: "chave-ficticia" });
  assert.equal(readiness.status, "configured");
  assert.equal(JSON.stringify(readiness).includes("chave-ficticia"), false);
});

test("client envia POST DataJud controlado com timeout e user-agent", async () => {
  let calls = 0;
  const data = await postDatajudSearch({
    tribunal: getDataJudTribunal("tjsc"),
    body: { query: { match: { numeroProcesso: "00000000020248240000" } }, size: 1 },
    env: { DATAJUD_API_KEY: "chave-ficticia", DATAJUD_TIMEOUT_MS: "1000" },
    fetchImpl: async (url, options) => {
      calls += 1;
      assert.equal(url, "https://api-publica.datajud.cnj.jus.br/api_publica_tjsc/_search");
      assert.equal(options.method, "POST");
      assert.equal(options.headers.Authorization, "APIKey chave-ficticia");
      assert.equal(options.headers["User-Agent"], "Jus9-CODEX-DataJud/0.1");
      return Response.json({ hits: { total: { value: 0 }, hits: [] } });
    },
  });

  assert.equal(calls, 1);
  assert.equal(data.hits.total.value, 0);
});

test("client transforma 429 em erro controlado sem retry", async () => {
  let calls = 0;
  await assert.rejects(
    () => postDatajudSearch({
      tribunal: getDataJudTribunal("tjsc"),
      body: { query: { match: { numeroProcesso: "00000000020248240000" } }, size: 1 },
      env: { DATAJUD_API_KEY: "chave-ficticia" },
      fetchImpl: async () => {
        calls += 1;
        return Response.json({ error: "rate" }, { status: 429 });
      },
    }),
    /limite/
  );
  assert.equal(calls, 1);
});
