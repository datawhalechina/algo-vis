import { VisualizationStep } from "@/types";

export interface SpeakerProfile {
  name: string;
  embedding: number[];
  color: string;
}

export interface SimilarityResult {
  name: string;
  similarity: number;
}

export const ENROLLED_SPEAKERS: SpeakerProfile[] = [
  { name: "Alice", embedding: [0.92, 0.15, 0.67, 0.23, 0.88, 0.31], color: "#7c3aed" },
  { name: "Bob",   embedding: [0.18, 0.89, 0.24, 0.76, 0.12, 0.93], color: "#0ea5e9" },
  { name: "Charlie", embedding: [0.61, 0.42, 0.85, 0.38, 0.55, 0.72], color: "#10b981" },
];

export const TEST_EMBEDDINGS: Record<string, number[]> = {
  "Alice的声音": [0.90, 0.17, 0.65, 0.25, 0.86, 0.29],
  "Bob的声音":   [0.16, 0.87, 0.22, 0.78, 0.14, 0.91],
  "陌生人":      [0.45, 0.45, 0.50, 0.45, 0.48, 0.47],
};

export const THRESHOLD = 0.85;

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

export function generateSpeakerIdSteps(testSpeaker: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const testEmbedding = TEST_EMBEDDINGS[testSpeaker] ?? TEST_EMBEDDINGS["陌生人"];

  // Step 1: init - show enrolled speakers
  steps.push({
    id: stepId++,
    description: `系统初始化：已注册 ${ENROLLED_SPEAKERS.length} 位说话人。每位说话人在注册阶段通过神经网络（d-vector 模型）提取声纹嵌入向量，存储在说话人数据库中。向量维度 d = 6。`,
    data: { enrolledSpeakers: ENROLLED_SPEAKERS },
    variables: {
      phase: "init",
      enrolledSpeakers: ENROLLED_SPEAKERS.map(s => s.name).join(","),
      testSpeaker,
      threshold: THRESHOLD,
    },
  });

  // Step 2: show enrolled embeddings in detail
  steps.push({
    id: stepId++,
    description: `已注册说话人的声纹嵌入向量（d-vector）：Alice、Bob、Charlie 三人的特征在 6 维向量空间中各自占据不同区域，反映其独特的声学特征（音高、音色、共鸣等）。`,
    data: { enrolledSpeakers: ENROLLED_SPEAKERS },
    variables: {
      phase: "init",
      enrolledSpeakers: ENROLLED_SPEAKERS.map(s => s.name).join(","),
      testSpeaker,
      threshold: THRESHOLD,
      showEmbeddings: "true",
    },
  });

  // Step 3: extract test embedding
  steps.push({
    id: stepId++,
    description: `接收到待识别语音：「${testSpeaker}」。神经网络对语音进行端到端特征提取，输出固定维度的说话人嵌入向量。测试嵌入：[${testEmbedding.map(v => v.toFixed(2)).join(", ")}]`,
    data: { testEmbedding, testSpeaker },
    variables: {
      phase: "extract",
      testSpeaker,
      testEmbedding: testEmbedding.join(","),
      threshold: THRESHOLD,
    },
  });

  // Steps 4-6: compare with each enrolled speaker one by one
  const similarities: SimilarityResult[] = [];
  for (let i = 0; i < ENROLLED_SPEAKERS.length; i++) {
    const speaker = ENROLLED_SPEAKERS[i];
    const sim = cosineSimilarity(testEmbedding, speaker.embedding);
    similarities.push({ name: speaker.name, similarity: sim });

    steps.push({
      id: stepId++,
      description: `计算与「${speaker.name}」的余弦相似度：\\cos(e_{\\text{test}}, e_{${speaker.name}}) = \\frac{e_{\\text{test}} \\cdot e_{${speaker.name}}}{\\|e_{\\text{test}}\\| \\cdot \\|e_{${speaker.name}}\\|} = ${sim.toFixed(4)}`,
      data: { testEmbedding, speaker, similarity: sim },
      variables: {
        phase: "compare",
        testSpeaker,
        testEmbedding: testEmbedding.join(","),
        currentCompareIdx: i,
        similarities: similarities.map(s => `${s.name}:${s.similarity}`).join("|"),
        threshold: THRESHOLD,
      },
    });
  }

  // Step 7: decision
  const maxSim = Math.max(...similarities.map(s => s.similarity));
  const maxEntry = similarities.find(s => s.similarity === maxSim)!;
  const identified = maxSim >= THRESHOLD ? maxEntry.name : "未知说话人";
  const isKnown = maxSim >= THRESHOLD;

  steps.push({
    id: stepId++,
    description: `决策阶段：最大余弦相似度为 ${maxSim.toFixed(4)}（与 ${maxEntry.name}），阈值 θ = ${THRESHOLD}。` +
      (isKnown
        ? `因为 ${maxSim.toFixed(4)} ≥ ${THRESHOLD}，判定为已注册说话人「${identified}」。`
        : `因为 ${maxSim.toFixed(4)} < ${THRESHOLD}，拒绝所有已注册身份，判定为「未知说话人」。`),
    data: { similarities, maxSim, identified, isKnown },
    variables: {
      phase: "decision",
      testSpeaker,
      similarities: similarities.map(s => `${s.name}:${s.similarity}`).join("|"),
      identified,
      isKnown: isKnown ? "true" : "false",
      maxSim,
      threshold: THRESHOLD,
    },
  });

  // Step 8: complete
  steps.push({
    id: stepId++,
    description: `识别完成！待测语音「${testSpeaker}」被识别为「${identified}」。` +
      (isKnown
        ? `说话人嵌入在向量空间中与 ${identified} 的声纹高度重合（相似度 ${maxSim.toFixed(4)}）。`
        : `测试嵌入与所有已注册声纹的相似度均低于阈值，这是一个未登录的说话人。`),
    data: { similarities, identified, isKnown, finished: true },
    variables: {
      phase: "complete",
      testSpeaker,
      similarities: similarities.map(s => `${s.name}:${s.similarity}`).join("|"),
      identified,
      isKnown: isKnown ? "true" : "false",
      maxSim,
      threshold: THRESHOLD,
      finished: "true",
    },
  });

  return steps;
}
