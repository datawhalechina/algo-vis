import assert from "node:assert/strict";
import test from "node:test";

import type { GuidedLessonBlueprint } from "../src/config/guidedLessonTypes.ts";
import {
  evaluateDebugAssertion,
  semanticSceneSignature,
  validateLessonScene,
  type ArraySceneSpec,
  type LessonSceneFrame,
} from "../src/config/lessonSceneTypes.ts";

const blueprint: GuidedLessonBlueprint = {
  id: 1,
  title: "测试课程",
  intuition: "观察输入如何经过一次运算得到输出。",
  formula: "y=x+1",
  symbols: [
    { symbol: "x", meaning: "输入" },
    { symbol: "y", meaning: "输出" },
  ],
  flow: [
    { id: "read-input", label: "读取输入" },
    { id: "write-output", label: "写出结果" },
  ],
  misconception: "不能只改变高亮。",
  debugTip: "核对结果值。",
  takeaway: "状态变化必须可见。",
};

function frame(jointId: string, sourceValue: number, targetValue: number): LessonSceneFrame {
  return {
    jointId,
    title: jointId,
    inputs: [{ entityId: "input", label: "输入", value: sourceValue }],
    operation: {
      label: "加一",
      sourceEntityIds: ["input"],
      targetEntityIds: ["output"],
    },
    outputs: [{ entityId: "output", label: "输出", value: targetValue }],
    entityStates: {
      input: { value: sourceValue, status: "active", visible: true },
      output: { value: targetValue, status: "waiting", visible: true },
    },
    visibleConnectionIds: ["input-output"],
    transfers: [{
      id: `transfer-${jointId}`,
      from: "input",
      to: "output",
      sourceValue,
      payload: sourceValue,
      label: "传递输入",
    }],
    metrics: [],
    result: `输出为 ${targetValue}`,
    explanation: "读取输入，加一后写到输出。",
    debugAssertions: [{
      label: "输出应正确",
      entityId: "output",
      operator: "eq",
      expected: targetValue,
    }],
  };
}

function validScene(): ArraySceneSpec {
  return {
    lessonId: 1,
    kind: "array",
    ariaLabel: "测试场景",
    entities: [
      { id: "input", label: "输入", role: "input" },
      { id: "output", label: "输出", role: "output" },
    ],
    connections: [{ id: "input-output", from: "input", to: "output" }],
    formulaBindings: [
      { symbol: "x", entityIds: ["input"] },
      { symbol: "y", entityIds: ["output"] },
    ],
    layout: {
      orientation: "horizontal",
      groups: [{ id: "values", label: "数值", entityIds: ["input", "output"] }],
    },
    framesByJointId: {
      "read-input": frame("read-input", 2, 0),
      "write-output": frame("write-output", 2, 3),
    },
  };
}

test("semantic signatures ignore prose and status-only decoration", () => {
  const first = frame("read-input", 2, 0);
  const decorated = structuredClone(first);
  decorated.jointId = "different-id";
  decorated.title = "完全不同的标题";
  decorated.explanation = "完全不同的说明";
  decorated.entityStates.input.status = "complete";
  decorated.transfers[0].id = "different-transfer-id";
  decorated.transfers[0].label = "不同标签";

  assert.equal(semanticSceneSignature(first), semanticSceneSignature(decorated));
});

test("semantic signatures change for visible values, topology, positions, and payloads", () => {
  const original = frame("read-input", 2, 0);

  for (const mutate of [
    (candidate: LessonSceneFrame) => { candidate.entityStates.output.value = 3; },
    (candidate: LessonSceneFrame) => { candidate.visibleConnectionIds = []; },
    (candidate: LessonSceneFrame) => { candidate.entityStates.input.position = { x: 0.2, y: 0.4 }; },
    (candidate: LessonSceneFrame) => { candidate.transfers[0].sourceValue = 8; },
    (candidate: LessonSceneFrame) => { candidate.transfers[0].payload = 9; },
  ]) {
    const changed = structuredClone(original);
    mutate(changed);
    assert.notEqual(semanticSceneSignature(original), semanticSceneSignature(changed));
  }
});

test("validation rejects duplicate joints and datum values detached from entities", () => {
  const scene = validScene();
  const duplicateBlueprint = {
    ...blueprint,
    flow: [
      { id: "read-input", label: "读取输入" },
      { id: "read-input", label: "再次读取" },
    ],
  };
  assert.match(validateLessonScene(duplicateBlueprint, scene).join("\n"), /flow IDs/);

  scene.framesByJointId["read-input"].inputs[0].value = 999;
  assert.match(validateLessonScene(blueprint, scene).join("\n"), /differs from its pre-operation entity value/);
});

test("a well-formed scene passes all invariants", () => {
  assert.deepEqual(validateLessonScene(blueprint, validScene()), []);
});

test("debug assertions compare observed values independently", () => {
  assert.equal(evaluateDebugAssertion(
    { label: "数组结果", entityId: "output", operator: "eq", expected: [1, 2, 3] },
    { value: [1, 2, 3], status: "complete", visible: true },
  ), true);
  assert.equal(evaluateDebugAssertion(
    { label: "错误数组", entityId: "output", operator: "eq", expected: [1, 2, 4] },
    { value: [1, 2, 3], status: "complete", visible: true },
  ), false);
  assert.equal(evaluateDebugAssertion(
    { label: "范围", entityId: "output", operator: "range", expected: [0, 1] },
    { value: 0.5, status: "complete", visible: true },
  ), true);
});

test("validation requires every formula binding to become visible in at least one causal frame", () => {
  const scene = validScene();
  scene.framesByJointId["read-input"].entityStates.output.visible = false;
  scene.framesByJointId["read-input"].operation.targetEntityIds = ["input"];
  scene.framesByJointId["read-input"].outputs = [];
  scene.framesByJointId["write-output"].entityStates.output.visible = false;
  scene.framesByJointId["write-output"].operation.targetEntityIds = ["input"];
  scene.framesByJointId["write-output"].outputs = [];

  assert.match(
    validateLessonScene(blueprint, scene).join("\n"),
    /formula binding y is never visible/,
  );
});

test("validation accepts an explicit pre-operation value for in-place updates", () => {
  const scene = validScene();
  const currentFrame = scene.framesByJointId["write-output"];
  currentFrame.operation.sourceEntityIds = ["input"];
  currentFrame.operation.targetEntityIds = ["input"];
  currentFrame.inputs = [{ entityId: "input", label: "输入", value: 2 }];
  currentFrame.outputs = [{ entityId: "input", label: "输入", value: 3 }];
  currentFrame.entityStates.input = {
    value: 3,
    previousValue: 2,
    status: "active",
    visible: true,
  };
  currentFrame.transfers = [];
  currentFrame.visibleConnectionIds = [];
  currentFrame.debugAssertions = [{
    label: "原地更新正确",
    entityId: "input",
    operator: "eq",
    expected: 3,
  }];

  assert.deepEqual(validateLessonScene(blueprint, scene), []);
});

test("validation distinguishes a transfer source snapshot from a derived payload", () => {
  const scene = validScene();
  const transfer = scene.framesByJointId["read-input"].transfers[0];
  transfer.payload = 1;
  assert.deepEqual(validateLessonScene(blueprint, scene), []);

  transfer.sourceValue = 99;
  assert.match(
    validateLessonScene(blueprint, scene).join("\n"),
    /has an invalid source snapshot/,
  );
});

test("validation rejects transfers without rendered topology and prose-only scenes", () => {
  const scene = validScene();
  scene.framesByJointId["read-input"].visibleConnectionIds = [];
  assert.match(
    validateLessonScene(blueprint, scene).join("\n"),
    /has no visible connection/,
  );

  for (const [jointId, currentFrame] of Object.entries(scene.framesByJointId)) {
    const label = blueprint.flow.find(({ id }) => id === jointId)?.label ?? "";
    for (const state of Object.values(currentFrame.entityStates)) state.value = label;
    currentFrame.inputs = [{ entityId: "input", label: "输入", value: label }];
    currentFrame.outputs = [{ entityId: "output", label: "输出", value: label }];
    currentFrame.transfers[0].payload = label;
    currentFrame.debugAssertions = [{
      label: "文字存在",
      entityId: "output",
      operator: "visible",
      expected: true,
    }];
  }
  const errors = validateLessonScene(blueprint, scene).join("\n");
  assert.match(errors, /numeric state/);
  assert.match(errors, /expected-value assertion/);
  assert.match(errors, /copies a flow label/);
});
