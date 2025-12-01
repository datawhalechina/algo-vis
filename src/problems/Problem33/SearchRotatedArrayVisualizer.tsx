import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateSearchRotatedArraySteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface SearchRotatedArrayInput extends ProblemInput {
  nums: number[];
  target: number;
}

function SearchRotatedArrayVisualizer() {
  return (
    <ConfigurableVisualizer<SearchRotatedArrayInput, { nums?: number[]; target?: number }>
      config={{
        defaultInput: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 },
        algorithm: (input) => generateSearchRotatedArraySteps(input.nums, input.target),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "target", arrayLabel: "nums", numberLabel: "target" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔" },
          { type: "number", key: "target", label: "目标值 target", placeholder: "请输入目标值" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 } },
          { label: "示例 2", value: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 } },
          { label: "示例 3", value: { nums: [1], target: 0 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as SearchRotatedArrayInput;
          const nums = input.nums;
          const target = input.target;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const mid = variables?.mid as number | undefined;
          const result = variables?.result as number | undefined;
          const coreIdea = getProblemCoreIdea(33);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">搜索旋转排序数组</h3>

                <div className="flex items-end justify-center gap-3 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {nums.map((value, index) => {
                    const isLeft = left === index;
                    const isRight = right === index;
                    const isMid = mid === index;
                    const isResult = result === index;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: isMid || isResult ? 1.1 : 1
                        }}
                      >
                        {(isLeft || isRight || isMid) && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              isMid ? "bg-yellow-500 text-white" :
                              isLeft ? "bg-blue-500 text-white" :
                              "bg-purple-500 text-white"
                            }`}
                          >
                            {isMid ? "mid" : isLeft ? "left" : "right"}
                          </motion.div>
                        )}

                        <motion.div
                          className={`w-16 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                            isResult ? "bg-gradient-to-t from-green-500 to-green-400 shadow-lg shadow-green-200" :
                            isMid ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-200" :
                            isLeft || isRight ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-md shadow-blue-200" :
                            value === target ? "bg-gradient-to-t from-red-500 to-red-400" :
                            "bg-gradient-to-t from-gray-400 to-gray-300"
                          }`}
                          style={{ height: `${Math.max(60, Math.abs(value) * 15)}px` }}
                        >
                          <span className="text-white text-sm font-bold">{value}</span>
                        </motion.div>

                        <div className={`text-xs font-semibold ${
                          isResult ? "text-green-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {result !== undefined && result >= 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300"
                  >
                    <div className="text-center text-green-700 font-semibold">
                      ✓ 找到目标值！位置: {result}
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default SearchRotatedArrayVisualizer;
