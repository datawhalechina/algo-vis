import { TrendingUp } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { ProblemInput } from "@/types/visualization";
import { lengthOfLISSteps } from "./algorithm";

interface LengthOfLISInput extends ProblemInput {
  nums: number[];
}

function LengthOfLISVisualizer() {
  return (
    <ConfigurableVisualizer<LengthOfLISInput, Record<string, any>>
      config={{
        defaultInput: { nums: [10,9,2,5,3,7,101,18] },
        algorithm: (input) => lengthOfLISSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组", placeholder: "输入整数数组" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [10,9,2,5,3,7,101,18] } },
          { label: "示例 2", value: { nums: [0,1,0,3,2,3] } },
          { label: "示例 3", value: { nums: [7,7,7,7,7,7,7] } },
        ],
        
        render: ({ variables }) => {
          const nums = variables?.nums as number[] | undefined;
          const dp = variables?.dp as number[] | undefined;
          const currentIndex = variables?.currentIndex as number | undefined;
          const compareIndex = variables?.compareIndex as number | undefined;
          const result = variables?.result as number | undefined;
          const maxLen = variables?.maxLen as number | undefined;

          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">最长递增子序列 - 动态规划</h3>
              </div>
              
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-green-700">💡 核心思想：</span>
                  dp[i] 表示以 nums[i] 结尾的最长递增子序列长度。
                </p>
              </div>

              {/* 原数组 */}
              {nums && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">原数组</div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <ArrayTemplate
                      data={nums}
                      renderItem={(value: number, index: number, state) => {
                        const isActive = state.isActive;
                        const isCompare = index === compareIndex;
                        return (
                          <div 
                            className="w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold border-2 transition-all"
                            style={{
                              backgroundColor: isActive ? '#bbf7d0' : isCompare ? '#fef3c7' : '#f3f4f6',
                              borderColor: isActive ? '#16a34a' : isCompare ? '#f59e0b' : '#d1d5db',
                              transform: isActive || isCompare ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >
                            <div className="text-xs opacity-70">[{index}]</div>
                            <div className="text-lg">{value}</div>
                          </div>
                        );
                      }}
                      getItemState={(index: number) => ({
                        isActive: currentIndex === index,
                      })}
                      layout={{
                        direction: 'row',
                        gap: '0.5rem',
                        wrap: true,
                        justify: 'center'
                      }}
                      animation={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* DP数组 */}
              {dp && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">DP数组（以该位置结尾的最长递增子序列长度）</div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <ArrayTemplate
                      data={dp}
                      renderItem={(value: number, index: number, state) => {
                        const isActive = state.isActive;
                        return (
                          <div 
                            className="w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold border-2 transition-all"
                            style={{
                              backgroundColor: isActive ? '#3b82f6' : '#dbeafe',
                              borderColor: isActive ? '#2563eb' : '#93c5fd',
                              color: isActive ? '#ffffff' : '#1e40af',
                              transform: isActive ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >
                            <div className="text-xs opacity-70">[{index}]</div>
                            <div className="text-lg">{value}</div>
                          </div>
                        );
                      }}
                      getItemState={(index: number) => ({
                        isActive: currentIndex === index,
                      })}
                      layout={{
                        direction: 'row',
                        gap: '0.5rem',
                        wrap: true,
                        justify: 'center'
                      }}
                      animation={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* 当前最大值 */}
              {maxLen !== undefined && (
                <div className="mb-6 p-4 bg-purple-100 rounded-lg border-2 border-purple-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700">当前最大长度</div>
                    <div className="text-3xl font-bold text-purple-700">{maxLen}</div>
                  </div>
                </div>
              )}

              {/* 最终结果 */}
              {result !== undefined && (
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-1">最长递增子序列长度</div>
                    <div className="text-4xl font-bold text-green-700">{result}</div>
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

export default LengthOfLISVisualizer;
