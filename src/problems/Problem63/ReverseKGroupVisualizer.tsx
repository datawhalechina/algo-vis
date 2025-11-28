import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { LinkedListTemplate, type LinkedListNode } from "@/components/visualizers/templates/LinkedListTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateReverseKGroupSteps } from "./algorithm";
import type { ProblemInput } from "@/types/visualization";

interface ReverseKGroupInput extends ProblemInput {
  list: number[];
  k: number;
}

interface ReverseKGroupData {
  list?: number[];
  result?: number[];
  k?: number;
  groupCount?: number;
  i?: number;
  completed?: boolean;
}

function ReverseKGroupVisualizer() {
  return (
    <ConfigurableVisualizer<ReverseKGroupInput, ReverseKGroupData>
      config={{
        defaultInput: { list: [1, 2, 3, 4, 5], k: 3 },
        algorithm: (input) => generateReverseKGroupSteps(input.list, input.k),
        
        inputTypes: [
          { type: "array", key: "list", label: "链表节点值" },
          { type: "number", key: "k", label: "每组个数 k" },
        ],
        inputFields: [
          { type: "array", key: "list", label: "链表节点值", placeholder: "输入节点值，用逗号分隔，如: 1,2,3,4,5" },
          { type: "number", key: "k", label: "每组个数 k", placeholder: "输入k的值" },
        ],
        testCases: [
          { label: "示例1: k=3", value: { list: [1, 2, 3, 4, 5], k: 3 } },
          { label: "示例2: k=2", value: { list: [1, 2, 3, 4, 5], k: 2 } },
          { label: "示例3: k=1", value: { list: [1, 2], k: 1 } },
        ],
        
        render: ({ data }) => {
          const state = data as ReverseKGroupData;
          const coreIdea = getProblemCoreIdea(63);
          
          if (!state || !state.list) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { list, result, k, groupCount, i } = state;
          const displayList = result || list;

          // 构建链表节点
          const nodes: LinkedListNode[] = displayList.map((val, idx) => ({
            val,
            next: idx < displayList.length - 1 ? idx + 1 : null,
          }));

          // 计算当前节点属于哪个组
          const getGroupIndex = (idx: number) => {
            if (k === undefined) return -1;
            return Math.floor(idx / k);
          };

          return (
            <div className="space-y-6">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 原始链表 */}
              {!result && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    原始链表（每 {k} 个一组）
                  </div>
                  <LinkedListTemplate
                    nodes={nodes}
                    renderNode={(node, index) => {
                      const groupIdx = getGroupIndex(index);
                      const colors = [
                        'border-blue-400 bg-blue-50 text-blue-700',
                        'border-purple-400 bg-purple-50 text-purple-700',
                        'border-green-400 bg-green-50 text-green-700',
                        'border-orange-400 bg-orange-50 text-orange-700',
                      ];
                      const color = colors[groupIdx % colors.length];
                      
                      return (
                        <div className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg font-bold ${color}`}>
                          {node.val}
                        </div>
                      );
                    }}
                  />
                </div>
              )}

              {/* 翻转后的链表 */}
              {result && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    {groupCount ? `已翻转 ${groupCount} 组` : '翻转中...'}
                  </div>
                  <LinkedListTemplate
                    nodes={nodes}
                    renderNode={(node, index) => {
                      const groupIdx = getGroupIndex(index);
                      const currentGroupStart = i !== undefined ? i : 0;
                      const isCurrentGroup = i !== undefined && index >= currentGroupStart && index < currentGroupStart + (k || 0);
                      
                      const colors = [
                        'border-blue-400 bg-blue-50 text-blue-700',
                        'border-purple-400 bg-purple-50 text-purple-700',
                        'border-green-400 bg-green-50 text-green-700',
                        'border-orange-400 bg-orange-50 text-orange-700',
                      ];
                      const color = colors[groupIdx % colors.length];
                      
                      return (
                        <div className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg font-bold transition-all ${
                          isCurrentGroup
                            ? 'ring-2 ring-yellow-400 ' + color
                            : color
                        }`}>
                          {node.val}
                        </div>
                      );
                    }}
                  />
                </div>
              )}

              {/* 分组说明 */}
              {k && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-700">
                    📌 每 {k} 个节点为一组进行翻转，不足 {k} 个的保持原顺序
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

export default ReverseKGroupVisualizer;
