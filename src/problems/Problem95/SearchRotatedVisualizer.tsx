import { RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { searchRotatedArraySteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface SearchRotatedInput extends ProblemInput {
  nums: number[];
  target: number;
}

function SearchRotatedVisualizer() {
  return (
    <ConfigurableVisualizer<SearchRotatedInput, Record<string, any>>
      config={{
        defaultInput: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 },
        algorithm: (input) => searchRotatedArraySteps(input.nums, input.target),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "target", arrayLabel: "nums", numberLabel: "target" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "旋转数组 nums", placeholder: "输入旋转后的有序数组" },
          { type: "number", key: "target", label: "目标值 target", placeholder: "输入目标值" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 } },
          { label: "示例 2", value: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 } },
          { label: "示例 3", value: { nums: [1], target: 0 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as SearchRotatedInput;
          const nums = input.nums;
          const target = input.target;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const mid = variables?.mid as number | undefined;
          const result = variables?.result as number | undefined;

          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <RotateCw className="text-orange-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">搜索旋转排序数组</h3>
              </div>
              
              <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-orange-700">💡 核心思想：</span>
                  判断哪一半有序，在有序部分查找目标值。
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">目标: {target}</span>
                  {result !== undefined && (
                    <span className={`px-2 py-1 rounded font-bold ${
                      result >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      结果: {result}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-center flex-wrap">
                {nums.map((num, idx) => {
                  let bgColor = "bg-gray-100";
                  if (mid === idx) bgColor = "bg-orange-500 text-white";
                  else if (left !== undefined && right !== undefined && idx >= left && idx <= right) {
                    if (idx === left || idx === right) bgColor = "bg-blue-300";
                    else bgColor = "bg-blue-100";
                  }

                  return (
                    <motion.div
                      key={idx}
                      animate={{ scale: mid === idx ? 1.1 : 1 }}
                      className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center font-bold border-2 border-gray-300 ${bgColor}`}
                    >
                      <div className="text-xs text-gray-600">{idx}</div>
                      <div className="text-lg">{num}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default SearchRotatedVisualizer;
