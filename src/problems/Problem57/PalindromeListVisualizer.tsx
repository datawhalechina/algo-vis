import { Repeat } from "lucide-react";

function PalindromeListVisualizer() {
  const palindromeList = [1, 2, 2, 1];
  const notPalindromeList = [1, 2, 3, 4];

  const renderList = (list: number[], isPalindrome: boolean, title: string) => (
    <div className="mb-6">
      <p className="text-sm font-medium mb-2 text-gray-700">{title}</p>
      <div className="flex items-center gap-2 mb-2">
        {list.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold ${
                isPalindrome
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-red-400 bg-red-50 text-red-700'
              }`}
            >
              {val}
            </div>
            {idx < list.length - 1 && <div className="text-gray-400">→</div>}
          </div>
        ))}
      </div>
      <div className={`text-sm font-medium ${isPalindrome ? 'text-green-700' : 'text-red-700'}`}>
        {isPalindrome ? '✓ 是回文' : '✗ 不是回文'}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 p-6">
      {/* 算法说明 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Repeat size={20} className="text-blue-600" />
          快慢指针 + 反转链表
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          使用快慢指针找到中点，反转后半部分链表，然后比较前后两部分是否相同。
          时间O(n)，空间O(1)。
        </p>
      </div>

      {/* 示例 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">示例</h4>
        {renderList(palindromeList, true, "示例 1: [1,2,2,1]")}
        {renderList(notPalindromeList, false, "示例 2: [1,2,3,4]")}
      </div>

      {/* 算法步骤 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">算法步骤</h4>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900 mb-1">步骤1：快慢指针找中点</p>
            <p className="text-sm text-blue-700">slow每次走1步，fast每次走2步</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="font-medium text-purple-900 mb-1">步骤2：反转后半部分</p>
            <p className="text-sm text-purple-700">从中点开始反转链表</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="font-medium text-green-900 mb-1">步骤3：比较两部分</p>
            <p className="text-sm text-green-700">逐个比较前半部分和反转后的后半部分</p>
          </div>
        </div>
      </div>

      {/* 示例详解 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">示例详解: [1,2,2,1]</h4>
        <div className="space-y-2 text-sm font-mono">
          <div>原链表: 1 → 2 → 2 → 1</div>
          <div className="text-blue-700">找中点: slow到达第2个节点(值2)</div>
          <div className="text-purple-700">反转后半: 2 → 1 变成 1 → 2</div>
          <div className="text-green-700">
            比较: [1,2] == [1,2] ✓ 是回文！
          </div>
        </div>
      </div>

      {/* 复杂度 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度分析</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">时间复杂度:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(n)</span>
            <span className="text-gray-600">遍历链表两次</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">空间复杂度:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">O(1)</span>
            <span className="text-gray-600">原地反转</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PalindromeListVisualizer;
