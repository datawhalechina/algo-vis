import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { generateAddTwoNumbersSteps } from "./algorithm";

interface AddTwoNumbersInput {
  [key: string]: any;
  l1: number[];
  l2: number[];
}

interface AddTwoNumbersData {
  l1?: number[];
  l2?: number[];
  result?: number[];
  carry?: number;
  i?: number;
  val1?: number;
  val2?: number;
  sum?: number;
  digit?: number;
  completed?: boolean;
}

function AddTwoNumbersVisualizer() {
  return (
    <ConfigurableVisualizer<AddTwoNumbersInput, AddTwoNumbersData>
      config={{
        defaultInput: { l1: [2, 4, 3], l2: [5, 6, 4] },
        algorithm: (input) => generateAddTwoNumbersSteps(input.l1, input.l2),
        
        inputTypes: [
          { type: "array", key: "l1", label: "链表1" },
          { type: "array", key: "l2", label: "链表2" }
        ],
        inputFields: [
          { type: "array", key: "l1", label: "链表1节点值", placeholder: "输入节点值，用逗号分隔，如: 2,4,3" },
          { type: "array", key: "l2", label: "链表2节点值", placeholder: "输入节点值，用逗号分隔，如: 5,6,4" }
        ],
        testCases: [
          { label: "示例 1", value: { l1: [2, 4, 3], l2: [5, 6, 4] } },
          { label: "示例 2", value: { l1: [0], l2: [0] } },
          { label: "示例 3", value: { l1: [9, 9, 9], l2: [1] } },
        ],
        
        render: ({ data, visualization }) => {
          const input = visualization.input as AddTwoNumbersInput;
          const l1 = data.l1 || input.l1;
          const l2 = data.l2 || input.l2;
          const result = data.result || [];
          const currentIndex = data.i;
          const carry = data.carry || 0;
          const val1 = data.val1;
          const val2 = data.val2;
          const sum = data.sum;
          
          const coreIdea = getProblemCoreIdea(60);
          
          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Plus size={20} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">两数相加 - 链表模拟</h3>
                </div>
                
                {coreIdea && <CoreIdeaBox {...coreIdea} />}
                
                <p className="text-sm text-gray-600 mt-4">
                  从低位到高位逐位相加，注意处理进位。链表逆序存储，第一个节点是个位。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">链表1</h4>
                <ArrayTemplate
                  data={l1}
                  renderItem={(item, index) => (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold ${
                        index === currentIndex
                          ? 'bg-blue-500 text-white scale-110'
                          : 'bg-blue-100 text-blue-700 border-blue-400'
                      }`}
                    >
                      {item}
                    </motion.div>
                  )}
                  layout={{ direction: 'row', gap: '0.5rem' }}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">链表2</h4>
                <ArrayTemplate
                  data={l2}
                  renderItem={(item, index) => (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold ${
                        index === currentIndex
                          ? 'bg-purple-500 text-white scale-110'
                          : 'bg-purple-100 text-purple-700 border-purple-400'
                      }`}
                    >
                      {item}
                    </motion.div>
                  )}
                  layout={{ direction: 'row', gap: '0.5rem' }}
                />
              </div>

              {result.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">结果</h4>
                  <ArrayTemplate
                    data={result}
                    renderItem={(item, index) => (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold ${
                          index === currentIndex
                            ? 'bg-green-500 text-white scale-110'
                            : 'bg-green-100 text-green-700 border-green-400'
                        }`}
                      >
                        {item}
                      </motion.div>
                    )}
                    layout={{ direction: 'row', gap: '0.5rem' }}
                  />
                </div>
              )}

              {currentIndex !== undefined && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">当前计算</h4>
                  <div className="p-4 bg-gray-50 rounded-lg font-mono text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-700">{val1 ?? 0}</span>
                      <span className="text-gray-500">+</span>
                      <span className="text-purple-700">{val2 ?? 0}</span>
                      {carry > 0 && (
                        <>
                          <span className="text-gray-500">+</span>
                          <span className="text-orange-700">{carry}(进位)</span>
                        </>
                      )}
                      <span className="text-gray-500">=</span>
                      <span className="text-green-700 font-bold">{sum}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default AddTwoNumbersVisualizer;
