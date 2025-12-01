import { motion } from "framer-motion";
import { Hash, TrendingUp } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateLongestConsecutiveSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface LongestConsecutiveInput extends ProblemInput {
  nums: number[];
}

interface LongestConsecutiveData {
  nums?: number[];
}

function LongestConsecutiveVisualizer() {
  return (
    <ConfigurableVisualizer<LongestConsecutiveInput, LongestConsecutiveData>
      config={{
        defaultInput: { nums: [100, 4, 200, 1, 3, 2] },
        algorithm: (input) => generateLongestConsecutiveSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "数组" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 100,4,200,1,3,2" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [100, 4, 200, 1, 3, 2] } },
          { label: "示例 2", value: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] } },
          { label: "示例 3", value: { nums: [9, 1, 4, 7, 3, 2, 8, 5, 6] } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['numSet', 'sequence', 'processedNums'].includes(key))
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
          const coreIdea = getProblemCoreIdea(42);
          const numSet = variables?.numSet as number[] | undefined;
          const currentNum = variables?.currentNum as number | undefined;
          const sequence = variables?.sequence as number[] | undefined;
          const maxLength = variables?.maxLength as number | undefined;
          const processedNums = variables?.processedNums as number[] | undefined;
          const input = visualization.input as LongestConsecutiveInput;
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 数组和Set可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">数组转Set（去重）</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* 原数组 */}
                  <div>
                    <div className="text-sm text-gray-600 mb-2">原数组 ({input.nums.length}个)</div>
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {input.nums.map((num, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-200 text-gray-700 px-3 py-2 rounded font-mono text-sm"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Set */}
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Set去重后 ({numSet?.length || 0}个)</div>
                    <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      {numSet?.sort((a, b) => a - b).map((num) => {
                        const isProcessed = processedNums?.includes(num);
                        const isInSequence = sequence?.includes(num);
                        
                        return (
                          <motion.div
                            key={num}
                            className={`px-3 py-2 rounded font-mono text-sm ${
                              isInSequence
                                ? "bg-green-500 text-white font-bold"
                                : isProcessed
                                ? "bg-blue-300 text-blue-900"
                                : "bg-blue-200 text-blue-700"
                            }`}
                            animate={{
                              scale: isInSequence ? 1.1 : 1,
                            }}
                          >
                            {num}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 当前序列可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-green-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">当前连续序列</h3>
                </div>
                
                <div className="mb-4 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-cyan-700">核心思想：</span>
                    只从序列起点开始计数（num-1不存在），避免重复计算。
                    时间复杂度O(n)，因为每个数字最多被访问2次。
                  </p>
                </div>
                
                {sequence && sequence.length > 0 ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {sequence.map((num, idx) => (
                        <div key={num} className="flex items-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-green-500 text-white px-4 py-3 rounded-lg font-mono text-lg font-bold shadow-lg"
                          >
                            {num}
                          </motion.div>
                          {idx < sequence.length - 1 && (
                            <div className="text-green-600 mx-2 text-xl font-bold">→</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-sm text-gray-700">
                      <span className="font-semibold">当前序列长度：</span>
                      <span className="ml-2 font-mono text-green-600 font-bold text-lg">{sequence.length}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <div className="text-center">
                      <Hash className="mx-auto mb-2" size={32} />
                      <p>等待开始计算序列...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 最大长度显示 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">算法状态</h3>
                <div className="flex items-center justify-center gap-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">当前最大长度</div>
                    <div className="text-4xl font-bold text-purple-600">{maxLength || 0}</div>
                  </div>
                  {currentNum !== undefined && (
                    <>
                      <div className="h-12 w-px bg-gray-300"></div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">当前检查数字</div>
                        <div className="text-4xl font-bold text-blue-600">{currentNum}</div>
                      </div>
                    </>
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

export default LongestConsecutiveVisualizer;
