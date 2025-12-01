import { Target } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TreeTemplate } from "@/components/visualizers/templates/TreeTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generatePathSumIIISteps, TreeNode } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface PathSumIIIInput extends ProblemInput {
  tree: string;
  targetSum: number;
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
  
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }
  
  return result;
}

function PathSumIIIVisualizer() {
  return (
    <ConfigurableVisualizer<PathSumIIIInput, Record<string, never>>
      config={{
        defaultInput: { tree: "10,5,-3,3,2,null,11,3,-2,null,1", targetSum: 8 },
        algorithm: (input) => {
          const root = parseTree(input.tree);
          return generatePathSumIIISteps(root, input.targetSum);
        },
        
        inputTypes: [
          { type: "string-and-number", stringKey: "tree", numberKey: "targetSum", stringLabel: "tree", numberLabel: "targetSum" },
        ],
        inputFields: [
          { type: "string", key: "tree", label: "二叉树（LeetCode格式）", placeholder: "例如: 10,5,-3,3,2,null,11,3,-2,null,1" },
          { type: "number", key: "targetSum", label: "目标和 targetSum", placeholder: "请输入目标和" },
        ],
        testCases: [
          { label: "示例 1", value: { tree: "10,5,-3,3,2,null,11,3,-2,null,1", targetSum: 8 } },
          { label: "示例 2", value: { tree: "5,4,8,11,null,13,4,7,2,null,null,5,1", targetSum: 22 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as PathSumIIIInput;
          const node = variables?.node as TreeNode | null | undefined;
          const path = variables?.path as number[] | undefined;
          const targetSum = input.targetSum;
          const currentPath = variables?.currentPath as number[] | undefined;
          const count = variables?.count as number | undefined;
          const totalCount = variables?.totalCount as number | undefined;
          const result = variables?.result as number | undefined;
          const found = variables?.found as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          const phase = variables?.phase as string | undefined;
          const coreIdea = getProblemCoreIdea(128);
          
          // 构建当前树状态
          const currentTree = node || parseTree(input.tree);
          const treeArray = currentTree ? treeToArray(currentTree) : [];
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Target size={20} className="text-blue-600" />
                  路径总和 III（DFS + 路径搜索）
                </h3>
                <p className="text-sm text-gray-600">
                  对每个节点作为起点，向下DFS搜索所有可能的路径，统计路径和等于目标值的数量。
                </p>
              </div>

              {/* 状态信息 */}
              {(count !== undefined || totalCount !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">路径统计</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {count !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">当前节点路径数</div>
                        <div className="text-2xl font-bold text-blue-600">{count}</div>
                      </div>
                    )}
                    {totalCount !== undefined && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">累计路径数</div>
                        <div className="text-2xl font-bold text-green-600">{totalCount}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 当前路径 */}
              {currentPath && currentPath.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">当前路径</h4>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex gap-2 items-center">
                      {currentPath.map((val, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-3 py-2 rounded-lg bg-yellow-400 text-yellow-900 font-bold"
                        >
                          {val}
                        </motion.div>
                      ))}
                      <span className="text-gray-600">= {currentPath.reduce((a, b) => a + b, 0)}</span>
                      {found && (
                        <span className="ml-2 text-green-600 font-bold">✓ 匹配目标 {targetSum}!</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 树可视化 */}
              {treeArray.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">二叉树状态</h4>
                  <TreeTemplate
                    data={treeArray}
                    renderNode={(nodeState) => {
                      const isCurrent = path && path.length > 0 && 
                        nodeState.path && 
                        nodeState.path.length === path.length &&
                        nodeState.path.every((p, i) => p === path[i]);
                      const inPath = currentPath && nodeState.value !== null && 
                        currentPath.includes(nodeState.value as number);
                      
                      return (
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                            found && inPath
                              ? "bg-gradient-to-br from-green-400 to-green-500 scale-110 shadow-lg"
                              : isCurrent
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-105 shadow-md"
                              : inPath
                              ? "bg-gradient-to-br from-blue-400 to-blue-500"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                        >
                          {nodeState.value}
                        </div>
                      );
                    }}
                    getNodeState={(index, path) => ({
                      path,
                      isCurrent: path && path.length > 0 && 
                        variables?.path && 
                        path.length === variables.path.length &&
                        path.every((p, i) => p === variables.path[i]),
                    })}
                    layout={{ nodeSize: 48, levelHeight: 80 }}
                  />
                </div>
              )}

              {finished && result !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-lg">
                      ✓ 完成！共找到 {result} 条路径
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

export default PathSumIIIVisualizer;

