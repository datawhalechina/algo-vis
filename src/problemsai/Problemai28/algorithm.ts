import { VisualizationStep } from "@/types";

export function generateBatchNormSteps(
  batch: number[][],
  gamma: number,
  beta: number,
  epsilon: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const batchSize = batch.length;
  const featureDim = batch[0]?.length || 0;

  if (batchSize === 0 || featureDim === 0) {
    steps.push({
      id: stepId++,
      description: "请输入有效的批次数据。",
      data: { batch },
      variables: { finished: true },
    });
    return steps;
  }

  steps.push({
    id: stepId++,
    description: `初始化：批次大小 ${batchSize}，特征维度 ${featureDim}，γ=${gamma}，β=${beta}`,
    data: { batch, gamma, beta, epsilon },
    variables: { batchSize, featureDim, gamma, beta, epsilon, phase: "init" },
  });

  const means: number[] = [];
  for (let d = 0; d < featureDim; d++) {
    let sum = 0;
    for (let b = 0; b < batchSize; b++) {
      sum += batch[b][d];
    }
    means.push(Number((sum / batchSize).toFixed(4)));
  }

  steps.push({
    id: stepId++,
    description: `计算每个特征维度的均值：μ = [${means.map((m) => m.toFixed(3)).join(", ")}]`,
    data: { batch, means },
    variables: { means, phase: "mean" },
  });

  const variances: number[] = [];
  for (let d = 0; d < featureDim; d++) {
    let sumSq = 0;
    for (let b = 0; b < batchSize; b++) {
      const diff = batch[b][d] - means[d];
      sumSq += diff * diff;
    }
    variances.push(Number((sumSq / batchSize).toFixed(4)));
  }

  steps.push({
    id: stepId++,
    description: `计算每个特征维度的方差：σ² = [${variances.map((v) => v.toFixed(3)).join(", ")}]`,
    data: { batch, means, variances },
    variables: { means, variances, phase: "variance" },
  });

  const normalized: number[][] = batch.map((sample) =>
    sample.map((val, d) => {
      const norm = (val - means[d]) / Math.sqrt(variances[d] + epsilon);
      return Number(norm.toFixed(4));
    })
  );

  steps.push({
    id: stepId++,
    description: "标准化：x̂ = (x - μ) / √(σ² + ε)，使每个特征均值为0，方差为1",
    data: { batch, means, variances, normalized },
    variables: { means, variances, normalized, phase: "normalize" },
  });

  const output: number[][] = normalized.map((sample) =>
    sample.map((val) => Number((gamma * val + beta).toFixed(4)))
  );

  steps.push({
    id: stepId++,
    description: `缩放和平移：y = γ × x̂ + β，γ=${gamma}，β=${beta}`,
    data: { batch, means, variances, normalized, output, gamma, beta },
    variables: { means, variances, normalized, output, gamma, beta, phase: "scale" },
  });

  steps.push({
    id: stepId++,
    description: "批量归一化完成！输出已经过标准化、缩放和平移。",
    data: { batch, means, variances, normalized, output },
    variables: { means, variances, normalized, output, phase: "done", finished: true },
  });

  return steps;
}
