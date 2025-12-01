import { BarChart3 } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { StackTemplate } from "@/components/visualizers/templates/StackTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateLargestRectangleAreaSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface LargestRectangleAreaInput extends ProblemInput {
  heights: number[];
}

function LargestRectangleAreaVisualizer() {
  return (
    <ConfigurableVisualizer<LargestRectangleAreaInput, Record<string, never>>
      config={{
        defaultInput: { heights: [2, 1, 5, 6, 2, 3] },
        algorithm: (input) => generateLargestRectangleAreaSteps(input.heights),
        
        inputTypes: [
          { type: "array", key: "heights", label: "heights" },
        ],
        inputFields: [
          { type: "array", key: "heights", label: "高度数组 heights", placeholder: "输入数字，用逗号分隔，如: 2,1,5,6,2,3" },
        ],
        testCases: [
          { label: "示例 1", value: { heights: [2, 1, 5, 6, 2, 3] } },
          { label: "示例 2", value: { heights: [2, 4] } },
          { label: "示例 3", value: { heights: [1] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as LargestRectangleAreaInput;
          const heights = input.heights;
          const stack = variables?.stack as number[] | undefined;
          const current = variables?.current as number | undefined;
          const maxArea = variables?.maxArea as number | undefined;
          const popping = variables?.popping as number | undefined;
          const height = variables?.height as number | undefined;
          const width = variables?.width as number | undefined;
          const area = variables?.area as number | undefined;
          const finished = variables?.finished as boolean | undefined;
          const coreIdea = getProblemCoreIdea(119);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <BarChart3 size={20} className="text-blue-600" />
                  柱状图中最大的矩形（单调栈）
                </h3>
                <p className="text-sm text-gray-600">
                  使用单调递增栈，当遇到较小高度时，计算以栈顶高度为高的最大矩形面积。
                </p>
              </div>

              {/* 状态信息 */}
              {maxArea !== undefined && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">算法状态</h4>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-xs text-gray-600 mb-1">最大面积</div>
                    <div className="text-3xl font-bold text-green-600">{maxArea}</div>
                  </div>
                  {area !== undefined && height !== undefined && width !== undefined && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">当前高度</div>
                        <div className="text-lg font-bold text-blue-600">{height}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">宽度</div>
                        <div className="text-lg font-bold text-purple-600">{width}</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                        <div className="text-xs text-gray-600 mb-1">面积</div>
                        <div className="text-lg font-bold text-orange-600">{area}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 柱状图可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">柱状图</h4>
                <div className="flex items-end justify-center gap-2 min-h-[300px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {heights.map((h, index) => {
                    const isCurrent = current === index;
                    const isInStack = stack?.includes(index);
                    const isPopping = popping === index;
                    const isInRectangle = popping !== undefined && 
                      index >= (stack && stack.length > 0 ? stack[stack.length - 1] + 1 : 0) &&
                      index < current!;
                    
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center relative"
                        style={{ width: '50px' }}
                      >
                        {/* 矩形区域指示 */}
                        {isInRectangle && height !== undefined && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            className="absolute w-full bg-blue-400 border-2 border-blue-500"
                            style={{ 
                              height: `${height * 30}px`,
                              bottom: 0,
                              zIndex: 1
                            }}
                          />
                        )}

                        {/* 柱子 */}
                        <motion.div
                          className={`w-full transition-all duration-300 ${
                            isPopping
                              ? "bg-gradient-to-t from-orange-500 to-orange-400 shadow-lg shadow-orange-200 scale-105"
                              : isCurrent
                              ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-200 scale-105"
                              : isInStack
                              ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-md shadow-blue-200"
                              : "bg-gradient-to-t from-gray-600 to-gray-500"
                          }`}
                          style={{ 
                            height: `${h * 30}px`,
                            position: 'relative',
                            zIndex: 2
                          }}
                          animate={{
                            scale: isPopping || isCurrent ? 1.05 : 1,
                          }}
                        >
                          <div className="text-white text-xs font-bold text-center pt-1">
                            {h}
                          </div>
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold mt-1 ${
                          isCurrent ? "text-yellow-600" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 栈状态 */}
              {stack && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">单调栈（存储索引）</h4>
                  <StackTemplate
                    data={stack}
                    renderItem={(item, index) => {
                      const idx = item as number;
                      const isTop = index === stack.length - 1;
                      
                      return (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold text-white ${
                            isTop
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-110 shadow-lg"
                              : "bg-gradient-to-br from-blue-400 to-blue-500"
                          }`}
                        >
                          <div className="text-lg">{idx}</div>
                          <div className="text-xs mt-0.5">h={heights[idx]}</div>
                        </motion.div>
                      );
                    }}
                    getItemState={(index) => ({
                      isTop: index === stack.length - 1,
                    })}
                    layout={{ direction: "horizontal", gap: "0.5rem" }}
                  />
                </div>
              )}

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
                    <div className="text-green-700 font-semibold text-lg">
                      ✓ 完成！最大矩形面积为 {maxArea}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 图例 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">图例说明</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-600 rounded"></div>
                    <span className="text-gray-700">普通柱子</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span className="text-gray-700">栈中元素</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">当前位置</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <span className="text-gray-700">正在弹出</span>
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

export default LargestRectangleAreaVisualizer;

