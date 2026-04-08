import { VisualizationStep } from "@/types";

export interface WordEmbeddingWord {
  word: string;
  vector: number[];
}

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

export const DEFAULT_VOCAB: WordEmbeddingWord[] = [
  { word: "king",   vector: [0.99, 0.02, 0.73, 0.15] },
  { word: "queen",  vector: [0.95, 0.05, 0.68, 0.85] },
  { word: "man",    vector: [0.92, 0.08, 0.25, 0.10] },
  { word: "woman",  vector: [0.88, 0.12, 0.20, 0.82] },
  { word: "cat",    vector: [0.10, 0.95, 0.15, 0.12] },
  { word: "dog",    vector: [0.12, 0.97, 0.18, 0.08] },
  { word: "apple",  vector: [0.05, 0.20, 0.85, 0.15] },
  { word: "fruit",  vector: [0.08, 0.22, 0.90, 0.18] },
];

export function generateWordEmbeddingSteps(
  vocab: WordEmbeddingWord[],
  queryWord: string
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const dim = vocab[0]?.vector.length ?? 4;

  steps.push({
    id: stepId++,
    description: `初始化词汇表，共 ${vocab.length} 个词语，嵌入维度 d = ${dim}。词嵌入将离散词语映射到连续向量空间：\\text{embed}(w) \\in \\mathbb{R}^d`,
    data: { vocab, queryWord },
    variables: { phase: "init", vocab, queryWord, dim },
  });

  const target = vocab.find((v) => v.word === queryWord);
  if (!target) {
    steps.push({
      id: stepId++,
      description: `词语 "${queryWord}" 不在词汇表中，请选择其他词语。`,
      data: {},
      variables: { phase: "error", finished: true },
    });
    return steps;
  }

  steps.push({
    id: stepId++,
    description: `查找词语 "${queryWord}" 的嵌入向量。每个词在嵌入矩阵 E \\in \\mathbb{R}^{|V| \\times d} 中对应一行，通过 one-hot 向量与 E 相乘得到词向量。`,
    data: { target },
    variables: { phase: "lookup", target, queryWord, vocab },
  });

  steps.push({
    id: stepId++,
    description: `得到词向量 v_{\\text{${queryWord}}} = [${target.vector.map((x) => x.toFixed(2)).join(", ")}]，维度 ${dim}。每个维度编码了词语的某种语义或语法属性。`,
    data: { target },
    variables: { phase: "vector", target, queryWord, vocab },
  });

  const similarities = vocab
    .filter((v) => v.word !== queryWord)
    .map((v) => ({
      word: v.word,
      vector: v.vector,
      similarity: cosineSimilarity(target.vector, v.vector),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  for (let i = 0; i < similarities.length; i++) {
    const s = similarities[i];
    steps.push({
      id: stepId++,
      description: `计算 "${queryWord}" 与 "${s.word}" 的余弦相似度：\\cos(v_a, v_b) = \\frac{v_a \\cdot v_b}{\\|v_a\\|\\|v_b\\|} = ${s.similarity.toFixed(4)}`,
      data: { a: target, b: s, similarity: s.similarity },
      variables: {
        phase: "similarity",
        currentIdx: i,
        similarities: similarities.slice(0, i + 1),
        target,
        queryWord,
        vocab,
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `计算完成！最相似的词语为 "${similarities[0].word}"（相似度 ${similarities[0].similarity}）。语义相似的词语在向量空间中距离更近，这验证了词嵌入的核心假设：分布相似性。`,
    data: { similarities, finished: true },
    variables: { phase: "complete", similarities, target, queryWord, vocab, finished: true },
  });

  return steps;
}
