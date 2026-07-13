import crypto from "node:crypto";
import { listDataJudTribunals } from "./aliases.js";
import {
  buildProcessNumberQuery,
  dataJudReadiness,
  getCachedDataJudDto,
  postDatajudSearch,
  setCachedDataJudDto,
} from "./client.js";
import { DataJudError, dataJudErrorPayload } from "./datajud.errors.js";
import { mapDataJudResponse } from "./mapper.js";
import { validateNumeroCnj, validateSearchPayload } from "./validators.js";

const DATAJUD_ROUTES = new Set([
  "/api/judicial/datajud/readiness",
  "/api/judicial/datajud/tribunais",
  "/api/judicial/datajud/search",
]);

export function isDataJudRoute(pathname) {
  return DATAJUD_ROUTES.has(pathname) || pathname.startsWith("/api/judicial/datajud/processos/");
}

export async function handleDataJudRoute(req, res, url, context) {
  const env = context.env || process.env;

  try {
    if (req.method === "GET" && url.pathname === "/api/judicial/datajud/readiness") {
      context.sendJson(res, 200, {
        ...dataJudReadiness(env),
        aliasesCount: listDataJudTribunals().length,
      });
      return true;
    }

    if (req.method === "GET" && url.pathname === "/api/judicial/datajud/tribunais") {
      context.sendJson(res, 200, {
        ok: true,
        mode: "read-only-public-metadata",
        tribunais: listDataJudTribunals(),
      });
      return true;
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/judicial/datajud/processos/")) {
      const numeroCnj = decodeURIComponent(url.pathname.replace("/api/judicial/datajud/processos/", ""));
      const payload = {
        numeroProcesso: validateNumeroCnj(numeroCnj),
        tribunal: url.searchParams.get("tribunal") || "",
        size: url.searchParams.get("size") || undefined,
        actor: url.searchParams.get("actor") || "fundador-ou-usuario-autorizado",
        source: "backend-api-jus9-datajud-get",
      };
      const result = await executeDataJudSearch(payload, context, env);
      context.sendJson(res, 200, result);
      return true;
    }

    if (req.method === "POST" && url.pathname === "/api/judicial/datajud/search") {
      const payload = await context.readJsonBody(req);
      const result = await executeDataJudSearch(payload, context, env);
      context.sendJson(res, 200, result);
      return true;
    }

    context.sendJson(res, 405, {
      ok: false,
      error: "Metodo nao permitido para rota DataJud",
    });
    return true;
  } catch (error) {
    const status = error instanceof DataJudError ? error.status : 500;
    context.appendAudit?.({
      type: "datajud_search_rejected",
      status: "error",
      error: error.code || "datajud_error",
      message: error.message,
    });
    context.sendJson(res, status, dataJudErrorPayload(error));
    return true;
  }
}

async function executeDataJudSearch(payload, context, env) {
  const search = validateSearchPayload(payload, env);
  const queryBody = buildProcessNumberQuery(search.numeroProcesso, search.size);
  const cacheKey = `${search.tribunal.code}:${search.numeroProcesso}:${search.size}`;
  const cached = getCachedDataJudDto(cacheKey, env);

  if (cached) {
    context.appendAudit?.(buildAuditEvent(payload, search, cached.total, "cache-hit"));
    return { ...cached, cache: "hit" };
  }

  const requestId = crypto.randomUUID();
  const response = await postDatajudSearch({
    tribunal: search.tribunal,
    body: queryBody,
    requestId,
    env,
  });
  const dto = mapDataJudResponse({ search, response });
  setCachedDataJudDto(cacheKey, dto, env);
  context.appendAudit?.(buildAuditEvent(payload, search, dto.total, "success", requestId));
  return { ...dto, requestId, cache: "miss" };
}

function buildAuditEvent(payload, search, resultCount, status, requestId = "") {
  return {
    type: "datajud_search_executed",
    actor: safeText(payload.actor || "fundador-ou-usuario-autorizado"),
    requestId: requestId || undefined,
    tribunal: search.tribunal.code,
    queryType: "numeroProcesso",
    numeroHash: hashValue(search.numeroProcesso),
    resultCount,
    status,
    source: "DataJud/CNJ",
  };
}

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex").slice(0, 16);
}

function safeText(value) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
}
