import assert from "node:assert/strict";
import test from "node:test";

import katex from "katex";

import { drlLessonBlueprints } from "../src/config/drlLessonBlueprints.ts";
import { validateLessonScene } from "../src/config/lessonSceneTypes.ts";
import {
  createDrlFrameSnapshots,
  drlSceneProfiles,
  drlLessonScenes,
  getDrlLessonScene,
} from "../src/config/lessonScenes/drl/index.ts";

function scene(id: number) {
  const result = getDrlLessonScene(id);
  assert.ok(result, `missing DRL scene ${id}`);
  return result;
}

function frameAt(id: number, index: number) {
  const blueprint = drlLessonBlueprints.find((candidate) => candidate.id === id);
  assert.ok(blueprint, `missing DRL blueprint ${id}`);
  const joint = blueprint.flow[index];
  assert.ok(joint, `missing joint ${index} for ${id}`);
  return scene(id).framesByJointId[joint.id];
}

function bindingEntityIds(id: number, symbol: string): string[] {
  const binding = scene(id).formulaBindings.find((candidate) => candidate.symbol === symbol);
  assert.ok(binding, `${id}: missing binding for ${symbol}`);
  return binding.entityIds;
}

function orderedFrames(id: number) {
  const blueprint = drlLessonBlueprints.find((candidate) => candidate.id === id);
  assert.ok(blueprint, `missing DRL blueprint ${id}`);
  const lesson = scene(id);
  return blueprint.flow.map((joint) => lesson.framesByJointId[joint.id]);
}

function numericValue(id: number, frameIndex: number, entityId: string): number {
  const value = frameAt(id, frameIndex).entityStates[entityId]?.value;
  assert.equal(typeof value, "number", `${id}/${frameIndex}: ${entityId} is not numeric`);
  return value;
}

function numericArray(id: number, frameIndex: number, entityId: string): number[] {
  const value = frameAt(id, frameIndex).entityStates[entityId]?.value;
  assert.ok(
    Array.isArray(value) && value.every((item) => typeof item === "number"),
    `${id}/${frameIndex}: ${entityId} is not a numeric array`,
  );
  return value as number[];
}

function approx(actual: number, expected: number, message: string, tolerance = 1e-6) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message}: expected ${expected}, received ${actual}`,
  );
}

test("DRL frame snapshots preserve overwritten inputs and expose written outputs", () => {
  const currentValues = {
    parameter: 0.4,
    batch: [1, 2],
  };

  const { beforeValues, afterValues } = createDrlFrameSnapshots(currentValues, {
    parameter: 0.7,
    batch: [3, 4],
  });

  assert.deepEqual(beforeValues, { parameter: 0.4, batch: [1, 2] });
  assert.deepEqual(afterValues, { parameter: 0.7, batch: [3, 4] });
  assert.deepEqual(currentValues, { parameter: 0.7, batch: [3, 4] });
});

test("all 36 DRL lessons expose authored causal frames", () => {
  assert.equal(drlLessonScenes.length, 36);

  for (const lesson of drlLessonScenes) {
    const blueprint = drlLessonBlueprints.find(({ id }) => id === lesson.lessonId);
    assert.ok(blueprint, `missing DRL blueprint ${lesson.lessonId}`);
    assert.deepEqual(
      validateLessonScene(blueprint, lesson),
      [],
      `${lesson.lessonId}: shared scene validation failed`,
    );
    assert.ok(
      lesson.entities.every(({ id }) => !/^entity-\d+$/.test(id)),
      `${lesson.lessonId}: positional entity IDs hide formula semantics`,
    );

    const frames = Object.values(lesson.framesByJointId);
    assert.ok(
      frames.some(({ operation }) => operation.sourceEntityIds.length > 1),
      `${lesson.lessonId}: no operation exposes multiple causal operands`,
    );

    for (const frame of frames) {
      assert.ok(frame.operation.expression?.trim(), `${lesson.lessonId}/${frame.jointId}: missing equation`);
      assert.doesNotThrow(() => katex.renderToString(frame.operation.expression!, {
        strict: "error",
        throwOnError: true,
      }));

      const inputIds = new Set(frame.inputs.map(({ entityId }) => entityId));
      const outputIds = new Set(frame.outputs.map(({ entityId }) => entityId));
      for (const sourceId of frame.operation.sourceEntityIds) {
        assert.ok(inputIds.has(sourceId), `${lesson.lessonId}/${frame.jointId}: source ${sourceId} is not a visible input`);
        assert.ok(
          frame.transfers.some(({ from }) => from === sourceId),
          `${lesson.lessonId}/${frame.jointId}: source ${sourceId} has no causal transfer`,
        );
      }
      for (const targetId of frame.operation.targetEntityIds) {
        assert.ok(outputIds.has(targetId), `${lesson.lessonId}/${frame.jointId}: target ${targetId} is not a visible output`);
        assert.ok(
          frame.transfers.some(({ to }) => to === targetId),
          `${lesson.lessonId}/${frame.jointId}: target ${targetId} receives no causal transfer`,
        );
      }
      for (const transfer of frame.transfers) {
        assert.ok(
          frame.operation.sourceEntityIds.includes(transfer.from),
          `${lesson.lessonId}/${frame.jointId}: transfer source ${transfer.from} is not a pre-operation input`,
        );
        assert.ok(frame.operation.targetEntityIds.includes(transfer.to));
      }
      assert.ok(
        frame.debugAssertions.some(({ operator }) => operator === "finite" || operator === "range"),
        `${lesson.lessonId}/${frame.jointId}: debug checks only repeat a generated target equality`,
      );
    }
  }
});

test("all DRL inputs and transfers preserve pre-operation values while outputs expose post-operation state", () => {
  for (const lesson of drlLessonScenes) {
    const profile = drlSceneProfiles.get(lesson.lessonId);
    assert.ok(profile, `missing DRL profile ${lesson.lessonId}`);
    const valuesBeforeStep = new Map(
      profile.entities.map(({ id, value }) => [id, structuredClone(value)]),
    );

    for (const [frameIndex, currentFrame] of orderedFrames(lesson.lessonId).entries()) {
      const profileFrame = profile.frames[frameIndex];
      assert.ok(profileFrame, `${lesson.lessonId}/${currentFrame.jointId}: missing profile frame`);
      const inputsById = new Map(
        currentFrame.inputs.map((datum) => [datum.entityId, datum]),
      );

      for (const sourceId of currentFrame.operation.sourceEntityIds) {
        const input = inputsById.get(sourceId);
        assert.ok(
          input,
          `${lesson.lessonId}/${currentFrame.jointId}: source ${sourceId} is missing from inputs`,
        );
        assert.deepEqual(
          input.value,
          valuesBeforeStep.get(sourceId),
          `${lesson.lessonId}/${currentFrame.jointId}: input ${sourceId} does not retain its pre-operation value`,
        );
      }

      for (const transfer of currentFrame.transfers) {
        const input = inputsById.get(transfer.from);
        assert.ok(
          input,
          `${lesson.lessonId}/${currentFrame.jointId}: transfer ${transfer.id} does not originate from an input`,
        );
        assert.deepEqual(
          transfer.sourceValue,
          input.value,
          `${lesson.lessonId}/${currentFrame.jointId}: transfer ${transfer.id} does not name the pre-operation source snapshot`,
        );
        assert.deepEqual(
          transfer.payload,
          input.value,
          `${lesson.lessonId}/${currentFrame.jointId}: transfer ${transfer.id} does not carry the pre-operation value`,
        );
      }

      for (const [entityId, value] of Object.entries(profileFrame.writes)) {
        valuesBeforeStep.set(entityId, structuredClone(value));
      }
      for (const output of currentFrame.outputs) {
        assert.deepEqual(
          output.value,
          valuesBeforeStep.get(output.entityId),
          `${lesson.lessonId}/${currentFrame.jointId}: output ${output.entityId} differs from the authored write`,
        );
        assert.deepEqual(
          currentFrame.entityStates[output.entityId].value,
          valuesBeforeStep.get(output.entityId),
          `${lesson.lessonId}/${currentFrame.jointId}: output ${output.entityId} differs from post-operation state`,
        );
      }
      for (const entity of lesson.entities) {
        assert.deepEqual(
          currentFrame.entityStates[entity.id].value,
          valuesBeforeStep.get(entity.id),
          `${lesson.lessonId}/${currentFrame.jointId}: ${entity.id} is not the complete post-operation state`,
        );
      }
    }
  }
});

test("all 36 formulas bind every declared symbol to its semantic entity", () => {
  const expectedBindings: Record<number, Record<string, string[]>> = {
    30001: { r_t: ["reward"], "\\gamma": ["discount"], G_t: ["return"] },
    30002: { "Q(s,a)": ["q-before"], r_t: ["reward"], "\\gamma": ["discount"] },
    30003: { "\\pi(a\\mid s)": ["policy-before"], "\\theta": ["theta-before"], "J(\\theta)": ["objective"] },
    30004: { "\\pi(a\\mid s)": ["actor-before"], "V(s)": ["value-current"], "\\delta_t": ["td-error"] },
    30005: { "P(s,a)": ["policy-prior"], "Q(s,a)": ["edge-q"], "N(s)": ["parent-visits"], "N(s,a)": ["edge-visits"], "c_{puct}": ["exploration-coefficient"] },
    30006: { "Q(s,a)": ["q-before"], "\\alpha": ["learning-rate"], "a_{t+1}": ["next-action"] },
    30007: { "Q(s,a)": ["q-before"], "\\alpha": ["learning-rate"], "\\max_a Q(s',a)": ["max-next-q"] },
    30008: { n: ["step-count"], "\\gamma": ["discount"], "V(s)": ["bootstrap-value"] },
    30009: { p_i: ["priority"], "P(i)": ["sampling-probability"], w_i: ["importance-weight"] },
    30010: { "Q_\\theta": ["online-scores"], "Q_{\\theta^-}": ["target-scores"], y: ["td-target"] },
    30011: { "V(s)": ["state-value"], "A(s,a)": ["raw-advantages"], "Q(s,a)": ["action-value"] },
    30012: { "b(s_t)": ["baseline"], "G_t-b(s_t)": ["advantage"], "\\pi(a\\mid s)": ["policy-before"] },
    30013: { "V(s)": ["value-baseline"], "\\pi(a\\mid s)": ["policy-before"], "G_t-V_w(s_t)": ["advantage"] },
    30014: { "A(s,a)": ["advantage"], "V(s)": ["value-current"], r_t: ["reward"] },
    30015: { "A_t^{MC}": ["mc-advantage"], "A_t^{TD}": ["td-advantage"] },
    30016: { "r_t(\\theta)": ["ratio"], "D_{KL}": ["kl-divergence"], "\\delta": ["trust-radius"] },
    30017: { o_t: ["observation"], h_t: ["hidden"], "\\pi(a\\mid s)": ["action-probability"] },
    30018: { K: ["discrete-count"], d: ["continuous-dimension"] },
    30019: { "\\mu_\\theta(s)": ["actor-action"], "Q(s,a)": ["critic-value"], "\\nabla_a Q": ["action-gradient"] },
    30020: { "\\mu_\\theta": ["mean"], "\\sigma_\\theta": ["std"], "A(s,a)": ["advantage"] },
    30021: { "\\mathbf a": ["joint-action"], Q_i: ["credit-a"] },
    30022: { o_i: ["observation-a"], "Q_i(s,\\mathbf a)": ["centralized-q"] },
    30023: { "\\pi_E": ["expert-policy"], "R_\\theta(\\tau)": ["candidate-reward"], "Z_\\theta": ["partition"], "\\lambda": ["regularization"] },
    30024: { "D(s,a)": ["discriminator"], "r_D(s,a)": ["discriminator-reward"], "\\pi_E": ["expert-policy"], "\\pi(a\\mid s)": ["policy-before"] },
    30025: { r_t: ["ratio"], "A(s,a)": ["advantage"], "\\epsilon": ["epsilon"] },
    30026: { G: ["group-size"], "\\hat A_i": ["standardized-advantage"] },
    30027: { r_i: ["current-reward"], G: ["group-size"] },
    30028: { "r_{i,t}": ["token-ratio"], "\\hat A_{i,t}": ["token-advantage"], "\\epsilon_{low}": ["epsilon-low"], "\\epsilon_{high}": ["epsilon-high"], "|o_i|": ["valid-token-count"] },
    30029: { x_i: ["samples"], N: ["sample-count"], "f(X)": ["function-definition"] },
    30030: { "\\theta": ["actor-parameter"], "\\phi": ["critic-parameter"], "\\pi_{ref}": ["reference-policy"] },
    30031: { B_i: ["shards"], N: ["worker-count"] },
    30032: { "\\mathcal D_{\\pi_{\\theta_k}}": ["rollout-batch"], "\\theta_k": ["actor-version"] },
    30033: { x: ["prompt"], y_t: ["current-token"], "y_{<t}": ["prefix"] },
    30034: { "\\delta_t": ["td-residual"], "\\lambda": ["gae-lambda"], "A(s,a)": ["gae-advantage"] },
    30035: { "R_{model}": ["model-score"], "R_{rule}": ["verified-rule-score"], "\\beta": ["kl-weight"] },
    30036: { "W_{train}": ["train-shards"], "W_{infer}": ["infer-shards"], "TP/PP": ["target-layout"] },
  };

  assert.equal(Object.keys(expectedBindings).length, 36);
  for (const lesson of drlLessonScenes) {
    assert.deepEqual(
      Object.fromEntries(lesson.formulaBindings.map(({ symbol, entityIds }) => [symbol, entityIds])),
      expectedBindings[lesson.lessonId],
      `${lesson.lessonId}: formula binding differs from the reviewed semantic map`,
    );
  }

  for (const lesson of drlLessonScenes) {
    const primaryBindings = lesson.formulaBindings.map(({ entityIds }) => entityIds[0]);
    assert.equal(
      new Set(primaryBindings).size,
      primaryBindings.length,
      `${lesson.lessonId}: distinct symbols share a fabricated positional binding`,
    );
  }
});

test("all 36 lessons keep their worked arithmetic internally consistent", () => {
  const checks: Record<number, () => void> = {
    30001: () => approx(numericValue(30001, 3, "return"), 2 + 0.8 * 1, "discounted return"),
    30002: () => {
      const target = 0.1 + 0.9 * 0.7;
      approx(numericValue(30002, 3, "td-target"), target, "Bellman target");
      approx(numericValue(30002, 3, "q-after"), 0.2 + 0.3 * (target - 0.2), "Q update");
    },
    30003: () => {
      const gradient = 1.45 * 0.425;
      approx(numericValue(30003, 2, "weighted-gradient"), gradient, "policy gradient");
      approx(numericValue(30003, 3, "theta-after"), 1 + 0.1 * gradient, "policy parameter update");
    },
    30004: () => {
      const delta = 1 + 0.9 * 0.58 - 0.4;
      approx(numericValue(30004, 2, "td-error"), delta, "actor-critic TD error");
      approx(numericValue(30004, 3, "critic-after"), 0.4 + 0.1 * delta, "critic update");
    },
    30005: () => {
      const score = 0.35 + 1.5 * 0.45 * Math.sqrt(12) / (1 + 3);
      approx(numericValue(30005, 0, "puct-score"), score, "PUCT score");
      approx(numericValue(30005, 3, "q-after"), (3 * 0.35 + 0.68) / 4, "MCTS backup");
    },
    30006: () => {
      const target = 1 + 0.9 * 0.4;
      approx(numericValue(30006, 3, "sarsa-target"), target, "Sarsa target");
      approx(numericValue(30006, 3, "q-after"), 0.25 + 0.2 * (target - 0.25), "Sarsa update");
    },
    30007: () => {
      const target = 1 + 0.9 * 0.8;
      approx(numericValue(30007, 3, "q-target"), target, "Q-learning target");
      approx(numericValue(30007, 3, "q-after"), 0.2 + 0.3 * (target - 0.2), "Q-learning update");
    },
    30008: () => {
      const rewards = 1 + 0.9 + 0.9 ** 2;
      const bootstrap = 0.9 ** 3 * 0.4;
      approx(numericValue(30008, 1, "discounted-rewards"), rewards, "n-step rewards");
      approx(numericValue(30008, 2, "bootstrap-term"), bootstrap, "n-step bootstrap");
      approx(numericValue(30008, 2, "n-step-target"), rewards + bootstrap, "n-step target");
    },
    30009: () => {
      approx(numericValue(30009, 1, "priority"), 0.7 + 0.01, "replay priority");
      approx(numericValue(30009, 2, "sampling-probability"), 0.71 ** 0.6 / 1.85, "sampling probability", 2e-4);
      const weight = (100 * 0.44) ** -0.4;
      approx(numericValue(30009, 3, "importance-weight"), weight, "importance weight");
      approx(numericValue(30009, 3, "network-after"), 0.5 - 0.1 * weight * 0.3, "weighted update");
    },
    30010: () => {
      const target = 0.45 + 0.9 * 0.55;
      approx(numericValue(30010, 2, "td-target"), target, "Double DQN target");
      approx(numericValue(30010, 3, "online-q-after"), 0.35 + 0.12 * (target - 0.35), "Double DQN update");
    },
    30011: () => {
      const advantages = numericArray(30011, 2, "raw-advantages");
      const mean = advantages.reduce((sum, value) => sum + value, 0) / advantages.length;
      approx(numericValue(30011, 2, "mean-advantage"), mean, "dueling mean advantage");
      approx(numericValue(30011, 3, "action-value"), 0.48 + (advantages[0] - mean), "dueling Q value");
    },
    30012: () => {
      const advantage = 0.9 - 0.5;
      approx(numericValue(30012, 2, "advantage"), advantage, "baseline advantage");
      approx(numericValue(30012, 3, "policy-after"), 0.4 + 0.1 * advantage, "baseline policy update");
    },
    30013: () => {
      const advantage = 2.71 - 0.62;
      approx(numericValue(30013, 3, "advantage"), advantage, "REINFORCE advantage");
      approx(numericValue(30013, 3, "policy-after"), 0.4 + 0.033493 * advantage, "REINFORCE update");
    },
    30014: () => {
      const advantage = 0.5 + 0.9 * 0.55 - 0.4;
      approx(numericValue(30014, 2, "advantage"), advantage, "A2C advantage");
      approx(numericValue(30014, 3, "critic-after"), 0.4 + 0.1 * advantage, "A2C critic update");
    },
    30015: () => {
      approx(numericValue(30015, 1, "mc-advantage"), 1.3 - 0.4, "Monte Carlo advantage");
      approx(numericValue(30015, 1, "td-advantage"), 0.3 + 0.9 * 0.5 - 0.4, "TD advantage");
      approx(numericValue(30015, 2, "bias-variance-score"), 0.62 - 0.21, "variance gap");
    },
    30016: () => {
      approx(numericValue(30016, 1, "ratio"), 0.432 / 0.4, "TRPO ratio");
      approx(numericValue(30016, 1, "surrogate"), 1.08 * 0.3, "TRPO surrogate");
      const kl = 0.4 * Math.log(0.4 / 0.432) + 0.6 * Math.log(0.6 / 0.568);
      approx(numericValue(30016, 2, "kl-divergence"), kl, "TRPO KL", 1e-6);
    },
    30017: () => {
      const hidden = Math.tanh(1.4 * 0.18 + 0.2);
      approx(numericValue(30017, 1, "hidden"), hidden, "RNN hidden state");
      approx(numericValue(30017, 2, "action-probability"), 1 / (1 + Math.exp(-1.2 * hidden)), "RNN policy probability");
      approx(numericValue(30017, 3, "parameter-after"), 1 + 0.1 * 0.036, "BPTT update");
    },
    30018: () => {
      const probability = Math.exp(0.2) / (Math.exp(0.2) + Math.exp(0.1));
      approx(numericArray(30018, 1, "discrete-probabilities")[0], probability, "discrete softmax", 1e-3);
      approx(numericValue(30018, 2, "continuous-action"), 0.2 + 0.3 * -0.5, "continuous action sample");
      approx(numericValue(30018, 3, "policy-after"), 0.2 - 0.4 * 0.25, "continuous mean update");
    },
    30019: () => {
      approx(numericValue(30019, 0, "actor-action"), 0.8 * 0.3, "deterministic action");
      const actionGradient = (0.7218 - 0.72) / 0.01;
      approx(numericValue(30019, 2, "action-gradient"), actionGradient, "finite-difference action gradient");
      approx(numericValue(30019, 3, "actor-parameter-after"), 0.8 + 0.4 * actionGradient * 0.5, "DPG update");
    },
    30020: () => {
      approx(numericValue(30020, 1, "action"), 0.1 + 0.35 * 0.514286, "Gaussian action", 1e-6);
      approx(numericValue(30020, 2, "advantage"), 1 - 0.2, "stochastic-policy advantage");
      approx(numericValue(30020, 3, "density-after"), 0.4 + 0.5 * 0.8 * 0.45, "density update");
    },
    30021: () => {
      const creditA = 0.8 - 0.35;
      const creditB = 0.8 - 0.5;
      approx(numericValue(30021, 3, "credit-a"), creditA, "agent A credit");
      approx(numericValue(30021, 3, "policy-a-after"), 0.6 + 0.1 * creditA, "agent A update");
      approx(numericValue(30021, 3, "policy-b-after"), 0.55 + 0.1 * creditB, "agent B update");
    },
    30022: () => {
      approx(numericValue(30022, 2, "actor-a-after"), 0.5 + 0.1 * 0.12, "CTDE actor A update");
      approx(numericValue(30022, 2, "actor-b-after"), 0.55 + 0.1 * 0.09, "CTDE actor B update");
    },
    30023: () => {
      approx(numericValue(30023, 1, "candidate-reward"), 0.1 * 0.8, "IRL reward");
      approx(numericValue(30023, 2, "unnormalized-weight"), Math.exp(0.08), "IRL trajectory weight");
      approx(numericValue(30023, 2, "model-policy"), 1.083287 / 1.77588, "IRL normalized policy", 1e-5);
      const gradient = 0.72 - 0.54 - 0.05 * 0.1;
      approx(numericValue(30023, 4, "reward-parameter-after"), 0.1 + 0.2 * gradient, "IRL update");
    },
    30024: () => {
      const reward = -Math.log(1 - 0.82);
      approx(numericValue(30024, 3, "discriminator-reward"), reward, "GAIL reward");
      approx(numericValue(30024, 4, "policy-after"), 0.32 + 0.08 * reward * 0.328027, "GAIL update");
    },
    30025: () => {
      const advantage = 0.82 - 0.36;
      const ratio = 0.4872 / 0.42;
      const clipped = Math.min(ratio * advantage, Math.min(1.1, Math.max(0.9, ratio)) * advantage);
      approx(numericValue(30025, 2, "ratio"), ratio, "PPO ratio");
      approx(numericValue(30025, 3, "clipped-objective"), clipped, "PPO clipped objective");
      approx(numericValue(30025, 3, "policy-after"), 0.42 + 0.03 * clipped, "PPO update");
    },
    30026: () => {
      const rewards = numericArray(30026, 1, "group-rewards");
      const mean = rewards.reduce((sum, value) => sum + value, 0) / rewards.length;
      const std = Math.sqrt(rewards.reduce((sum, value) => sum + (value - mean) ** 2, 0) / rewards.length);
      approx(numericValue(30026, 1, "group-mean"), mean, "GRPO mean");
      approx(numericValue(30026, 1, "group-std"), std, "GRPO standard deviation", 5e-4);
      const advantage = (0.85 - 0.55) / (0.23 + 1e-6);
      approx(numericValue(30026, 2, "standardized-advantage"), advantage, "GRPO advantage");
    },
    30027: () => {
      const others = numericArray(30027, 2, "other-rewards");
      const sum = others.reduce((total, value) => total + value, 0);
      approx(numericValue(30027, 2, "other-sum"), sum, "RLOO other-sample sum");
      approx(numericValue(30027, 3, "rloo-advantage"), 0.9 - sum / 3, "RLOO advantage");
    },
    30028: () => {
      approx(numericValue(30028, 2, "keep-rate"), 17 / 25, "DAPO keep rate");
      const advantage = (0.9 - 0.44) / 0.7;
      const ratio = 0.56 / 0.5;
      approx(numericValue(30028, 3, "token-advantage"), advantage, "DAPO token advantage");
      approx(numericValue(30028, 3, "token-ratio"), ratio, "DAPO token ratio");
      approx(numericValue(30028, 4, "clipped-objective"), Math.min(ratio * advantage, 1.2 * advantage), "DAPO clipped objective");
      approx(numericValue(30028, 5, "policy-after"), 0.42 + 0.05 * (68.8 / 80), "DAPO update");
    },
    30029: () => {
      const values = numericArray(30029, 3, "function-values");
      const sum = values.reduce((total, value) => total + value, 0);
      approx(numericValue(30029, 3, "value-sum"), sum, "Monte Carlo value sum");
      approx(numericValue(30029, 3, "expectation-estimate"), sum / 4, "Monte Carlo estimate");
    },
    30030: () => {
      const penalty = 0.2 * Math.abs(-0.59 - -0.64);
      approx(numericValue(30030, 2, "kl-penalty"), penalty, "distributed RL KL penalty");
      approx(numericValue(30030, 2, "advantage-batch"), 0.82 - penalty - 0.5, "distributed RL advantage");
    },
    30031: () => {
      const localSizes = numericArray(30031, 2, "local-results");
      const count = localSizes.reduce((sum, value) => sum + value, 0);
      approx(numericValue(30031, 3, "aggregated-results"), count, "worker result aggregation");
      approx(numericValue(30031, 3, "returned-batch"), count, "returned batch size");
    },
    30032: () => {
      const reward = 0.72 - 0.2 * Math.abs(-0.58 - -0.66);
      approx(numericValue(30032, 2, "reward"), reward, "on-policy reward");
      approx(numericValue(30032, 2, "advantage"), reward - 0.524, "on-policy advantage");
    },
    30033: () => approx(numericValue(30033, 3, "logprob-difference"), Math.abs(-0.61 - -0.62), "engine log-prob difference"),
    30034: () => {
      const residual = 0.8 + 0.9 * 0.31 - 0.42;
      approx(numericValue(30034, 2, "td-residual"), residual, "token TD residual");
      approx(numericValue(30034, 3, "gae-advantage"), residual + 0.9 * 0.8 * 0.1, "GAE advantage");
    },
    30035: () => approx(numericValue(30035, 3, "final-reward"), 0.5 * 0.76 + 0.4 * 1 - 0.2 * 0.5, "combined reward"),
    30036: () => {
      const shards = numericArray(30036, 3, "infer-shards");
      approx(numericValue(30036, 3, "infer-checksum"), shards.reduce((sum, value) => sum + value, 0), "reshard checksum");
      approx(numericValue(30036, 2, "rebuilt-devices"), shards.length, "rebuilt device count");
    },
  };

  assert.deepEqual(
    Object.keys(checks).map(Number),
    drlLessonScenes.map(({ lessonId }) => lessonId),
  );
  for (const [id, check] of Object.entries(checks)) {
    assert.doesNotThrow(check, `${id}: reviewed arithmetic failed`);
  }
});

test("distributed LLM RL lessons remain framework-neutral", () => {
  const distributedBlueprints = drlLessonBlueprints.filter(({ id }) => id >= 30030);
  const distributedScenes = drlLessonScenes.filter(({ lessonId }) => lessonId >= 30030);
  assert.doesNotMatch(JSON.stringify({ distributedBlueprints, distributedScenes }), /\bverl\b/i);
  assert.match(drlLessonBlueprints.find(({ id }) => id === 30030)?.misconception ?? "", /不等于某一个框架/);
});

test("30012 subtracts both return and baseline before updating the policy", () => {
  const subtract = frameAt(30012, 2);
  assert.deepEqual(subtract.operation.sourceEntityIds, ["return", "baseline"]);
  assert.deepEqual(subtract.operation.targetEntityIds, ["advantage"]);
  assert.equal(subtract.entityStates.advantage.value, 0.4);
  assert.match(subtract.operation.expression ?? "", /G_t-b\(s_t\)/);

  const update = frameAt(30012, 3);
  assert.deepEqual(update.operation.sourceEntityIds, ["policy-before", "advantage", "policy-step-size"]);
  assert.deepEqual(update.operation.targetEntityIds, ["policy-after"]);
  assert.equal(update.entityStates["policy-after"].value, 0.44);
});

test("30024 computes GAIL reward from the displayed expert probability", () => {
  const rewardFrame = frameAt(30024, 3);
  const discriminator = rewardFrame.entityStates.discriminator.value;
  const reward = rewardFrame.entityStates["discriminator-reward"].value;
  assert.equal(discriminator, 0.82);
  assert.equal(typeof reward, "number");
  assert.ok(Math.abs(reward - -Math.log(1 - 0.82)) < 1e-6);
  assert.deepEqual(rewardFrame.operation.sourceEntityIds, ["discriminator"]);
  assert.deepEqual(rewardFrame.operation.targetEntityIds, ["discriminator-reward"]);
  assert.match(rewardFrame.operation.expression ?? "", /-\\log\(1-D\(s,a\)\)/);

  const policyUpdate = frameAt(30024, 4);
  assert.ok(policyUpdate.operation.sourceEntityIds.includes("discriminator-reward"));
  assert.deepEqual(policyUpdate.operation.targetEntityIds, ["policy-after"]);
  assert.ok(
    Number(policyUpdate.entityStates["policy-after"].value)
      > Number(policyUpdate.entityStates["policy-before"].value),
  );
});

test("30025 shows epsilon and derives the clipped PPO objective", () => {
  const update = frameAt(30025, 3);
  assert.equal(update.entityStates.ratio.value, 1.16);
  assert.equal(update.entityStates.advantage.value, 0.46);
  assert.equal(update.entityStates.epsilon.value, 0.1);
  assert.equal(update.entityStates["clipped-objective"].value, 0.506);
  assert.deepEqual(update.operation.sourceEntityIds, ["ratio", "advantage", "epsilon", "policy-before", "policy-step-size"]);
  assert.deepEqual(update.operation.targetEntityIds, ["clipped-objective", "policy-after"]);
  assert.deepEqual(bindingEntityIds(30025, "\\epsilon"), ["epsilon"]);
});

test("30026 standardizes from reward, mean, deviation, and epsilon then updates policy", () => {
  const normalize = frameAt(30026, 2);
  assert.deepEqual(normalize.operation.sourceEntityIds, ["candidate-reward", "group-mean", "group-std", "stability-epsilon"]);
  assert.deepEqual(normalize.operation.targetEntityIds, ["standardized-advantage"]);
  assert.equal(normalize.entityStates["standardized-advantage"].value, 1.304342);

  const update = frameAt(30026, 3);
  assert.deepEqual(update.operation.sourceEntityIds, ["policy-before", "standardized-advantage", "policy-step-size"]);
  assert.deepEqual(update.operation.targetEntityIds, ["policy-after"]);
});

test("30035 fans one request out to parallel scorers and combines every reward term", () => {
  const parallel = frameAt(30035, 1);
  assert.deepEqual(parallel.operation.sourceEntityIds, ["request"]);
  assert.deepEqual(parallel.operation.targetEntityIds, ["model-score", "rule-score"]);
  assert.deepEqual(
    parallel.transfers.map(({ from, to }) => [from, to]),
    [["request", "model-score"], ["request", "rule-score"]],
  );

  const combine = frameAt(30035, 3);
  assert.deepEqual(combine.operation.sourceEntityIds, [
    "model-score",
    "model-weight",
    "verified-rule-score",
    "rule-weight",
    "kl-weight",
    "kl-divergence",
  ]);
  assert.deepEqual(combine.operation.targetEntityIds, ["final-reward"]);
  assert.equal(combine.entityStates["final-reward"].value, 0.68);
});

test("policy and network update joints mutate the named model state", () => {
  const expectedTargets = new Map<number, string[]>([
    [30004, ["actor-after", "critic-after"]],
    [30012, ["policy-after"]],
    [30014, ["actor-after", "critic-after"]],
    [30025, ["clipped-objective", "policy-after"]],
    [30026, ["policy-after"]],
    [30028, ["normalized-signal", "policy-after"]],
  ]);

  for (const [id, targets] of expectedTargets) {
    assert.deepEqual(frameAt(id, Object.keys(scene(id).framesByJointId).length - 1).operation.targetEntityIds, targets);
  }
});

test("pipeline lane adjacency never invents a causal arrow", () => {
  for (const lesson of drlLessonScenes.filter(({ kind }) => kind === "pipeline")) {
    assert.equal(lesson.kind, "pipeline");
    const declared = new Set(lesson.connections.map(({ from, to }) => `${from}->${to}`));
    for (const lane of lesson.layout.laneIds) {
      const ids = lesson.layout.stageEntityIds.filter((id) => lesson.layout.laneByEntityId[id] === lane);
      for (let index = 1; index < ids.length; index += 1) {
        assert.ok(
          declared.has(`${ids[index - 1]}->${ids[index]}`),
          `${lesson.lessonId}: lane adjacency invents ${ids[index - 1]} -> ${ids[index]}`,
        );
      }
    }
  }
});
