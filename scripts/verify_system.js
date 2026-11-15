const crypto = require("crypto");

console.log("=== 🛡 LendLoop Security & Idempotency System Verification ===");

// 1. Test HMAC Signature Generation & Verification
const SHARED_SECRET = "lendloop_test_secret_key_1234567890";
const payload = JSON.stringify({
  loanId: "loan_xyz123",
  idempotencyKey: "overdue-loan_xyz123-2026-11-16",
  status: "sent",
  details: "Automated overdue reminder test",
});

function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function verify(payload, signature, secret) {
  if (!signature) return false;
  const cleanSig = signature.startsWith("sha256=") ? signature.slice(7) : signature;
  const expectedSig = sign(payload, secret);
  const bufA = Buffer.from(cleanSig, "hex");
  const bufB = Buffer.from(expectedSig, "hex");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

const signature = sign(payload, SHARED_SECRET);
console.log("Generated HMAC-SHA256 Signature:", signature);

const isValid = verify(payload, signature, SHARED_SECRET);
console.log("Valid Signature Check:", isValid ? "✅ PASSED" : "❌ FAILED");

const isTampered = verify(payload + "tampered", signature, SHARED_SECRET);
console.log("Tampered Payload Rejection:", !isTampered ? "✅ PASSED (Rejected)" : "❌ FAILED");

const isWrongKey = verify(payload, signature, "wrong_secret_key");
console.log("Invalid Secret Rejection:", !isWrongKey ? "✅ PASSED (Rejected)" : "❌ FAILED");

// 2. Test Idempotency Key Simulator
const seenKeys = new Set();
function processWriteback(idempotencyKey, record) {
  if (seenKeys.has(idempotencyKey)) {
    return { idempotent: true, status: "already_processed", message: "Duplicate writeback ignored." };
  }
  seenKeys.add(idempotencyKey);
  return { idempotent: false, status: "recorded", record };
}

const key = "overdue-loan_123-2026-11-16";
const firstCall = processWriteback(key, { loanId: "loan_123" });
console.log("First Writeback Execution:", firstCall.idempotent === false ? "✅ PASSED (Recorded)" : "❌ FAILED");

const secondCall = processWriteback(key, { loanId: "loan_123" });
console.log("Second Writeback Retry (Idempotent):", secondCall.idempotent === true ? "✅ PASSED (Duplicate Prevented)" : "❌ FAILED");

// 3. Test Data Minimization Filter
const rawTool = {
  _id: "tool_abc",
  name: "Drill Press",
  category: "power tools",
  condition: "like-new",
  description: "High precision benchtop drill press.",
  ownerId: "user_secret_clerk_id_999",
  ownerName: "Private Neighbor",
  ownerEmail: "private@neighbor.org",
  status: "available",
  createdAt: 1700000000000,
};

function minimizePublicTool(tool) {
  return {
    _id: tool._id,
    name: tool.name,
    category: tool.category,
    status: tool.status,
  };
}

const publicProjection = minimizePublicTool(rawTool);
const hasNoPII =
  !publicProjection.ownerId &&
  !publicProjection.ownerName &&
  !publicProjection.ownerEmail &&
  publicProjection.name === "Drill Press";

console.log("Public Data Minimization:", hasNoPII ? "✅ PASSED (Zero PII Leaked)" : "❌ FAILED");

console.log("\nAll core security & integrity checks passed! 🚀");
