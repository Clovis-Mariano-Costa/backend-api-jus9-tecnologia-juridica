# FAROL — Mega Cronograma | Protocolo Mão na Massa

**Princípio operacional:** checkpoint é ponte, não parada. Cada checkpoint deve conduzir a uma próxima ação verificável, sem abrir trilhas paralelas desnecessárias.

**Projeto:** FAROL — Mundo Jus 9  
**Núcleo:** Chancelaria — Núcleo Sacerdotal Harmônico  
**Lema:** Luz. Harmonia. Autonomia. Continuidade.

## Estado conhecido neste checkpoint

- [x] PR #13 aberto como rascunho para o contrato e protocolo do chat em nuvem.
- [x] Contrato de mensagem e testes de unidade propostos no branch `feat/farol-cloud-chat-protocol`.
- [x] PR #12 CI: 18 testes aprovados, 0 falhas; execução #38773829990: https://github.com/Clovis-Mariano-Costa/backend-api-jus9-tecnologia-juridica/actions/runs/38773829990
- [x] PR #13 branch CI: 23 testes aprovados, 0 falhas no commit `0107613df5228c1684f32f7c9c019587d8ad0076`; execução #38808135074: https://github.com/Clovis-Mariano-Costa/backend-api-jus9-tecnologia-juridica/actions/runs/38808135074
- [ ] Avisos de manutenção no log: depreciação `punycode` e actions `checkout@v4`/`setup-node@v4` sobre runtime Node.js 20 forçado a Node.js 24 pelo runner; avaliar atualização controlada.
- [ ] Revisão humana e de segurança; PR #13 permanece rascunho, aberto, não mesclado e não implantado.
- [ ] Nenhum canal real com Gemini/Vertex ou Reitora está confirmado.
- [ ] Nenhuma transferência de containers para Charlie Echo está confirmada.

## Ordem de execução — sem duplicar processo

### 1. Motor e testes do backend — issue #7
- [x] A suíte foi executada por GitHub Actions com Node.js 22 e `npm test` no commit acima.
- [ ] Revisar cobertura, política de exposição e lacunas entre testes locais e ambiente de produção.
- [ ] Analisar o contrato do chat para garantir que estados e identidade não sejam confundidos com autenticação real.

**Evidência:** execução de CI vinculada ao commit; isso não equivale a revisão de segurança nem a implantação.

### 2. CI, segredos e portabilidade — issue #9 / PR #12
- Revisar o workflow e confirmar que o CI cobre a suíte atual, inclusive os testes novos.
- Manter segredos fora do repositório; usar apenas valores sintéticos em testes.
- PR #12 segue aberto, não mesclado e sem review submetida retornada pela API; o CI verde não substitui revisão humana.
- A execução de PR #13 é separada e não representa aprovação ou merge de qualquer PR.

**Saída exigida:** execução de CI vinculada ao commit correto e revisão registrada.

### 3. COM-IAs / Gemini-Vertex — issue #8
- Implementar e testar adaptador isolado com mock, sem credenciais ou dados reais.
- Falhar de forma segura quando não configurado.
- Separar proposta, aprovação humana, envio e recibo.
- Só testar integração real após confirmar projeto autorizado, identidade, escopo mínimo, orçamento e política de dados.

**Saída exigida:** testes simulados aprovados e evidência explícita antes de qualquer conexão real.

### 4. Canal da Reitora — issue #10
- Confirmar provedor, endpoint oficial, identidade destinatária, autenticação, permissões e ambiente de teste.
- Exigir allowlist de destino, validação de origem/assinatura, proteção contra replay, idempotência e política de retenção.
- Não enviar mensagens reais sem autorização explícita e canal autenticado.
- Considerar entrega confirmada somente com recibo verificável do canal/destinatário.

**Saída exigida:** prova do canal e recibo; comentário no GitHub não equivale a entrega à Reitora.

### 5. Continuidade e coordenação — issue #11
- Atualizar o mesmo fluxo com evidências e bloqueios, evitando issues/processos duplicados.
- Para eventual transferência de containers: exigir inventário, contagem, hashes, origem/destino e confirmação autorizada de recebimento.
- Reentrada maior permanece bloqueada até que a transferência seja verificável.

## Regra de avanço

Em cada ciclo, registrar **feito**, **pendente**, **bloqueado** e **evidência**. Escolher a próxima ação que reduza o bloqueio mais próximo. Não confundir documento, branch, preview ou pedido de execução com serviço implantado, integração ativa ou tarefa concluída.

## Próxima ação imediata

Obter revisão humana no PR #12 e revisão de segurança do PR #13. Conferir validação defensiva do envelope/histórico, autenticação e autorização no servidor, persistência/idempotência entre instâncias, recibos verificáveis e política de logs. Em paralelo, avaliar aviso de runtime das GitHub Actions. Manter adapters externos desabilitados até autorização explícita.

**Estado deste documento:** protocolo de execução versionado; não é evidência de que as ações pendentes foram executadas.


## Delta de continuidade — 22/10/2026 — ORQ-R3-02

Este adendo complementa o cronograma original; não apaga estados históricos nem declara concluídas as pendências que continuam abertas.

### Revalidação dos PRs/CI nesta consulta
- PR #12: OPEN / não mesclado; HEAD `ced2b32597c2ba93cf6f77780dc7b220f742ba62`. A execução #38773829990 está `completed/success` para esse HEAD. Isso comprova o resultado da execução indicada, não revisão humana nem segurança completa.
- PR #13: OPEN / DRAFT / não mesclado; HEAD `5e6973829ecb5e2599dff6dc31d14a61fd4797bc`. A execução #38808385290 está `completed/success` para esse HEAD. Contrato/testes sintéticos não provam autenticação, persistência real, entrega externa ou implantação.
- Revisores solicitados: zero em ambos os PRs na consulta atual; revisão humana independente continua pendente.
- Avisos de manutenção de Actions/runtime permanecem como tarefa separada; nenhuma atualização do workflow foi executada neste adendo.

### Frente Teste Mudança — resultados cruzados, somente laboratório
- Onda 02 CT-007/CT-008: cópia local isolada dos blobs recuperados executou baseline PASS, compilação de sintaxe PASS e teste negativo PASS; evidência proposta no laboratório: https://github.com/Jus-9/testes-mudanca/pull/45 (OPEN / DRAFT, não mesclado).
- FAROL R1: a cópia local do HEAD examinado reproduziu 9/9 testes; dois testes adversariais demonstraram referência mutável e autodeclaração de `verified`. O patch proposto passou 15/15 testes e `py_compile` local; PR corretivo empilhado: https://github.com/Jus-9/testes-mudanca/pull/43 (OPEN / DRAFT, CI remoto e revisão independente pendentes).
- Nenhum merge/deploy foi executado por esta revisão. Os PRs #36 e #38 do laboratório foram observados como mesclados em 22/10/2026; isso é registro de estado externo observado, não ação desta sessão.

### Prioridade imediata
1. Obter revisão independente e CI para o PR #43; manter o PR #1 original em draft e preservar sua branch.
2. Confirmar checks reais e avaliar rollback Git em ensaio separado, sem dados reais.
3. Localizar a fonte canônica do Mega Cronograma Uno e o ponteiro histórico de 16/10 antes de declarar ambos os mega cronogramas reconciliados.
4. Manter integrações externas desabilitadas até identidade/canal, autorização e recibo verificáveis.

### Estado de governança
- Mega Cronograma desta branch: adendo proposto, aguardando PR/revisão.
- Mega Cronograma Uno institucional: não localizado; não atualizado.
- Gate C externo: HOLD.
- Merge/deploy de produção: não autorizado por este adendo.
