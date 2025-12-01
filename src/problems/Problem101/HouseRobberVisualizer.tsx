import { Home } from "lucide-react";
import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { robSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface HouseRobberInput extends ProblemInput {
  nums: number[];
}

function HouseRobberVisualizer() {
  return (
    <ConfigurableVisualizer<HouseRobberInput, Record<string, never>>
      config={{
        defaultInput: { nums: [1, 2, 3, 1] },
        algorithm: (input) => robSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "房屋金额", placeholder: "输入每个房屋的金额"},
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 2, 3, 1] } },
          { label: "示例 2", value: { nums: [2, 7, 9, 3, 1] } },
          { label: "示例 3", value: { nums: [2, 1, 1, 2] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as HouseRobberInput;
          const nums = input.nums;
          const dp = variables?.dp as number[] | undefined;
          const currentIndex = variables?.currentIndex as number | undefined;
          const result = variables?.result as number | undefined;
          const completed = variables?.completed as boolean | undefined;
          const notRob = variables?.notRob as number | undefined;
          const rob = variables?.rob as number | undefined;

          const coreIdea = getProblemCoreIdea(101);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="text-amber-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">打家劫舍 - 动态规划</h3>
                </div>

                {/* 房屋可视化 */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">房屋与金额</div>
                  <div className="flex gap-3 flex-wrap justify-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200">
                    {nums.map((value, idx) => {
                      const isCurrent = currentIndex === idx;
                      const hasDP = dp && dp[idx] !== undefined && dp[idx] > 0;

                      return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          {isCurrent && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500 text-white">
                              当前
                            </span>
                          )}

                          <motion.div
                            animate={{
                              scale: isCurrent ? 1.15 : 1,
                              borderColor: isCurrent ? '#3b82f6' : '#d1d5db',
                            }}
                            className="relative bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg flex flex-col items-center justify-center p-4 border-4 shadow-lg"
                            style={{
                              width: '80px',
                              height: '90px',
                            }}
                          >
                            {/* 房屋图标 */}
                            <Home className="text-amber-700 mb-1" size={24} />
                            {/* 金额 */}
                            <div className="text-2xl font-bold text-amber-900">${value}</div>
                          </motion.div>

                          {/* DP值 */}
                          {hasDP && (
                            <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                              dp[{idx}]={dp[idx]}
                            </div>
                          )}

                          <div className={`text-xs font-semibold ${
                            isCurrent ? 'text-blue-600' : 'text-gray-500'
                          }`}>
                            房屋 {idx}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 决策信息 */}
                {(notRob !== undefined || rob !== undefined) && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-semibold text-gray-800 mb-2">当前决策</div>
                    <div className="grid grid-cols-2 gap-4">
                      {notRob !== undefined && (
                        <div className="p-3 bg-white rounded border border-gray-300">
                          <div className="text-xs text-gray-600">不偷当前房屋</div>
                          <div className="text-2xl font-bold text-gray-700">${notRob}</div>
                        </div>
                      )}
                      {rob !== undefined && (
                        <div className="p-3 bg-amber-100 rounded border border-amber-400">
                          <div className="text-xs text-amber-700">偷当前房屋</div>
                          <div className="text-2xl font-bold text-amber-700">${rob}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* DP数组 */}
                {dp && dp.some(v => v > 0) && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-2">DP数组 (最大偷窃金额)</div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <ArrayTemplate
                        data={dp}
                        renderItem={(value: number, index: number) => (
                          <div className="w-20 h-20 rounded-lg flex flex-col items-center justify-center border-2">
                            <div className="text-xs opacity-70">dp[{index}]</div>
                            <div className="text-2xl font-bold">${value}</div>
                          </div>
                        )}
                        getItemState={(index: number) => ({
                          isActive: currentIndex === index,
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

                {/* 结果 */}
                {completed && result !== undefined && (
                  <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-500">
                    <div className="text-center">
                      <div className="text-sm text-gray-700 mb-1">最大偷窃金额</div>
                      <div className="text-4xl font-bold text-green-700">
                        ${result}
                      </div>
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

export default HouseRobberVisualizer;
