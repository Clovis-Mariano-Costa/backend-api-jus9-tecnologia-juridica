import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const host = process.env.HOST || "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const apiVersion = "0.1.0";
const userProfile = process.env.USERPROFILE || "C:\\Users\\Usuario";
const reposRoot = process.env.JUS9_REPOS_ROOT || path.join(userProfile, "Documents", "GitHub");
const whatsappRoot =
  process.env.JUS9_WHATSAPP_DIR ||
  "G:\\Meu Drive\\Compartilhada\\Equipe Jus 9\\Acesso I.A secreta";
const driveRoot = process.env.JUS9_DRIVE_ROOT || "G:\\Meu Drive";
const auditLogDir =
  process.env.JUS9_AUDIT_LOG_DIR || path.join(process.cwd(), "BACKEND", "logs");
const publicAccessToken = process.env.JUS9_PUBLIC_ACCESS_TOKEN || "";
const localCorsOrigins = new Set([
  "http://127.0.0.1:8787",
  "http://127.0.0.1:8788",
  "http://localhost:8787",
  "http://localhost:8788",
  "null"
]);
const protectedRoutes = new Set([
  "/api/repos",
  "/api/backend/readiness",
  "/api/whatsapp/status",
  "/api/email/status",
  "/api/agenda/status",
  "/api/agenda/events",
  "/api/drive/status",
  "/api/drive/watch-plan",
  "/api/drive/metadata-scan",
  "/api/integrations/readiness",
  "/api/manifest",
  "/api/openapi.json"
]);
const maxJsonBodyBytes = 32 * 1024;

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function applyCors(req, res) {
  const origin = req.headers.origin || "";
  if (localCorsOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "600");
}

function notFound(res) {
  sendJson(res, 404, {
    ok: false,
    error: "Rota nao encontrada",
    availableRoutes: [
      "/",
      "/health",
      "/api/health",
      "/api/repos",
      "/api/backend/readiness",
      "/api/whatsapp/status",
      "/api/email/status",
      "/api/manifest",
      "/api/openapi.json"
    ]
  });
}

function isAuthorized(req) {
  if (!publicAccessToken) {
    return isLoopbackHost(host);
  }

  const authHeader = req.headers.authorization || "";
  const expected = Buffer.from(`Bearer ${publicAccessToken}`);
  const received = Buffer.from(authHeader);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function isLoopbackHost(value) {
  return new Set(["127.0.0.1", "localhost", "::1"]).has(String(value || "").trim().toLowerCase());
}

function assertExposurePolicy() {
  if (!isLoopbackHost(host) && !publicAccessToken) {
    throw new Error("Exposicao externa recusada: configure JUS9_PUBLIC_ACCESS_TOKEN antes de usar HOST fora de localhost.");
  }
}

function exists(targetPath) {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

function listEntries(targetPath) {
  try {
    return fs.readdirSync(targetPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

function listDirectories(targetPath) {
  return listEntries(targetPath)
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function safeStat(targetPath) {
  try {
    return fs.statSync(targetPath);
  } catch {
    return null;
  }
}

function normalizePathForPolicy(value) {
  return String(value || "").toLowerCase().replaceAll("/", "\\");
}

function isSensitivePath(targetPath) {
  const normalized = normalizePathForPolicy(targetPath);
  return [
    "cofre",
    "whatsapp",
    "00_entrada_whatsapp",
    "conversa do whatsapp",
    "token",
    "senha",
    "secret",
    ".env",
    "cert.pem",
    "chave",
    "private",
    "documentos pessoais",
    "07_requer_decisao_fundador"
  ].some((needle) => normalized.includes(needle));
}

function isGoogleShortcutFile(fileName) {
  return [".gdoc", ".gsheet", ".gslides", ".gform", ".gdraw"].includes(
    path.extname(fileName).toLowerCase()
  );
}

function classifyMetadata(targetPath, dirent, stat) {
  const ext = path.extname(dirent.name).toLowerCase();

  if (isSensitivePath(targetPath)) {
    return {
      classification: "REQUER_DECISAO_FUNDADOR",
      reason: "caminho sensivel ou duvidoso"
    };
  }

  if (isGoogleShortcutFile(dirent.name)) {
    return {
      classification: "REQUER_CONECTOR_GOOGLE_AUTORIZADO",
      reason: "arquivo Google Workspace local e apenas atalho/metadado"
    };
  }

  if (dirent.isDirectory()) {
    return {
      classification: "DIRETORIO",
      reason: "diretorio listado por metadados"
    };
  }

  if ([".md", ".txt", ".json", ".csv"].includes(ext) && stat && stat.size <= 512 * 1024) {
    return {
      classification: "METADADO_OPERACIONAL",
      reason: "arquivo pequeno de apoio operacional, conteudo nao lido"
    };
  }

  return {
    classification: "METADADO_SOMENTE",
    reason: "conteudo nao lido nesta etapa"
  };
}

function scanMetadata(rootPath, options = {}) {
  const maxItems = Math.min(Number.parseInt(options.maxItems || "80", 10) || 80, 300);
  const maxDepth = Math.min(Number.parseInt(options.maxDepth || "2", 10) || 2, 4);
  const since = options.since ? new Date(options.since) : null;
  const results = [];
  const queue = [{ targetPath: rootPath, depth: 0 }];
  const seen = new Set();

  while (queue.length > 0 && results.length < maxItems) {
    const current = queue.shift();
    const resolved = path.resolve(current.targetPath);

    if (seen.has(resolved)) {
      continue;
    }
    seen.add(resolved);

    for (const entry of listEntries(resolved)) {
      if (results.length >= maxItems) {
        break;
      }

      const entryPath = path.join(resolved, entry.name);
      const stat = safeStat(entryPath);
      if (!stat) {
        continue;
      }

      if (since && stat.mtime < since) {
        if (entry.isDirectory() && current.depth < maxDepth) {
          queue.push({ targetPath: entryPath, depth: current.depth + 1 });
        }
        continue;
      }

      const policy = classifyMetadata(entryPath, entry, stat);
      results.push({
        path: entryPath,
        name: entry.name,
        type: entry.isDirectory() ? "directory" : "file",
        extension: entry.isDirectory() ? "" : path.extname(entry.name).toLowerCase(),
        size: entry.isDirectory() ? null : stat.size,
        modifiedAt: stat.mtime.toISOString(),
        classification: policy.classification,
        reason: policy.reason
      });

      if (entry.isDirectory() && current.depth < maxDepth && !isSensitivePath(entryPath)) {
        queue.push({ targetPath: entryPath, depth: current.depth + 1 });
      }
    }
  }

  return {
    rootPath,
    mode: "metadata-only",
    maxItems,
    maxDepth,
    totalReturned: results.length,
    truncated: results.length >= maxItems,
    results
  };
}

function ensureDirectory(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function appendAudit(event) {
  try {
    ensureDirectory(auditLogDir);
    const logPath = path.join(auditLogDir, "audit-events.jsonl");
    const entry = {
      timestamp: new Date().toISOString(),
      service: "backend-api-jus9-tecnologia-juridica",
      ...event
    };
    fs.appendFileSync(logPath, `${JSON.stringify(entry)}\n`, "utf8");
    return { ok: true, logPath };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let received = 0;
    let body = "";

    req.on("data", (chunk) => {
      received += chunk.length;
      if (received > maxJsonBodyBytes) {
        reject(new Error("Corpo JSON excede limite permitido"));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON invalido"));
      }
    });

    req.on("error", reject);
  });
}

function sanitizeText(value, maxLength = 240) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function isIsoDateTime(value) {
  if (typeof value !== "string") {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function agendaStatus() {
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CALENDAR_ID
  );

  return {
    ok: true,
    mode: googleConfigured ? "ready-for-oauth-token-flow" : "contract-only",
    googleCalendarConfigured: googleConfigured,
    auditLogDir,
    rules: [
      "nao enviar dados reais sem autenticacao e consentimento",
      "registrar somente metadados governados em auditoria",
      "manter fallback ICS no MVP enquanto OAuth nao estiver validado",
      "nao gravar refresh token em arquivo publico"
    ],
    requiredEnv: [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_CALENDAR_ID",
      "GOOGLE_REDIRECT_URI"
    ]
  };
}

function driveStatus() {
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  );

  return {
    ok: exists(driveRoot),
    path: driveRoot,
    mode: googleConfigured ? "ready-for-oauth-token-flow" : "local-metadata-only",
    googleDriveConfigured: googleConfigured,
    auditLogDir,
    rules: [
      "ler metadados antes de qualquer conteudo",
      "nao copiar, mover, apagar ou publicar arquivos automaticamente",
      "marcar cofre, WhatsApp bruto, documentos pessoais, tokens e senhas como requer decisao do Fundador",
      "COFRE_NAO_AUTOMATICO permite apenas escrita governada por decisao humana; leitura, listagem e publicacao seguem bloqueadas",
      ".gdoc, .gsheet e .gslides exigem conector Google autorizado para leitura de conteudo",
      "webhook real do Drive exige HTTPS publico, OAuth e renovacao de canais"
    ],
    requiredEnv: [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_DRIVE_ROOT_FOLDER_ID",
      "GOOGLE_REDIRECT_URI"
    ]
  };
}

function driveWatchPlan() {
  return {
    ok: true,
    mode: "plan-only",
    source: "Google Drive API push notifications",
    prerequisites: [
      "endpoint HTTPS publico para receber notificacoes",
      "OAuth configurado com escopos minimos",
      "canal watch criado para arquivos, changes ou pasta governada",
      "renovacao periodica de canais antes da expiracao",
      "auditoria local ou persistente para cada notificacao recebida"
    ],
    proposedEndpoints: [
      "GET /api/drive/status",
      "GET /api/drive/watch-plan",
      "POST /api/drive/metadata-scan",
      "POST /api/drive/webhook (futuro, somente HTTPS publico)"
    ],
    safeFlow: [
      "receber notificacao",
      "registrar metadados da notificacao",
      "consultar metadados do arquivo autorizado",
      "classificar risco",
      "encaminhar conteudo sensivel para decisao do Fundador",
      "nunca publicar conteudo bruto automaticamente"
    ]
  };
}

function validateAgendaEvent(payload) {
  const title = sanitizeText(payload.title || payload.summary, 160);
  const start = payload.start || payload.startDateTime;
  const end = payload.end || payload.endDateTime;
  const classification = sanitizeText(payload.classification || "INTERNO", 80) || "INTERNO";

  const errors = [];
  if (!title) {
    errors.push("title e obrigatorio");
  }
  if (!isIsoDateTime(start)) {
    errors.push("start deve ser data/hora ISO valida");
  }
  if (!isIsoDateTime(end)) {
    errors.push("end deve ser data/hora ISO valida");
  }
  if (isIsoDateTime(start) && isIsoDateTime(end) && new Date(end) <= new Date(start)) {
    errors.push("end deve ser posterior a start");
  }

  return {
    errors,
    event: {
      title,
      start,
      end,
      timezone: sanitizeText(payload.timezone || "America/Sao_Paulo", 80),
      classification,
      source: sanitizeText(payload.source || "jus9-backend-local", 80),
      relatedId: sanitizeText(payload.relatedId || "", 120),
      actor: sanitizeText(payload.actor || "fundador-ou-usuario-autorizado", 120),
      description: sanitizeText(payload.description || "", 500)
    }
  };
}

function buildGoogleCalendarDraft(event) {
  return {
    summary: event.title,
    description: event.description
      ? `${event.description}\n\nClassificacao Jus 9: ${event.classification}`
      : `Classificacao Jus 9: ${event.classification}`,
    start: {
      dateTime: event.start,
      timeZone: event.timezone
    },
    end: {
      dateTime: event.end,
      timeZone: event.timezone
    },
    extendedProperties: {
      private: {
        jus9Classification: event.classification,
        jus9Source: event.source,
        jus9RelatedId: event.relatedId
      }
    }
  };
}

function integrationReadiness() {
  return {
    ok: true,
    integrations: [
      {
        name: "Google Calendar",
        status: agendaStatus().googleCalendarConfigured ? "env-configured" : "contract-ready",
        nextStep: "implementar OAuth e troca segura de tokens"
      },
      {
        name: "Google Drive",
        status: driveStatus().googleDriveConfigured ? "env-configured" : "local-metadata-contract-ready",
        nextStep: "testar scan local por metadados e depois preparar webhook HTTPS"
      },
      {
        name: "Gmail ou Brevo",
        status: "planned",
        nextStep: "criar fila de envio e templates transacionais"
      },
      {
        name: "WhatsApp Cloud API",
        status: "planned-official-api-only",
        nextStep: "registrar numero, webhook e templates aprovados"
      },
      {
        name: "DataJud CNJ",
        status: "planned",
        nextStep: "contrato de consulta por numero CNJ e vinculacao ao DAJ"
      }
    ]
  };
}

function listRepos() {
  return listDirectories(reposRoot)
    .map((repoName) => {
      const repoPath = path.join(reposRoot, repoName);

      return {
        name: repoName,
        hasGit: exists(path.join(repoPath, ".git")),
        hasBackend: exists(path.join(repoPath, "BACKEND")),
        hasSrc: exists(path.join(repoPath, "src")),
        hasPackageJson: exists(path.join(repoPath, "package.json")),
        hasEnvExample: exists(path.join(repoPath, ".env.example"))
      };
    })
    .filter((repo) => repo.hasGit)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function backendReadiness() {
  const repos = listRepos();
  const backendRepos = repos.filter((repo) => repo.hasBackend);

  return {
    ok: true,
    reposRoot,
    totalRepos: repos.length,
    reposWithBackendFolder: backendRepos.length,
    reposWithoutBackendFolder: repos
      .filter((repo) => !repo.hasBackend)
      .map((repo) => repo.name),
    executableBackend: repos
      .filter((repo) => repo.hasPackageJson && repo.hasSrc)
      .map((repo) => repo.name),
    nextSafeSteps: [
      "manter servidor local em 127.0.0.1",
      "criar contratos de API antes de ligar frontends",
      "usar dados ficticios ate haver autenticacao, logs e politica de backup",
      "manter WhatsApp e cofre fora de logs brutos"
    ]
  };
}

function whatsappStatus() {
  const requiredDirs = [
    "00_ENTRADA_WHATSAPP",
    "01_AUDITORIA_WHATSAPP",
    "02_TRANSCRICOES_WHATSAPP",
    "03_RESUMOS_WHATSAPP",
    "04_ANEXOS_CLASSIFICADOS",
    "05_REQUER_DECISAO_FUNDADOR",
    "lixeira"
  ];

  return {
    ok: exists(whatsappRoot),
    path: whatsappRoot,
    mode: "metadata-only",
    requiredDirs: requiredDirs.map((dir) => ({
      name: dir,
      exists: exists(path.join(whatsappRoot, dir))
    })),
    itemCount: listEntries(whatsappRoot).length
  };
}

function emailStatus() {
  return {
    ok: true,
    mode: "verified-manual-and-connector",
    officialSendingPath: "Gmail web com SMTP Brevo autenticado ou backend/API Brevo",
    accounts: [
      {
        address: "charlieecho@jus9tecnologia.com.br",
        receiveVerified: true,
        sendVerified: true,
        lastVerifiedSubject: "Teste de configuracao"
      },
      {
        address: "charliefox@jus9tecnologia.com.br",
        receiveVerified: true,
        sendVerified: true
      }
    ]
  };
}

function apiManifest() {
  return {
    ok: true,
    name: "jus9-backend-local",
    displayName: "Jus 9 Backend Local",
    version: apiVersion,
    baseUrl: `http://${host}:${port}`,
    visibility: "local-only",
    classification: "INTERNO OPERACIONAL / SEM SEGREDOS",
    owner: "Jus 9 Tecnologia Juridica",
    technicalGuardian: "Charlie Fox da Costa",
    rules: [
      "nao expor internet sem autorizacao expressa",
      "nao publicar segredos, tokens, senhas ou .env real",
      "nao retornar WhatsApp bruto, cofre ou documentos pessoais",
      "usar apenas metadados governados nesta fase"
    ],
    endpoints: [
      { method: "GET", path: "/api/health", purpose: "verificar se o backend local esta vivo" },
      { method: "GET", path: "/api/repos", purpose: "listar metadados dos repositorios locais" },
      { method: "GET", path: "/api/backend/readiness", purpose: "avaliar prontidao backend do ecossistema" },
      { method: "GET", path: "/api/whatsapp/status", purpose: "verificar metadados da pasta governada do WhatsApp" },
      { method: "GET", path: "/api/email/status", purpose: "registrar status operacional de e-mail Echo/Fox" },
      { method: "GET", path: "/api/agenda/status", purpose: "verificar prontidao da integracao Google Calendar" },
      { method: "POST", path: "/api/agenda/events", purpose: "validar contrato de evento e registrar auditoria local" },
      { method: "GET", path: "/api/drive/status", purpose: "verificar prontidao do Drive governado" },
      { method: "GET", path: "/api/drive/watch-plan", purpose: "descrever plano seguro de webhook Drive" },
      { method: "POST", path: "/api/drive/metadata-scan", purpose: "listar metadados locais do Drive sem ler conteudo" },
      { method: "GET", path: "/api/integrations/readiness", purpose: "listar proximas integracoes oficiais" },
      { method: "GET", path: "/api/manifest", purpose: "descrever a API local da Jus 9" },
      { method: "GET", path: "/api/openapi.json", purpose: "fornecer especificacao OpenAPI local" }
    ]
  };
}

function openApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Jus 9 Backend Local",
      version: apiVersion,
      description: "API local inicial da Jus 9 Tecnologia Juridica. Uso restrito em localhost."
    },
    servers: [
      {
        url: `http://${host}:${port}`,
        description: "Servidor local provisorio no computador do Fundador"
      }
    ],
    paths: {
      "/api/health": {
        get: {
          summary: "Health check local",
          responses: { 200: { description: "Backend local ativo" } }
        }
      },
      "/api/repos": {
        get: {
          summary: "Metadados dos repositorios",
          responses: { 200: { description: "Lista governada dos repositorios locais" } }
        }
      },
      "/api/backend/readiness": {
        get: {
          summary: "Prontidao backend",
          responses: { 200: { description: "Resumo de prontidao backend por repositorio" } }
        }
      },
      "/api/whatsapp/status": {
        get: {
          summary: "Status WhatsApp governado",
          responses: { 200: { description: "Metadados da pasta governada, sem conteudo bruto" } }
        }
      },
      "/api/email/status": {
        get: {
          summary: "Status de e-mail Echo/Fox",
          responses: { 200: { description: "Estado operacional dos e-mails institucionais" } }
        }
      },
      "/api/agenda/status": {
        get: {
          summary: "Status da integracao de Agenda",
          responses: { 200: { description: "Prontidao da integracao Google Calendar" } }
        }
      },
      "/api/agenda/events": {
        post: {
          summary: "Validar evento da Agenda Jus 9",
          responses: {
            202: { description: "Evento aceito em modo contrato/local" },
            400: { description: "Evento invalido" }
          }
        }
      },
      "/api/drive/status": {
        get: {
          summary: "Status do Drive governado",
          responses: { 200: { description: "Prontidao do Drive por metadados" } }
        }
      },
      "/api/drive/watch-plan": {
        get: {
          summary: "Plano de webhook Google Drive",
          responses: { 200: { description: "Plano seguro para notificacoes Drive" } }
        }
      },
      "/api/drive/metadata-scan": {
        post: {
          summary: "Varredura local por metadados",
          responses: {
            202: { description: "Metadados listados e auditados" },
            400: { description: "Parametros invalidos" }
          }
        }
      },
      "/api/integrations/readiness": {
        get: {
          summary: "Prontidao das integracoes",
          responses: { 200: { description: "Mapa de integracoes oficiais" } }
        }
      },
      "/api/manifest": {
        get: {
          summary: "Manifesto da API local",
          responses: { 200: { description: "Cadastro interno da API local" } }
        }
      },
      "/api/openapi.json": {
        get: {
          summary: "OpenAPI da API local",
          responses: { 200: { description: "Especificacao OpenAPI local" } }
        }
      }
    }
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${host}:${port}`);

  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Cache-Control": "no-store"
    });
    res.end();
    return;
  }

  if (!["GET", "POST"].includes(req.method)) {
    sendJson(res, 405, {
      ok: false,
      error: "Metodo nao permitido"
    });
    return;
  }

  if (protectedRoutes.has(url.pathname) && !isAuthorized(req)) {
    sendJson(res, 401, {
      ok: false,
      error: "Autorizacao necessaria"
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/agenda/events") {
    try {
      const payload = await readJsonBody(req);
      const { errors, event } = validateAgendaEvent(payload);

      if (errors.length > 0) {
        appendAudit({
          type: "agenda_event_rejected",
          actor: sanitizeText(payload.actor || ""),
          source: sanitizeText(payload.source || ""),
          errors
        });
        sendJson(res, 400, {
          ok: false,
          errors
        });
        return;
      }

      const googleCalendarDraft = buildGoogleCalendarDraft(event);
      const audit = appendAudit({
        type: "agenda_event_contract_accepted",
        actor: event.actor,
        source: event.source,
        classification: event.classification,
        relatedId: event.relatedId,
        title: event.title,
        start: event.start,
        end: event.end,
        googleCalendarConfigured: agendaStatus().googleCalendarConfigured
      });

      sendJson(res, 202, {
        ok: true,
        mode: "contract-only",
        message: "Evento validado e registrado em auditoria local. Envio real ao Google Calendar exige OAuth e token seguro.",
        event,
        googleCalendarDraft,
        audit: {
          ok: audit.ok,
          logPath: audit.ok ? audit.logPath : undefined,
          error: audit.ok ? undefined : audit.error
        }
      });
    } catch (error) {
      sendJson(res, 400, {
        ok: false,
        error: error.message
      });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/drive/metadata-scan") {
    try {
      const payload = await readJsonBody(req);
      const requestedRoot = payload.rootPath ? path.resolve(String(payload.rootPath)) : driveRoot;

      if (!exists(requestedRoot)) {
        sendJson(res, 400, {
          ok: false,
          error: "rootPath nao existe"
        });
        return;
      }

      if (isSensitivePath(requestedRoot)) {
        const audit = appendAudit({
          type: "drive_metadata_scan_rejected",
          actor: sanitizeText(payload.actor || ""),
          rootPath: requestedRoot,
          reason: "rootPath sensivel"
        });
        sendJson(res, 400, {
          ok: false,
          error: "rootPath sensivel; requer decisao do Fundador",
          audit: { ok: audit.ok }
        });
        return;
      }

      const scan = scanMetadata(requestedRoot, {
        maxItems: payload.maxItems,
        maxDepth: payload.maxDepth,
        since: payload.since
      });

      const countsByClassification = scan.results.reduce((acc, item) => {
        acc[item.classification] = (acc[item.classification] || 0) + 1;
        return acc;
      }, {});

      const audit = appendAudit({
        type: "drive_metadata_scan_completed",
        actor: sanitizeText(payload.actor || "fundador-ou-usuario-autorizado"),
        rootPath: requestedRoot,
        totalReturned: scan.totalReturned,
        truncated: scan.truncated,
        countsByClassification
      });

      sendJson(res, 202, {
        ok: true,
        ...scan,
        countsByClassification,
        audit: {
          ok: audit.ok,
          logPath: audit.ok ? audit.logPath : undefined,
          error: audit.ok ? undefined : audit.error
        }
      });
    } catch (error) {
      sendJson(res, 400, {
        ok: false,
        error: error.message
      });
    }
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, {
      ok: false,
      error: "Metodo nao permitido"
    });
    return;
  }

  if (url.pathname === "/" || url.pathname === "/health" || url.pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      service: "backend-api-jus9-tecnologia-juridica",
      environment: process.env.JUS9_ENV || "local",
      mode: "localhost-only",
      protectedMode: Boolean(publicAccessToken),
      secretsLoaded: false,
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (url.pathname === "/api/repos") {
    sendJson(res, 200, {
      ok: true,
      reposRoot,
      repos: listRepos()
    });
    return;
  }

  if (url.pathname === "/api/backend/readiness") {
    sendJson(res, 200, backendReadiness());
    return;
  }

  if (url.pathname === "/api/whatsapp/status") {
    sendJson(res, 200, whatsappStatus());
    return;
  }

  if (url.pathname === "/api/email/status") {
    sendJson(res, 200, emailStatus());
    return;
  }

  if (url.pathname === "/api/agenda/status") {
    sendJson(res, 200, agendaStatus());
    return;
  }

  if (url.pathname === "/api/drive/status") {
    sendJson(res, 200, driveStatus());
    return;
  }

  if (url.pathname === "/api/drive/watch-plan") {
    sendJson(res, 200, driveWatchPlan());
    return;
  }

  if (url.pathname === "/api/integrations/readiness") {
    sendJson(res, 200, integrationReadiness());
    return;
  }

  if (url.pathname === "/api/manifest") {
    sendJson(res, 200, apiManifest());
    return;
  }

  if (url.pathname === "/api/openapi.json") {
    sendJson(res, 200, openApiSpec());
    return;
  }

  notFound(res);
});

assertExposurePolicy();

server.listen(port, host, () => {
  console.log(`Jus 9 backend local em http://${host}:${port}`);
});
