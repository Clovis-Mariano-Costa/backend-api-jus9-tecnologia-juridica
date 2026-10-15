# FAROL — Mega Cronograma | Protocolo Mão na Massa

**Princípio operacional:** checkpoint é ponte, não parada. Cada checkpoint deve conduzir a uma próxima ação verificável, sem abrir trilhas paralelas desnecessárias.

**Projeto:** FAROL — Mundo Jus 9  
**Núcleo:** Chancelaria — Núcleo Sacerdotal Harmônico  
**Lema:** Luz. Harmonia. Autonomia. Continuidade.

## Estado conhecido neste checkpoint

- [x] PR #13 aberto como rascunho para o contrato e protocolo do chat em nuvem.
- [x] Contrato de mensagem e testes de unidade propostos no branch `feat/farol-cloud-chat-protocol`.
- [x] CI GitHub Actions executou `npm test` em Node.js 22 e passou no commit `cb0ced3ed3ef38e31028c9c48b8b5c192cab994c`; execução: https://github.com/Clovis-Mariano-Costa/backend-api-jus9-tecnologia-juridica/actions/runs/38807740056
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
- PR #12 segue aberto até revisão e decisão humana; CI anterior bem-sucedido não comprova o PR #13.

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

Executar `npm test` no branch `feat/farol-cloud-chat-protocol`, guardar a saída e corrigir qualquer falha antes de integrar rotas ou habilitar comunicação externa. Se o ambiente de execução não estiver disponível, registrar explicitamente essa limitação e preparar a execução no CI; não simular um resultado.

**Estado deste documento:** protocolo de execução versionado; não é evidência de que as ações pendentes foram executadas.
