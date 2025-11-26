import { CheckCircle2 } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateIsValidBSTSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface IsValidBSTInput extends ProblemInput {
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

interface IsValidBSTData {
  tree?: (number | null)[];
}

function IsValidBSTVisualizer() {
  return (
    <ConfigurableVisualizer<IsValidBSTInput, IsValidBSTData>
      config={{
        defaultInput: { tree: "2,1,3" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          return generateIsValidBSTSteps(arr);
        },

        inputTypes: [{ type: "string", key: "tree", label: "树（数组格式）" }],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 2,1,3",
          },
        ],
        testCases: [
          { label: "示例 1 - 有效", value: { tree: "2,1,3" } },
          { label: "示例 2 - 无效", value: { tree: "5,1,4,null,null,3,6" } },
          { label: "示例 3 - 边界", value: { tree: "5,4,6,null,null,3,7" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentNode = variables?.currentNode as number | undefined;
          const min = variables?.min as string | number | undefined;
          const max = variables?.max as string | number | undefined;
          const violation = variables?.violation as boolean | undefined;
          const reason = variables?.reason as string | undefined;
          const valid = variables?.valid as boolean | undefined;
          const finalResult = variables?.finalResult as boolean | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">验证二叉搜索树 - 范围限制法</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-emerald-700">核心思想：</span>
                    递归验证每个节点是否在合法范围 (min, max) 内。左子树更新上界，右子树更新下界。
                  </p>
                </div>

                {/* 当前验证节点 */}
                {currentNode !== undefined && min !== undefined && max !== undefined && !violation && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">下界 (min)</div>
                        <div className="font-mono font-bold text-orange-600 text-lg">{min}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">当前节点</div>
                        <div className="font-mono font-bold text-blue-700 text-2xl">{currentNode}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">上界 (max)</div>
                        <div className="font-mono font-bold text-purple-600 text-lg">{max}</div>
                      </div>
                    </div>
                    {valid && (
                      <div className="mt-3 text-center text-green-600 font-semibold">
                        ✓ 在合法范围内
                      </div>
                    )}
                  </div>
                )}

                {/* 违反条件 */}
                {violation && reason && (
                  <div className="mb-4 bg-red-50 p-4 rounded-lg border-2 border-red-300">
                    <div className="text-center">
                      <div className="font-bold text-red-700 text-lg mb-2">✗ 违反BST性质</div>
                      <div className="text-sm text-red-600">{reason}</div>
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
                        {finalResult ? '✓ 是有效的二叉搜索树' : '✗ 不是有效的二叉搜索树'}
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
                    const isViolation = isCurrent && violation;
                    return {
                      isCurrent,
                      customState: { 
                        current: isCurrent,
                        violation: isViolation 
                      }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;
                    const isViolation = state.customState?.violation || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={
                            isViolation 
                              ? "url(#node-gradient-red)" 
                              : isCurrent 
                              ? "url(#node-gradient-emerald)" 
                              : "url(#node-gradient-default)"
                          }
                          stroke={
                            isViolation ? "#ef4444" : isCurrent ? "#10b981" : "#cbd5e1"
                          }
                          strokeWidth={isCurrent || isViolation ? "3" : "2"}
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
                          <linearGradient id="node-gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                          <linearGradient id="node-gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#94a3b8', label: '默认' },
                    { color: '#10b981', label: '合法节点' },
                    { color: '#ef4444', label: '违反节点' },
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

export default IsValidBSTVisualizer;
