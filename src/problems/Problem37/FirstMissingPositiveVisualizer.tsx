import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateFirstMissingPositiveSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface FirstMissingPositiveInput extends ProblemInput {
  nums: number[];
}

function FirstMissingPositiveVisualizer() {
  return (
    <ConfigurableVisualizer<FirstMissingPositiveInput, { nums?: number[] }>
      config={{
        defaultInput: { nums: [3, 4, -1, 1] },
        algorithm: (input) => generateFirstMissingPositiveSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [3, 4, -1, 1] } },
          { label: "示例 2", value: { nums: [7, 8, 9, 11, 12] } },
          { label: "示例 3", value: { nums: [1, 2, 0] } },
        ],
        
        render: ({ variables }) => {
          const nums = variables?.nums as number[] | undefined;
          const i = variables?.i as number | undefined;
          const targetIdx = variables?.targetIdx as number | undefined;
          const result = variables?.result as number | undefined;

          if (!nums) return null;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">缺失的第一个正数</h3>
                
                <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-orange-700">核心思想：</span>
                    原地哈希，将每个正数 x 放到索引 x-1 的位置。然后遍历找第一个不匹配的位置。
                  </p>
                </div>

                <div className="flex items-end justify-center gap-3 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {nums.map((value, index) => {
                    const isCurrent = i === index;
                    const isTarget = targetIdx === index;
                    const isCorrect = value === index + 1;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {(isCurrent || isTarget) && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              isCurrent ? "bg-yellow-500 text-white" : "bg-purple-500 text-white"
                            }`}
                          >
                            {isCurrent ? "当前" : "目标"}
                          </motion.div>
                        )}

                        <motion.div
                          className={`w-16 rounded-lg transition-all duration-300 flex items-center justify-center ${
                            isCurrent || isTarget ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-200" :
                            isCorrect ? "bg-gradient-to-t from-green-500 to-green-400" :
                            value > 0 && value <= nums.length ? "bg-gradient-to-t from-blue-500 to-blue-400" :
                            "bg-gradient-to-t from-gray-400 to-gray-300"
                          }`}
                          style={{ height: `${Math.max(60, 80)}px` }}
                        >
                          <span className="text-white text-lg font-bold">{value}</span>
                        </motion.div>

                        <div className="text-xs text-gray-600">
                          期望: {index + 1}
                        </div>

                        <div className="text-xs font-semibold text-gray-500">
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {result !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300"
                  >
                    <div className="text-center text-green-700 font-semibold text-xl">
                      ✓ 缺失的第一个正数是: {result}
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default FirstMissingPositiveVisualizer;
