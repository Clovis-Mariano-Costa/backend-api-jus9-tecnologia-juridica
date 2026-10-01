# IA READ FIRST — backend-api-jus9-tecnologia-juridica

SCHEMA = JUS9_REPO_ENTRY_V1
STATE = DRAFT_BRANCH
PRIMARY_READER = IA
REPO_ROLE = BACKEND_API
CLASSIFICATION = PUBLICO_SANITIZADO
RULES = IA_FIRST + LINK_FIRST + EVIDENCE_FIRST + FAIL_CLOSED

## PURPOSE
Backend/API e integracoes; nenhum segredo real em configuracao publica.

## START
1. Leia README.md e SECURITY.md quando existir.
2. Identifique configuracoes, dependencias e superficies antes de alterar.
3. Procure automacoes/triggers; documento sozinho nao prova execucao.
4. Preserve REQUEST_ID, evidencias, rollback e continuidade.
5. Se houver lacuna normativa -> Legislador; conflito/prioridade -> Mestre; implementacao -> Codex.

## SECURITY
PUBLIC_REPO_SECRET = PROIBIDO
ENV_EXAMPLE = nomes/shape apenas; nunca segredo real.
COFRE/SECRET/SECRETO/SIGILOSO path = sinal de classificacao, nao fronteira de seguranca.
SECRETO -> deny by default; custodiante nao equivale a autorizacao de leitura.
LOGS -> nunca registrar segredo bruto, token, senha, chave ou payload protegido desnecessario.
TEST_DATA = sintetico por padrao.

## AUTOMATION
NO_WORKFLOW_FOUND_IN_MAIN_BASELINE != NO_AUTOMATION_GLOBAL
Cloud/service consoles ainda exigem inventario tecnico quando acessiveis.
Nenhum deploy/merge e autorizado por este documento.

## LINKS
COMMUNICATION_MAP = https://docs.google.com/document/d/1xaQXGbZ0LdHaipUhLewWtPmoajEeUKS9s1RChjMjWWU/edit
GITHUB_INVENTORY = https://docs.google.com/document/d/1MfktKZtfL9imoyZ9DWDmBe3-z2jE_2HkRcTXydPSrPI/edit

## NEXT
Classificar ACTIVE | LEGACY | POINTER | EXPERIMENTAL; mapear owner profissional, dados, triggers, secrets surface, rollback e proximo passo.
