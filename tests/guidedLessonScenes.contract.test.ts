import assert from "node:assert/strict";
import test from "node:test";
import katex from "katex";

import { aiLessonBlueprints } from "../src/config/aiLessonBlueprints/index.ts";
import { conceptLessonBlueprints } from "../src/config/conceptLessonBlueprints/index.ts";
import { cudaLessonBlueprints } from "../src/config/cudaLessonBlueprints/index.ts";
import {
  drlLessonBlueprints,
  type DRLLessonBlueprint,
} from "../src/config/drlLessonBlueprints.ts";
import {
  GUIDED_LESSON_MANIFEST,
  type GuidedLessonDomain,
} from "../src/config/guidedLessonManifest.ts";
import {
  evaluateDebugAssertion,
  semanticSceneSignature,
  validateLessonScene,
  type LessonSceneSpec,
} from "../src/config/lessonSceneTypes.ts";
import { getAiLessonScene } from "../src/config/lessonScenes/ai/index.ts";
import { getConceptLessonScene } from "../src/config/lessonScenes/concepts/index.ts";
import { getCudaLessonScene } from "../src/config/lessonScenes/cuda/index.ts";
import { getDrlLessonScene } from "../src/config/lessonScenes/drl/index.ts";
import type { GuidedLessonBlueprint } from "../src/config/guidedLessonTypes.ts";

interface DomainContract {
  domain: GuidedLessonDomain;
  blueprints: GuidedLessonBlueprint[];
  getScene: (id: number) => LessonSceneSpec | undefined;
}

const domains: DomainContract[] = [
  { domain: "ai", blueprints: aiLessonBlueprints, getScene: getAiLessonScene },
  { domain: "cuda", blueprints: cudaLessonBlueprints, getScene: getCudaLessonScene },
  {
    domain: "drl",
    blueprints: drlLessonBlueprints as DRLLessonBlueprint[],
    getScene: getDrlLessonScene,
  },
  {
    domain: "concepts",
    blueprints: conceptLessonBlueprints,
    getScene: getConceptLessonScene,
  },
];

function sorted(values: readonly number[]): number[] {
  return [...values].sort((left, right) => left - right);
}

test("the manifest contains exactly the 156 guided lessons", () => {
  const expectedAi = Array.from({ length: 63 }, (_, index) => 10072 + index);
  const expectedCuda = [
    102, 103, 104, 105, 106,
    201, 202, 203,
    301, 302, 303,
    401, 402, 403,
    501, 502, 503,
    601, 602,
    701, 702,
  ];
  const expectedDrl = Array.from({ length: 36 }, (_, index) => 30001 + index);
  const expectedConcepts = Array.from({ length: 36 }, (_, index) => 40001 + index);

  assert.deepEqual(sorted(GUIDED_LESSON_MANIFEST.ai), expectedAi);
  assert.deepEqual(sorted(GUIDED_LESSON_MANIFEST.cuda), expectedCuda);
  assert.deepEqual(sorted(GUIDED_LESSON_MANIFEST.drl), expectedDrl);
  assert.deepEqual(sorted(GUIDED_LESSON_MANIFEST.concepts), expectedConcepts);
  assert.equal(Object.values(GUIDED_LESSON_MANIFEST).flat().length, 156);
});

test("every guided lesson has a valid, genuinely changing scene", () => {
  for (const { domain, blueprints, getScene } of domains) {
    assert.deepEqual(
      sorted(blueprints.map((blueprint) => blueprint.id)),
      sorted(GUIDED_LESSON_MANIFEST[domain]),
      `${domain}: blueprint and manifest IDs differ`,
    );

    for (const blueprint of blueprints) {
      const scene = getScene(blueprint.id);
      assert.ok(scene, `${domain}/${blueprint.id}: missing scene`);
      assert.equal(scene.lessonId, blueprint.id);

      const errors = validateLessonScene(blueprint, scene);
      assert.deepEqual(errors, [], `${domain}/${blueprint.id}: ${errors.join("; ")}`);

      assert.doesNotThrow(() =>
        katex.renderToString(blueprint.formula, {
          displayMode: true,
          throwOnError: true,
        }),
      );

      const frames = blueprint.flow.map((joint) => scene.framesByJointId[joint.id]);
      const flowLabels = new Set(blueprint.flow.map(({ label }) => label));
      assert.ok(
        frames.some((frame) => Object.values(frame.entityStates).some(({ value }) =>
          typeof value === "number"
          || (Array.isArray(value) && value.flat().some((item) => typeof item === "number")))),
        `${domain}/${blueprint.id}: scene needs numeric computation state`,
      );
      for (const binding of scene.formulaBindings) {
        assert.ok(
          frames.some((frame) => binding.entityIds.some((id) => frame.entityStates[id]?.visible)),
          `${domain}/${blueprint.id}: ${binding.symbol} never becomes visible`,
        );
      }
      for (const frame of frames) {
        const targetIds = new Set(frame.operation.targetEntityIds);
        assert.ok(
          frame.transfers.length > 0
            || Object.values(frame.entityStates).some((state) =>
              state.previousValue !== undefined
              && JSON.stringify(state.previousValue) !== JSON.stringify(state.value)),
          `${domain}/${blueprint.id}/${frame.jointId}: frame needs a visible old-to-new state or data transfer`,
        );
        for (const [entityId, state] of Object.entries(frame.entityStates)) {
          if (state.previousValue === undefined) continue;
          assert.ok(
            targetIds.has(entityId),
            `${domain}/${blueprint.id}/${frame.jointId}: only a written target may expose a pre-state`,
          );
          assert.notDeepEqual(
            state.previousValue,
            state.value,
            `${domain}/${blueprint.id}/${frame.jointId}: ${entityId} exposes an unchanged pre-state`,
          );
          const matchingInput = frame.inputs.find(({ entityId: inputId }) => inputId === entityId);
          if (matchingInput) {
            assert.deepEqual(
              matchingInput.value,
              state.previousValue,
              `${domain}/${blueprint.id}/${frame.jointId}: ${entityId} input must use its pre-operation snapshot`,
            );
          }
        }
        assert.ok(
          frame.debugAssertions.some(({ operator }) => operator !== "visible"),
          `${domain}/${blueprint.id}/${frame.jointId}: expected-value assertion missing`,
        );
        for (const assertion of frame.debugAssertions) {
          assert.equal(
            evaluateDebugAssertion(assertion, frame.entityStates[assertion.entityId]),
            true,
            `${domain}/${blueprint.id}/${frame.jointId}: debug assertion fails`,
          );
        }
        for (const state of Object.values(frame.entityStates)) {
          if (typeof state.value === "string") {
            assert.ok(
              !flowLabels.has(state.value),
              `${domain}/${blueprint.id}/${frame.jointId}: flow prose used as state`,
            );
          }
        }
        if (frame.operation.expression) {
          assert.doesNotThrow(() =>
            katex.renderToString(frame.operation.expression!, {
              displayMode: false,
              throwOnError: true,
            }),
          );
        }
      }
      for (let index = 1; index < frames.length; index += 1) {
        assert.notEqual(
          semanticSceneSignature(frames[index - 1]),
          semanticSceneSignature(frames[index]),
          `${domain}/${blueprint.id}: joints ${index - 1} and ${index} only change prose/highlight`,
        );
      }
    }
  }
});

test("CUDA 201 exposes the complete seven-frame reduction", () => {
  const scene = getCudaLessonScene(201);
  assert.ok(scene);

  const ids = [
    "read-registers",
    "write-shared",
    "block-barrier",
    "shared-tree-reduce",
    "warp-tail",
    "write-block-sum",
    "finalize-grid-sum",
  ];
  assert.deepEqual(Object.keys(scene.framesByJointId), ids);

  const barrier = scene.framesByJointId["block-barrier"];
  assert.equal(
    scene.framesByJointId["write-shared"].entityStates.barrier.value,
    "waiting",
  );
  assert.equal(barrier.entityStates.barrier.value, "released");

  const tree = scene.framesByJointId["shared-tree-reduce"];
  assert.deepEqual(
    tree.outputs.map((datum) => datum.value),
    [3, 7, 11, 15, 10, 26],
  );
  assert.equal(tree.transfers.length, 12);
  assert.deepEqual(
    tree.transfers.map(({ from, to, payload }) => [from, to, payload]),
    [
      ["shared-0", "sum-01", 1],
      ["shared-1", "sum-01", 2],
      ["shared-2", "sum-23", 3],
      ["shared-3", "sum-23", 4],
      ["shared-4", "sum-45", 5],
      ["shared-5", "sum-45", 6],
      ["shared-6", "sum-67", 7],
      ["shared-7", "sum-67", 8],
      ["sum-01", "sum-left", 3],
      ["sum-23", "sum-left", 7],
      ["sum-45", "sum-right", 11],
      ["sum-67", "sum-right", 15],
    ],
  );

  const warp = scene.framesByJointId["warp-tail"];
  assert.deepEqual(warp.transfers.map((transfer) => transfer.payload), [10, 26]);
  assert.equal(warp.outputs.at(-1)?.value, 36);

  const finalFrame = scene.framesByJointId["finalize-grid-sum"];
  assert.equal(finalFrame.outputs.at(-1)?.value, 36);
});

test("CUDA array-valued debug checks compare the actual result", () => {
  for (const blueprint of cudaLessonBlueprints) {
    const scene = getCudaLessonScene(blueprint.id);
    assert.ok(scene);
    for (const joint of blueprint.flow) {
      const frame = scene.framesByJointId[joint.id];
      for (const assertion of frame.debugAssertions) {
        if (Array.isArray(frame.entityStates[assertion.entityId].value)) {
          assert.equal(
            assertion.operator,
            "eq",
            `cuda/${blueprint.id}/${joint.id}: array assertion only checks visibility`,
          );
        }
      }
    }
  }
});
