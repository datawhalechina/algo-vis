import { motion } from "framer-motion";
import { Target, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { generateTwoSumIISteps } from "./algorithm";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";

interface TwoSumIIInput extends ProblemInput {
  numbers: number[];
  target: number;
}

interface TwoSumIIData {
  numbers?: number[];
  target?: number;
}

function TwoSumIIVisualizer() {
  return (
    <ConfigurableVisualizer<TwoSumIIInput, TwoSumIIData>
      config={{
        // 基础配置
        defaultInput: { numbers: [2, 7, 11, 15], target: 9 },
        algorithm: (input) => generateTwoSumIISteps(input.numbers, input.target),
        
        // 输入配置
        inputTypes: [
          { type: "array", key: "numbers", label: "有序数组" },
          { type: "number", key: "target", label: "目标值" },
        ],
        inputFields: [
          { type: "array", key: "numbers", label: "有序数组 numbers", placeholder: "输入有序数组，如: 2,7,11,15" },
          { type: "number", key: "target", label: "目标值 target", placeholder: "输入目标值，如: 9" },
        ],
        testCases: [
          { label: "示例 1", value: { numbers: [2, 7, 11, 15], target: 9 } },
          { label: "示例 2", value: { numbers: [2, 3, 4], target: 6 } },
          { label: "示例 3", value: { numbers: [-1, 0], target: -1 } },
          { label: "示例 4", value: { numbers: [1, 2, 3, 4, 5, 6], target: 10 } },
        ],
        
        // 自定义变量显示
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
            {variables.sum !== undefined && (
              <div>
                <span className="font-mono text-purple-600 font-semibold">sum</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.sum as number}</span>
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
        
        // 核心渲染逻辑 - 完全自定义的视觉呈现
        render: ({ data, getNumberVariable, getBooleanVariable, getArrayVariable }) => {
          const { numbers = [], target = 0 } = data;
          const left = getNumberVariable('left');
          const right = getNumberVariable('right');
          const sum = getNumberVariable('sum');
          const finished = getBooleanVariable('finished');
          const result = getArrayVariable('result') as number[] | undefined;
          const coreIdea = getProblemCoreIdea(16);

          return (
            <div className="space-y-6">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 目标值显示 */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border-2 border-orange-200">
                <div className="flex items-center justify-center gap-3">
                  <Target className="text-orange-600" size={24} />
                  <span className="text-lg font-semibold text-gray-700">目标和：</span>
                  <span className="text-3xl font-bold text-orange-600">{target}</span>
                </div>
              </div>

              {/* 使用 ArrayTemplate 但完全定制视觉 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">双指针查找</h3>
                
                <ArrayTemplate
                  data={numbers}
                  layout={{ gap: '0.5rem', wrap: true }}
                  
                  // 计算每个元素的状态
                  getItemState={(index) => {
                    const isLeft = left === index;
                    const isRight = right === index;
                    const inRange = left !== undefined && right !== undefined && index >= left && index <= right;
                    return {
                      isActive: isLeft || isRight,
                      isHighlighted: inRange,
                      customState: { isLeft, isRight, inRange },
                    };
                  }}
                  
                  // 完全自定义元素渲染
                  renderItem={(num, index, state) => {
                    const { isLeft, isRight, inRange } = state.customState || {};
                    const outOfRange = !inRange && !finished;
                    
                    return (
                      <motion.div
                        className="relative"
                        animate={{
                          scale: isLeft || isRight ? 1.15 : 1,
                          opacity: outOfRange ? 0.3 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl border-2 ${
                            result && (isLeft || isRight)
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-xl'
                              : isLeft
                              ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-700 shadow-lg'
                              : isRight
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-lg'
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
                            className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                          >
                            <ArrowLeft className="text-blue-600" size={20} />
                            <span className="text-xs font-bold text-blue-600 whitespace-nowrap mt-1">left</span>
                          </motion.div>
                        )}
                        {isRight && !finished && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
                          >
                            <ArrowRight className="text-green-600" size={20} />
                            <span className="text-xs font-bold text-green-600 whitespace-nowrap mt-1">right</span>
                          </motion.div>
                        )}
                        
                        <div className="text-center text-xs text-gray-400 mt-1">{index}</div>
                      </motion.div>
                    );
                  }}
                />

                {/* 当前和显示 */}
                {sum !== undefined && !finished && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200 text-center"
                  >
                    <div className="text-purple-700 font-semibold">
                      当前和：<span className="text-2xl font-bold ml-2">{sum}</span>
                      <span className="text-gray-500 ml-3">
                        {sum < target ? '< 目标 (左指针右移)' : sum > target ? '> 目标 (右指针左移)' : '= 目标 ✓'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 结果显示 */}
              {finished && result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-2xl p-8 shadow-2xl text-center text-white"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <CheckCircle className="mx-auto mb-4" size={64} strokeWidth={2.5} />
                  </motion.div>
                  <div className="text-3xl font-bold mb-3">找到答案！</div>
                  <div className="text-xl">
                    索引：<span className="font-mono text-2xl font-bold">[{result[0]}, {result[1]}]</span>
                  </div>
                  <div className="mt-2 text-lg opacity-90">
                    {numbers[result[0] - 1]} + {numbers[result[1] - 1]} = {target}
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

export default TwoSumIIVisualizer;
