# Cadastro da API Local Jus 9

Data: 2026-05-19
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS

## Decisao

E interessante cadastrar a API local da Jus 9 antes de expor qualquer integracao publica. Nesta fase, o cadastro fica no backend central e tambem possui um plugin repo-local para orientar o uso dentro do Codex.

## API cadastrada

- Nome tecnico: `jus9-backend-local`
- Nome publico interno: `Jus 9 Backend Local`
- Base local: `http://127.0.0.1:3000`
- Visibilidade: local only
- Guardia tecnica: Charlie Fox da Costa

## Endpoints de cadastro

- `GET /api/manifest`
- `GET /api/openapi.json`

## Endpoints operacionais atuais

- `GET /api/health`
- `GET /api/repos`
- `GET /api/backend/readiness`
- `GET /api/whatsapp/status`
- `GET /api/email/status`

## Plugin local criado

- Pasta: `plugins/jus9-backend-local`
- Manifesto: `plugins/jus9-backend-local/.codex-plugin/plugin.json`
- Skill: `plugins/jus9-backend-local/skills/jus9-backend-local/SKILL.md`
- Marketplace repo-local: `.agents/plugins/marketplace.json`

## Limite importante

Este plugin repo-local registra e orienta o uso da API, mas pode exigir recarregar o workspace/app para aparecer na interface do Codex. Ele ainda nao implementa servidor MCP proprio; por enquanto usa a API HTTP local ja ativa.

## Regra de seguranca

A API local nao deve expor internet, WhatsApp bruto, cofre, dados pessoais, chaves, tokens, senhas, `.env.local` ou documentos sensiveis.

## Exposicao controlada

A exposicao para internet deve seguir `BACKEND/EXPOSICAO_INTERNET_CLOUDFLARE_TUNNEL.md`, preferindo tunnel nomeado e hostname `backend-local.jus9tecnologia.com.br`.

© Jus 9 Tecnologia Juridica
