import { VisualizationStep } from "@/types";

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export interface AttentionNLPSample {
  encoderTokens: string[];
  decoderToken: string;
  encoderStates: number[][];
  decoderState: number[];
}

export const DEFAULT_ATTENTION_SAMPLE: AttentionNLPSample = {
  encoderTokens: ["I", "love", "deep", "learning"],
  decoderToken: "我",
  encoderStates: [
    [0.8, 0.2, 0.1, 0.5],
    [0.3, 0.9, 0.4, 0.2],
    [0.5, 0.6, 0.8, 0.3],
    [0.2, 0.4, 0.7, 0.9],
  ],
  decoderState: [0.7, 0.5, 0.3, 0.6],
};

export function generateAttentionNLPSteps(sample: AttentionNLPSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const { encoderTokens, decoderToken, encoderStates, decoderState } = sample;
  const n = encoderTokens.length;
  const dim = decoderState.length;

  steps.push({
    id: stepId++,
    description: `初始化 Bahdanau 注意力机制：编码器共 ${n} 个时间步（${encoderTokens.join(", ")}），解码器当前状态为 s = [${decoderState.map((v) => v.toFixed(2)).join(", ")}]，即将生成 "${decoderToken}"`,
    data: { sample },
    variables: { phase: "init", sample, encoderTokens, decoderToken, encoderStates, decoderState },
  });

  const eScores: number[] = [];
  for (let i = 0; i < n; i++) {
    const h = encoderStates[i];
    const score = Number(h.reduce((s, v, d) => s + v * decoderState[d], 0).toFixed(4));
    eScores.push(score);

    steps.push({
      id: stepId++,
      description: `计算注意力分数 e_{${i}} = \\text{score}(h_{${i}}, s) = h_{${i}} \\cdot s = ${score.toFixed(4)}（对应编码器词 "${encoderTokens[i]}"）`,
      data: { h, score, encoderIdx: i },
      variables: {
        phase: "score",
        currentIdx: i,
        eScores: [...eScores],
        encoderStates,
        decoderState,
        encoderTokens,
        decoderToken,
      },
    });
  }

  const attentionWeights = softmax(eScores);
  steps.push({
    id: stepId++,
    description: `Softmax 归一化：\\alpha_i = \\frac{\\exp(e_i)}{\\sum_j \\exp(e_j)}，注意力权重 = [${attentionWeights.map((v) => v.toFixed(3)).join(", ")}]，最高权重对应 "${encoderTokens[attentionWeights.indexOf(Math.max(...attentionWeights))]}"`,
    data: { attentionWeights },
    variables: { phase: "softmax", attentionWeights, eScores, encoderTokens, decoderToken, encoderStates, decoderState },
  });

  const contextVector = new Array(dim).fill(0).map((_, d) =>
    Number(encoderStates.reduce((s, h, i) => s + h[d] * attentionWeights[i], 0).toFixed(4))
  );

  steps.push({
    id: stepId++,
    description: `加权求和得到上下文向量：c = \\sum_i \\alpha_i h_i = [${contextVector.map((v) => v.toFixed(3)).join(", ")}]。与固定向量不同，每步解码都有自己的上下文向量。`,
    data: { contextVector, attentionWeights },
    variables: { phase: "context", contextVector, attentionWeights, eScores, encoderTokens, decoderToken, encoderStates, decoderState },
  });

  steps.push({
    id: stepId++,
    description: `注意力机制完成！解码器生成 "${decoderToken}" 时，主要关注 "${encoderTokens[attentionWeights.indexOf(Math.max(...attentionWeights))]}"（权重 ${Math.max(...attentionWeights).toFixed(3)}）。注意力打破了固定上下文向量的信息瓶颈。`,
    data: { contextVector, attentionWeights, finished: true },
    variables: {
      phase: "complete",
      contextVector,
      attentionWeights,
      eScores,
      encoderTokens,
      decoderToken,
      encoderStates,
      decoderState,
      finished: true,
    },
  });

  return steps;
}
