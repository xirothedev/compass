const { test } = require("node:test");
const assert = require("node:assert/strict");
const { interpRank, rankPercentile, RANK_TOTAL } = require("../dist/rank.js");

test("26.85 lands near rank 20k", () => {
  const r = interpRank(26.85);
  assert.ok(r > 15000 && r < 25000, `got ${r}`);
});

test("rank decreases as score rises", () => {
  assert.ok(interpRank(28) < interpRank(26));
  assert.ok(interpRank(24) > interpRank(26));
  assert.equal(interpRank(30), 1);
  assert.equal(interpRank(0), RANK_TOTAL);
});

test("percentile is top-share and monotonic", () => {
  assert.ok(Math.abs(rankPercentile(20550) - 2.28) < 0.05);
  assert.ok(rankPercentile(1000) < rankPercentile(500000));
});
