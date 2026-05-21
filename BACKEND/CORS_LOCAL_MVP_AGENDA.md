# CORS local - Agenda MVP

Data: 2026-05-21
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS

## Objetivo

Permitir que a Agenda visual do repositorio `mvp-jus9-tecnologia-juridica`, servida localmente em `127.0.0.1`, consiga validar o contrato `POST /api/agenda/events` no backend local `127.0.0.1:3000`.

## Escopo permitido

Origens locais previstas:

- `http://127.0.0.1:8787`
- `http://127.0.0.1:8788`
- `http://localhost:8787`
- `http://localhost:8788`
- `null` para abertura local controlada por arquivo/navegador

## Garantias

- Nao adiciona segredo.
- Nao ativa Google OAuth real.
- Nao envia evento real ao Google Calendar.
- Nao remove o modo protegido por `JUS9_PUBLIC_ACCESS_TOKEN` quando configurado.
