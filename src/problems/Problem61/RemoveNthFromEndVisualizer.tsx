import { Trash2 } from "lucide-react";

function RemoveNthFromEndVisualizer() {
  const list = [1, 2, 3, 4, 5];
  const n = 2; // 删除倒数第2个
  const targetIdx = 3; // 位置3（值为4）
  const result = [1, 2, 3, 5];

  return (
    <div className="w-full space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Trash2 size={20} className="text-blue-600" />
          双指针（快慢指针）
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          快指针先走n步，然后快慢指针同步前进。当快指针到末尾时，慢指针指向待删除节点的前一个。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">示例：删除倒数第{n}个节点</h4>
        
        <div className="mb-6">
          <p className="text-xs text-gray-600 mb-2">原链表:</p>
          <div className="flex items-center gap-2">
            {list.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-10 h-10 flex items-center justify-center border-2 rounded-lg font-bold ${
                  idx === targetIdx
                    ? 'border-red-500 bg-red-100 text-red-700'
                    : 'border-blue-400 bg-blue-50 text-blue-700'
                }`}>
                  {val}
                </div>
                {idx < list.length - 1 && <div className="text-gray-400">→</div>}
              </div>
            ))}
          </div>
          {targetIdx >= 0 && (
            <p className="text-xs text-red-600 mt-2">
              待删除：位置{targetIdx}，值={list[targetIdx]}（倒数第{n}个）
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">结果链表:</p>
          <div className="flex items-center gap-2">
            {result.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center border-2 border-green-400 bg-green-50 text-green-700 rounded-lg font-bold">
                  {val}
                </div>
                {idx < result.length - 1 && <div className="text-gray-400">→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">算法步骤</h4>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900 mb-1">步骤1：快指针先走n步</p>
            <p className="text-sm text-blue-700">fast指针走{n}步，到达位置{n}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="font-medium text-purple-900 mb-1">步骤2：双指针同步前进</p>
            <p className="text-sm text-purple-700">slow和fast同时走，直到fast到末尾</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="font-medium text-red-900 mb-1">步骤3：删除节点</p>
            <p className="text-sm text-red-700">此时slow在待删除节点的前一个，执行删除</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">为什么有效？</h4>
        <div className="text-sm space-y-2 text-gray-700">
          <p>快慢指针之间始终保持n个节点的距离</p>
          <p>当fast到达末尾时，slow正好在倒数第n+1个节点</p>
          <p className="text-green-700 font-medium">只需一次遍历，时间复杂度O(L)</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度分析</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">时间复杂度:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(L)</span>
            <span className="text-gray-600">L是链表长度</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">空间复杂度:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">O(1)</span>
            <span className="text-gray-600">只用两个指针</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RemoveNthFromEndVisualizer;
