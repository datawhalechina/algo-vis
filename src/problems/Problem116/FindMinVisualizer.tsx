import { Minus } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateFindMinSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface FindMinInput extends ProblemInput {
  nums: number[];
}

function FindMinVisualizer() {
  return (
    <ConfigurableVisualizer<FindMinInput, Record<string, never>>
      config={{
        defaultInput: { nums: [3, 4, 5, 1, 2] },
        algorithm: (input) => generateFindMinSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 3,4,5,1,2" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [3, 4, 5, 1, 2] } },
          { label: "示例 2", value: { nums: [4, 5, 6, 7, 0, 1, 2] } },
          { label: "示例 3", value: { nums: [11, 13, 15, 17] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as FindMinInput;
          const nums = input.nums;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const mid = variables?.mid as number | undefined;
          const goRight = variables?.goRight as boolean | undefined;
          const goLeft = variables?.goLeft as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as number | undefined;
          const coreIdea = getProblemCoreIdea(116);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Minus size={20} className="text-blue-600" />
                  寻找旋转排序数组中的最小值（二分查找）
                </h3>
                <p className="text-sm text-gray-600">
                  比较中间元素和右边界元素，判断最小值在左半部分还是右半部分。
                </p>
              </div>

              {/* 状态信息 */}
              {(left !== undefined || right !== undefined || mid !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">指针状态</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {left !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">left</div>
                        <div className="text-2xl font-bold text-blue-600">{left}</div>
                      </div>
                    )}
                    {mid !== undefined && (
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="text-xs text-gray-600 mb-1">mid</div>
                        <div className="text-2xl font-bold text-yellow-600">{mid}</div>
                      </div>
                    )}
                    {right !== undefined && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">right</div>
                        <div className="text-2xl font-bold text-purple-600">{right}</div>
                      </div>
                    )}
                  </div>
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
                    const isMid = mid === index;
                    const isResult = result !== undefined && nums[index] === result;
                    const inLeftRange = left !== undefined && right !== undefined && mid !== undefined &&
                      index >= left && index <= mid && goLeft;
                    const inRightRange = left !== undefined && right !== undefined && mid !== undefined &&
                      index > mid && index <= right && goRight;
                    
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
                          {isMid && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-500 text-white"
                            >
                              M
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
                          {isResult && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white"
                            >
                              最小
                            </motion.div>
                          )}
                        </div>

                        {/* 元素 */}
                        <motion.div
                          className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-white text-lg transition-all ${
                            isResult
                              ? "bg-gradient-to-br from-green-500 to-green-600 scale-110 shadow-lg"
                              : isMid
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-110 shadow-lg"
                              : isLeft || isRight
                              ? "bg-gradient-to-br from-blue-400 to-blue-500 scale-105 shadow-md"
                              : inLeftRange || inRightRange
                              ? "bg-gradient-to-br from-orange-400 to-orange-500"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                          animate={{
                            scale: isResult ? 1.15 : isMid ? 1.1 : (isLeft || isRight) ? 1.05 : 1,
                          }}
                        >
                          {item}
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isLeft || isRight || isMid ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  }}
                  getItemState={(index) => {
                    const isLeft = left === index;
                    const isRight = right === index;
                    const isMid = mid === index;
                    
                    return {
                      index,
                      isActive: isLeft || isRight || isMid,
                      isHighlighted: isMid,
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
                      ✓ 完成！最小值为 {result}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 图例 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">图例说明</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span className="text-gray-700">left指针</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">mid指针</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 rounded"></div>
                    <span className="text-gray-700">right指针</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-gray-700">最小值</span>
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

export default FindMinVisualizer;

