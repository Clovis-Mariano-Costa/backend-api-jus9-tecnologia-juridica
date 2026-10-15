# FAROL Cloud Chat — protocol and implementation boundary

Status: **proposal + contract scaffold; not deployed**  
Owner/context: FAROL — Mundo Jus 9 / Chancelaria — Núcleo Sacerdotal Harmônico  
Principle: “Luz. Harmonia. Autonomia. Continuidade.”

## Purpose

Provide a governed conversation channel for authorized participants (human operator, FAROL client, and future AI adapters such as Gemini) with an auditable message lifecycle. This document is a technical protocol, not proof that a cloud host, Gemini connection, or Reitora channel exists.

## Current truth

- The repository's current backend is designed for local-only operation by default.
- No cloud deployment, persistent cloud database, official Reitora endpoint, or authenticated Gemini adapter is verified by this change.
- This branch does not send messages, capture audio, connect to Google Docs, or contact any external participant.
- Until provider identity, authorization, and receipt are verified, integrations must run against mocks and synthetic data.

## Minimal architecture

1. **Web client** — conversation UI; no provider secrets in browser code.
2. **API gateway** — TLS, authentication, authorization, origin policy, request limits and rate limits.
3. **Conversation service** — validates envelopes and applies explicit state transitions.
4. **Persistent store** — encrypted-at-rest database, tenant/conversation access controls, retention and deletion policy.
5. **Outbox/adapter layer** — separate adapters for each approved destination; mocks by default.
6. **Audit trail** — append-only event metadata; avoid logging message bodies, tokens, or sensitive personal data.
7. **Delivery receipts** — distinguish queued, dispatched, delivered and acknowledged. A missing receipt remains pending.

## Message envelope

Required fields: `messageId`, `conversationId`, `createdAt` (ISO-8601), `actorId`, `actorType`, `content`, `classification`, `idempotencyKey`.

- Accept only known actor types and classifications.
- Normalize text and cap length at the API boundary.
- Never trust a client-supplied actor identity without server-side authentication.
- Treat AI output as a draft until a policy-authorized actor approves external sending.
- Use idempotency keys to prevent duplicate delivery attempts.
- Do not record audio or transcribe participants without notice, consent and a retention policy.

## State machine

`prepared → approved → queued → dispatched → delivered → acknowledged`

- `failed` can be recorded with a safe error code and retry policy.
- Do not skip states or represent a state as complete without evidence from the corresponding subsystem.
- `acknowledged` means a verified receipt/acknowledgment, not merely that a request was created.
- Retrying a dispatch must preserve the original message ID and idempotency key.

## Proposed API surface (not implemented by this document)

- `POST /api/farol/conversations` — create an authorized conversation.
- `GET /api/farol/conversations/:id/messages` — list messages after access checks.
- `POST /api/farol/conversations/:id/messages` — append a message to the internal conversation.
- `POST /api/farol/messages/:id/approve` — record human/policy approval for outbound dispatch.
- `POST /api/farol/messages/:id/dispatch` — dispatch only through an explicitly enabled adapter.
- `POST /api/farol/webhooks/:adapter` — future receipt endpoint; signature validation, replay protection and allowlisting required.

All proposed routes require authentication and per-conversation authorization. No public anonymous endpoint is proposed.

## Cloud activation checklist

- [ ] Choose and authorize the hosting provider and project.
- [ ] Set TLS, domain, security headers, origin allowlist, rate limits and abuse monitoring.
- [ ] Select persistent database, backups, encryption, retention and deletion policy.
- [ ] Configure identity provider, least-privilege roles and account revocation.
- [ ] Store secrets only in provider secret storage; never commit real `.env` values.
- [ ] Threat-model prompt injection, cross-tenant access, replay, duplicate delivery and data leakage.
- [ ] Test with synthetic data and mock adapters; record test output.
- [ ] Obtain explicit authorization for each external destination and verify delivery receipts.
- [ ] Conduct human security review before deployment.
- [ ] Confirm production deployment URL and health check before claiming availability.

## Acceptance criteria

1. Unauthenticated requests are rejected.
2. A user cannot read or write another conversation.
3. Invalid envelope/state transitions are rejected.
4. Duplicate idempotency keys do not create duplicate messages.
5. External dispatch is disabled by default.
6. Logs exclude message bodies and secrets by default.
7. Tests use synthetic data and mock adapters.
8. Delivery is called confirmed only when a verifiable receipt is recorded.

## Immediate next step

Implement and test the pure message-envelope/state-transition contract, then wire it into the existing local backend behind its existing exposure policy. Cloud deployment and Reitora/Gemini delivery remain separate approvals.
