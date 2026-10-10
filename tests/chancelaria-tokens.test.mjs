import test from 'node:test';
import assert from 'node:assert/strict';
import { CHANCELARIA_LANES, generateChancelariaToken, verifyChancelariaBearer } from '../src/security/chancelaria-tokens.js';

const now = Date.parse('2026-10-10T12:00:00Z');
const expires = '2026-10-11T12:00:00Z';
function envFor(lane, record, until = expires) {
  const p = CHANCELARIA_LANES[lane].prefix;
  return { [p + '_TOKEN_SHA256']: record.sha256, [p + '_TOKEN_EXPIRES_AT']: until };
}
function check(lane, token, env, at = now) {
  return verifyChancelariaBearer({ lane, authorization: 'Bearer ' + token, env, now: at });
}
test('strong random distinct credentials', () => {
  const a = generateChancelariaToken(), b = generateChancelariaToken();
  assert.match(a.token, /^[A-Za-z0-9_-]{64}$/);
  assert.match(a.sha256, /^[0-9a-f]{64}$/);
  assert.notEqual(a.token, b.token);
});
test('enforces strict lane isolation', () => {
  const m = generateChancelariaToken(), f = generateChancelariaToken();
  const env = { ...envFor('masculino', m), ...envFor('feminino', f) };
  assert.equal(check('masculino', m.token, env), true);
  assert.equal(check('feminino', f.token, env), true);
  assert.equal(check('masculino', f.token, env), false);
  assert.equal(check('feminino', m.token, env), false);
});
test('fails closed when invalid, missing or expired', () => {
  const m = generateChancelariaToken();
  assert.equal(check('masculino', m.token, {}), false);
  assert.equal(check('other', m.token, envFor('masculino', m)), false);
  assert.equal(check('masculino', m.token, envFor('masculino', m, '2026-10-09T12:00:00Z')), false);
  assert.equal(verifyChancelariaBearer({ lane: 'masculino', authorization: m.token, env: envFor('masculino', m), now }), false);
});
test('bounded rotation and expiry of previous credential', () => {
  const a = generateChancelariaToken(), b = generateChancelariaToken();
  const p = CHANCELARIA_LANES.masculino.prefix;
  const env = { ...envFor('masculino', b), [p + '_PREVIOUS_SHA256']: a.sha256, [p + '_PREVIOUS_EXPIRES_AT']: '2026-10-10T12:05:00Z' };
  assert.equal(check('masculino', a.token, env), true);
  assert.equal(check('masculino', b.token, env), true);
  assert.equal(check('masculino', a.token, env, Date.parse('2026-10-10T12:05:01Z')), false);
});
