import { VisualizationStep } from "@/types";

export interface ITMItem {
  id: string;
  imageLabel: string;
  imageEmoji: string;
  text: string;
  imageEmb: number[];
  textEmb: number[];
}

function l2norm(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => Number((x / n).toFixed(4)));
}

function cosineSim(a: number[], b: number[]): number {
  const na = l2norm(a);
  const nb = l2norm(b);
  let s = 0;
  for (let i = 0; i < na.length; i++) s += na[i] * nb[i];
  return Number(s.toFixed(4));
}

export function generateITMSteps(
  items: ITMItem[],
  threshold: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `图像-文本匹配（ITM）：共 ${items.length} 对样本，通过相似度计算判断是否匹配。匹配阈值 τ=${threshold}。`,
    data: { items, threshold },
    variables: { phase: "init", items, threshold },
  });

  // Step 2: 编码
  steps.push({
    id: stepId++,
    description: `图像编码 f_img → L2 归一化；文本编码 f_text → L2 归一化，得到 ||I||=||T||=1。`,
    data: {},
    variables: { phase: "encode", items, threshold },
  });

  // Step 3: 逐对计算相似度
  const sims: number[] = [];
  const predictions: boolean[] = [];
  for (let i = 0; i < items.length; i++) {
    const sim = cosineSim(items[i].imageEmb, items[i].textEmb);
    sims.push(sim);
    predictions.push(sim >= threshold);
    steps.push({
      id: stepId++,
      description: `样本 ${i + 1}：计算 cos(I_${i}, T_${i}) = ${sim.toFixed(4)}，${
        sim >= threshold ? "≥" : "<"
      } ${threshold}，判定为 ${sim >= threshold ? "匹配 ✓" : "不匹配 ✗"}。`,
      data: { sims: [...sims] },
      variables: {
        phase: "similarity",
        items,
        threshold,
        sims: [...sims],
        predictions: [...predictions],
        currentIdx: i,
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `所有样本的匹配判定完成。匹配数：${predictions.filter((p) => p).length}，不匹配数：${
      predictions.filter((p) => !p).length
    }。`,
    data: { sims, predictions, finished: true },
    variables: {
      phase: "complete",
      items,
      threshold,
      sims,
      predictions,
      finished: true,
    },
  });

  return steps;
}
