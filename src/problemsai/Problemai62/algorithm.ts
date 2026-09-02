import { VisualizationStep } from "@/types";

export interface VQAScene {
  label: string;
  emoji: string;
  regions: { name: string; color: string; emoji?: string }[];
  // question tokens
  question: string[];
  // answer candidates
  candidates: { label: string; score: number }[];
  // for each question token, attention over regions
  qToR: number[][];
  // attention from each region to question tokens
  rToQ: number[][];
  // final answer
  answer: string;
}

function softmax(row: number[]): number[] {
  const m = Math.max(...row);
  const exps = row.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => Number((v / sum).toFixed(4)));
}

export function generateVQASteps(scene: VQAScene): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `视觉问答（VQA）：图像 "${scene.label}" + 问题 "${scene.question.join(" ")}"。目标是从候选答案中选出正确答案。`,
    data: { scene },
    variables: { phase: "init", scene },
  });

  steps.push({
    id: stepId++,
    description: `视觉编码器提取图像区域特征 V ∈ ℝ^{M×d_v}，共 ${scene.regions.length} 个候选区域。`,
    data: { scene },
    variables: { phase: "encode_visual", scene },
  });

  steps.push({
    id: stepId++,
    description: `文本编码器提取问题特征 Q ∈ ℝ^{T×d_t}，共 ${scene.question.length} 个 token。`,
    data: { scene },
    variables: { phase: "encode_text", scene },
  });

  // 交叉注意力 Q -> R
  const qToRNorm = scene.qToR.map((row) => softmax(row));
  steps.push({
    id: stepId++,
    description: `交叉注意力 Q→R：每个问题 token 对视觉区域做 softmax(Q·Rᵀ/√d)，得到每个词对图像区域的关注分布。`,
    data: { qToR: qToRNorm },
    variables: {
      phase: "cross_attn_q2r",
      scene,
      qToR: qToRNorm,
    },
  });

  // 交叉注意力 R -> Q
  const rToQNorm = scene.rToQ.map((row) => softmax(row));
  steps.push({
    id: stepId++,
    description: `交叉注意力 R→Q：每个区域对问题 token 做 softmax(R·Qᵀ/√d)，实现双向跨模态信息交互。`,
    data: { rToQ: rToQNorm },
    variables: {
      phase: "cross_attn_r2q",
      scene,
      qToR: qToRNorm,
      rToQ: rToQNorm,
    },
  });

  // 融合特征
  steps.push({
    id: stepId++,
    description: `多模态融合：将视觉注意特征 v* 和文本注意特征 q* 拼接/相乘得到融合向量 m = v* ⊙ q*，输入到答案分类器。`,
    data: {},
    variables: {
      phase: "fusion",
      scene,
      qToR: qToRNorm,
      rToQ: rToQNorm,
    },
  });

  // 答案概率分布
  const rawScores = scene.candidates.map((c) => c.score);
  const probs = softmax(rawScores);
  steps.push({
    id: stepId++,
    description: `答案分类器输出 logits，经 Softmax 得到候选答案的概率分布 P(a|I, Q)。`,
    data: { probs },
    variables: {
      phase: "answer_prob",
      scene,
      qToR: qToRNorm,
      rToQ: rToQNorm,
      probs,
    },
  });

  // 完成：选出答案
  const argmax = probs.indexOf(Math.max(...probs));
  const finalAnswer = scene.candidates[argmax]?.label ?? scene.answer;
  steps.push({
    id: stepId++,
    description: `最终预测：argmax P(a|I, Q) = "${finalAnswer}"（置信度 ${(probs[argmax] * 100).toFixed(1)}%）。`,
    data: { finalAnswer, finished: true },
    variables: {
      phase: "complete",
      scene,
      qToR: qToRNorm,
      rToQ: rToQNorm,
      probs,
      finalAnswer,
      finished: true,
    },
  });

  return steps;
}
