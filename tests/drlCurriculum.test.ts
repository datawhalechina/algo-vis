import assert from "node:assert/strict";
import test from "node:test";

import {
  DRL_CURRICULUM,
  DRL_SOURCE_URL,
  getDrlChapterByProblemId,
} from "../src/config/drlCurriculum.ts";

test("defines the approved fourteen-chapter learning path", () => {
  assert.equal(DRL_CURRICULUM.length, 14);
  assert.deepEqual(
    DRL_CURRICULUM.map((chapter) => chapter.order),
    Array.from({ length: 14 }, (_, index) => index + 1),
  );
  assert.equal(DRL_SOURCE_URL, "https://github.com/wangshusen/DRL");
});

test("covers every reinforcement-learning lesson exactly once", () => {
  const ids = DRL_CURRICULUM.flatMap((chapter) => chapter.problemIds).sort(
    (a, b) => a - b,
  );
  assert.deepEqual(
    ids,
    Array.from({ length: 36 }, (_, index) => 30001 + index),
  );
});

test("presents distributed LLM RL as framework-neutral course content", () => {
  const chapter = getDrlChapterByProblemId(30030);
  assert.equal(chapter?.title, "LLM 分布式强化学习系统");
  assert.equal(chapter?.kind, "extension");
  assert.doesNotMatch(chapter?.title ?? "", /verl/i);
});

