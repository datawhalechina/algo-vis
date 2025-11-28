import { Merge } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { ProblemInput } from "@/types/visualization";
import { mergeIntervalsSteps } from "./algorithm";

interface MergeIntervalsInput extends ProblemInput {
  intervals: number[][];
}

function MergeIntervalsVisualizer() {
  return (
    <ConfigurableVisualizer<MergeIntervalsInput, Record<string, any>>
      config={{
        defaultInput: { intervals: [[1,3],[2,6],[8,10],[15,18]] },
        algorithm: (input) => mergeIntervalsSteps(input.intervals),
        
        inputTypes: [
          { type: "array", key: "intervals", label: "intervals" },
        ],
        inputFields: [
          { type: "array", key: "intervals", label: "区间数组", placeholder: "输入区间，如 [[1,3],[2,6]]" },
        ],
        testCases: [
          { label: "示例 1", value: { intervals: [[1,3],[2,6],[8,10],[15,18]] } },
          { label: "示例 2", value: { intervals: [[1,4],[4,5]] } },
          { label: "示例 3", value: { intervals: [[1,4],[2,3]] } },
        ],
        
        render: ({ variables }) => {
          const intervals = variables?.intervals as number[][] | undefined;
          const current = variables?.current as number[] | undefined;
          const result = variables?.result as number[][] | undefined;
          const currentIndex = variables?.currentIndex as number | undefined;
          const merged = variables?.merged as boolean | undefined;
          const completed = variables?.completed as boolean | undefined;

          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Merge className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">合并区间 - 排序 + 合并</h3>
              </div>
              
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-blue-700">💡 核心思想：</span>
                  先按区间起始位置排序，然后遍历区间，判断是否重叠并合并。
                </p>
              </div>

              {/* 原始区间 */}
              {intervals && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">区间数组</div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <ArrayTemplate
                      data={intervals}
                      renderItem={(interval: number[], index: number, state) => {
                        const isActive = state.isActive;
                        return (
                          <div 
                            className="px-4 py-3 rounded-lg border-2 transition-all font-mono font-semibold"
                            style={{
                              backgroundColor: isActive ? '#dbeafe' : '#f3f4f6',
                              borderColor: isActive ? '#3b82f6' : '#d1d5db',
                              transform: isActive ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >
                            [{interval[0]}, {interval[1]}]
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

              {/* 当前区间 */}
              {current && !completed && (
                <div className="mb-6 p-4 bg-yellow-100 rounded-lg border-2 border-yellow-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-1">当前区间</div>
                    <div className="text-2xl font-bold text-yellow-700 font-mono">
                      [{current[0]}, {current[1]}]
                    </div>
                    {merged !== undefined && (
                      <div className="mt-2 text-sm">
                        {merged ? 
                          <span className="text-green-700 font-semibold">✓ 已合并</span> :
                          <span className="text-orange-700 font-semibold">→ 不重叠，开始新区间</span>
                        }
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 结果数组 */}
              {result && result.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">合并结果</div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <ArrayTemplate
                      data={result}
                      renderItem={(interval: number[]) => (
                        <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 text-green-900 border-2 border-green-400 font-mono font-bold shadow-md">
                          [{interval[0]}, {interval[1]}]
                        </div>
                      )}
                      getItemState={() => ({ isActive: false })}
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

              {/* 完成提示 */}
              {completed && result && (
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-1">合并完成</div>
                    <div className="text-xl font-bold text-green-700">
                      共 {result.length} 个区间
                    </div>
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

export default MergeIntervalsVisualizer;
