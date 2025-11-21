import { Copy } from "lucide-react";

function CopyRandomListVisualizer() {
  // 原链表节点：[值, random指向的索引]
  const nodes = [
    { val: 7, random: null },
    { val: 13, random: 0 },
    { val: 11, random: 4 },
    { val: 10, random: 2 },
    { val: 1, random: 0 },
  ];

  const renderNode = (val: number, idx: number, isNew: boolean = false) => {
    const bgColor = isNew ? 'bg-green-50' : 'bg-blue-50';
    const borderColor = isNew ? 'border-green-400' : 'border-blue-400';
    const textColor = isNew ? 'text-green-700' : 'text-blue-700';
    
    return (
      <div className={`flex flex-col items-center p-3 ${bgColor} ${borderColor} border-2 rounded-lg`}>
        <div className={`text-xs ${textColor} mb-1`}>节点{idx}</div>
        <div className={`text-lg font-bold ${textColor}`}>{val}</div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Copy size={20} className="text-blue-600" />
          深拷贝随机链表
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          每个节点除了next指针，还有random指针可能指向任意节点或null。需要深拷贝整个结构，使用哈希表建立原节点与新节点的映射。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">原链表结构（带random指针）</h4>
        <div className="flex items-start gap-3 mb-4">
          {nodes.map((node, idx) => (
            <div key={idx} className="relative">
              {renderNode(node.val, idx, false)}
              {node.random !== null && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-red-600">
                  ↓ random→{node.random}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-12 text-gray-400">
          {nodes.map((_, idx) => (
            <div key={idx} className="w-[72px] text-center">
              {idx < nodes.length - 1 && '→'}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">算法步骤（哈希表法）</h4>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">第一次遍历：创建所有新节点</div>
            <div className="text-sm text-blue-700 font-mono space-y-1">
              <div>for (curr in 原链表):</div>
              <div className="ml-4">map[curr] = new Node(curr.val)</div>
              <div className="ml-4">// 建立原节点→新节点的映射</div>
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">第二次遍历：复制指针关系</div>
            <div className="text-sm text-purple-700 font-mono space-y-1">
              <div>for (curr in 原链表):</div>
              <div className="ml-4">newNode = map[curr]</div>
              <div className="ml-4">newNode.next = map[curr.next]</div>
              <div className="ml-4">newNode.random = map[curr.random]</div>
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-900 mb-2">返回结果</div>
            <div className="text-sm text-green-700">
              返回 map[head]，即原头节点对应的新节点
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">为什么需要哈希表？</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="font-medium text-yellow-900 mb-1">问题：</div>
            <div className="text-yellow-800">
              random指针可能指向链表中的任意节点，甚至是还未创建的节点。无法在一次遍历中同时处理所有指针。
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-900 mb-1">解决：</div>
            <div className="text-green-800">
              使用哈希表记录"原节点→新节点"的映射。第一次遍历创建所有节点，第二次遍历通过哈希表快速找到对应新节点并设置指针。
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">关键点</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>需要两次遍历：第一次创建节点，第二次复制指针</li>
          <li>哈希表的key是原节点，value是新节点</li>
          <li>处理random指针时要检查是否为null</li>
          <li>O(1)时间查找节点对应关系</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">进阶优化（O(1)空间）</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <p>将新节点插入到对应原节点后面：</p>
          <div className="p-3 bg-gray-50 rounded font-mono text-xs">
            <div>1→1'→2→2'→3→3'</div>
            <div className="mt-2">这样可以通过 curr.next 直接访问到对应的新节点</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度分析</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">时间复杂度:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(n)</span>
            <span className="text-gray-600">两次遍历链表</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">空间复杂度:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded font-mono">O(n)</span>
            <span className="text-gray-600">哈希表存储n个节点映射</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CopyRandomListVisualizer;
