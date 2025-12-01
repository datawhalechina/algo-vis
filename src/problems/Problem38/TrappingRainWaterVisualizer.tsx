import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateTrappingRainWaterSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface TrappingRainWaterInput extends ProblemInput {
  height: number[];
}

function TrappingRainWaterVisualizer() {
  return (
    <ConfigurableVisualizer<TrappingRainWaterInput, { height?: number[] }>
      config={{
        defaultInput: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] },
        algorithm: (input) => generateTrappingRainWaterSteps(input.height),
        
        inputTypes: [
          { type: "array", key: "height", label: "height" },
        ],
        inputFields: [
          { type: "array", key: "height", label: "高度数组", placeholder: "输入数字，用逗号分隔" },
        ],
        testCases: [
          { label: "示例 1", value: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] } },
          { label: "示例 2", value: { height: [4, 2, 0, 3, 2, 5] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as TrappingRainWaterInput;
          const height = input.height;
          const water = variables?.water as number[] | undefined;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const totalWater = variables?.totalWater as number | undefined;
          const coreIdea = getProblemCoreIdea(38);

          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">接雨水（双指针）</h3>

                <div className="mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">总接水量</div>
                    <div className="text-4xl font-bold text-blue-600">
                      {totalWater ?? 0} 单位
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-center gap-1 min-h-[400px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {height.map((h, index) => {
                    const isLeft = left === index;
                    const isRight = right === index;
                    const waterHeight = water ? water[index] : 0;

                    return (
                      <div
                        key={index}
                        className="flex flex-col-reverse items-center relative"
                        style={{ width: '40px' }}
                      >
                        {/* 水 */}
                        {waterHeight > 0 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${waterHeight * 35}px` }}
                            className="w-full bg-gradient-to-t from-blue-400 to-cyan-300 opacity-60 absolute bottom-0"
                            style={{ 
                              bottom: `${h * 35}px`,
                              zIndex: 1
                            }}
                          />
                        )}

                        {/* 柱子 */}
                        <motion.div
                          className={`w-full transition-all duration-300 ${
                            isLeft || isRight
                              ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-200"
                              : "bg-gradient-to-t from-gray-600 to-gray-500"
                          }`}
                          style={{ 
                            height: `${h * 35}px`,
                            position: 'relative',
                            zIndex: 2
                          }}
                        >
                          <div className="text-white text-xs font-bold text-center pt-1">
                            {h}
                          </div>
                        </motion.div>

                        {/* 指针标记 */}
                        {(isLeft || isRight) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`absolute -top-8 text-xs font-bold px-2 py-1 rounded-full ${
                              isLeft ? "bg-blue-500 text-white" : "bg-purple-500 text-white"
                            }`}
                            style={{ zIndex: 10 }}
                          >
                            {isLeft ? "L" : "R"}
                          </motion.div>
                        )}

                        {/* 索引 */}
                        <div className="text-xs text-gray-500 mt-1">
                          {index}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-gray-600 to-gray-500"></div>
                    <span className="text-gray-700">柱子高度</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-blue-400 to-cyan-300 opacity-60"></div>
                    <span className="text-gray-700">雨水</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-t from-yellow-500 to-yellow-400"></div>
                    <span className="text-gray-700">当前指针</span>
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

export default TrappingRainWaterVisualizer;
