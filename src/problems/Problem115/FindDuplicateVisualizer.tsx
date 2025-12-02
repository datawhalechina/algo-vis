import { Repeat } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateFindDuplicateSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface FindDuplicateInput extends ProblemInput {
  nums: number[];
}

function FindDuplicateVisualizer() {
  return (
    <ConfigurableVisualizer<FindDuplicateInput, Record<string, never>>
      config={{
        defaultInput: { nums: [1, 3, 4, 2, 2] },
        algorithm: (input) => generateFindDuplicateSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,3,4,2,2" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 3, 4, 2, 2] } },
          { label: "示例 2", value: { nums: [3, 1, 3, 4, 2] } },
          { label: "示例 3", value: { nums: [1, 1] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as FindDuplicateInput;
          const nums = input.nums;
          const slow = variables?.slow as number | undefined;
          const fast = variables?.fast as number | undefined;
          const phase = variables?.phase as string | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as number | undefined;
          const coreIdea = getProblemCoreIdea(115);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Repeat size={20} className="text-blue-600" />
                  寻找重复数（快慢指针）
                </h3>
                <p className="text-sm text-gray-600">
                  将数组视为链表，使用快慢指针找到环，然后找到环的入口即为重复数字。
                </p>
              </div>

              {/* 状态信息 */}
              {(slow !== undefined || fast !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">指针状态</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {slow !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">慢指针</div>
                        <div className="text-2xl font-bold text-blue-600">{slow}</div>
                      </div>
                    )}
                    {fast !== undefined && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">快指针</div>
                        <div className="text-2xl font-bold text-purple-600">{fast}</div>
                      </div>
                    )}
                  </div>
                  {phase && (
                    <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="text-xs text-gray-600 mb-1">当前阶段</div>
                      <div className="text-sm font-bold text-yellow-700">
                        {phase === 'init' ? '初始化' :
                         phase === 'find_meeting' ? '寻找相遇点' :
                         phase === 'found_meeting' ? '已找到相遇点' :
                         phase === 'find_entry' ? '寻找环入口' : phase}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">数组状态（视为链表）</h4>
                <ArrayTemplate
                  data={nums}
                  renderItem={(item, index) => {
                    const isSlow = slow === index;
                    const isFast = fast === index;
                    const isResult = result === index;
                    const nextIndex = item as number;
                    
                    return (
                      <motion.div
                        className="relative flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* 标签 */}
                        <div className="flex gap-1">
                          {isSlow && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-blue-500 text-white"
                            >
                              慢
                            </motion.div>
                          )}
                          {isFast && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-purple-500 text-white"
                            >
                              快
                            </motion.div>
                          )}
                          {isResult && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white"
                            >
                              重复
                            </motion.div>
                          )}
                        </div>

                        {/* 元素 */}
                        <motion.div
                          className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold text-white text-lg transition-all ${
                            isResult
                              ? "bg-gradient-to-br from-green-500 to-green-600 scale-110 shadow-lg"
                              : isSlow && isFast
                              ? "bg-gradient-to-br from-orange-500 to-orange-600 scale-110 shadow-lg"
                              : isSlow
                              ? "bg-gradient-to-br from-blue-400 to-blue-500 scale-105 shadow-md"
                              : isFast
                              ? "bg-gradient-to-br from-purple-400 to-purple-500 scale-105 shadow-md"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                          animate={{
                            scale: isResult ? 1.15 : (isSlow || isFast) ? 1.05 : 1,
                          }}
                        >
                          <div>{item}</div>
                          <div className="text-xs mt-0.5">→{nextIndex}</div>
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isSlow || isFast ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  }}
                  getItemState={(index) => {
                    const isSlow = slow === index;
                    const isFast = fast === index;
                    
                    return {
                      index,
                      isActive: isSlow || isFast,
                      isHighlighted: isSlow && isFast,
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
                      ✓ 完成！重复数字为 {result}
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
                    <span className="text-gray-700">慢指针</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 rounded"></div>
                    <span className="text-gray-700">快指针</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-gray-700">重复数字</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <span className="text-gray-700">相遇点</span>
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

export default FindDuplicateVisualizer;

