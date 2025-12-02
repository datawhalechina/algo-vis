import { VisualizationStep } from "@/types";

function dotProduct(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += a[i] * b[i];
  }
  return Number(sum.toFixed(4));
}

function softmax(scores: number[]): number[] {
  if (scores.length === 0) return [];
  const maxScore = Math.max(...scores);
  const expScores = scores.map((score) => Math.exp(score - maxScore));
  const total = expScores.reduce((acc, value) => acc + value, 0);
  return expScores.map((value) => Number((value / total).toFixed(4)));
}

function scaleVector(vec: number[], scale: number): number[] {
  return vec.map((value) => Number((value * scale).toFixed(4)));
}

function sumVectors(vectors: number[][]): number[] {
  if (vectors.length === 0) return [];
  const dimension = vectors[0].length;
  const result = new Array(dimension).fill(0);
  vectors.forEach((vector) => {
    vector.forEach((value, idx) => {
      result[idx] += value;
    });
  });
  return result.map((value) => Number(value.toFixed(4)));
}

export function generateVisionAttentionSteps(
  patches: number[][],
  queryIndex: number,
  temperature: number
): VisualizationStep[] {
  const safeTemperature = Math.max(temperature, 0.01);
  const steps: VisualizationStep[] = [];
  const totalPatches = patches.length;
  const safeQueryIndex = Math.min(Math.max(queryIndex, 0), totalPatches - 1);

  if (totalPatches === 0 || patches[0]?.length === 0) {
    steps.push({
      id: 0,
      description: "请输入至少一个有效的 patch 向量。",
      data: { patches, queryIndex: safeQueryIndex, scores: [], weights: [] },
      variables: { queryIndex: safeQueryIndex, finished: true },
    });
    return steps;
  }

  let stepId = 0;
  const queryVector = patches[safeQueryIndex];

  steps.push({
    id: stepId++,
    description: `选择 patch #${safeQueryIndex} 作为 Query（维度 ${queryVector.length}）。`,
    data: { patches, queryIndex: safeQueryIndex },
    variables: { queryIndex: safeQueryIndex, phase: "select-query" },
  });

  const rawScores: number[] = [];
  patches.forEach((vector, keyIndex) => {
    const score = dotProduct(queryVector, vector);
    rawScores.push(score);
    steps.push({
      id: stepId++,
      description: `计算 Query 与 patch #${keyIndex} 的点积：${score.toFixed(
        3
      )}`,
      data: {
        patches,
        queryIndex: safeQueryIndex,
        currentKey: keyIndex,
        score,
      },
      variables: {
        queryIndex: safeQueryIndex,
        currentKey: keyIndex,
        score,
        scores: [...rawScores],
        phase: "dot-product",
      },
    });
  });

  const scaledScores = rawScores.map((score) =>
    Number((score / safeTemperature).toFixed(4))
  );

  steps.push({
    id: stepId++,
    description: `对所有分数除以温度 ${safeTemperature.toFixed(
      2
    )}，控制注意力尖锐程度。`,
    data: { scaledScores },
    variables: {
      scaledScores,
      temperature: safeTemperature,
      phase: "scale",
    },
  });

  const weights = softmax(scaledScores);

  steps.push({
    id: stepId++,
    description: "对缩放分数应用 Softmax，得到注意力权重。",
    data: { weights },
    variables: { weights, scores: rawScores, phase: "softmax" },
  });

  const weightedVectors = patches.map((vector, idx) =>
    scaleVector(vector, weights[idx] || 0)
  );
  const contextVector = sumVectors(weightedVectors);

  steps.push({
    id: stepId++,
    description: "使用注意力权重对所有 patch 向量加权求和，得到上下文向量。",
    data: { contextVector, weightedVectors },
    variables: {
      weights,
      contextVector,
      phase: "context",
    },
  });

  steps.push({
    id: stepId++,
    description: "完成注意力计算，可观察权重分布与最终上下文向量。",
    data: { contextVector, weights, finished: true },
    variables: {
      weights,
      scores: rawScores,
      contextVector,
      finished: true,
    },
  });

  return steps;
}
