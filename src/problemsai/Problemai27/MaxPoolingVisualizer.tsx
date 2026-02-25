import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateMaxPoolingSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface MaxPoolingInput extends ProblemInput {
  input: string | number[][];
  poolSize: number;
  stride: number;
}

const defaultInput = "[[1,3,2,4],[5,6,1,2],[7,2,3,8],[4,9,5,1]]";

function parseMatrix(raw: string | number[][]): number[][] {
  if (Array.isArray(raw)) return raw as number[][];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((row: unknown) => Array.isArray(row))) {
      return parsed as number[][];
    }
  } catch {
    console.warn("解析矩阵失败");
  }
  return JSON.parse(defaultInput) as number[][];
}

function MaxPoolingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10027);

  return (
    <ConfigurableVisualizer<MaxPoolingInput, Record<string, never>>
      config={{
        defaultInput: {
          input: defaultInput,
          poolSize: 2,
          stride: 2,
        },
        algorithm: (input) => {
          const inputMatrix = parseMatrix(input.input);
          const poolSize = Math.max(1, Math.floor(input.poolSize || 2));
          const stride = Math.max(1, Math.floor(input.stride || 2));
          return generateMaxPoolingSteps(inputMatrix, poolSize, stride);
        },
        inputTypes: [
          { type: "string", key: "input", label: "输入矩阵（JSON）" },
          { type: "number", key: "poolSize", label: "池化窗口大小", min: 1 },
          { type: "number", key: "stride", label: "步长", min: 1 },
        ],
        inputFields: [
          { type: "string", key: "input", label: "输入矩阵（JSON）", placeholder: defaultInput },
          { type: "number", key: "poolSize", label: "池化窗口大小", placeholder: "2" },
          { type: "number", key: "stride", label: "步长", placeholder: "2" },
        ],
        testCases: [
          { label: "默认 2×2", value: { input: defaultInput, poolSize: 2, stride: 2 } },
          { label: "3×3 池化", value: { input: "[[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15],[16,17,18,19,20],[21,22,23,24,25]]", poolSize: 3, stride: 1 } },
          { label: "重叠池化", value: { input: defaultInput, poolSize: 2, stride: 1 } },
        ],
        render: ({ variables }) => {
          const input = (variables?.input as number[][] | undefined) || parseMatrix(defaultInput);
          const output = (variables?.output as number[][] | undefined) || [];
          const poolWindow = variables?.poolWindow as number[][] | undefined;
          const phase = (variables?.phase as string) || "init";
          const startRow = variables?.startRow as number | undefined;
          const startCol = variables?.startCol as number | undefined;
          const currentRow = variables?.currentRow as number | undefined;
          const currentCol = variables?.currentCol as number | undefined;
          const maxVal = variables?.maxVal as number | undefined;
          const maxRow = variables?.maxRow as number | undefined;
          const maxCol = variables?.maxCol as number | undefined;
          const poolSize = (variables?.poolSize as number) || 2;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">最大池化</h3>
                <p className="text-sm text-gray-600">
                  在每个池化窗口中选取最大值，保留最显著的特征，同时降低空间维度。
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">输入特征图</h4>
                  <div className="overflow-x-auto">
                    <table className="border-collapse mx-auto">
                      <tbody>
                        {input.map((row, i) => (
                          <tr key={i}>
                            {row.map((val, j) => {
                              const inWindow =
                                phase === "pooling" &&
                                startRow !== undefined &&
                                startCol !== undefined &&
                                i >= startRow &&
                                i < startRow + poolSize &&
                                j >= startCol &&
                                j < startCol + poolSize;
                              const isMax = inWindow && i === maxRow && j === maxCol;
                              return (
                                <td
                                  key={j}
                                  className={`w-10 h-10 text-center text-sm font-mono border ${
                                    isMax
                                      ? "bg-emerald-300 border-emerald-500 font-bold"
                                      : inWindow
                                      ? "bg-blue-100 border-blue-400"
                                      : "bg-slate-50 border-slate-200"
                                  }`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">当前池化窗口</h4>
                  {poolWindow && phase === "pooling" ? (
                    <div className="overflow-x-auto">
                      <table className="border-collapse mx-auto">
                        <tbody>
                          {poolWindow.map((row, i) => (
                            <tr key={i}>
                              {row.map((val, j) => {
                                const isMax = val === maxVal;
                                return (
                                  <td
                                    key={j}
                                    className={`w-12 h-12 text-center text-sm font-mono border ${
                                      isMax
                                        ? "bg-emerald-200 border-emerald-500 font-bold"
                                        : "bg-blue-50 border-blue-300"
                                    }`}
                                  >
                                    {val}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-3 text-center text-sm text-emerald-700 font-semibold">
                        最大值: {maxVal}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-8">
                      等待池化操作...
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
                                const isActive = i === currentRow && j === currentCol;
                                return (
                                  <td
                                    key={j}
                                    className={`w-12 h-12 text-center text-sm font-mono border ${
                                      isActive
                                        ? "bg-emerald-300 border-emerald-500 font-bold"
                                        : val !== 0
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    {val}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-8">等待计算...</div>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">池化特点</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• 降低特征图空间尺寸，减少计算量</li>
                  <li>• 保留最显著特征，增强平移不变性</li>
                  <li>• 不引入可学习参数</li>
                </ul>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default MaxPoolingVisualizer;
