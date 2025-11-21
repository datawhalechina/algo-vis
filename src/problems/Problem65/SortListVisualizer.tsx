import { ArrowUpDown } from "lucide-react";

function SortListVisualizer() {
  const list = [4, 2, 1, 3];
  const result = [1, 2, 3, 4];

  const renderList = (list: number[], label: string, highlightIndices?: number[]) => (
    <div className="mb-4">
      <p className="text-xs text-gray-600 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        {list.map((val, idx) => {
          const isHighlight = highlightIndices?.includes(idx);
          const color = isHighlight 
            ? 'bg-yellow-50 border-yellow-400 text-yellow-700'
            : 'bg-blue-50 border-blue-400 text-blue-700';
          
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
          <ArrowUpDown size={20} className="text-blue-600" />
          归并排序链表
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          使用归并排序对链表进行排序。通过快慢指针找中点，递归分治，最后合并有序链表。时间O(nlogn)，空间O(logn)。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">示例：[4,2,1,3] → [1,2,3,4]</h4>
        {renderList(list, "原链表")}
        <div className="text-center text-2xl text-gray-400 my-3">↓ 归并排序</div>
        {renderList(result, "排序后")}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">归并排序过程</h4>
        <div className="space-y-3 text-sm font-mono">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">分解：</div>
            <div className="text-blue-700 space-y-1">
              <div>[4,2,1,3]</div>
              <div className="ml-4">↙ [4,2]  ↘ [1,3]</div>
              <div className="ml-8">↙[4] ↘[2]  ↙[1] ↘[3]</div>
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">合并：</div>
            <div className="text-purple-700 space-y-1">
              <div className="ml-8">merge([4],[2])→[2,4]</div>
              <div className="ml-8">merge([1],[3])→[1,3]</div>
              <div className="ml-4">merge([2,4],[1,3])→[1,2,3,4]</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">算法步骤</h4>
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-blue-50 rounded">
            <span className="font-medium text-blue-900">1. 找中点：</span>
            <span className="text-blue-700 ml-2">使用快慢指针，slow走一步，fast走两步</span>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <span className="font-medium text-purple-900">2. 断链：</span>
            <span className="text-purple-700 ml-2">在中点处断开链表，分成两部分</span>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <span className="font-medium text-green-900">3. 递归排序：</span>
            <span className="text-green-700 ml-2">分别对左右两部分递归排序</span>
          </div>
          <div className="p-2 bg-orange-50 rounded">
            <span className="font-medium text-orange-900">4. 合并：</span>
            <span className="text-orange-700 ml-2">合并两个有序链表</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">快慢指针找中点</h4>
        <div className="bg-gray-50 p-3 rounded font-mono text-sm">
          <div className="text-gray-700">slow = head, fast = head.next</div>
          <div className="text-gray-700">while (fast && fast.next):</div>
          <div className="text-gray-700 ml-4">slow = slow.next</div>
          <div className="text-gray-700 ml-4">fast = fast.next.next</div>
          <div className="text-blue-700 mt-2">// slow即为中点</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">关键点</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>快慢指针初始化：slow=head, fast=head.next</li>
          <li>为什么fast从head.next开始？保证断开后左半部分长度≤右半部分</li>
          <li>递归终止条件：!head || !head.next（0个或1个节点）</li>
          <li>断链后要将slow.next设为null</li>
          <li>合并两个有序链表是经典双指针问题</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">为什么选择归并排序？</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="p-3 bg-green-50 rounded">
            <div className="font-medium text-green-900">优点：</div>
            <div className="text-green-800 space-y-1 mt-1">
              <div>• 时间复杂度稳定O(nlogn)</div>
              <div>• 适合链表：不需要随机访问</div>
              <div>• 稳定排序：相同元素保持相对顺序</div>
            </div>
          </div>
          <div className="p-3 bg-yellow-50 rounded">
            <div className="font-medium text-yellow-900">对比快速排序：</div>
            <div className="text-yellow-800">
              链表无法高效找到随机位置元素，快排的pivot选择效率低
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度分析</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">时间复杂度:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(nlogn)</span>
            <span className="text-gray-600">分治logn层，每层合并O(n)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">空间复杂度:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">O(logn)</span>
            <span className="text-gray-600">递归调用栈深度</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortListVisualizer;
