import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

// Two service credentials, never identity proofs or unrestricted authority.
export const CHANCELARIA_LANES = Object.freeze({
  masculino: Object.freeze({ prefix: 'CHANCELARIA_SAGRADO_M', scope: 'chancelaria:sagrado:masculino' }),
  feminino: Object.freeze({ prefix: 'CHANCELARIA_SAGRADO_F', scope: 'chancelaria:sagrado:feminino' })
});

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{64}$/;
const DIGEST_PATTERN = /^[0-9a-f]{64}$/i;
const UTC_ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

// Run only in a trusted provisioning environment; never log or commit results.
export function generateChancelariaToken() {
  const token = randomBytes(48).toString('base64url');
  return Object.freeze({ token, sha256: createHash('sha256').update(token).digest('hex') });
}

function expiresInFuture(value, now) {
  if (typeof value !== 'string' || !UTC_ISO_PATTERN.test(value)) return false;
  const expiry = Date.parse(value);
  return Number.isFinite(expiry) && now < expiry;
}

function hashMatches(tokenDigest, configuredHash) {
  if (typeof configuredHash !== 'string' || !DIGEST_PATTERN.test(configuredHash)) return false;
  const expected = Buffer.from(configuredHash, 'hex');
  return timingSafeEqual(tokenDigest, expected);
}

// The route MUST select the lane from trusted server-side policy, not input JSON.
export function verifyChancelariaBearer({ lane, authorization, env = process.env, now = Date.now() }) {
  const policy = Object.hasOwn(CHANCELARIA_LANES, lane) ? CHANCELARIA_LANES[lane] : null;
  if (!policy || typeof authorization !== 'string' || !Number.isFinite(now)) return false;
  const matched = /^Bearer ([A-Za-z0-9_-]{64})$/.exec(authorization);
  if (!matched || !TOKEN_PATTERN.test(matched[1])) return false;

  const digest = createHash('sha256').update(matched[1]).digest();
  const current = hashMatches(digest, env[policy.prefix + '_TOKEN_SHA256']) &&
    expiresInFuture(env[policy.prefix + '_TOKEN_EXPIRES_AT'], now);
  const previous = hashMatches(digest, env[policy.prefix + '_PREVIOUS_SHA256']) &&
    expiresInFuture(env[policy.prefix + '_PREVIOUS_EXPIRES_AT'], now);
  return current || previous;
}
