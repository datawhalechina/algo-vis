import { ConfigurableVisualizer } from '@/components/visualizers/ConfigurableVisualizer';
import { generateIntersectionSteps } from './algorithm';
import { LinkedListTemplate, LinkedListNode } from '@/components/visualizers/templates/LinkedListTemplate';
import { ProblemInput } from '@/types/visualization';

interface IntersectionInput extends ProblemInput {
  listA: number[];
  listB: number[];
}

interface IntersectionData {
  listA: number[];
  listB: number[];
  pA: number;
  pB: number;
  valA: number | null;
  valB: number | null;
  switchA: boolean;
  switchB: boolean;
  intersection?: number;
  found?: boolean;
}

const IntersectionListVisualizer = () => {
  return (
    <ConfigurableVisualizer<IntersectionInput, IntersectionData>
      config={{
        defaultInput: {
          listA: [4, 1, 8, 4, 5],
          listB: [5, 6, 1, 8, 4, 5],
        },
        algorithm: (input) => generateIntersectionSteps(input.listA, input.listB),
        inputTypes: [
          { type: 'array', key: 'listA', label: '链表 A' },
          { type: 'array', key: 'listB', label: '链表 B' },
        ],
        inputFields: [
          { type: 'array', key: 'listA', label: '链表 A', placeholder: '输入数字，用逗号分隔' },
          { type: 'array', key: 'listB', label: '链表 B', placeholder: '输入数字，用逗号分隔' },
        ],
        testCases: [
          {
            label: '相交示例',
            value: {
              listA: [4, 1, 8, 4, 5],
              listB: [5, 6, 1, 8, 4, 5],
            },
          },
          {
            label: '不相交',
            value: {
              listA: [2, 6, 4],
              listB: [1, 5],
            },
          },
        ],
        render: ({ data, getNumberVariable, getBooleanVariable }) => {
          const { listA, listB } = data;
          const pA = getNumberVariable('pA') ?? -1;
          const pB = getNumberVariable('pB') ?? -1;
          const switchA = getBooleanVariable('switchA');
          const switchB = getBooleanVariable('switchB');
          const intersection = getNumberVariable('intersection');

          // 转换数据为 LinkedListNode 格式
          const nodesA: LinkedListNode[] = (listA || []).map((val, idx) => ({
            val,
            next: idx < (listA || []).length - 1 ? idx + 1 : null,
          }));

          const nodesB: LinkedListNode[] = (listB || []).map((val, idx) => ({
            val,
            next: idx < (listB || []).length - 1 ? idx + 1 : null,
          }));

          // 计算指针位置
          // pA 在 A 上: !switchA
          // pA 在 B 上: switchA
          // pB 在 B 上: !switchB
          // pB 在 A 上: switchB

          const pointersA = [];
          if (!switchA && pA >= 0 && pA < nodesA.length) {
            pointersA.push({ name: 'pA', index: pA, color: 'blue', label: 'pA' });
          }
          if (switchB && pB >= 0 && pB < nodesA.length) {
            pointersA.push({ name: 'pB', index: pB, color: 'purple', label: 'pB' });
          }

          const pointersB = [];
          if (!switchB && pB >= 0 && pB < nodesB.length) {
            pointersB.push({ name: 'pB', index: pB, color: 'purple', label: 'pB' });
          }
          if (switchA && pA >= 0 && pA < nodesB.length) {
            pointersB.push({ name: 'pA', index: pA, color: 'blue', label: 'pA' });
          }

          // 节点自定义渲染
          const renderNode = (node: LinkedListNode, _index: number, isIntersection: boolean) => (
            <div
              className={`w-12 h-12 flex items-center justify-center border-2 rounded-lg font-bold transition-all duration-300 ${
                isIntersection
                  ? 'border-green-500 bg-green-100 text-green-700 scale-110 shadow-lg'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              {node.val}
            </div>
          );

          return (
            <div className="flex flex-col gap-8 p-4">
              {/* 链表 A */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    链表 A
                    {switchB && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">pB 已切换至此</span>}
                  </h4>
                </div>
                <LinkedListTemplate
                  nodes={nodesA}
                  pointers={pointersA}
                  renderNode={(node, i) => renderNode(node, i, node.val === intersection)}
                  className="bg-white/50"
                />
              </div>

              {/* 链表 B */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                    链表 B
                    {switchA && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">pA 已切换至此</span>}
                  </h4>
                </div>
                <LinkedListTemplate
                  nodes={nodesB}
                  pointers={pointersB}
                  renderNode={(node, i) => renderNode(node, i, node.val === intersection)}
                  className="bg-white/50"
                />
              </div>

              {/* 状态说明 */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className={`p-4 rounded-lg border ${switchA ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-sm text-gray-500">指针 pA 状态</div>
                  <div className="font-semibold text-gray-800">
                    {switchA ? '正在遍历 链表 B' : '正在遍历 链表 A'}
                  </div>
                </div>
                <div className={`p-4 rounded-lg border ${switchB ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-sm text-gray-500">指针 pB 状态</div>
                  <div className="font-semibold text-gray-800">
                    {switchB ? '正在遍历 链表 A' : '正在遍历 链表 B'}
                  </div>
                </div>
              </div>

              {intersection !== undefined && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <span className="text-green-700 font-bold text-lg">
                    ✓ 找到相交点：{intersection}
                  </span>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
};

export default IntersectionListVisualizer;
