# Backend local fail closed - v1.0

Data: 2026-06-01

## Objetivo

Impedir que o backend local seja exposto fora de `localhost` sem autenticação.

## Alterações

- exposição em `HOST` externo recusada quando `JUS9_PUBLIC_ACCESS_TOKEN` estiver vazio;
- rotas protegidas permanecem acessíveis sem token somente em `127.0.0.1`, `localhost` ou `::1`;
- comparação de Bearer token feita com tempo constante;
- manifesto e prontidão de integrações adicionados à lista de rotas protegidas;
- regressão automatizada para localhost, bloqueio externo e exposição externa autenticada.

## Limites

O token demonstrativo não substitui autenticação real, autorização por perfil, TLS, rotação de segredos ou revisão humana. Não abrir túnel antes da homologação completa.
