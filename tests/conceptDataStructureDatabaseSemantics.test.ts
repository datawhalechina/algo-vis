import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateDebugAssertion,
  type LessonSceneFrame,
  type LessonSceneSpec,
  type SceneValue,
} from "../src/config/lessonSceneTypes.ts";
import { getConceptLessonScene } from "../src/config/lessonScenes/concepts/index.ts";

function scene(lessonId: number): LessonSceneSpec {
  const result = getConceptLessonScene(lessonId);
  assert.ok(result, `missing concept scene ${lessonId}`);
  return result;
}

function frames(lessonId: number): LessonSceneFrame[] {
  return Object.values(scene(lessonId).framesByJointId);
}

function binding(lessonId: number, symbol: string): string[] {
  return scene(lessonId).formulaBindings.find((candidate) => candidate.symbol === symbol)?.entityIds ?? [];
}

function value(frame: LessonSceneFrame, entityId: string): SceneValue | undefined {
  return frame.entityStates[entityId]?.value;
}

function assertChecksCoverIndependentState(currentFrames: LessonSceneFrame[]): void {
  for (const frame of currentFrames) {
    const checkedEntityIds = new Set(frame.debugAssertions.map(({ entityId }) => entityId));
    assert.ok(
      checkedEntityIds.size >= 2,
      `${frame.jointId} must check at least two independent entities`,
    );
    for (const check of frame.debugAssertions) {
      assert.equal(
        evaluateDebugAssertion(check, frame.entityStates[check.entityId]),
        true,
        `${frame.jointId}: ${check.label}`,
      );
    }
  }
}

test("40004 binds recurrence sizes to subtree counts rather than node keys", () => {
  const lessonFrames = frames(40004);
  const finalFrame = lessonFrames.at(-1);
  assert.ok(finalFrame);

  assert.deepEqual(binding(40004, "n"), ["tree-node-count"]);
  assert.deepEqual(binding(40004, "n_L"), ["left-subtree-node-count"]);
  assert.deepEqual(binding(40004, "n_R"), ["right-subtree-node-count"]);
  assert.ok(!binding(40004, "n_L").includes("left"));
  assert.ok(!binding(40004, "n_R").includes("right"));

  const n = value(finalFrame, "tree-node-count");
  const nLeft = value(finalFrame, "left-subtree-node-count");
  const nRight = value(finalFrame, "right-subtree-node-count");
  assert.equal(n, 3);
  assert.equal(nLeft, 1);
  assert.equal(nRight, 1);
  assert.equal(n, 1 + Number(nLeft) + Number(nRight));
  assert.equal(value(finalFrame, "visited-count"), n);
  assertChecksCoverIndependentState(lessonFrames);
});

test("40006 writes DP results only in their causal frames", () => {
  const lessonFrames = frames(40006);
  assert.equal(lessonFrames.length, 4);

  const computedEntityIds = ["base-case", "cost-a1", "cost-a2", "dp-result"];
  assert.deepEqual(computedEntityIds.map((id) => value(lessonFrames[0], id)), [
    "pending",
    "pending",
    "pending",
    "pending",
  ]);
  assert.deepEqual(computedEntityIds.map((id) => value(lessonFrames[1], id)), [
    0,
    "pending",
    "pending",
    "pending",
  ]);
  assert.deepEqual(computedEntityIds.map((id) => value(lessonFrames[2], id)), [
    0,
    6,
    7,
    "pending",
  ]);
  assert.deepEqual(computedEntityIds.map((id) => value(lessonFrames[3], id)), [0, 6, 7, 6]);

  assert.ok(lessonFrames[1].operation.targetEntityIds.includes("base-case"));
  assert.ok(lessonFrames[2].operation.targetEntityIds.includes("cost-a1"));
  assert.ok(lessonFrames[2].operation.targetEntityIds.includes("cost-a2"));
  assert.ok(lessonFrames[3].operation.targetEntityIds.includes("dp-result"));

  assert.deepEqual(binding(40006, "c(s,a)"), [
    "immediate-cost-a1",
    "immediate-cost-a2",
  ]);
  assert.deepEqual(binding(40006, "f(s,a)"), [
    "next-state-a1",
    "next-state-a2",
  ]);
  assert.deepEqual(
    [value(lessonFrames[2], "immediate-cost-a1"), value(lessonFrames[2], "immediate-cost-a2")],
    [6, 7],
  );
  assert.deepEqual(
    [value(lessonFrames[2], "next-state-a1"), value(lessonFrames[2], "next-state-a2")],
    [0, 0],
  );
  assert.equal(
    Number(value(lessonFrames[2], "cost-a1")),
    Number(value(lessonFrames[2], "immediate-cost-a1")) + Number(value(lessonFrames[1], "base-case")),
  );
  assert.equal(
    Number(value(lessonFrames[2], "cost-a2")),
    Number(value(lessonFrames[2], "immediate-cost-a2")) + Number(value(lessonFrames[1], "base-case")),
  );
  assertChecksCoverIndependentState(lessonFrames);
});

test("40023 exposes every candidate cost before applying argmin", () => {
  const lessonFrames = frames(40023);
  const costFrame = lessonFrames[3];
  const selectionFrame = lessonFrames[4];
  const planNames = value(costFrame, "candidate-plans");
  const ioCosts = value(costFrame, "io-cost");
  const cpuCosts = value(costFrame, "cpu-cost");
  const netCosts = value(costFrame, "net-cost");
  const totals = value(costFrame, "candidate-plan-costs");

  assert.ok(Array.isArray(planNames));
  assert.deepEqual(ioCosts, [14, 10, 12]);
  assert.deepEqual(cpuCosts, [8, 6, 7]);
  assert.deepEqual(netCosts, [4, 2, 3]);
  assert.deepEqual(totals, [26, 18, 22]);
  assert.equal(planNames.length, totals.length);
  assert.deepEqual(
    totals,
    planNames.map((_, index) =>
      Number((ioCosts as number[])[index])
      + Number((cpuCosts as number[])[index])
      + Number((netCosts as number[])[index])),
  );
  assert.equal(costFrame.entityStates["selected-plan"].visible, false);
  assert.equal(value(costFrame, "selected-plan"), "none");

  const minimum = Math.min(...totals as number[]);
  const selectedIndex = (totals as number[]).indexOf(minimum);
  assert.equal(value(selectionFrame, "selected-plan"), `${planNames[selectedIndex]}:${minimum}`);
  assert.match(selectionFrame.operation.expression ?? "", /arg\\min/i);
});

test("40020 binds B+ tree capacity, edge height, and cold reads to numeric entities", () => {
  const lessonFrames = frames(40020);
  const capacityFrame = lessonFrames[0];
  const descentFrame = lessonFrames[2];
  const finalFrame = lessonFrames.at(-1);
  assert.ok(finalFrame);

  assert.deepEqual(binding(40020, "f_{\\min},\\ell_{\\min}"), [
    "min-internal-occupancy",
    "min-leaf-occupancy",
  ]);
  assert.deepEqual(binding(40020, "h"), ["tree-height"]);
  assert.deepEqual(binding(40020, "R_{\\mathrm{cold}}"), ["cold-read-count"]);

  assert.equal(value(capacityFrame, "fanout"), 10);
  assert.equal(value(capacityFrame, "leaf-capacity"), 10);
  assert.equal(value(capacityFrame, "min-internal-occupancy"), 5);
  assert.equal(value(capacityFrame, "min-leaf-occupancy"), 5);
  assert.equal(value(lessonFrames[1], "tree-height"), "pending");
  assert.equal(value(lessonFrames[1], "cold-read-count"), "pending");

  const path = value(descentFrame, "page-path");
  const height = value(descentFrame, "tree-height");
  const coldReads = value(descentFrame, "cold-read-count");
  assert.ok(Array.isArray(path));
  assert.equal(height, path.length - 1, "height counts edges from root to leaf");
  assert.equal(coldReads, Number(height) + 1, "cold lookup reads h+1 index pages");
  assert.equal(value(finalFrame, "tree-height"), 2);
  assert.equal(value(finalFrame, "cold-read-count"), 3);
  assertChecksCoverIndependentState(lessonFrames);
});
