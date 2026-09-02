import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string): string {
  return readFileSync(path, "utf8");
}

test("worked DRL examples keep their arithmetic and update directions correct", () => {
  const tdSource = source("src/datadrl/tdlearning.ts");
  assert.match(tdSource, /Sarsa 是一种同策略（on-policy）/);
  assert.match(tdSource, /Q-Learning 是经典的异策略（off-policy）/);
  assert.match(tdSource, /单步 TD 很早就接上价值估计，通常方差较低但自举偏差较强/);

  assert.equal(Number((-1 + 0.9 * -1 + 0.81 * 10 + 0.729 * 5).toFixed(3)), 9.845);
  assert.match(tdSource, /= 9\.845/);

  assert.equal(Number(Math.pow(5 / 0.1, 0.6).toFixed(1)), 10.5);
  assert.match(source("src/datadrl/valuebased.ts"), /≈ 10\.5 倍/);

  assert.match(source("src/datadrl/policygradient.ts"), /w ← w \+ α_w/);

  const gailSource = source("src/datadrl/imitation.ts");
  assert.match(gailSource, /1 表示像专家/);
  assert.match(gailSource, /r_D\(s,a\) = -log\(1-D\(s,a\)\)/);

  const kl = 0.3 * Math.log(0.3 / 0.35) + 0.7 * Math.log(0.7 / 0.65);
  assert.equal(Number(kl.toFixed(4)), 0.0056);
  assert.match(source("src/datadrl/advpolicy.ts"), /0\.0056 ≤ 0\.01/);

  const standardDeviation = Math.sqrt(0.1875);
  assert.equal(Number(((1 - 0.75) / standardDeviation).toFixed(3)), 0.577);
  assert.equal(Number(((0 - 0.75) / standardDeviation).toFixed(3)), -1.732);
  const llmRlSource = source("src/datadrl/llmrl.ts");
  assert.match(llmRlSource, /0\.577/);
  assert.match(llmRlSource, /-1\.732/);
  for (const technique of [
    "Clip-Higher",
    "Dynamic Sampling",
    "Token-Level Policy Gradient Loss",
    "Overlong Reward Shaping",
  ]) {
    assert.match(llmRlSource, new RegExp(technique));
  }

  assert.equal(Number((0.4 * 1 + 0.2 * 0.8 + 0.2 * 0.6 + 0.2 * 0.9).toFixed(2)), 0.86);
  assert.match(source("src/problemsdrl/Problemdrl30035/algorithm.ts"), /finalScore: 0\.86/);
});
