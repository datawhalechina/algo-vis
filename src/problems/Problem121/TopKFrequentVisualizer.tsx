import { TrendingUp } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateTopKFrequentSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface TopKFrequentInput extends ProblemInput {
  nums: number[];
  k: number;
}

function TopKFrequentVisualizer() {
  return (
    <ConfigurableVisualizer<TopKFrequentInput, Record<string, never>>
      config={{
        defaultInput: { nums: [1, 1, 1, 2, 2, 3], k: 2 },
        algorithm: (input) => generateTopKFrequentSteps(input.nums, input.k),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "k", arrayLabel: "nums", numberLabel: "k" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,1,1,2,2,3" },
          { type: "number", key: "k", label: "k", placeholder: "请输入k值" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 1, 1, 2, 2, 3], k: 2 } },
          { label: "示例 2", value: { nums: [1], k: 1 } },
          { label: "示例 3", value: { nums: [4, 1, -1, 2, -1, 2, 3], k: 2 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as TopKFrequentInput;
          const nums = input.nums;
          const k = input.k;
          const freq = variables?.freq as Map<number, number> | undefined;
          const heap = variables?.heap as number[] | undefined;
          const current = variables?.current as number | undefined;
          const processing = variables?.processing as number | undefined;
          const finished = variables?.finished as boolean | undefined;
          const result = variables?.result as number[] | undefined;
          const coreIdea = getProblemCoreIdea(121);
          
          // 计算频率
          const frequencyMap = new Map<number, number>();
          if (freq) {
            freq.forEach((count, num) => frequencyMap.set(num, count));
          } else {
            nums.forEach(num => {
              frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
            });
          }
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  前 K 个高频元素（哈希表 + 最小堆）
                </h3>
                <p className="text-sm text-gray-600">
                  先用哈希表统计频率，然后使用最小堆维护频率最高的k个元素。
                </p>
              </div>

              {/* 频率统计 */}
              {frequencyMap.size > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">频率统计</h4>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from(frequencyMap.entries()).map(([num, count]) => (
                      <motion.div
                        key={num}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-4 py-2 rounded-lg font-bold ${
                          processing === num
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white scale-110"
                            : heap?.includes(num)
                            ? "bg-gradient-to-br from-green-400 to-green-500 text-white"
                            : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700"
                        }`}
                      >
                        {num}: {count}次
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 堆状态 */}
              {heap && heap.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">最小堆（频率最高的k个元素）</h4>
                  <div className="flex gap-2 flex-wrap">
                    {heap.map((num, idx) => {
                      const count = frequencyMap.get(num) || 0;
                      const isTop = idx === 0;
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`px-4 py-2 rounded-lg font-bold ${
                            isTop
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white scale-110"
                              : "bg-gradient-to-br from-blue-400 to-blue-500 text-white"
                          }`}
                        >
                          {num} ({count})
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">数组状态</h4>
                <ArrayTemplate
                  data={nums}
                  renderItem={(item, index) => {
                    const isCurrent = current === index;
                    const count = frequencyMap.get(item as number) || 0;
                    const inHeap = heap?.includes(item as number);
                    
                    return (
                      <motion.div
                        className="relative flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* 标签 */}
                        {isCurrent && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-500 text-white"
                          >
                            当前
                          </motion.div>
                        )}

                        {/* 元素 */}
                        <motion.div
                          className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold text-white text-lg transition-all ${
                            isCurrent
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-110 shadow-lg"
                              : inHeap
                              ? "bg-gradient-to-br from-green-400 to-green-500 shadow-md"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                          animate={{
                            scale: isCurrent ? 1.1 : 1,
                          }}
                        >
                          <div>{item}</div>
                          <div className="text-xs mt-0.5">×{count}</div>
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isCurrent ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  }}
                  getItemState={(index) => {
                    const isCurrent = current === index;
                    const item = nums[index];
                    const inHeap = heap?.includes(item);
                    
                    return {
                      index,
                      isActive: isCurrent,
                      isHighlighted: inHeap,
                    };
                  }}
                  layout={{ gap: "0.75rem", direction: "row", wrap: false }}
                />
              </div>

              {finished && result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-lg">
                      ✓ 完成！前 {k} 个高频元素为 [{result.join(', ')}]
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 图例 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">图例说明</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">当前位置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-gray-700">在堆中</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-500 rounded"></div>
                    <span className="text-gray-700">普通元素</span>
                  </div>
                </div>
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default TopKFrequentVisualizer;

