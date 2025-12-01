import { generateReverseLinkedListSteps, ReverseListState } from "./algorithm";
import { motion } from "framer-motion";
import { ArrowRight, Check, Link2 } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { LinkedListTemplate, LinkedListNode, PointerState } from "@/components/visualizers/templates/LinkedListTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";

interface ReverseLinkedListInput extends ProblemInput {
  values: number[];
}

function ReverseLinkedListVisualizer() {
  return (
    <ConfigurableVisualizer<ReverseLinkedListInput, ReverseListState>
      config={{
        defaultInput: { values: [1, 2, 3, 4, 5] },
        algorithm: (input) => generateReverseLinkedListSteps(input.values),
        
        inputTypes: [{ type: "array", key: "values", label: "链表节点值" }],
        inputFields: [{ type: "array", key: "values", label: "链表节点值", placeholder: "输入节点值，用逗号分隔，如: 1,2,3,4,5" }],
        testCases: [
          { label: "示例 1", value: { values: [1, 2, 3, 4, 5] } },
          { label: "示例 2", value: { values: [1, 2] } },
          { label: "示例 3", value: { values: [] } },
          { label: "示例 4", value: { values: [1] } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-mono text-blue-600 font-semibold">{key}</span>
                    <span className="text-gray-500"> = </span>
                    <span className="font-mono text-gray-800 font-semibold">
                      {JSON.stringify(value)}
                    </span>
                  </div>
                ))}
              </div>
            );
          }
          return null;
        },
        
        render: ({ data }) => {
          const state = data as ReverseListState;
          
          if (!state || !state.nodes || state.nodes.length === 0) {
            return null; // LinkedListTemplate 会处理空链表
          }

          // 如果链表已反转完成，按照反转后的顺序重新排列节点
          let displayNodes = state.nodes as LinkedListNode[];
          let nodeIndexMap: Map<number, number> = new Map(); // 原始索引 -> 显示索引
          
          if (state.isComplete && state.prevIndex !== null) {
            // 从新的头节点（prevIndex）开始遍历，构建反转后的节点顺序
            const orderedNodes: LinkedListNode[] = [];
            const originalToDisplay: Map<number, number> = new Map();
            let currentIndex: number | null = state.prevIndex;
            let displayIndex = 0;
            
            // 第一步：按照反转后的链表顺序遍历，建立原始索引到显示索引的映射
            const nodeOrder: number[] = [];
            while (currentIndex !== null && displayIndex < state.nodes.length) {
              originalToDisplay.set(currentIndex, displayIndex);
              nodeOrder.push(currentIndex);
              currentIndex = state.nodes[currentIndex].next;
              displayIndex++;
            }
            
            // 第二步：按照映射后的顺序构建节点数组，并更新 next 指针
            nodeOrder.forEach((originalIndex) => {
              const currentNode = state.nodes[originalIndex];
              const nextOriginalIndex = currentNode.next;
              const nextDisplayIndex = nextOriginalIndex !== null && originalToDisplay.has(nextOriginalIndex)
                ? originalToDisplay.get(nextOriginalIndex)!
                : null;
              
              orderedNodes.push({
                ...currentNode,
                next: nextDisplayIndex,
              });
            });
            
            displayNodes = orderedNodes;
            // 更新指针索引映射
            nodeIndexMap = originalToDisplay;
          } else {
            // 反转过程中，保持原始索引顺序显示
            state.nodes.forEach((_, index) => {
              nodeIndexMap.set(index, index);
            });
          }

          // 构建指针配置（需要映射到显示索引）
          const pointers: PointerState[] = [
            ...(state.prevIndex !== null && nodeIndexMap.has(state.prevIndex) ? [{
              name: 'prev',
              index: nodeIndexMap.get(state.prevIndex)!,
              color: '#3b82f6', // blue-500
              label: 'PREV',
            }] : []),
            ...(state.currIndex !== null && nodeIndexMap.has(state.currIndex) ? [{
              name: 'curr',
              index: nodeIndexMap.get(state.currIndex)!,
              color: '#10b981', // green-500
              label: 'CURR',
            }] : []),
            ...(state.nextIndex !== null && nodeIndexMap.has(state.nextIndex) ? [{
              name: 'next',
              index: nodeIndexMap.get(state.nextIndex)!,
              color: '#f59e0b', // amber-500
              label: 'NEXT',
            }] : []),
          ];

          const coreIdea = getProblemCoreIdea(2);
          
          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Link2 className="text-blue-600" size={20} />
                  反转链表 - 双指针迭代
                </h3>
              </div>
              
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <LinkedListTemplate
                nodes={displayNodes}
                pointers={pointers}
                layout={{ direction: 'horizontal', gap: '0.75rem' }}
                renderNode={(node, index, nodeState) => {
                  const isPrev = nodeState.activePointers?.includes('prev');
                  const isCurr = nodeState.activePointers?.includes('curr');
                  const isNext = nodeState.activePointers?.includes('next');
                  
                  const getNodeColor = () => {
                    if (isPrev) return "border-blue-500 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 shadow-lg shadow-blue-200 text-white";
                    if (isCurr) return "border-green-500 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 shadow-lg shadow-green-200 text-white";
                    if (isNext) return "border-orange-500 bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 shadow-lg shadow-orange-200 text-white";
                    return "border-gray-300 bg-gradient-to-br from-white to-gray-50 shadow-md text-gray-800";
                  };

                  const getIndicatorColor = () => {
                    if (isPrev) return "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg";
                    if (isCurr) return "bg-gradient-to-r from-green-600 to-teal-600 shadow-lg";
                    if (isNext) return "bg-gradient-to-r from-orange-600 to-amber-600 shadow-lg";
                    return "bg-gray-400";
                  };

                  const getIndicatorLabel = () => {
                    if (isPrev) return "PREV";
                    if (isCurr) return "CURR";
                    if (isNext) return "NEXT";
                    return "";
                  };

                  return (
                    <div className="flex flex-col items-center relative">
                      {/* 指针标签 */}
                      {(isPrev || isCurr || isNext) && (
                        <motion.div
                          initial={{ opacity: 0, y: -15, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className={`mb-3 px-4 py-1.5 rounded-full text-xs font-bold text-white tracking-wider ${getIndicatorColor()}`}
                        >
                          {getIndicatorLabel()}
                        </motion.div>
                      )}

                      {/* 节点方框 */}
                      <motion.div
                        animate={{
                          scale: isPrev || isCurr || isNext ? 1.08 : 1,
                          y: isPrev || isCurr || isNext ? -2 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className={`w-20 h-20 border-3 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${getNodeColor()}`}
                      >
                        {node.val}
                      </motion.div>

                      {/* 索引 */}
                      <div className={`mt-2 text-sm font-semibold ${
                        isPrev || isCurr || isNext ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        [{index}]
                      </div>

                      {/* 发光效果 */}
                      {(isPrev || isCurr || isNext) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`absolute inset-0 rounded-xl blur-xl ${
                            isPrev ? 'bg-blue-400' : isCurr ? 'bg-green-400' : 'bg-orange-400'
                          } -z-10`}
                        />
                      )}
                    </div>
                  );
                }}
                renderArrow={(_fromIndex, _toIndex, isReversed) => {
                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="flex flex-col items-center justify-center gap-1 mx-2"
                    >
                      {/* 箭头图标 */}
                      <motion.div
                        initial={{ x: -5 }}
                        animate={{ x: 0 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                        className={isReversed ? 'text-green-500' : 'text-gray-400'}
                      >
                        <ArrowRight 
                          size={32} 
                          strokeWidth={2.5}
                          className="drop-shadow-sm"
                        />
                      </motion.div>

                      {/* 已反转标签 */}
                      {isReversed && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                          className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md"
                        >
                          <Check size={12} strokeWidth={3} />
                          <span className="text-[10px]">已反转</span>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                }}
                renderLegend={(pointers) => {
                  const pointerConfigs = [
                    { name: 'prev', label: 'PREV', color: 'from-blue-50 to-indigo-50', borderColor: 'border-blue-200', bgColor: 'from-blue-400 to-indigo-500' },
                    { name: 'curr', label: 'CURR', color: 'from-green-50 to-teal-50', borderColor: 'border-green-200', bgColor: 'from-green-400 to-teal-500' },
                    { name: 'next', label: 'NEXT', color: 'from-orange-50 to-amber-50', borderColor: 'border-orange-200', bgColor: 'from-orange-400 to-amber-500' },
                  ];
                  
                  return (
                    <div className="flex gap-4 items-center justify-center flex-wrap mt-6">
                      {pointerConfigs.map((config) => {
                        const pointer = pointers.find(p => p.name === config.name);
                        if (!pointer) return null;
                        
                        return (
                          <div key={config.name} className={`flex items-center gap-2 bg-gradient-to-r ${config.color} px-4 py-2 rounded-xl border ${config.borderColor} shadow-sm`}>
                            <div className={`w-6 h-6 bg-gradient-to-br ${config.bgColor} rounded-lg shadow-md`}></div>
                            <span className="text-gray-700 font-semibold text-sm">{config.label} 指针</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
            </div>
          );
        },
      }}
    />
  );
}


export default ReverseLinkedListVisualizer;
