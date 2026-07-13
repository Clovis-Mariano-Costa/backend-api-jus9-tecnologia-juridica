import assert from "node:assert/strict";
import test from "node:test";
import { getDataJudTribunal, inferDataJudTribunalFromNumber, listDataJudTribunals } from "../src/integrations/datajud/aliases.js";

test("aliases DataJud incluem tribunais prioritarios sem segredos", () => {
  const tjsp = getDataJudTribunal("tjsp");
  const trf1 = getDataJudTribunal("api_publica_trf1");
  const treSc = getDataJudTribunal("tre-sc");

  assert.equal(tjsp.alias, "api_publica_tjsp");
  assert.equal(trf1.alias, "api_publica_trf1");
  assert.equal(treSc.alias, "api_publica_tre-sc");
  assert.equal(getDataJudTribunal("tribunal-inexistente"), null);

  const list = listDataJudTribunals();
  assert(list.length >= 90);
  assert(!JSON.stringify(list).includes("API_KEY"));
});

test("inferencia por numero CNJ cobre estadual, federal, trabalho, eleitoral e militar", () => {
  assert.equal(inferDataJudTribunalFromNumber("0000000-00.2024.8.24.0000"), "tjsc");
  assert.equal(inferDataJudTribunalFromNumber("0000000-00.2024.4.01.0000"), "trf1");
  assert.equal(inferDataJudTribunalFromNumber("0000000-00.2024.5.12.0000"), "trt12");
  assert.equal(inferDataJudTribunalFromNumber("0000000-00.2024.6.24.0000"), "tresc");
  assert.equal(inferDataJudTribunalFromNumber("0000000-00.2024.9.26.0000"), "tjmsp");
});
