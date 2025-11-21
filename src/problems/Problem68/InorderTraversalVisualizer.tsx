import { GitBranch } from "lucide-react";

function InorderTraversalVisualizer() {
  // 示例二叉树: [1, null, 2, 3]
  //     1
  //      \
  //       2
  //      /
  //     3
  
  const traversalOrder = [1, 3, 2];

  const renderTreeNode = (val: number | null, isHighlight: boolean = false, order?: number) => {
    if (val === null) return <div className="w-12 h-12" />;
    
    return (
      <div className="relative">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${
          isHighlight 
            ? 'bg-green-50 border-green-500 text-green-700' 
            : 'bg-blue-50 border-blue-400 text-blue-700'
        }`}>
          {val}
        </div>
        {order !== undefined && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
            {order}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <GitBranch size={20} className="text-blue-600" />
          二叉树的中序遍历
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          中序遍历：左子树 → 根节点 → 右子树（LNR）。递归实现最简单，迭代法使用栈模拟递归过程。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">示例树结构</h4>
        <div className="flex flex-col items-center space-y-3">
          <div className="flex justify-center">
            {renderTreeNode(1, false, 1)}
          </div>
          <div className="flex justify-center gap-16">
            <div className="w-12"></div>
            {renderTreeNode(2, false, 3)}
          </div>
          <div className="flex justify-center gap-16">
            {renderTreeNode(3, false, 2)}
            <div className="w-12"></div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          遍历顺序：[{traversalOrder.join(', ')}]
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">中序遍历过程</h4>
        <div className="space-y-3 text-sm font-mono">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">访问节点1：</div>
            <div className="text-blue-700 space-y-1">
              <div>1. 左子树为空，跳过</div>
              <div>2. 访问根节点1 → 输出[1]</div>
              <div>3. 递归右子树（节点2）</div>
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">访问节点2：</div>
            <div className="text-purple-700 space-y-1">
              <div>1. 递归左子树（节点3）</div>
              <div>2. 访问根节点2</div>
              <div>3. 右子树为空，跳过</div>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-900 mb-2">访问节点3：</div>
            <div className="text-green-700 space-y-1">
              <div>1. 左子树为空，跳过</div>
              <div>2. 访问根节点3 → 输出[1,3]</div>
              <div>3. 右子树为空，跳过</div>
              <div>4. 返回节点2，输出[1,3,2]</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">递归实现</h4>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
          <div className="text-purple-400">function <span className="text-yellow-300">inorderTraversal</span>(root) {'{'}</div>
          <div className="ml-4 text-blue-300">const result = [];</div>
          <div className="ml-4 text-purple-400">function <span className="text-yellow-300">inorder</span>(node) {'{'}</div>
          <div className="ml-8 text-pink-400">if (!node) return;</div>
          <div className="ml-8 text-green-400">inorder(node.left); <span className="text-gray-500">// 左</span></div>
          <div className="ml-8 text-blue-300">result.push(node.val); <span className="text-gray-500">// 根</span></div>
          <div className="ml-8 text-green-400">inorder(node.right); <span className="text-gray-500">// 右</span></div>
          <div className="ml-4">{'}'}</div>
          <div className="ml-4 text-orange-300">inorder(root);</div>
          <div className="ml-4 text-pink-400">return result;</div>
          <div>{'}'}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">迭代实现（栈）</h4>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">步骤1：一路向左</div>
            <div className="text-blue-700">
              从根节点开始，将所有左节点依次入栈，直到左子树为空
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">步骤2：弹出访问</div>
            <div className="text-purple-700">
              弹出栈顶节点并访问（输出），这就是中序遍历的"根"
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-900 mb-2">步骤3：转向右子树</div>
            <div className="text-green-700">
              将当前节点设为右子节点，重复步骤1-3，直到栈空且节点为空
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">三种遍历顺序对比</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">遍历方式</th>
                <th className="px-4 py-2 text-left">顺序</th>
                <th className="px-4 py-2 text-left">本例结果</th>
                <th className="px-4 py-2 text-left">应用场景</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 font-medium">前序遍历</td>
                <td className="px-4 py-2 text-xs font-mono">根→左→右</td>
                <td className="px-4 py-2 font-mono">[1,2,3]</td>
                <td className="px-4 py-2 text-xs">复制树、前缀表达式</td>
              </tr>
              <tr className="bg-green-50">
                <td className="px-4 py-2 font-medium">中序遍历 ✓</td>
                <td className="px-4 py-2 text-xs font-mono">左→根→右</td>
                <td className="px-4 py-2 font-mono text-green-700">[1,3,2]</td>
                <td className="px-4 py-2 text-xs">BST升序输出</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">后序遍历</td>
                <td className="px-4 py-2 text-xs font-mono">左→右→根</td>
                <td className="px-4 py-2 font-mono">[3,2,1]</td>
                <td className="px-4 py-2 text-xs">删除树、后缀表达式</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">关键点</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>中序遍历对BST来说会得到升序序列</li>
          <li>递归法代码最简洁，只需3行核心代码</li>
          <li>迭代法需要显式使用栈来模拟递归</li>
          <li>Morris遍历可以做到O(1)空间但会临时修改树结构</li>
          <li>记忆口诀：LNR（Left-Node-Right）</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度分析</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">时间复杂度:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(n)</span>
            <span className="text-gray-600">每个节点访问一次</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">空间复杂度（递归）:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-mono">O(h)</span>
            <span className="text-gray-600">h为树高，递归栈深度</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">空间复杂度（迭代）:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-mono">O(h)</span>
            <span className="text-gray-600">显式栈的空间</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InorderTraversalVisualizer;
