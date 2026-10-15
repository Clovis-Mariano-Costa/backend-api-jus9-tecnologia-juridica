const ACTOR_TYPES = new Set(["human", "assistant", "system", "integration"]);
const CLASSIFICATIONS = new Set(["PUBLIC", "INTERNAL", "RESTRICTED"]);
const MAX_CONTENT_LENGTH = 4000;

export function createMessageEnvelope(input, now = new Date().toISOString()) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("message input must be an object");
  }

  for (const field of ["messageId", "conversationId", "actorId", "actorType", "content", "classification", "idempotencyKey"]) {
    if (typeof input[field] !== "string" || !input[field].trim()) {
      throw new TypeError(field + " is required");
    }
  }
  if (!ACTOR_TYPES.has(input.actorType)) throw new TypeError("actorType is not supported");
  if (!CLASSIFICATIONS.has(input.classification)) throw new TypeError("classification is not supported");

  const text = input.content.replace(/[\u0000-\u001F\u007F]/g, " ").trim();
  if (!text) throw new TypeError("content must not be empty");
  if (text.length > MAX_CONTENT_LENGTH) throw new RangeError("content exceeds " + MAX_CONTENT_LENGTH + " characters");
  if (Number.isNaN(Date.parse(now))) throw new TypeError("now must be a valid timestamp");

  const timestamp = new Date(now).toISOString();
  return Object.freeze({
    messageId: input.messageId.trim(),
    conversationId: input.conversationId.trim(),
    createdAt: timestamp,
    actorId: input.actorId.trim(),
    actorType: input.actorType,
    content: text,
    classification: input.classification,
    idempotencyKey: input.idempotencyKey.trim(),
    status: "prepared",
    history: Object.freeze([Object.freeze({ status: "prepared", at: timestamp })])
  });
}

const NEXT_STATES = Object.freeze({
  prepared: new Set(["approved", "failed"]),
  approved: new Set(["queued", "failed"]),
  queued: new Set(["dispatched", "failed"]),
  dispatched: new Set(["delivered", "failed"]),
  delivered: new Set(["acknowledged", "failed"]),
  acknowledged: new Set(),
  failed: new Set(["queued"])
});

export function transitionMessage(message, nextStatus, metadata = {}, now = new Date().toISOString()) {
  if (!message || !NEXT_STATES[message.status]) throw new TypeError("message has an invalid current status");
  if (!NEXT_STATES[message.status].has(nextStatus)) {
    throw new Error("invalid message transition: " + message.status + " -> " + nextStatus);
  }
  if (Number.isNaN(Date.parse(now))) throw new TypeError("now must be a valid timestamp");
  if (nextStatus === "approved" && !(typeof metadata.approverId === "string" && metadata.approverId.trim())) {
    throw new TypeError("approverId is required to approve a message");
  }
  if (nextStatus === "dispatched" && !(typeof metadata.providerMessageId === "string" && metadata.providerMessageId.trim())) {
    throw new TypeError("providerMessageId is required to mark a message dispatched");
  }
  if (nextStatus === "delivered" && !(typeof metadata.receiptId === "string" && metadata.receiptId.trim())) {
    throw new TypeError("receiptId is required to mark a message delivered");
  }
  if (nextStatus === "acknowledged" && !(typeof metadata.acknowledgedBy === "string" && metadata.acknowledgedBy.trim())) {
    throw new TypeError("acknowledgedBy is required to acknowledge a message");
  }
  if (nextStatus === "queued" && message.status === "failed" && metadata.retryAuthorized !== true) {
    throw new TypeError("retryAuthorized must be true to retry a failed message");
  }

  const event = { status: nextStatus, at: new Date(now).toISOString() };
  for (const field of ["approverId", "providerMessageId", "receiptId", "acknowledgedBy", "errorCode"]) {
    if (typeof metadata[field] === "string" && metadata[field].trim()) event[field] = metadata[field].trim().slice(0, 120);
  }
  return Object.freeze({ ...message, status: nextStatus, history: Object.freeze([...message.history, Object.freeze(event)]) });
}
