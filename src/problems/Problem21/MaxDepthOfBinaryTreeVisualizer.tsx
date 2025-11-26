import { TreePine } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateMaxDepthSteps, buildTreeFromArray, MaxDepthData } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface MaxDepthInput extends ProblemInput {
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

function MaxDepthOfBinaryTreeVisualizer() {
  return (
    <ConfigurableVisualizer<MaxDepthInput, MaxDepthData>
      config={{
        defaultInput: { tree: "3,9,20,null,null,15,7" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          const root = buildTreeFromArray(arr);
          return generateMaxDepthSteps(root, arr);
        },
        
        inputTypes: [{ type: "string", key: "tree", label: "树（数组格式）" }],
        inputFields: [
          { 
            type: "string", 
            key: "tree", 
            label: "二叉树（LeetCode格式）", 
            placeholder: "例如: 3,9,20,null,null,15,7" 
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "3,9,20,null,null,15,7" } },
          { label: "示例 2", value: { tree: "1,null,2" } },
          { label: "示例 3", value: { tree: "1,2,3,4,5" } },
        ],
        
        render: ({ data, getNumberVariable }) => {
          const tree = data.tree || [];
          const currentNodeIndex = data.currentNodeIndex;
          const currentLevel = data.currentLevel || 0;
          const maxDepth = getNumberVariable('maxDepth');
          const phase = data.phase;
          const compareInfo = data.compareInfo;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TreePine className="text-green-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">二叉树的最大深度 - 递归DFS</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-green-700">核心思想：</span>
                    递归计算左右子树深度，当前节点深度 = max(左深度, 右深度) + 1。
                  </p>
                </div>

                {/* 当前状态 */}
                <div className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">当前层级</span>
                        <span className="font-mono text-blue-700 font-bold text-xl">{currentLevel}</span>
                    </div>
                    
                    {phase === 'backtrack' && compareInfo && (
                        <>
                            <div className="h-8 w-px bg-indigo-200"></div>
                            <div className="flex flex-col items-center">
                                <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">计算深度</span>
                                <div className="flex items-center gap-2 font-mono text-sm">
                                    <span className="text-gray-600">max(</span>
                                    <span className="text-orange-600 font-bold">L:{compareInfo.leftDepth}</span>
                                    <span className="text-gray-400">,</span>
                                    <span className="text-emerald-600 font-bold">R:{compareInfo.rightDepth}</span>
                                    <span className="text-gray-600">) + 1 = </span>
                                    <span className="text-blue-700 font-bold text-lg">{compareInfo.max}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {maxDepth !== undefined && (
                      <>
                        <div className="h-8 w-px bg-indigo-200"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">最大深度</span>
                            <span className="font-mono text-green-700 font-bold text-xl">{maxDepth}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 使用 TreeTemplate */}
                <TreeTemplate
                  data={tree}
                  getNodeState={(index: number, val: number | null) => {
                    if (val === null) return {};
                    const isCurrent = currentNodeIndex === index;
                    const depth = data.calculatedDepths ? data.calculatedDepths[index] : undefined;
                    return {
                      isCurrent,
                      customState: { depth, phase: isCurrent ? phase : undefined }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;
                    const depth = state.customState?.depth;
                    const nodePhase = state.customState?.phase;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={
                            isCurrent && nodePhase === 'visit'
                              ? "url(#node-gradient-amber)"
                              : isCurrent && nodePhase === 'backtrack'
                              ? "url(#node-gradient-violet)"
                              : isCurrent && nodePhase === 'leaf'
                              ? "url(#node-gradient-emerald)"
                              : depth !== undefined
                              ? "url(#node-gradient-gray)"
                              : "url(#node-gradient-blue)"
                          }
                          stroke={
                            isCurrent ? "#059669" : "#94a3b8"
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

                        {/* 深度标记 */}
                        {depth !== undefined && (
                          <g transform="translate(22, -22)">
                            <circle r="10" fill="#ec4899" />
                            <text
                              textAnchor="middle"
                              dy="0.35em"
                              className="text-xs font-bold"
                              fill="white"
                            >
                              {depth}
                            </text>
                          </g>
                        )}

                        <defs>
                          <linearGradient id="node-gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                          <linearGradient id="node-gradient-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                          <linearGradient id="node-gradient-violet" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                          <linearGradient id="node-gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                          <linearGradient id="node-gradient-gray" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#cbd5e1" />
                            <stop offset="100%" stopColor="#94a3b8" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#fbbf24', label: '正在探索' },
                    { color: '#10b981', label: '叶子节点' },
                    { color: '#8b5cf6', label: '计算回溯' },
                    { color: '#94a3b8', label: '已完成' },
                    { color: '#ec4899', label: '子树深度', shape: 'badge' },
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

export default MaxDepthOfBinaryTreeVisualizer;

