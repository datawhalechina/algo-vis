import { RefreshCw } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate } from "@/components/visualizers/templates/TreeTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateInvertTreeSteps, TreeNode } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface InvertTreeInput extends ProblemInput {
  tree: string; // 输入格式："4,2,7,1,3,6,9"
}

// 解析输入字符串为树结构
function parseTree(input: string): TreeNode | null {
  if (!input.trim()) return null;
  const arr = input.split(',').map(s => {
    const trimmed = s.trim();
    if (trimmed === 'null' || trimmed === '') return null;
    const num = parseInt(trimmed);
    return isNaN(num) ? null : num;
  });
  
  if (arr.length === 0 || arr[0] === null) return null;
  
  const root: TreeNode = { val: arr[0] as number, left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;
  
  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;
    
    if (i < arr.length && arr[i] !== null) {
      node.left = { val: arr[i] as number, left: null, right: null };
      queue.push(node.left);
    }
    i++;
    
    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i] as number, left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }
  
  return root;
}

// 树转数组（用于可视化）
function treeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return [];
  const result: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];
  
  while (queue.length > 0) {
    const node = queue.shift();
    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }
  
  // 移除末尾的null
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }
  
  return result;
}

function InvertTreeVisualizer() {
  return (
    <ConfigurableVisualizer<InvertTreeInput, Record<string, never>>
      config={{
        defaultInput: { tree: "4,2,7,1,3,6,9" },
        algorithm: (input) => {
          const root = parseTree(input.tree);
          return generateInvertTreeSteps(root);
        },
        
        inputTypes: [
          { type: "string", key: "tree", label: "tree" },
        ],
        inputFields: [
          { type: "string", key: "tree", label: "二叉树（LeetCode格式）", placeholder: "例如: 4,2,7,1,3,6,9" },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "4,2,7,1,3,6,9" } },
          { label: "示例 2", value: { tree: "2,1,3" } },
          { label: "示例 3", value: { tree: "1,2" } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as InvertTreeInput;
          const node = variables?.node as TreeNode | null | undefined;
          const action = variables?.action as string | undefined;
          const finished = variables?.finished as boolean | undefined;
          const coreIdea = getProblemCoreIdea(127);
          
          // 构建当前树状态
          const currentTree = node || parseTree(input.tree);
          const treeArray = currentTree ? treeToArray(currentTree) : [];
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <RefreshCw size={20} className="text-blue-600" />
                  翻转二叉树（递归DFS）
                </h3>
                <p className="text-sm text-gray-600">
                  使用递归深度优先搜索，对于每个节点，递归翻转其左右子树，然后交换左右子节点的引用。
                </p>
              </div>

              {/* 树可视化 */}
              {treeArray.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">二叉树状态</h4>
                  <TreeTemplate
                  data={treeArray}
                  renderNode={(position, state) => {
                    const isCurrent = state.isCurrent;
                    const isSwapping = action === "swap" && isCurrent;
                    
                    return (
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                          isSwapping
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-110 shadow-lg"
                            : isCurrent
                            ? "bg-gradient-to-br from-blue-400 to-blue-500 scale-105 shadow-md"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}
                      >
                        {position.node.val}
                      </div>
                    );
                  }}
                  getNodeState={(_index, val) => ({
                    isCurrent: node ? val === node.val : false,
                  })}
                  layout={{ nodeRadius: 24, horizontalSpacing: 160, verticalSpacing: 100 }}
                />
              </div>
              )}

              {/* 当前操作 */}
              {action && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">当前操作</h4>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-700">
                      {action === "visit" && `访问节点 ${node?.val}`}
                      {action === "swap" && `交换节点 ${node?.val} 的左右子树`}
                      {action === "complete" && `节点 ${node?.val} 翻转完成`}
                      {action === "return_null" && "节点为空，返回 null"}
                    </div>
                  </div>
                </div>
              )}

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-lg">
                      ✓ 翻转完成！
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default InvertTreeVisualizer;

