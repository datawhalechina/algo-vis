import assert from "node:assert/strict";
import test from "node:test";

import { conceptLessonBlueprints } from "../src/config/conceptLessonBlueprints/index.ts";
import type {
  LessonSceneFrame,
  LessonSceneSpec,
  SceneValue,
} from "../src/config/lessonSceneTypes.ts";
import { getConceptLessonScene } from "../src/config/lessonScenes/concepts/index.ts";

function scene(lessonId: number): LessonSceneSpec {
  const result = getConceptLessonScene(lessonId);
  assert.ok(result, `missing concept scene ${lessonId}`);
  return result;
}

function frames(lessonId: number): LessonSceneFrame[] {
  const blueprint = conceptLessonBlueprints.find(({ id }) => id === lessonId);
  assert.ok(blueprint, `missing concept blueprint ${lessonId}`);
  const lessonScene = scene(lessonId);
  return blueprint.flow.map(({ id }) => lessonScene.framesByJointId[id]);
}

function value(frame: LessonSceneFrame, entityId: string): SceneValue | undefined {
  return frame.entityStates[entityId]?.value;
}

test("40025 reaches a coherent EOF state after emitting all three tokens", () => {
  const lessonFrames = frames(40025);
  const boundaryFrame = lessonFrames[3];
  const finalFrame = lessonFrames[4];

  assert.equal(value(boundaryFrame, "current-char"), "+");
  assert.equal(value(boundaryFrame, "cursor"), 3);
  assert.equal(value(boundaryFrame, "last-accept"), 3);

  assert.equal(value(finalFrame, "automaton-state"), "EOF");
  assert.equal(value(finalFrame, "current-char"), "EOF");
  assert.equal(value(finalFrame, "cursor"), 5);
  assert.equal(value(finalFrame, "last-accept"), 5);
  assert.deepEqual(value(finalFrame, "tokens"), [
    "identifier(age)",
    "plus(+)",
    "number(1)",
  ]);
  assert.equal(value(finalFrame, "token-count"), 3);
});

test("40026 presents five internally consistent LL(1) snapshots", () => {
  const snapshots = frames(40026).map((frame) => ({
    stack: value(frame, "parse-stack"),
    lookahead: value(frame, "lookahead"),
    production: value(frame, "production"),
    remaining: value(frame, "remaining-input"),
    matched: value(frame, "matched-count"),
    ast: value(frame, "ast"),
    accepted: value(frame, "accepted"),
  }));

  assert.deepEqual(snapshots, [
    {
      stack: ["$", "E"],
      lookahead: "id",
      production: "none",
      remaining: ["id", "+", "id", "*", "id"],
      matched: 0,
      ast: [],
      accepted: false,
    },
    {
      stack: ["$", "E'", "T'", "id"],
      lookahead: "id",
      production: "E->TE'; T->FT'; F->id",
      remaining: ["id", "+", "id", "*", "id"],
      matched: 0,
      ast: [],
      accepted: false,
    },
    {
      stack: ["$", "E'", "T", "+"],
      lookahead: "+",
      production: "T'->epsilon; E'->+TE'",
      remaining: ["+", "id", "*", "id"],
      matched: 1,
      ast: ["id"],
      accepted: false,
    },
    {
      stack: ["$", "E'", "T'"],
      lookahead: "EOF",
      production: "T->FT'; F->id; T'->*FT'; F->id",
      remaining: [],
      matched: 5,
      ast: ["+", "id", "*", "id", "id"],
      accepted: false,
    },
    {
      stack: ["$"],
      lookahead: "EOF",
      production: "T'->epsilon; E'->epsilon; accept",
      remaining: [],
      matched: 5,
      ast: ["+", "id", "*", "id", "id"],
      accepted: true,
    },
  ]);
});

test("40030 keeps interference vertices and spill rewrite instructions coherent", () => {
  const lessonFrames = frames(40030);
  const vertices = new Set(value(lessonFrames[0], "virtual-registers") as string[]);

  for (const frame of lessonFrames) {
    const edges = value(frame, "interference-edges") as string[];
    for (const edge of edges) {
      const endpoints = edge.split("-");
      assert.equal(endpoints.length, 2, `invalid interference edge ${edge}`);
      assert.ok(
        endpoints.every((endpoint) => vertices.has(endpoint)),
        `${edge} references a vertex outside V`,
      );
    }
  }

  const rewritten = value(lessonFrames[3], "rewritten-ir") as string[];
  assert.deepEqual(rewritten, [
    "ADD v1",
    "MUL v2",
    "LOAD v3 <- stack[0]",
    "SUB v3",
    "STORE stack[0] <- v3",
  ]);
  assert.equal(
    value(lessonFrames[4], "machine-instruction-count"),
    rewritten.length,
  );
});

test("compiler-scene transfers carry current source values on visible paths", () => {
  for (const lessonId of [40025, 40026, 40030]) {
    const lessonScene = scene(lessonId);
    for (const frame of frames(lessonId)) {
      for (const movement of frame.transfers) {
        assert.deepEqual(
          movement.payload,
          value(frame, movement.from),
          `${lessonId}/${frame.jointId}/${movement.id} payload`,
        );
        assert.ok(
          frame.visibleConnectionIds.some((connectionId) => {
            const edge = lessonScene.connections.find(({ id }) => id === connectionId);
            return edge?.from === movement.from && edge.to === movement.to;
          }),
          `${lessonId}/${frame.jointId}/${movement.id} path must be visible`,
        );
      }
    }
  }
});
