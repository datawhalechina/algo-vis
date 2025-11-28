import { Layers } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { generateLevelOrderSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface LevelOrderInput extends ProblemInput {
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

interface LevelOrderData {
  tree?: (number | null)[];
}

function LevelOrderVisualizer() {
  return (
    <ConfigurableVisualizer<LevelOrderInput, LevelOrderData>
      config={{
        defaultInput: { tree: "3,9,20,null,null,15,7" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          return generateLevelOrderSteps(arr);
        },

        inputTypes: [{ type: "string", key: "tree", label: "树（数组格式）" }],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 3,9,20,null,null,15,7",
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "3,9,20,null,null,15,7" } },
          { label: "示例 2", value: { tree: "1" } },
          { label: "示例 3", value: { tree: "1,2,3,4,5,6,7" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentNode = variables?.currentNode as number | undefined;
          const currentLevel = variables?.currentLevel as number | undefined;
          const queue = variables?.queue as number[] | undefined;
          const currentLevelNodes = variables?.currentLevelNodes as number[] | undefined;
          const result = variables?.result as number[][] | undefined;
          const finalResult = variables?.finalResult as number[][] | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="text-teal-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">二叉树的层序遍历 - BFS</h3>
                </div>

                {getProblemCoreIdea(76) && <CoreIdeaBox {...getProblemCoreIdea(76)!} />}

                {/* 当前层信息 */}
                {currentLevel !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-gray-500 text-xs mb-1">当前层级</div>
                        <div className="font-mono font-bold text-blue-700 text-xl">{currentLevel}</div>
                      </div>
                      {currentNode !== undefined && (
                        <>
                          <div className="h-8 w-px bg-blue-200"></div>
                          <div className="text-center">
                            <div className="text-gray-500 text-xs mb-1">当前节点</div>
                            <div className="font-mono font-bold text-indigo-700 text-xl">{currentNode}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 队列状态 */}
                {queue && queue.length > 0 && (
                  <div className="mb-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="text-sm text-gray-600 mb-2 text-center">队列</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {queue.map((val, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white border-2 border-purple-300 text-purple-700 rounded font-mono font-semibold"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 当前层结果 */}
                {currentLevelNodes && currentLevelNodes.length > 0 && (
                  <div className="mb-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="text-sm text-gray-600 mb-2 text-center">当前层节点</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentLevelNodes.map((val, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white border-2 border-amber-400 text-amber-700 rounded font-mono font-bold"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 累积结果 */}
                {(result || finalResult) && (
                  <div className="mb-4 bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600 mb-2 text-center">
                      {finalResult ? '最终结果' : '已完成的层'}
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {(finalResult || result)!.map((level, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="text-green-600 font-semibold text-xs">L{idx + 1}:</span>
                          <span className="px-3 py-1 bg-white border-2 border-green-400 text-green-700 rounded font-mono font-bold">
                            [{level.join(', ')}]
                          </span>
                        </div>
                      ))}
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
                          fill={isCurrent ? "url(#node-gradient-teal)" : "url(#node-gradient-default)"}
                          stroke={isCurrent ? "#14b8a6" : "#cbd5e1"}
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
                          <linearGradient id="node-gradient-teal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#5eead4" />
                            <stop offset="100%" stopColor="#14b8a6" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#94a3b8', label: '默认' },
                    { color: '#14b8a6', label: '当前节点' },
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

export default LevelOrderVisualizer;
