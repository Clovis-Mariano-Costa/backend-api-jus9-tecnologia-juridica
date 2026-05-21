import http from "node:http";
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
  "/api/openapi.json"
]);

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
    return true;
  }

  const authHeader = req.headers.authorization || "";
  return authHeader === `Bearer ${publicAccessToken}`;
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

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${host}:${port}`);

  applyCors(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Cache-Control": "no-store"
    });
    res.end();
    return;
  }

  if (req.method !== "GET") {
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

server.listen(port, host, () => {
  console.log(`Jus 9 backend local em http://${host}:${port}`);
});
