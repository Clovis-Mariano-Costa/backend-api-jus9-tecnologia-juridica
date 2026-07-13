import { DATAJUD_BASE_URL_DEFAULT } from "./aliases.js";
import { DataJudError } from "./datajud.errors.js";

const responseCache = new Map();

export function dataJudConfig(env = process.env) {
  const enabled = String(env.DATAJUD_ENABLED || "true").trim().toLowerCase() !== "false";
  const baseUrl = String(env.DATAJUD_BASE_URL || DATAJUD_BASE_URL_DEFAULT).trim().replace(/\/+$/, "");
  const apiKey = String(env.DATAJUD_API_KEY || "").trim();
  const timeoutMs = clampInt(env.DATAJUD_TIMEOUT_MS, 8000, 1000, 30000);
  const cacheTtlSeconds = clampInt(env.DATAJUD_CACHE_TTL_SECONDS, 300, 0, 3600);

  return {
    enabled,
    baseUrl,
    apiKey,
    timeoutMs,
    cacheTtlSeconds,
    userAgent: "Jus9-CODEX-DataJud/0.1",
  };
}

export function dataJudReadiness(env = process.env) {
  const config = dataJudConfig(env);
  const status = !config.enabled
    ? "disabled"
    : config.apiKey
      ? "configured"
      : "missing-key";

  return {
    ok: true,
    integration: "DataJud CNJ",
    status,
    baseUrlConfigured: Boolean(config.baseUrl),
    apiKeyConfigured: Boolean(config.apiKey),
    mode: "read-only-public-metadata",
    timeoutMs: config.timeoutMs,
    cacheTtlSeconds: config.cacheTtlSeconds,
    requiredEnv: [
      "DATAJUD_BASE_URL",
      "DATAJUD_API_KEY",
      "DATAJUD_TIMEOUT_MS",
      "DATAJUD_MAX_RESULT_SIZE",
      "DATAJUD_CACHE_TTL_SECONDS",
      "DATAJUD_ENABLED",
    ],
  };
}

export function buildDatajudUrl(tribunal, env = process.env) {
  const config = dataJudConfig(env);
  return `${config.baseUrl}/${tribunal.alias}/_search`;
}

export function buildHeaders(env = process.env) {
  const config = dataJudConfig(env);
  if (!config.apiKey) {
    throw new DataJudError("datajud_missing_key", "DATAJUD_API_KEY nao configurada.", 503);
  }

  return {
    "Authorization": `APIKey ${config.apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": config.userAgent,
  };
}

export function getCachedDataJudDto(cacheKey, env = process.env) {
  const config = dataJudConfig(env);
  if (!config.cacheTtlSeconds) return null;
  const item = responseCache.get(cacheKey);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    responseCache.delete(cacheKey);
    return null;
  }
  return item.dto;
}

export function setCachedDataJudDto(cacheKey, dto, env = process.env) {
  const config = dataJudConfig(env);
  if (!config.cacheTtlSeconds) return;
  responseCache.set(cacheKey, {
    dto,
    expiresAt: Date.now() + config.cacheTtlSeconds * 1000,
  });
}

export async function postDatajudSearch({ tribunal, body, requestId = "", env = process.env, fetchImpl = fetch }) {
  const config = dataJudConfig(env);
  if (!config.enabled) {
    throw new DataJudError("datajud_disabled", "Conector DataJud desabilitado por DATAJUD_ENABLED=false.", 503);
  }
  if (!config.apiKey) {
    throw new DataJudError("datajud_missing_key", "DATAJUD_API_KEY nao configurada.", 503);
  }

  const url = buildDatajudUrl(tribunal, env);
  return fetchJsonWithRetry({
    url,
    body,
    headers: buildHeaders(env),
    timeoutMs: config.timeoutMs,
    requestId,
    fetchImpl,
  });
}

export function buildProcessNumberQuery(numeroProcesso, size) {
  return {
    query: {
      match: {
        numeroProcesso,
      },
    },
    size,
  };
}

async function fetchJsonWithRetry(params) {
  try {
    return await fetchJsonOnce(params);
  } catch (error) {
    if (error instanceof DataJudError && !shouldRetry(error)) throw error;
    return fetchJsonOnce({ ...params, retry: true });
  }
}

async function fetchJsonOnce({ url, body, headers, timeoutMs, fetchImpl, retry = false }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw mapStatusError(response.status, data);
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new DataJudError("datajud_timeout", retry ? "DataJud excedeu timeout apos retry." : "DataJud excedeu timeout.", 503);
    }
    if (error instanceof DataJudError) throw error;
    throw new DataJudError("datajud_network_error", "Falha de rede ao consultar DataJud.", 503);
  } finally {
    clearTimeout(timer);
  }
}

function mapStatusError(status, data) {
  if (status === 400) return new DataJudError("datajud_bad_request", "DataJud recusou a consulta.", 502, { upstreamStatus: status });
  if (status === 401 || status === 403) return new DataJudError("datajud_unauthorized", "DataJud recusou a credencial configurada.", 503, { upstreamStatus: status });
  if (status === 404) return new DataJudError("datajud_not_found", "Endpoint DataJud nao encontrado para o tribunal.", 502, { upstreamStatus: status });
  if (status === 429) return new DataJudError("datajud_rate_limited", "DataJud aplicou limite de requisicoes.", 503, { upstreamStatus: status });
  if (status >= 500) return new DataJudError("datajud_unavailable", "DataJud indisponivel temporariamente.", 503, { upstreamStatus: status });
  return new DataJudError("datajud_unexpected_response", "Resposta inesperada do DataJud.", 502, { upstreamStatus: status, upstreamError: data?.error || undefined });
}

function shouldRetry(error) {
  return ["datajud_network_error", "datajud_timeout", "datajud_unavailable"].includes(error.code);
}

function clampInt(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(parsed, max));
}
