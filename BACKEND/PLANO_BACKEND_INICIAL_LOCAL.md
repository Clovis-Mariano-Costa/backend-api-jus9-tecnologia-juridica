# Plano - Backend Inicial Local

Data: 2026-05-19
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS

Este plano inicia o backend local da Jus 9 Tecnologia Juridica sem expor o computador do Fundador na internet.

## Escopo da primeira fase

1. Rodar apenas em `localhost`.
2. Usar `.env.example` sem valores reais e `.env.local` fora do GitHub para segredos.
3. Preparar rotas internas de teste antes de qualquer Cloudflare Tunnel, deploy ou banco externo.
4. Ler a pasta governada do WhatsApp apenas por caminho autorizado e sem publicar conteudo bruto.
5. Enviar e-mails oficiais somente por Gmail web com SMTP Brevo autenticado ou por backend/API Brevo quando existir.
6. Registrar auditoria sem conversa bruta, documento pessoal, chave, token ou segredo.

## Modulos previstos

- `health`: confirmar que o servidor local esta vivo.
- `audit`: registrar eventos tecnicos sem segredo.
- `email`: preparar envio governado por Brevo.
- `whatsapp`: listar metadados de exportacoes autorizadas.
- `identity`: separar perfis como Fundador, Charlie Fox, Charlie Echo, equipe, auditor e visitante.

## Limites

- Nao usar dados reais de cliente em fase demonstrativa.
- Nao armazenar `.env.local`, backups, chaves ou anexos privados no repositorio.
- Nao publicar WhatsApp bruto, transcricoes privadas ou conteudo de cofre.
- Nao prometer criptografia real antes de chave, politica de retencao, logs e revisao humana.

## Proximo passo tecnico

Escolher a pilha do servidor local e criar o primeiro `health check`.

© Jus 9 Tecnologia Juridica
