import { generateMajorityElementSteps } from "./algorithm";
import { motion } from "framer-motion";
import { Crown, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";

interface MajorityElementInput extends ProblemInput {
  nums: number[];
}

interface MajorityElementData {
  nums?: number[];
}

function MajorityElementVisualizer() {
  return (
    <ConfigurableVisualizer<MajorityElementInput, MajorityElementData>
      config={{
        defaultInput: { nums: [3, 2, 3] },
        algorithm: (input) => generateMajorityElementSteps(input.nums),
        
        inputTypes: [{ type: "array", key: "nums", label: "数组" }],
        inputFields: [{ type: "array", key: "nums", label: "数组 nums", placeholder: "输入数组，如: 3,2,3" }],
        testCases: [
          { label: "示例 1", value: { nums: [3, 2, 3] } },
          { label: "示例 2", value: { nums: [2, 2, 1, 1, 1, 2, 2] } },
          { label: "示例 3", value: { nums: [1] } },
          { label: "示例 4", value: { nums: [6, 5, 5, 6, 6, 6, 5, 6] } },
        ],
        
        customStepVariables: (variables) => {
          const candidate = variables?.candidate as number | undefined;
          const count = variables?.count as number | undefined;
          const index = variables?.index as number | undefined;
          
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {candidate !== undefined && candidate !== null && (
                <div>
                  <span className="font-mono text-purple-600 font-semibold">候选人</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{candidate}</span>
                </div>
              )}
              {count !== undefined && (
                <div>
                  <span className="font-mono text-blue-600 font-semibold">count</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{count}</span>
                </div>
              )}
              {index !== undefined && (
                <div>
                  <span className="font-mono text-orange-600 font-semibold">当前索引</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{index}</span>
                </div>
              )}
            </div>
          );
        },
        
        render: ({ data, getNumberVariable, getBooleanVariable }) => {
          const { nums = [] } = data;
          const candidate = getNumberVariable('candidate');
          const count = getNumberVariable('count');
          const index = getNumberVariable('index');
          const selectCandidate = getBooleanVariable('selectCandidate');
          const voteFor = getBooleanVariable('voteFor');
          const voteAgainst = getBooleanVariable('voteAgainst');
          const finished = getBooleanVariable('finished');
          const result = getNumberVariable('result');
          const coreIdea = getProblemCoreIdea(19);

          return (
            <div className="space-y-6">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 候选人显示 */}
              {candidate !== undefined && candidate !== null && !finished && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-300"
                >
                  <div className="flex items-center justify-center gap-4">
                    <Crown className="text-purple-600" size={32} />
                    <div className="text-lg font-semibold text-gray-700">当前候选人：</div>
                    <div className="text-4xl font-bold text-purple-600">{candidate}</div>
                    <div className="ml-4 px-4 py-2 bg-blue-100 rounded-lg border-2 border-blue-300">
                      <span className="text-sm text-blue-700 font-semibold">票数：</span>
                      <span className="text-2xl font-bold text-blue-700 ml-2">{count}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">摩尔投票算法</h3>
                
                <div className="flex gap-2 items-center justify-center flex-wrap">
                  {(nums as number[]).map((num: number, idx: number) => {
                    const isCurrentIndex = index === idx;
                    const isPastIndex = index !== undefined && idx < index;
                    const isCandidate = num === candidate;
                    
                    return (
                      <motion.div
                        key={idx}
                        className="relative"
                        animate={{
                          scale: isCurrentIndex ? 1.15 : 1,
                          opacity: isPastIndex ? 0.6 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl border-2 ${
                            selectCandidate && isCurrentIndex
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-orange-600 shadow-xl'
                              : voteFor && isCurrentIndex
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-xl'
                              : voteAgainst && isCurrentIndex
                              ? 'bg-gradient-to-br from-red-400 to-red-600 text-white border-red-700 shadow-xl'
                              : isCurrentIndex
                              ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-700 shadow-lg'
                              : isCandidate && isPastIndex
                              ? 'bg-gradient-to-br from-purple-300 to-purple-400 text-white border-purple-500'
                              : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 border-gray-400'
                          }`}
                        >
                          {num}
                          
                          {isCandidate && isPastIndex && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2"
                            >
                              <Crown className="text-yellow-500" size={16} fill="currentColor" />
                            </motion.div>
                          )}
                        </motion.div>
                        
                        {selectCandidate && isCurrentIndex && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                          >
                            <Crown className="text-yellow-600 mx-auto" size={24} />
                            <span className="text-xs font-bold text-yellow-600">新候选</span>
                          </motion.div>
                        )}
                        
                        {voteFor && isCurrentIndex && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2"
                          >
                            <ThumbsUp className="text-green-600" size={24} />
                          </motion.div>
                        )}
                        
                        {voteAgainst && isCurrentIndex && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2"
                          >
                            <ThumbsDown className="text-red-600" size={24} />
                          </motion.div>
                        )}
                        
                        <div className="text-center text-xs text-gray-400 mt-1">{idx}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* 最终结果 */}
              {finished && result !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-2xl p-8 shadow-2xl text-center text-white"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <CheckCircle className="mx-auto mb-4" size={64} strokeWidth={2.5} />
                  </motion.div>
                  <div className="text-3xl font-bold mb-4">找到多数元素！</div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="inline-block bg-white rounded-2xl px-8 py-4 shadow-xl"
                  >
                    <span className="font-mono font-bold text-5xl text-purple-600">{result}</span>
                  </motion.div>
                  <div className="mt-4 text-lg opacity-90">
                    摩尔投票算法：O(n) 时间，O(1) 空间
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

export default MajorityElementVisualizer;
