import { List } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateInorderTraversalSteps } from "./algorithm";
import type { ProblemInput } from "@/types/visualization";

interface InorderTraversalInput extends ProblemInput {
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

interface InorderTraversalData {
  tree?: (number | null)[];
  result?: number[];
  currentNode?: number;
  depth?: number;
  completed?: boolean;
}

function InorderTraversalVisualizer() {
  return (
    <ConfigurableVisualizer<InorderTraversalInput, InorderTraversalData>
      config={{
        defaultInput: { tree: "1,null,2,3" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          return generateInorderTraversalSteps(arr);
        },
        
        inputTypes: [{ type: "string", key: "tree", label: "树（数组格式）" }],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 1,null,2,3"
          }
        ],
        testCases: [
          { label: "示例1", value: { tree: "1,null,2,3" } },
          { label: "完全二叉树", value: { tree: "1,2,3,4,5,6,7" } },
          { label: "左斜树", value: { tree: "1,2,null,3" } },
        ],
        
        render: ({ data }) => {
          const state = data as InorderTraversalData;
          
          if (!state || !state.tree) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { tree, result = [], currentNode, completed } = state;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <List className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">二叉树的中序遍历 - 递归法</h3>
                </div>

                {getProblemCoreIdea(68) && <CoreIdeaBox {...getProblemCoreIdea(68)!} />}

                {/* 遍历结果 */}
                <div className="mb-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-600 mb-2 text-center">中序遍历结果</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {result.length === 0 ? (
                      <span className="text-gray-400">空</span>
                    ) : (
                      result.map((val, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded font-mono font-semibold ${
                            val === currentNode && !completed
                              ? 'bg-green-500 text-white border-2 border-green-600'
                              : 'bg-white border-2 border-purple-300 text-purple-700'
                          }`}
                        >
                          {val}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* 完成提示 */}
                {completed && (
                  <div className="mb-4 bg-green-50 p-4 rounded-lg border-2 border-green-300 text-center">
                    <div className="text-lg font-bold text-green-700">
                      ✓ 中序遍历完成！
                    </div>
                  </div>
                )}

                {/* 使用 TreeTemplate */}
                <TreeTemplate
                  data={tree}
                  getNodeState={(_index: number, val: number | null) => {
                    if (val === null) return {};
                    const isCurrent = val === currentNode && !completed;
                    const isVisited = result.includes(val);
                    return {
                      isCurrent,
                      isVisited,
                      customState: { current: isCurrent, visited: isVisited }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;
                    const isVisited = state.isVisited || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={
                            isCurrent
                              ? "url(#node-gradient-green)"
                              : isVisited
                              ? "url(#node-gradient-indigo)"
                              : "url(#node-gradient-gray)"
                          }
                          stroke={
                            isCurrent ? "#10b981" : isVisited ? "#6366f1" : "#9ca3af"
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

                        {/* 访问顺序标记 */}
                        {isVisited && (
                          <g transform="translate(22, -22)">
                            <circle r="10" fill="#8b5cf6" />
                            <text
                              textAnchor="middle"
                              dy="0.35em"
                              className="text-xs font-bold"
                              fill="white"
                            >
                              {result.indexOf(pos.node.val!) + 1}
                            </text>
                          </g>
                        )}

                        <defs>
                          <linearGradient id="node-gradient-gray" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#d1d5db" />
                            <stop offset="100%" stopColor="#9ca3af" />
                          </linearGradient>
                          <linearGradient id="node-gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#6366f1" />
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
                    { color: '#9ca3af', label: '未访问' },
                    { color: '#10b981', label: '当前节点' },
                    { color: '#6366f1', label: '已访问' },
                    { color: '#8b5cf6', label: '访问顺序', shape: 'badge' },
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

export default InorderTraversalVisualizer;
