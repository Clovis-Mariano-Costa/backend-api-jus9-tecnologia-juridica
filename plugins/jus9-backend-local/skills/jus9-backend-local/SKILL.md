---
name: jus9-backend-local
description: Use quando o usuario quiser consultar, testar ou orientar a API local Jus 9 Backend Local em localhost.
---

# Jus 9 Backend Local

Use esta skill para trabalhar com a API local da Jus 9 em:

`http://127.0.0.1:3000`

## Regras

- Confirmar que o servidor local esta ativo antes de consultar rotas.
- Nao expor internet, criar tunnel, publicar URL publica ou enviar dados reais sem autorizacao expressa.
- Consultar apenas metadados nas rotas de WhatsApp e repositorios.
- Nao retornar WhatsApp bruto, cofre, chaves, tokens, senhas ou `.env.local`.

## Rotas atuais

- `GET /api/health`
- `GET /api/repos`
- `GET /api/backend/readiness`
- `GET /api/whatsapp/status`
- `GET /api/email/status`
- `GET /api/manifest`
- `GET /api/openapi.json`

## Como testar

Use PowerShell:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/health"
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/manifest"
```

## Quando houver erro

- Se a conexao falhar, iniciar o servidor com `npm start` no repositorio `backend-api-jus9-tecnologia-juridica`.
- Se a rota retornar 404, consultar `/api/manifest` para ver endpoints atuais.
- Se a pasta `G:` nao estiver acessivel, orientar o Fundador a verificar Google Drive Desktop.

© Jus 9 Tecnologia Juridica
