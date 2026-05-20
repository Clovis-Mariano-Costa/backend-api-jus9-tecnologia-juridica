# Checklist - Backend Local Seguro

Data: 2026-05-19
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS

## Antes de rodar

- [ ] Confirmar que o servidor esta em `localhost`.
- [ ] Confirmar que `.env.local` nao sera commitado.
- [ ] Confirmar que `.env.example` nao contem valores reais.
- [ ] Confirmar que WhatsApp, cofre e documentos pessoais nao entram em logs brutos.
- [ ] Confirmar que e-mail oficial usa alias validado por Brevo ou backend/API autorizado.

## Antes de commit

- [ ] Procurar `api_key`, `token`, `secret`, `password`, `senha`, `private_key`, `BEGIN` e `.env`.
- [ ] Verificar se nao ha ZIP, backup, audio, imagem privada ou documento sensivel.
- [ ] Verificar autoria e assinatura `© Jus 9 Tecnologia Juridica`.
- [ ] Registrar pendencia quando algo depender de credencial, DNS, Cloudflare, Brevo ou decisao humana.

## Decisao padrao

Na duvida, parar, registrar o risco e pedir revisao do Fundador.

© Jus 9 Tecnologia Juridica
