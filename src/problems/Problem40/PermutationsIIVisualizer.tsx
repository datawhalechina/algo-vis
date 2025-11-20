import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generatePermutationsIISteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface PermutationsIIInput extends ProblemInput {
  nums: number[];
}

function PermutationsIIVisualizer() {
  return (
    <ConfigurableVisualizer<PermutationsIIInput, { nums?: number[] }>
      config={{
        defaultInput: { nums: [1, 1, 2] },
        algorithm: (input) => generatePermutationsIISteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 1, 2] } },
          { label: "示例 2", value: { nums: [1, 2, 3] } },
        ],
        
        render: ({ variables }) => {
          const path = variables?.path as number[] | undefined;
          const result = variables?.result as number[][] | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">全排列 II（去重）</h3>
                
                <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-orange-700">核心思想：</span>
                    先排序，回溯时跳过重复元素（当前元素与前一个相同且前一个未使用时跳过）。
                  </p>
                </div>

                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">当前路径</div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200 min-h-[80px] flex items-center justify-center">
                    {path && path.length > 0 ? (
                      <div className="flex gap-2">
                        {path.map((num, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-14 h-14 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-xl"
                          >
                            {num}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">空路径</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    已生成的排列 {result ? `(${result.length})` : '(0)'}
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 max-h-60 overflow-y-auto">
                    {result && result.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {result.map((perm, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg p-3 border border-green-300"
                          >
                            <div className="flex gap-1 justify-center">
                              {perm.map((num, i) => (
                                <span
                                  key={i}
                                  className="w-8 h-8 bg-green-500 text-white rounded flex items-center justify-center font-bold text-sm"
                                >
                                  {num}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-gray-500">
                        暂无排列
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

export default PermutationsIIVisualizer;
