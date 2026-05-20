# Exposicao Internet - Cloudflare Tunnel

Data: 2026-05-19
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS

## Status

Backend local ativo em:

`http://127.0.0.1:3000`

Quick Tunnel Cloudflare foi instalado e testado, mas os subdominios `trycloudflare.com` gerados nao resolveram DNS neste computador. Para exposicao estavel, o caminho correto e um tunnel nomeado no dominio da Jus 9.

## Hostname sugerido

`backend-local.jus9tecnologia.com.br`

## Requisitos

1. `cloudflared` instalado.
2. Login Cloudflare concluido pelo navegador.
3. Arquivo local criado:

`C:\Users\Usuário\.cloudflared\cert.pem`

4. Backend iniciado com `JUS9_PUBLIC_ACCESS_TOKEN` definido fora do GitHub.

## Comandos apos login

```powershell
cloudflared tunnel create jus9-backend-local
cloudflared tunnel route dns jus9-backend-local backend-local.jus9tecnologia.com.br
cloudflared tunnel run --url http://127.0.0.1:3000 jus9-backend-local
```

## Testes esperados

Saude publica:

```powershell
Invoke-RestMethod -Uri "https://backend-local.jus9tecnologia.com.br/api/health"
```

Rota protegida sem token deve retornar `401`:

```powershell
Invoke-RestMethod -Uri "https://backend-local.jus9tecnologia.com.br/api/repos"
```

Rota protegida com token:

```powershell
Invoke-RestMethod -Uri "https://backend-local.jus9tecnologia.com.br/api/repos" -Headers @{ Authorization = "Bearer <token-local>" }
```

## Limites

- Nao expor WhatsApp bruto, cofre, dados pessoais, chaves, tokens, senhas ou `.env.local`.
- Nao publicar o token.
- Nao usar em producao permanente sem Cloudflare Access, WAF/regras e revisao de seguranca.
- Quick Tunnels nao possuem SLA e servem apenas para teste.

© Jus 9 Tecnologia Juridica
