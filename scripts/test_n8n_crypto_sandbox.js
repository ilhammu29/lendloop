/**
 * Regression Test Suite for n8n Code Nodes in Restricted Sandbox
 * Simulates n8n default sandbox where require('crypto') throws "Module 'crypto' is disallowed".
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

console.log("=== 🧪 Regression Test: n8n Code Nodes in Disallowed Crypto Sandbox ===");

function runInRestrictedSandbox(code, customInput = {}, customEnv = {}) {
  const sandbox = {
    $env: {
      LENDLOOP_WEBHOOK_SECRET: 'test_secret_123',
      CONVEX_SITE_URL: 'http://localhost:3000',
      ...customEnv
    },
    $input: {
      item: { json: customInput.json || {}, headers: customInput.headers || {} },
      all: () => (customInput.items || [{ json: customInput.json || {} }])
    },
    require: (mod) => {
      // Simulate n8n's exact error
      throw new Error(`Module '${mod}' is disallowed [line 2]`);
    },
    Buffer: Buffer,
    Date: Date,
    JSON: JSON,
    console: console,
    Math: Math
  };

  const context = vm.createContext(sandbox);
  const script = new vm.Script(`
    function __run() {
      ${code}
    }
    __result = __run();
  `);
  
  script.runInContext(context);
  return sandbox.__result;
}

// 1. Test "Prepare Signed Fetch" in overdue_reminders.json
const overdueWorkflow = JSON.parse(fs.readFileSync(path.join(__dirname, '../n8n/workflows/overdue_reminders.json'), 'utf8'));
const prepareNode = overdueWorkflow.nodes.find(n => n.name === "Prepare Signed Fetch");
console.log("\n[Test 1] Testing 'Prepare Signed Fetch' node...");
try {
  const res1 = runInRestrictedSandbox(prepareNode.parameters.jsCode);
  const sig = res1[0].json.signature;
  const ts = res1[0].json.timestamp;
  const expected = crypto.createHmac('sha256', 'test_secret_123').update(`overdue-loans:${ts}`).digest('hex');
  if (sig !== expected) {
    throw new Error(`Signature mismatch: got ${sig}, expected ${expected}`);
  }
  console.log("✅ [Test 1] Passed! Signature matches native HMAC-SHA256 perfectly.");
} catch (e) {
  console.error("❌ [Test 1] FAILED:", e.message);
  process.exit(1);
}

// 2. Test "Prepare Reminders & Signatures" in overdue_reminders.json
const writebackNode = overdueWorkflow.nodes.find(n => n.name === "Prepare Reminders & Signatures");
console.log("\n[Test 2] Testing 'Format and Sign Write-Back' node...");
try {
  const testItems = [{
    json: {
      loanId: "ln_12345",
      toolName: "DeWalt Table Saw",
      borrowerEmail: "alice@example.com",
      borrowerName: "Alice",
      endDate: "2026-11-10",
      daysOverdue: 6
    }
  }];
  const res2 = runInRestrictedSandbox(writebackNode.parameters.jsCode, { items: testItems });
  const wb = res2[0].json;
  const expectedWbSig = crypto.createHmac('sha256', 'test_secret_123').update(JSON.stringify(wb.writebackBody)).digest('hex');
  if (wb.writebackSignature !== expectedWbSig) {
    throw new Error(`Writeback signature mismatch: got ${wb.writebackSignature}, expected ${expectedWbSig}`);
  }
  console.log("✅ [Test 2] Passed! Write-back signature matches native HMAC-SHA256 perfectly.");
} catch (e) {
  console.error("❌ [Test 2] FAILED:", e.message);
  process.exit(2);
}

// 3. Test "Verify HMAC & Data Minimization" in request_notification.json
const notifWorkflow = JSON.parse(fs.readFileSync(path.join(__dirname, '../n8n/workflows/request_notification.json'), 'utf8'));
const notifNode = notifWorkflow.nodes.find(n => n.name === "Verify HMAC & Data Minimization");
console.log("\n[Test 3] Testing 'Verify HMAC Signature & Apply Data Minimization' node...");
try {
  const payload = {
    event: "borrow_request_created",
    toolName: "Milwaukee Hammer Drill",
    recipientEmail: "bob@example.com",
    recipientName: "Bob",
    startDate: "2026-11-20",
    endDate: "2026-11-22"
  };
  const validSig = crypto.createHmac('sha256', 'test_secret_123').update(JSON.stringify(payload)).digest('hex');
  const res3 = runInRestrictedSandbox(notifNode.parameters.jsCode, {
    json: payload,
    headers: { "x-lendloop-signature": `sha256=${validSig}` }
  });
  if (!res3[0].json.verified) {
    throw new Error("Payload verification failed in restricted sandbox!");
  }
  console.log("✅ [Test 3] Passed! Incoming webhook verified cleanly in restricted sandbox.");
} catch (e) {
  console.error("❌ [Test 3] FAILED:", e.message);
  process.exit(3);
}

console.log("\n🎉 ALL 3 N8N CODE NODES PASSED IN RESTRICTED SANDBOX!");
process.exit(0);
