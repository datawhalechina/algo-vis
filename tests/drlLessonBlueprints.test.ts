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
  }
});

test("guided lessons follow the beginner learning rhythm", () => {
  const steps = createGuidedLessonSteps(30007);
  assert.deepEqual(
    steps.map((step) => step.phase),
    ["intuition", "symbols", "formula", "transition", "reflection", "summary"],
  );
  assert.equal(steps.at(-1)?.finished, true);
});

