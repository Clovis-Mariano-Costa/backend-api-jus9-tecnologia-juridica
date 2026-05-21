# Como Rodar o Backend Local

Data: 2026-05-21
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS

## Comando

```powershell
npm start
```

## Modo publico protegido

Para expor por tunnel, definir `JUS9_PUBLIC_ACCESS_TOKEN` fora do GitHub antes de iniciar o servidor. Com token ativo, rotas de metadados exigem cabecalho:

```text
Authorization: Bearer <token-local>
```

## Enderecos locais

- `http://127.0.0.1:3000/`
- `http://127.0.0.1:3000/health`
- `http://127.0.0.1:3000/api/health`
- `http://127.0.0.1:3000/api/repos`
- `http://127.0.0.1:3000/api/backend/readiness`
- `http://127.0.0.1:3000/api/whatsapp/status`
- `http://127.0.0.1:3000/api/email/status`
- `http://127.0.0.1:3000/api/agenda/status`
- `http://127.0.0.1:3000/api/drive/status`
- `http://127.0.0.1:3000/api/drive/watch-plan`
- `http://127.0.0.1:3000/api/integrations/readiness`

## Teste local da Agenda

Nesta fase, `POST /api/agenda/events` valida o contrato, monta um rascunho compativel com Google Calendar e registra auditoria local. Ele ainda nao envia evento real ao Google.

```powershell
$body = @{
  title = "Retorno demonstrativo Jus 9"
  start = "2026-05-21T15:00:00-03:00"
  end = "2026-05-21T15:30:00-03:00"
  timezone = "America/Sao_Paulo"
  classification = "INTERNO / DEMO"
  source = "mvp-agenda"
  actor = "Fundador"
  relatedId = "DAJ-DEMO-001"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3000/api/agenda/events" -ContentType "application/json" -Body $body
```

## Teste local do Drive governado

Nesta fase, `POST /api/drive/metadata-scan` lista somente metadados. Ele nao le conteudo, nao copia, nao move e nao apaga arquivos.

```powershell
$body = @{
  rootPath = "G:\Meu Drive"
  maxItems = 40
  maxDepth = 2
  actor = "Fundador"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3000/api/drive/metadata-scan" -ContentType "application/json" -Body $body
```

Se o PowerShell antigo tiver dificuldade com caminhos que contenham acento, defina `JUS9_DRIVE_ROOT` antes de iniciar o servidor e omita `rootPath` no corpo do teste.

Para consultar o plano de webhook futuro:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/drive/watch-plan"
```

## Variaveis de ambiente da Agenda

Estas variaveis devem existir apenas em `.env.local`, Cloudflare Secrets ou ambiente seguro equivalente:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- `GOOGLE_SCOPES`

Nao gravar refresh token, access token, client secret real ou credencial Google em arquivo publico.

## Garantias desta etapa

- O servidor escuta apenas em `127.0.0.1`, salvo configuracao explicita.
- Nenhum segredo real e carregado ou exibido.
- Nenhum conteudo de WhatsApp, cofre, cliente ou documento pessoal e lido.
- A resposta de saude serve apenas para confirmar que o backend local esta vivo.
- As rotas de repositorios, WhatsApp, e-mail, Agenda e Drive retornam metadados governados, sem conteudo bruto.
- Em modo publico, rotas de metadados devem exigir token local nao publicado.

© Jus 9 Tecnologia Juridica
