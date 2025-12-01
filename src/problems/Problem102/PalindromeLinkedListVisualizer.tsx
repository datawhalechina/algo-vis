import { List } from "lucide-react";
import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { isPalindromeSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface PalindromeLinkedListInput extends ProblemInput {
  list: number[];
}

function PalindromeLinkedListVisualizer() {
  return (
    <ConfigurableVisualizer<PalindromeLinkedListInput, Record<string, never>>
      config={{
        defaultInput: { list: [1, 2, 2, 1] },
        algorithm: (input) => isPalindromeSteps(input.list),
        
        inputTypes: [
          { type: "array", key: "list", label: "list" },
        ],
        inputFields: [
          { type: "array", key: "list", label: "链表值", placeholder: "输入链表节点值"},
        ],
        testCases: [
          { label: "示例 1 - 是回文", value: { list: [1, 2, 2, 1] } },
          { label: "示例 2 - 不是回文", value: { list: [1, 2] } },
          { label: "示例 3", value: { list: [1, 2, 3, 2, 1] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as PalindromeLinkedListInput;
          const list = input.list;
          const firstHalf = variables?.firstHalf as number[] | undefined;
          const secondHalf = variables?.secondHalf as number[] | undefined;
          const slow = variables?.slow as number | undefined;
          const fast = variables?.fast as number | undefined;
          const mid = variables?.mid as number | undefined;
          const compareIndex = variables?.compareIndex as number | undefined;
          const match = variables?.match as boolean | undefined;
          const isPalindrome = variables?.isPalindrome as boolean | undefined;
          const phase = variables?.phase as string | undefined;

          const coreIdea = getProblemCoreIdea(102);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <List className="text-purple-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">回文链表</h3>
                </div>

                {/* 步骤1: 快慢指针找中点 */}
                {(phase === 'findMiddle' || phase === 'foundMiddle') && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-2">步骤1: 使用快慢指针找中点</div>
                    <div className="flex gap-2 items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      {list.map((value, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex flex-col items-center gap-1">
                            {slow === idx && (
                              <span className="text-xs font-bold text-blue-600">慢指针</span>
                            )}
                            {fast === idx && (
                              <span className="text-xs font-bold text-red-600">快指针</span>
                            )}
                            {mid === idx && (
                              <span className="text-xs font-bold text-green-600">中点</span>
                            )}
                            <motion.div
                              animate={{
                                scale: (slow === idx || fast === idx || mid === idx) ? 1.2 : 1,
                                backgroundColor: slow === idx
                                  ? '#3b82f6'
                                  : fast === idx
                                  ? '#ef4444'
                                  : mid === idx
                                  ? '#22c55e'
                                  : '#ddd6fe',
                              }}
                              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                            >
                              {value}
                            </motion.div>
                          </div>
                          {idx < list.length - 1 && <span className="text-gray-400">→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 步骤2 & 3: 分割和反转 */}
                {(phase === 'split' || phase === 'reversed') && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      {phase === 'split' ? '步骤2: 分割链表' : '步骤3: 反转后半部分'}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 前半部分 */}
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs text-green-700 mb-2 font-semibold">前半部分</div>
                        <div className="flex gap-2 items-center justify-center">
                          {firstHalf && firstHalf.map((value, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-green-500">
                                {value}
                              </div>
                              {idx < firstHalf.length - 1 && <span className="text-gray-400">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* 后半部分 */}
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-xs text-purple-700 mb-2 font-semibold">
                          {phase === 'reversed' ? '反转后的后半部分' : '后半部分'}
                        </div>
                        <div className="flex gap-2 items-center justify-center">
                          {secondHalf && secondHalf.map((value, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-purple-500">
                                {value}
                              </div>
                              {idx < secondHalf.length - 1 && <span className="text-gray-400">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 步骤4: 比较两部分 */}
                {phase === 'comparing' && (
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-700 mb-2">步骤4: 同时比较前后两部分</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 前半部分 */}
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xs text-green-700 mb-2 font-semibold">前半部分</div>
                        <div className="flex gap-2 items-center justify-center">
                          {firstHalf && firstHalf.map((value, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <motion.div
                                animate={{
                                  scale: compareIndex === idx ? 1.2 : 1,
                                  backgroundColor: compareIndex === idx 
                                    ? (match ? '#22c55e' : '#ef4444')
                                    : '#86efac',
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                              >
                                {value}
                              </motion.div>
                              {idx < firstHalf.length - 1 && <span className="text-gray-400">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* 反转后的后半部分 */}
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-xs text-purple-700 mb-2 font-semibold">反转后的后半部分</div>
                        <div className="flex gap-2 items-center justify-center">
                          {secondHalf && secondHalf.map((value, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <motion.div
                                animate={{
                                  scale: compareIndex === idx ? 1.2 : 1,
                                  backgroundColor: compareIndex === idx 
                                    ? (match ? '#22c55e' : '#ef4444')
                                    : '#c084fc',
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                              >
                                {value}
                              </motion.div>
                              {idx < secondHalf.length - 1 && <span className="text-gray-400">→</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {compareIndex !== undefined && (
                      <div className="mt-2 text-center text-sm">
                        <span className={`font-bold ${match ? 'text-green-600' : 'text-red-600'}`}>
                          {match ? '✓ 匹配' : '✗ 不匹配'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 结果 */}
                {isPalindrome !== undefined && (
                  <div className={`p-4 rounded-lg border-2 ${
                    isPalindrome 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-red-100 border-red-500'
                  }`}>
                    <div className="text-center text-2xl font-bold">
                      <span className={isPalindrome ? 'text-green-700' : 'text-red-700'}>
                        {isPalindrome ? '✓ 是回文链表' : '✗ 不是回文链表'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default PalindromeLinkedListVisualizer;
