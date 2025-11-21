import { GitMerge } from "lucide-react";

function MergeKListsVisualizer() {
  const lists = [
    [1, 4, 5],
    [1, 3, 4],
    [2, 6],
  ];
  const result = [1, 1, 2, 3, 4, 4, 5, 6];

  const renderList = (list: number[], idx: number) => {
    const colors = [
      'bg-blue-50 border-blue-400 text-blue-700',
      'bg-purple-50 border-purple-400 text-purple-700',
      'bg-green-50 border-green-400 text-green-700',
    ];
    const color = colors[idx % colors.length];
    
    return (
      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-2">链表{idx + 1}</p>
        <div className="flex items-center gap-2">
          {list.map((val, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-10 h-10 flex items-center justify-center border-2 rounded-lg font-bold ${color}`}>
                {val}
              </div>
              {i < list.length - 1 && <div className="text-gray-400">→</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <GitMerge size={20} className="text-blue-600" />
          合并K个有序链表
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          将k个升序链表合并为一个升序链表。可以使用分治法，两两合并，时间复杂度O(Nlogk)，N是总节点数。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">示例：合并3个链表</h4>
        <div className="mb-4">
          {lists.map((list, idx) => renderList(list, idx))}
        </div>
        <div className="text-center text-2xl text-gray-400 my-3">↓ 分治合并</div>
        <div>
          <p className="text-xs text-gray-600 mb-2">合并结果</p>
          <div className="flex items-center gap-2 flex-wrap">
            {result.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center border-2 rounded-lg font-bold bg-orange-50 border-orange-400 text-orange-700">
                  {val}
                </div>
                {i < result.length - 1 && <div className="text-gray-400">→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">分治法过程</h4>
        <div className="space-y-3 text-sm font-mono">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">第一轮合并（3→2）：</div>
            <div className="text-blue-700 space-y-1">
              <div>merge(list1, list2) → [1,1,3,4,4,5]</div>
              <div>list3保持 → [2,6]</div>
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">第二轮合并（2→1）：</div>
            <div className="text-purple-700">
              merge([1,1,3,4,4,5], [2,6]) → [1,1,2,3,4,4,5,6]
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">算法步骤（分治法）</h4>
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-blue-50 rounded">
            <span className="font-medium text-blue-900">1. 递归终止：</span>
            <span className="text-blue-700 ml-2">如果只有1个链表，直接返回</span>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <span className="font-medium text-purple-900">2. 分治：</span>
            <span className="text-purple-700 ml-2">将k个链表分成两组，mid = k/2</span>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <span className="font-medium text-green-900">3. 递归合并：</span>
            <span className="text-green-700 ml-2">分别合并左右两组</span>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <span className="font-medium text-orange-900">4. 合并结果：</span>
            <span className="text-orange-700 ml-2">合并两个有序链表</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">三种解法对比</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">方法</th>
                <th className="px-4 py-2 text-left">时间复杂度</th>
                <th className="px-4 py-2 text-left">空间复杂度</th>
                <th className="px-4 py-2 text-left">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 font-medium">顺序合并</td>
                <td className="px-4 py-2 text-red-600">O(Nk)</td>
                <td className="px-4 py-2">O(1)</td>
                <td className="px-4 py-2 text-xs">每次合并遍历所有节点</td>
              </tr>
              <tr className="bg-green-50">
                <td className="px-4 py-2 font-medium">分治法 ✓</td>
                <td className="px-4 py-2 text-green-600">O(Nlogk)</td>
                <td className="px-4 py-2">O(logk)</td>
                <td className="px-4 py-2 text-xs">推荐！两两合并</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">优先队列</td>
                <td className="px-4 py-2 text-blue-600">O(Nlogk)</td>
                <td className="px-4 py-2">O(k)</td>
                <td className="px-4 py-2 text-xs">使用最小堆</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">分治法示意图（k=4）</h4>
        <div className="bg-gray-50 p-4 rounded font-mono text-xs">
          <div className="text-center space-y-2">
            <div className="text-gray-700">[L1, L2, L3, L4]</div>
            <div className="text-blue-600">↙          ↘</div>
            <div className="text-gray-700">[L1, L2]    [L3, L4]</div>
            <div className="text-blue-600">↙  ↘      ↙  ↘</div>
            <div className="text-gray-700">L1  L2    L3  L4</div>
            <div className="text-purple-600 mt-3">合并阶段（自底向上）</div>
            <div className="text-gray-700">merge(L1,L2)  merge(L3,L4)</div>
            <div className="text-gray-700 mt-2">merge(merge(L1,L2), merge(L3,L4))</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">关键点</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>分治法的核心是减少合并次数</li>
          <li>每个节点被合并的次数是logk（树的高度）</li>
          <li>需要实现merge函数合并两个有序链表</li>
          <li>边界情况：空链表数组、只有一个链表</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度分析（分治法）</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">时间复杂度:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(Nlogk)</span>
            <span className="text-gray-600">N是总节点数，k是链表数</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">空间复杂度:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">O(logk)</span>
            <span className="text-gray-600">递归调用栈深度</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MergeKListsVisualizer;
