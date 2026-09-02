import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { computerArchitectureLessons } from "../src/config/conceptLessonBlueprints/computerArchitecture.ts";
import { conceptLessonBlueprints } from "../src/config/conceptLessonBlueprints/index.ts";
import type {
  LessonSceneFrame,
  LessonSceneSpec,
  SceneValue,
} from "../src/config/lessonSceneTypes.ts";

const instructionFormula =
  "W=w_{\\mathrm{imm}}\\Vert w_{\\mathrm{rs1}}\\Vert w_{\\mathrm{funct3}}\\Vert w_{\\mathrm{rd}}\\Vert w_{\\mathrm{op}},\\qquad |W|=12+5+3+5+7=32";

function blueprint(lessonId: number) {
  const result = conceptLessonBlueprints.find(({ id }) => id === lessonId);
  assert.ok(result, `missing concept blueprint ${lessonId}`);
  return result;
}

async function scene(lessonId: number): Promise<LessonSceneSpec> {
  const { getConceptLessonScene } = await import(
    "../src/config/lessonScenes/concepts/index.ts"
  );
  const result = getConceptLessonScene(lessonId);
  assert.ok(result, `missing concept scene ${lessonId}`);
  return result;
}

function frameAt(
  lessonScene: LessonSceneSpec,
  lessonId: number,
  index: number,
): LessonSceneFrame {
  const joint = blueprint(lessonId).flow[index];
  assert.ok(joint, `missing joint ${index} for concept ${lessonId}`);
  const frame = lessonScene.framesByJointId[joint.id];
  assert.ok(frame, `missing frame for ${joint.label}`);
  return frame;
}

function value(frame: LessonSceneFrame, entityId: string): SceneValue | undefined {
  return frame.entityStates[entityId]?.value;
}

test("40031 declares the RISC-V addi I-type fields in canonical source data", () => {
  const seed = computerArchitectureLessons.find(({ id }) => id === 40031);
  assert.ok(seed);
  assert.equal(seed.formula, instructionFormula);
  assert.deepEqual(
    seed.symbols.map(({ symbol, meaning }) => [symbol, meaning]),
    [
      ["W", "按 I 型位序拼出的 32 位机器字"],
      ["w_{\\mathrm{op}}", "位于 [6:0] 的 7 位操作码"],
      ["w_{\\mathrm{rd}}", "位于 [11:7] 的 5 位目的寄存器编号"],
      ["w_{\\mathrm{funct3}}", "位于 [14:12] 的 3 位功能码"],
      ["w_{\\mathrm{rs1}}", "位于 [19:15] 的 5 位源寄存器编号"],
      ["w_{\\mathrm{imm}}", "位于 [31:20] 的 12 位立即数补码"],
    ],
  );
  assert.doesNotMatch(seed.formula, /rs2/);
});

test("40031 scene loading is import-order independent and never mutates blueprints", async () => {
  const lesson = blueprint(40031);
  const beforeImport = structuredClone(lesson);

  const lessonScene = await scene(40031);

  assert.deepEqual(lesson, beforeImport);
  assert.deepEqual(
    lessonScene.formulaBindings.map(({ symbol }) => symbol),
    lesson.symbols.map(({ symbol }) => symbol),
  );

  const sceneIndexSource = readFileSync(
    "src/config/lessonScenes/concepts/index.ts",
    "utf8",
  );
  assert.doesNotMatch(
    sceneIndexSource,
    /blueprint\.(?:formula|symbols)\s*=/,
    "the scene registry must treat canonical blueprints as read-only",
  );
});

test("40031 encodes addi fields into a 32-bit word and decodes them back", async () => {
  const lessonScene = await scene(40031);
  const selectFormat = frameAt(lessonScene, 40031, 1);
  const encodeOperands = frameAt(lessonScene, 40031, 2);
  const assembleWord = frameAt(lessonScene, 40031, 3);
  const decodeWord = frameAt(lessonScene, 40031, 4);

  assert.equal(value(selectFormat, "opcode-bits"), "0010011");
  assert.equal(value(selectFormat, "funct3-bits"), "000");
  assert.equal(value(encodeOperands, "rd-bits"), "00101");
  assert.equal(value(encodeOperands, "rs1-bits"), "00110");
  assert.equal(value(encodeOperands, "immediate-bits"), "000000001000");

  const expectedBits = [
    value(encodeOperands, "immediate-bits"),
    value(encodeOperands, "rs1-bits"),
    value(selectFormat, "funct3-bits"),
    value(encodeOperands, "rd-bits"),
    value(selectFormat, "opcode-bits"),
  ].join("");
  assert.equal(expectedBits.length, 32);
  assert.equal(value(assembleWord, "machine-word-bits"), expectedBits);
  assert.equal(value(assembleWord, "machine-word-hex"), "0x00830293");
  assert.equal(value(assembleWord, "machine-word-value"), Number.parseInt(expectedBits, 2));

  const machineBits = String(value(assembleWord, "machine-word-bits"));
  assert.deepEqual(value(decodeWord, "decoded-fields"), [
    `imm=${Number.parseInt(machineBits.slice(0, 12), 2)}`,
    `rs1=x${Number.parseInt(machineBits.slice(12, 17), 2)}`,
    `funct3=${machineBits.slice(17, 20)}`,
    `rd=x${Number.parseInt(machineBits.slice(20, 25), 2)}`,
    `opcode=${machineBits.slice(25)}`,
  ]);
  assert.equal(value(decodeWord, "decoded"), "addi x5,x6,8");
  assert.match(assembleWord.operation.expression ?? "", /000000001000.*00110.*000.*00101.*0010011/);
});

test("40036 derives a separate SIMD tail mask for each five-element core block", async () => {
  const lessonScene = await scene(40036);
  const split = frameAt(lessonScene, 40036, 2);
  const reduce = frameAt(lessonScene, 40036, 3);
  const assignments = value(split, "core-assignments");
  const masks = value(reduce, "tail-mask");

  assert.deepEqual(assignments, [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]]);
  assert.deepEqual(masks, [
    [true, false, false, false],
    [true, false, false, false],
  ]);
  assert.ok(Array.isArray(assignments));
  assert.ok(Array.isArray(masks));
  assert.deepEqual(
    (assignments as number[][]).map((block) =>
      Array.from({ length: 4 }, (_, lane) => lane < block.length % 4)),
    masks,
  );
  assert.equal(value(reduce, "core-0-sum"), 15);
  assert.equal(value(reduce, "core-1-sum"), 40);
});

test("40033 fifth joint fills and replaces a line under an explicit write policy", async () => {
  const lessonScene = await scene(40033);
  const beforeUpdate = frameAt(lessonScene, 40033, 3);
  const update = frameAt(lessonScene, 40033, 4);

  assert.equal(update.title, blueprint(40033).flow[4].label);
  assert.match(update.title, /替换.*写策略/);

  const requiredTargets = [
    "victim-way",
    "victim-valid",
    "victim-tag",
    "victim-data",
    "victim-dirty",
    "dirty-action",
    "line-valid-after",
    "line-tag-after",
    "line-data-after",
    "line-dirty-after",
  ];
  for (const entityId of requiredTargets) {
    assert.equal(
      beforeUpdate.entityStates[entityId]?.visible,
      false,
      `${entityId} must be produced by the fifth joint rather than disclosed early`,
    );
    assert.ok(
      update.operation.targetEntityIds.includes(entityId),
      `${entityId} must be updated by the fifth joint`,
    );
  }

  assert.equal(value(update, "victim-way"), 1);
  assert.equal(value(update, "victim-valid"), true);
  assert.equal(value(update, "victim-tag"), "0x0A");
  assert.equal(value(update, "victim-dirty"), true);
  assert.match(String(value(update, "victim-data")), /旧块|old block/i);
  assert.match(String(value(update, "dirty-action")), /写回.*标脏|write.?back.*dirty/i);

  assert.equal(value(update, "line-valid-after"), true);
  assert.equal(value(update, "line-tag-after"), "0x09");
  assert.match(String(value(update, "line-data-after")), /0x1340.*52.*0xA5/i);
  assert.equal(value(update, "line-dirty-after"), true);

  assert.deepEqual(
    update.metrics.map(({ entityId, value: metricValue }) => [entityId, metricValue]),
    [["average-time", 2.4]],
    "AMAT may remain in the frame, but only as a metric",
  );
  assert.ok(update.outputs.some(({ entityId }) => entityId === "line-data-after"));
  assert.ok(update.outputs.some(({ entityId }) => entityId === "dirty-action"));

  for (const movement of update.transfers) {
    assert.deepEqual(
      movement.payload,
      value(update, movement.from),
      `${movement.id} payload must equal its source state`,
    );
  }
});

test("40034 presents one successful page-fault trace through TLB retry", async () => {
  const lesson = blueprint(40034);
  const lessonScene = await scene(40034);
  const labels = lesson.flow.map(({ label }) => label);
  const tracePatterns = [
    /TLB.*(?:miss|未命中)/i,
    /页表项.*(?:无效|有效位.*0)/,
    /缺页.*处理|处理.*缺页/,
    /权限.*允许/,
    /TLB.*填充.*重试|填充.*TLB.*重试/,
    /物理地址/,
  ];

  assert.equal(labels.length, tracePatterns.length);
  labels.forEach((label, index) => assert.match(label, tracePatterns[index]));

  const traceFrames = lesson.flow.map(({ id }, index) => {
    const frame = lessonScene.framesByJointId[id];
    assert.ok(frame, `missing frame ${index}`);
    assert.equal(frame.title, labels[index]);
    return frame;
  });

  assert.equal(value(traceFrames[0], "tlb-result"), "miss");
  assert.equal(value(traceFrames[1], "pte-valid"), false);
  assert.equal(value(traceFrames[1], "page-fault-event"), "raised");
  assert.equal(value(traceFrames[2], "fault-state"), "resolved");
  assert.equal(value(traceFrames[2], "pte-valid-after"), true);
  assert.equal(value(traceFrames[2], "resolved-frame"), 7);
  assert.equal(value(traceFrames[3], "permission"), "allowed");
  assert.match(String(value(traceFrames[4], "tlb-entry")), /3.*7/);
  assert.equal(value(traceFrames[4], "retry-result"), "hit");
  assert.equal(value(traceFrames[5], "physical-address"), 29714);
  assert.equal(value(traceFrames[5], "page-offset"), 1042);

  const workedTraceText = traceFrames
    .flatMap((frame) => [
      frame.title,
      frame.operation.label,
      frame.result,
      frame.explanation,
      ...frame.transfers.map(({ label }) => label),
    ])
    .join("\n");
  assert.doesNotMatch(workedTraceText, /permission denied|权限不足/i);

  for (const frame of traceFrames) {
    for (const movement of frame.transfers) {
      assert.deepEqual(
        movement.payload,
        value(frame, movement.from),
        `${frame.title}/${movement.id} payload must equal its source state`,
      );
    }
  }
});
