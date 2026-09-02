import assert from "node:assert/strict";
import test from "node:test";
import katex from "katex";

import {
  aiLessonBlueprints,
  getAiLessonBlueprint,
} from "../src/config/aiLessonBlueprints/index.ts";
import {
  conceptLessonBlueprints,
  getConceptLessonBlueprint,
} from "../src/config/conceptLessonBlueprints/index.ts";
import {
  cudaLessonBlueprints,
  getCudaLessonBlueprint,
} from "../src/config/cudaLessonBlueprints/index.ts";
import {
  createGuidedLessonSteps,
  type GuidedLessonBlueprint,
} from "../src/config/guidedLessonTypes.ts";

const aiIds = Array.from({ length: 63 }, (_, index) => 10072 + index);
const cudaIds = [
  102, 103, 104, 105, 106,
  201, 202, 203,
  301, 302, 303,
  401, 402, 403,
  501, 502, 503,
  601, 602,
  701, 702,
];
const conceptIds = Array.from({ length: 36 }, (_, index) => 40001 + index);

function assertCompleteBlueprint(blueprint: GuidedLessonBlueprint) {
  assert.ok(blueprint.title.trim().length > 0, `${blueprint.id}: missing title`);
  assert.ok(blueprint.intuition.trim().length >= 20, `${blueprint.id}: intuition too short`);
  assert.ok(blueprint.formula.trim().length > 0, `${blueprint.id}: missing formula`);
  assert.ok(blueprint.symbols.length >= 2, `${blueprint.id}: needs symbol explanations`);
  assert.ok(blueprint.flow.length >= 3, `${blueprint.id}: flow too short`);
  assert.ok(blueprint.misconception.trim().length >= 12, `${blueprint.id}: misconception too short`);
  assert.ok(blueprint.debugTip.trim().length >= 12, `${blueprint.id}: debug tip too short`);
  assert.ok(blueprint.takeaway.trim().length >= 12, `${blueprint.id}: takeaway too short`);

  assert.doesNotThrow(
    () => katex.renderToString(blueprint.formula, { displayMode: true, throwOnError: true }),
    `${blueprint.id}: formula must render with KaTeX`,
  );

  for (const symbol of blueprint.symbols) {
    assert.ok(symbol.meaning.trim().length > 0, `${blueprint.id}: symbol meaning missing`);
    assert.doesNotThrow(
      () => katex.renderToString(symbol.symbol, { throwOnError: true }),
      `${blueprint.id}: symbol ${symbol.symbol} must render with KaTeX`,
    );
  }

  const steps = createGuidedLessonSteps(blueprint);
  const transitionSteps = steps.filter((step) => step.phase === "transition");
  assert.equal(transitionSteps.length, blueprint.flow.length, `${blueprint.id}: every flow joint needs a step`);
  assert.deepEqual(
    transitionSteps.map((step) => step.activeFlowIndex),
    blueprint.flow.map((_, index) => index),
    `${blueprint.id}: flow joints must be directly addressable`,
  );
  assert.equal(steps.at(-1)?.finished, true, `${blueprint.id}: summary must finish the lesson`);
}

test("all 63 missing AI lessons have independent complete blueprints", () => {
  assert.deepEqual(aiLessonBlueprints.map((lesson) => lesson.id).sort((a, b) => a - b), aiIds);
  for (const id of aiIds) {
    const blueprint = getAiLessonBlueprint(id);
    assert.ok(blueprint, `missing AI blueprint ${id}`);
    assertCompleteBlueprint(blueprint);
  }
});

test("all 21 missing CUDA lessons have independent complete blueprints", () => {
  assert.deepEqual(cudaLessonBlueprints.map((lesson) => lesson.id).sort((a, b) => a - b), cudaIds);
  for (const id of cudaIds) {
    const blueprint = getCudaLessonBlueprint(id);
    assert.ok(blueprint, `missing CUDA blueprint ${id}`);
    assertCompleteBlueprint(blueprint);
  }
});

test("the concept bookshelf contains six complete lessons per book", () => {
  assert.deepEqual(conceptLessonBlueprints.map((lesson) => lesson.id).sort((a, b) => a - b), conceptIds);
  assert.equal(new Set(conceptLessonBlueprints.map((lesson) => lesson.slug)).size, 36);

  for (let bookId = 1; bookId <= 6; bookId += 1) {
    assert.equal(
      conceptLessonBlueprints.filter((lesson) => lesson.bookId === bookId).length,
      6,
      `book ${bookId} must contain six concepts`,
    );
  }

  for (const id of conceptIds) {
    const blueprint = getConceptLessonBlueprint(id);
    assert.ok(blueprint, `missing concept blueprint ${id}`);
    assert.ok(blueprint.description.trim().length >= 20, `${id}: description too short`);
    assert.ok(blueprint.keyPoints.length >= 3, `${id}: needs key points`);
    assertCompleteBlueprint(blueprint);
  }
});

test("all lesson IDs are globally unique", () => {
  const ids = [
    ...aiLessonBlueprints.map((lesson) => lesson.id),
    ...cudaLessonBlueprints.map((lesson) => lesson.id),
    ...conceptLessonBlueprints.map((lesson) => lesson.id),
  ];
  assert.equal(new Set(ids).size, ids.length);
});

test("CUDA radix sort persists stable local ranks across kernel boundaries", () => {
  const blueprint = getCudaLessonBlueprint(302);
  assert.ok(blueprint);

  const flow = blueprint.flow.map((joint) => joint.label).join(" ");
  assert.match(flow, /exclusive scan/);
  assert.match(flow, /全局 localRank\[i\]/);
  assert.match(flow, /scatter kernel.*localRank\[i\]/);
  assert.match(blueprint.misconception, /不能跨 kernel/);
});
