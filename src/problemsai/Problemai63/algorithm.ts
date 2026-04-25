import { VisualizationStep } from "@/types";

export interface RetrievalItem {
  id: string;
  emoji: string;
  label: string;
  embedding: number[];
}

export interface RetrievalQuery {
  kind: "text" | "image";
  label: string;
  embedding: number[];
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

export function generateRetrievalSteps(
  query: RetrievalQuery,
  database: RetrievalItem[],
  topK: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `多模态检索：用 ${query.kind === "text" ? "文本" : "图像"} 查询 "${query.label}" 从 ${database.length} 条数据库条目中检索 Top-${topK} 最相似项。`,
    data: { query, database, topK },
    variables: { phase: "init", query, database, topK },
  });

  // 查询编码
  const qEmb = l2norm(query.embedding);
  steps.push({
    id: stepId++,
    description: `查询编码：通过 CLIP 等嵌入模型将查询编码为 ${qEmb.length} 维向量并 L2 归一化。`,
    data: { qEmb },
    variables: {
      phase: "encode_query",
      query,
      database,
      topK,
      qEmb: [...qEmb],
    },
  });

  // 数据库编码
  const dbEmbs = database.map((item) => l2norm(item.embedding));
  steps.push({
    id: stepId++,
    description: `数据库编码：所有 ${database.length} 条目均被映射到同一嵌入空间，形成矩阵 E ∈ ℝ^{${database.length}×${qEmb.length}}。`,
    data: { dbEmbs },
    variables: {
      phase: "encode_db",
      query,
      database,
      topK,
      qEmb: [...qEmb],
      dbEmbs: dbEmbs.map((e) => [...e]),
    },
  });

  // 逐个计算相似度
  const sims: number[] = [];
  for (let i = 0; i < database.length; i++) {
    sims.push(cosineSim(qEmb, dbEmbs[i]));
    steps.push({
      id: stepId++,
      description: `计算 cos(q, e_${i}) = q·e_${i} / (||q||·||e_${i}||) = ${sims[i].toFixed(4)}，衡量查询与 "${database[i].label}" 的相似度。`,
      data: { sims: [...sims] },
      variables: {
        phase: "similarity",
        query,
        database,
        topK,
        qEmb,
        dbEmbs,
        sims: [...sims],
        currentIdx: i,
      },
    });
  }

  // 排序
  const ranked = database
    .map((item, i) => ({ item, sim: sims[i], idx: i }))
    .sort((a, b) => b.sim - a.sim);
  const rankedIdx = ranked.map((r) => r.idx);

  steps.push({
    id: stepId++,
    description: `按相似度降序排序，得到排名序列。Top-1 为 "${ranked[0]?.item.label}"（sim=${ranked[0]?.sim.toFixed(3)}）。`,
    data: { ranked },
    variables: {
      phase: "rank",
      query,
      database,
      topK,
      qEmb,
      dbEmbs,
      sims,
      rankedIdx,
    },
  });

  // Top-K
  const topKIdx = rankedIdx.slice(0, topK);
  steps.push({
    id: stepId++,
    description: `返回 Top-${topK}：${topKIdx.map((i) => `"${database[i].label}"`).join(", ")}。`,
    data: { topKIdx, finished: true },
    variables: {
      phase: "complete",
      query,
      database,
      topK,
      qEmb,
      dbEmbs,
      sims,
      rankedIdx,
      topKIdx,
      finished: true,
    },
  });

  return steps;
}
