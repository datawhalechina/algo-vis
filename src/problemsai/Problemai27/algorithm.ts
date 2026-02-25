import { VisualizationStep } from "@/types";

export function generateMaxPoolingSteps(
  input: number[][],
  poolSize: number,
  stride: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const inputH = input.length;
  const inputW = input[0]?.length || 0;

  if (inputH === 0 || inputW === 0 || poolSize <= 0) {
    steps.push({
      id: stepId++,
      description: "请输入有效的输入矩阵和池化参数。",
      data: { input },
      variables: { finished: true },
    });
    return steps;
  }

  const outputH = Math.floor((inputH - poolSize) / stride) + 1;
  const outputW = Math.floor((inputW - poolSize) / stride) + 1;
  const output: number[][] = Array(outputH)
    .fill(0)
    .map(() => Array(outputW).fill(0));
  const maxIndices: { row: number; col: number }[][] = Array(outputH)
    .fill(null)
    .map(() => Array(outputW).fill({ row: 0, col: 0 }));

  steps.push({
    id: stepId++,
    description: `初始化：输入 ${inputH}×${inputW}，池化窗口 ${poolSize}×${poolSize}，步长 ${stride}`,
    data: { input, output, poolSize, stride },
    variables: {
      inputH,
      inputW,
      poolSize,
      stride,
      outputH,
      outputW,
      phase: "init",
    },
  });

  for (let i = 0; i < outputH; i++) {
    for (let j = 0; j < outputW; j++) {
      const startRow = i * stride;
      const startCol = j * stride;

      let maxVal = -Infinity;
      let maxRow = startRow;
      let maxCol = startCol;
      const poolWindow: number[][] = [];

      for (let pi = 0; pi < poolSize; pi++) {
        const row: number[] = [];
        for (let pj = 0; pj < poolSize; pj++) {
          const val = input[startRow + pi][startCol + pj];
          row.push(val);
          if (val > maxVal) {
            maxVal = val;
            maxRow = startRow + pi;
            maxCol = startCol + pj;
          }
        }
        poolWindow.push(row);
      }

      output[i][j] = maxVal;
      maxIndices[i][j] = { row: maxRow, col: maxCol };

      steps.push({
        id: stepId++,
        description: `位置 (${i},${j})：窗口最大值 = ${maxVal.toFixed(2)}（来自 (${maxRow},${maxCol})）`,
        data: {
          input,
          output: output.map((row) => [...row]),
          poolWindow,
          maxIndices: maxIndices.map((row) => [...row]),
        },
        variables: {
          currentRow: i,
          currentCol: j,
          startRow,
          startCol,
          maxVal,
          maxRow,
          maxCol,
          poolSize,
          phase: "pooling",
        },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `池化完成！输出尺寸：${outputH}×${outputW}`,
    data: { input, output, maxIndices },
    variables: { outputH, outputW, phase: "done", finished: true },
  });

  return steps;
}
