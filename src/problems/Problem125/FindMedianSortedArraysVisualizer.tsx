import { Divide } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { DualArrayBinarySearchTemplate } from "@/components/visualizers/templates/DualArrayBinarySearchTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateFindMedianSortedArraysSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface FindMedianSortedArraysInput extends ProblemInput {
  nums1: number[];
  nums2: number[];
}

function FindMedianSortedArraysVisualizer() {
  return (
    <ConfigurableVisualizer<FindMedianSortedArraysInput, Record<string, never>>
      config={{
        defaultInput: { nums1: [1, 3], nums2: [2] },
        algorithm: (input) => generateFindMedianSortedArraysSteps(input.nums1, input.nums2),
        
        inputTypes: [
          { type: "array", key: "nums1", label: "nums1" },
          { type: "array", key: "nums2", label: "nums2" },
        ],
        inputFields: [
          { type: "array", key: "nums1", label: "数组 nums1", placeholder: "输入数字，用逗号分隔，如: 1,3" },
          { type: "array", key: "nums2", label: "数组 nums2", placeholder: "输入数字，用逗号分隔，如: 2" },
        ],
        testCases: [
          { label: "示例 1", value: { nums1: [1, 3], nums2: [2] } },
          { label: "示例 2", value: { nums1: [1, 2], nums2: [3, 4] } },
          { label: "示例 3", value: { nums1: [0, 0], nums2: [0, 0] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as FindMedianSortedArraysInput;
          const nums1 = input.nums1;
          const nums2 = input.nums2;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const partition1 = variables?.partition1 as number | undefined;
          const partition2 = variables?.partition2 as number | undefined;
          const maxLeft1 = variables?.maxLeft1 as number | undefined;
          const minRight1 = variables?.minRight1 as number | undefined;
          const maxLeft2 = variables?.maxLeft2 as number | undefined;
          const minRight2 = variables?.minRight2 as number | undefined;
          const median = variables?.median as number | undefined;
          const found = variables?.found as boolean | undefined;
          const coreIdea = getProblemCoreIdea(125);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Divide size={20} className="text-blue-600" />
                  寻找两个正序数组的中位数（二分查找）
                </h3>
                <p className="text-sm text-gray-600">
                  在较短的数组中寻找分割点，使得分割点左侧的元素都小于等于分割点右侧的元素。
                </p>
              </div>

              {/* 状态信息 */}
              {(left !== undefined || right !== undefined || partition1 !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">二分查找状态</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {left !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">left</div>
                        <div className="text-2xl font-bold text-blue-600">{left}</div>
                      </div>
                    )}
                    {right !== undefined && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">right</div>
                        <div className="text-2xl font-bold text-purple-600">{right}</div>
                      </div>
                    )}
                    {partition1 !== undefined && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-xs text-gray-600 mb-1">partition1</div>
                        <div className="text-2xl font-bold text-green-600">{partition1}</div>
                      </div>
                    )}
                  </div>
                  {partition2 !== undefined && (
                    <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="text-xs text-gray-600 mb-1">partition2</div>
                      <div className="text-xl font-bold text-yellow-600">{partition2}</div>
                    </div>
                  )}
                </div>
              )}

              {/* 边界值信息 */}
              {(maxLeft1 !== undefined || maxLeft2 !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">分割点边界值</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-xs text-gray-600 mb-2">数组1边界</div>
                      <div className="text-sm">
                        <div>maxLeft1 = {maxLeft1 === -Infinity ? '-∞' : maxLeft1}</div>
                        <div>minRight1 = {minRight1 === Infinity ? '+∞' : minRight1}</div>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="text-xs text-gray-600 mb-2">数组2边界</div>
                      <div className="text-sm">
                        <div>maxLeft2 = {maxLeft2 === -Infinity ? '-∞' : maxLeft2}</div>
                        <div>minRight2 = {minRight2 === Infinity ? '+∞' : minRight2}</div>
                      </div>
                    </div>
                  </div>
                  {maxLeft1 !== undefined && maxLeft2 !== undefined && minRight1 !== undefined && minRight2 !== undefined && (
                    <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-600 mb-1">条件检查</div>
                      <div className="text-sm">
                        maxLeft1 ≤ minRight2: {maxLeft1 <= minRight2 ? '✓' : '✗'} ({maxLeft1} ≤ {minRight2 === Infinity ? '+∞' : minRight2})
                        <br />
                        maxLeft2 ≤ minRight1: {maxLeft2 <= minRight1 ? '✓' : '✗'} ({maxLeft2} ≤ {minRight1 === Infinity ? '+∞' : minRight1})
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 双数组可视化 - 使用 DualArrayBinarySearchTemplate */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <DualArrayBinarySearchTemplate
                  array1={nums1}
                  array2={nums2}
                  partition1={partition1}
                  partition2={partition2}
                  layout={{ gap: 16, direction: "vertical" }}
                  showLabels={true}
                  showPartition={true}
                  showMerged={true}
                />
              </div>

              {found && median !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-2xl">
                      ✓ 找到中位数 = {median}
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

export default FindMedianSortedArraysVisualizer;

