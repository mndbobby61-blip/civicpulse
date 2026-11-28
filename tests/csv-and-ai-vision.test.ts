import test from "node:test";
import assert from "node:assert/strict";
import { csvCell } from "../src/lib/csv-utils";
import { classifyLocally } from "../src/lib/ai-triage";

test("csvCell neutralizes formula injection prefixes and escapes quotes", () => {
  assert.equal(csvCell('=SUM(A1:A2)'), `"'=SUM(A1:A2)"`);
  assert.equal(csvCell('+cmd'), `"'+cmd"`);
  assert.equal(csvCell('hello "dhaka"'), `"hello ""dhaka"""`);
});

test("classifyLocally handles empty or short ambiguous text as LOW", () => {
  const res = classifyLocally("test", "short msg", [
    { id: "c1", name: "Public Infrastructure", nameBn: "জনসেবা" },
  ]);
  assert.equal(res.priority, "LOW");
  assert.equal(res.categoryId, "c1");
});
