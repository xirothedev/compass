const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parseYear, cutoffForYear, AVAILABLE_YEARS, DEFAULT_YEAR } = require("../dist/years.js");

test("parseYear accepts 2022-2025, defaults 2024", () => {
  assert.equal(parseYear("2025"), 2025);
  assert.equal(parseYear("2022"), 2022);
  assert.equal(parseYear("1999"), 2024);
  assert.equal(parseYear(undefined), 2024);
  assert.deepEqual([...AVAILABLE_YEARS], [2022, 2023, 2024, 2025]);
  assert.equal(DEFAULT_YEAR, 2024);
});

test("cutoffForYear picks selected year", () => {
  const c = { y2022: 22, y2023: 23, y2024: 24, y2025: 25 };
  assert.equal(cutoffForYear(c, 2022), 22);
  assert.equal(cutoffForYear(c, 2025), 25);
  assert.equal(cutoffForYear(c, 9999), 24);
});
