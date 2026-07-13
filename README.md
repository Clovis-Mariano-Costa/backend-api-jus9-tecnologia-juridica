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
