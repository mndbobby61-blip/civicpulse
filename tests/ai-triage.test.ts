import test from "node:test";
import assert from "node:assert/strict";
import { classifyLocally } from "../src/lib/ai-triage";

const CATS = [
  { id: "c1", name: "Road Damage", nameBn: "রাস্তা ভাঙা" },
  { id: "c2", name: "Streetlight", nameBn: "স্ট্রিটলাইট" },
  { id: "c3", name: "Drainage", nameBn: "ড্রেনেজ" },
  { id: "c4", name: "Footpath", nameBn: "ফুটপাত" },
  { id: "c5", name: "Waste Management", nameBn: "বর্জ্য" },
];

test("classifyLocally detects Bangla road emergency as Road Damage + CRITICAL", () => {
  const res = classifyLocally("মিরপুর ১০ রাস্তায় বড় গর্ত", "স্কুলের সামনে দুর্ঘটনা ঘটছে জরুরি মেরামত দরকার", CATS);
  assert.equal(res.categoryId, "c1");
  assert.equal(res.priority, "CRITICAL");
  assert.equal(res.source, "heuristic");
});

test("classifyLocally detects English drainage overflow as Drainage + HIGH", () => {
  const res = classifyLocally("Blocked drain in Dhanmondi", "Drain overflow for 3 days causing waterlogging", CATS);
  assert.equal(res.categoryId, "c3");
  assert.equal(res.priority, "HIGH");
});
