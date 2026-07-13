# DataJud/CNJ - Integracao Fase 1

Status: implementado como conector read-only no backend local Jus 9.  
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS.  
Fonte oficial: https://datajud-wiki.cnj.jus.br/api-publica/

## Escopo

O conector consulta metadados processuais publicos na API Publica DataJud/CNJ por numero CNJ e alias de tribunal.

Rotas:

- `GET /api/judicial/datajud/readiness`
- `GET /api/judicial/datajud/tribunais`
- `GET /api/judicial/datajud/processos/:numeroCnj?tribunal=tjsp`
- `POST /api/judicial/datajud/search`

## Fora Do Escopo

- Autos, documentos e inteiro teor.
- Dados sigilosos ou partes protegidas.
- Peticionamento, protocolo ou envio de manifestacao.
- Ciencia de comunicacao/intimacao.
- Scraping de portais judiciais.
- Credenciais PDPJ, MNI ou Domicilio Judicial Eletronico.

## Ambiente

Configure fora do GitHub:

```env
DATAJUD_BASE_URL=https://api-publica.datajud.cnj.jus.br
DATAJUD_API_KEY=
DATAJUD_TIMEOUT_MS=8000
DATAJUD_MAX_RESULT_SIZE=10
DATAJUD_CACHE_TTL_SECONDS=300
DATAJUD_ENABLED=true
```

Sem `DATAJUD_API_KEY`, o readiness retorna `missing-key` e as consultas retornam erro controlado.

## Auditoria

Cada consulta registra apenas metadados:

- tipo do evento;
- ator;
- requestId quando houver;
- tribunal;
- tipo da consulta;
- hash curto do numero CNJ;
- quantidade de resultados;
- status;
- fonte.

Nunca registrar:

- `DATAJUD_API_KEY`;
- body bruto completo;
- documentos de processo;
- credenciais PDPJ futuras;
- conteudo sigiloso.

## Resposta Interna

O DTO retorna:

- `source`;
- `sourceUrl`;
- `evidenceStatus`;
- `query`;
- `total`;
- `results`;
- `rawAvailable: false`;
- `rawSourceStored: false`;
- `warnings`;
- `limits`.

## Proxima Fase

PDPJ deve entrar primeiro apenas como readiness/autenticacao. MNI/PJe e Domicilio Judicial Eletronico ficam bloqueados ate haver credenciais, caso de uso aprovado, confirmacao humana e auditoria reforcada.
