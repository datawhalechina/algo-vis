import { Calculator } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { DualHeapTemplate } from "@/components/visualizers/templates/DualHeapTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateMedianFinderSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface MedianFinderInput extends ProblemInput {
  operations: Array<{ type: 'addNum' | 'findMedian'; value?: number }>;
}

function MedianFinderVisualizer() {
  return (
    <ConfigurableVisualizer<MedianFinderInput, Record<string, never>>
      config={{
        defaultInput: { operations: [
          { type: 'addNum', value: 1 },
          { type: 'addNum', value: 2 },
          { type: 'findMedian' },
          { type: 'addNum', value: 3 },
          { type: 'findMedian' },
        ]},
        algorithm: (input) => generateMedianFinderSteps(input.operations),
        
        inputTypes: [],
        inputFields: [
          { type: "string", key: "operations", label: "操作序列（JSON格式）", placeholder: '例如: [{"type":"addNum","value":1},{"type":"findMedian"}]' },
        ],
        testCases: [
          { label: "示例 1", value: { operations: [
            { type: 'addNum', value: 1 },
            { type: 'addNum', value: 2 },
            { type: 'findMedian' },
            { type: 'addNum', value: 3 },
            { type: 'findMedian' },
          ]}},
        ],
        
        render: ({ variables }) => {
          const maxHeap = variables?.maxHeap as number[] | undefined;
          const minHeap = variables?.minHeap as number[] | undefined;
          const operation = variables?.operation as { type: string; value?: number } | undefined;
          const median = variables?.median as number | undefined;
          const coreIdea = getProblemCoreIdea(122);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Calculator size={20} className="text-blue-600" />
                  数据流的中位数（双堆）
                </h3>
                <p className="text-sm text-gray-600">
                  使用两个堆维护数据流：最大堆存较小的一半，最小堆存较大的一半，随时可以计算中位数。
                </p>
              </div>

              {/* 双堆可视化 - 使用 DualHeapTemplate */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <DualHeapTemplate
                  maxHeap={maxHeap || []}
                  minHeap={minHeap || []}
                  layout={{ nodeSize: 60, gap: 12, direction: "vertical" }}
                  showLabels={true}
                  showBalance={true}
                />
              </div>

              {/* 当前操作 */}
              {operation && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">当前操作</h4>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="text-lg font-bold text-yellow-700">
                      {operation.type === 'addNum' ? `添加数字: ${operation.value}` : '查找中位数'}
                    </div>
                  </div>
                </div>
              )}

              {/* 中位数结果 */}
              {median !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-2xl">
                      中位数 = {median}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default MedianFinderVisualizer;

