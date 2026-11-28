import test from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../src/lib/rate-limit";

test("checkRateLimit allows requests up to limit and blocks excess", () => {
  const key = `test-rl-${Date.now()}`;
  const r1 = checkRateLimit(key, 2, 60_000);
  const r2 = checkRateLimit(key, 2, 60_000);
  const r3 = checkRateLimit(key, 2, 60_000);

  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 1);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 0);
  assert.equal(r3.allowed, false);
  assert.equal(r3.remaining, 0);
});
