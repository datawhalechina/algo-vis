import { GitBranch, ArrowRight } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { LinkedListTemplate, LinkedListNode } from "@/components/visualizers/templates/LinkedListTemplate";
import { generateFlattenSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface FlattenTreeInput extends ProblemInput {
  tree: string;
}

function parseTreeInput(input: string): (number | null)[] {
  if (!input.trim()) return [];
  return input.split(',').map(s => {
    const trimmed = s.trim();
    if (trimmed === 'null' || trimmed === '') return null;
    const num = parseInt(trimmed);
    return isNaN(num) ? null : num;
  });
}

interface FlattenTreeData {
  tree?: (number | null)[];
}

function FlattenTreeVisualizer() {
  return (
    <ConfigurableVisualizer<FlattenTreeInput, FlattenTreeData>
      config={{
        defaultInput: { tree: "1,2,5,3,4,null,6" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          return generateFlattenSteps(arr);
        },

        inputTypes: [{ type: "string", key: "tree", label: "树（数组格式）" }],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 1,2,5,3,4,null,6",
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "1,2,5,3,4,null,6" } },
          { label: "示例 2", value: { tree: "0" } },
          { label: "示例 3", value: { tree: "1,2,3" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentNode = variables?.currentNode as number | undefined;
          const finalResult = variables?.finalResult as number[] | undefined;
          const preorderPath = variables?.preorderPath as number[] | undefined;
          const step = variables?.step as string | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GitBranch className="text-orange-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">二叉树展开为链表 - 前序遍历</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-orange-700">💡 核心思想：</span>
                    将左子树移到右侧，原右子树接到左子树的最右节点后面。
                  </p>
                  <div className="flex flex-col gap-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">步骤1:</span>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">左子树 → 右侧</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">步骤2:</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">原右子树 → 左子树最右节点</span>
                    </div>
                  </div>
                </div>

                {/* 前序遍历顺序 */}
                {preorderPath && preorderPath.length > 0 && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-2">📋 前序遍历顺序（最终链表顺序）</div>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {preorderPath.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div
                              className={`px-3 py-2 rounded-lg font-mono font-bold ${
                                val === currentNode
                                  ? 'bg-orange-600 text-white scale-110 shadow-lg'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {val}
                            </div>
                            {idx < preorderPath.length - 1 && (
                              <span className="text-blue-400">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 当前步骤提示 */}
                {step && (
                  <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-center">
                      <div className="font-semibold text-purple-700">
                        {step === 'move-left-to-right' && '➡️ 步骤1：将左子树移动到右侧'}
                        {step === 'connect-right' && '🔗 步骤2：连接原右子树'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 最终结果 - 横向链表展示 */}
                {finalResult && (
                  <div className="mb-4 space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg font-bold text-green-700">
                          ✓ 展开完成！链表顺序: [{finalResult.join(' → ')}]
                        </span>
                      </div>
                    </div>
                    
                    {/* 使用 LinkedListTemplate 展示链表 */}
                    <div className="bg-white rounded-lg border-2 border-blue-300 p-4">
                      <div className="text-center mb-4">
                        <span className="text-sm font-bold text-blue-700">🔗 横向链表视图（右指针链）</span>
                      </div>
                      <LinkedListTemplate
                        nodes={finalResult.map((val, idx): LinkedListNode => ({
                          val,
                          next: idx < finalResult.length - 1 ? idx + 1 : null
                        }))}
                        renderNode={(node, _index) => (
                          <div className="flex flex-col items-center">
                            {/* 节点圆形 - 这部分用于箭头对齐 */}
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg border-2 border-white">
                                <span className="text-white font-bold text-lg">{node.val}</span>
                              </div>
                            </div>
                            {/* 指针信息 - 放在下方，不影响箭头对齐 */}
                            <div className="text-xs text-gray-500 mt-2 text-center min-h-[2.5rem]">
                              <div className="text-gray-400">left: null</div>
                              <div className="text-emerald-600 font-semibold">
                                right: {node.next !== null ? finalResult[node.next] : 'null'}
                              </div>
                            </div>
                          </div>
                        )}
                        renderArrow={(_fromIndex, _toIndex, _isReversed) => (
                          <div className="flex flex-col items-center justify-center mx-2" style={{ marginBottom: '2.5rem' }}>
                            <ArrowRight 
                              size={32} 
                              strokeWidth={2.5}
                              className="text-emerald-500 drop-shadow-sm"
                            />
                          </div>
                        )}
                        layout={{
                          direction: 'horizontal',
                          nodeGap: '1rem'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 使用 TreeTemplate */}
                <TreeTemplate
                  data={tree}
                  getNodeState={(_index: number, val: number | null) => {
                    if (val === null) return {};
                    const isCurrent = val === currentNode;
                    return {
                      isCurrent,
                      customState: { 
                        current: isCurrent
                      }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={
                            isCurrent 
                              ? "url(#node-gradient-orange)" 
                              : "url(#node-gradient-default)"
                          }
                          stroke={
                            isCurrent ? "#f97316" : "#cbd5e1"
                          }
                          strokeWidth={isCurrent ? "3" : "2"}
                        />
                        
                        <text
                          textAnchor="middle"
                          dy="0.35em"
                          className="text-base font-bold select-none"
                          fill="white"
                        >
                          {pos.node.val}
                        </text>

                        <defs>
                          <linearGradient id="node-gradient-default" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#64748b" />
                          </linearGradient>
                          <linearGradient id="node-gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fb923c" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#94a3b8', label: '未处理' },
                    { color: '#f97316', label: '当前处理' },
                  ]}
                />
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default FlattenTreeVisualizer;
