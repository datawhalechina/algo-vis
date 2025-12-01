import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateSearchRangeSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface SearchRangeInput extends ProblemInput {
  nums: number[];
  target: number;
}

function SearchRangeVisualizer() {
  return (
    <ConfigurableVisualizer<SearchRangeInput, { nums?: number[]; target?: number }>
      config={{
        defaultInput: { nums: [5, 7, 7, 8, 8, 10], target: 8 },
        algorithm: (input) => generateSearchRangeSteps(input.nums, input.target),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "target", arrayLabel: "nums", numberLabel: "target" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔" },
          { type: "number", key: "target", label: "目标值 target", placeholder: "请输入目标值" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [5, 7, 7, 8, 8, 10], target: 8 } },
          { label: "示例 2", value: { nums: [5, 7, 7, 8, 8, 10], target: 6 } },
          { label: "示例 3", value: { nums: [], target: 0 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as SearchRangeInput;
          const nums = input.nums;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const mid = variables?.mid as number | undefined;
          const leftBound = variables?.leftBound as number | undefined;
          const rightBound = variables?.rightBound as number | undefined;
          const phase = variables?.phase as string | undefined;
          const coreIdea = getProblemCoreIdea(34);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">查找元素的第一个和最后一个位置</h3>

                {phase && (
                  <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-sm text-center font-semibold text-blue-700">
                      当前阶段：{phase === 'left' ? '查找左边界' : '查找右边界'}
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-center gap-3 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {nums.map((value, index) => {
                    const isLeft = left === index;
                    const isRight = right === index;
                    const isMid = mid === index;
                    const isLeftBound = leftBound === index;
                    const isRightBound = rightBound === index;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {(isMid || isLeftBound || isRightBound) && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              isMid ? "bg-yellow-500 text-white" :
                              isLeftBound && phase === 'left' ? "bg-green-500 text-white" :
                              isRightBound ? "bg-green-500 text-white" :
                              "bg-blue-500 text-white"
                            }`}
                          >
                            {isMid ? "mid" : isLeftBound && !isRightBound ? "左界" : isRightBound && !isLeftBound ? "右界" : isLeftBound && isRightBound ? "边界" : ""}
                          </motion.div>
                        )}

                        <motion.div
                          className={`w-16 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                            isLeftBound || isRightBound ? "bg-gradient-to-t from-green-500 to-green-400 shadow-lg shadow-green-200" :
                            isMid ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-200" :
                            isLeft || isRight ? "bg-gradient-to-t from-blue-500 to-blue-400" :
                            "bg-gradient-to-t from-gray-400 to-gray-300"
                          }`}
                          style={{ height: `${Math.max(60, Math.abs(value) * 15)}px` }}
                        >
                          <span className="text-white text-sm font-bold">{value}</span>
                        </motion.div>

                        <div className="text-xs font-semibold text-gray-500">
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {leftBound !== undefined && rightBound !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300"
                  >
                    <div className="text-center text-green-700 font-semibold">
                      ✓ 完成！范围: [{leftBound}, {rightBound}]
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

export default SearchRangeVisualizer;
