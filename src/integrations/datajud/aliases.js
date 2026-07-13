export const DATAJUD_BASE_URL_DEFAULT = "https://api-publica.datajud.cnj.jus.br";

export const DATAJUD_ALIASES = {
  stj: { label: "Superior Tribunal de Justica", alias: "api_publica_stj", branch: "superior" },
  stm: { label: "Superior Tribunal Militar", alias: "api_publica_stm", branch: "superior" },
  tse: { label: "Tribunal Superior Eleitoral", alias: "api_publica_tse", branch: "superior" },
  tst: { label: "Tribunal Superior do Trabalho", alias: "api_publica_tst", branch: "superior" },
  trf1: { label: "Tribunal Regional Federal da 1a Regiao", alias: "api_publica_trf1", branch: "federal" },
  trf2: { label: "Tribunal Regional Federal da 2a Regiao", alias: "api_publica_trf2", branch: "federal" },
  trf3: { label: "Tribunal Regional Federal da 3a Regiao", alias: "api_publica_trf3", branch: "federal" },
  trf4: { label: "Tribunal Regional Federal da 4a Regiao", alias: "api_publica_trf4", branch: "federal" },
  trf5: { label: "Tribunal Regional Federal da 5a Regiao", alias: "api_publica_trf5", branch: "federal" },
  trf6: { label: "Tribunal Regional Federal da 6a Regiao", alias: "api_publica_trf6", branch: "federal" },
  tjac: { label: "Tribunal de Justica do Acre", alias: "api_publica_tjac", branch: "estadual" },
  tjal: { label: "Tribunal de Justica de Alagoas", alias: "api_publica_tjal", branch: "estadual" },
  tjam: { label: "Tribunal de Justica do Amazonas", alias: "api_publica_tjam", branch: "estadual" },
  tjap: { label: "Tribunal de Justica do Amapa", alias: "api_publica_tjap", branch: "estadual" },
  tjba: { label: "Tribunal de Justica da Bahia", alias: "api_publica_tjba", branch: "estadual" },
  tjce: { label: "Tribunal de Justica do Ceara", alias: "api_publica_tjce", branch: "estadual" },
  tjdft: { label: "Tribunal de Justica do Distrito Federal e Territorios", alias: "api_publica_tjdft", branch: "estadual" },
  tjes: { label: "Tribunal de Justica do Espirito Santo", alias: "api_publica_tjes", branch: "estadual" },
  tjgo: { label: "Tribunal de Justica de Goias", alias: "api_publica_tjgo", branch: "estadual" },
  tjma: { label: "Tribunal de Justica do Maranhao", alias: "api_publica_tjma", branch: "estadual" },
  tjmg: { label: "Tribunal de Justica de Minas Gerais", alias: "api_publica_tjmg", branch: "estadual" },
  tjms: { label: "Tribunal de Justica do Mato Grosso do Sul", alias: "api_publica_tjms", branch: "estadual" },
  tjmt: { label: "Tribunal de Justica do Mato Grosso", alias: "api_publica_tjmt", branch: "estadual" },
  tjpa: { label: "Tribunal de Justica do Para", alias: "api_publica_tjpa", branch: "estadual" },
  tjpb: { label: "Tribunal de Justica da Paraiba", alias: "api_publica_tjpb", branch: "estadual" },
  tjpe: { label: "Tribunal de Justica de Pernambuco", alias: "api_publica_tjpe", branch: "estadual" },
  tjpi: { label: "Tribunal de Justica do Piaui", alias: "api_publica_tjpi", branch: "estadual" },
  tjpr: { label: "Tribunal de Justica do Parana", alias: "api_publica_tjpr", branch: "estadual" },
  tjrj: { label: "Tribunal de Justica do Rio de Janeiro", alias: "api_publica_tjrj", branch: "estadual" },
  tjrn: { label: "Tribunal de Justica do Rio Grande do Norte", alias: "api_publica_tjrn", branch: "estadual" },
  tjro: { label: "Tribunal de Justica de Rondonia", alias: "api_publica_tjro", branch: "estadual" },
  tjrr: { label: "Tribunal de Justica de Roraima", alias: "api_publica_tjrr", branch: "estadual" },
  tjrs: { label: "Tribunal de Justica do Rio Grande do Sul", alias: "api_publica_tjrs", branch: "estadual" },
  tjsc: { label: "Tribunal de Justica de Santa Catarina", alias: "api_publica_tjsc", branch: "estadual" },
  tjse: { label: "Tribunal de Justica de Sergipe", alias: "api_publica_tjse", branch: "estadual" },
  tjsp: { label: "Tribunal de Justica de Sao Paulo", alias: "api_publica_tjsp", branch: "estadual" },
  tjto: { label: "Tribunal de Justica do Tocantins", alias: "api_publica_tjto", branch: "estadual" },
  tjmmg: { label: "Tribunal de Justica Militar de Minas Gerais", alias: "api_publica_tjmmg", branch: "militar-estadual" },
  tjmrs: { label: "Tribunal de Justica Militar do Rio Grande do Sul", alias: "api_publica_tjmrs", branch: "militar-estadual" },
  tjmsp: { label: "Tribunal de Justica Militar de Sao Paulo", alias: "api_publica_tjmsp", branch: "militar-estadual" },
};

for (let i = 1; i <= 24; i += 1) {
  DATAJUD_ALIASES[`trt${i}`] = {
    label: `Tribunal Regional do Trabalho da ${i}a Regiao`,
    alias: `api_publica_trt${i}`,
    branch: "trabalho",
  };
}

const UF_BY_CNJ_STATE_CODE = {
  "01": "ac",
  "02": "al",
  "03": "am",
  "04": "ap",
  "05": "ba",
  "06": "ce",
  "07": "dft",
  "08": "es",
  "09": "go",
  "10": "ma",
  "11": "mt",
  "12": "ms",
  "13": "mg",
  "14": "pa",
  "15": "pb",
  "16": "pr",
  "17": "pe",
  "18": "pi",
  "19": "rj",
  "20": "rn",
  "21": "rs",
  "22": "ro",
  "23": "rr",
  "24": "sc",
  "25": "se",
  "26": "sp",
  "27": "to",
};

const STATE_TRIBUNAL_BY_CNJ_CODE = Object.fromEntries(
  Object.entries(UF_BY_CNJ_STATE_CODE).map(([code, uf]) => [code, uf === "dft" ? "tjdft" : `tj${uf}`])
);

for (const [code, uf] of Object.entries(UF_BY_CNJ_STATE_CODE)) {
  const key = `tre${uf.replace("dft", "dft")}`;
  DATAJUD_ALIASES[key] = {
    label: `Tribunal Regional Eleitoral ${uf.toUpperCase()}`,
    alias: `api_publica_tre-${uf}`,
    branch: "eleitoral",
  };
}

const MILITARY_STATE_TRIBUNAL_BY_CNJ_CODE = {
  "13": "tjmmg",
  "21": "tjmrs",
  "26": "tjmsp",
};

export function listDataJudTribunals() {
  return Object.entries(DATAJUD_ALIASES)
    .map(([code, meta]) => ({
      code,
      label: meta.label,
      alias: meta.alias,
      branch: meta.branch,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function normalizeDataJudAlias(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const compact = raw
    .replace(/^api_publica_/, "")
    .replace(/^tribunal\s+de\s+justica\s+/, "tj")
    .replace(/^tribunal\s+regional\s+eleitoral\s+/, "tre")
    .replace(/[^a-z0-9]/g, "");

  if (DATAJUD_ALIASES[compact]) return compact;
  if (compact.startsWith("tre") && compact.length > 3) {
    const uf = compact.slice(3);
    const key = `tre${uf === "df" ? "dft" : uf}`;
    if (DATAJUD_ALIASES[key]) return key;
  }
  return "";
}

export function getDataJudTribunal(code) {
  const normalized = normalizeDataJudAlias(code);
  return normalized ? { code: normalized, ...DATAJUD_ALIASES[normalized] } : null;
}

export function inferDataJudTribunalFromNumber(numeroCnj) {
  const digits = String(numeroCnj || "").replace(/\D/g, "");
  if (digits.length !== 20) return "";
  const justice = digits.slice(13, 14);
  const courtCode = digits.slice(14, 16);

  if (justice === "3") return "stj";
  if (justice === "4") return DATAJUD_ALIASES[`trf${Number(courtCode)}`] ? `trf${Number(courtCode)}` : "";
  if (justice === "5") return DATAJUD_ALIASES[`trt${Number(courtCode)}`] ? `trt${Number(courtCode)}` : "";
  if (justice === "6") {
    const uf = UF_BY_CNJ_STATE_CODE[courtCode];
    return uf ? `tre${uf}` : "";
  }
  if (justice === "7") return "stm";
  if (justice === "8") return STATE_TRIBUNAL_BY_CNJ_CODE[courtCode] || "";
  if (justice === "9") return MILITARY_STATE_TRIBUNAL_BY_CNJ_CODE[courtCode] || "";
  return "";
}
