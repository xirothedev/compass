const { test } = require("node:test");
const assert = require("node:assert/strict");
const { classifyBucket } = require("../dist/buckets.js");

test("safe at delta >= 1", () => {
  assert.equal(classifyBucket(2.5), "safe");
  assert.equal(classifyBucket(1), "safe");
});

test("match in [-0.5, 1)", () => {
  assert.equal(classifyBucket(0.99), "match");
  assert.equal(classifyBucket(0), "match");
  assert.equal(classifyBucket(-0.5), "match");
});

test("reach below -0.5", () => {
  assert.equal(classifyBucket(-0.51), "reach");
  assert.equal(classifyBucket(-5), "reach");
});
