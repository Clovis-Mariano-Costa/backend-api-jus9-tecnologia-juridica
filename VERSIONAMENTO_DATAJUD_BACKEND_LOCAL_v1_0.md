# Versionamento - DataJud Backend Local v1.0

ID: BACKEND-DATAJUD-LOCAL-v1.0  
Versao: 1.0.0  
Data: 2026-07-13  
Autor: Codex / Jus 9 Tecnologia Juridica  
Responsavel pela revisao: Fundador / equipe Jus 9  
Status: implementado em homologacao local  
Classificacao: INTERNO OPERACIONAL / SEM SEGREDOS  
Hash: a calcular na release aprovada

## Objetivo

Implementar a Fase 1 do conector DataJud/CNJ no `backend-api-jus9-tecnologia-juridica`, em modo read-only, com validacao, DTO interno, auditoria de metadados e testes.

## Entregas

- Estrutura `src/integrations/datajud/`.
- Aliases oficiais DataJud para superiores, TRFs, TJs, TRTs, TREs e Justica Militar estadual.
- Validacao de numero CNJ, tribunal, filtros permitidos e limite de `size`.
- Cliente HTTP com timeout, retry conservador, APIKey em ambiente e cache de DTO.
- Mapper para DTO Jus 9 sem armazenamento de raw.
- Rotas `/api/judicial/datajud/*`.
- Atualizacao de `.env.example`, README, OpenAPI e readiness geral.
- Testes `node --test`.

## Limites

- Nao acessa autos/documentos.
- Nao faz peticionamento, protocolo, ciencia ou manifestacao.
- Nao usa scraping.
- Nao registra chave, token, body bruto ou conteudo sensivel em auditoria.

## Proxima Etapa

Configurar `DATAJUD_API_KEY` em ambiente seguro e executar consulta controlada com processo publico. PDPJ/MNI/Domicilio permanecem em fase posterior, apenas depois de credenciais e caso de uso aprovado.
