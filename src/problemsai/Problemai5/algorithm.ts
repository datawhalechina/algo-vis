import { VisualizationStep } from "@/types";

export function generatePositionalEncodingSteps(
  seqLen: number,
  dModel: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // ── 解释阶段 1：seq_len ────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `输入变量 seq_len=${seqLen}：序列长度，即句子里有多少个 token（词）。每个 token 会得到一个独立的位置编码向量。`,
    data: {},
    variables: {
      phase: "explain-seq-len",
      seqLen,
      dModel,
    },
  });

  // ── 解释阶段 2：d_model ───────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `输入变量 d_model=${dModel}：模型的嵌入维度，即每个 token 的向量有多少个数字组成。位置编码也是同样维度的向量，才能与 token 嵌入相加。`,
    data: {},
    variables: {
      phase: "explain-d-model",
      seqLen,
      dModel,
    },
  });

  // ── 解释阶段 3：公式分解 ──────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `公式解读：PE[pos, 2i] = sin(pos / 10000^(2i/d_model))。pos 是位置下标（0 到 seq_len-1），i 是维度对下标（0 到 d_model/2-1），10000 是基频常数。`,
    data: {},
    variables: {
      phase: "explain-formula",
      seqLen,
      dModel,
    },
  });

  // ── 初始化 ────────────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `初始化：创建 ${seqLen}×${dModel} 的全零矩阵，准备逐位置、逐维度对填入 sin/cos 值。`,
    data: {},
    variables: {
      phase: "init",
      seqLen,
      dModel,
      peMatrix: Array.from({ length: seqLen }, () => new Array(dModel).fill(0)),
    },
  });

  // ── 逐步构建 PE 矩阵 ──────────────────────────────────────────
  const peMatrix: number[][] = Array.from({ length: seqLen }, () =>
    new Array(dModel).fill(0)
  );

  for (let pos = 0; pos < seqLen; pos++) {
    for (let i = 0; i < dModel; i += 2) {
      const divTerm = Math.pow(10000, i / dModel);
      const sinVal = Number(Math.sin(pos / divTerm).toFixed(4));
      const cosVal = Number(Math.cos(pos / divTerm).toFixed(4));

      peMatrix[pos][i] = sinVal;
      if (i + 1 < dModel) {
        peMatrix[pos][i + 1] = cosVal;
      }

      steps.push({
        id: stepId++,
        description: `位置 pos=${pos}，维度对 i=${i}：PE[${pos}][${i}]=sin(${pos}/${divTerm.toFixed(2)})=${sinVal}${i + 1 < dModel ? `，PE[${pos}][${i + 1}]=cos(${pos}/${divTerm.toFixed(2)})=${cosVal}` : ""}`,
        data: {},
        variables: {
          phase: "compute",
          seqLen,
          dModel,
          currentPos: pos,
          currentDimPair: i,
          divTerm: Number(divTerm.toFixed(4)),
          sinVal,
          cosVal,
          peMatrix: peMatrix.map((row) => [...row]),
        },
      });
    }
  }

  // ── 完成：PE 矩阵 ─────────────────────────────────────────────
  steps.push({
    id: stepId++,
    description: `PE 矩阵（${seqLen}×${dModel}）计算完毕。下一步将展示如何把它与 token 嵌入相加，得到 Transformer 的输入。`,
    data: { peMatrix: peMatrix.map((row) => [...row]) },
    variables: {
      phase: "complete",
      seqLen,
      dModel,
      peMatrix: peMatrix.map((row) => [...row]),
    },
  });

  // ── 解释输出：embedding + PE ─────────────────────────────────
  steps.push({
    id: stepId++,
    description: `输出使用方式：将 PE 矩阵与 token 嵌入矩阵（Embedding）逐元素相加，结果作为 Transformer 的实际输入。这样每个 token 的向量中就同时包含了语义信息和位置信息。`,
    data: {},
    variables: {
      phase: "explain-output",
      seqLen,
      dModel,
      peMatrix: peMatrix.map((row) => [...row]),
    },
  });

  return steps;
}
