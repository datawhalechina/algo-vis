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
  assert.equal(barrier.entityStates.barrier.value, "released");

  const tree = scene.framesByJointId["shared-tree-reduce"];
  assert.deepEqual(
    tree.outputs.map((datum) => datum.value),
    [3, 7, 11, 15, 10, 26],
  );
  assert.equal(tree.transfers.length, 12);

  const warp = scene.framesByJointId["warp-tail"];
  assert.deepEqual(warp.transfers.map((transfer) => transfer.payload), [10, 26]);
  assert.equal(warp.outputs.at(-1)?.value, 36);

  const finalFrame = scene.framesByJointId["finalize-grid-sum"];
  assert.equal(finalFrame.outputs.at(-1)?.value, 36);
});
