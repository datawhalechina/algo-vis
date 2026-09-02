import assert from "node:assert/strict";
import test from "node:test";
import katex from "katex";

import { aiLessonBlueprints } from "../src/config/aiLessonBlueprints/index.ts";
import { cnnSceneProfiles } from "../src/config/lessonScenes/ai/cnn.ts";
import { diffusionSceneProfiles } from "../src/config/lessonScenes/ai/diffusion.ts";
import { ganSceneProfiles } from "../src/config/lessonScenes/ai/gan.ts";
import { gnnSceneProfiles } from "../src/config/lessonScenes/ai/gnn.ts";
import {
  evaluateDebugAssertion,
  type LessonSceneFrame,
  type LessonSceneSpec,
  type SceneValue,
  validateLessonScene,
} from "../src/config/lessonSceneTypes.ts";
import { getAiLessonScene } from "../src/config/lessonScenes/ai/index.ts";
import {
  AI_LESSON_IDS,
  type AiLessonId,
  type AiSceneProfile,
} from "../src/config/lessonScenes/ai/profile.ts";
import { rnnSceneProfiles } from "../src/config/lessonScenes/ai/rnn.ts";
import { transformerSceneProfiles } from "../src/config/lessonScenes/ai/transformer.ts";
import { vaeSceneProfiles } from "../src/config/lessonScenes/ai/vae.ts";

const profileById = {
  ...cnnSceneProfiles,
  ...rnnSceneProfiles,
  ...transformerSceneProfiles,
  ...gnnSceneProfiles,
  ...diffusionSceneProfiles,
  ...ganSceneProfiles,
  ...vaeSceneProfiles,
} as Record<AiLessonId, AiSceneProfile>;

function scene(id: number): LessonSceneSpec {
  const value = getAiLessonScene(id);
  assert.ok(value, `missing AI scene ${id}`);
  return value;
}

function frame(id: number, index: number): LessonSceneFrame {
  const blueprint = aiLessonBlueprints.find((candidate) => candidate.id === id);
  assert.ok(blueprint, `missing AI blueprint ${id}`);
  const joint = blueprint.flow[index];
  assert.ok(joint, `missing AI flow joint ${id}/${index}`);
  return scene(id).framesByJointId[joint.id];
}

function entityId(id: number, label: string): string {
  const entity = scene(id).entities.find((candidate) => candidate.label === label);
  assert.ok(entity, `${id}: missing entity labeled ${label}`);
  return entity.id;
}

function value(id: number, frameIndex: number, label: string): SceneValue | undefined {
  return frame(id, frameIndex).entityStates[entityId(id, label)].value;
}

function operationLabels(id: number, frameIndex: number, side: "source" | "target"): string[] {
  const currentScene = scene(id);
  const currentFrame = frame(id, frameIndex);
  const ids = side === "source"
    ? currentFrame.operation.sourceEntityIds
    : currentFrame.operation.targetEntityIds;
  return ids.map((candidate) => {
    const entity = currentScene.entities.find(({ id: entityIdValue }) => entityIdValue === candidate);
    assert.ok(entity, `${id}: unknown ${side} ${candidate}`);
    return entity.label;
  });
}

function transferRoutes(id: number, frameIndex: number): string[] {
  return frame(id, frameIndex).transfers
    .map(({ from, to }) => `${from} -> ${to}`)
    .sort();
}

function canvasValueSignature(currentFrame: LessonSceneFrame): string {
  return JSON.stringify(Object.fromEntries(
    Object.entries(currentFrame.entityStates)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([id, state]) => [id, {
        value: state.value,
        visible: state.visible,
        position: state.position,
      }]),
  ));
}

function bindingLabels(id: number, symbol: string): string[] {
  const currentScene = scene(id);
  const binding = currentScene.formulaBindings.find((candidate) => candidate.symbol === symbol);
  assert.ok(binding, `${id}: missing formula binding for ${symbol}`);
  return binding.entityIds.map((boundId) => {
    const entity = currentScene.entities.find((candidate) => candidate.id === boundId);
    assert.ok(entity, `${id}: binding ${symbol} references ${boundId}`);
    return entity.label;
  });
}

test("all 63 AI scenes satisfy the shared scene contract", () => {
  assert.equal(AI_LESSON_IDS.length, 63);
  for (const id of AI_LESSON_IDS) {
    const blueprint = aiLessonBlueprints.find((candidate) => candidate.id === id);
    assert.ok(blueprint, `missing AI blueprint ${id}`);
    assert.deepEqual(validateLessonScene(blueprint, scene(id)), [], `${id}: invalid AI scene`);
  }
});

test("AI frames change values on the rendered canvas at every adjacent joint", () => {
  for (const id of AI_LESSON_IDS) {
    const blueprint = aiLessonBlueprints.find((candidate) => candidate.id === id);
    assert.ok(blueprint);
    const frames = blueprint.flow.map((joint) => scene(id).framesByJointId[joint.id]);
    for (let index = 1; index < frames.length; index += 1) {
      assert.notEqual(
        canvasValueSignature(frames[index - 1]),
        canvasValueSignature(frames[index]),
        `${id}: adjacent joints ${index - 1} and ${index} leave every canvas value unchanged`,
      );
    }
  }
});

test("distribution layouts contain every numeric value shown by their frames", () => {
  for (const id of AI_LESSON_IDS) {
    const currentScene = scene(id);
    if (currentScene.kind !== "distribution") continue;
    const [minimum, maximum] = currentScene.layout.yDomain;
    for (const currentFrame of Object.values(currentScene.framesByJointId)) {
      for (const [currentEntityId, state] of Object.entries(currentFrame.entityStates)) {
        if (typeof state.value !== "number") continue;
        assert.ok(
          state.value >= minimum && state.value <= maximum,
          `${id}/${currentFrame.jointId}: ${currentEntityId}=${state.value} lies outside [${minimum}, ${maximum}]`,
        );
      }
    }
  }
});

test("every AI frame reads inputs and transfer payloads from its pre-operation snapshot", () => {
  for (const id of AI_LESSON_IDS) {
    const currentScene = scene(id);
    const blueprint = aiLessonBlueprints.find((candidate) => candidate.id === id);
    assert.ok(blueprint);
    const profile = profileById[id];
    const valuesBeforeStep = new Map(
      currentScene.entities.map((entity, index) => [entity.id, structuredClone(profile.sampleValues[index])]),
    );

    for (const joint of blueprint.flow) {
      const currentFrame = currentScene.framesByJointId[joint.id];
      const outputIds = new Set(currentFrame.outputs.map(({ entityId: outputId }) => outputId));

      for (const input of currentFrame.inputs) {
        assert.deepEqual(
          input.value,
          valuesBeforeStep.get(input.entityId),
          `${id}/${joint.id}: ${input.label} is not the value visible before the operation`,
        );
      }
      for (const transfer of currentFrame.transfers) {
        const input = currentFrame.inputs.find(({ entityId: inputId }) => inputId === transfer.from);
        assert.ok(input, `${id}/${joint.id}: transfer ${transfer.id} has no frame input`);
        assert.deepEqual(
          transfer.payload,
          input.value,
          `${id}/${joint.id}: transfer ${transfer.id} does not carry its input snapshot`,
        );
      }

      for (const output of currentFrame.outputs) valuesBeforeStep.set(output.entityId, output.value);
      for (const entity of currentScene.entities) {
        assert.deepEqual(
          currentFrame.entityStates[entity.id].value,
          valuesBeforeStep.get(entity.id),
          `${id}/${joint.id}: ${entity.label} is not the post-operation state`,
        );
        if (outputIds.has(entity.id)) {
          assert.deepEqual(
            currentFrame.outputs.find(({ entityId: outputId }) => outputId === entity.id)?.value,
            currentFrame.entityStates[entity.id].value,
            `${id}/${joint.id}: ${entity.label} output differs from post-operation state`,
          );
        }
      }
    }
  }
});

test("multi-target routes preserve pairing, shared broadcasts, and real reductions without false crosses", () => {
  assert.deepEqual(transferRoutes(10076, 1), [
    "B 输入值 -> B 通道空间响应",
    "G 输入值 -> G 通道空间响应",
    "depthwise 核边长 K -> B 通道空间响应",
    "depthwise 核边长 K -> G 通道空间响应",
  ]);
  assert.deepEqual(transferRoutes(10102, 1), [
    "节点 A -> A 含自环的度数",
    "邻居 B -> B 的新度数",
  ]);
  assert.deepEqual(transferRoutes(10105, 1), [
    "中心节点 A -> 边 A-B 分数",
    "中心节点 A -> 边 A-C 分数",
    "投影后的邻居 B -> 边 A-B 分数",
    "投影后的邻居 C -> 边 A-C 分数",
  ]);
  assert.deepEqual(transferRoutes(10086, 1), [
    "GRU 门集合 -> GRU 门数",
    "LSTM 门集合 -> LSTM 门数",
  ]);

  assert.deepEqual(transferRoutes(10094, 0), [
    "输入表示 H -> K 头 1",
    "输入表示 H -> Q 头 1",
    "输入表示 H -> V 头 1",
  ]);
  assert.deepEqual(transferRoutes(10105, 2), [
    "边 A-B 分数 -> 边 A-B 权重",
    "边 A-B 分数 -> 边 A-C 权重",
    "边 A-C 分数 -> 边 A-B 权重",
    "边 A-C 分数 -> 边 A-C 权重",
  ]);
});

test("documented AI numeric examples agree with their labels and formulas", () => {
  const channelMix = frame(10076, 2);
  const channelResponses = [
    value(10076, 2, "R 通道空间响应"),
    value(10076, 2, "G 通道空间响应"),
    value(10076, 2, "B 通道空间响应"),
  ];
  const channelWeights = value(10076, 2, "1x1 混合权重向量");
  assert.ok(Array.isArray(channelWeights));
  assert.equal(
    value(10076, 2, "1x1 混合累加器"),
    channelResponses.reduce(
      (sum, response, index) => sum + Number(response) * Number(channelWeights[index]),
      0,
    ),
  );
  assert.match(channelMix.operation.expression ?? "", /3.*4.*5.*14/);

  const temporalWindow = value(10080, 0, "时间窗口 t-1:t+1");
  const temporalKernel = value(10080, 0, "时间核 K");
  const temporalChannels = value(10080, 0, "输入通道数");
  assert.equal(temporalWindow, 3);
  assert.equal(temporalKernel, temporalWindow);
  assert.equal(
    value(10080, 0, "窗口输入标量数"),
    Number(temporalKernel) * Number(temporalChannels),
  );

  const firstLayerField = value(10081, 4, "第 1 层覆盖");
  const firstLayerJump = value(10081, 4, "跳距 j1");
  const secondKernel = value(10081, 4, "第 2 层核宽");
  assert.equal(secondKernel, 3);
  assert.equal(
    value(10081, 4, "目标层感受野"),
    Number(firstLayerField) + (Number(secondKernel) - 1) * Number(firstLayerJump),
  );

  const seq2seqStart = frame(10088, 2).inputs.find(({ label }) => label === "起始符 BOS");
  assert.equal(seq2seqStart?.value, 1);

  const positionalFrame = frame(10093, 2);
  const positionInputs = Object.fromEntries(
    positionalFrame.inputs.map((datum) => [datum.label, datum.value]),
  );
  const angle = Number(positionInputs["token 位置 p"])
    * Number(positionInputs["频率尺度"]);
  assert.deepEqual(value(10093, 2, "sin/cos 分量"), [
    Number(Math.sin(angle).toFixed(2)),
    Number(Math.cos(angle).toFixed(2)),
  ]);

  const postLayerNorm = frame(10096, 4);
  const layerNormInputs = Object.fromEntries(
    postLayerNorm.inputs.map((datum) => [datum.label, datum.value]),
  );
  const normalized = Number(layerNormInputs["缩放系数 gamma"])
    * (Number(layerNormInputs["Post-LN 残差和"]) - Number(layerNormInputs["均值 mu"]))
    / Math.sqrt(Number(layerNormInputs["方差 sigma2"]) + Number(layerNormInputs["稳定项 epsilon"]))
    + Number(layerNormInputs["平移参数 beta"]);
  assert.ok(Math.abs(Number(value(10096, 4, "Post-LN 输出")) - normalized) < 0.001);

  assert.equal(value(10099, 0, "平滑目标概率"), 0.9);
  assert.equal(value(10099, 1, "微批梯度和"), 0.25);
  assert.equal(value(10099, 2, "优化器更新次数"), 1);
  assert.equal(value(10099, 3, "warmup 学习率"), 0.0004);

  const compute = value(10101, 0, "计算预算 C");
  const parameters = value(10101, 1, "候选参数量 N");
  const tokens = value(10101, 2, "匹配 token 数 D");
  assert.equal(compute, 5760);
  assert.equal(parameters, 12);
  assert.equal(tokens, 80);
  assert.equal(compute, 6 * Number(parameters) * Number(tokens));
  assert.equal(value(10101, 4, "边际收益"), 0.06);
  assert.equal(value(10101, 4, "所选候选编号"), 1);

  assert.equal(value(10112, 0, "累计信号 alpha-bar"), 0.98);
  assert.equal(value(10112, 1, "去噪一致性"), 0.73);
  assert.equal(value(10112, 2, "训练预算比例"), 1);

  assert.equal(value(10113, 1, "采样器分支数"), 4);
  assert.equal(value(10113, 2, "预算使用率"), 1);
  assert.equal(value(10113, 3, "速度分"), 0.74);
  assert.equal(value(10113, 4, "质量分"), 0.82);

  const coraLoss = frame(10103, 2);
  const coraInputs = Object.fromEntries(
    coraLoss.inputs.map((datum) => [datum.label, datum.value]),
  );
  assert.equal(
    value(10103, 2, "训练损失"),
    Number((
      -Number(coraInputs["真实标签 y_vc"])
      * Math.log(Number(coraInputs["训练节点预测概率 p_vc"]))
    ).toFixed(2)),
  );

  const vaeMean = value(10127, 3, "后验均值 mu");
  const vaeLogVariance = value(10127, 3, "后验 log-variance");
  const vaeSigma = value(10127, 3, "标准差 sigma");
  const vaeNoise = value(10127, 3, "标准噪声 epsilon");
  assert.equal(vaeMean, 0.4);
  assert.ok(Math.abs(Math.exp(0.5 * Number(vaeLogVariance)) - Number(vaeSigma)) < 1e-6);
  assert.equal(
    value(10127, 3, "潜样本 z"),
    Number(vaeMean) + Number(vaeSigma) * Number(vaeNoise),
  );
});

test("formula symbols bind to the entities that carry their meanings", () => {
  assert.deepEqual(bindingLabels(10072, "X"), ["原始输入 X", "3x3 输入窗口"]);
  assert.deepEqual(bindingLabels(10072, "W"), ["卷积核 W"]);
  assert.deepEqual(bindingLabels(10072, "Y_{i,j,o}"), ["输出 Y(0,0)"]);
  assert.deepEqual(bindingLabels(10072, "S_h,S_w"), ["水平步长", "垂直步长"]);
  assert.deepEqual(bindingLabels(10073, "P_{left},P_{right}"), ["两侧填充总量"]);
  assert.deepEqual(bindingLabels(10076, "K"), ["depthwise 核边长 K"]);
  assert.deepEqual(bindingLabels(10076, "C_{out}"), ["输出通道数 C_out"]);
  assert.deepEqual(bindingLabels(10076, "H,W"), ["输出高度 H", "输出宽度 W"]);
  assert.deepEqual(bindingLabels(10086, "N_{LSTM}"), ["LSTM 参数量"]);
  assert.deepEqual(bindingLabels(10086, "N_{GRU}"), ["GRU 参数量"]);
  assert.deepEqual(bindingLabels(10105, "\\alpha_{ij}^{(r)}"), ["边 A-B 权重", "边 A-C 权重"]);
  assert.deepEqual(bindingLabels(10096, "\\varepsilon"), ["稳定项 epsilon"]);
  assert.deepEqual(
    bindingLabels(10096, "\\gamma,\\beta"),
    ["缩放系数 gamma", "平移参数 beta"],
  );
  assert.deepEqual(bindingLabels(10096, "d"), ["隐藏维度 d"]);
  assert.deepEqual(bindingLabels(10103, "V_{\\mathrm{train}}"), ["训练节点集合 V_train"]);
  assert.deepEqual(bindingLabels(10103, "C"), ["类别数 C"]);
  assert.deepEqual(bindingLabels(10103, "y_{vc}"), ["真实标签 y_vc"]);
  assert.deepEqual(bindingLabels(10103, "p_{vc}"), ["训练节点预测概率 p_vc"]);
  assert.deepEqual(bindingLabels(10127, "\\mu_\\phi(x)"), ["后验均值 mu"]);
  assert.deepEqual(bindingLabels(10127, "\\log\\sigma_\\phi^2(x)"), ["后验 log-variance"]);
  assert.deepEqual(
    bindingLabels(10127, "\\sigma_\\phi(x)"),
    ["后验 log-variance", "标准差 sigma"],
  );

  assert.deepEqual(bindingLabels(10134, "o_t"), ["高维观测 o_t"]);
  assert.deepEqual(bindingLabels(10134, "z_t"), ["观测后验 z_t"]);
  assert.deepEqual(bindingLabels(10134, "a_t"), ["策略动作 a_t"]);
  assert.deepEqual(
    bindingLabels(10134, "\\mu_t^{\\mathrm{prior}},\\sigma_t^{\\mathrm{prior}}"),
    ["动力学先验"],
  );
  assert.deepEqual(bindingLabels(10134, "D_{\\mathrm{KL}}(q_\\phi\\|p_\\psi)"), ["KL/价值监督"]);
});

test("multi-phase lessons keep distinct semantic quantities on distinct entities", () => {
  const targetLabels = (id: number, frameIndex: number) => operationLabels(id, frameIndex, "target");

  assert.deepEqual(targetLabels(10088, 1), ["解码初始状态"]);
  assert.deepEqual(targetLabels(10088, 2), ["当前预测 token"]);
  assert.deepEqual(targetLabels(10076, 2), ["1x1 混合累加器"]);
  assert.deepEqual(targetLabels(10076, 3), ["目标通道输出 O"]);
  assert.deepEqual(targetLabels(10086, 1), ["LSTM 门数", "GRU 门数"]);
  assert.deepEqual(targetLabels(10086, 2), ["LSTM 参数量", "GRU 参数量"]);
  assert.deepEqual(targetLabels(10103, 0), ["标准化输入特征"]);
  assert.deepEqual(targetLabels(10103, 6), ["误判节点数"]);
  assert.deepEqual(targetLabels(10106, 0), ["训练边数", "留出边数"]);
  assert.deepEqual(targetLabels(10106, 6), ["ROC-AUC"]);
  assert.deepEqual(targetLabels(10107, 0), ["节点嵌入 Z"]);
  assert.deepEqual(targetLabels(10107, 6), ["对照准确率差"]);
  assert.deepEqual(targetLabels(10129, 0), ["训练后验集中度"]);
  assert.deepEqual(targetLabels(10129, 5), ["同条件多样性诊断"]);
  assert.deepEqual(targetLabels(10130, 0), ["连续编码 z_e"]);
  assert.deepEqual(targetLabels(10130, 5), ["码本命中健康度"]);
});

test("AI input-loading joints move values from explicit source entities", () => {
  assert.deepEqual(transferRoutes(10082, 0), ["序列输入样本 -> 当前输入 x_t"]);
  assert.deepEqual(transferRoutes(10082, 1), ["历史状态缓存 -> 上一状态 h_(t-1)"]);
  assert.deepEqual(transferRoutes(10083, 0), ["初始零状态 -> 初始状态 h0"]);
  assert.deepEqual(transferRoutes(10083, 1), ["输入 token 样本 -> 当前 token x_t"]);
});

test("representative AI operations expose their real operands, branches, and equations", () => {
  assert.deepEqual(
    operationLabels(10072, 2, "source"),
    ["3x3 输入窗口", "卷积核 W", "偏置 b"],
  );
  const convolutionInputs = frame(10072, 2).inputs.map(({ value: inputValue }) => inputValue);
  const [windowValues, kernelValues, bias] = convolutionInputs;
  assert.ok(Array.isArray(windowValues));
  assert.ok(Array.isArray(kernelValues));
  const convolutionTotal = windowValues.reduce(
    (sum, inputValue, index) => sum + Number(inputValue) * Number(kernelValues[index]),
    Number(bias),
  );
  assert.equal(convolutionTotal, value(10072, 2, "乘加累加器"));
  assert.match(frame(10072, 2).operation.expression ?? "", /5/);
  assert.equal(frame(10072, 2).transfers.length, 3);

  assert.deepEqual(
    operationLabels(10078, 3, "source"),
    ["残差 F(X)", "投影 P(X)"],
  );
  assert.deepEqual(
    frame(10078, 3).transfers.map(({ payload }) => payload),
    [-1, 2],
  );
  assert.match(frame(10078, 3).operation.expression ?? "", /-1.*2.*1/);

  assert.deepEqual(
    operationLabels(10094, 0, "target"),
    ["Q 头 1", "K 头 1", "V 头 1"],
  );
  assert.equal(frame(10094, 0).transfers.length, 3);

  assert.ok(operationLabels(10102, 3, "source").length >= 2);
  assert.ok(frame(10102, 3).transfers.length >= 2);
  const gcnScene = scene(10102);
  assert.ok(gcnScene.connections.some(({ from, to }) => from === to), "GCN scene needs a self-loop");
  assert.ok(gcnScene.connections.some(({ from }) =>
    gcnScene.connections.filter((connection) => connection.from === from).length > 1
  ), "GCN scene needs branching graph adjacency");

  assert.deepEqual(
    frame(10105, 2).outputs.map(({ label, value: outputValue }) => [label, outputValue]),
    [["边 A-B 权重", 0.79], ["边 A-C 权重", 0.21]],
  );
  assert.match(frame(10105, 2).operation.expression ?? "", /0\.79.*0\.21.*1/);

  assert.deepEqual(
    frame(10113, 1).outputs.map(({ label }) => label),
    ["采样器分支数", "DDIM 分支", "DPM++ 分支", "Heun 分支", "Euler 分支"],
  );
  assert.equal(frame(10113, 1).transfers.length, 5);

  assert.deepEqual(
    operationLabels(10127, 3, "source"),
    ["后验均值 mu", "标准差 sigma", "标准噪声 epsilon"],
  );
  assert.match(frame(10127, 3).operation.expression ?? "", /0\.4.*0\.6.*0\.25.*0\.55/);

  assert.deepEqual(
    operationLabels(10134, 2, "source"),
    ["观测后验 z_t", "策略动作 a_t"],
  );
  assert.deepEqual(
    operationLabels(10134, 3, "source"),
    ["观测后验 z_t", "动力学先验"],
  );
  assert.deepEqual(operationLabels(10134, 0, "source"), ["高维观测 o_t"]);

  const optimizerUpdate = frame(10099, 2).operation.expression ?? "";
  assert.match(optimizerUpdate, /微批梯度和/);
  assert.match(optimizerUpdate, /0\.25/);
  assert.match(optimizerUpdate, /累计后执行一次更新/);
  assert.match(optimizerUpdate, /优化器更新次数/);
  assert.match(optimizerUpdate, /1/);
});

test("all AI lessons carry visible equations and independently named debug invariants", () => {
  for (const id of AI_LESSON_IDS) {
    const currentScene = scene(id);
    const frames = Object.values(currentScene.framesByJointId);
    assert.ok(frames.some((currentFrame) =>
      currentFrame.operation.sourceEntityIds.length > 1
      || currentFrame.operation.targetEntityIds.length > 1
      || currentScene.connections.some(({ from }) =>
        currentScene.connections.filter((connection) => connection.from === from).length > 1
      )
    ), `${id}: every operation still forms a single-input linear chain`);

    for (const currentFrame of frames) {
      assert.ok(
        currentFrame.operation.expression,
        `${id}/${currentFrame.jointId}: operation has no visible expression`,
      );
      assert.doesNotMatch(
        currentFrame.operation.expression!,
        /\)\+\\text\{/,
        `${id}/${currentFrame.jointId}: generic expression falsely presents all inputs as a sum`,
      );
      assert.doesNotThrow(() => katex.renderToString(currentFrame.operation.expression!, {
        throwOnError: true,
        strict: "error",
      }), `${id}/${currentFrame.jointId}: operation expression is not strict KaTeX`);
      for (const assertion of currentFrame.debugAssertions) {
        assert.doesNotMatch(assertion.label, /^核对 /, `${id}/${currentFrame.jointId}: generated tautology label`);
        assert.equal(
          evaluateDebugAssertion(assertion, currentFrame.entityStates[assertion.entityId]),
          true,
          `${id}/${currentFrame.jointId}: shipped observation violates its independent invariant`,
        );

        if (assertion.operator === "eq" || assertion.operator === "approx") {
          const altered = structuredClone(currentFrame.entityStates[assertion.entityId]);
          altered.value = typeof altered.value === "number" ? altered.value + 1 : "错误值";
          assert.equal(
            evaluateDebugAssertion(assertion, altered),
            false,
            `${id}/${currentFrame.jointId}: invariant accepts an altered observation`,
          );
        }
      }
    }
  }

  const fallbackExpression = frame(10073, 0).operation.expression ?? "";
  assert.match(fallbackExpression, /卷积核 K/);
  assert.match(fallbackExpression, /空洞率 D/);
  assert.match(fallbackExpression, /\\xrightarrow/);
  assert.match(fallbackExpression, /有效卷积核/);
  assert.match(fallbackExpression, /3/);
  assert.match(fallbackExpression, /1/);
});

test("representative arithmetic debug assertions are derived from frame inputs", () => {
  const outputAssertion = (id: number, frameIndex: number, label: string) => {
    const currentFrame = frame(id, frameIndex);
    const output = currentFrame.outputs.find((datum) => datum.label === label);
    assert.ok(output, `${id}/${frameIndex}: missing output ${label}`);
    const debugAssertion = currentFrame.debugAssertions.find(({ entityId: assertionId }) =>
      assertionId === output.entityId
    );
    assert.ok(debugAssertion, `${id}/${frameIndex}: missing assertion for ${label}`);
    assert.match(
      debugAssertion.label,
      /^由本帧输入复算：/,
      `${id}/${frameIndex}: ${label} assertion is not identified as input-derived`,
    );
    return debugAssertion;
  };

  const convolution = frame(10072, 2);
  const [windowValues, kernelValues, bias] = convolution.inputs.map(({ value: inputValue }) => inputValue);
  assert.ok(Array.isArray(windowValues));
  assert.ok(Array.isArray(kernelValues));
  const convolutionExpected = windowValues.reduce(
    (sum, inputValue, index) => sum + Number(inputValue) * Number(kernelValues[index]),
    Number(bias),
  );
  assert.equal(outputAssertion(10072, 2, "乘加累加器").expected, convolutionExpected);

  const temporalInputs = Object.fromEntries(
    frame(10080, 0).inputs.map((datum) => [datum.label, datum.value]),
  );
  assert.equal(
    outputAssertion(10080, 0, "窗口输入标量数").expected,
    Number(temporalInputs["时间核 K"]) * Number(temporalInputs["输入通道数"]),
  );

  const receptiveInputs = Object.fromEntries(
    frame(10081, 4).inputs.map((datum) => [datum.label, datum.value]),
  );
  assert.equal(
    outputAssertion(10081, 4, "目标层感受野").expected,
    Number(receptiveInputs["第 1 层覆盖"])
      + (Number(receptiveInputs["第 2 层核宽"]) - 1) * Number(receptiveInputs["跳距 j1"]),
  );

  const sigmaInput = frame(10127, 1).inputs[0].value;
  assert.ok(Math.abs(
    Number(outputAssertion(10127, 1, "标准差 sigma").expected)
      - Math.exp(0.5 * Number(sigmaInput)),
  ) < 1e-6);
  const sampleInputs = Object.fromEntries(
    frame(10127, 3).inputs.map((datum) => [datum.label, datum.value]),
  );
  assert.equal(
    outputAssertion(10127, 3, "潜样本 z").expected,
    Number(sampleInputs["后验均值 mu"])
      + Number(sampleInputs["标准差 sigma"]) * Number(sampleInputs["标准噪声 epsilon"]),
  );
});
