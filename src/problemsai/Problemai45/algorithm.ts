import { VisualizationStep } from "@/types";

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export interface TranslationSample {
  sourceTokens: string[];
  targetTokens: string[];
  sourceLang: string;
  targetLang: string;
}

export const DEFAULT_TRANSLATION: TranslationSample = {
  sourceTokens: ["Hello", "world"],
  targetTokens: ["你好", "世界"],
  sourceLang: "英语",
  targetLang: "中文",
};

// 模拟注意力对齐权重
function generateAlignmentWeights(srcLen: number, tgtLen: number): number[][] {
  const weights: number[][] = [];
  for (let t = 0; t < tgtLen; t++) {
    const row = new Array(srcLen).fill(0).map((_, s) => {
      const dist = Math.abs(s - (t * srcLen) / tgtLen);
      return Math.exp(-dist * 0.8);
    });
    weights.push(softmax(row));
  }
  return weights;
}

export function generateMachineTranslationSteps(sample: TranslationSample): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const { sourceTokens, targetTokens, sourceLang, targetLang } = sample;

  steps.push({
    id: stepId++,
    description: `初始化神经机器翻译（NMT）：源语言（${sourceLang}）"${sourceTokens.join(" ")}"，目标语言（${targetLang}）"${targetTokens.join("")}"。使用 Transformer 架构。`,
    data: { sample },
    variables: { phase: "init", sample, sourceTokens, targetTokens },
  });

  const sourceEmbeddings = sourceTokens.map((token) =>
    Array.from({ length: 4 }, (_, d) => Number((0.3 + 0.1 * ((token.charCodeAt(0) + d * 17) % 7)).toFixed(4)))
  );

  steps.push({
    id: stepId++,
    description: `对源序列进行分词和嵌入：每个 token 映射到 d=4 维向量空间，加上位置编码后输入编码器`,
    data: { sourceEmbeddings },
    variables: { phase: "src-embed", sourceEmbeddings, sourceTokens, targetTokens, sourceLang, targetLang },
  });

  steps.push({
    id: stepId++,
    description: `编码器通过多头自注意力捕获源句子内部依赖关系，得到上下文感知的表示 H_{enc} \\in \\mathbb{R}^{n \\times d_{model}}`,
    data: { sourceEmbeddings },
    variables: { phase: "encoding", sourceEmbeddings, sourceTokens, targetTokens, sourceLang, targetLang },
  });

  const alignmentWeights = generateAlignmentWeights(sourceTokens.length, targetTokens.length);

  for (let t = 0; t < targetTokens.length; t++) {
    const weights = alignmentWeights[t];
    const maxIdx = weights.indexOf(Math.max(...weights));
    steps.push({
      id: stepId++,
      description: `解码步骤 ${t + 1}：生成目标词 "${targetTokens[t]}"，注意力主要关注源词 "${sourceTokens[maxIdx]}"（权重 ${weights[maxIdx].toFixed(3)}）`,
      data: { targetToken: targetTokens[t], weights, alignedSrc: sourceTokens[maxIdx] },
      variables: {
        phase: "decoding",
        currentStep: t,
        currentTarget: targetTokens[t],
        weights,
        alignmentWeights,
        sourceTokens,
        targetTokens,
        sourceLang,
        targetLang,
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `翻译完成！"${sourceTokens.join(" ")}" (${sourceLang}) → "${targetTokens.join("")}" (${targetLang})。注意力对齐矩阵揭示了两种语言词语之间的对应关系。`,
    data: { alignmentWeights, finished: true },
    variables: {
      phase: "complete",
      alignmentWeights,
      sourceTokens,
      targetTokens,
      sourceLang,
      targetLang,
      finished: true,
    },
  });

  return steps;
}
