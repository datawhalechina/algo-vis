import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateThreeSumSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface ThreeSumInput extends ProblemInput {
  nums: number[];
}

function ThreeSumVisualizer() {
  return (
    <ConfigurableVisualizer<ThreeSumInput, {}>
      config={{
        defaultInput: { nums: [-1, 0, 1, 2, -1, -4] },
        algorithm: (input) => generateThreeSumSteps(input.nums),

        inputTypes: [{ type: "array", key: "nums", label: "数组" }],
        inputFields: [
          {
            type: "array",
            key: "nums",
            label: "数组 nums",
            placeholder: "输入数字，用逗号分隔，如: -1,0,1,2,-1,-4",
          },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [-1, 0, 1, 2, -1, -4] } },
          { label: "示例 2", value: { nums: [0, 1, 1] } },
          { label: "示例 3", value: { nums: [0, 0, 0] } },
        ],

        render: ({ getNumberVariable, variables, visualization }) => {
          const input = visualization.input as ThreeSumInput;
          const i = getNumberVariable('i');
          const left = getNumberVariable('left');
          const right = getNumberVariable('right');
          const sum = getNumberVariable('sum');
          const sortedNums = variables?.sortedNums as number[] | undefined;
          const result = variables?.result as number[][] | undefined;

          const displayNums = sortedNums || input.nums;

          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">三数之和 - 排序+双指针</h3>

                <div className="flex flex-wrap items-end justify-center gap-2 min-h-[180px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {displayNums.map((value: number, index: number) => {
                    const isFixed = i === index;
                    const isLeft = left === index;
                    const isRight = right === index;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        animate={{ scale: isFixed || isLeft || isRight ? 1.1 : 1 }}
                      >
                        {isFixed && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-500 text-white">
                            固定
                          </span>
                        )}
                        {isLeft && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500 text-white">
                            Left
                          </span>
                        )}
                        {isRight && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-500 text-white">
                            Right
                          </span>
                        )}

                        <div
                          className={`text-sm font-bold ${
                            isFixed
                              ? "text-purple-600"
                              : isLeft
                              ? "text-blue-600"
                              : isRight
                              ? "text-orange-600"
                              : "text-gray-600"
                          }`}
                        >
                          {value}
                        </div>

                        <div
                          className={`w-14 rounded-lg flex items-center justify-center p-3 font-bold ${
                            isFixed
                              ? "bg-gradient-to-t from-purple-500 to-purple-400 text-white"
                              : isLeft
                              ? "bg-gradient-to-t from-blue-500 to-blue-400 text-white"
                              : isRight
                              ? "bg-gradient-to-t from-orange-500 to-orange-400 text-white"
                              : sum === 0 && (i === index || left === index || right === index)
                              ? "bg-gradient-to-t from-green-500 to-green-400 text-white"
                              : "bg-gradient-to-t from-gray-400 to-gray-300 text-white"
                          }`}
                          style={{ height: `${Math.max(50, Math.abs(value) * 8 + 40)}px` }}
                        >
                          {value}
                        </div>

                        <div className="text-xs font-semibold text-gray-500">[{index}]</div>
                      </motion.div>
                    );
                  })}
                </div>

                {sum !== undefined && (
                  <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="font-semibold text-gray-700">当前和：</span>
                      <span className="font-mono text-blue-700 font-bold text-lg">{sum}</span>
                      <span className="text-gray-600">
                        {sum === 0 ? "✓ 找到答案！" : sum < 0 ? "→ left++" : "→ right--"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {result && result.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">找到的三元组</h3>
                  <div className="flex flex-wrap gap-3">
                    {result.map((triplet, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-100 border-2 border-green-500 rounded-lg px-4 py-2 font-mono font-bold text-green-700"
                      >
                        [{triplet.join(", ")}]
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

export default ThreeSumVisualizer;
