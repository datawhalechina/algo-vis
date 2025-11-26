import { Diameter } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateDiameterSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface DiameterInput extends ProblemInput {
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

interface DiameterData {
  tree?: (number | null)[];
}

function DiameterOfBinaryTreeVisualizer() {
  return (
    <ConfigurableVisualizer<DiameterInput, DiameterData>
      config={{
        defaultInput: { tree: "1,2,3,4,5" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          return generateDiameterSteps(arr);
        },

        inputTypes: [{ type: "string", key: "tree", label: "树（数组格式）" }],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 1,2,3,4,5",
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "1,2,3,4,5" } },
          { label: "示例 2", value: { tree: "1,2" } },
          { label: "示例 3", value: { tree: "1,2,3,4,5,null,null,6,7" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentNode = variables?.currentNode as number | undefined;
          const leftDepth = variables?.leftDepth as number | undefined;
          const rightDepth = variables?.rightDepth as number | undefined;
          const currentDiameter = variables?.currentDiameter as number | undefined;
          const maxDiameter = variables?.maxDiameter as number | undefined;
          const result = variables?.result as number | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Diameter className="text-orange-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">二叉树的直径 - 递归DFS</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-orange-700">核心思想：</span>
                    在计算深度的同时维护最大直径。每个节点的直径 = 左子树深度 + 右子树深度。
                  </p>
                </div>

                {/* 当前节点信息 */}
                {currentNode !== undefined && leftDepth !== undefined && rightDepth !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">当前节点</div>
                        <div className="font-mono font-bold text-blue-700 text-lg">{currentNode}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">左深度</div>
                        <div className="font-mono font-bold text-green-700 text-lg">{leftDepth}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">右深度</div>
                        <div className="font-mono font-bold text-purple-700 text-lg">{rightDepth}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">节点直径</div>
                        <div className="font-mono font-bold text-orange-700 text-lg">{currentDiameter}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 最大直径 */}
                {maxDiameter !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200 text-center">
                    <span className="text-sm text-gray-600">当前最大直径：</span>
                    <span className="ml-2 font-mono font-bold text-emerald-700 text-xl">{maxDiameter}</span>
                  </div>
                )}

                {/* 最终结果 */}
                {result !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-green-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-green-800">
                        ✓ 二叉树的直径为 {result}
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
                    return {
                      isCurrent,
                      customState: { current: isCurrent }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={isCurrent ? "url(#node-gradient-orange)" : "url(#node-gradient-default)"}
                          stroke={isCurrent ? "#f97316" : "#cbd5e1"}
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
                    { color: '#94a3b8', label: '默认' },
                    { color: '#f97316', label: '当前节点' },
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

export default DiameterOfBinaryTreeVisualizer;
