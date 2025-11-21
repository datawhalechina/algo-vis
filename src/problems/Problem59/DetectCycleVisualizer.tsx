import { Repeat } from "lucide-react";

function DetectCycleVisualizer() {
  const list = [3, 2, 0, -4];
  const pos = 1; // 环入口索引

  return (
    <div className="w-full space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Repeat size={20} className="text-blue-600" />
          Floyd判圈算法（找环入口）
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          两阶段算法：①快慢指针找相遇点 ②双指针找环入口。时间O(n)，空间O(1)。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">链表结构</h4>
        <div className="flex items-center gap-2 mb-4">
          {list.map((val, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold ${
                idx === pos 
                  ? 'border-red-500 bg-red-100 text-red-700 scale-110' 
                  : 'border-blue-400 bg-blue-50 text-blue-700'
              }`}>
                {val}
                {idx === pos && <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">入</div>}
              </div>
              {idx < list.length - 1 ? (
                <div className="text-gray-400">→</div>
              ) : (
                <div className="text-red-600 font-bold">↰</div>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-red-700 font-medium">环入口：索引{pos}（值={list[pos]}）</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">算法流程</h4>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-900 mb-1">阶段1：检测是否有环</p>
            <p className="text-sm text-blue-700">快指针走2步，慢指针走1步，相遇则有环</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="font-medium text-purple-900 mb-1">阶段2：找环入口</p>
            <p className="text-sm text-purple-700">一个指针从头，一个从相遇点，同速前进，相遇点即入口</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">数学原理</h4>
        <div className="text-sm space-y-2 text-gray-700">
          <p>设：头到入口距离=a，入口到相遇点=b，相遇点到入口=c</p>
          <p className="font-mono bg-gray-50 p-2 rounded">
            慢指针路程: a + b<br />
            快指针路程: a + b + c + b = a + 2b + c<br />
            快指针是慢指针2倍: a + 2b + c = 2(a + b)<br />
            化简得: a = c
          </p>
          <p className="text-green-700 font-medium">所以从头和相遇点同时走a步会在入口相遇！</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度分析</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">时间复杂度:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(n)</span>
            <span className="text-gray-600">最多遍历链表2次</span>
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

export default DetectCycleVisualizer;
