import { Split } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateCanPartitionSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface CanPartitionInput extends ProblemInput {
  nums: number[];
}

function CanPartitionVisualizer() {
  return (
    <ConfigurableVisualizer<CanPartitionInput, Record<string, never>>
      config={{
        defaultInput: { nums: [1, 5, 11, 5] },
        algorithm: (input) => generateCanPartitionSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,5,11,5" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 5, 11, 5] } },
          { label: "示例 2", value: { nums: [1, 2, 3, 5] } },
          { label: "示例 3", value: { nums: [1, 1, 1, 1] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as CanPartitionInput;
          const nums = input.nums;
          const sum = variables?.sum as number | undefined;
          const target = variables?.target as number | undefined;
          const dp = variables?.dp as boolean[] | undefined;
          const current = variables?.current as number | undefined;
          const checking = variables?.checking as number | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as boolean | undefined;
          const coreIdea = getProblemCoreIdea(112);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Split size={20} className="text-blue-600" />
                  分割等和子集（0-1背包）
                </h3>
                <p className="text-sm text-gray-600">
                  转换为0-1背包问题：能否从数组中选择一些数字，使得它们的和等于sum/2。
                </p>
              </div>

              {/* 状态信息 */}
              {(sum !== undefined || target !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">算法状态</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {sum !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">数组总和</div>
                        <div className="text-2xl font-bold text-blue-600">{sum}</div>
                      </div>
                    )}
                    {target !== undefined && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">目标和</div>
                        <div className="text-2xl font-bold text-green-600">{target}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DP状态 */}
              {dp && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">DP状态数组（能否组成和为i）</h4>
                  <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto">
                    {dp.map((value, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-3 py-2 rounded-lg font-bold text-sm ${
                          idx === checking
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white scale-110"
                            : value
                            ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                            : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700"
                        }`}
                      >
                        dp[{idx}] = {value ? 'T' : 'F'}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">数组状态</h4>
                <ArrayTemplate
                  data={nums}
                  renderItem={(item, index) => {
                    const isCurrent = current === index;
                    
                    return (
                      <motion.div
                        className="relative flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* 标签 */}
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-500 text-white"
                          >
                            处理中
                          </motion.div>
                        )}

                        {/* 元素 */}
                        <motion.div
                          className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-white text-lg transition-all ${
                            isCurrent
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-110 shadow-lg"
                              : "bg-gradient-to-br from-blue-400 to-blue-500"
                          }`}
                          animate={{
                            scale: isCurrent ? 1.1 : 1,
                          }}
                        >
                          {item}
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isCurrent ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  }}
                  getItemState={(index) => {
                    const isCurrent = current === index;
                    
                    return {
                      index,
                      isActive: isCurrent,
                      isHighlighted: isCurrent,
                    };
                  }}
                  layout={{ gap: "0.75rem", direction: "row", wrap: false }}
                />
              </div>

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className={`text-center p-4 rounded-lg border-2 ${
                    result
                      ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300"
                      : "bg-gradient-to-r from-red-100 to-rose-100 border-red-300"
                  }`}>
                    <div className={`font-semibold text-lg ${
                      result ? "text-green-700" : "text-red-700"
                    }`}>
                      {result ? '✓ 可以分割成两个等和子集！' : '✗ 无法分割成两个等和子集'}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default CanPartitionVisualizer;

