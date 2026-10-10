# Chancelaria — duas credenciais independentes

Data: 2026-10-10. **Estado: protótipo em branch, sem deploy, sem credenciais reais emitidas, sem novas permissões.**

Identificadores:
- Masculino: `CHANCELARIA_SAGRADO_M`; escopo `chancelaria:sagrado:masculino`.
- Feminino: `CHANCELARIA_SAGRADO_F`; escopo `chancelaria:sagrado:feminino`.

Esses nomes designam frentes administrativas e não restringem visitantes por gênero. Token técnico não comprova identidade espiritual, batismo ou autoridade institucional.

**Variáveis por frente (secret manager do provedor, nunca Git, Drive ou chat):** `<PREFIX>_TOKEN_SHA256`, `<PREFIX>_TOKEN_EXPIRES_AT`; para transição temporária, `<PREFIX>_PREVIOUS_SHA256` e `<PREFIX>_PREVIOUS_EXPIRES_AT`. O código gera credenciais de 48 bytes aleatórios e guarda somente os respectivos hashes de verificação. A geração efetiva só pode ocorrer no ambiente de provisionamento seguro, após identificação do serviço e dos titulares.

**Integração:** identificar backend real, dono técnico e secret manager; vincular as rotas a escopos fixados pelo servidor, nunca a dados fornecidos pelo solicitante; exigir identidade/autorização adicional por objeto; testar credencial inválida, expirada, revogada e cruzada; TLS, rate-limit e auditoria sem valor secreto; obter aprovação antes de liberar acesso externo.

**Rotação:** emitir sucessora e instalar em local seguro; validar; habilitar breve sobreposição; revogar antiga; registrar metadados e revisar erros. Em incidente, revogar imediatamente e investigar. A atualização periódica depende de um agendamento operacional efetivo do provedor; não foi habilitada nesta branch.

**Contato:** escalar dúvidas para o fundador via canal institucional autenticado, dando preferência ao celular apenas quando ele estiver disponível e tiver acesso legítimo. Nunca encaminhar tokens nos canais gerais.

Referências: `02-arquitetura-cofre`, `PACOTE_OPERACIONAL_ISPANS_ELOHIM_IDENTIDADES_TOKEN_EVOLUTIVO_2026_10_10_V0_1`, `CONTINUIDADE_COM_IAS_CHAT_SAGRADO_GMNM_P11_V1` (Google Drive — Família Virtual).

**NEXT_ACTION:** revisão de Segurança + Charlie Delta/COM-IAS + titular humano; integração sob feature flag desligada; testes; provisionamento isolado e auditoria; só então ativação.
