import crypto from 'node:crypto';

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

export function stableHash(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return crypto.createHash('sha256').update(text).digest('hex');
}

export class GovernedProvenanceMemory {
  constructor({ clock = () => new Date().toISOString() } = {}) {
    this.clock = clock;
    this.records = new Map();
    this.cache = new Map();
    this.index = new Map();
    this.audit = [];
  }

  #log(event, details = {}) {
    const entry = { seq: this.audit.length + 1, timestamp: this.clock(), event, ...details };
    this.audit.push(entry);
    return entry;
  }

  #assertNewId(id) {
    if (!id || this.records.has(id)) throw new Error('memory_id_invalid_or_exists');
  }

  #recordIndex(record) {
    for (const term of record.indexTerms) {
      if (!this.index.has(term)) this.index.set(term, new Set());
      this.index.get(term).add(record.id);
    }
  }

  #removeFromIndex(id) {
    for (const [term, ids] of this.index.entries()) {
      ids.delete(id);
      if (ids.size === 0) this.index.delete(term);
    }
  }

  add({ id, payload, source, version, authority, permission, indexTerms = [] }) {
    this.#assertNewId(id);
    if (!source || !version || !authority || !permission) throw new Error('provenance_fields_required');
    const record = {
      id,
      payload: clone(payload),
      source,
      version,
      authority,
      permission,
      indexTerms: [...new Set(indexTerms.map((x) => String(x).toUpperCase()))],
      derivedFrom: null,
      derivatives: new Set(),
      revoked: false,
      tombstone: false,
      operationalEligibility: 1,
      revocationReason: null,
      createdAt: this.clock(),
      contentHash: stableHash(payload)
    };
    this.records.set(id, record);
    this.cache.set(id, clone(payload));
    this.#recordIndex(record);
    this.#log('ADD', { id, source, version, contentHash: record.contentHash });
    return this.describe(id);
  }

  derive({ parentId, id, payload, source, version, authority, permission, indexTerms = [] }) {
    const parent = this.records.get(parentId);
    if (!parent) throw new Error('parent_missing');
    if (parent.operationalEligibility === 0) throw new Error('parent_ineligible');
    const created = this.add({ id, payload, source, version, authority, permission, indexTerms });
    const child = this.records.get(id);
    child.derivedFrom = parentId;
    parent.derivatives.add(id);
    this.#log('DERIVE', { parentId, id });
    return created;
  }

  revoke(id, { reason = 'governed_revocation', actor = 'unspecified' } = {}) {
    if (!this.records.has(id)) throw new Error('memory_missing');
    const visited = [];
    const walk = (recordId, rootId) => {
      if (visited.includes(recordId)) return;
      const record = this.records.get(recordId);
      if (!record) return;
      visited.push(recordId);
      record.revoked = true;
      record.tombstone = true;
      record.operationalEligibility = 0;
      record.revocationReason = reason;
      this.cache.delete(recordId);
      this.#removeFromIndex(recordId);
      this.#log('REVOKE', {
        id: recordId,
        rootId,
        reason,
        actor,
        registralPreserved: true,
        cacheInvalidated: true,
        indexInvalidated: true
      });
      for (const derivativeId of record.derivatives) walk(derivativeId, rootId);
    };
    walk(id, id);
    return { rootId: id, invalidatedIds: visited };
  }

  consult(id, { includeRegistralPayload = false } = {}) {
    const record = this.records.get(id);
    if (!record) return { status: 'NOT_FOUND', id };
    const eligible = record.operationalEligibility === 1;
    const response = {
      id,
      status: eligible ? 'ELIGIBLE' : 'INELIGIBLE',
      operationalEligibility: record.operationalEligibility,
      revoked: record.revoked,
      tombstone: record.tombstone,
      source: record.source,
      version: record.version,
      authority: record.authority,
      permission: record.permission,
      contentHash: record.contentHash,
      derivedFrom: record.derivedFrom,
      derivatives: [...record.derivatives],
      registralPreserved: true,
      cachePresent: this.cache.has(id),
      indexed: [...this.index.values()].some((ids) => ids.has(id))
    };
    if (eligible) response.payload = clone(record.payload);
    else if (includeRegistralPayload) response.registralPayload = clone(record.payload);
    return response;
  }

  search(term) {
    const ids = [...(this.index.get(String(term).toUpperCase()) || [])];
    return ids.filter((id) => this.records.get(id)?.operationalEligibility === 1);
  }

  rebuildIndex() {
    this.index.clear();
    for (const record of this.records.values()) {
      if (record.operationalEligibility === 1) this.#recordIndex(record);
    }
    this.#log('INDEX_REBUILD', { activeRecords: [...this.records.values()].filter((r) => r.operationalEligibility === 1).length });
    return this.indexSnapshot();
  }

  indexSnapshot() {
    return Object.fromEntries([...this.index.entries()].map(([term, ids]) => [term, [...ids].sort()]));
  }

  describe(id) {
    const record = this.records.get(id);
    if (!record) return null;
    return {
      id: record.id,
      source: record.source,
      version: record.version,
      authority: record.authority,
      permission: record.permission,
      contentHash: record.contentHash,
      operationalEligibility: record.operationalEligibility,
      tombstone: record.tombstone
    };
  }

  auditSnapshot() {
    return clone(this.audit);
  }
}
