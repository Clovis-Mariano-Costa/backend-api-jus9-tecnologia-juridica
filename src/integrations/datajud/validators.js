import { getDataJudTribunal, inferDataJudTribunalFromNumber } from "./aliases.js";
import { DataJudError } from "./datajud.errors.js";

const CNJ_MASK = /^(\d{7})-?(\d{2})\.?(\d{4})\.?(\d)\.?(\d{2})\.?(\d{4})$/;
const ALLOWED_SEARCH_KEYS = new Set(["numeroProcesso", "numeroCnj", "processo", "tribunal", "alias", "sigla", "size", "actor", "source"]);

export function normalizeNumeroCnj(value) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  const text = String(value).trim();
  if (!text || text.length > 40) return "";
  if (!/^[\d.\-\s]+$/.test(text)) return "";
  const digits = text.replace(/\D/g, "");
  return digits.length === 20 ? digits : "";
}

export function formatNumeroCnj(value) {
  const digits = normalizeNumeroCnj(value);
  if (!digits) return "";
  return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16)}`;
}

export function validateNumeroCnj(value) {
  const normalized = normalizeNumeroCnj(value);
  if (!normalized || !CNJ_MASK.test(formatNumeroCnj(normalized))) {
    throw new DataJudError("numero_cnj_invalido", "numeroCnj deve ter formato CNJ valido com 20 digitos.", 400);
  }
  return normalized;
}

export function validateTribunalAlias(value, options = {}) {
  const meta = getDataJudTribunal(value);
  if (!meta) {
    if (options.optional) return null;
    throw new DataJudError("tribunal_datajud_invalido", "tribunal deve ser um alias DataJud conhecido.", 400);
  }
  return meta;
}

export function validatePagination(payload = {}, env = process.env) {
  const max = Number.parseInt(env.DATAJUD_MAX_RESULT_SIZE || "10", 10) || 10;
  const rawSize = payload.size === undefined || payload.size === null || payload.size === ""
    ? Math.min(max, 10)
    : Number.parseInt(String(payload.size), 10);

  if (!Number.isFinite(rawSize) || rawSize < 1 || rawSize > max) {
    throw new DataJudError("datajud_size_invalido", `size deve ser inteiro entre 1 e ${max}.`, 400);
  }

  if (payload.from !== undefined || payload.search_after !== undefined || payload.searchAfter !== undefined) {
    throw new DataJudError("datajud_paginacao_nao_suportada", "from/search_after ainda nao estao habilitados neste MVP.", 400);
  }

  return { size: rawSize };
}

export function validateSearchPayload(payload = {}, env = process.env) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new DataJudError("payload_datajud_invalido", "Payload JSON de busca DataJud e obrigatorio.", 400);
  }

  const unknown = Object.keys(payload).filter((key) => !ALLOWED_SEARCH_KEYS.has(key));
  if (unknown.length) {
    throw new DataJudError("filtro_datajud_nao_suportado", "Apenas filtros explicitamente suportados sao permitidos.", 400, { unknown });
  }

  const numeroProcesso = validateNumeroCnj(payload.numeroProcesso || payload.numeroCnj || payload.processo);
  const requestedTribunal = validateTribunalAlias(payload.tribunal || payload.alias || payload.sigla, { optional: true });
  const inferredCode = inferDataJudTribunalFromNumber(numeroProcesso);
  const inferredTribunal = inferredCode ? getDataJudTribunal(inferredCode) : null;
  const tribunal = requestedTribunal || inferredTribunal;

  if (!tribunal) {
    throw new DataJudError("tribunal_nao_inferido", "Informe tribunal/alias DataJud ou use numero CNJ com tribunal inferivel.", 400);
  }

  const pagination = validatePagination(payload, env);

  return {
    numeroProcesso,
    numeroProcessoFormatado: formatNumeroCnj(numeroProcesso),
    tribunal,
    size: pagination.size,
  };
}
