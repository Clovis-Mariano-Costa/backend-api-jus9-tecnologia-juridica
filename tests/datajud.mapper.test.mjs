import assert from "node:assert/strict";
import test from "node:test";
import { getDataJudTribunal } from "../src/integrations/datajud/aliases.js";
import { mapDataJudResponse } from "../src/integrations/datajud/mapper.js";

test("mapper converte hit DataJud para DTO interno sem raw", () => {
  const dto = mapDataJudResponse({
    search: {
      numeroProcesso: "00000000020248240000",
      tribunal: getDataJudTribunal("tjsc"),
    },
    response: {
      hits: {
        total: { value: 1 },
        hits: [
          {
            _id: "hit-1",
            _source: {
              numeroProcesso: "00000000020248240000",
              tribunal: "TJSC",
              classe: { codigo: 7, nome: "Procedimento Comum Civel" },
              orgaoJulgador: { codigo: 123, nome: "1a Vara Civel" },
              assuntos: [{ codigo: 10433, nome: "Alimentos" }],
              movimentos: [{ codigo: 1, nome: "Distribuicao", dataHora: "2024-01-02T10:00:00" }],
              partes: [{ nome: "NAO DEVE SAIR" }],
            },
          },
        ],
      },
    },
  });

  assert.equal(dto.ok, true);
  assert.equal(dto.evidenceStatus, "official-public-metadata");
  assert.equal(dto.rawSourceStored, false);
  assert.equal(dto.results[0].rawSourceStored, false);
  assert.equal(dto.results[0].classe.nome, "Procedimento Comum Civel");
  assert(!JSON.stringify(dto).includes("NAO DEVE SAIR"));
});

test("mapper trata resposta vazia e campos ausentes com warnings", () => {
  const dto = mapDataJudResponse({
    search: {
      numeroProcesso: "00000000020248240000",
      tribunal: getDataJudTribunal("tjsc"),
    },
    response: { hits: { total: { value: 0 }, hits: [] } },
  });

  assert.equal(dto.total, 0);
  assert.deepEqual(dto.results, []);
  assert.equal(dto.rawAvailable, false);
});
