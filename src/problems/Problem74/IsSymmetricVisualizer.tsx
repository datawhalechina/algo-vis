import { GitCompare } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateIsSymmetricSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface IsSymmetricInput extends ProblemInput {
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

interface IsSymmetricData {
  tree?: (number | null)[];
}

function IsSymmetricVisualizer() {
  return (
    <ConfigurableVisualizer<IsSymmetricInput, IsSymmetricData>
      config={{
        defaultInput: { tree: "1,2,2,3,4,4,3" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          return generateIsSymmetricSteps(arr);
        },

        inputTypes: [{ type: "string", key: "tree", label: "树（数组格式）" }],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 1,2,2,3,4,4,3",
          },
        ],
        testCases: [
          { label: "示例 1 - 对称", value: { tree: "1,2,2,3,4,4,3" } },
          { label: "示例 2 - 不对称", value: { tree: "1,2,2,null,3,null,3" } },
          { label: "示例 3 - 简单对称", value: { tree: "1,2,2" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const leftVal = variables?.leftVal as number | null | undefined;
          const rightVal = variables?.rightVal as number | null | undefined;
          const comparing = variables?.comparing as string | undefined;
          const finalResult = variables?.finalResult as boolean | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GitCompare className="text-purple-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">对称二叉树 - 递归法</h3>
                </div>

                {getProblemCoreIdea(74) && <CoreIdeaBox {...getProblemCoreIdea(74)!} />}

                {/* 比较状态 */}
                {comparing && (
                  <div className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="font-semibold text-gray-700">正在比较：</span>
                      <span className="font-mono text-indigo-700">{comparing}</span>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-mono font-bold">
                          {leftVal ?? 'null'}
                        </span>
                        <span className="text-gray-400">vs</span>
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded font-mono font-bold">
                          {rightVal ?? 'null'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 最终结果 */}
                {finalResult !== undefined && (
                  <div className={`mb-4 p-4 rounded-lg border-2 ${
                    finalResult 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-lg font-bold ${
                        finalResult ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {finalResult ? '✓ 树是对称的' : '✗ 树不对称'}
                      </span>
                    </div>
                  </div>
                )}

                {/* 使用 TreeTemplate */}
                <TreeTemplate
                  data={tree}
                  getNodeState={(_index: number, val: number | null) => {
                    if (val === null) return {};
                    const isCurrent = val === leftVal || val === rightVal;
                    return {
                      isCurrent,
                      customState: { comparing: isCurrent }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={isCurrent ? "url(#node-gradient-purple)" : "url(#node-gradient-default)"}
                          stroke={isCurrent ? "#9333ea" : "#cbd5e1"}
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
                          <linearGradient id="node-gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#9333ea" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#94a3b8', label: '默认' },
                    { color: '#9333ea', label: '正在比较' },
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

export default IsSymmetricVisualizer;
