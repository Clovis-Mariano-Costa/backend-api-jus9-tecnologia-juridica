# Como Rodar o Backend Local

Data: 2026-05-19
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS

## Comando

```powershell
npm start
```

## Modo publico protegido

Para expor por tunnel, definir `JUS9_PUBLIC_ACCESS_TOKEN` fora do GitHub antes de iniciar o servidor. Com token ativo, rotas de metadados exigem cabeçalho:

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

## Garantias desta primeira etapa

- O servidor escuta apenas em `127.0.0.1`.
- Nenhum segredo real e carregado ou exibido.
- Nenhum conteudo de WhatsApp, cofre, cliente ou documento pessoal e lido.
- A resposta de saude serve apenas para confirmar que o backend local esta vivo.
- As rotas de repositórios, WhatsApp e e-mail retornam metadados governados, sem conteudo bruto.
- Em modo publico, rotas de metadados devem exigir token local nao publicado.

© Jus 9 Tecnologia Juridica
