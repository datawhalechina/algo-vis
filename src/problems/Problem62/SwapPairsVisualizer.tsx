import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { LinkedListTemplate, LinkedListNode, PointerState } from "@/components/visualizers/templates/LinkedListTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateSwapPairsSteps, SwapPairsState } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface SwapPairsInput extends ProblemInput {
  values: number[];
}

function SwapPairsVisualizer() {
  return (
    <ConfigurableVisualizer<SwapPairsInput, SwapPairsState>
      config={{
        defaultInput: { values: [1, 2, 3, 4] },
        algorithm: (input) => generateSwapPairsSteps(input.values),
        
        inputTypes: [{ type: "array", key: "values", label: "链表节点值" }],
        inputFields: [{ type: "array", key: "values", label: "链表节点值", placeholder: "输入节点值，用逗号分隔，如: 1,2,3,4" }],
        testCases: [
          { label: "示例 1", value: { values: [1, 2, 3, 4] } },
          { label: "示例 2", value: { values: [1] } },
          { label: "示例 3", value: { values: [1, 2, 3, 4, 5] } },
        ],
        
        render: ({ data }) => {
          const state = data as SwapPairsState;
          const coreIdea = getProblemCoreIdea(62);
          
          if (!state || !state.nodes || state.nodes.length === 0) {
            return null;
          }

          const displayNodes = state.nodes as LinkedListNode[];
          const pointers: PointerState[] = [
            ...(state.prevIndex !== null ? [{
              name: 'prev',
              index: state.prevIndex,
              color: '#6366f1',
              label: 'PREV',
            }] : []),
            ...(state.firstIndex !== null ? [{
              name: 'first',
              index: state.firstIndex,
              color: '#10b981',
              label: 'FIRST',
            }] : []),
            ...(state.secondIndex !== null ? [{
              name: 'second',
              index: state.secondIndex,
              color: '#f59e0b',
              label: 'SECOND',
            }] : []),
          ];

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <RefreshCw size={20} className="text-blue-600" />
                  两两交换相邻节点
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  每次交换两个相邻节点。使用三个指针：prev(前驱)、first(第一个)、second(第二个)，通过调整指针完成交换。
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <LinkedListTemplate
                  nodes={displayNodes}
                  pointers={pointers}
                  layout={{ direction: 'horizontal', gap: '0.75rem' }}
                  renderNode={(node, index, nodeState) => {
                    const isPrev = nodeState.activePointers?.includes('prev');
                    const isFirst = nodeState.activePointers?.includes('first');
                    const isSecond = nodeState.activePointers?.includes('second');
                    const isSwapped = state.swappedPairs?.includes(Math.floor(index / 2));
                    
                    const getNodeColor = () => {
                      if (isFirst) return "border-green-500 bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg";
                      if (isSecond) return "border-orange-500 bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg";
                      if (isPrev) return "border-indigo-500 bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg";
                      if (isSwapped) return "border-blue-400 bg-blue-100 text-blue-800";
                      return "border-gray-300 bg-white text-gray-800";
                    };

                    return (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`relative w-16 h-16 rounded-xl border-4 flex flex-col items-center justify-center transition-all ${getNodeColor()}`}
                      >
                        <div className="text-sm font-mono opacity-60">#{index}</div>
                        <div className="text-2xl font-bold">{node.val}</div>
                      </motion.div>
                    );
                  }}
                />
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default SwapPairsVisualizer;
