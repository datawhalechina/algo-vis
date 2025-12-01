import { TrendingUp } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateMaxPathSumSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface MaxPathSumInput extends ProblemInput {
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

interface MaxPathSumData {
  tree?: (number | null)[];
}

function MaxPathSumVisualizer() {
  return (
    <ConfigurableVisualizer<MaxPathSumInput, MaxPathSumData>
      config={{
        defaultInput: { tree: "-10,9,20,null,null,15,7" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          return generateMaxPathSumSteps(arr);
        },

        inputTypes: [
          { type: "string", key: "tree", label: "树（数组格式）" }
        ],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: -10,9,20,null,null,15,7",
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "-10,9,20,null,null,15,7" } },
          { label: "示例 2", value: { tree: "1,2,3" } },
          { label: "负数路径", value: { tree: "-3" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentNode = variables?.currentNode as number | undefined;
          const maxSum = variables?.maxSum as number | undefined;
          const leftGain = variables?.leftGain as number | undefined;
          const rightGain = variables?.rightGain as number | undefined;
          const currentPathSum = variables?.currentPathSum as number | undefined;
          const isNewMax = variables?.isNewMax as boolean | undefined;
          const maxPathNodes = variables?.maxPathNodes as number[] | undefined;
          const completed = variables?.completed as boolean | undefined;
          const coreIdea = getProblemCoreIdea(85);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">二叉树中的最大路径和 - 递归DFS</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-indigo-700">💡 核心思想：</span>
                    对每个节点，计算经过该节点的最大路径和 = 节点值 + max(左子树贡献, 0) + max(右子树贡献, 0)。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">特点：</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">后序遍历</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">动态维护最大值</span>
                  </div>
                </div>

                {/* 当前状态 */}
                {maxSum !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">当前最大路径和</div>
                        <div className={`font-mono font-bold text-lg ${
                          typeof maxSum === 'string' ? 'text-gray-400' : 'text-green-600'
                        }`}>
                          {maxSum}
                        </div>
                      </div>
                      {currentPathSum !== undefined && (
                        <div>
                          <div className="text-gray-500 text-xs mb-1">当前节点路径和</div>
                          <div className={`font-mono font-bold text-lg ${
                            isNewMax ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            {currentPathSum}
                            {isNewMax && <span className="ml-2 text-xs">🆕</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 贡献值显示 */}
                {(leftGain !== undefined || rightGain !== undefined) && (
                  <div className="mb-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-xs text-gray-600 mb-2 text-center">子树贡献值</div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      {leftGain !== undefined && (
                        <div>
                          <div className="text-gray-500 text-xs">左子树</div>
                          <div className={`font-mono font-bold ${
                            leftGain > 0 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {leftGain}
                          </div>
                        </div>
                      )}
                      {rightGain !== undefined && (
                        <div>
                          <div className="text-gray-500 text-xs">右子树</div>
                          <div className={`font-mono font-bold ${
                            rightGain > 0 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {rightGain}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 最终结果 */}
                {completed && maxSum !== undefined && (
                  <div className="mb-4 bg-green-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="text-center">
                      <div className="font-bold text-green-700 text-lg mb-2">
                        ✓ 计算完成！
                      </div>
                      <div className="text-gray-700">
                        最大路径和为 <span className="font-mono font-bold text-green-600 text-2xl">{maxSum}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 树的可视化 */}
                <TreeTemplate
                  data={tree}
                  renderNode={(pos: TreeNodePosition, _state: TreeNodeState) => {
                    const value = pos.node.val;
                    if (value === null) return null;

                    const isCurrent = value === currentNode;
                    const isInMaxPath = maxPathNodes?.includes(value) && completed;

                    return (
                      <>
                        <circle
                          r="20"
                          className={`
                            transition-all duration-300
                            ${isInMaxPath
                              ? 'fill-green-500 stroke-green-700'
                              : isCurrent
                              ? 'fill-purple-500 stroke-purple-700'
                              : value < 0
                              ? 'fill-red-100 stroke-red-400'
                              : 'fill-gray-100 stroke-gray-400'}
                          `}
                          strokeWidth={isInMaxPath || isCurrent ? 3 : 2}
                        />
                        <text
                          textAnchor="middle"
                          dy="0.35em"
                          className={`text-sm font-bold ${
                            isInMaxPath || isCurrent ? 'fill-white' : value < 0 ? 'fill-red-700' : 'fill-gray-700'
                          }`}
                        >
                          {value}
                        </text>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#a855f7', label: '当前访问', shape: 'circle' },
                    { color: '#22c55e', label: '最大路径', shape: 'circle' },
                    { color: '#fecaca', label: '负值节点', shape: 'circle' },
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

export default MaxPathSumVisualizer;
