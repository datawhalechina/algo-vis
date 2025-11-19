import { useState } from "react";
import { TreePine } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateMaxDepthSteps, buildTreeFromArray, MaxDepthData } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface MaxDepthInput extends ProblemInput {
  tree: string; // 输入格式："3,9,20,null,null,15,7"
}

const code = `function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  
  return Math.max(leftDepth, rightDepth) + 1;
}`;

// 解析输入字符串为数组
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
  const [showCode, setShowCode] = useState<boolean>(false);

  return (
    <ConfigurableVisualizer<MaxDepthInput, MaxDepthData>
      config={{
        defaultInput: { tree: "3,9,20,null,null,15,7" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          const root = buildTreeFromArray(arr);
          return generateMaxDepthSteps(root, arr);
        },
        
        inputTypes: [
          { type: "string", key: "tree", label: "树（数组格式）" },
        ],
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
          { label: "示例 3", value: { tree: "" } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .map(([key, value]) => (
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
        
        render: ({ data, getNumberVariable }) => {
          const tree = data.tree || [];
          const currentNodeIndex = data.currentNodeIndex;
          const currentLevel = data.currentLevel || 0;
          const maxDepth = getNumberVariable('maxDepth');
          // const highlightedNodes = variables?.path as string | undefined;
          
          const phase = data.phase;
          const compareInfo = data.compareInfo;

          return (
            <>
              {/* 树可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TreePine className="text-primary-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-800">二叉树可视化</h3>
                  </div>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    {showCode ? "隐藏代码" : "查看代码"}
                  </button>
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
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">最终结果</span>
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
                      isVisited: true,
                      customState: {
                        depth,
                        phase: isCurrent ? phase : undefined,
                        compareInfo: isCurrent ? compareInfo : undefined
                      }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;
                    const depth = state.customState?.depth;
                    const nodePhase = state.customState?.phase;
                    const info = state.customState?.compareInfo;

                    // 节点颜色逻辑
                    let circleFill = "#3b82f6"; // blue-500
                    let circleStroke = "#2563eb"; // blue-600
                    
                    if (isCurrent) {
                        if (nodePhase === 'visit') {
                            circleFill = "#fbbf24"; // amber-400 (exploring)
                            circleStroke = "#d97706";
                        } else if (nodePhase === 'backtrack') {
                            circleFill = "#8b5cf6"; // violet-500 (calculating)
                            circleStroke = "#7c3aed";
                        } else if (nodePhase === 'leaf') {
                            circleFill = "#10b981"; // emerald-500 (leaf)
                            circleStroke = "#059669";
                        }
                    } else if (depth !== undefined) {
                        circleFill = "#94a3b8"; // slate-400 (completed)
                        circleStroke = "#64748b";
                    }

                    return (
                      <g>
                        {/* 比较信息气泡（仅在回溯时显示） */}
                        {isCurrent && nodePhase === 'backtrack' && info && (
                             <g transform="translate(0, -45)">
                                <rect x="-60" y="-24" width="120" height="24" rx="12" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2" className="drop-shadow-md" />
                                <text x="0" y="-7" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#8b5cf6">
                                    max({info.leftDepth}, {info.rightDepth}) + 1
                                </text>
                             </g>
                        )}

                        <circle
                          cx={0}
                          cy={0}
                          r={28}
                          fill={circleFill}
                          stroke={circleStroke}
                          strokeWidth={isCurrent ? 3 : 2.5}
                          className="drop-shadow-md transition-colors duration-300"
                        />
                        <text
                          x={0}
                          y={6}
                          textAnchor="middle"
                          fill="white"
                          fontSize="16"
                          fontWeight="bold"
                          className="select-none"
                        >
                          {pos.node.val}
                        </text>
                        
                        {/* 深度 Badge */}
                        {depth !== undefined && (
                            <g transform="translate(20, -20)">
                                <circle r="12" fill="#ec4899" stroke="#fff" strokeWidth="2" className="drop-shadow-sm" />
                                <text y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{depth}</text>
                            </g>
                        )}
                        
                        {/* 当前探索标记 */}
                        {isCurrent && nodePhase === 'visit' && (
                             <g transform="translate(0, 40)">
                                <text textAnchor="middle" fill="#d97706" fontSize="12" fontWeight="bold">探索中...</text>
                             </g>
                        )}
                      </g>
                    );
                  }}
                  renderEdge={(from: TreeNodePosition, to: TreeNodePosition, isLeft?: boolean) => {
                    let stroke = "#94a3b8";
                    let strokeWidth = "2.5";
                    
                    // 在回溯阶段高亮深度来源的边
                    if (data.currentNodeIndex === from.node.index && 
                        data.phase === 'backtrack' && 
                        data.compareInfo) {
                        const { leftDepth, rightDepth } = data.compareInfo;
                        const isWinner = isLeft 
                            ? leftDepth >= rightDepth 
                            : rightDepth > leftDepth;
                        
                        if (isWinner) {
                            stroke = "#8b5cf6"; // violet-500
                            strokeWidth = "4";
                        }
                    }

                    return (
                      <line
                        x1={from.x}
                        y1={from.y + 28}
                        x2={to.x}
                        y2={to.y - 28}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        className="drop-shadow-sm transition-all duration-300"
                      />
                    );
                  }}
                  layout={{
                    horizontalSpacing: 120,
                    verticalSpacing: 100,
                    nodeRadius: 30,
                  }}
                  // ... animation ...
                  emptyMessage="树为空"
                />

                {/* 图例 */}
                <div className="flex items-center justify-center gap-6 mt-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span>正在探索</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span>叶子节点 (Depth=1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                    <span>计算回溯</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <span>已完成</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center font-bold">N</div>
                    <span>子树深度</span>
                  </div>
                </div>
              </div>

              {/* 代码显示 */}
              {showCode && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">递归解法代码</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800">{code}</code>
                  </pre>
                </div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default MaxDepthOfBinaryTreeVisualizer;

