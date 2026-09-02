import assert from "node:assert/strict";
import test from "node:test";

import {
  createGuidedLessonSteps,
  getDrlLessonBlueprint,
} from "../src/config/drlLessonBlueprints.ts";

const lessonIds = Array.from({ length: 36 }, (_, index) => 30001 + index);

test("every lesson has a complete visual teaching blueprint", () => {
  for (const id of lessonIds) {
    const blueprint = getDrlLessonBlueprint(id);
    assert.ok(blueprint, `missing blueprint for ${id}`);
    assert.ok(blueprint.formula.length > 0, `missing formula for ${id}`);
    assert.ok(blueprint.flow.length >= 3, `flow too short for ${id}`);
    assert.ok(blueprint.debugTip.length >= 20, `debug tip too short for ${id}`);
  }
});

test("every guided lesson follows the beginner learning rhythm", () => {
  for (const id of lessonIds) {
    const blueprint = getDrlLessonBlueprint(id);
    assert.ok(blueprint);
    const steps = createGuidedLessonSteps(id);
    assert.deepEqual(
      steps.map((step) => step.phase),
      [
        "intuition",
        "symbols",
        "formula",
        ...blueprint.flow.map(() => "transition" as const),
        "reflection",
        "debug",
        "summary",
      ],
      `${id}: wrong learning rhythm`,
    );
    assert.deepEqual(
      steps.filter((step) => step.phase === "transition").map((step) => step.activeFlowIndex),
      blueprint.flow.map((_, index) => index),
      `${id}: every flow joint must be directly addressable`,
    );
    assert.equal(steps.at(-1)?.finished, true, `${id}: missing final summary`);
  }
});
