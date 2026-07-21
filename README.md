# backend-api-jus9-tecnologia-juridica

Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS

Backend local inicial da Jus 9 Tecnologia Juridica. Ele serve como contrato seguro para integracoes progressivas com repositorios locais, Agenda, Drive governado, auditoria e futuros conectores oficiais.

## Principios

- Rodar em `localhost` por padrao.
- Falhar fechado quando exposto fora de localhost sem `JUS9_PUBLIC_ACCESS_TOKEN`.
- Usar metadados governados antes de qualquer conteudo.
- Nao publicar tokens, senhas, `.env`, URLs sensiveis, IDs privados ou conteudo de cofre.
- Tratar `COFRE_NAO_AUTOMATICO` como zona de escrita governada por decisao humana, sem leitura/listagem automatica.

## Comandos

```powershell
npm install
npm test
npm start
```

Rotas principais:

- `GET /api/health`
- `GET /api/backend/readiness`
- `GET /api/agenda/status`
- `POST /api/agenda/events`
- `GET /api/drive/status`
- `POST /api/drive/metadata-scan`
- `GET /api/judicial/datajud/readiness`
- `GET /api/judicial/datajud/tribunais`
- `GET /api/judicial/datajud/processos/:numeroCnj`
- `POST /api/judicial/datajud/search`
- `GET /api/integrations/readiness`
- `GET /api/manifest`
- `GET /api/openapi.json`

## DataJud/CNJ

A Fase 1 do conector DataJud e apenas leitura de metadados processuais publicos. Nao acessa autos, documentos, sigilo, peticionamento, ciencia ou protocolo. Configure `DATAJUD_API_KEY` somente em ambiente seguro; sem chave, o readiness retorna `missing-key`.

## Links institucionais Jus 9

- [Portal Jus 9](https://jus9tecnologia.com.br/)
- [MVPs e Demos](https://jus9tecnologia.com.br/mvp.html#demos-jus9)
- [Saiba mais](https://jus9tecnologia.com.br/saiba-mais.html)
- [Equipe Jus 9](https://equipe.jus9tecnologia.com.br/)
- [Charlie Echo](https://charlieecho.jus9tecnologia.com.br/)
- [Jus9 Verde](https://jus9verde.jus9tecnologia.com.br/)

<!-- JUS9_ECOSYSTEM_STATUS_START -->
## Integracao com o ecossistema Jus 9 - baseline de 21/07/2026

Este repositorio integra o catalogo governado de repositorios ligados a Jus 9 Tecnologia Juridica. A inclusao desta nota registra o baseline comum do ecossistema; ela nao substitui o escopo, a licenca, o historico nem as versoes proprias deste repositorio.

- **Portal publico:** [Jus 9 Tecnologia Juridica](https://jus9tecnologia.com.br/)
- **Revisao Build Week:** [Jus 9 DAJ - reviewer path](https://jus9tecnologia.com.br/build-week-2026.html)
- **Pesquisa dos repositorios:** [Pesquisa Jus 9](https://jus9tecnologia.com.br/pesquisa-repositorios.html)
- **Baseline integrado:** portal 5.18, governanca 1.21.13, commit principal 8f5674149f8d15c2d69d5b2f054fd8f116d81362.

O fundador confirma que, ate 21/07/2026, o trabalho produtivo do ecossistema foi construido usando exclusivamente **ChatGPT, Codex e a API OpenAI** como ferramentas de IA, sempre sob autoria e revisao humanas. Isso nao representa patrocinio ou parceria formal e nao atribui a OpenAI a autoria de Cloudflare, GitHub, Google, fontes do CNJ, bibliotecas, padroes ou demais componentes de terceiros.

Regras permanentes: nao publicar credenciais, tokens, cookies, IDs privados de sessao ou dados pessoais desnecessarios; usar dados ficticios nas demonstracoes; exigir revisao humana para trabalho juridico; e falhar de forma fechada quando uma fonte oficial estiver indisponivel. O CNJ ainda nao respondeu ao contato institucional registrado, e o silencio nao autoriza integracao ou efeito transacional.

**Repositorio catalogado:** $Repository.
<!-- JUS9_ECOSYSTEM_STATUS_END -->
