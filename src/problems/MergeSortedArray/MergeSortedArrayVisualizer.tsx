import { generateMergeSortedArraySteps } from "./algorithm";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useVisualization } from "@/hooks/useVisualization";
import { VisualizationLayout } from "@/components/visualizers/VisualizationLayout";
import {
  getNumberVariable,
  getBooleanVariable,
  StepVariables,
} from "@/types/visualization";

interface MergeSortedArrayInput {
  nums1: number[];
  m: number;
  nums2: number[];
  n: number;
}

function MergeSortedArrayVisualizer() {
  const visualization = useVisualization<MergeSortedArrayInput>(
    (input) => generateMergeSortedArraySteps(input.nums1, input.m, input.nums2, input.n),
    { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 }
  );

  const currentNums1 = (visualization.currentStepData?.data as { nums1: number[]; nums2: number[] })?.nums1 || visualization.input.nums1;
  const currentNums2 = (visualization.currentStepData?.data as { nums1: number[]; nums2: number[] })?.nums2 || visualization.input.nums2;
  
  const variables = visualization.currentStepData?.variables;
  const p1 = getNumberVariable(variables, 'p1');
  const p2 = getNumberVariable(variables, 'p2');
  const p = getNumberVariable(variables, 'p');
  const movedFrom = variables?.movedFrom as string | undefined;
  const completed = getBooleanVariable(variables, 'completed');

  // 自定义变量显示
  const customVariables = (variables: StepVariables) => {
    const p1 = getNumberVariable(variables, 'p1');
    const p2 = getNumberVariable(variables, 'p2');
    const p = getNumberVariable(variables, 'p');
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="text-sm">
          <span className="font-mono text-blue-600 font-semibold">p1</span>
          <span className="text-gray-500"> = </span>
          <span className="font-mono text-gray-800 font-semibold">{p1 !== undefined ? p1 : "N/A"}</span>
        </div>
        <div className="text-sm">
          <span className="font-mono text-purple-600 font-semibold">p2</span>
          <span className="text-gray-500"> = </span>
          <span className="font-mono text-gray-800 font-semibold">{p2 !== undefined ? p2 : "N/A"}</span>
        </div>
        <div className="text-sm">
          <span className="font-mono text-green-600 font-semibold">p</span>
          <span className="text-gray-500"> = </span>
          <span className="font-mono text-gray-800 font-semibold">{p !== undefined ? p : "N/A"}</span>
        </div>
      </div>
    );
  };

  return (
    <VisualizationLayout
      visualization={visualization}
      inputTypes={[
        { type: "array-and-number-m", arrayKey: "nums1", numberKey: "m", arrayLabel: "nums1", numberLabel: "m" },
        { type: "array-and-number", arrayKey: "nums2", numberKey: "n", arrayLabel: "nums2", numberLabel: "n" },
      ]}
      inputFields={[
        { type: "array", key: "nums1", label: "nums1 (包含末尾的0)", placeholder: "如: 1,2,3,0,0,0" },
        { type: "number", key: "m", label: "m (nums1 有效元素个数)", placeholder: "如: 3" },
        { type: "array", key: "nums2", label: "nums2", placeholder: "如: 2,5,6" },
        { type: "number", key: "n", label: "n (nums2 元素个数)", placeholder: "如: 3" },
      ]}
      testCases={[
        { label: "示例 1", value: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 } },
        { label: "示例 2", value: { nums1: [1], m: 1, nums2: [], n: 0 } },
        { label: "示例 3", value: { nums1: [0], m: 0, nums2: [1], n: 1 } },
      ]}
      customStepVariables={customVariables}
    >

        {/* 双数组可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            双指针从后向前合并
          </h3>

          {/* nums1 数组 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                nums1（合并目标数组）
              </h4>
              {p1 !== undefined && p1 >= 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                  p1 = {p1}
                </span>
              )}
              {p !== undefined && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  p = {p}
                </span>
              )}
            </div>
            <div className="flex items-end justify-center gap-2 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
              {currentNums1.map((value, index) => {
                const isP1 = p1 === index;
                const isP = p === index;
                const isValid = index < visualization.input.m;

                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    {/* 指针标记 */}
                    <AnimatePresence>
                      {(isP1 || isP) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="relative"
                        >
                          <ArrowDown
                            className={`${
                              isP1 ? "text-blue-600" : "text-green-600"
                            }`}
                            size={20}
                          />
                          <span
                            className={`absolute -top-1 -right-1 text-xs font-bold ${
                              isP1
                                ? "text-blue-600"
                                : isP
                                ? "text-green-600"
                                : ""
                            }`}
                          >
                            {isP1 ? "p1" : "p"}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 值显示 */}
                    <motion.div
                      className={`text-sm font-bold ${
                        completed
                          ? "text-green-600"
                          : isP
                          ? "text-green-600"
                          : isP1
                          ? "text-blue-600"
                          : value === 0 && !isValid
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                      animate={{
                        scale: isP1 || isP ? 1.2 : 1,
                      }}
                    >
                      {value}
                    </motion.div>

                    {/* 柱状图 */}
                    <motion.div
                      className={`w-12 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                        completed
                          ? "bg-gradient-to-t from-green-500 to-green-400 shadow-md"
                          : isP
                          ? "bg-gradient-to-t from-green-500 to-green-400 shadow-lg shadow-green-200"
                          : isP1
                          ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-lg shadow-blue-200"
                          : value === 0 && !isValid
                          ? "bg-gradient-to-t from-gray-200 to-gray-100 border-2 border-dashed border-gray-300"
                          : "bg-gradient-to-t from-indigo-400 to-indigo-300"
                      }`}
                      style={{
                        height: `${
                          value === 0 && !isValid
                            ? 60
                            : Math.max(60, Math.abs(value) * 15)
                        }px`,
                      }}
                      animate={{
                        scale: isP1 || isP ? 1.05 : 1,
                      }}
                    >
                      <span className="text-white text-sm font-bold">
                        {value}
                      </span>
                    </motion.div>

                    {/* 索引 */}
                    <div
                      className={`text-xs font-semibold ${
                        completed
                          ? "text-green-600"
                          : isP
                          ? "text-green-600"
                          : isP1
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      [{index}]
                    </div>

                    {/* 区域标识 */}
                    {index === visualization.input.m - 1 && !completed && (
                      <div className="absolute mt-[280px] text-xs text-gray-500 font-semibold">
                        ← 有效元素
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 移动动画指示 */}
          {movedFrom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-lg border border-purple-200">
                <span className="font-semibold text-purple-700">
                  {movedFrom === "nums1" ? "从 nums1 移动" : "从 nums2 移动"}
                </span>
                <ArrowDown className="text-purple-500" size={20} />
              </div>
            </motion.div>
          )}

          {/* nums2 数组 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                nums2（源数组）
              </h4>
              {p2 !== undefined && p2 >= 0 && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                  p2 = {p2}
                </span>
              )}
            </div>
            <div className="flex items-end justify-center gap-2 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
              {currentNums2.map((value, index) => {
                const isP2 = p2 === index;
                const isProcessed = p2 !== undefined && index > p2;

                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    {/* 指针标记 */}
                    <AnimatePresence>
                      {isP2 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="relative"
                        >
                          <ArrowDown className="text-purple-600" size={20} />
                          <span className="absolute -top-1 -right-1 text-xs font-bold text-purple-600">
                            p2
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 值显示 */}
                    <motion.div
                      className={`text-sm font-bold ${
                        isProcessed
                          ? "text-gray-400 line-through"
                          : isP2
                          ? "text-purple-600"
                          : "text-gray-700"
                      }`}
                      animate={{
                        scale: isP2 ? 1.2 : 1,
                      }}
                    >
                      {value}
                    </motion.div>

                    {/* 柱状图 */}
                    <motion.div
                      className={`w-12 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                        isProcessed
                          ? "bg-gradient-to-t from-gray-300 to-gray-200 opacity-40"
                          : isP2
                          ? "bg-gradient-to-t from-purple-500 to-purple-400 shadow-lg shadow-purple-200"
                          : "bg-gradient-to-t from-pink-400 to-pink-300"
                      }`}
                      style={{
                        height: `${Math.max(60, Math.abs(value) * 15)}px`,
                      }}
                      animate={{
                        scale: isP2 ? 1.05 : 1,
                      }}
                    >
                      <span className="text-white text-sm font-bold">
                        {value}
                      </span>
                    </motion.div>

                    {/* 索引 */}
                    <div
                      className={`text-xs font-semibold ${
                        isP2 ? "text-purple-600" : "text-gray-500"
                      }`}
                    >
                      [{index}]
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 图例 */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
              <span className="text-gray-700">p1 (nums1 指针)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-purple-500 to-purple-400 rounded"></div>
              <span className="text-gray-700">p2 (nums2 指针)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
              <span className="text-gray-700">p (合并位置)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-gray-200 to-gray-100 border-2 border-dashed border-gray-300 rounded"></div>
              <span className="text-gray-700">待填充位置</span>
            </div>
          </div>
        </div>

        {/* 算法核心思想 */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-5 border border-cyan-200">
          <h3 className="text-lg font-semibold text-cyan-900 mb-3">
            💡 核心思想
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold mt-1">•</span>
              <span>
                <strong className="text-cyan-800">从后向前：</strong>
                避免覆盖 nums1 中未处理的元素
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold mt-1">•</span>
              <span>
                <strong className="text-cyan-800">三个指针：</strong>
                p1 指向 nums1 有效元素末尾，p2 指向 nums2 末尾，p 指向合并位置末尾
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold mt-1">•</span>
              <span>
                <strong className="text-cyan-800">每次选择较大值：</strong>
                比较 nums1[p1] 和 nums2[p2]，将较大值放到 nums1[p]
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold mt-1">•</span>
              <span>
                <strong className="text-cyan-800">终止条件：</strong>
                当 p2 &lt; 0 时，nums2 的所有元素都已处理完
              </span>
            </li>
          </ul>
        </div>
    </VisualizationLayout>
  );
}

export default MergeSortedArrayVisualizer;

