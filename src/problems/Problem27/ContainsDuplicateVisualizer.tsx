import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateContainsDuplicateSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface ContainsDuplicateInput extends ProblemInput {
  nums: number[];
}

function ContainsDuplicateVisualizer() {

  return (
    <ConfigurableVisualizer<ContainsDuplicateInput, { nums?: number[] }>
      config={{
        defaultInput: { nums: [1, 2, 3, 1] },
        algorithm: (input) => generateContainsDuplicateSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,2,3,1" },
        ],
        testCases: [
          { label: "示例 1 (有重复)", value: { nums: [1, 2, 3, 1] } },
          { label: "示例 2 (无重复)", value: { nums: [1, 2, 3, 4] } },
          { label: "示例 3", value: { nums: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2] } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['seen', 'finished'].includes(key))
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
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as ContainsDuplicateInput;
          const i = variables?.i as number | undefined;
          const currentValue = variables?.currentValue as number | undefined;
          const seen = variables?.seen as number[] | undefined;
          const hasDuplicate = variables?.hasDuplicate as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          
          return (
            <>
              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">数组可视化</h3>
                
                <div className="mb-4 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-orange-700">核心思想：</span>
                    使用哈希集合记录已出现的数字。遍历数组时，如果当前数字已在集合中，则存在重复；否则将其加入集合。
                    时间复杂度 O(n)，空间复杂度 O(n)。
                  </p>
                </div>

                <div className="flex items-end justify-center gap-3 min-h-[180px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100 flex-wrap">
                  {input.nums.map((value: number, index: number) => {
                    const isCurrent = i === index;
                    const isPassed = i !== undefined && i > index;
                    const isDuplicate = currentValue === value && isCurrent && hasDuplicate;
                    const inSet = seen?.includes(value) ?? false;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isCurrent || isDuplicate ? 1.05 : 1
                        }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              isDuplicate ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                            }`}
                          >
                            {isDuplicate ? "重复！" : "当前"}
                          </motion.div>
                        )}

                        <motion.div
                          className={`text-sm font-bold ${
                            isDuplicate
                              ? "text-red-600"
                              : isCurrent
                              ? "text-blue-600"
                              : inSet
                              ? "text-green-600"
                              : isPassed
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                          animate={{
                            scale: isCurrent || isDuplicate ? 1.2 : 1,
                          }}
                        >
                          {value}
                        </motion.div>

                        <motion.div
                          className={`w-16 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                            isDuplicate
                              ? "bg-gradient-to-t from-red-500 to-red-400 shadow-lg shadow-red-200"
                              : isCurrent
                              ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-lg shadow-blue-200"
                              : inSet
                              ? "bg-gradient-to-t from-green-500 to-green-400 shadow-md shadow-green-200"
                              : isPassed
                              ? "bg-gradient-to-t from-gray-300 to-gray-200"
                              : "bg-gradient-to-t from-gray-400 to-gray-300"
                          }`}
                          style={{ height: `${Math.max(60, Math.abs(value) * 8)}px` }}
                        >
                          <span className="text-white text-sm font-bold">{value}</span>
                        </motion.div>

                        <div className={`text-xs font-semibold ${
                          isDuplicate || isCurrent ? "text-blue-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
                    <span className="text-gray-700">当前遍历</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
                    <span className="text-gray-700">已在集合中</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-red-500 to-red-400 rounded"></div>
                    <span className="text-gray-700">发现重复</span>
                  </div>
                </div>

                {/* 结果显示 */}
                {finished && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-6 text-center"
                  >
                    <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-lg text-white text-xl font-bold ${
                      hasDuplicate ? "bg-red-500" : "bg-green-500"
                    }`}>
                      {hasDuplicate ? (
                        <>
                          <XCircle size={28} />
                          存在重复元素！
                        </>
                      ) : (
                        <>
                          <CheckCircle size={28} />
                          没有重复元素
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 哈希集合可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">哈希集合（Set）</h3>
                
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-200 min-h-[120px]">
                  {!seen || seen.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
                      <p>集合为空，开始遍历...</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3 justify-center">
                      <AnimatePresence>
                        {seen.map((num, idx) => {
                          const isCurrentValue = currentValue === num && i !== undefined;
                          
                          return (
                            <motion.div
                              key={`${num}-${idx}`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ 
                                scale: isCurrentValue ? 1.15 : 1, 
                                opacity: 1 
                              }}
                              transition={{ delay: idx * 0.05 }}
                              className={`px-6 py-3 rounded-lg font-bold text-xl shadow-md transition-all ${
                                isCurrentValue && hasDuplicate
                                  ? "bg-gradient-to-br from-red-400 to-pink-400 text-white scale-110 shadow-lg"
                                  : isCurrentValue
                                  ? "bg-gradient-to-br from-blue-400 to-cyan-400 text-white scale-110 shadow-lg"
                                  : "bg-white border-2 border-green-300 text-green-700"
                              }`}
                            >
                              {num}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                  
                  {seen && seen.length > 0 && (
                    <div className="text-sm text-gray-600 text-center mt-4 pt-4 border-t border-green-200">
                      <span className="font-semibold">集合大小：</span>
                      <span className="ml-2 font-mono text-green-600 font-bold">{seen.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default ContainsDuplicateVisualizer;
