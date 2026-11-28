import test from "node:test";
import assert from "node:assert/strict";
import { priorityParts, slaHoursLeft } from "../src/lib/priority";
import { toProgress } from "../src/lib/gamify";

test("priorityParts calculates severity, votes, age, and SLA overdue correctly", () => {
  const now = Date.UTC(2026, 10, 27, 12, 0, 0);
  const res = priorityParts(
    {
      priority: "CRITICAL",
      upvoteCount: 25,
      createdAt: new Date(now - 5 * 86_400_000),
      slaDueAt: new Date(now - 3_600_000),
      status: "IN_PROGRESS",
    },
    now
  );
  assert.equal(res.sev, 40);
  assert.equal(res.votes, 20);
  assert.equal(res.age, 10);
  assert.equal(res.sla, 20);
  assert.equal(res.total, 90);
});

test("priorityParts returns 0 for RESOLVED or CLOSED issues", () => {
  const now = Date.now();
  const res = priorityParts(
    {
      priority: "HIGH",
      upvoteCount: 15,
      createdAt: new Date(now - 86_400_000),
      slaDueAt: new Date(now - 3_600_000),
      status: "RESOLVED",
    },
    now
  );
  assert.equal(res.total, 0);
  assert.equal(slaHoursLeft(new Date(now + 3_600_000), "CLOSED", now), null);
});

test("toProgress computes civic levels and badges accurately", () => {
  const prog = toProgress({ reports: 5, resolved: 3, ratings: 3, votes: 12, points: 137 });
  assert.equal(prog.levelKey, "lv_2");
  assert.equal(prog.next, 150);
  assert.deepEqual(prog.badges, [1, 2, 4, 5, 6]);
});
