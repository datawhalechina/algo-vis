import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateMaxSlidingWindowSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface MaxSlidingWindowInput extends ProblemInput {
  nums: number[];
  k: number;
}

function MaxSlidingWindowVisualizer() {
  return (
    <ConfigurableVisualizer<MaxSlidingWindowInput, {}>
      config={{
        defaultInput: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
        algorithm: (input) => generateMaxSlidingWindowSteps(input.nums, input.k),

        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "k", arrayLabel: "nums", numberLabel: "k" },
        ],
        inputFields: [
          {
            type: "array",
            key: "nums",
            label: "数组 nums",
            placeholder: "输入数字，用逗号分隔，如: 1,3,-1,-3,5,3,6,7",
          },
          {
            type: "number",
            key: "k",
            label: "窗口大小 k",
            placeholder: "请输入窗口大小",
          },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 } },
          { label: "示例 2", value: { nums: [1], k: 1 } },
        ],

        render: ({ getNumberVariable, variables, visualization }) => {
          const input = visualization.input as MaxSlidingWindowInput;
          const i = getNumberVariable('i');
          const windowStart = getNumberVariable('windowStart');
          const windowEnd = getNumberVariable('windowEnd');
          const deque = variables?.deque as number[] | undefined;
          const result = variables?.result as number[] | undefined;
          const maxVal = getNumberVariable('maxVal');

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  滑动窗口最大值 - 单调队列
                </h3>

                <div className="flex items-end justify-center gap-2 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {input.nums.map((value: number, index: number) => {
                    const inWindow =
                      windowStart !== undefined &&
                      windowEnd !== undefined &&
                      index >= windowStart &&
                      index <= windowEnd;
                    const inDeque = deque?.includes(index);
                    const isMax = deque?.[0] === index;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        animate={{
                          scale: inWindow ? 1.05 : 1,
                        }}
                      >
                        {isMax && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-500 text-white">
                            MAX
                          </span>
                        )}

                        <div
                          className={`text-sm font-bold ${
                            isMax
                              ? "text-green-600"
                              : inDeque
                              ? "text-purple-600"
                              : inWindow
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        >
                          {value}
                        </div>

                        <div
                          className={`w-14 rounded-lg flex items-center justify-center p-3 font-bold ${
                            isMax
                              ? "bg-gradient-to-t from-green-500 to-green-400 text-white shadow-lg"
                              : inDeque
                              ? "bg-gradient-to-t from-purple-500 to-purple-400 text-white"
                              : inWindow
                              ? "bg-gradient-to-t from-blue-500 to-blue-400 text-white"
                              : "bg-gradient-to-t from-gray-400 to-gray-300 text-white"
                          }`}
                          style={{
                            height: `${Math.max(50, Math.abs(value) * 8 + 40)}px`,
                          }}
                        >
                          {value}
                        </div>

                        <div
                          className={`text-xs font-semibold ${
                            inWindow ? "text-blue-600" : "text-gray-500"
                          }`}
                        >
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {windowStart !== undefined && windowEnd !== undefined && (
                  <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="font-semibold text-gray-700">
                        当前窗口：[{windowStart}, {windowEnd}]
                      </span>
                      {maxVal !== undefined && (
                        <>
                          <span className="text-gray-400">|</span>
                          <span className="font-semibold text-gray-700">最大值：</span>
                          <span className="font-mono text-green-700 font-bold text-lg">{maxVal}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 单调队列可视化 */}
              {deque && deque.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">单调队列（递减）</h3>

                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-cyan-700">核心思想：</span>
                      队列保持递减顺序，队首元素是当前窗口的最大值。时间复杂度 O(n)。
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <span className="text-sm font-semibold text-gray-600">队首</span>
                    <span className="text-gray-400">→</span>
                    {deque.map((idx, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`px-4 py-2 rounded-lg font-mono font-bold ${
                          i === 0
                            ? "bg-green-500 text-white shadow-lg"
                            : "bg-white border-2 border-purple-300 text-purple-700"
                        }`}
                      >
                        [{idx}]={input.nums[idx]}
                      </motion.div>
                    ))}
                    <span className="text-gray-400">→</span>
                    <span className="text-sm font-semibold text-gray-600">队尾</span>
                  </div>
                </div>
              )}

              {/* 结果数组 */}
              {result && result.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">结果数组</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.map((val, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-4 py-2 rounded-lg font-mono font-bold bg-green-100 border-2 border-green-500 text-green-700"
                      >
                        {val}
                      </motion.div>
                    ))}
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

export default MaxSlidingWindowVisualizer;
