# Integracoes Prioritarias Jus 9

Data: 2026-05-21
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS

## Escopo

Este pacote prepara o backend para integracoes oficiais do Ecossistema Jus 9 Tecnologia Juridica. Login real, investidores e MVP visual possuem chats proprios; este arquivo organiza o backend comum.

## Ordem de implementacao

1. Google Calendar / Agenda.
2. Google Drive governado.
3. Gmail ou Brevo.
4. WhatsApp Business Platform / Cloud API.
5. DataJud CNJ.
6. Cloudflare Workers, D1, R2 e Queues para producao.

## Estado atual

Implementado nesta etapa:

- `GET /api/agenda/status`
- `POST /api/agenda/events`
- `GET /api/integrations/readiness`
- Auditoria local em `BACKEND/logs/audit-events.jsonl`
- Contrato de evento compativel com Google Calendar, sem envio real ao Google.
- `GET /api/drive/status`
- `GET /api/drive/watch-plan`
- `POST /api/drive/metadata-scan`
- Contrato Drive por metadados, sem leitura de conteudo e sem webhook real ainda.

## Contrato inicial de evento

```json
{
  "title": "Retorno demonstrativo Jus 9",
  "start": "2026-05-21T15:00:00-03:00",
  "end": "2026-05-21T15:30:00-03:00",
  "timezone": "America/Sao_Paulo",
  "classification": "INTERNO / DEMO",
  "source": "mvp-agenda",
  "actor": "Fundador",
  "relatedId": "DAJ-DEMO-001",
  "description": "Sem dados reais nesta fase."
}
```

## Proximo passo seguro

Antes de enviar evento real ao Google Calendar:

1. Criar projeto Google Cloud.
2. Configurar OAuth consent screen.
3. Criar OAuth Client ID.
4. Definir redirect URI local e futura URI publica HTTPS.
5. Guardar `GOOGLE_CLIENT_SECRET` fora do GitHub.
6. Implementar troca de authorization code por token.
7. Criptografar refresh token ou guardar em secret store.
8. Registrar auditoria de criacao, atualizacao e cancelamento de evento.

Antes de ativar Google Drive real:

1. Definir a pasta raiz governada no Drive.
2. Configurar OAuth com escopos minimos de Drive.
3. Guardar `GOOGLE_CLIENT_SECRET` fora do GitHub.
4. Guardar tokens em secret store ou armazenamento criptografado.
5. Criar endpoint HTTPS para webhook.
6. Criar canal `watch` e registrar expiracao.
7. Renovar canais antes de expirar.
8. Consultar inicialmente somente metadados.
9. Enviar conteudo sensivel para decisao do Fundador.

## Regras

- Nao usar dados reais de cliente/processo sem autenticacao e consentimento.
- Nao publicar tokens, refresh tokens, secrets, cookies ou QR codes.
- Nao transformar login demonstrativo em login real neste pacote.
- WhatsApp deve usar API oficial, nao automacao de WhatsApp pessoal.
- Drive e cofre devem operar primeiro por metadados e classificacao.
