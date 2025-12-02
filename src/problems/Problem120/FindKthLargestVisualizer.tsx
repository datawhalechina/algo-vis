import { Trophy } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateFindKthLargestSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface FindKthLargestInput extends ProblemInput {
  nums: number[];
  k: number;
}

function FindKthLargestVisualizer() {
  return (
    <ConfigurableVisualizer<FindKthLargestInput, Record<string, never>>
      config={{
        defaultInput: { nums: [3, 2, 1, 5, 6, 4], k: 2 },
        algorithm: (input) => generateFindKthLargestSteps(input.nums, input.k),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "k", arrayLabel: "nums", numberLabel: "k" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 3,2,1,5,6,4" },
          { type: "number", key: "k", label: "k", placeholder: "请输入k值" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [3, 2, 1, 5, 6, 4], k: 2 } },
          { label: "示例 2", value: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 } },
          { label: "示例 3", value: { nums: [1], k: 1 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as FindKthLargestInput;
          const nums = (variables?.nums || input.nums) as number[];
          const k = input.k;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const pivotIndex = variables?.pivotIndex as number | undefined;
          const i = variables?.i as number | undefined;
          const j = variables?.j as number | undefined;
          const pivot = variables?.pivot as number | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as number | undefined;
          const coreIdea = getProblemCoreIdea(120);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Trophy size={20} className="text-blue-600" />
                  数组中的第K个最大元素（快速选择）
                </h3>
                <p className="text-sm text-gray-600">
                  使用快速选择算法，类似快速排序，但只递归处理包含第k大元素的那一部分。
                </p>
              </div>

              {/* 状态信息 */}
              {(left !== undefined || right !== undefined || pivotIndex !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">算法状态</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {left !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">left</div>
                        <div className="text-2xl font-bold text-blue-600">{left}</div>
                      </div>
                    )}
                    {right !== undefined && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">right</div>
                        <div className="text-2xl font-bold text-purple-600">{right}</div>
                      </div>
                    )}
                    {pivotIndex !== undefined && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">pivot位置</div>
                        <div className="text-2xl font-bold text-green-600">{pivotIndex}</div>
                      </div>
                    )}
                  </div>
                  {pivot !== undefined && (
                    <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="text-xs text-gray-600 mb-1">pivot值</div>
                      <div className="text-2xl font-bold text-yellow-600">{pivot}</div>
                    </div>
                  )}
                </div>
              )}

              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">数组状态</h4>
                <ArrayTemplate
                  data={nums}
                  renderItem={(item, index) => {
                    const isLeft = left === index;
                    const isRight = right === index;
                    const isPivot = pivotIndex === index;
                    const isI = i === index;
                    const isJ = j === index;
                    const inRange = left !== undefined && right !== undefined && 
                      index >= left && index <= right;
                    const isResult = result !== undefined && nums[index] === result;
                    
                    return (
                      <motion.div
                        className="relative flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* 标签 */}
                        <div className="flex gap-1">
                          {isLeft && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white"
                            >
                              L
                            </motion.div>
                          )}
                          {isRight && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-purple-500 text-white"
                            >
                              R
                            </motion.div>
                          )}
                          {isPivot && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white"
                            >
                              P
                            </motion.div>
                          )}
                          {isI && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-500 text-white"
                            >
                              i
                            </motion.div>
                          )}
                          {isJ && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white"
                            >
                              j
                            </motion.div>
                          )}
                          {isResult && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white"
                            >
                              结果
                            </motion.div>
                          )}
                        </div>

                        {/* 元素 */}
                        <motion.div
                          className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-white text-lg transition-all ${
                            isResult
                              ? "bg-gradient-to-br from-red-500 to-red-600 scale-110 shadow-lg"
                              : isPivot
                              ? "bg-gradient-to-br from-green-500 to-green-600 scale-110 shadow-lg"
                              : isI || isJ
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-105 shadow-md"
                              : isLeft || isRight
                              ? "bg-gradient-to-br from-blue-400 to-blue-500"
                              : inRange
                              ? "bg-gradient-to-br from-purple-300 to-purple-400"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                          animate={{
                            scale: isResult || isPivot ? 1.15 : (isI || isJ) ? 1.05 : 1,
                          }}
                        >
                          {item}
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isLeft || isRight || isPivot || isI || isJ ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  }}
                  getItemState={(index) => {
                    const isPivot = pivotIndex === index;
                    const isI = i === index;
                    const isJ = j === index;
                    
                    return {
                      index,
                      isActive: isPivot || isI || isJ,
                      isHighlighted: isPivot,
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
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-lg">
                      ✓ 完成！第 {k} 大的元素为 {result}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 图例 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">图例说明</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span className="text-gray-700">left/right</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-gray-700">pivot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">i指针</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <span className="text-gray-700">j指针</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 rounded"></div>
                    <span className="text-gray-700">结果</span>
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

export default FindKthLargestVisualizer;

