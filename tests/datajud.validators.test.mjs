import assert from "node:assert/strict";
import test from "node:test";
import { validateNumeroCnj, validatePagination, validateSearchPayload } from "../src/integrations/datajud/validators.js";

test("validador aceita numero CNJ com ou sem mascara", () => {
  assert.equal(validateNumeroCnj("0000000-00.2024.8.24.0000"), "00000000020248240000");
  assert.equal(validateNumeroCnj("00000000020248240000"), "00000000020248240000");
});

test("validador rejeita numero vazio, script e tamanho excessivo", () => {
  assert.throws(() => validateNumeroCnj(""), /numeroCnj/);
  assert.throws(() => validateNumeroCnj("<script>00000000020248240000</script>"), /numeroCnj/);
  assert.throws(() => validateNumeroCnj("0".repeat(80)), /numeroCnj/);
});

test("payload controlado rejeita filtros e size fora do limite", () => {
  assert.throws(() => validateSearchPayload({ numeroProcesso: "0000000-00.2024.8.24.0000", query: { match_all: {} } }), /filtros/);
  assert.throws(() => validateSearchPayload({ numeroProcesso: "0000000-00.2024.8.24.0000", size: 100 }), /size/);
  assert.throws(() => validatePagination({ from: 10 }), /from\/search_after/);
});

test("payload infere tribunal pelo numero CNJ quando alias nao vem informado", () => {
  const result = validateSearchPayload({ numeroProcesso: "0000000-00.2024.8.24.0000", size: 5 });
  assert.equal(result.tribunal.code, "tjsc");
  assert.equal(result.size, 5);
});
