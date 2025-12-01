import { Eye } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateRightSideViewSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface RightSideViewInput extends ProblemInput {
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

interface RightSideViewData {
  tree?: (number | null)[];
}

function RightSideViewVisualizer() {
  return (
    <ConfigurableVisualizer<RightSideViewInput, RightSideViewData>
      config={{
        defaultInput: { tree: "1,2,3,null,5,null,4" },
        algorithm: (input) => {
          const arr = parseTreeInput(input.tree);
          return generateRightSideViewSteps(arr);
        },

        inputTypes: [{ type: "string", key: "tree", label: "树（数组格式）" }],
        inputFields: [
          {
            type: "string",
            key: "tree",
            label: "二叉树（LeetCode格式）",
            placeholder: "例如: 1,2,3,null,5,null,4",
          },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "1,2,3,null,5,null,4" } },
          { label: "示例 2", value: { tree: "1,null,3" } },
          { label: "示例 3", value: { tree: "1,2,3,4" } },
        ],

        render: ({ data, variables }) => {
          const coreIdea = getProblemCoreIdea(80);
          const tree = data.tree || [];
          const currentNode = variables?.currentNode as number | undefined;
          const isRightmost = variables?.isRightmost as boolean | undefined;
          const finalResult = variables?.finalResult as number[] | undefined;
          const level = variables?.level as number | undefined;
          const currentLevel = variables?.currentLevel as number[] | undefined;
          const rightView = variables?.rightView as number[] | undefined;

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="text-purple-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">二叉树的右视图 - 层序遍历</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-purple-700">💡 核心思想：</span>
                    使用层序遍历（BFS），每层只保留最右侧的节点。
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold">视角模拟：</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">站在树的右侧</span>
                    <span>→</span>
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded">每层只看到最右边的节点</span>
                  </div>
                </div>

                {/* 当前层信息 */}
                {level !== undefined && currentLevel && currentLevel.length > 0 && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-2">🎯 第 {level} 层节点</div>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {currentLevel.map((val, idx) => (
                          <div
                            key={idx}
                            className={`px-3 py-2 rounded-lg font-mono font-bold ${
                              idx === currentLevel.length - 1
                                ? 'bg-purple-600 text-white scale-110 shadow-lg ring-2 ring-purple-300'
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {val}
                            {idx === currentLevel.length - 1 && <span className="ml-1">👁️</span>}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {currentLevel.length > 1 && '← 右侧视角只能看到最右边的节点'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 右视图结果 */}
                {rightView && rightView.length > 0 && !finalResult && (
                  <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs mb-2">📋 右视图（构建中...）</div>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {rightView.map((val, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="px-3 py-2 bg-green-600 text-white rounded-lg font-mono font-bold shadow">
                              {val}
                            </div>
                            {idx < rightView.length - 1 && (
                              <span className="text-green-400">↓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 最终结果 */}
                {finalResult && (
                  <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-green-700">
                        右视图: [{finalResult.join(', ')}]
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
                    const isInResult = rightView?.includes(val) || false;
                    const isInCurrentLevel = currentLevel?.includes(val) || false;
                    return {
                      isCurrent,
                      customState: { 
                        current: isCurrent,
                        rightmost: isCurrent && isRightmost,
                        inResult: isInResult,
                        inCurrentLevel: isInCurrentLevel
                      }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;
                    const isRightmost = state.customState?.rightmost || false;
                    const inResult = state.customState?.inResult || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={
                            isRightmost 
                              ? "url(#node-gradient-purple)" 
                              : inResult
                              ? "url(#node-gradient-green)"
                              : isCurrent 
                              ? "url(#node-gradient-blue)" 
                              : "url(#node-gradient-default)"
                          }
                          stroke={
                            isRightmost ? "#a855f7" : inResult ? "#10b981" : isCurrent ? "#3b82f6" : "#cbd5e1"
                          }
                          strokeWidth={isCurrent || isRightmost || inResult ? "3" : "2"}
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
                          <linearGradient id="node-gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                          <linearGradient id="node-gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#a855f7" />
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
                    { color: '#94a3b8', label: '未访问' },
                    { color: '#3b82f6', label: '当前节点' },
                    { color: '#a855f7', label: '最右侧' },
                    { color: '#10b981', label: '已加入右视图' },
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

export default RightSideViewVisualizer;
