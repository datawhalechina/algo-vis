import assert from "node:assert/strict";
import test from "node:test";

import {
  cudaLessonBlueprints,
  getCudaLessonBlueprint,
} from "../src/config/cudaLessonBlueprints/index.ts";
import { validateLessonScene } from "../src/config/lessonSceneTypes.ts";
import { elementWiseSceneDefinitions } from "../src/config/lessonScenes/cuda/elementWiseScenes.ts";
import { getCudaLessonScene } from "../src/config/lessonScenes/cuda/index.ts";
import { matrixSceneDefinitions } from "../src/config/lessonScenes/cuda/matrixScenes.ts";
import { normalizationSceneDefinitions } from "../src/config/lessonScenes/cuda/normalizationScenes.ts";
import { reductionSceneDefinitions } from "../src/config/lessonScenes/cuda/reductionScenes.ts";
import { reshapeSceneDefinitions } from "../src/config/lessonScenes/cuda/reshapeScenes.ts";
import { scanSortSceneDefinitions } from "../src/config/lessonScenes/cuda/scanSortScenes.ts";
import { stencilSceneDefinitions } from "../src/config/lessonScenes/cuda/stencilScenes.ts";
import {
  createCudaStoryboardScene,
  type CudaStoryboardDefinition,
} from "../src/config/lessonScenes/cuda/storyboard.ts";

function sceneFor(lessonId: number) {
  const scene = getCudaLessonScene(lessonId);
  assert.ok(scene, `missing CUDA scene ${lessonId}`);
  return scene;
}

function frameFor(lessonId: number, stepIndex: number) {
  const blueprint = getCudaLessonBlueprint(lessonId);
  assert.ok(blueprint, `missing CUDA blueprint ${lessonId}`);
  const joint = blueprint.flow[stepIndex];
  assert.ok(joint, `missing CUDA ${lessonId} flow joint ${stepIndex}`);
  return sceneFor(lessonId).framesByJointId[joint.id];
}

function transferTriples(lessonId: number, stepIndex: number) {
  return frameFor(lessonId, stepIndex).transfers.map(({ from, to, payload }) => [
    from,
    to,
    payload,
  ]);
}

function transferPayload(
  lessonId: number,
  stepIndex: number,
  from: string,
  to: string,
) {
  return frameFor(lessonId, stepIndex).transfers.find((transfer) =>
    transfer.from === from && transfer.to === to
  )?.payload;
}

test("all CUDA lesson scenes remain valid after semantic enrichment", () => {
  for (const blueprint of cudaLessonBlueprints) {
    const scene = sceneFor(blueprint.id);
    assert.deepEqual(
      validateLessonScene(blueprint, scene),
      [],
      `invalid CUDA scene ${blueprint.id}`,
    );
    for (const frame of Object.values(scene.framesByJointId)) {
      assert.deepEqual(
        frame.operation.sourceEntityIds.filter((id) =>
          frame.operation.targetEntityIds.includes(id),
        ),
        [],
        `CUDA ${blueprint.id}/${frame.jointId} mutates a source without a snapshot`,
      );
    }
  }
});

test("every CUDA frame exposes all declared sources, targets, and causal routes", () => {
  for (const blueprint of cudaLessonBlueprints) {
    for (const joint of blueprint.flow) {
      const frame = sceneFor(blueprint.id).framesByJointId[joint.id];
      const inputIds = new Set(frame.inputs.map(({ entityId }) => entityId));
      const outputIds = new Set(frame.outputs.map(({ entityId }) => entityId));

      for (const sourceId of frame.operation.sourceEntityIds) {
        assert.ok(
          inputIds.has(sourceId),
          `CUDA ${blueprint.id}/${joint.id}: source ${sourceId} is missing from inputs`,
        );
        assert.ok(
          frame.transfers.some(({ from }) => from === sourceId),
          `CUDA ${blueprint.id}/${joint.id}: source ${sourceId} has no causal transfer`,
        );
      }
      for (const targetId of frame.operation.targetEntityIds) {
        assert.ok(
          outputIds.has(targetId),
          `CUDA ${blueprint.id}/${joint.id}: target ${targetId} is missing from outputs`,
        );
        assert.ok(
          frame.transfers.some(({ to }) => to === targetId),
          `CUDA ${blueprint.id}/${joint.id}: target ${targetId} receives no causal transfer`,
        );
      }
    }
  }
});

test("CUDA storyboard definitions only update declared post-operation targets", () => {
  const definitions = {
    ...elementWiseSceneDefinitions,
    ...reductionSceneDefinitions,
    ...scanSortSceneDefinitions,
    ...matrixSceneDefinitions,
    ...stencilSceneDefinitions,
    ...reshapeSceneDefinitions,
    ...normalizationSceneDefinitions,
  };

  for (const [lessonId, definition] of Object.entries(definitions)) {
    for (const [stepIndex, step] of definition.steps.entries()) {
      for (const changedId of Object.keys(step.values)) {
        assert.ok(
          step.targetEntityIds.includes(changedId),
          `CUDA ${lessonId} step ${stepIndex}: ${changedId} changes without being a target`,
        );
      }
    }
  }

  const blueprint = getCudaLessonBlueprint(401);
  assert.ok(blueprint);
  const invalid = structuredClone(matrixSceneDefinitions[401]) as CudaStoryboardDefinition;
  invalid.steps[1].values.a = [[99]];
  assert.throws(
    () => createCudaStoryboardScene(blueprint, invalid),
    /values may only update declared targets/i,
  );
});

test("every storyboard target is a real post-state transition", () => {
  const definitions = {
    ...elementWiseSceneDefinitions,
    ...reductionSceneDefinitions,
    ...scanSortSceneDefinitions,
    ...matrixSceneDefinitions,
    ...stencilSceneDefinitions,
    ...reshapeSceneDefinitions,
    ...normalizationSceneDefinitions,
  };

  for (const [lessonId, definition] of Object.entries(definitions)) {
    const values = Object.fromEntries(
      definition.entities.map(({ id, initialValue }) => [id, initialValue]),
    );
    for (const [stepIndex, step] of definition.steps.entries()) {
      for (const targetId of step.targetEntityIds) {
        assert.notDeepEqual(
          step.values[targetId],
          values[targetId],
          `CUDA ${lessonId} step ${stepIndex}: target ${targetId} does not change from its pre-state`,
        );
      }
      Object.assign(values, step.values);
    }
  }
});

test("CUDA control dependencies gate the work they protect", () => {
  const reductionBarrier = frameFor(202, 4);
  assert.deepEqual(reductionBarrier.entityStates["block-barrier-before"].value, "waiting");
  assert.deepEqual(reductionBarrier.entityStates["block-barrier"].value, "released");
  assert.deepEqual(
    transferPayload(202, 5, "block-barrier", "block-pair"),
    "released",
  );

  assert.equal(
    transferPayload(301, 2, "barrier", "round-offset-1"),
    "released for offset 1",
  );
  assert.equal(
    transferPayload(502, 3, "bounds", "output"),
    "4 / 4 windows valid",
  );
  assert.equal(
    transferPayload(602, 4, "bounds", "atomic-log"),
    "s = [1,1,0], all in [0,3)",
  );
});

test("CUDA 106 separates random-number generation from loading x", () => {
  assert.deepEqual(transferTriples(106, 0), [
    ["seed", "counter", 7],
    ["thread-index", "counter", [0, 1, 2, 3]],
  ]);
  assert.deepEqual(transferTriples(106, 1), [
    ["counter", "random", ["seed:7/0", "seed:7/1", "seed:7/2", "seed:7/3"]],
    ["input", "loaded", [1, 1, 1, 1]],
  ]);
  assert.deepEqual(frameFor(106, 3).operation.sourceEntityIds, ["loaded", "mask", "scale"]);
});

test("CUDA 302 stable scatter carries both keys and computed positions", () => {
  const positionFrame = frameFor(302, 4);
  assert.deepEqual(positionFrame.operation.sourceEntityIds, ["digits", "ranks", "offsets"]);
  assert.deepEqual(transferTriples(302, 4), [
    ["digits", "positions", [1, 1, 0, 0]],
    ["ranks", "positions", [0, 1, 0, 1]],
    ["offsets", "positions", [0, 2]],
  ]);

  assert.deepEqual(transferPayload(302, 6, "buffer", "bit-1-buffer"), [4, 2, 3, 1]);
  assert.deepEqual(
    transferPayload(302, 6, "bit-1-buffer", "bit-2-buffer"),
    [4, 1, 2, 3],
  );
  assert.deepEqual(
    transferPayload(302, 6, "remaining-bits", "bit-1-digits"),
    [1, 2],
  );
});

test("CUDA 303 atomics expose their zero baselines and synchronization", () => {
  assert.deepEqual(frameFor(303, 1).entityStates["shared-bins-before-clear"].value, [9, 9, 9, 9]);
  assert.deepEqual(frameFor(303, 1).entityStates["shared-bins-zero-base"].value, [0, 0, 0, 0]);
  assert.deepEqual(
    transferPayload(303, 3, "shared-bins-zero-base", "shared-bins"),
    [0, 0, 0, 0],
  );
  assert.deepEqual(
    transferPayload(303, 5, "global-bins-zero-base", "global-bins"),
    [0, 0, 0, 0],
  );
  assert.equal(
    transferPayload(303, 5, "barrier-merge", "global-bins"),
    "released",
  );
});

test("CUDA 403 exposes bias addition before ReLU", () => {
  const epilogue = frameFor(403, 4);
  assert.deepEqual(epilogue.entityStates["bias-added"].value, [[-1, -2], [0, 6]]);
  assert.deepEqual(epilogue.entityStates["relu-mask"].value, [[0, 0], [0, 1]]);
  assert.deepEqual(epilogue.entityStates.epilogue.value, [[0, 0], [0, 6]]);
  assert.deepEqual(
    transferPayload(403, 4, "bias-added", "epilogue"),
    [[-1, -2], [0, 6]],
  );
});

test("in-place CUDA updates retain explicit pre-operation snapshots", () => {
  const cases = [
    {
      lessonId: 303,
      stepIndex: 0,
      beforeId: "global-bins-before-clear",
      targetId: "global-bins",
      before: [9, 9, 9, 9],
      transferPayload: [9, 9, 9, 9],
      after: [0, 0, 0, 0],
    },
    {
      lessonId: 401,
      stepIndex: 4,
      beforeId: "accumulator-after-k0",
      targetId: "accumulator",
      before: [[1, 4], [5, 16]],
      transferPayload: [1, 4, 5, 16],
      after: [[12, 8], [28, 24]],
    },
    {
      lessonId: 602,
      stepIndex: 2,
      beforeId: "scatter-target-before-clear",
      targetId: "scatter-target",
      before: [9, 9, 9],
      transferPayload: [9, 9, 9],
      after: [0, 0, 0],
    },
    {
      lessonId: 602,
      stepIndex: 4,
      beforeId: "scatter-zero-base",
      targetId: "scatter-target",
      before: [0, 0, 0],
      transferPayload: [0, 0, 0],
      after: [30, 30, 0],
    },
  ] as const;

  for (const {
    lessonId,
    stepIndex,
    beforeId,
    targetId,
    before,
    transferPayload,
    after,
  } of cases) {
    const frame = frameFor(lessonId, stepIndex);
    assert.deepEqual(frame.entityStates[beforeId]?.value, before);
    assert.deepEqual(frame.entityStates[targetId]?.value, after);
    assert.deepEqual(
      frame.inputs.find(({ entityId }) => entityId === beforeId)?.value,
      before,
    );
    assert.deepEqual(
      frame.outputs.find(({ entityId }) => entityId === targetId)?.value,
      after,
    );
    assert.ok(
      frame.transfers.some(({ from, to, payload }) =>
        from === beforeId
        && to === targetId
        && JSON.stringify(payload) === JSON.stringify(transferPayload)),
      `CUDA ${lessonId} step ${stepIndex} does not route its pre-operation value to ${targetId}`,
    );
  }
});

test("CUDA 201 exposes waiting to released and independent reduction checks", () => {
  const barrier = sceneFor(201).framesByJointId["block-barrier"];
  assert.equal(
    barrier.inputs.find(({ entityId }) => entityId === "barrier-before")?.value,
    "waiting",
  );
  assert.equal(
    barrier.outputs.find(({ entityId }) => entityId === "barrier")?.value,
    "released",
  );

  const tree = sceneFor(201).framesByJointId["shared-tree-reduce"];
  assert.deepEqual(
    Object.fromEntries(tree.debugAssertions.map(({ entityId, expected }) => [entityId, expected])),
    {
      "sum-01": 3,
      "sum-23": 7,
      "sum-45": 11,
      "sum-67": 15,
      "sum-left": 10,
      "sum-right": 26,
    },
  );

  const finalFrame = sceneFor(201).framesByJointId["finalize-grid-sum"];
  const finalChecks = Object.fromEntries(
    finalFrame.debugAssertions.map(({ entityId, expected }) => [entityId, expected]),
  );
  assert.equal(finalChecks.barrier, "released");
  assert.deepEqual(
    ["sum-01", "sum-23", "sum-45", "sum-67"].map((id) => finalChecks[id]),
    [3, 7, 11, 15],
  );
  assert.deepEqual([finalChecks["sum-left"], finalChecks["sum-right"]], [10, 26]);
  assert.equal(finalChecks["block-sum"], 36);
  assert.equal(finalChecks["partial-sum"], 36);
  assert.equal(finalChecks["grid-sum"], 36);
});

test("CUDA 105 routes the scalar tail through its own guarded load", () => {
  assert.deepEqual(transferTriples(105, 1), [
    ["input", "vector-load", [1, 0.1, 65504, 0.00000001]],
    ["input", "tail-load", 2.5],
  ]);
  assert.deepEqual(transferTriples(105, 2), [
    ["vector-load", "half-main", [1, 0.1, 65504, 0.00000001]],
    ["tail-load", "half-tail", 2.5],
    ["tail-mask", "half-tail", "index 4 valid"],
  ]);
});

test("CUDA 102 separates the scale product from the biased result", () => {
  const compute = frameFor(102, 2);

  assert.deepEqual(compute.entityStates.product.value, [2, 4, 6, 8]);
  assert.deepEqual(compute.entityStates["biased-result"].value, [3, 5, 7, 9]);
  assert.deepEqual(
    compute.outputs.map(({ entityId, value }) => [entityId, value]),
    [
      ["product", [2, 4, 6, 8]],
      ["biased-result", [3, 5, 7, 9]],
    ],
  );
  assert.deepEqual(transferTriples(102, 2), [
    ["loaded", "product", [1, 2, 3, 4]],
    ["scale", "product", 2],
    ["product", "biased-result", [2, 4, 6, 8]],
    ["bias", "biased-result", 1],
  ]);
  assert.deepEqual(transferTriples(102, 3), [
    ["biased-result", "output", [3, 5, 7, 9]],
  ]);
});

test("CUDA 401 separates ping compute from pong prefetch provenance", () => {
  const scene = sceneFor(401);
  assert.deepEqual(
    scene.formulaBindings.find(({ symbol }) => symbol === "K")?.entityIds,
    ["k-range"],
  );
  assert.equal(frameFor(401, 0).entityStates["k-range"].value, 4);
  assert.equal(frameFor(401, 0).entityStates["tile-width"].value, 2);

  assert.deepEqual(transferTriples(401, 1), [
    ["a", "ping-a", [1, 2, 5, 6]],
    ["b", "ping-b", [1, 2, 0, 1]],
    ["ping-a", "buffer-state", "ping A ready"],
    ["ping-b", "buffer-state", "ping B ready"],
  ]);
  assert.deepEqual(transferTriples(401, 2), [
    ["ping-a", "accumulator", [1, 2, 5, 6]],
    ["ping-b", "accumulator", [1, 2, 0, 1]],
    ["accumulator", "accumulator-after-k0", [1, 4, 5, 16]],
    ["a", "pong-a", [3, 4, 7, 8]],
    ["b", "pong-b", [1, 0, 2, 1]],
  ]);
  assert.deepEqual(transferTriples(401, 4), [
    ["pong-a", "k1-contribution", [3, 4, 7, 8]],
    ["pong-b", "k1-contribution", [1, 0, 2, 1]],
    ["accumulator-after-k0", "accumulator", [1, 4, 5, 16]],
    ["k1-contribution", "accumulator", [11, 4, 23, 8]],
    ["pong-a", "buffer-state", "pong A consumed"],
    ["pong-b", "buffer-state", "pong B consumed"],
  ]);
});

test("the storyboard builder refuses ambiguous many-to-many automatic routes", () => {
  const blueprint = getCudaLessonBlueprint(401);
  assert.ok(blueprint);
  const definition = structuredClone(matrixSceneDefinitions[401]) as CudaStoryboardDefinition;
  definition.steps[2].transfers = undefined;

  assert.throws(
    () => createCudaStoryboardScene(blueprint, definition),
    /explicit transfers/i,
  );
});

test("CUDA 301 keeps every scan distance as visible numeric state", () => {
  const frame = frameFor(301, 2);
  assert.deepEqual(frame.entityStates["round-offset-1"].value, [1, 3, 5, 7, 9]);
  assert.deepEqual(frame.entityStates["round-offset-2"].value, [1, 3, 6, 10, 14]);
  assert.deepEqual(frame.entityStates["round-offset-4"].value, [1, 3, 6, 10, 15]);
  assert.deepEqual(transferTriples(301, 2), [
    ["buffer-a", "round-offset-1", [1, 2, 3, 4, 5]],
    ["barrier", "round-offset-1", "released for offset 1"],
    ["round-offset-1", "round-offset-2", [1, 3, 5, 7, 9]],
    ["round-offset-2", "round-offset-4", [1, 3, 6, 10, 14]],
    ["round-offset-4", "buffer-b", [1, 3, 6, 10, 15]],
    ["round-offset-4", "local-prefix", [1, 3, 6, 10, 15]],
  ]);
});

test("CUDA 302 exposes the bit-1 and bit-2 stable radix rounds", () => {
  const frame = frameFor(302, 6);
  const expectedStates = {
    "bit-1-digits": [0, 1, 1, 0],
    "bit-1-ranks": [0, 0, 1, 1],
    "bit-1-positions": [0, 2, 3, 1],
    "bit-1-buffer": [4, 1, 2, 3],
    "bit-2-digits": [1, 0, 0, 0],
    "bit-2-ranks": [0, 0, 1, 2],
    "bit-2-positions": [3, 0, 1, 2],
    "bit-2-buffer": [1, 2, 3, 4],
  };
  for (const [entityId, expected] of Object.entries(expectedStates)) {
    assert.deepEqual(frame.entityStates[entityId]?.value, expected, entityId);
  }
  assert.deepEqual(frame.entityStates.keys.value, [1, 2, 3, 4], "final keys publish the sorted buffer");
  assert.doesNotMatch(frame.result, /all uint32 bits complete/i);
  assert.match(frame.result, /bit 1.*bit 2/i);
});

test("CUDA 501 makes zero-padding boundary reads and outputs concrete", () => {
  const load = frameFor(501, 2);
  assert.deepEqual(load.entityStates["input-tile"].value, [
    [0, 0, 0, 0],
    [0, 1, 2, 0],
    [0, 3, 4, 0],
    [0, 0, 0, 0],
  ]);
  assert.equal(load.entityStates.padding.value, "12 out-of-range slots -> 0");
  assert.deepEqual(frameFor(501, 5).entityStates.output.value, [
    [-1, -2, 0],
    [-3, -3, 2],
    [0, 3, 4],
  ]);
});

test("CUDA 503 clamp halos repeat a nonzero corner and differ from zero padding", () => {
  assert.deepEqual(frameFor(503, 0).entityStates["horizontal-tile"].value, [
    [1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);
  assert.deepEqual(frameFor(503, 2).entityStates.temporary.value, [
    [0.75, 0.25, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  assert.deepEqual(frameFor(503, 5).entityStates.output.value, [
    [0.5625, 0.1875, 0],
    [0.1875, 0.0625, 0],
    [0, 0, 0],
  ]);
  assert.notEqual(
    (frameFor(503, 5).entityStates.output.value as number[][])[0][0],
    0.25,
    "corner output must not match zero-padding's corner response",
  );
});
