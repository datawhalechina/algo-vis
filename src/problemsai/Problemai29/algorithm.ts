import { VisualizationStep } from "@/types";

function relu(x: number): number {
  return Math.max(0, x);
}

function applyConv(input: number[], weights: number[], bias: number): number[] {
  return input.map((val, i) => {
    const w = weights[i % weights.length];
    return Number((val * w + bias / input.length).toFixed(4));
  });
}

export function generateResidualSteps(
  input: number[],
  convWeights1: number[],
  convWeights2: number[],
  useProjection: boolean
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  if (input.length === 0) {
    steps.push({
      id: stepId++,
      description: "请输入有效的输入向量。",
      data: { input },
      variables: { finished: true },
    });
    return steps;
  }

  steps.push({
    id: stepId++,
    description: `初始化：输入维度 ${input.length}，残差块包含两层卷积`,
    data: { input, convWeights1, convWeights2 },
    variables: { inputDim: input.length, phase: "init" },
  });

  const shortcut = [...input];
  steps.push({
    id: stepId++,
    description: "创建跳跃连接（shortcut），直接保存输入",
    data: { input, shortcut },
    variables: { shortcut, phase: "shortcut" },
  });

  const conv1Out = applyConv(input, convWeights1, 0.1);
  steps.push({
    id: stepId++,
    description: "第一层卷积：F₁(x) = Conv(x)",
    data: { input, conv1Out, shortcut },
    variables: { conv1Out, phase: "conv1" },
  });

  const relu1Out = conv1Out.map((v) => relu(v));
  steps.push({
    id: stepId++,
    description: "ReLU 激活：ReLU(F₁(x))",
    data: { conv1Out, relu1Out, shortcut },
    variables: { relu1Out, phase: "relu1" },
  });

  const conv2Out = applyConv(relu1Out, convWeights2, 0.05);
  steps.push({
    id: stepId++,
    description: "第二层卷积：F₂(ReLU(F₁(x)))",
    data: { relu1Out, conv2Out, shortcut },
    variables: { conv2Out, phase: "conv2" },
  });

  let finalShortcut = shortcut;
  if (useProjection) {
    finalShortcut = shortcut.map((v) => Number((v * 1.1).toFixed(4)));
    steps.push({
      id: stepId++,
      description: "投影层：当维度不匹配时，对 shortcut 进行 1×1 卷积",
      data: { shortcut, finalShortcut },
      variables: { finalShortcut, phase: "projection" },
    });
  }

  const residualSum = conv2Out.map((v, i) =>
    Number((v + finalShortcut[i]).toFixed(4))
  );
  steps.push({
    id: stepId++,
    description: "残差相加：F(x) + x",
    data: { conv2Out, finalShortcut, residualSum },
    variables: { residualSum, phase: "add" },
  });

  const output = residualSum.map((v) => relu(v));
  steps.push({
    id: stepId++,
    description: "最终 ReLU：output = ReLU(F(x) + x)",
    data: { residualSum, output },
    variables: { output, phase: "final_relu" },
  });

  steps.push({
    id: stepId++,
    description: "残差块计算完成！梯度可以通过跳跃连接直接传播。",
    data: { input, output, shortcut: finalShortcut },
    variables: { input, output, finished: true, phase: "done" },
  });

  return steps;
}
