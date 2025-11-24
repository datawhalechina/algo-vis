import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { LinkedListTemplate, type LinkedListNode, type PointerState } from "@/components/visualizers/templates/LinkedListTemplate";
import { generatePalindromeListSteps } from "./algorithm";
import type { ProblemInput } from "@/types/visualization";

interface PalindromeListInput extends ProblemInput {
  list: number[];
}

interface PalindromeListData {
  list?: number[];
  slow?: number;
  fast?: number;
  mid?: number;
  reversed?: number[];
  compareIdx?: number;
  match?: boolean;
  isPalindrome?: boolean;
  phase?: string;
}

function PalindromeListVisualizer() {
  return (
    <ConfigurableVisualizer<PalindromeListInput, PalindromeListData>
      config={{
        defaultInput: { list: [1, 2, 2, 1] },
        algorithm: (input) => generatePalindromeListSteps(input.list),
        
        inputTypes: [{ type: "array", key: "list", label: "链表节点值" }],
        inputFields: [{ type: "array", key: "list", label: "链表节点值", placeholder: "输入节点值，用逗号分隔，如: 1,2,2,1" }],
        testCases: [
          { label: "回文链表", value: { list: [1, 2, 2, 1] } },
          { label: "奇数回文", value: { list: [1, 2, 3, 2, 1] } },
          { label: "非回文", value: { list: [1, 2, 3, 4] } },
          { label: "单节点", value: { list: [1] } },
        ],
        
        render: ({ data }) => {
          const state = data as PalindromeListData;
          
          if (!state || !state.list) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { list, slow, fast, compareIdx, match, isPalindrome, phase } = state;

          // 构建链表节点
          const nodes: LinkedListNode[] = list.map((val, idx) => ({
            val,
            next: idx < list.length - 1 ? idx + 1 : null,
          }));

          // 构建指针
          const pointers: PointerState[] = [];
          if (phase === 'find-mid' && slow !== undefined && fast !== undefined) {
            pointers.push(
              { name: 'slow', index: slow, color: '#3b82f6', label: '慢' },
              { name: 'fast', index: fast, color: '#8b5cf6', label: '快' }
            );
          }

          return (
            <div className="space-y-6">
              <LinkedListTemplate
                nodes={nodes}
                pointers={pointers}
                renderNode={(node, index, nodeState) => (
                  <div
                    className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg font-bold transition-all ${
                      phase === 'compare' && index === compareIdx
                        ? match
                          ? 'border-green-500 bg-green-100 text-green-700 ring-2 ring-green-300'
                          : 'border-red-500 bg-red-100 text-red-700 ring-2 ring-red-300'
                        : nodeState.isActive
                        ? nodeState.activePointers?.includes('slow')
                          ? 'border-blue-500 bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                          : 'border-purple-500 bg-purple-100 text-purple-700 ring-2 ring-purple-300'
                        : phase === 'complete' && isPalindrome
                        ? 'border-green-400 bg-green-50 text-green-700'
                        : phase === 'complete' && !isPalindrome
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {node.val}
                  </div>
                )}
              />

              {/* 比较结果 */}
              {phase === 'compare' && compareIdx !== undefined && (
                <div className={`p-4 rounded-lg ${
                  match ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`text-sm font-medium ${
                    match ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {match ? '✓' : '✗'} 位置 {compareIdx} 比较: {list[compareIdx]} {match ? '==' : '!='}
                  </div>
                </div>
              )}

              {/* 最终结果 */}
              {phase === 'complete' && isPalindrome !== undefined && (
                <div className={`p-6 rounded-lg text-center ${
                  isPalindrome
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-red-50 border-2 border-red-300'
                }`}>
                  <div className={`text-2xl font-bold ${
                    isPalindrome ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isPalindrome ? '✓ 是回文链表' : '✗ 不是回文链表'}
                  </div>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default PalindromeListVisualizer;
