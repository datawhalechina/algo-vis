import { VisualizationStep } from "@/types";

function tanh(x: number): number {
  return Math.tanh(x);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export interface Seq2SeqSample {
  inputTokens: string[];
  outputTokens: string[];
  hiddenDim: number;
}

export const DEFAULT_SEQ2SEQ: Seq2SeqSample = {
  inputTokens: ["Hello", "world", "<EOS>"],
  outputTokens: ["你好", "世界", "<EOS>"],
  hiddenDim: 4,
};

function initHidden(dim: number): number[] {
  return new Array(dim).fill(0);
}

function encoderStep(input: number[], hidden: number[], dim: number): number[] {
  return Array.from({ length: dim }, (_, i) =>
    Number(tanh(input[i % input.length] * 0.5 + hidden[i] * 0.8 + 0.1 * (i + 1)).toFixed(4))
  );
}

function tokenToVec(token: string, dim: number): number[] {
  const hash = Array.from(token).reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: dim }, (_, i) =>
    Number(sigmoid((hash * (i + 1) * 0.01) % 2 - 1).toFixed(4))
  );
}

export function generateSeq2SeqSteps(sample: Seq2SeqSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const { inputTokens, outputTokens, hiddenDim } = sample;

  steps.push({
    id: stepId++,
    description: `初始化 Seq2Seq：输入序列 [${inputTokens.join(", ")}]，目标序列 [${outputTokens.join(", ")}]，隐藏维度 d=${hiddenDim}。架构：编码器-解码器（Encoder-Decoder）。`,
    data: { sample },
    variables: { phase: "init", sample, inputTokens, outputTokens, hiddenDim },
  });

  let hidden = initHidden(hiddenDim);
  const encoderStates: number[][] = [];

  steps.push({
    id: stepId++,
    description: `编码器开始：初始隐藏状态 h_0 = \\mathbf{0}。编码器使用 RNN：h_t = \\tanh(W_x x_t + W_h h_{t-1} + b)`,
    data: { hidden },
    variables: { phase: "encoder-init", hidden: [...hidden], inputTokens, outputTokens, encoderStates: [] },
  });

  for (let t = 0; t < inputTokens.length; t++) {
    const token = inputTokens[t];
    const inputVec = tokenToVec(token, hiddenDim);
    hidden = encoderStep(inputVec, hidden, hiddenDim);
    encoderStates.push([...hidden]);

    steps.push({
      id: stepId++,
      description: `编码器步骤 ${t + 1}/${inputTokens.length}：处理 "${token}"，更新隐藏状态 h_{${t + 1}} = [${hidden.map((v) => v.toFixed(2)).join(", ")}]`,
      data: { token, hidden: [...hidden], inputVec },
      variables: {
        phase: "encoding",
        currentEncoderStep: t,
        inputToken: token,
        hidden: [...hidden],
        encoderStates: encoderStates.map((s) => [...s]),
        inputTokens,
        outputTokens,
      },
    });
  }

  const contextVector = [...hidden];
  steps.push({
    id: stepId++,
    description: `编码完成！上下文向量 c = h_{${inputTokens.length}} = [${contextVector.map((v) => v.toFixed(2)).join(", ")}]。解码器将以此为初始状态生成输出序列。`,
    data: { contextVector },
    variables: {
      phase: "context",
      contextVector,
      encoderStates: encoderStates.map((s) => [...s]),
      inputTokens,
      outputTokens,
    },
  });

  let decHidden = [...contextVector];
  const decoderStates: number[][] = [];

  for (let t = 0; t < outputTokens.length; t++) {
    const targetToken = outputTokens[t];
    const inputVec = t === 0
      ? new Array(hiddenDim).fill(0.1)
      : tokenToVec(outputTokens[t - 1], hiddenDim);
    decHidden = encoderStep(inputVec, decHidden, hiddenDim);
    decoderStates.push([...decHidden]);

    steps.push({
      id: stepId++,
      description: `解码器步骤 ${t + 1}/${outputTokens.length}：生成 "${targetToken}"，隐藏状态 h_{dec,${t + 1}} = [${decHidden.map((v) => v.toFixed(2)).join(", ")}]`,
      data: { targetToken, decHidden: [...decHidden] },
      variables: {
        phase: "decoding",
        currentDecoderStep: t,
        outputToken: targetToken,
        decHidden: [...decHidden],
        decoderStates: decoderStates.map((s) => [...s]),
        encoderStates: encoderStates.map((s) => [...s]),
        contextVector,
        inputTokens,
        outputTokens,
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `Seq2Seq 完成！输入 [${inputTokens.join(", ")}] → 输出 [${outputTokens.join(", ")}]。编码器将输入压缩为固定长度的上下文向量，解码器据此生成可变长度输出。`,
    data: { finished: true },
    variables: {
      phase: "complete",
      encoderStates: encoderStates.map((s) => [...s]),
      decoderStates: decoderStates.map((s) => [...s]),
      contextVector,
      inputTokens,
      outputTokens,
      finished: true,
    },
  });

  return steps;
}
