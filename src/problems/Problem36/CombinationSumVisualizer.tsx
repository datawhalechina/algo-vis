import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateCombinationSumSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface CombinationSumInput extends ProblemInput {
  candidates: number[];
  target: number;
}

function CombinationSumVisualizer() {
  return (
    <ConfigurableVisualizer<CombinationSumInput, { candidates?: number[]; target?: number }>
      config={{
        defaultInput: { candidates: [2, 3, 6, 7], target: 7 },
        algorithm: (input) => generateCombinationSumSteps(input.candidates, input.target),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "candidates", numberKey: "target", arrayLabel: "candidates", numberLabel: "target" },
        ],
        inputFields: [
          { type: "array", key: "candidates", label: "候选数组", placeholder: "输入数字，用逗号分隔" },
          { type: "number", key: "target", label: "目标值", placeholder: "请输入目标值" },
        ],
        testCases: [
          { label: "示例 1", value: { candidates: [2, 3, 6, 7], target: 7 } },
          { label: "示例 2", value: { candidates: [2, 3, 5], target: 8 } },
        ],
        
        render: ({ variables }) => {
          const path = variables?.path as number[] | undefined;
          const sum = variables?.sum as number | undefined;
          const result = variables?.result as number[][] | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">组合总和（回溯）</h3>
                
                <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-purple-700">核心思想：</span>
                    使用回溯法，每个数字可以重复使用。当和等于目标值时记录组合，大于时剪枝。
                  </p>
                </div>

                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">当前路径</div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200 min-h-[60px] flex items-center justify-center">
                    {path && path.length > 0 ? (
                      <div className="flex gap-2">
                        {path.map((num, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-lg"
                          >
                            {num}
                          </motion.div>
                        ))}
                        <div className="flex items-center ml-4 text-blue-700 font-semibold">
                          和 = {sum}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">空路径</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">已找到的组合</div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 min-h-[100px]">
                    {result && result.length > 0 ? (
                      <div className="space-y-2">
                        {result.map((combo, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-lg p-3 border border-green-300 flex items-center gap-2"
                          >
                            <span className="text-gray-600">组合 {idx + 1}:</span>
                            <div className="flex gap-1">
                              {combo.map((num, i) => (
                                <span key={i} className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center font-bold">
                                  {num}
                                </span>
                              ))}
                            </div>
                            <span className="text-green-700 font-semibold ml-2">
                              = {combo.reduce((a, b) => a + b, 0)}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-gray-500">
                        暂无组合
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default CombinationSumVisualizer;
