import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateConvolutionSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface ConvolutionInput extends ProblemInput {
  input: string | number[][];
  kernel: string | number[][];
  stride: number;
  padding: number;
}

const defaultInput = "[[1,2,3,0,1],[0,1,2,3,1],[3,0,1,2,1],[2,3,0,1,0],[1,2,3,0,1]]";
const defaultKernel = "[[1,0,1],[0,1,0],[1,0,1]]";

function parseMatrix(raw: string | number[][]): number[][] {
  if (Array.isArray(raw)) return raw as number[][];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((row: unknown) => Array.isArray(row))) {
      return parsed as number[][];
    }
  } catch {
    console.warn("解析矩阵失败，使用默认值");
  }
  return JSON.parse(defaultInput) as number[][];
}

function getCellColor(
  rowIdx: number,
  colIdx: number,
  startRow: number | undefined,
  startCol: number | undefined,
  kernelH: number,
  kernelW: number,
  phase: string
): string {
  if (phase !== "convolve" || startRow === undefined || startCol === undefined) {
    return "bg-slate-50";
  }
  if (
    rowIdx >= startRow &&
    rowIdx < startRow + kernelH &&
    colIdx >= startCol &&
    colIdx < startCol + kernelW
  ) {
    return "bg-blue-100 border-blue-400";
  }
  return "bg-slate-50";
}

function ConvolutionVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10026);

  return (
    <ConfigurableVisualizer<ConvolutionInput, Record<string, never>>
      config={{
        defaultInput: {
          input: defaultInput,
          kernel: defaultKernel,
          stride: 1,
          padding: 0,
        },
        algorithm: (input) => {
          const inputMatrix = parseMatrix(input.input);
          const kernelMatrix = parseMatrix(input.kernel);
          const stride = Math.max(1, Math.floor(input.stride || 1));
          const padding = Math.max(0, Math.floor(input.padding || 0));
          return generateConvolutionSteps(inputMatrix, kernelMatrix, stride, padding);
        },
        inputTypes: [
          { type: "string", key: "input", label: "输入矩阵（JSON）" },
          { type: "string", key: "kernel", label: "卷积核（JSON）" },
          { type: "number", key: "stride", label: "步长", min: 1 },
          { type: "number", key: "padding", label: "填充", min: 0 },
        ],
        inputFields: [
          { type: "string", key: "input", label: "输入矩阵（JSON）", placeholder: defaultInput },
          { type: "string", key: "kernel", label: "卷积核（JSON）", placeholder: defaultKernel },
          { type: "number", key: "stride", label: "步长", placeholder: "1" },
          { type: "number", key: "padding", label: "填充", placeholder: "0" },
        ],
        testCases: [
          {
            label: "默认示例",
            value: { input: defaultInput, kernel: defaultKernel, stride: 1, padding: 0 },
          },
          {
            label: "带填充",
            value: { input: defaultInput, kernel: defaultKernel, stride: 1, padding: 1 },
          },
          {
            label: "步长为2",
            value: { input: defaultInput, kernel: defaultKernel, stride: 2, padding: 0 },
          },
        ],
        render: ({ variables }) => {
          const currentInput = variables?.input as string | undefined;
          const currentKernel = variables?.kernel as string | undefined;
          const paddedInput = (variables?.paddedInput as number[][] | undefined) || 
            parseMatrix(currentInput || defaultInput);
          const kernel = parseMatrix(currentKernel || defaultKernel);
          const output = (variables?.output as number[][] | undefined) || [];
          const currentPatch = variables?.currentPatch as number[][] | undefined;
          const phase = (variables?.phase as string) || "init";
          const startRow = variables?.startRow as number | undefined;
          const startCol = variables?.startCol as number | undefined;
          const currentRow = variables?.currentRow as number | undefined;
          const currentCol = variables?.currentCol as number | undefined;
          const dotProduct = variables?.dotProduct as number | undefined;
          const kernelH = kernel.length;
          const kernelW = kernel[0]?.length || 0;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  2D 卷积操作
                </h3>
                <p className="text-sm text-gray-600">
                  卷积核在输入特征图上滑动，每个位置计算元素乘积之和，生成输出特征图。
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    输入（含填充）
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="border-collapse mx-auto">
                      <tbody>
                        {paddedInput.map((row, i) => (
                          <tr key={i}>
                            {row.map((val, j) => (
                              <td
                                key={j}
                                className={`w-9 h-9 text-center text-xs font-mono border ${getCellColor(
                                  i, j, startRow, startCol, kernelH, kernelW, phase
                                )}`}
                              >
                                {val.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">卷积核</h4>
                  <div className="overflow-x-auto">
                    <table className="border-collapse mx-auto">
                      <tbody>
                        {kernel.map((row, i) => (
                          <tr key={i}>
                            {row.map((val, j) => (
                              <td
                                key={j}
                                className="w-9 h-9 text-center text-xs font-mono border bg-amber-50 border-amber-300"
                              >
                                {val.toFixed(1)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {currentPatch && phase === "convolve" && (
                    <div className="mt-4">
                      <h5 className="text-xs font-semibold text-gray-600 mb-2">当前窗口</h5>
                      <table className="border-collapse mx-auto">
                        <tbody>
                          {currentPatch.map((row, i) => (
                            <tr key={i}>
                              {row.map((val, j) => (
                                <td
                                  key={j}
                                  className="w-9 h-9 text-center text-xs font-mono border bg-blue-50 border-blue-300"
                                >
                                  {val.toFixed(1)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">输出特征图</h4>
                  {output.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="border-collapse mx-auto">
                        <tbody>
                          {output.map((row, i) => (
                            <tr key={i}>
                              {row.map((val, j) => {
                                const isActive =
                                  phase === "convolve" && i === currentRow && j === currentCol;
                                return (
                                  <td
                                    key={j}
                                    className={`w-10 h-10 text-center text-xs font-mono border ${
                                      isActive
                                        ? "bg-emerald-200 border-emerald-500 font-bold"
                                        : val !== 0
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    {val.toFixed(1)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">等待计算...</div>
                  )}
                </div>
              </div>

              {phase === "convolve" && dotProduct !== undefined && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                  <div className="text-sm text-blue-800">
                    <span className="font-semibold">当前位置 ({currentRow}, {currentCol})：</span>
                    <span className="ml-2">点积结果 = {dotProduct.toFixed(3)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default ConvolutionVisualizer;
