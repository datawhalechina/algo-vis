import { Database } from "lucide-react";

function LRUCacheVisualizer() {
  const capacity = 2;

  const renderCacheState = (state: Array<{key: number, val: number}>, title: string, evicted?: number) => (
    <div className="mb-4">
      <p className="text-xs text-gray-600 mb-2">{title}</p>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500 font-medium w-12">最新</div>
        {state.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`px-3 py-2 border-2 rounded-lg ${
              idx === 0 ? 'bg-green-50 border-green-400' :
              idx === state.length - 1 ? 'bg-red-50 border-red-300' :
              'bg-blue-50 border-blue-400'
            }`}>
              <div className="text-xs text-gray-600">key={item.key}</div>
              <div className="font-bold">{item.val}</div>
            </div>
            {idx < state.length - 1 && <div className="text-gray-400">→</div>}
          </div>
        ))}
        <div className="text-xs text-gray-500 font-medium">最旧</div>
      </div>
      {evicted !== undefined && (
        <p className="text-xs text-red-600 mt-2">淘汰：key={evicted}</p>
      )}
    </div>
  );

  return (
    <div className="w-full space-y-6 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Database size={20} className="text-blue-600" />
          LRU缓存机制
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          LRU (Least Recently Used) 最近最少使用缓存。使用哈希表+双向链表实现，get和put操作都是O(1)时间复杂度。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">LRU工作原理</h4>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-1">访问（get/put）：</div>
            <div className="text-blue-700">将访问的节点移到链表头部（最新位置）</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="font-medium text-red-900 mb-1">淘汰：</div>
            <div className="text-red-700">容量满时，删除链表尾部节点（最久未使用）</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-4 text-gray-700">操作示例（capacity={capacity}）</h4>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">① put(1, 1)</div>
            {renderCacheState([{key: 1, val: 1}], "缓存状态")}
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">② put(2, 2)</div>
            {renderCacheState([{key: 2, val: 2}, {key: 1, val: 1}], "缓存状态")}
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">③ get(1) → 1</div>
            {renderCacheState([{key: 1, val: 1}, {key: 2, val: 2}], "缓存状态（1被移到头部）")}
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">④ put(3, 3)</div>
            {renderCacheState([{key: 3, val: 3}, {key: 1, val: 1}], "缓存状态（容量满，淘汰key=2）", 2)}
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">⑤ get(2) → -1</div>
            <div className="text-xs text-red-600">key=2已被淘汰，返回-1</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">数据结构设计</h4>
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="font-medium text-purple-900 mb-2">哈希表 Map&lt;key, Node&gt;</div>
            <div className="text-sm text-purple-700">
              • 快速查找：O(1)时间找到节点<br/>
              • 存储：key → 双向链表节点的引用
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-900 mb-2">双向链表</div>
            <div className="text-sm text-green-700">
              • 维护访问顺序：头部=最新，尾部=最旧<br/>
              • O(1)时间移动节点到头部<br/>
              • O(1)时间删除尾部节点
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">关键操作</h4>
        <div className="space-y-3 text-sm font-mono bg-gray-50 p-3 rounded">
          <div className="text-blue-700">
            <div className="font-bold">get(key):</div>
            <div className="ml-4">1. 查哈希表，不存在返回-1</div>
            <div className="ml-4">2. 存在则移到链表头部</div>
            <div className="ml-4">3. 返回节点值</div>
          </div>
          <div className="text-purple-700 mt-2">
            <div className="font-bold">put(key, value):</div>
            <div className="ml-4">1. key存在：更新值，移到头部</div>
            <div className="ml-4">2. key不存在：</div>
            <div className="ml-8">- 创建新节点加到头部</div>
            <div className="ml-8">- 如果超容量，删除尾部节点</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">为什么需要双向链表？</h4>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="font-medium text-yellow-900 mb-1">单向链表的问题：</div>
            <div className="text-yellow-800">
              删除节点需要O(n)时间找前驱节点
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="font-medium text-green-900 mb-1">双向链表的优势：</div>
            <div className="text-green-800">
              • 有prev指针，O(1)时间删除节点<br/>
              • 可以快速移动节点位置
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">关键点</h4>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>使用虚拟头尾节点（dummy head/tail）简化边界处理</li>
          <li>哈希表的value是节点引用，不是节点值</li>
          <li>移动节点=先删除+再添加到头部</li>
          <li>淘汰时要同时从链表和哈希表中删除</li>
          <li>所有操作都必须同时更新链表和哈希表</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold mb-3 text-gray-700">复杂度分析</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">get操作:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(1)</span>
            <span className="text-gray-600">哈希表查找+链表移动</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">put操作:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">O(1)</span>
            <span className="text-gray-600">哈希表更新+链表操作</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">空间复杂度:</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-mono">O(capacity)</span>
            <span className="text-gray-600">存储capacity个键值对</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LRUCacheVisualizer;
