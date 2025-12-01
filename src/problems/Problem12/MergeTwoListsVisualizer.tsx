import { generateMergeTwoListsSteps } from "./algorithm";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Link } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";

interface MergeTwoListsInput extends ProblemInput {
  list1: number[];
  list2: number[];
}

interface MergeTwoListsData {
  list1?: number[];
  list2?: number[];
  merged?: number[];
}

function MergeTwoListsVisualizer() {
  return (
    <ConfigurableVisualizer<MergeTwoListsInput, MergeTwoListsData>
      config={{
        defaultInput: { list1: [1, 2, 4], list2: [1, 3, 4] },
        algorithm: (input) => generateMergeTwoListsSteps(input.list1, input.list2),
        
        inputTypes: [
          { type: "array", key: "list1", label: "链表1" },
          { type: "array", key: "list2", label: "链表2" },
        ],
        inputFields: [
          { type: "array", key: "list1", label: "链表1", placeholder: "输入有序数组，如: 1,2,4" },
          { type: "array", key: "list2", label: "链表2", placeholder: "输入有序数组，如: 1,3,4" },
        ],
        testCases: [
          { label: "示例 1", value: { list1: [1, 2, 4], list2: [1, 3, 4] } },
          { label: "示例 2", value: { list1: [], list2: [] } },
          { label: "示例 3", value: { list1: [], list2: [0] } },
          { label: "示例 4", value: { list1: [1, 3, 5], list2: [2, 4, 6] } },
        ],
        
        customStepVariables: (variables) => {
          const pointer1 = variables?.pointer1 as number | undefined;
          const pointer2 = variables?.pointer2 as number | undefined;
          return (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {pointer1 !== undefined && (
                <div>
                  <span className="font-mono text-blue-600 font-semibold">pointer1</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{pointer1}</span>
                </div>
              )}
              {pointer2 !== undefined && (
                <div>
                  <span className="font-mono text-green-600 font-semibold">pointer2</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{pointer2}</span>
                </div>
              )}
            </div>
          );
        },
        
        render: ({ data, getNumberVariable, getBooleanVariable }) => {
          const { list1 = [], list2 = [], merged = [] } = data;
          const pointer1 = getNumberVariable('pointer1');
          const pointer2 = getNumberVariable('pointer2');
          const comparing = getBooleanVariable('comparing');
          const finished = getBooleanVariable('finished');

          const coreIdea = getProblemCoreIdea(12);

          const renderList = (list: number[], pointer: number | undefined, color: string, label: string) => (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="text-sm font-semibold mb-3 text-gray-700">{label}</h4>
              <div className="flex gap-2 items-center">
                {list.map((val: number, index: number) => {
                  const isPointer = pointer === index;
                  const isPassed = pointer !== undefined && index < pointer;
                  return (
                    <motion.div
                      key={index}
                      className={`relative w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold border-2 ${
                        isPointer
                          ? `${color} shadow-lg scale-110`
                          : isPassed
                          ? 'bg-gray-300 border-gray-400 opacity-50'
                          : `bg-gradient-to-br ${color.replace('bg-', 'from-')}-400 to-${color.split('-')[1]}-600 border-${color.split('-')[1]}-500`
                      }`}
                      animate={{
                        scale: isPointer ? 1.1 : isPassed ? 0.9 : 1,
                        opacity: isPassed ? 0.5 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {val}
                      {isPointer && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-8 text-xs font-bold whitespace-nowrap text-gray-700"
                        >
                          ↓ 当前
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
                {list.length === 0 && <div className="text-gray-400 text-sm">空链表</div>}
              </div>
            </div>
          );

          return (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Link className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">合并两个有序链表</h3>
                </div>
                
                {coreIdea && <CoreIdeaBox {...coreIdea} />}
              </div>
              
              {renderList(list1 as number[], pointer1, 'bg-blue', 'List 1')}
              {renderList(list2 as number[], pointer2, 'bg-green', 'List 2')}

              {comparing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-2"
                >
                  <ArrowRight className="text-purple-600" size={32} />
                </motion.div>
              )}

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border-2 border-purple-200 p-4">
                <h4 className="text-sm font-semibold mb-3 text-purple-700 flex items-center gap-2">
                  <CheckCircle size={16} />
                  合并结果
                </h4>
                <div className="flex gap-2 items-center flex-wrap">
                  {(merged as number[]).map((val: number, index: number) => {
                    const justAdded = index === (merged as number[]).length - 1 && !finished;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                          justAdded
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
                            : 'bg-gradient-to-br from-purple-400 to-purple-600'
                        }`}
                      >
                        {val}
                      </motion.div>
                    );
                  })}
                  {(merged as number[]).length === 0 && <div className="text-gray-400 text-sm">等待合并...</div>}
                </div>
              </div>

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 shadow-xl text-center text-white"
                >
                  <CheckCircle className="mx-auto mb-3" size={48} />
                  <div className="text-2xl font-bold">合并完成！</div>
                  <div className="mt-2 text-lg">结果：[{(merged as number[]).join(', ')}]</div>
                </motion.div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default MergeTwoListsVisualizer;
