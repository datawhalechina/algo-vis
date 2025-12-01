import { CheckCircle2 } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateKthSmallestSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface KthSmallestInput extends ProblemInput {
  tree: string;
  k: string;
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

interface KthSmallestData {
  tree?: (number | null)[];
}

function KthSmallestBSTVisualizer() {
  return (
    <ConfigurableVisualizer<KthSmallestInput, KthSmallestData>
      config={{
        defaultInput: { tree: "3,1,4,null,2", k: "1" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          const k = parseInt(input.k);
          return generateKthSmallestSteps(arr, k);
        },

        inputTypes: [
          { type: "string", key: "tree", label: "树（数组格式）" },
          { type: "number", key: "k", label: "K值" }
        ],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉搜索树（LeetCode格式）",
            placeholder: "例如: 3,1,4,null,2",
          },
          {
            type: "number",
            key: "k",
            label: "K值",
            placeholder: "例如: 1",
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "3,1,4,null,2", k: "1" } },
          { label: "示例 2", value: { tree: "5,3,6,2,4,null,null,1", k: "3" } },
          { label: "示例 3", value: { tree: "2,1,3", k: "2" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const k = variables?.k as number | undefined;
          const count = variables?.count as number | undefined;
          const currentNode = variables?.currentNode as number | undefined;
          const result = variables?.result as number | undefined;
          const found = variables?.found as boolean | undefined;
          const finalResult = variables?.finalResult as number | undefined;
          const visitedPath = variables?.visitedPath as number[] | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">二叉搜索树中第K小的元素 - 中序遍历</h3>
                </div>

                {getProblemCoreIdea(79) && <CoreIdeaBox {...getProblemCoreIdea(79)!} />}

                <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-blue-700">💡 核心思想：</span>
                    BST的中序遍历结果是升序的，因此第k个访问的节点就是第k小的元素。
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <span className="font-semibold">遍历顺序：</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">左子树</span>
                    <span>→</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">当前节点</span>
                    <span>→</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">右子树</span>
                  </p>
                </div>

                {/* 当前进度 */}
                {k !== undefined && count !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">目标</div>
                        <div className="font-mono font-bold text-purple-600 text-lg">第 {k} 小</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">已遍历</div>
                        <div className="font-mono font-bold text-blue-700 text-lg">{count} 个</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">当前节点</div>
                        <div className="font-mono font-bold text-green-600 text-lg">
                          {currentNode !== undefined ? currentNode : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 中序遍历路径 */}
                {visitedPath && visitedPath.length > 0 && (
                  <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-2">📋 中序遍历序列（升序）</div>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {visitedPath.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div
                              className={`px-3 py-2 rounded-lg font-mono font-bold ${
                                idx === visitedPath.length - 1
                                  ? 'bg-blue-600 text-white scale-110 shadow-lg'
                                  : idx === k! - 1
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {val}
                            </div>
                            {idx < visitedPath.length - 1 && (
                              <span className="text-gray-400">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 找到结果 */}
                {found && result !== undefined && (
                  <div className="mb-4 bg-green-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="text-center">
                      <div className="font-bold text-green-700 text-lg">
                        🎯 找到第 {k} 小的元素：{result}
                      </div>
                    </div>
                  </div>
                )}

                {/* 最终结果 */}
                {finalResult !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-green-700">
                        结果：{finalResult}
                      </span>
                    </div>
                  </div>
                )}

                {/* 使用 TreeTemplate */}
                <TreeTemplate
                  data={tree}
                  getNodeState={(_index: number, val: number | null) => {
                    if (val === null) return {};
                    const isCurrent = val === currentNode;
                    const isFound = found && val === result;
                    const isVisited = visitedPath?.includes(val) || false;
                    return {
                      isCurrent,
                      isVisited,
                      customState: { 
                        current: isCurrent,
                        found: isFound,
                        visited: isVisited
                      }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;
                    const isFound = state.customState?.found || false;
                    const isVisited = state.customState?.visited || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={
                            isFound 
                              ? "url(#node-gradient-green)" 
                              : isCurrent 
                              ? "url(#node-gradient-blue)" 
                              : isVisited
                              ? "url(#node-gradient-amber)"
                              : "url(#node-gradient-default)"
                          }
                          stroke={
                            isFound ? "#10b981" : isCurrent ? "#3b82f6" : isVisited ? "#f59e0b" : "#cbd5e1"
                          }
                          strokeWidth={isCurrent || isFound ? "3" : "2"}
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
                          <linearGradient id="node-gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                          <linearGradient id="node-gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                          <linearGradient id="node-gradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#94a3b8', label: '未访问' },
                    { color: '#3b82f6', label: '当前访问' },
                    { color: '#f59e0b', label: '已访问' },
                    { color: '#10b981', label: '目标节点（第' + (k || 1) + '小）' },
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

export default KthSmallestBSTVisualizer;
