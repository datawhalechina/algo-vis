import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate } from "@/components/visualizers/templates/TreeTemplate";
import { generateInorderTraversalSteps } from "./algorithm";
import type { ProblemInput } from "@/types/visualization";

interface InorderTraversalInput extends ProblemInput {
  tree: (number | null)[];
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
        defaultInput: { tree: [1, null, 2, 3] },
        algorithm: (input) => generateInorderTraversalSteps(input.tree),
        
        inputTypes: [{ type: "array", key: "tree", label: "二叉树（层序）" }],
        inputFields: [{ type: "array", key: "tree", label: "二叉树节点", placeholder: "输入节点值，用逗号分隔，null表示空节点，如: 1,null,2,3" }],
        testCases: [
          { label: "示例1", value: { tree: [1, null, 2, 3] } },
          { label: "完全二叉树", value: { tree: [1, 2, 3, 4, 5, 6, 7] } },
          { label: "左斜树", value: { tree: [1, 2, null, 3] } },
        ],
        
        render: ({ data }) => {
          const state = data as InorderTraversalData;
          
          if (!state || !state.tree) {
            return <div className="text-gray-500">等待输入...</div>;
          }

          const { tree, result = [], currentNode, completed } = state;

          return (
            <div className="space-y-6">
              {/* 结果显示 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  中序遍历结果
                </div>
                <div className="flex items-center gap-2">
                  {result.length === 0 ? (
                    <span className="text-gray-400">空</span>
                  ) : (
                    result.map((val, idx) => (
                      <div
                        key={idx}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${
                          val === currentNode && !completed
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-blue-50 border-blue-400 text-blue-700'
                        }`}
                      >
                        {val}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 二叉树可视化 */}
              <TreeTemplate
                data={tree}
                renderNode={(position) => {
                  const val = position.node.val;
                  if (val === null) return null;
                  
                  const isCurrent = val === currentNode;
                  const isVisited = result.includes(val);
                  
                  return (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                        isCurrent && !completed
                          ? 'bg-green-100 border-green-500 text-green-700 ring-2 ring-green-300'
                          : isVisited
                          ? 'bg-blue-100 border-blue-400 text-blue-700'
                          : 'bg-gray-50 border-gray-300 text-gray-500'
                      }`}
                    >
                      {val}
                    </div>
                  );
                }}
                getNodeState={(_index, val) => ({
                  isCurrent: val === currentNode,
                  isVisited: val !== null && result.includes(val),
                })}
              />

              {/* 完成提示 */}
              {completed && (
                <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    ✓ 中序遍历完成！
                  </div>
                  <div className="text-sm text-green-600">
                    结果：[{result.join(', ')}]
                  </div>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default InorderTraversalVisualizer;
