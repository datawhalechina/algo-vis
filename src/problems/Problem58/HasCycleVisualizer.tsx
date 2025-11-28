import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateHasCycleSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface HasCycleInput extends ProblemInput {
  list: number[];
  pos: number;
}

interface HasCycleData {
  list?: number[];
  pos?: number;
  slow?: number;
  fast?: number;
  step?: number;
  hasCycle?: boolean;
}

function HasCycleVisualizer() {
  return (
    <ConfigurableVisualizer<HasCycleInput, HasCycleData>
      config={{
        defaultInput: { list: [3, 2, 0, -4], pos: 1 },
        algorithm: (input) => generateHasCycleSteps(input.list, input.pos),
        
        inputTypes: [
          { type: "array", key: "list", label: "链表节点值" },
          { type: "number", key: "pos", label: "环入口位置" },
        ],
        inputFields: [
          { type: "array", key: "list", label: "链表节点值", placeholder: "输入节点值，用逗号分隔，如: 3,2,0,-4" },
          { type: "number", key: "pos", label: "环入口位置 (-1表示无环)", placeholder: "输入环入口索引" },
        ],
        testCases: [
          { label: "有环（pos=1）", value: { list: [3, 2, 0, -4], pos: 1 } },
          { label: "有环（pos=0）", value: { list: [1, 2], pos: 0 } },
          { label: "无环", value: { list: [1, 2, 3, 4], pos: -1 } },
          { label: "单节点无环", value: { list: [1], pos: -1 } },
        ],
        
        render: ({ data }) => {
          const state = data as HasCycleData;
          
          if (!state || !state.list) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { list, pos, slow, fast, step, hasCycle } = state;

          const coreIdea = getProblemCoreIdea(58);

          return (
            <div className="space-y-6">
              {coreIdea && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <RefreshCw className="text-blue-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">环形链表 - 快慢指针</h3>
                  </div>
                  <CoreIdeaBox {...coreIdea} />
                </div>
              )}
              
              {/* 链表可视化 */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  链表结构 {pos !== undefined && pos >= 0 && `(环入口: ${pos})`}
                </div>
                <div className="flex items-center gap-2">
                  {list.map((val, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div
                        className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg font-bold relative ${
                          idx === slow && idx === fast
                            ? 'border-red-500 bg-red-100 text-red-700 ring-4 ring-red-300'
                            : idx === slow
                            ? 'border-blue-500 bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                            : idx === fast
                            ? 'border-purple-500 bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                            : idx === pos
                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {val}
                        {idx === pos && pos >= 0 && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center">
                            环
                          </div>
                        )}
                      </div>
                      {idx < list.length - 1 ? (
                        <div className="text-gray-400 font-bold">→</div>
                      ) : pos !== undefined && pos >= 0 ? (
                        <div className="text-red-500 font-bold text-xl">↰</div>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 指针说明 */}
              {slow !== undefined && fast !== undefined && (
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>慢指针 (索引 {slow}, 值 {list[slow]})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span>快指针 (索引 {fast}, 值 {list[fast]})</span>
                  </div>
                  {step !== undefined && (
                    <div className="text-gray-600">
                      第 {step} 步
                    </div>
                  )}
                </div>
              )}

              {/* 相遇提示 */}
              {slow !== undefined && fast !== undefined && slow === fast && hasCycle && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-red-50 border-2 border-red-300 rounded-lg"
                >
                  <div className="text-red-700 font-medium text-center">
                    ✓ 快慢指针相遇！链表有环
                  </div>
                </motion.div>
              )}

              {/* 最终结果 */}
              {hasCycle !== undefined && slow === undefined && fast === undefined && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-6 rounded-lg text-center ${
                    hasCycle
                      ? 'bg-red-50 border-2 border-red-300'
                      : 'bg-green-50 border-2 border-green-300'
                  }`}
                >
                  <div className={`text-2xl font-bold ${
                    hasCycle ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {hasCycle ? '✓ 链表有环' : '✗ 链表无环'}
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

export default HasCycleVisualizer;
