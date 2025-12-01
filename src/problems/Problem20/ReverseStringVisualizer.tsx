import { generateReverseStringSteps } from "./algorithm";
import { motion } from "framer-motion";
import { Repeat, CheckCircle, ArrowLeftRight } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";

interface ReverseStringInput extends ProblemInput {
  s: string;
}

interface ReverseStringData {
  chars?: string[];
}

function ReverseStringVisualizer() {
  return (
    <ConfigurableVisualizer<ReverseStringInput, ReverseStringData>
      config={{
        defaultInput: { s: "hello" },
        algorithm: (input) => generateReverseStringSteps(input.s),
        
        inputTypes: [{ type: "string", key: "s", label: "字符串" }],
        inputFields: [{ type: "string", key: "s", label: "字符串 s", placeholder: "输入字符串，如: hello" }],
        testCases: [
          { label: "示例 1", value: { s: "hello" } },
          { label: "示例 2", value: { s: "Hannah" } },
          { label: "示例 3", value: { s: "racecar" } },
          { label: "示例 4", value: { s: "algorithm" } },
        ],
        
        customStepVariables: (variables) => {
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          
          return (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {left !== undefined && (
                <div>
                  <span className="font-mono text-blue-600 font-semibold">left</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{left}</span>
                </div>
              )}
              {right !== undefined && (
                <div>
                  <span className="font-mono text-green-600 font-semibold">right</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{right}</span>
                </div>
              )}
            </div>
          );
        },
        
        render: ({ data, getNumberVariable, getBooleanVariable }) => {
          const { chars = [] } = data;
          const left = getNumberVariable('left');
          const right = getNumberVariable('right');
          const comparing = getBooleanVariable('comparing');
          const swapped = getBooleanVariable('swapped');
          const finished = getBooleanVariable('finished');
          const coreIdea = getProblemCoreIdea(20);

          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <h3 className="text-lg font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <Repeat className="text-blue-600" size={20} />
                双指针反转
              </h3>
              
              <div className="flex gap-2 items-center justify-center flex-wrap mb-6">
                {(chars as string[]).map((char: string, index: number) => {
                  const isLeft = left === index;
                  const isRight = right === index;
                  const isProcessed = left !== undefined && right !== undefined && (index < left || index > right) && !finished;
                  
                  return (
                    <motion.div
                      key={`${index}-${char}`}
                      className="relative"
                      animate={{
                        scale: isLeft || isRight ? 1.15 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl border-2 ${
                          (isLeft || isRight) && swapped
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-xl'
                            : (isLeft || isRight) && comparing
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-orange-600 shadow-xl'
                            : isLeft
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-700 shadow-lg'
                            : isRight
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-lg'
                            : isProcessed
                            ? 'bg-gradient-to-br from-purple-300 to-purple-400 text-white border-purple-500'
                            : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 border-gray-400'
                        }`}
                        animate={{
                          rotate: (isLeft || isRight) && comparing ? [0, -5, 5, 0] : 0,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {char}
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
                      
                      <div className="text-center text-xs text-gray-400 mt-1">{index}</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* 交换动画指示 */}
              {comparing && !finished && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200"
                >
                  <ArrowLeftRight className="text-yellow-600" size={32} />
                  <span className="text-lg font-semibold text-yellow-700">
                    准备交换位置 {left} 和 {right}
                  </span>
                </motion.div>
              )}

              {swapped && !finished && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200"
                >
                  <CheckCircle className="text-green-600" size={32} />
                  <span className="text-lg font-semibold text-green-700">
                    交换完成！
                  </span>
                </motion.div>
              )}

              {/* 最终结果 */}
              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mt-6 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-2xl p-8 shadow-2xl text-center text-white"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <CheckCircle className="mx-auto mb-4" size={64} strokeWidth={2.5} />
                  </motion.div>
                  <div className="text-3xl font-bold mb-4">反转完成！</div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="inline-block bg-white rounded-2xl px-8 py-4 shadow-xl"
                  >
                    <span className="font-mono font-bold text-4xl text-indigo-600">
                      "{(chars as string[]).join('')}"
                    </span>
                  </motion.div>
                  <div className="mt-4 text-lg opacity-90">
                    双指针：O(n) 时间，O(1) 空间
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

export default ReverseStringVisualizer;
