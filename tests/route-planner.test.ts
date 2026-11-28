import test from "node:test";
import assert from "node:assert/strict";
import { haversineKm, optimizeFieldRoute } from "../src/lib/route-planner";

test("haversineKm computes positive realistic Dhaka distance", () => {
  const km = haversineKm(23.8069, 90.3687, 23.7461, 90.3742); // Mirpur 10 to Dhanmondi 27
  assert.ok(km > 5 && km < 9, `Expected 5-9km, got ${km}`);
});

test("optimizeFieldRoute orders nearest stop first and accumulates distance", () => {
  const { ordered, totalKm } = optimizeFieldRoute(
    [
      {
        id: "far",
        seq: 2,
        title: "Far issue",
        address: "Uttara",
        lat: 23.8759,
        lng: 90.3795,
        status: "ASSIGNED",
        priority: "MEDIUM",
        slaDueAt: null,
        cat: "Road Damage",
        catBn: null,
      },
      {
        id: "near",
        seq: 1,
        title: "Near issue",
        address: "Tejgaon",
        lat: 23.7639,
        lng: 90.3926,
        status: "ASSIGNED",
        priority: "MEDIUM",
        slaDueAt: null,
        cat: "Drainage",
        catBn: null,
      },
    ],
    23.76,
    90.39
  );
  assert.equal(ordered.length, 2);
  assert.equal(ordered[0].id, "near");
  assert.equal(ordered[0].step, 1);
  assert.equal(ordered[1].step, 2);
  assert.ok(totalKm > ordered[0].distanceKm);
});
