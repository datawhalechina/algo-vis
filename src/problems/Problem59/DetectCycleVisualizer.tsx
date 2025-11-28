import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateDetectCycleSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface DetectCycleInput extends ProblemInput {
  list: number[];
  pos: number;
}

interface DetectCycleData {
  list?: number[];
  pos?: number;
  slow?: number;
  fast?: number;
  meetPos?: number;
  ptr1?: number;
  ptr2?: number;
  entrance?: number;
  phase?: string;
  result?: null;
}

function DetectCycleVisualizer() {
  return (
    <ConfigurableVisualizer<DetectCycleInput, DetectCycleData>
      config={{
        defaultInput: { list: [3, 2, 0, -4], pos: 1 },
        algorithm: (input) => generateDetectCycleSteps(input.list, input.pos),
        
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
        ],
        
        render: ({ data }) => {
          const state = data as DetectCycleData;
          
          if (!state || !state.list) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { list, pos, slow, fast, meetPos, ptr1, ptr2, entrance, phase, result } = state;

          const coreIdea = getProblemCoreIdea(59);

          return (
            <div className="space-y-6">
              {coreIdea && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="text-red-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">环形链表II - 快慢指针</h3>
                  </div>
                  <CoreIdeaBox {...coreIdea} />
                </div>
              )}
              
              {/* 链表可视化 */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  {phase === 'phase1' && '阶段1：快慢指针寻找相遇点'}
                  {phase === 'meet' && '找到相遇点'}
                  {phase === 'phase2' && '阶段2：双指针寻找环入口'}
                  {phase === 'complete' && '完成！'}
                  {!phase && pos !== undefined && pos >= 0 && `链表结构 (环入口: ${pos})`}
                  {result === null && '无环链表'}
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
                          idx === entrance && phase === 'complete'
                            ? 'border-green-500 bg-green-100 text-green-700 ring-4 ring-green-300'
                            : phase === 'phase1' && (idx === slow || idx === fast)
                            ? idx === slow
                              ? 'border-blue-500 bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                              : 'border-purple-500 bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                            : phase === 'meet' && idx === meetPos
                            ? 'border-red-500 bg-red-100 text-red-700 ring-2 ring-red-300'
                            : phase === 'phase2' && (idx === ptr1 || idx === ptr2)
                            ? idx === ptr1
                              ? 'border-cyan-500 bg-cyan-100 text-cyan-700 ring-2 ring-cyan-300'
                              : 'border-orange-500 bg-orange-100 text-orange-700 ring-2 ring-orange-300'
                            : idx === pos && pos >= 0
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : 'border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {val}
                        {idx === pos && pos >= 0 && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                            入
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

              {/* 阶段1指针 */}
              {phase === 'phase1' && slow !== undefined && fast !== undefined && (
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>慢指针 (索引 {slow})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span>快指针 (索引 {fast})</span>
                  </div>
                </div>
              )}

              {/* 相遇提示 */}
              {phase === 'meet' && meetPos !== undefined && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-red-50 border-2 border-red-300 rounded-lg"
                >
                  <div className="text-red-700 font-medium text-center">
                    ✓ 快慢指针在位置 {meetPos} 相遇！开始寻找环入口...
                  </div>
                </motion.div>
              )}

              {/* 阶段2指针 */}
              {phase === 'phase2' && ptr1 !== undefined && ptr2 !== undefined && (
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                    <span>指针1（从头开始，索引 {ptr1}）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span>指针2（从相遇点开始，索引 {ptr2}）</span>
                  </div>
                </div>
              )}

              {/* 找到入口 */}
              {phase === 'complete' && entrance !== undefined && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 rounded-lg text-center bg-green-50 border-2 border-green-300"
                >
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    ✓ 找到环入口！
                  </div>
                  <div className="text-sm text-green-600">
                    位置：{entrance}，值：{list[entrance]}
                  </div>
                </motion.div>
              )}

              {/* 无环结果 */}
              {result === null && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 rounded-lg text-center bg-blue-50 border-2 border-blue-300"
                >
                  <div className="text-2xl font-bold text-blue-700">
                    该链表无环
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

export default DetectCycleVisualizer;
