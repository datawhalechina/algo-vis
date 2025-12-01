import { TrendingUp } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateJumpIISteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface JumpIIInput extends ProblemInput {
  nums: number[];
}

function JumpIIVisualizer() {
  return (
    <ConfigurableVisualizer<JumpIIInput, Record<string, never>>
      config={{
        defaultInput: { nums: [2, 3, 1, 1, 4] },
        algorithm: (input) => generateJumpIISteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔"},
        ],
        testCases: [
          { label: "示例 1", value: { nums: [2, 3, 1, 1, 4] } },
          { label: "示例 2", value: { nums: [2, 3, 0, 1, 4] } },
          { label: "示例 3", value: { nums: [1, 2, 3] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as JumpIIInput;
          const nums = input.nums;
          const current = variables?.current as number | undefined;
          const end = variables?.end as number | undefined;
          const maxReach = variables?.maxReach as number | undefined;
          const jumps = variables?.jumps as number | undefined;
          const finished = variables?.finished as boolean | undefined;
          const atBoundary = variables?.atBoundary as boolean | undefined;
          const coreIdea = getProblemCoreIdea(109);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  跳跃游戏 II（最少跳跃次数）
                </h3>
                <p className="text-sm text-gray-600">
                  贪心策略：维护当前跳跃边界end和下一步最远可达位置maxReach，到达边界时增加跳跃次数。
                </p>
              </div>

              {/* 状态信息 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">算法状态</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-xs text-gray-600 mb-1">跳跃次数</div>
                    <div className="text-2xl font-bold text-blue-600">{jumps ?? 0}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">当前边界</div>
                    <div className="text-2xl font-bold text-green-600">{end ?? 0}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="text-xs text-gray-600 mb-1">最远可达</div>
                    <div className="text-2xl font-bold text-purple-600">{maxReach ?? 0}</div>
                  </div>
                </div>
              </div>

              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">数组状态</h4>
                <ArrayTemplate
                  data={nums}
                  renderItem={(item, index) => {
                    const isCurrent = current === index;
                    const isEnd = end === index;
                    const isReachable = maxReach !== undefined && index <= maxReach;
                    const isInCurrentJump = end !== undefined && index <= end;
                    
                    return (
                      <motion.div
                        className="relative flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* 指针标签 */}
                        <div className="flex gap-1">
                          {isCurrent && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-500 text-white"
                            >
                              当前
                            </motion.div>
                          )}
                          {isEnd && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white"
                            >
                              边界
                            </motion.div>
                          )}
                        </div>

                        {/* 元素 */}
                        <motion.div
                          className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold text-white text-lg transition-all ${
                            isCurrent && atBoundary
                              ? "bg-gradient-to-br from-orange-500 to-orange-600 scale-110 shadow-lg"
                              : isCurrent
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-105 shadow-md"
                              : isEnd
                              ? "bg-gradient-to-br from-green-500 to-green-600 shadow-md"
                              : isReachable && !isInCurrentJump
                              ? "bg-gradient-to-br from-purple-400 to-purple-500"
                              : isInCurrentJump
                              ? "bg-gradient-to-br from-blue-400 to-blue-500"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                          animate={{
                            scale: isCurrent && atBoundary ? 1.15 : isCurrent ? 1.05 : 1,
                          }}
                        >
                          <div>{item}</div>
                          {current !== undefined && (
                            <div className="text-xs mt-0.5">
                              可跳{current + (item as number)}步
                            </div>
                          )}
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isCurrent ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>

                        {/* 跳跃范围指示 */}
                        {isCurrent && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item as number) * 64 + 16}px` }}
                            className="absolute top-12 left-1/2 h-1 bg-yellow-400 rounded-full -translate-x-1/2"
                            style={{ zIndex: -1 }}
                          />
                        )}
                      </motion.div>
                    );
                  }}
                  getItemState={(index) => {
                    const isCurrent = current === index;
                    const isEnd = end === index;
                    
                    return {
                      index,
                      isActive: isCurrent || isEnd,
                      isHighlighted: isCurrent && atBoundary,
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
                      ✓ 完成！最少跳跃次数为 {jumps}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 图例 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">图例说明</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">当前位置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-gray-700">跳跃边界</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span className="text-gray-700">当前跳跃范围</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-500 rounded"></div>
                    <span className="text-gray-700">下一步可达</span>
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

export default JumpIIVisualizer;

