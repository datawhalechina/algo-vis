import { Grid } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { numSquaresSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface PerfectSquaresInput extends ProblemInput {
  n: number;
}

function PerfectSquaresVisualizer() {
  return (
    <ConfigurableVisualizer<PerfectSquaresInput, Record<string, never>>
      config={{
        defaultInput: { n: 12 },
        algorithm: (input) => numSquaresSteps(input.n),
        
        inputTypes: [
          { type: "number", key: "n", label: "n", min: 1, max: 50 },
        ],
        inputFields: [
          { type: "number", key: "n", label: "目标数字 n", placeholder: "输入正整数"},
        ],
        testCases: [
          { label: "示例 1: n=12", value: { n: 12 } },
          { label: "示例 2: n=13", value: { n: 13 } },
          { label: "示例 3: n=7", value: { n: 7 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as PerfectSquaresInput;
          const n = input.n;
          const squares = variables?.squares as number[] | undefined;
          const dp = variables?.dp as number[] | undefined;
          const currentIndex = variables?.currentIndex as number | undefined;
          const square = variables?.square as number | undefined;
          const result = variables?.result as number | undefined;

          const coreIdea = getProblemCoreIdea(103);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Grid className="text-teal-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">完全平方数 - 动态规划</h3>
                </div>

                {/* 目标 */}
                <div className="mb-6 p-4 bg-teal-100 rounded-lg border-2 border-teal-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700">目标数字</div>
                    <div className="text-4xl font-bold text-teal-700">n = {n}</div>
                  </div>
                </div>

                {/* 完全平方数 */}
                {squares && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-2">可用的完全平方数</div>
                    <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                      <ArrayTemplate
                        data={squares}
                        renderItem={(value: number) => (
                          <div className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-cyan-900 border-2 border-cyan-400">
                            {value}
                          </div>
                        )}
                        getItemState={(index: number) => ({
                          isActive: square === squares[index],
                        })}
                        layout={{
                          direction: 'row',
                          gap: '0.5rem',
                          wrap: true,
                          justify: 'center'
                        }}
                        animation={{
                          duration: 0.3
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* DP数组 */}
                {dp && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-2">DP数组 (最少完全平方数数量)</div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                      <ArrayTemplate
                        data={dp.slice(0, n + 1)}
                        renderItem={(value: number, index: number, state) => {
                          const isActive = state.isActive;
                          const isInvalid = value === Infinity;
                          
                          return (
                            <div 
                              className="w-14 h-14 rounded flex flex-col items-center justify-center border"
                              style={{
                                backgroundColor: isActive 
                                  ? '#3b82f6' 
                                  : isInvalid 
                                  ? '#fee2e2' 
                                  : '#d1fae5',
                                borderColor: isActive ? '#2563eb' : '#d1d5db',
                                color: isActive ? '#ffffff' : '#1f2937',
                                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <div className="text-xs opacity-70">{index}</div>
                              <div className="text-sm font-bold">
                                {value === Infinity ? '∞' : value}
                              </div>
                            </div>
                          );
                        }}
                        getItemState={(index: number) => ({
                          isActive: currentIndex === index,
                        })}
                        layout={{
                          direction: 'row',
                          gap: '0.25rem',
                          wrap: true,
                          justify: 'center'
                        }}
                        animation={{
                          duration: 0.3
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 结果 */}
                {result !== undefined && (
                  <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-500">
                    <div className="text-center">
                      <div className="text-sm text-gray-700 mb-1">最少完全平方数数量</div>
                      <div className="text-4xl font-bold text-green-700">{result}</div>
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default PerfectSquaresVisualizer;
