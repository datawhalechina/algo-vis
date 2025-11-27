import { Search } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { searchInsertSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface SearchInsertInput extends ProblemInput {
  nums: number[];
  target: number;
}

function SearchInsertVisualizer() {
  return (
    <ConfigurableVisualizer<SearchInsertInput, Record<string, any>>
      config={{
        defaultInput: { nums: [1, 3, 5, 6], target: 5 },
        algorithm: (input) => searchInsertSteps(input.nums, input.target),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "target", arrayLabel: "nums", numberLabel: "target" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入有序数组，用逗号分隔" },
          { type: "number", key: "target", label: "目标值 target", placeholder: "输入目标值" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 3, 5, 6], target: 5 } },
          { label: "示例 2", value: { nums: [1, 3, 5, 6], target: 2 } },
          { label: "示例 3", value: { nums: [1, 3, 5, 6], target: 7 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as SearchInsertInput;
          const nums = input.nums;
          const target = input.target;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const mid = variables?.mid as number | undefined;
          const result = variables?.result as number | undefined;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">搜索插入位置（二分查找）</h3>
                </div>
                
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-blue-700">💡 核心思想：</span>
                    使用二分查找在有序数组中定位目标值或插入位置，时间复杂度O(log n)。
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">目标值: {target}</span>
                    {result !== undefined && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-bold">
                        结果: {result}
                      </span>
                    )}
                  </div>
                </div>

                <ArrayTemplate
                  data={nums}
                  renderCell={(value, index) => (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">索引 {index}</div>
                      <div className="font-bold text-lg">{value}</div>
                    </div>
                  )}
                  getCellState={(index) => {
                    if (mid === index) return "active";
                    if (left !== undefined && right !== undefined) {
                      if (index < left || index > right) return "inactive";
                      if (index === left || index === right) return "highlight";
                    }
                    return "default";
                  }}
                  layout={{
                    direction: "horizontal",
                    gap: "medium",
                    itemSize: "large",
                  }}
                  animation={{
                    enabled: true,
                    duration: 0.3,
                  }}
                />

                {left !== undefined && right !== undefined && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-sm space-y-1">
                      <div><span className="font-semibold">Left指针:</span> {left}</div>
                      <div><span className="font-semibold">Right指针:</span> {right}</div>
                      {mid !== undefined && <div><span className="font-semibold">Mid位置:</span> {mid} (值={nums[mid]})</div>}
                      <div className="text-xs text-gray-600 mt-2">
                        搜索范围: [{left}, {right}]
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default SearchInsertVisualizer;
