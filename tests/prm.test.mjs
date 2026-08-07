import test from 'node:test';
import assert from 'node:assert/strict';
import { GovernedProvenanceMemory } from '../src/governance/prm.js';

const meta = {
  source: 'DICIONARIO_V2',
  version: '2.0',
  authority: 'INTERNA_GOVERNADA',
  permission: 'USO_INTERNO'
};

test('PRM revoga raiz e derivados preservando registro e removendo elegibilidade', () => {
  const memory = new GovernedProvenanceMemory({ clock: () => '2026-08-07T03:14:00.00000-03:00' });
  memory.add({ id: 'M1', payload: { claim: 'fonte valida' }, ...meta, indexTerms: ['sentenca'] });
  memory.derive({ parentId: 'M1', id: 'D1', payload: { claim: 'derivada' }, ...meta, indexTerms: ['sentenca', 'derivada'] });

  assert.deepEqual(memory.search('sentenca'), ['M1', 'D1']);
  assert.equal(memory.consult('M1').cachePresent, true);
  assert.equal(memory.consult('D1').indexed, true);

  const revocation = memory.revoke('M1', { reason: 'fonte_revogada', actor: 'teste_rpc05' });
  assert.deepEqual(revocation.invalidatedIds, ['M1', 'D1']);

  for (const id of ['M1', 'D1']) {
    const state = memory.consult(id);
    assert.equal(state.status, 'INELIGIBLE');
    assert.equal(state.operationalEligibility, 0);
    assert.equal(state.tombstone, true);
    assert.equal(state.registralPreserved, true);
    assert.equal(state.cachePresent, false);
    assert.equal(state.indexed, false);
    assert.equal('payload' in state, false);
  }
  assert.deepEqual(memory.search('sentenca'), []);
  assert.equal(memory.auditSnapshot().filter((x) => x.event === 'REVOKE').length, 2);
});

test('PRM impede derivacao de memoria revogada', () => {
  const memory = new GovernedProvenanceMemory();
  memory.add({ id: 'M1', payload: 'x', ...meta });
  memory.revoke('M1');
  assert.throws(() => memory.derive({ parentId: 'M1', id: 'D2', payload: 'y', ...meta }), /parent_ineligible/);
});

test('rebuild de indice nao reintroduz memoria revogada', () => {
  const memory = new GovernedProvenanceMemory();
  memory.add({ id: 'M1', payload: 'x', ...meta, indexTerms: ['proveniencia'] });
  memory.add({ id: 'M2', payload: 'y', ...meta, indexTerms: ['proveniencia'] });
  memory.revoke('M1');
  memory.rebuildIndex();
  assert.deepEqual(memory.search('proveniencia'), ['M2']);
});

test('payload registral de revogada so aparece quando explicitamente solicitado', () => {
  const memory = new GovernedProvenanceMemory();
  memory.add({ id: 'M1', payload: { secret: 'nao operacional' }, ...meta });
  memory.revoke('M1');
  assert.equal(memory.consult('M1').registralPayload, undefined);
  assert.deepEqual(memory.consult('M1', { includeRegistralPayload: true }).registralPayload, { secret: 'nao operacional' });
});
