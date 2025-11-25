import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateNextPermutationSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface NextPermutationInput extends ProblemInput {
  nums: number[];
}

function NextPermutationVisualizer() {
  return (
    <ConfigurableVisualizer<NextPermutationInput, { nums?: number[] }>
      config={{
        defaultInput: { nums: [1, 2, 3] },
        algorithm: (input) => generateNextPermutationSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,2,3" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 2, 3] } },
          { label: "示例 2", value: { nums: [3, 2, 1] } },
          { label: "示例 3", value: { nums: [1, 1, 5] } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['nums', 'finished'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-mono text-blue-600 font-semibold">{key}</span>
                      <span className="text-gray-500"> = </span>
                      <span className="font-mono text-gray-800 font-semibold">
                        {JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
              </div>
            );
          }
          return null;
        },
        
        render: ({ variables }) => {
          const nums = variables?.nums as number[] | undefined;
          const i = variables?.i as number | undefined;
          const j = variables?.j as number | undefined;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const reverseStart = variables?.reverseStart as number | undefined;
          const finished = variables?.finished as boolean | undefined;
          
          if (!nums) return null;
          
          return (
            <>
              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">下一个排列可视化</h3>
                
                <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-indigo-700">核心思想：</span>
                    1) 从后向前找第一个升序对 nums[i] &lt; nums[i+1]；
                    2) 从后向前找第一个大于 nums[i] 的元素 nums[j]；
                    3) 交换 nums[i] 和 nums[j]；
                    4) 将 i+1 到末尾的部分反转。
                  </p>
                </div>

                <div className="flex items-end justify-center gap-3 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {nums.map((value, index) => {
                    const isI = i === index;
                    const isJ = j === index;
                    const isLeft = left === index;
                    const isRight = right === index;
                    const inReverseRange = reverseStart !== undefined && index >= reverseStart;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isI || isJ || isLeft || isRight ? 1.1 : 1
                        }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* 标签 */}
                        {(isI || isJ || isLeft || isRight) && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              isI ? "bg-yellow-500 text-white" :
                              isJ ? "bg-purple-500 text-white" :
                              isLeft ? "bg-blue-500 text-white" :
                              "bg-green-500 text-white"
                            }`}
                          >
                            {isI ? "i" : isJ ? "j" : isLeft ? "left" : "right"}
                          </motion.div>
                        )}

                        {/* 值显示 */}
                        <motion.div
                          className={`text-sm font-bold ${
                            isI ? "text-yellow-600" :
                            isJ ? "text-purple-600" :
                            isLeft || isRight ? "text-blue-600" :
                            inReverseRange ? "text-green-600" :
                            "text-gray-600"
                          }`}
                          animate={{
                            scale: isI || isJ || isLeft || isRight ? 1.2 : 1,
                          }}
                        >
                          {value}
                        </motion.div>

                        {/* 柱状图 */}
                        <motion.div
                          className={`w-16 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                            isI ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-200" :
                            isJ ? "bg-gradient-to-t from-purple-500 to-purple-400 shadow-lg shadow-purple-200" :
                            isLeft || isRight ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-lg shadow-blue-200" :
                            inReverseRange ? "bg-gradient-to-t from-green-500 to-green-400 shadow-md shadow-green-200" :
                            "bg-gradient-to-t from-gray-400 to-gray-300"
                          }`}
                          style={{ height: `${Math.max(60, Math.abs(value) * 10)}px` }}
                          animate={{
                            scale: isI || isJ || isLeft || isRight ? 1.05 : 1,
                          }}
                        >
                          <span className="text-white text-sm font-bold">{value}</span>
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isI || isJ || isLeft || isRight ? "text-blue-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* 图例 */}
                <div className="flex items-center justify-center gap-6 mt-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded"></div>
                    <span className="text-gray-700">位置 i</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-purple-500 to-purple-400 rounded"></div>
                    <span className="text-gray-700">位置 j</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
                    <span className="text-gray-700">反转指针</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
                    <span className="text-gray-700">反转范围</span>
                  </div>
                </div>

                {finished && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300"
                  >
                    <div className="text-center text-green-700 font-semibold">
                      ✓ 完成！下一个排列为: [{nums.join(', ')}]
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 算法步骤说明 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">算法步骤</h3>
                
                <div className="space-y-3">
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="font-semibold text-yellow-700 mb-2">步骤 1: 找升序对</div>
                    <div className="text-sm text-gray-700">
                      从后向前找第一个 nums[i] &lt; nums[i+1] 的位置 i
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="font-semibold text-purple-700 mb-2">步骤 2: 找交换元素</div>
                    <div className="text-sm text-gray-700">
                      从后向前找第一个大于 nums[i] 的元素位置 j
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="font-semibold text-blue-700 mb-2">步骤 3: 交换</div>
                    <div className="text-sm text-gray-700">
                      交换 nums[i] 和 nums[j]
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="font-semibold text-green-700 mb-2">步骤 4: 反转</div>
                    <div className="text-sm text-gray-700">
                      将 i+1 到末尾的部分反转，得到最小的字典序
                    </div>
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

export default NextPermutationVisualizer;
