import { RefreshCw } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateInvertTreeSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface InvertTreeInput extends ProblemInput {
  tree: string; // 输入格式："4,2,7,1,3,6,9"
}

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

interface InvertTreeData {
  tree?: (number | null)[];
}

function InvertTreeVisualizer() {
  return (
    <ConfigurableVisualizer<InvertTreeInput, InvertTreeData>
      config={{
        defaultInput: { tree: "4,2,7,1,3,6,9" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          return generateInvertTreeSteps(arr);
        },

        inputTypes: [{ type: "string", key: "tree", label: "树（数组格式）" }],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 4,2,7,1,3,6,9",
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "4,2,7,1,3,6,9" } },
          { label: "示例 2", value: { tree: "2,1,3" } },
          { label: "示例 3", value: { tree: "1,2" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentValue = variables?.currentValue as number | undefined;
          const swapped = variables?.swapped as boolean | undefined;

          return (
            <>
              {/* 树可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">翻转二叉树 - 递归法</h3>
                </div>

                {getProblemCoreIdea(72) && <CoreIdeaBox {...getProblemCoreIdea(72)!} />}

                {/* 当前状态 */}
                {currentValue !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="font-semibold text-gray-700">当前节点值：</span>
                      <span className="font-mono text-blue-700 font-bold text-xl">{currentValue}</span>
                      {swapped && (
                        <span className="ml-3 text-green-600 font-semibold flex items-center gap-1">
                          <RefreshCw size={16} />
                          已翻转左右子树
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 使用 TreeTemplate */}
                <TreeTemplate
                  data={tree}
                  getNodeState={(_index: number, val: number | null) => {
                    if (val === null) return {};
                    const isCurrent = val === currentValue;
                    return {
                      isCurrent,
                      isVisited: swapped && isCurrent,
                      customState: { swapped: swapped && isCurrent }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;
                    const isSwapped = state.customState?.swapped || false;

                    return (
                      <>
                        {/* 节点圆圈 */}
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={isSwapped ? "url(#node-gradient-green)" : isCurrent ? "url(#node-gradient-blue)" : "url(#node-gradient-default)"}
                          stroke={isSwapped ? "#10b981" : isCurrent ? "#3b82f6" : "#cbd5e1"}
                          strokeWidth={isCurrent || isSwapped ? "3" : "2"}
                        />
                        
                        {/* 节点值 */}
                        <text
                          textAnchor="middle"
                          dy="0.35em"
                          className="text-base font-bold select-none"
                          fill="white"
                        >
                          {pos.node.val}
                        </text>

                        {/* 翻转图标 */}
                        {isSwapped && (
                          <g transform="translate(20, -20)">
                            <circle r="10" fill="#10b981" />
                            <text
                              textAnchor="middle"
                              dy="0.35em"
                              className="text-xs font-bold"
                              fill="white"
                            >
                              ✓
                            </text>
                          </g>
                        )}

                        {/* SVG 渐变定义 */}
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
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#94a3b8', label: '默认' },
                    { color: '#3b82f6', label: '当前节点' },
                    { color: '#10b981', label: '已翻转' },
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

export default InvertTreeVisualizer;
