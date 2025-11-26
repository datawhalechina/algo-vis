import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateLongestConsecutiveSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface LongestConsecutiveInput extends ProblemInput {
  nums: number[];
}

interface LongestConsecutiveData {
  nums?: number[];
}

function LongestConsecutiveVisualizer() {
  return (
    <ConfigurableVisualizer<LongestConsecutiveInput, LongestConsecutiveData>
      config={{
        defaultInput: { nums: [100, 4, 200, 1, 3, 2] },
        algorithm: (input) => generateLongestConsecutiveSteps(input.nums),

        inputTypes: [
          { type: "array", key: "nums", label: "数组" },
        ],
        inputFields: [
          {
            type: "array",
            key: "nums",
            label: "数组 nums",
            placeholder: "输入数字，用逗号分隔，如: 100,4,200,1,3,2",
          },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [100, 4, 200, 1, 3, 2] } },
          { label: "示例 2", value: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] } },
          { label: "示例 3", value: { nums: [1, 2, 0, 1] } },
        ],

        render: ({ getNumberVariable, variables, visualization }) => {
          const input = visualization.input as LongestConsecutiveInput;
          const maxLength = getNumberVariable('maxLength') ?? 0;
          const currentNum = getNumberVariable('currentNum');
          const startNum = getNumberVariable('num');
          const numSet = variables?.numSet as number[] | undefined;

          return (
            <>
              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">数组可视化 - 哈希集合法</h3>

                <div className="flex flex-wrap items-center justify-center gap-3 min-h-[180px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {input.nums.map((value: number, index: number) => {
                    const isCurrent = currentNum === value;
                    const isStart = startNum === value;
                    const inSequence =
                      startNum !== undefined &&
                      currentNum !== undefined &&
                      value >= startNum &&
                      value <= currentNum;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: 1,
                          scale: isCurrent || isStart ? 1.1 : 1,
                        }}
                      >
                        <motion.div
                          className={`text-sm font-bold ${
                            inSequence
                              ? "text-green-600"
                              : isCurrent
                              ? "text-yellow-600"
                              : "text-gray-600"
                          }`}
                        >
                          {value}
                        </motion.div>

                        <motion.div
                          className={`w-16 rounded-lg flex items-center justify-center p-3 font-bold ${
                            inSequence
                              ? "bg-gradient-to-t from-green-500 to-green-400 text-white"
                              : isCurrent
                              ? "bg-gradient-to-t from-yellow-500 to-yellow-400 text-white"
                              : "bg-gradient-to-t from-gray-400 to-gray-300 text-white"
                          }`}
                        >
                          {value}
                        </motion.div>

                        <div
                          className={`text-xs font-semibold ${
                            inSequence ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200 text-center">
                  <span className="font-semibold text-gray-700">最长连续序列长度：</span>
                  <span className="ml-2 font-mono text-blue-700 font-bold text-lg">{maxLength}</span>
                </div>
              </div>

              {/* 哈希集合可视化 */}
              {numSet && numSet.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">哈希集合（已排序）</h3>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-cyan-700">核心思想：</span>
                      将所有数字存入哈希集合，然后遍历集合，只从序列起点（num-1不在集合中）开始向后查找连续数字。
                      时间复杂度 O(n)。
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 bg-purple-50 p-4 rounded-lg border border-purple-200">
                    {numSet.map((num, idx) => {
                      const inSequence =
                        startNum !== undefined &&
                        currentNum !== undefined &&
                        num >= startNum &&
                        num <= currentNum;

                      return (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: inSequence ? 1.1 : 1 }}
                          className={`px-3 py-2 rounded font-mono font-bold ${
                            inSequence
                              ? "bg-green-500 text-white"
                              : "bg-white text-gray-700 border-2 border-purple-300"
                          }`}
                        >
                          {num}
                        </motion.span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default LongestConsecutiveVisualizer;
