import { GitBranch } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition } from "@/components/visualizers/templates/TreeTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateLCASteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface LCAInput extends ProblemInput {
  tree: string;
  p: string;
  q: string;
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

interface LCAData {
  tree?: (number | null)[];
}

function LowestCommonAncestorVisualizer() {
  return (
    <ConfigurableVisualizer<LCAInput, LCAData>
      config={{
        defaultInput: { tree: "3,5,1,6,2,0,8,null,null,7,4", p: "5", q: "1" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          const p = parseInt(input.p);
          const q = parseInt(input.q);
          return generateLCASteps(arr, p, q);
        },

        inputTypes: [
          { type: "string", key: "tree", label: "树（数组格式）" },
          { type: "number", key: "p", label: "节点p" },
          { type: "number", key: "q", label: "节点q" }
        ],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 3,5,1,6,2,0,8,null,null,7,4",
          },
          {
            type: "number",
            key: "p",
            label: "节点 p 的值",
            placeholder: "例如: 5",
          },
          {
            type: "number",
            key: "q",
            label: "节点 q 的值",
            placeholder: "例如: 1",
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "3,5,1,6,2,0,8,null,null,7,4", p: "5", q: "1" } },
          { label: "示例 2", value: { tree: "3,5,1,6,2,0,8,null,null,7,4", p: "5", q: "4" } },
          { label: "示例 3", value: { tree: "1,2", p: "1", q: "2" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentNode = variables?.currentNode as number | undefined;
          const targetP = variables?.targetP as number | undefined;
          const targetQ = variables?.targetQ as number | undefined;
          const lcaNode = variables?.lcaNode as number | undefined;
          const completed = variables?.completed as boolean | undefined;
          const coreIdea = getProblemCoreIdea(84);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GitBranch className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">二叉树的最近公共祖先 - 递归DFS</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-indigo-700">💡 核心思想：</span>
                    递归搜索左右子树。如果某节点的左右子树分别包含p和q，则该节点为最近公共祖先。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">自底向上递归</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">单次遍历O(n)</span>
                  </div>
                </div>

                {/* 目标节点显示 */}
                {targetP !== undefined && targetQ !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">目标节点 p</div>
                        <div className="font-mono font-bold text-blue-700 text-lg">{targetP}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">目标节点 q</div>
                        <div className="font-mono font-bold text-blue-700 text-lg">{targetQ}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">最近公共祖先</div>
                        <div className="font-mono font-bold text-green-600 text-lg">
                          {lcaNode !== undefined ? lcaNode : "?"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* LCA 结果 */}
                {completed && lcaNode !== undefined && (
                  <div className="mb-4 bg-green-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="text-center">
                      <div className="font-bold text-green-700 text-lg mb-2">
                        ✓ 找到最近公共祖先！
                      </div>
                      <div className="text-gray-700">
                        节点 <span className="font-mono font-bold text-green-600 text-xl">{lcaNode}</span> 是节点 
                        <span className="font-mono font-bold text-blue-600"> {targetP}</span> 和 
                        <span className="font-mono font-bold text-blue-600"> {targetQ}</span> 的最近公共祖先
                      </div>
                    </div>
                  </div>
                )}

                {/* 树的可视化 */}
                <TreeTemplate
                  data={tree}
                  renderNode={(pos: TreeNodePosition) => {
                    const value = pos.node.val;
                    if (value === null) return null;

                    const isTarget = value === targetP || value === targetQ;
                    const isCurrent = value === currentNode;
                    const isLCA = value === lcaNode && completed;

                    return (
                      <>
                        <circle
                          r="20"
                          className={`
                            transition-all duration-300
                            ${isLCA
                              ? 'fill-green-500 stroke-green-700'
                              : isTarget
                              ? 'fill-blue-500 stroke-blue-700'
                              : isCurrent
                              ? 'fill-purple-500 stroke-purple-700'
                              : 'fill-gray-100 stroke-gray-400'}
                          `}
                          strokeWidth={isLCA || isCurrent ? 3 : 2}
                        />
                        <text
                          textAnchor="middle"
                          dy="0.35em"
                          className={`text-sm font-bold ${
                            isLCA || isTarget || isCurrent ? 'fill-white' : 'fill-gray-700'
                          }`}
                        >
                          {value}
                        </text>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#3b82f6', label: '目标节点 (p/q)', shape: 'circle' },
                    { color: '#a855f7', label: '当前访问', shape: 'circle' },
                    { color: '#22c55e', label: '最近公共祖先', shape: 'circle' },
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

export default LowestCommonAncestorVisualizer;
