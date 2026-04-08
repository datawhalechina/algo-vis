import { VisualizationStep } from "@/types";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return Number((dot / (Math.sqrt(normA) * Math.sqrt(normB))).toFixed(4));
}

function editDistance(s: string, t: string): number {
  const m = s.length, n = t.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s[i - 1] === t[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export const WORD_VECTORS: Record<string, number[]> = {
  "机器学习": [0.80, 0.75, 0.20, 0.15],
  "深度学习": [0.85, 0.70, 0.25, 0.20],
  "自然语言": [0.60, 0.40, 0.85, 0.80],
  "计算机视觉": [0.70, 0.50, 0.20, 0.30],
};

function textToVector(text: string, vocab: string[]): number[] {
  const dim = 4;
  const vec = new Array(dim).fill(0);
  let found = 0;
  for (const w of vocab) {
    if (text.includes(w) && WORD_VECTORS[w]) {
      const wv = WORD_VECTORS[w];
      for (let i = 0; i < dim; i++) vec[i] += wv[i];
      found++;
    }
  }
  if (found > 0) return vec.map((v) => Number((v / found).toFixed(4)));
  return vec.map((_, i) => Number((0.1 * (i + 1)).toFixed(4)));
}

export function generateTextSimilaritySteps(
  text1: string,
  text2: string
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  const vocab = Object.keys(WORD_VECTORS);

  steps.push({
    id: stepId++,
    description: `初始化文本相似度计算。文本1："${text1}"，文本2："${text2}"。将分别计算余弦相似度和编辑距离。`,
    data: { text1, text2 },
    variables: { phase: "init", text1, text2 },
  });

  const vec1 = textToVector(text1, vocab);
  steps.push({
    id: stepId++,
    description: `将文本1 "${text1}" 转换为向量表示：v_1 = [${vec1.map((x) => x.toFixed(2)).join(", ")}]（基于词嵌入平均）`,
    data: { vec1 },
    variables: { phase: "vector1", vec1, text1, text2 },
  });

  const vec2 = textToVector(text2, vocab);
  steps.push({
    id: stepId++,
    description: `将文本2 "${text2}" 转换为向量表示：v_2 = [${vec2.map((x) => x.toFixed(2)).join(", ")}]（基于词嵌入平均）`,
    data: { vec2 },
    variables: { phase: "vector2", vec1, vec2, text1, text2 },
  });

  const cosSim = cosineSimilarity(vec1, vec2);
  steps.push({
    id: stepId++,
    description: `计算余弦相似度：\\cos(v_1, v_2) = \\frac{v_1 \\cdot v_2}{\\|v_1\\| \\cdot \\|v_2\\|} = ${cosSim.toFixed(4)}。值越接近 1 表示语义越相似。`,
    data: { cosSim, vec1, vec2 },
    variables: { phase: "cosine", cosSim, vec1, vec2, text1, text2 },
  });

  const ed = editDistance(text1, text2);
  const maxLen = Math.max(text1.length, text2.length);
  const edSim = Number((1 - ed / maxLen).toFixed(4));
  steps.push({
    id: stepId++,
    description: `计算编辑距离（Levenshtein Distance）：d("${text1}", "${text2}") = ${ed} 步操作（插入/删除/替换），字符串相似度 = 1 - ${ed}/${maxLen} = ${edSim.toFixed(4)}`,
    data: { ed, edSim },
    variables: { phase: "edit", ed, edSim, cosSim, vec1, vec2, text1, text2 },
  });

  steps.push({
    id: stepId++,
    description: `文本相似度计算完成！余弦相似度（语义）= ${cosSim.toFixed(4)}，编辑距离相似度（字符）= ${edSim.toFixed(4)}。两种方法从不同角度度量文本相似性。`,
    data: { cosSim, edSim, ed, finished: true },
    variables: {
      phase: "complete",
      cosSim,
      edSim,
      ed,
      vec1,
      vec2,
      text1,
      text2,
      finished: true,
    },
  });

  return steps;
}
