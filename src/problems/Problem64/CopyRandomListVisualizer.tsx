import { motion } from "framer-motion";
import { Copy, ArrowRight } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateCopyRandomListSteps, RandomListNode } from "./algorithm";
import type { ProblemInput } from "@/types/visualization";

interface CopyRandomListInput extends ProblemInput {
  nodes: RandomListNode[];
}

interface CopyRandomListData {
  nodes?: RandomListNode[];
  newNodes?: RandomListNode[];
  currentIdx?: number;
  random?: number | null;
  phase?: string;
  completed?: boolean;
}

function CopyRandomListVisualizer() {
  return (
    <ConfigurableVisualizer<CopyRandomListInput, CopyRandomListData>
      config={{
        defaultInput: {
          nodes: [
            { val: 7, random: null },
            { val: 13, random: 0 },
            { val: 11, random: 4 },
            { val: 10, random: 2 },
            { val: 1, random: 0 },
          ],
        },
        algorithm: (input) => generateCopyRandomListSteps(input.nodes),
        
        inputTypes: [],
        inputFields: [],
        testCases: [
          { 
            label: "示例1", 
            value: { 
              nodes: [
                { val: 7, random: null },
                { val: 13, random: 0 },
                { val: 11, random: 4 },
                { val: 10, random: 2 },
                { val: 1, random: 0 },
              ] 
            } 
          },
          { 
            label: "示例2", 
            value: { 
              nodes: [
                { val: 1, random: 1 },
                { val: 2, random: 1 },
              ] 
            } 
          },
          { 
            label: "无random指针", 
            value: { 
              nodes: [
                { val: 1, random: null },
                { val: 2, random: null },
                { val: 3, random: null },
              ] 
            } 
          },
        ],
        
        render: ({ data }) => {
          const state = data as CopyRandomListData;
          
          if (!state || !state.nodes) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { nodes, newNodes = [], currentIdx, random, phase, completed } = state;

          return (
            <div className="space-y-6">
              {/* 标题说明 */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center gap-2">
                  <Copy size={20} className="text-blue-600" />
                  深拷贝随机链表
                </h3>
                <p className="text-sm text-gray-600">
                  使用哈希表建立原节点与新节点的映射，分两次遍历完成深拷贝
                </p>
              </div>

              {/* 原链表 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-4 text-gray-700">原链表（带random指针）</h4>
                <div className="flex items-start justify-center gap-4">
                  {nodes.map((node, idx) => (
                    <motion.div
                      key={idx}
                      className="relative flex flex-col items-center"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      {/* 节点 */}
                      <div
                        className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center border-2 transition-all ${
                          currentIdx === idx
                            ? 'border-blue-500 bg-blue-100 text-blue-700 ring-2 ring-blue-300 scale-110'
                            : 'border-blue-400 bg-blue-50 text-blue-700'
                        }`}
                      >
                        <div className="text-xs text-blue-600 mb-1">节点{idx}</div>
                        <div className="text-2xl font-bold">{node.val}</div>
                      </div>
                      
                      {/* Next指针 */}
                      {idx < nodes.length - 1 && (
                        <div className="absolute -right-3 top-8 text-gray-400 font-bold text-xl">
                          →
                        </div>
                      )}
                      
                      {/* Random指针 */}
                      {node.random !== null && (
                        <div className="mt-2 text-xs">
                          <div className="flex items-center gap-1 text-red-600">
                            <div>random</div>
                            <ArrowRight size={12} />
                            <div className="font-bold">{node.random}</div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 新链表 */}
              {newNodes.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-4 text-gray-700">
                    {completed ? '✓ 复制完成的新链表' : '新链表（创建中...）'}
                  </h4>
                  <div className="flex items-start justify-center gap-4">
                    {newNodes.map((newNode, idx) => (
                      <motion.div
                        key={idx}
                        className="relative flex flex-col items-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        {/* 节点 */}
                        <div
                          className={`w-20 h-20 rounded-lg flex flex-col items-center justify-center border-2 transition-all ${
                            currentIdx === idx && !completed
                              ? 'border-green-500 bg-green-100 text-green-700 ring-2 ring-green-300 scale-110'
                              : completed
                              ? 'border-green-500 bg-green-100 text-green-700'
                              : 'border-green-400 bg-green-50 text-green-700'
                          }`}
                        >
                          <div className="text-xs text-green-600 mb-1">新{idx}</div>
                          <div className="text-2xl font-bold">{newNode.val}</div>
                        </div>
                        
                        {/* Next指针 */}
                        {idx < newNodes.length - 1 && (
                          <div className="absolute -right-3 top-8 text-gray-400 font-bold text-xl">
                            →
                          </div>
                        )}
                        
                        {/* Random指针显示 */}
                        {newNode.random !== null && (
                          <div className="mt-2 text-xs">
                            <div className={`flex items-center gap-1 ${
                              completed ? 'text-orange-600' : 'text-gray-400'
                            }`}>
                              <div>random</div>
                              <ArrowRight size={12} />
                              <div className="font-bold">{newNode.random}</div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 当前操作提示 */}
              {currentIdx !== undefined && !completed && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg border p-4 ${
                    phase === 'create' 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    phase === 'create' ? 'text-blue-900' : 'text-purple-900'
                  }`}>
                    {phase === 'create'
                      ? `🔹 第一遍遍历：创建节点${currentIdx}，值=${nodes[currentIdx].val}`
                      : `🔸 第二遍遍历：设置节点${currentIdx}的random指针 → ${random === null ? 'null' : '节点' + random}`
                    }
                  </div>
                </motion.div>
              )}

              {/* 完成提示 */}
              {completed && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-green-50 border-2 border-green-300 rounded-lg text-center"
                >
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    ✓ 深拷贝完成！
                  </div>
                  <div className="text-sm text-green-600">
                    成功复制了{nodes.length}个节点及其random指针关系
                  </div>
                </motion.div>
              )}

              {/* 算法说明 */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-700">
                  <div className="font-semibold mb-2">💡 算法思路</div>
                  <div className="space-y-1">
                    <div>1️⃣ 第一次遍历：创建所有新节点，建立哈希映射</div>
                    <div>2️⃣ 第二次遍历：通过哈希表设置random指针</div>
                    <div className="mt-2 text-xs">⏱️ 时间 O(n) | 💾 空间 O(n)</div>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default CopyRandomListVisualizer;
