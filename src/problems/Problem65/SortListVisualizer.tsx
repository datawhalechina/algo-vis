import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { LinkedListTemplate, type LinkedListNode } from "@/components/visualizers/templates/LinkedListTemplate";
import { generateSortListSteps } from "./algorithm";
import type { ProblemInput } from "@/types/visualization";

interface SortListInput extends ProblemInput {
  list: number[];
}

interface SortListData {
  list?: number[];
  sorted?: number[];
  arr?: number[];
  left?: number[];
  right?: number[];
  mid?: number;
  completed?: boolean;
}

function SortListVisualizer() {
  return (
    <ConfigurableVisualizer<SortListInput, SortListData>
      config={{
        defaultInput: { list: [4, 2, 1, 3] },
        algorithm: (input) => generateSortListSteps(input.list),
        
        inputTypes: [{ type: "array", key: "list", label: "链表节点值" }],
        inputFields: [{ type: "array", key: "list", label: "链表节点值", placeholder: "输入节点值，用逗号分隔，如: 4,2,1,3" }],
        testCases: [
          { label: "示例1", value: { list: [4, 2, 1, 3] } },
          { label: "示例2", value: { list: [-1, 5, 3, 4, 0] } },
          { label: "示例3", value: { list: [1] } },
        ],
        
        render: ({ data }) => {
          const state = data as SortListData;
          
          if (!state || !state.list) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { list, sorted, completed } = state;
          const displayList = sorted && sorted.length > 0 ? sorted : list;

          // 构建链表节点
          const nodes: LinkedListNode[] = displayList.map((val, idx) => ({
            val,
            next: idx < displayList.length - 1 ? idx + 1 : null,
          }));

          return (
            <div className="space-y-6">
              {/* 原始链表 */}
              {!sorted || sorted.length === 0 ? (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    原始链表（未排序）
                  </div>
                  <LinkedListTemplate
                    nodes={nodes}
                    renderNode={(node) => (
                      <div className="w-14 h-14 flex items-center justify-center border-2 rounded-lg font-bold border-gray-400 bg-gray-50 text-gray-700">
                        {node.val}
                      </div>
                    )}
                  />
                </div>
              ) : (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    {completed ? '排序完成 ✓' : '排序中...'}
                  </div>
                  <LinkedListTemplate
                    nodes={nodes}
                    renderNode={(node, index) => {
                      // 检查当前元素是否已经在正确位置
                      const isSorted = completed || (index > 0 && displayList[index - 1] <= (node.val as number));
                      
                      return (
                        <div className={`w-14 h-14 flex items-center justify-center border-2 rounded-lg font-bold transition-all ${
                          completed
                            ? 'border-green-500 bg-green-100 text-green-700'
                            : isSorted
                            ? 'border-blue-400 bg-blue-50 text-blue-700'
                            : 'border-yellow-400 bg-yellow-50 text-yellow-700'
                        }`}>
                          {node.val}
                        </div>
                      );
                    }}
                  />
                </div>
              )}

              {/* 算法说明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-700">
                  <div className="font-semibold mb-2">归并排序（Merge Sort）</div>
                  <div className="space-y-1">
                    <div>1️⃣ 分解：找到链表中点，递归分成两半</div>
                    <div>2️⃣ 排序：递归对两半分别排序</div>
                    <div>3️⃣ 合并：合并两个有序链表</div>
                    <div className="mt-2 text-xs">⏱️ 时间 O(n log n) | 💾 空间 O(log n)</div>
                  </div>
                </div>
              </div>

              {/* 完成提示 */}
              {completed && (
                <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    ✓ 排序完成！
                  </div>
                  <div className="text-sm text-green-600">
                    结果：[{sorted?.join(', ')}]
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

export default SortListVisualizer;
