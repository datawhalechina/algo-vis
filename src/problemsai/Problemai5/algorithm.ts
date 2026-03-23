import { VisualizationStep } from "@/types";

export function generatePositionalEncodingSteps(
  seqLen: number,
  dModel: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 初始化
  steps.push({
    id: stepId++,
    description: `初始化：序列长度 seq_len=${seqLen}，模型维度 d_model=${dModel}。将计算每个位置 pos 的正弦位置编码向量。`,
    data: {},
    variables: {
      phase: "init",
      seqLen,
      dModel,
      peMatrix: [],
    },
  });

  // 逐步构建 PE 矩阵
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

  // 展示完整的 PE 矩阵
  steps.push({
    id: stepId++,
    description: `位置编码矩阵计算完成！矩阵形状 ${seqLen}×${dModel}。每一行是一个位置的编码向量，将与 token 嵌入向量相加后输入 Transformer。`,
    data: { peMatrix: peMatrix.map((row) => [...row]) },
    variables: {
      phase: "complete",
      seqLen,
      dModel,
      peMatrix: peMatrix.map((row) => [...row]),
      finished: true,
    },
  });

  return steps;
}
