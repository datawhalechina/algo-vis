import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateSearchInsertSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { Target, CheckCircle, Search } from "lucide-react";

interface SearchInsertInput extends ProblemInput {
  nums: number[];
  target: number;
}

interface SearchInsertData {
  nums?: number[];
  target?: number;
}

function SearchInsertVisualizer() {
  return (
    <ConfigurableVisualizer<SearchInsertInput, SearchInsertData>
      config={{
        defaultInput: { nums: [1, 3, 5, 6], target: 5 },
        algorithm: (input) => generateSearchInsertSteps(input.nums, input.target),
        
        inputTypes: [
          { type: "array", key: "nums", label: "有序数组" },
          { type: "number", key: "target", label: "目标值" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "有序数组 nums", placeholder: "输入有序数组，如: 1,3,5,6" },
          { type: "number", key: "target", label: "目标值 target", placeholder: "输入目标值，如: 5" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 3, 5, 6], target: 5 } },
          { label: "示例 2", value: { nums: [1, 3, 5, 6], target: 2 } },
          { label: "示例 3", value: { nums: [1, 3, 5, 6], target: 7 } },
          { label: "示例 4", value: { nums: [1, 3, 5, 6], target: 0 } },
        ],
        
        customStepVariables: (variables) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {variables.left !== undefined && (
              <div>
                <span className="font-mono text-blue-600 font-semibold">left</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.left as number}</span>
              </div>
            )}
            {variables.right !== undefined && (
              <div>
                <span className="font-mono text-green-600 font-semibold">right</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.right as number}</span>
              </div>
            )}
            {variables.mid !== undefined && (
              <div>
                <span className="font-mono text-purple-600 font-semibold">mid</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.mid as number}</span>
              </div>
            )}
            {variables.target !== undefined && (
              <div>
                <span className="font-mono text-orange-600 font-semibold">target</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.target as number}</span>
              </div>
            )}
          </div>
        ),
        
        render: ({ data, getNumberVariable, getBooleanVariable }) => {
          const { nums = [], target = 0 } = data;
          const left = getNumberVariable('left');
          const right = getNumberVariable('right');
          const mid = getNumberVariable('mid');
          const found = getBooleanVariable('found');
          const result = getNumberVariable('result');
          const finished = getBooleanVariable('finished');
          
          const coreIdea = getProblemCoreIdea(14);
          
          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Search className="text-blue-600" size={20} />
                搜索插入位置 - 二分查找
              </h3>
              
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="mb-6 flex items-center justify-center gap-3 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <Target className="text-orange-600" size={24} />
                <span className="text-lg">目标值：</span>
                <span className="text-3xl font-bold text-orange-600">{target}</span>
              </div>

              <div className="flex gap-2 items-center flex-wrap justify-center">
                {nums.map((num: number, index: number) => {
                  const isLeft = left === index;
                  const isRight = right === index;
                  const isMid = mid === index;
                  const inRange = left !== undefined && right !== undefined && index >= left && index <= right;
                  const outOfRange = !inRange && !finished;
                  
                  return (
                    <motion.div
                      key={index}
                      className="relative"
                      animate={{
                        scale: isMid ? 1.15 : isLeft || isRight ? 1.1 : 1,
                        opacity: outOfRange ? 0.3 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl border-2 ${
                          isMid && found
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-xl'
                            : isMid
                            ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white border-purple-700 shadow-lg'
                            : isLeft
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-700'
                            : isRight
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700'
                            : inRange
                            ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 border-gray-400'
                            : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}
                      >
                        {num}
                      </motion.div>
                      
                      {isLeft && !finished && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-600 whitespace-nowrap"
                        >
                          ↓ L
                        </motion.div>
                      )}
                      {isRight && !finished && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-green-600 whitespace-nowrap"
                        >
                          ↓ R
                        </motion.div>
                      )}
                      {isMid && !finished && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-purple-600 whitespace-nowrap"
                        >
                          M ↑
                        </motion.div>
                      )}
                      
                      <div className="text-center text-xs text-gray-400 mt-1">{index}</div>
                    </motion.div>
                  );
                })}
              </div>

              {finished && result !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-8 rounded-2xl p-6 shadow-xl text-center text-white ${
                    found
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <CheckCircle className="mx-auto mb-3" size={48} />
                  </motion.div>
                  <div className="text-2xl font-bold mb-2">
                    {found ? '找到目标！' : '插入位置确定'}
                  </div>
                  <div className="text-lg">
                    {found ? `目标值在索引 ${result}` : `应该插入到索引 ${result}`}
                  </div>
                </motion.div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default SearchInsertVisualizer;
