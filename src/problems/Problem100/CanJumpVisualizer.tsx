import { TrendingUp } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { canJumpSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface CanJumpInput extends ProblemInput {
  nums: number[];
}

function CanJumpVisualizer() {
  return (
    <ConfigurableVisualizer<CanJumpInput, Record<string, never>>
      config={{
        defaultInput: { nums: [2, 3, 1, 1, 4] },
        algorithm: (input) => canJumpSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔"},
        ],
        testCases: [
          { label: "示例 1 - 可以到达", value: { nums: [2, 3, 1, 1, 4] } },
          { label: "示例 2 - 无法到达", value: { nums: [3, 2, 1, 0, 4] } },
          { label: "示例 3", value: { nums: [0] } },
          { label: "示例 4", value: { nums: [2, 0, 0] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as CanJumpInput;
          const nums = input.nums;
          const currentIndex = variables?.currentIndex as number | undefined;
          const maxReach = variables?.maxReach as number | undefined;
          const canReach = variables?.canReach as boolean | undefined;
          const targetIndex = variables?.targetIndex as number | undefined;
          const jumpRange = variables?.jumpRange as number | undefined;
          const newMaxReach = variables?.newMaxReach as number | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-green-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">跳跃游戏 - 贪心算法</h3>
                </div>

                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-green-700">💡 核心思想：</span>
                    维护一个最远可达位置，遍历数组时更新这个位置。如果当前位置超过最远可达位置，说明无法继续。
                  </p>
                </div>

                {/* 数组可视化 */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">数组元素</div>
                  <div className="p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200">
                    <ArrayTemplate
                      data={nums}
                      renderItem={(value: number, index: number, state) => {
                        const isCurrent = state.isActive;
                        const isTarget = index === nums.length - 1;
                        const isReachable = state.isHighlighted;
                        const isInJumpRange = state.customState?.isInJumpRange;

                        return (
                          <div className="flex flex-col items-center gap-2">
                            {isCurrent && (
                              <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500 text-white">
                                当前
                              </span>
                            )}
                            {isTarget && (
                              <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-500 text-white">
                                目标
                              </span>
                            )}

                            <div
                              className="relative rounded-lg flex flex-col items-center justify-center p-3 font-bold text-white shadow-md"
                              style={{
                                width: '64px',
                                height: `${Math.max(60, value * 15 + 40)}px`,
                                backgroundColor: isCurrent 
                                  ? '#3b82f6' 
                                  : isTarget 
                                  ? '#ef4444'
                                  : isInJumpRange
                                  ? '#a78bfa'
                                  : isReachable 
                                  ? '#86efac' 
                                  : '#e5e7eb',
                              }}
                            >
                              <div className="text-2xl">{value}</div>
                            </div>

                            <div className={`text-xs font-semibold ${
                              isCurrent ? 'text-blue-600' : isTarget ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              [{index}]
                            </div>
                          </div>
                        );
                      }}
                      getItemState={(index: number) => ({
                        isActive: currentIndex === index,
                        isHighlighted: maxReach !== undefined && index <= maxReach,
                        customState: {
                          isInJumpRange: jumpRange !== undefined && currentIndex !== undefined && 
                                        index > currentIndex && index <= jumpRange
                        }
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

                {/* 状态信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {maxReach !== undefined && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm font-semibold text-gray-700">最远可达位置</div>
                      <div className="text-3xl font-bold text-green-600 mt-1">
                        {maxReach}
                        {newMaxReach !== undefined && newMaxReach !== maxReach && (
                          <span className="text-lg text-purple-600 ml-2">→ {newMaxReach}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {targetIndex !== undefined && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-sm font-semibold text-gray-700">目标位置</div>
                      <div className="text-3xl font-bold text-red-600 mt-1">{targetIndex}</div>
                    </div>
                  )}
                </div>

                {/* 结果 */}
                {canReach !== undefined && (
                  <div className={`mt-6 p-4 rounded-lg border-2 ${
                    canReach 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-red-100 border-red-500'
                  }`}>
                    <div className="text-center">
                      <span className={`text-2xl font-bold ${
                        canReach ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {canReach ? '✓ 可以到达终点！' : '✗ 无法到达终点'}
                      </span>
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

export default CanJumpVisualizer;
