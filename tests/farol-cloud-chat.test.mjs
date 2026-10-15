import test from "node:test";
import assert from "node:assert/strict";
import { createMessageEnvelope, transitionMessage } from "../src/integrations/farol-cloud-chat/contract.js";

const validInput = {
  messageId: "msg-001",
  conversationId: "conv-001",
  actorId: "operator-001",
  actorType: "human",
  content: "Checkpoint de continuidade.",
  classification: "INTERNAL",
  idempotencyKey: "idem-001"
};

test("creates a prepared envelope with a timestamp and initial history", () => {
  const message = createMessageEnvelope(validInput, "2026-10-15T12:00:00.000Z");
  assert.equal(message.status, "prepared");
  assert.equal(message.createdAt, "2026-10-15T12:00:00.000Z");
  assert.equal(message.history.length, 1);
});

test("rejects missing identity and unsupported classification", () => {
  assert.throws(() => createMessageEnvelope({ ...validInput, actorId: "" }), /actorId is required/);
  assert.throws(() => createMessageEnvelope({ ...validInput, classification: "SECRET" }), /classification is not supported/);
});

test("requires approval identity before queueing can begin", () => {
  const message = createMessageEnvelope(validInput);
  assert.throws(() => transitionMessage(message, "approved"), /approverId is required/);
  const approved = transitionMessage(message, "approved", { approverId: "human-reviewer" });
  const queued = transitionMessage(approved, "queued");
  assert.equal(queued.status, "queued");
});

test("requires provider evidence and a receipt before delivery is recorded", () => {
  let message = createMessageEnvelope(validInput);
  message = transitionMessage(message, "approved", { approverId: "human-reviewer" });
  message = transitionMessage(message, "queued");
  assert.throws(() => transitionMessage(message, "dispatched"), /providerMessageId is required/);
  message = transitionMessage(message, "dispatched", { providerMessageId: "provider-msg-77" });
  assert.throws(() => transitionMessage(message, "delivered"), /receiptId is required/);
  message = transitionMessage(message, "delivered", { receiptId: "receipt-77" });
  assert.throws(() => transitionMessage(message, "acknowledged"), /acknowledgedBy is required/);
  message = transitionMessage(message, "acknowledged", { acknowledgedBy: "verified-recipient" });
  assert.equal(message.status, "acknowledged");
});

test("rejects skipped states and unauthorized retry", () => {
  const message = createMessageEnvelope(validInput);
  assert.throws(() => transitionMessage(message, "delivered", { receiptId: "receipt" }), /invalid message transition/);
  const failed = transitionMessage(message, "failed", { errorCode: "NOT_SENT" });
  assert.throws(() => transitionMessage(failed, "queued"), /retryAuthorized must be true/);
  assert.equal(transitionMessage(failed, "queued", { retryAuthorized: true }).status, "queued");
});
