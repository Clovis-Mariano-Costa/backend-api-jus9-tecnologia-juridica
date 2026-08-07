import crypto from 'node:crypto';

export function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

export const dictionary = {
  SENTENCA: { state: 'EM_PESQUISA', canonical: false, reason: 'AGUARDA_FONTE_FILOLOGICA' },
  PROVENIENCIA: { state: 'CANONICA', canonical: true },
  REVOGACAO: { state: 'CANONICA', canonical: true }
};

export function classifyCanonical(input) {
  const term = String(input.term || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();
  const entry = dictionary[term];
  if (!entry) return { decision: 'LACUNA', canonical: false, sourceClaimed: false, term };
  if (!entry.canonical) return { decision: 'NAO_CANONICA', canonical: false, sourceClaimed: false, state: entry.state, term };
  return { decision: 'CANONICA', canonical: true, sourceClaimed: Boolean(input.source), state: entry.state, term };
}

export function c01Metrics(rows) {
  const applicable = rows.length;
  let correct = 0, gapTP = 0, gapFP = 0, gapFN = 0;
  for (const row of rows) {
    const ok = row.actual.decision === row.expectedDecision && row.actual.canonical === row.expectedCanonical && row.actual.sourceClaimed === row.expectedSourceClaimed;
    if (ok) correct++;
    const expectedGap = ['LACUNA','NAO_CANONICA'].includes(row.expectedDecision);
    const actualGap = ['LACUNA','NAO_CANONICA'].includes(row.actual.decision);
    if (expectedGap && actualGap) gapTP++;
    else if (!expectedGap && actualGap) gapFP++;
    else if (expectedGap && !actualGap) gapFN++;
  }
  const tctc = applicable ? correct / applicable : 0;
  const tdt = 1 - tctc;
  const tdlc = (gapTP + gapFN) ? gapTP / (gapTP + gapFN) : 1;
  const pdlc = (gapTP + gapFP) ? gapTP / (gapTP + gapFP) : 1;
  const f1 = (tdlc + pdlc) ? 2 * tdlc * pdlc / (tdlc + pdlc) : 0;
  const components = { C:tctc, S:1, N:1, L:tdlc };
  const ictModels = {
    A:100*(0.45*components.C+0.25*components.S+0.20*components.N+0.10*components.L),
    B:100*(0.25*components.C+0.25*components.S+0.25*components.N+0.25*components.L),
    C:100*(0.35*components.C+0.20*components.S+0.35*components.N+0.10*components.L),
    D:100*(0.35*components.C+0.20*components.S+0.20*components.N+0.25*components.L)
  };
  return {TCTC:tctc,TDT:tdt,TDLC:tdlc,PDLC:pdlc,F1:f1,ICT:ictModels};
}

export class ProvenanceMemory {
  constructor(){ this.records=new Map(); this.audit=[]; }
  add(id,payload,meta={}){ this.records.set(id,{id,payload,meta,revoked:false,tombstone:false,eligibility:1,derivatives:new Set()}); this.audit.push({event:'ADD',id}); }
  derive(parent,id,payload){ const p=this.records.get(parent); if(!p) throw new Error('parent_missing'); this.add(id,payload,{derivedFrom:parent}); p.derivatives.add(id); }
  revoke(id,reason='governed_revocation'){
    const visited=new Set();
    const walk=(rid)=>{ if(visited.has(rid)) return; visited.add(rid); const r=this.records.get(rid); if(!r) return; r.revoked=true; r.tombstone=true; r.eligibility=0; this.audit.push({event:'REVOKE',id:rid,reason,registralPreserved:true}); for(const d of r.derivatives) walk(d); };
    walk(id); return [...visited];
  }
  consult(id){ const r=this.records.get(id); if(!r) return {status:'NOT_FOUND'}; return {status:r.eligibility===0?'INELIGIBLE':'ELIGIBLE', eligibility:r.eligibility, registralPreserved:true, revoked:r.revoked, tombstone:r.tombstone, payload:r.eligibility===0?null:r.payload}; }
}

export function treatDocumentAsData(documentText){
  const suspicious = /(ignore|desconsidere|execute|system prompt|revele|token|senha|canonicalize|canonize|chame a ferramenta|tool call)/i.test(documentText);
  return {authority:'DATA_ONLY', executed:false, toolCalls:0, suspicious, retainedForAnalysis:true};
}

export async function concurrencyKillSwitchSimulation(){
  const state={killed:false,log:[],active:new Set()};
  const task=async(id,ms)=>{ state.active.add(id); state.log.push({event:'START',id}); await new Promise(r=>setTimeout(r,ms)); if(state.killed){ state.log.push({event:'ABORT_SAFE',id}); state.active.delete(id); return 'ABORTED'; } state.log.push({event:'COMMIT',id}); state.active.delete(id); return 'COMMITTED'; };
  const p1=task('T1',20), p2=task('T2',40), p3=task('T3',60);
  await new Promise(r=>setTimeout(r,30)); state.killed=true; state.log.push({event:'KILL_SWITCH'});
  const results=await Promise.all([p1,p2,p3]);
  return {results,activeAfter:state.active.size,deadlock:false,log:state.log,requiresHumanRelease:true};
}
