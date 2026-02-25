import { VisualizationStep } from "@/types";

export interface ConvolutionState {
  input: number[][];
  kernel: number[][];
  output: number[][];
  currentRow: number;
  currentCol: number;
  phase: string;
  currentPatch?: number[][];
  dotProduct?: number;
}

function convolve2D(
  input: number[][],
  kernel: number[][],
  stride: number,
  padding: number
): { output: number[][]; paddedInput: number[][] } {
  const inputH = input.length;
  const inputW = input[0]?.length || 0;
  const kernelH = kernel.length;
  const kernelW = kernel[0]?.length || 0;

  const paddedH = inputH + 2 * padding;
  const paddedW = inputW + 2 * padding;
  const paddedInput: number[][] = Array(paddedH)
    .fill(0)
    .map(() => Array(paddedW).fill(0));

  for (let i = 0; i < inputH; i++) {
    for (let j = 0; j < inputW; j++) {
      paddedInput[i + padding][j + padding] = input[i][j];
    }
  }

  const outputH = Math.floor((paddedH - kernelH) / stride) + 1;
  const outputW = Math.floor((paddedW - kernelW) / stride) + 1;
  const output: number[][] = Array(outputH)
    .fill(0)
    .map(() => Array(outputW).fill(0));

  for (let i = 0; i < outputH; i++) {
    for (let j = 0; j < outputW; j++) {
      let sum = 0;
      for (let ki = 0; ki < kernelH; ki++) {
        for (let kj = 0; kj < kernelW; kj++) {
          sum += paddedInput[i * stride + ki][j * stride + kj] * kernel[ki][kj];
        }
      }
      output[i][j] = Number(sum.toFixed(4));
    }
  }

  return { output, paddedInput };
}

export function generateConvolutionSteps(
  input: number[][],
  kernel: number[][],
  stride: number,
  padding: number
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const inputH = input.length;
  const inputW = input[0]?.length || 0;
  const kernelH = kernel.length;
  const kernelW = kernel[0]?.length || 0;

  if (inputH === 0 || inputW === 0 || kernelH === 0 || kernelW === 0) {
    steps.push({
      id: stepId++,
      description: "请输入有效的输入矩阵和卷积核。",
      data: { input, kernel },
      variables: { finished: true },
    });
    return steps;
  }

  const paddedH = inputH + 2 * padding;
  const paddedW = inputW + 2 * padding;
  const paddedInput: number[][] = Array(paddedH)
    .fill(0)
    .map(() => Array(paddedW).fill(0));

  for (let i = 0; i < inputH; i++) {
    for (let j = 0; j < inputW; j++) {
      paddedInput[i + padding][j + padding] = input[i][j];
    }
  }

  const outputH = Math.floor((paddedH - kernelH) / stride) + 1;
  const outputW = Math.floor((paddedW - kernelW) / stride) + 1;
  const output: number[][] = Array(outputH)
    .fill(0)
    .map(() => Array(outputW).fill(0));

  steps.push({
    id: stepId++,
    description: `初始化：输入 ${inputH}×${inputW}，卷积核 ${kernelH}×${kernelW}，步长 ${stride}，填充 ${padding}`,
    data: { input, kernel, paddedInput, output },
    variables: {
      inputH,
      inputW,
      kernelH,
      kernelW,
      stride,
      padding,
      outputH,
      outputW,
      phase: "init",
    },
  });

  if (padding > 0) {
    steps.push({
      id: stepId++,
      description: `应用 padding=${padding}，输入扩展为 ${paddedH}×${paddedW}`,
      data: { input, kernel, paddedInput, output },
      variables: { paddedH, paddedW, phase: "padding" },
    });
  }

  for (let i = 0; i < outputH; i++) {
    for (let j = 0; j < outputW; j++) {
      const startRow = i * stride;
      const startCol = j * stride;

      const currentPatch: number[][] = [];
      for (let ki = 0; ki < kernelH; ki++) {
        const row: number[] = [];
        for (let kj = 0; kj < kernelW; kj++) {
          row.push(paddedInput[startRow + ki][startCol + kj]);
        }
        currentPatch.push(row);
      }

      let sum = 0;
      const products: number[] = [];
      for (let ki = 0; ki < kernelH; ki++) {
        for (let kj = 0; kj < kernelW; kj++) {
          const prod = currentPatch[ki][kj] * kernel[ki][kj];
          products.push(prod);
          sum += prod;
        }
      }
      sum = Number(sum.toFixed(4));
      output[i][j] = sum;

      steps.push({
        id: stepId++,
        description: `位置 (${i},${j})：卷积核与输入区域点积 = ${sum.toFixed(3)}`,
        data: {
          input,
          kernel,
          paddedInput,
          output: output.map((row) => [...row]),
          currentPatch,
          products,
        },
        variables: {
          currentRow: i,
          currentCol: j,
          startRow,
          startCol,
          dotProduct: sum,
          phase: "convolve",
        },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `卷积完成！输出特征图尺寸：${outputH}×${outputW}`,
    data: { input, kernel, paddedInput, output },
    variables: { outputH, outputW, phase: "done", finished: true },
  });

  return steps;
}
