import { X } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";
import { maxProductSteps } from "./algorithm";

interface MaxProductInput extends ProblemInput {
  nums: number[];
}

function MaxProductVisualizer() {
  return (
    <ConfigurableVisualizer<MaxProductInput, Record<string, any>>
      config={{
        defaultInput: { nums: [2,3,-2,4] },
        algorithm: (input) => maxProductSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组", placeholder: "输入整数数组" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [2,3,-2,4] } },
          { label: "示例 2", value: { nums: [-2,0,-1] } },
          { label: "示例 3", value: { nums: [-2,3,-4] } },
        ],
        
        render: ({ variables }) => {
          const nums = variables?.nums as number[] | undefined;
          const maxDP = variables?.maxDP as number | undefined;
          const minDP = variables?.minDP as number | undefined;
          const result = variables?.result as number | undefined;
          const currentIndex = variables?.currentIndex as number | undefined;
          const currentValue = variables?.currentValue as number | undefined;

          const coreIdea = getProblemCoreIdea(108);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <X className="text-red-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">乘积最大子数组 - 动态规划</h3>
                </div>

              {/* 数组 */}
              {nums && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">数组</div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <ArrayTemplate
                      data={nums}
                      renderItem={(value: number, index: number, state) => {
                        const isActive = state.isActive;
                        const isNegative = value < 0;
                        return (
                          <div 
                            className="w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold border-2 transition-all"
                            style={{
                              backgroundColor: isActive 
                                ? '#fca5a5' 
                                : isNegative 
                                ? '#fecaca' 
                                : '#dbeafe',
                              borderColor: isActive ? '#dc2626' : isNegative ? '#f87171' : '#93c5fd',
                              color: isActive ? '#7f1d1d' : isNegative ? '#991b1b' : '#1e40af',
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

              {/* 当前值 */}
              {currentValue !== undefined && currentIndex !== undefined && (
                <div className="mb-6 p-4 bg-blue-100 rounded-lg border-2 border-blue-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700">当前位置</div>
                    <div className="text-2xl font-bold text-blue-700">
                      索引 {currentIndex}，值 = {currentValue}
                    </div>
                  </div>
                </div>
              )}

              {/* maxDP 和 minDP */}
              {maxDP !== undefined && minDP !== undefined && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-green-100 rounded-lg border-2 border-green-500">
                    <div className="text-center">
                      <div className="text-sm text-gray-700 mb-1">当前最大乘积 maxDP</div>
                      <div className="text-3xl font-bold text-green-700">{maxDP}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-100 rounded-lg border-2 border-purple-500">
                    <div className="text-center">
                      <div className="text-sm text-gray-700 mb-1">当前最小乘积 minDP</div>
                      <div className="text-3xl font-bold text-purple-700">{minDP}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 全局最大值 */}
              {result !== undefined && (
                <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border-2 border-orange-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-1">全局最大乘积</div>
                    <div className="text-4xl font-bold text-orange-700">{result}</div>
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

export default MaxProductVisualizer;
