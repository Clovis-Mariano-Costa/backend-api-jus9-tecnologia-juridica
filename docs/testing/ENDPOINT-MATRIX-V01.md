# Matriz de integração por endpoint — V01 (rascunho de teste)

**Estado:** proposta técnica para execução em branch; não é homologação de SEG-01/SEG-02 nem especificação canônica.
**Base observada:** `src/server.js`, `src/integrations/datajud/datajud.routes.js`, `package.json` na branch `main`.
**Regra de aceite:** resultado observado deve coincidir com o HTTP esperado; para rotas protegidas, ausência de bearer token deve retornar 401 e token de teste deve permitir o fluxo normal. Falha crítica ou discrepância bloqueia a onda.

| ID provisório | Método | Endpoint/cenário | HTTP esperado | Tipo | Evidência |
|---|---|---|---:|---|---|
| API-GET-01 | GET | `/` | 200 | Público | status + JSON |
| API-GET-02 | GET | `/health` | 200 | Público | status + JSON |
| API-GET-03 | GET | `/api/health` | 200 | Público | status + JSON |
| API-GET-04 | GET | `/api/repos` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-05 | GET | `/api/backend/readiness` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-06 | GET | `/api/whatsapp/status` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-07 | GET | `/api/email/status` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-08 | GET | `/api/agenda/status` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-09 | GET | `/api/drive/status` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-10 | GET | `/api/drive/watch-plan` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-11 | GET | `/api/integrations/readiness` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-12 | GET | `/api/manifest` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-13 | GET | `/api/openapi.json` | 200 autenticado; 401 sem token | Protegido | status + JSON |
| API-GET-14 | GET | `/api/judicial/datajud/readiness` | 200 autenticado; 401 sem token | Protegido | status + JSON; sem chave deve indicar estado de chave ausente |
| API-GET-15 | GET | `/api/judicial/datajud/tribunais` | 200 autenticado; 401 sem token | Protegido | status + JSON; não expor nomes de segredos |
| API-GET-16 | GET | `/api/judicial/datajud/processos/invalid` | 400 autenticado | Negativo | erro de validação controlado |
| API-POST-01 | POST | `/api/agenda/events`, payload vazio | 400 autenticado | Negativo | erros de validação |
| API-POST-02 | POST | `/api/drive/metadata-scan`, raiz inexistente | 400 autenticado | Negativo | erro controlado; não escanear dados reais |
| API-POST-03 | POST | `/api/judicial/datajud/search`, número processual inválido | 400 autenticado | Negativo | erro de validação antes de qualquer chamada externa |
| API-METHOD-01 | POST | `/api/manifest` | 405 autenticado | Negativo | método não permitido |
| API-404-01 | GET | `/__rota_inexistente__` | 404 | Negativo | erro de rota inexistente |

## Limites e critérios de liberação
- IDs `API-*` são identificadores locais provisórios desta matriz; não substituem nem definem D01–D05, SEG-01 ou SEG-02.
- Os testes de integração executam o backend localmente, usam token fictício exclusivo do teste e diretório temporário de auditoria.
- Não usar credenciais reais, dados pessoais, serviços externos reais ou publicação/deploy como parte deste conjunto inicial.
- A matriz deve ser confrontada com a especificação canônica de cada endpoint antes da homologação final.
- Gate C permanece HOLD até haver execução CI aprovada para o commit testado, ausência de falhas críticas e revisão independente.
