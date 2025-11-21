import { Repeat } from "lucide-react";

function HasCycleVisualizer() {
  const listWithCycle = [3, 2, 0, -4];
  const pos = 1; // 环入口

  return (
    <div className="w-full space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Repeat size={20} className="text-blue-600" />
          Floyd判圈算法（快慢指针）
        </h3>
        <p className="text-sm text-gray-600">
          慢指针每次走1步，快指针每次走2步。如果有环，快慢指针必定相遇。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">有环链表示例</h4>
        <div className="flex items-center gap-2 mb-4">
          {listWithCycle.map((val, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold ${
                idx === pos ? 'border-red-500 bg-red-100 text-red-700' : 'border-blue-400 bg-blue-50 text-blue-700'
              }`}>
                {val}
              </div>
              {idx < listWithCycle.length - 1 && <div>→</div>}
              {idx === listWithCycle.length - 1 && <div className="text-red-600">↰</div>}
            </div>
          ))}
        </div>
        <p className="text-sm text-red-700 font-medium">✓ 有环！尾节点指向索引{pos}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度</h4>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="font-medium">时间:</span>
            <span className="px-2 py-1 bg-blue-100 rounded font-mono">O(n)</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">空间:</span>
            <span className="px-2 py-1 bg-green-100 rounded font-mono">O(1)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HasCycleVisualizer;
