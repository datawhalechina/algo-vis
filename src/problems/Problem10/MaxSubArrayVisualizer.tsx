import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateMaxSubArraySteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface MaxSubArrayInput extends ProblemInput {
  nums: number[];
}

interface MaxSubArrayData {
  nums?: number[];
}

function MaxSubArrayVisualizer() {
  return (
    <ConfigurableVisualizer<MaxSubArrayInput, MaxSubArrayData>
      config={{
        defaultInput: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
        algorithm: (input) => generateMaxSubArraySteps(input.nums),
        
        inputTypes: [{ type: "array", key: "nums", label: "数组" }],
        inputFields: [{ type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: -2,1,-3,4,-1,2,1,-5,4" }],
        testCases: [
          { label: "示例 1", value: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] } },
          { label: "示例 2", value: { nums: [1] } },
          { label: "示例 3", value: { nums: [5, 4, -1, 7, 8] } },
        ],
        
        customStepVariables: (variables) => (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {variables.maxSum !== undefined && (
              <div>
                <span className="font-mono text-green-600 font-semibold">maxSum</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.maxSum as number}</span>
              </div>
            )}
            {variables.currentSum !== undefined && (
              <div>
                <span className="font-mono text-blue-600 font-semibold">currentSum</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.currentSum as number}</span>
              </div>
            )}
          </div>
        ),
        
        render: ({ getNumberVariable, getBooleanVariable, visualization }) => {
          const index = getNumberVariable('index');
          const maxSum = getNumberVariable('maxSum');
          const currentSum = getNumberVariable('currentSum');
          const subArrayStart = getNumberVariable('subArrayStart');
          const subArrayEnd = getNumberVariable('subArrayEnd');
          const finished = getBooleanVariable('finished');
          const input = visualization.input as MaxSubArrayInput;
          
          const coreIdea = getProblemCoreIdea(10);
          
          return (
            <>

      {/* 数组可视化 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-orange-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">最大子数组和 - Kadane算法</h3>
          </div>
          
          {coreIdea && <CoreIdeaBox {...coreIdea} />}
          <div className="flex flex-wrap gap-2 justify-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg">
            {input.nums.map((num: number, idx: number) => {
              const isCurrentIndex = index === idx;
              const isInSubArray = subArrayStart !== undefined && subArrayEnd !== undefined && 
                                  idx >= subArrayStart && idx <= subArrayEnd;
              const isNegative = num < 0;

              return (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isCurrentIndex ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {/* 数组元素 */}
                  <motion.div
                    className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg ${
                      isCurrentIndex && finished
                        ? 'bg-gradient-to-br from-purple-400 to-violet-500 text-white border-purple-600 shadow-xl'
                        : isCurrentIndex
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-orange-600 shadow-lg'
                        : isInSubArray && finished
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-600 shadow-md'
                        : isInSubArray && !finished
                        ? 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700 border-blue-400'
                        : isNegative
                        ? 'bg-red-50 text-red-600 border-red-300'
                        : 'bg-green-50 text-green-600 border-green-300'
                    }`}
                    animate={{
                      y: isCurrentIndex ? -4 : 0,
                    }}
                  >
                    {num}
                  </motion.div>

                  {/* 索引 */}
                  <div className="text-sm text-gray-600 font-mono">[{idx}]</div>

                  {/* 当前索引标记 */}
                  {isCurrentIndex && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full font-bold"
                    >
                      当前
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

      {/* 子数组可视化 */}
      {subArrayStart !== undefined && subArrayEnd !== undefined && !finished && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border border-blue-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">当前子数组</h3>
          <div className="flex items-center gap-3">
            <div className="font-mono text-lg">
              [{input.nums.slice(subArrayStart, subArrayEnd + 1).join(', ')}]
            </div>
            <div className="text-sm text-gray-600">
              和 = <span className="font-bold text-blue-700">{currentSum}</span>
            </div>
          </div>
        </div>
      )}

      {/* 最终结果 */}
      {finished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-2xl p-8 shadow-2xl"
        >
          <div className="text-center text-white">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <div className="text-3xl font-bold mb-4">
              找到最大子数组！
            </div>
            <div className="text-lg mb-2">
              子数组：[{input.nums.slice(subArrayStart!, subArrayEnd! + 1).join(', ')}]
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="inline-block bg-white rounded-2xl px-8 py-4 shadow-xl"
            >
              <div className="text-sm text-gray-600 mb-1">最大和</div>
              <span className="font-mono font-bold text-5xl text-green-600">
                {maxSum}
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </>

          );
        },
      }}
    />
  );
}

export default MaxSubArrayVisualizer;
