import { formatNumeroCnj } from "./validators.js";

export function mapDataJudResponse({ search, response }) {
  const hits = Array.isArray(response?.hits?.hits) ? response.hits.hits : [];
  const total = typeof response?.hits?.total?.value === "number"
    ? response.hits.total.value
    : typeof response?.hits?.total === "number"
      ? response.hits.total
      : hits.length;

  const warnings = [];
  const results = hits.map((hit) => mapDataJudHit(hit, search, warnings));

  return {
    ok: true,
    source: "DataJud/CNJ API Publica",
    sourceUrl: "https://datajud-wiki.cnj.jus.br/api-publica/",
    evidenceStatus: "official-public-metadata",
    mode: "read-only-public-metadata",
    query: {
      numeroProcesso: formatNumeroCnj(search.numeroProcesso),
      numeroProcessoDigits: search.numeroProcesso,
      tribunal: search.tribunal.code,
      alias: search.tribunal.alias,
    },
    total,
    results,
    rawAvailable: false,
    rawSourceStored: false,
    warnings: Array.from(new Set(warnings)),
    limits: [
      "DataJud retorna metadados processuais publicos, nao autos/documentos.",
      "Nao realiza peticionamento, ciencia, protocolo ou consulta de sigilo.",
      "Uso real exige conferencia no tribunal competente e revisao humana.",
    ],
  };
}

function mapDataJudHit(hit, search, warnings) {
  const source = hit?._source || {};
  const movimentos = Array.isArray(source.movimentos) ? source.movimentos : [];
  const classe = namedCode(source.classe, "classe", warnings);
  const orgaoJulgador = namedCode(source.orgaoJulgador, "orgaoJulgador", warnings);

  if (!source.numeroProcesso) warnings.push("numeroProcesso ausente em um resultado");
  if (!classe) warnings.push("classe ausente em um resultado");
  if (!orgaoJulgador) warnings.push("orgaoJulgador ausente em um resultado");

  return {
    id: safeString(source.id || hit?._id),
    numeroProcesso: formatNumeroCnj(source.numeroProcesso || search.numeroProcesso),
    numeroProcessoDigits: safeString(source.numeroProcesso || search.numeroProcesso),
    tribunal: safeString(source.tribunal || search.tribunal.code),
    classe,
    assuntos: Array.isArray(source.assuntos) ? source.assuntos.slice(0, 8).map((item) => namedCode(item, "assunto", warnings)).filter(Boolean) : [],
    orgaoJulgador,
    dataAjuizamento: safeString(source.dataAjuizamento) || null,
    grau: safeString(source.grau) || null,
    formato: namedCode(source.formato, "formato", warnings),
    sistema: namedCode(source.sistema, "sistema", warnings),
    nivelSigilo: source.nivelSigilo ?? null,
    movimentos: movimentos.slice(-20).map(mapMovimento),
    rawAvailable: false,
    rawSourceStored: false,
  };
}

function mapMovimento(movimento) {
  return {
    codigo: movimento?.codigo ?? null,
    nome: safeString(movimento?.nome) || null,
    dataHora: safeString(movimento?.dataHora) || null,
    orgaoJulgador: safeString(movimento?.orgaoJulgador?.nomeOrgao || movimento?.orgaoJulgador?.nome) || null,
  };
}

function namedCode(value, _field, _warnings) {
  if (!value || typeof value !== "object") return null;
  return {
    codigo: value.codigo ?? value.codigoOrgao ?? null,
    nome: safeString(value.nome || value.nomeOrgao) || null,
  };
}

function safeString(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 240);
}
