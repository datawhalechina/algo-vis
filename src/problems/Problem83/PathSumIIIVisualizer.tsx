import { Route } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generatePathSumSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface PathSumIIIInput extends ProblemInput {
  tree: string;
  targetSum: string;
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

interface PathSumIIIData {
  tree?: (number | null)[];
}

function PathSumIIIVisualizer() {
  return (
    <ConfigurableVisualizer<PathSumIIIInput, PathSumIIIData>
      config={{
        defaultInput: { tree: "10,5,-3,3,2,null,11,3,-2,null,1", targetSum: "8" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          const target = parseInt(input.targetSum);
          return generatePathSumSteps(arr, target);
        },

        inputTypes: [
          { type: "string", key: "tree", label: "树（数组格式）" },
          { type: "number", key: "targetSum", label: "目标和" }
        ],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 10,5,-3,3,2,null,11",
          },
          {
            type: "number",
            key: "targetSum",
            label: "目标和",
            placeholder: "例如: 8",
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "10,5,-3,3,2,null,11,3,-2,null,1", targetSum: "8" } },
          { label: "示例 2", value: { tree: "5,4,8,11,null,13,4,7,2,null,null,5,1", targetSum: "22" } },
          { label: "示例 3", value: { tree: "1,2,3", targetSum: "3" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentNode = variables?.currentNode as number | undefined;
          const currentPath = variables?.currentPath as number[] | undefined;
          const currentSum = variables?.currentSum as number | undefined;
          const targetSum = variables?.targetSum as number | undefined;
          const foundPath = variables?.foundPath as number[] | undefined;
          const totalPaths = variables?.totalPaths as number | undefined;
          const finalResult = variables?.finalResult as number | undefined;
          const coreIdea = getProblemCoreIdea(83);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Route className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">路径总和 III - DFS</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-indigo-700">💡 核心思想：</span>
                    对每个节点作为起点，向下DFS搜索所有可能的路径，统计路径和等于目标值的数量。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">路径可从任意节点开始</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">必须向下（父→子）</span>
                  </div>
                </div>

                {/* 当前状态 */}
                {targetSum !== undefined && totalPaths !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">目标和</div>
                        <div className="font-mono font-bold text-blue-700 text-lg">{targetSum}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">已找到路径数</div>
                        <div className="font-mono font-bold text-green-600 text-lg">{totalPaths}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 当前路径 */}
                {currentPath && currentPath.length > 0 && (
                  <div className={`mb-4 p-4 rounded-lg border-2 ${
                    currentSum === targetSum 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                  }`}>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-2">
                        📋 当前路径 (和: {currentSum}) 
                        {currentSum === targetSum && <span className="ml-2 text-green-600 font-bold">✅ 找到！</span>}
                      </div>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {currentPath.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className={`px-3 py-2 rounded-lg font-mono font-bold ${
                              idx === currentPath.length - 1
                                ? currentSum === targetSum
                                  ? 'bg-green-600 text-white scale-110 shadow-lg'
                                  : 'bg-purple-600 text-white scale-110 shadow-lg'
                                : currentSum === targetSum
                                ? 'bg-green-500 text-white'
                                : 'bg-purple-500 text-white'
                            }`}>
                              {val}
                            </div>
                            {idx < currentPath.length - 1 && (
                              <span className={currentSum === targetSum ? 'text-green-400' : 'text-purple-400'}>→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 找到路径 */}
                {foundPath && (
                  <div className="mb-4 bg-green-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="text-center">
                      <div className="font-bold text-green-700 text-lg mb-2">
                        ✓ 找到一条路径！
                      </div>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {foundPath.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="px-3 py-2 bg-green-600 text-white rounded-lg font-mono font-bold">
                              {val}
                            </div>
                            {idx < foundPath.length - 1 && (
                              <span className="text-green-400">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 最终结果 */}
                {finalResult !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-green-700">
                        找到 {finalResult} 条满足条件的路径
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
                    const isInPath = currentPath?.includes(val) || false;
                    return {
                      isCurrent,
                      customState: { 
                        current: isCurrent,
                        inPath: isInPath
                      }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;
                    const isInPath = state.customState?.inPath || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={
                            isCurrent 
                              ? "url(#node-gradient-indigo)" 
                              : isInPath
                              ? "url(#node-gradient-purple)"
                              : "url(#node-gradient-default)"
                          }
                          stroke={
                            isCurrent ? "#6366f1" : isInPath ? "#a855f7" : "#cbd5e1"
                          }
                          strokeWidth={isCurrent || isInPath ? "3" : "2"}
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
                          <linearGradient id="node-gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                          <linearGradient id="node-gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#94a3b8', label: '未访问' },
                    { color: '#a855f7', label: '路径中' },
                    { color: '#6366f1', label: '当前节点' },
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

export default PathSumIIIVisualizer;
