import { TreePine } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate, TreeNodePosition, TreeNodeState } from "@/components/visualizers/templates/TreeTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateBuildTreeSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface BuildTreeInput extends ProblemInput {
  preorder: string;
  inorder: string;
}

function parseArray(input: string): number[] {
  if (!input.trim()) return [];
  return input.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
}

interface BuildTreeData {
  tree?: (number | null)[];
}

function BuildTreeVisualizer() {
  return (
    <ConfigurableVisualizer<BuildTreeInput, BuildTreeData>
      config={{
        defaultInput: { preorder: "3,9,20,15,7", inorder: "9,3,15,20,7" },
        algorithm: (input) => {
          const pre = parseArray(input.preorder);
          const ino = parseArray(input.inorder);
          return generateBuildTreeSteps(pre, ino);
        },

        inputTypes: [
          { type: "string", key: "preorder", label: "前序遍历" },
          { type: "string", key: "inorder", label: "中序遍历" }
        ],
        inputFields: [
          {
            type: "string",
            key: "preorder",
            label: "前序遍历",
            placeholder: "例如: 3,9,20,15,7",
          },
          {
            type: "string",
            key: "inorder",
            label: "中序遍历",
            placeholder: "例如: 9,3,15,20,7",
          },
        ],
        testCases: [
          { label: "示例 1", value: { preorder: "3,9,20,15,7", inorder: "9,3,15,20,7" } },
          { label: "示例 2", value: { preorder: "1,2", inorder: "2,1" } },
          { label: "示例 3", value: { preorder: "1,2,3", inorder: "1,2,3" } },
        ],

        render: ({ data, variables }) => {
          const tree = data.tree || [];
          const currentRoot = variables?.currentRoot as number | undefined;
          const preorder = variables?.preorder as number[] | undefined;
          const inorder = variables?.inorder as number[] | undefined;
          const finalResult = variables?.finalResult as (number | null)[] | undefined;
          const coreIdea = getProblemCoreIdea(82);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TreePine className="text-teal-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">从前序与中序遍历构造二叉树</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-bold text-teal-700">💡 核心思想：</span>
                    前序遍历的第一个元素是根节点，在中序遍历中找到根节点，左边是左子树，右边是右子树。
                  </p>
                  <div className="flex flex-col gap-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">步骤1:</span>
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded">前序首元素 = 根节点</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">步骤2:</span>
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded">中序中找根 → 划分左右</span>
                    </div>
                  </div>
                </div>

                {/* 遍历序列 */}
                {preorder && inorder && (
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <div className="text-gray-500 text-xs mb-2">📍 前序遍历（根-左-右）</div>
                        <div className="flex gap-2 justify-center flex-wrap">
                          {preorder.map((val, idx) => (
                            <div
                              key={idx}
                              className={`px-3 py-2 rounded-lg font-mono font-bold ${
                                idx === 0 
                                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {val}
                              {idx === 0 && <span className="ml-1">🎯</span>}
                            </div>
                          ))}
                        </div>
                        {preorder.length > 0 && (
                          <div className="text-xs text-gray-500 mt-2">
                            首元素 {preorder[0]} 是根节点
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-center">
                        <div className="text-gray-500 text-xs mb-2">📍 中序遍历（左-根-右）</div>
                        <div className="flex gap-2 justify-center flex-wrap">
                          {inorder.map((val, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg font-mono font-bold"
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          用于划分左右子树
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 最终结果 */}
                {finalResult && (
                  <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-green-700">
                        ✓ 构建完成！
                      </span>
                    </div>
                  </div>
                )}

                {/* 使用 TreeTemplate */}
                <TreeTemplate
                  data={tree}
                  getNodeState={(_index: number, val: number | null) => {
                    if (val === null) return {};
                    const isCurrent = val === currentRoot;
                    return {
                      isCurrent,
                      customState: { 
                        current: isCurrent
                      }
                    };
                  }}
                  renderNode={(pos: TreeNodePosition, state: TreeNodeState) => {
                    const isCurrent = state.isCurrent || false;

                    return (
                      <>
                        <circle
                          r="30"
                          className="transition-all duration-300"
                          fill={
                            isCurrent 
                              ? "url(#node-gradient-teal)" 
                              : "url(#node-gradient-default)"
                          }
                          stroke={
                            isCurrent ? "#14b8a6" : "#cbd5e1"
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

                        <defs>
                          <linearGradient id="node-gradient-default" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="100%" stopColor="#64748b" />
                          </linearGradient>
                          <linearGradient id="node-gradient-teal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2dd4bf" />
                            <stop offset="100%" stopColor="#14b8a6" />
                          </linearGradient>
                        </defs>
                      </>
                    );
                  }}
                  legend={[
                    { color: '#94a3b8', label: '已构建' },
                    { color: '#14b8a6', label: '当前构建' },
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

export default BuildTreeVisualizer;
