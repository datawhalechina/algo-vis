import { Repeat } from "lucide-react";

function ReverseKGroupVisualizer() {
  const list = [1, 2, 3, 4, 5];
  const k = 3;
  const result = [3, 2, 1, 4, 5];

  const renderList = (list: number[], label: string, groups?: number[][]) => (
    <div className="mb-4">
      <p className="text-xs text-gray-600 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        {list.map((val, idx) => {
          const groupIdx = groups?.findIndex(group => group.includes(idx));
          const colors = [
            'bg-blue-50 border-blue-400 text-blue-700',
            'bg-purple-50 border-purple-400 text-purple-700',
            'bg-gray-50 border-gray-300 text-gray-600'
          ];
          const color = groupIdx !== undefined && groupIdx >= 0 ? colors[groupIdx] : 'bg-gray-50 border-gray-400 text-gray-700';
          
          return (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-10 h-10 flex items-center justify-center border-2 rounded-lg font-bold ${color}`}>
                {val}
              </div>
              {idx < list.length - 1 && <div className="text-gray-400">→</div>}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Repeat size={20} className="text-blue-600" />
          K个一组翻转链表
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          每k个节点为一组进行翻转。如果剩余节点不足k个，则保持原顺序。核心是分组处理+链表翻转。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">示例：k={k}, [1,2,3,4,5] → [3,2,1,4,5]</h4>
        {renderList(list, "原链表", [[0, 1, 2], [3, 4]])}
        <div className="text-center text-2xl text-gray-400 my-3">↓</div>
        {renderList(result, "翻转后（第1组翻转，第2组不足k个保持不变）", [[0, 1, 2], [3, 4]])}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">翻转过程</h4>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">步骤1：检查是否有k个节点</div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>从当前位置向后数k个节点</div>
              <div>如果不足k个，直接返回不翻转</div>
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">步骤2：翻转这k个节点</div>
            <div className="text-sm text-purple-700 font-mono space-y-1">
              <div>第1组 [1,2,3] → [3,2,1]</div>
              <div>使用头插法或三指针法翻转</div>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-900 mb-2">步骤3：连接各组</div>
            <div className="text-sm text-green-700 space-y-1">
              <div>将翻转后的组头连接到上一组</div>
              <div>继续处理下一组</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">算法步骤</h4>
        <div className="space-y-2 text-sm font-mono bg-gray-50 p-4 rounded">
          <div className="text-blue-700">1. 使用getKth函数检查是否有k个节点</div>
          <div className="text-purple-700">2. 如果有，翻转这k个节点</div>
          <div className="text-green-700">3. 保存第k个节点的next作为下一组的起点</div>
          <div className="text-orange-700">4. 连接翻转后的组</div>
          <div className="text-gray-700">5. 移动prevGroup指针，继续处理下一组</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">关键点</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>需要先检查是否有足够k个节点</li>
          <li>使用dummy节点简化边界情况</li>
          <li>翻转时保存groupNext避免断链</li>
          <li>翻转完需要更新prevGroup指针</li>
          <li>最后一组不足k个节点保持原顺序</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度分析</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">时间复杂度:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(n)</span>
            <span className="text-gray-600">遍历所有节点一次</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">空间复杂度:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">O(1)</span>
            <span className="text-gray-600">只用常数个指针变量</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReverseKGroupVisualizer;
