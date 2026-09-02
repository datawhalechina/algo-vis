import assert from "node:assert/strict";
import test from "node:test";

import { resolveSceneJointId, type LessonFlowJoint } from "../src/config/guidedLessonTypes.ts";

const flow: LessonFlowJoint[] = [
  { id: "first", label: "第一关节" },
  { id: "last", label: "最终关节" },
];

test("pre-computation lesson phases do not resolve to the completed first joint", () => {
  for (const phase of ["intuition", "symbols", "formula"] as const) {
    assert.equal(resolveSceneJointId(phase, undefined, flow), undefined);
  }
});

test("transition and post-computation phases resolve real scene joints", () => {
  assert.equal(resolveSceneJointId("transition", "first", flow), "first");
  for (const phase of ["reflection", "debug", "summary"] as const) {
    assert.equal(resolveSceneJointId(phase, undefined, flow), "last");
  }
});
