import assert from "node:assert/strict";
import test from "node:test";

import { conceptLessonBlueprints } from "../src/config/conceptLessonBlueprints/index.ts";
import {
  validateLessonScene,
  type LessonSceneFrame,
  type LessonSceneSpec,
  type SceneValue,
} from "../src/config/lessonSceneTypes.ts";
import {
  conceptLessonScenes,
  getConceptLessonScene,
} from "../src/config/lessonScenes/concepts/index.ts";
import { compilerSceneProfiles } from "../src/config/lessonScenes/concepts/compiler.ts";
import { computerArchitectureSceneProfiles } from "../src/config/lessonScenes/concepts/computerArchitecture.ts";
import { dataStructuresAlgorithmSceneProfiles } from "../src/config/lessonScenes/concepts/dataStructuresAlgorithms.ts";
import { databaseSceneProfiles } from "../src/config/lessonScenes/concepts/databases.ts";
import { networkSceneProfiles } from "../src/config/lessonScenes/concepts/networks.ts";
import { operatingSystemSceneProfiles } from "../src/config/lessonScenes/concepts/operatingSystems.ts";
import type { ConceptSceneProfile } from "../src/config/lessonScenes/concepts/profile.ts";

const conceptSceneProfiles = {
  ...dataStructuresAlgorithmSceneProfiles,
  ...operatingSystemSceneProfiles,
  ...networkSceneProfiles,
  ...databaseSceneProfiles,
  ...compilerSceneProfiles,
  ...computerArchitectureSceneProfiles,
} as Record<number, ConceptSceneProfile>;

function scene(lessonId: number): LessonSceneSpec {
  const result = getConceptLessonScene(lessonId);
  assert.ok(result, `missing concept scene ${lessonId}`);
  return result;
}

function frameAt(lessonId: number, index: number): LessonSceneFrame {
  const blueprint = conceptLessonBlueprints.find(({ id }) => id === lessonId);
  assert.ok(blueprint, `missing concept blueprint ${lessonId}`);
  const joint = blueprint.flow[index];
  assert.ok(joint, `missing joint ${index} for concept ${lessonId}`);
  return scene(lessonId).framesByJointId[joint.id];
}

function value(lessonId: number, frameIndex: number, entityId: string): SceneValue | undefined {
  return frameAt(lessonId, frameIndex).entityStates[entityId]?.value;
}

function visible(lessonId: number, frameIndex: number, entityId: string): boolean {
  return frameAt(lessonId, frameIndex).entityStates[entityId]?.visible ?? false;
}

function binding(lessonId: number, symbol: string): string[] {
  return scene(lessonId).formulaBindings.find((candidate) => candidate.symbol === symbol)?.entityIds ?? [];
}

test("all concept scenes use semantic entities and explicit causal frames", () => {
  assert.equal(conceptLessonScenes.length, 36);

  for (const blueprint of conceptLessonBlueprints) {
    const lessonScene = scene(blueprint.id);
    const frames = blueprint.flow.map(({ id }) => lessonScene.framesByJointId[id]);
    assert.deepEqual(
      validateLessonScene(blueprint, lessonScene),
      [],
      `concept/${blueprint.id} must satisfy the shared scene protocol`,
    );
    assert.ok(
      lessonScene.entities.every(({ id }) => !/^entity-\d+$/.test(id)),
      `concept/${blueprint.id} still uses positional entity IDs`,
    );

    assert.ok(
      frames.some((frame) =>
        frame.operation.sourceEntityIds.length > 1
        || frame.operation.targetEntityIds.length > 1),
      `concept/${blueprint.id} has only positional one-to-one operations`,
    );

    for (const currentFrame of frames) {
      for (const datum of [...currentFrame.outputs, ...currentFrame.metrics]) {
        assert.equal(
          currentFrame.entityStates[datum.entityId]?.visible,
          true,
          `concept/${blueprint.id}/${currentFrame.jointId}/${datum.entityId}: output must be visible`,
        );
        assert.deepEqual(
          datum.value,
          currentFrame.entityStates[datum.entityId]?.value,
          `concept/${blueprint.id}/${currentFrame.jointId}/${datum.entityId}: output must use the post-write value`,
        );
      }
      for (const transfer of currentFrame.transfers) {
        const input = currentFrame.inputs.find(({ entityId }) => entityId === transfer.from);
        const state = currentFrame.entityStates[transfer.from];
        assert.ok(
          [input?.value, state.previousValue, state.value].some((snapshot) =>
            JSON.stringify(snapshot) === JSON.stringify(transfer.sourceValue)),
          `concept/${blueprint.id}/${currentFrame.jointId}: transfer must name a visible source snapshot`,
        );
        assert.ok(
          currentFrame.visibleConnectionIds.some((connectionId) => {
            const connection = lessonScene.connections.find(({ id }) => id === connectionId);
            return connection?.from === transfer.from && connection.to === transfer.to;
          }),
          `concept/${blueprint.id}/${currentFrame.jointId}: transfer path must be visible`,
        );
      }
    }

    const finalFrame = frames.at(-1);
    assert.ok(finalFrame);
    assert.ok(
      finalFrame.debugAssertions.length >= 2,
      `concept/${blueprint.id}: final checks must diagnose more than the generated target value`,
    );
    assert.ok(
      new Set(finalFrame.debugAssertions.map(({ entityId }) => entityId)).size >= 2,
      `concept/${blueprint.id}: final checks must cover independent state`,
    );
  }
});

test("all 36 scenes snapshot inputs before applying each frame's writes", () => {
  const affectedLessons = new Set<number>();
  const affectedFrames = new Set<string>();

  for (const blueprint of conceptLessonBlueprints) {
    const profile = conceptSceneProfiles[blueprint.id];
    assert.ok(profile, `missing concept profile ${blueprint.id}`);
    const lessonScene = scene(blueprint.id);
    const values = Object.fromEntries(
      profile.entities.map(({ id, initialValue }) => [id, structuredClone(initialValue)]),
    );

    profile.frames.forEach((profileFrame, frameIndex) => {
      const joint = blueprint.flow[frameIndex];
      const currentFrame = lessonScene.framesByJointId[joint.id];
      const inputIds = profileFrame.inputEntityIds ?? profileFrame.sourceEntityIds;

      assert.deepEqual(
        currentFrame.inputs.map(({ entityId }) => entityId),
        inputIds,
        `concept/${blueprint.id}/${joint.id}: input order must follow the profile`,
      );
      currentFrame.inputs.forEach((input) => {
        assert.deepEqual(
          input.value,
          values[input.entityId],
          `concept/${blueprint.id}/${joint.id}/${input.entityId}: input must be the pre-write value`,
        );
      });

      if (inputIds.some((id) => Object.prototype.hasOwnProperty.call(profileFrame.values, id))) {
        affectedLessons.add(blueprint.id);
        affectedFrames.add(`${blueprint.id}/${joint.id}`);
      }
      for (const [entityId, nextValue] of Object.entries(profileFrame.values)) {
        values[entityId] = structuredClone(nextValue);
      }
    });
  }

  assert.equal(affectedLessons.size, 18, "the regression fixture must cover all 18 affected lessons");
  assert.equal(affectedFrames.size, 33, "the regression fixture must cover all 33 affected frames");
});

test("visibleFrom controls reveal timing even for formula-bound entities", () => {
  for (const blueprint of conceptLessonBlueprints) {
    const profile = conceptSceneProfiles[blueprint.id];
    assert.ok(profile, `missing concept profile ${blueprint.id}`);
    const expectedVisibility = Object.fromEntries(
      profile.entities.map(({ id }) => [id, false]),
    );

    profile.frames.forEach((profileFrame, frameIndex) => {
      for (const candidate of profile.entities) {
        if (frameIndex >= candidate.visibleFrom) expectedVisibility[candidate.id] = true;
      }
      Object.assign(expectedVisibility, profileFrame.visibility);

      const joint = blueprint.flow[frameIndex];
      const currentFrame = scene(blueprint.id).framesByJointId[joint.id];
      for (const candidate of profile.entities) {
        assert.equal(
          currentFrame.entityStates[candidate.id].visible,
          expectedVisibility[candidate.id],
          `concept/${blueprint.id}/${joint.id}/${candidate.id}: reveal timing must honor visibleFrom`,
        );
      }
    });

    for (const formulaBinding of scene(blueprint.id).formulaBindings) {
      assert.ok(
        blueprint.flow.some(({ id }) => formulaBinding.entityIds.some(
          (entityId) => scene(blueprint.id).framesByJointId[id].entityStates[entityId].visible,
        )),
        `concept/${blueprint.id}/${formulaBinding.symbol}: binding must become visible at its causal stage`,
      );
    }
  }

  assert.equal(visible(40002, 0, "node-25"), false);
  assert.equal(visible(40002, 2, "node-25"), false);
  assert.equal(visible(40002, 3, "node-25"), true);
  assert.equal(visible(40002, 0, "insert-pointer-updates"), false);
  assert.equal(visible(40002, 2, "insert-pointer-updates"), false);
  assert.equal(visible(40002, 3, "insert-pointer-updates"), true);
});

test("formula symbols bind to the quantities they name", () => {
  assert.deepEqual(binding(40001, "A[i]"), ["target-element"]);
  assert.deepEqual(binding(40001, "b"), ["base-address"]);
  assert.deepEqual(binding(40001, "w"), ["element-width"]);
  assert.deepEqual(binding(40001, "i"), ["target-index"]);
  assert.deepEqual(binding(40003, "x_{\\mathrm{stack}}"), ["stack-output"]);
  assert.deepEqual(binding(40003, "x_{\\mathrm{queue}}"), ["queue-output"]);
  assert.deepEqual(binding(40014, "d"), ["destination-address"]);
  assert.deepEqual(binding(40014, "r^*"), ["selected-route"]);
  assert.deepEqual(binding(40018, "T_{\\mathrm{first\\ byte}}"), ["first-byte-time"]);
  assert.deepEqual(binding(40021, "a',b'"), ["account-a-after", "account-b-after"]);
  assert.deepEqual(binding(40029, "\\mathrm{IN}[B],\\mathrm{OUT}[B]"), ["block-in", "block-out"]);
  assert.deepEqual(binding(40035, "\\widehat{y}_t"), ["predicted-direction"]);
  assert.deepEqual(binding(40036, "S(p)"), ["speedup"]);
});

test("40002 rewires the linked list to 20 -> 25 -> 30", () => {
  const finalFrame = frameAt(40002, 3);
  assert.deepEqual(binding(40002, "T_{\\mathrm{insert}}"), ["insert-pointer-updates"]);
  assert.equal(value(40002, 3, "insert-pointer-updates"), 2);
  assert.ok(!binding(40002, "T_{\\mathrm{insert}}").some((id) => /^node-/.test(id)));
  assert.deepEqual(finalFrame.visibleConnectionIds, [
    "next-10-20",
    "next-20-25",
    "next-25-30",
  ]);
  assert.ok(!finalFrame.visibleConnectionIds.includes("next-20-30"));
});

test("40003 executes stack and queue removal in parallel", () => {
  assert.equal(value(40003, 2, "stack-output"), 3);
  assert.equal(value(40003, 2, "queue-output"), 1);
  assert.equal(value(40003, 3, "stack-top"), 2);
  assert.equal(value(40003, 3, "queue-front"), 2);
});

test("40005 exposes frontier depletion, visited vertices, and scanned edges", () => {
  assert.deepEqual(value(40005, 0, "frontier"), ["S"]);
  assert.deepEqual(value(40005, 2, "frontier"), ["A", "B"]);
  assert.deepEqual(value(40005, 3, "frontier"), []);
  assert.deepEqual(value(40005, 3, "visited"), ["S", "A", "B"]);
  assert.equal(value(40005, 3, "scanned-edges"), 3);
});

test("40014 makes longest-prefix routing and forwarding visible", () => {
  assert.equal(value(40014, 0, "destination-address"), "10.1.2.9");
  assert.deepEqual(value(40014, 1, "matching-prefixes"), ["0.0.0.0/0", "10.0.0.0/8", "10.1.2.0/24"]);
  assert.equal(value(40014, 2, "selected-route"), "10.1.2.0/24");
  assert.equal(value(40014, 3, "next-hop"), 7);
  assert.equal(value(40014, 3, "ttl"), 63);
});

test("40015 keeps sent sequence state separate from retransmission state", () => {
  assert.equal(value(40015, 0, "segment-seq"), 100);
  assert.deepEqual(value(40015, 0, "sent-interval"), [100, 104]);
  assert.equal(value(40015, 0, "retransmit-seq"), "pending");
  assert.equal(value(40015, 2, "cumulative-ack"), 100);
  assert.equal(value(40015, 3, "retransmit-seq"), 100);
});

test("40016 derives ACK and loss windows from the current cwnd and MSS", () => {
  assert.equal(value(40016, 0, "current-cwnd"), 8);
  assert.equal(value(40016, 0, "mss"), 1);
  assert.equal(value(40016, 1, "ack-cwnd"), 8.125);
  assert.equal(value(40016, 3, "loss-cwnd"), 4.0625);
});

test("40017, 40023, and 40036 hide results until their causal frames", () => {
  assert.equal(visible(40017, 0, "answer-address"), false);
  assert.equal(value(40017, 2, "answer-address"), "192.0.2.34");
  assert.equal(visible(40023, 0, "actual-rows"), false);
  assert.equal(value(40023, 4, "actual-rows"), 120);
  assert.equal(visible(40036, 0, "core-0-sum"), false);
  assert.equal(value(40036, 4, "final-sum"), 55);
});

test("40021 atomically changes both balances while conserving the total", () => {
  assert.equal(value(40021, 2, "account-a-after"), 70);
  assert.equal(value(40021, 2, "account-b-after"), 80);
  assert.equal(value(40021, 3, "balance-total"), 150);
  assert.equal(value(40021, 3, "commit-state"), "committed");
});

test("40022 checks the returned third MVCC version", () => {
  assert.equal(value(40022, 2, "checked-version-count"), 3);
  assert.equal(value(40022, 2, "visible-version-value"), 80);
});

test("40025 emits identifier, plus, and number tokens", () => {
  assert.deepEqual(value(40025, 4, "tokens"), ["identifier(age)", "plus(+)", "number(1)"]);
  assert.equal(value(40025, 4, "token-count"), 3);
});

test("40026 accepts only after consuming all input and building the AST", () => {
  assert.deepEqual(value(40026, 4, "remaining-input"), []);
  assert.deepEqual(value(40026, 4, "parse-stack"), ["$"]);
  assert.equal(value(40026, 4, "matched-count"), 5);
  assert.equal(value(40026, 4, "ast-node-count"), 5);
  assert.equal(value(40026, 4, "accepted"), true);
});

test("40029 exposes x=4, y=6, and a stable fixed point", () => {
  assert.equal(value(40029, 1, "x-value"), 4);
  assert.equal(value(40029, 2, "y-value"), 6);
  assert.equal(value(40029, 3, "changed-environments"), 0);
  assert.equal(value(40029, 3, "fixed-point"), true);
});

test("40030 clears the spill set after rebuilding allocation state", () => {
  assert.deepEqual(value(40030, 2, "spill-set"), ["v3"]);
  assert.deepEqual(value(40030, 4, "spill-set"), []);
  assert.deepEqual(value(40030, 4, "locations"), ["v1:r1", "v2:r2", "v3:stack[0]"]);
});

test("40031 uses the five RISC-V I-type fields totaling 32 bits", () => {
  const blueprint = conceptLessonBlueprints.find(({ id }) => id === 40031);
  assert.ok(blueprint);
  assert.equal(
    blueprint.formula,
    "W=w_{\\mathrm{imm}}\\Vert w_{\\mathrm{rs1}}\\Vert w_{\\mathrm{funct3}}\\Vert w_{\\mathrm{rd}}\\Vert w_{\\mathrm{op}},\\qquad |W|=12+5+3+5+7=32",
  );
  assert.deepEqual(
    blueprint.symbols.map(({ symbol }) => symbol),
    ["W", "w_{\\mathrm{op}}", "w_{\\mathrm{rd}}", "w_{\\mathrm{funct3}}", "w_{\\mathrm{rs1}}", "w_{\\mathrm{imm}}"],
  );
  assert.equal(value(40031, 2, "opcode-width"), 7);
  assert.equal(value(40031, 2, "rd-width"), 5);
  assert.equal(value(40031, 2, "funct3-width"), 3);
  assert.equal(value(40031, 2, "rs1-width"), 5);
  assert.equal(value(40031, 2, "immediate-width"), 12);
  assert.equal(value(40031, 3, "word-width"), 32);
  assert.ok(!scene(40031).entities.some(({ id }) => id === "rs2-width"));
});

test("40034 keeps the page-fault mapping through permission check and retry", () => {
  assert.equal(value(40034, 3, "resolved-frame"), 7);
  assert.equal(value(40034, 4, "resolved-frame"), 7);
  assert.equal(value(40034, 4, "permission"), "allowed");
  assert.equal(value(40034, 5, "physical-address"), 29714);
});

test("40035 reveals prediction before truth and flushes only on mismatch", () => {
  assert.equal(value(40035, 0, "actual-direction"), "pending");
  assert.equal(visible(40035, 0, "correct-target"), false);
  assert.equal(value(40035, 1, "predicted-direction"), 0);
  assert.equal(value(40035, 3, "actual-direction"), 1);
  assert.equal(value(40035, 4, "counter-after"), 2);
  assert.equal(value(40035, 5, "flushed-instructions"), 3);
  assert.equal(value(40035, 5, "correct-target"), 400);
});
