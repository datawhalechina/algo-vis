import { motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateContainerSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface ContainerInput extends ProblemInput {
  height: number[];
}

interface ContainerData {
  height?: number[];
}

function ContainerVisualizer() {
  return (
    <ConfigurableVisualizer<ContainerInput, ContainerData>
      config={{
        defaultInput: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
        algorithm: (input) => generateContainerSteps(input.height),
        
        inputTypes: [{ type: "array", key: "height", label: "高度数组" }],
        inputFields: [{ type: "array", key: "height", label: "高度数组 height (至少两个元素)", placeholder: "输入高度数组，用逗号分隔，如: 1,8,6,2,5,4,8,3,7" }],
        testCases: [
          { label: "示例 1", value: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] } },
          { label: "示例 2", value: { height: [1, 1] } },
          { label: "示例 3", value: { height: [4, 3, 2, 1, 4] } },
          { label: "大数据", value: { height: [1, 2, 4, 3, 7, 5, 8, 9, 6, 2] } },
        ],
        
        customStepVariables: (variables) => (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {variables.left !== undefined && (
              <div>
                <span className="font-mono text-blue-600 font-semibold">left</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.left as number}</span>
              </div>
            )}
            {variables.right !== undefined && (
              <div>
                <span className="font-mono text-blue-600 font-semibold">right</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.right as number}</span>
              </div>
            )}
            {variables.maxArea !== undefined && (
              <div>
                <span className="font-mono text-purple-600 font-semibold">maxArea</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.maxArea as number}</span>
              </div>
            )}
            {variables.currentArea !== undefined && (
              <div>
                <span className="font-mono text-green-600 font-semibold">currentArea</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.currentArea as number}</span>
              </div>
            )}
            {variables.width !== undefined && (
              <div>
                <span className="font-mono text-orange-600 font-semibold">width</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.width as number}</span>
              </div>
            )}
            {variables.currentHeight !== undefined && (
              <div>
                <span className="font-mono text-cyan-600 font-semibold">height</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.currentHeight as number}</span>
              </div>
            )}
          </div>
        ),
        
        render: ({ getNumberVariable, getBooleanVariable, visualization }) => {
          const left = getNumberVariable('left');
          const right = getNumberVariable('right');
          const maxArea = getNumberVariable('maxArea');
          const currentArea = getNumberVariable('currentArea');
          const currentHeight = getNumberVariable('currentHeight');
          const width = getNumberVariable('width');
          const finished = getBooleanVariable('finished');
          const input = visualization.input as ContainerInput;
          const maxHeight = Math.max(...input.height, 1);
          
          const coreIdea = getProblemCoreIdea(6);
          
          return (
            <>

        {/* 容器可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">盛最多水的容器 - 双指针</h3>
          </div>
          
          {coreIdea && <CoreIdeaBox {...coreIdea} />}
          
          {/* 当前面积显示 */}
          {currentArea !== undefined && (
            <div className="mb-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="font-semibold text-gray-700">当前容器：</span>
                <span className="font-mono text-cyan-700 font-bold">
                  面积 = {width} × {currentHeight} = {currentArea}
                </span>
                {maxArea !== undefined && maxArea > 0 && (
                  <span className={`font-semibold ${
                    currentArea === maxArea ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {currentArea === maxArea ? '✓ 当前最大' : `最大: ${maxArea}`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 柱状图 */}
          <div className="relative flex items-end justify-center gap-1 min-h-[300px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
            {input.height.map((h: number, index: number) => {
              const isLeft = left === index;
              const isRight = right === index;
              const isBetween = left !== undefined && right !== undefined && index > left && index < right;
              const normalizedHeight = (h / maxHeight) * 250;

              return (
                <div key={index} className="relative flex flex-col items-center gap-2">
                  {/* 柱子 */}
                  <motion.div
                    className="relative"
                    style={{ height: normalizedHeight }}
                    initial={{ height: 0 }}
                    animate={{ height: normalizedHeight }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={`w-12 h-full rounded-t-lg border-2 transition-all ${
                        isLeft
                          ? 'bg-gradient-to-t from-blue-400 to-blue-500 border-blue-600 shadow-lg'
                          : isRight
                          ? 'bg-gradient-to-t from-green-400 to-green-500 border-green-600 shadow-lg'
                          : isBetween && currentHeight
                          ? 'bg-gradient-to-t from-cyan-200 to-cyan-300 border-cyan-400'
                          : 'bg-gradient-to-t from-gray-200 to-gray-300 border-gray-400'
                      }`}
                      animate={{
                        scale: isLeft || isRight ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* 水面标记 */}
                    {isBetween && currentHeight && (
                      <motion.div
                        className="absolute left-0 right-0 bg-cyan-400 opacity-30"
                        style={{
                          bottom: 0,
                          height: Math.min(normalizedHeight, (currentHeight / maxHeight) * 250),
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                      />
                    )}
                  </motion.div>

                  {/* 高度标签 */}
                  <div className={`text-xs font-mono font-bold ${
                    isLeft || isRight ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {h}
                  </div>

                  {/* 索引 */}
                  <div className="text-xs text-gray-500 font-mono">[{index}]</div>

                  {/* 指针标记 */}
                  {(isLeft || isRight) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute -top-8 px-2 py-1 rounded-full text-xs font-bold text-white ${
                        isLeft ? 'bg-blue-600' : 'bg-green-600'
                      }`}
                    >
                      {isLeft ? 'LEFT' : 'RIGHT'}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      {/* 最终结果 */}
      {finished && maxArea !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-6"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700 mb-2">
              ✓ 找到最大容器！
            </div>
            <div className="text-lg text-gray-700">
              最大面积 = <span className="font-mono font-bold text-green-600">{maxArea}</span>
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

export default ContainerVisualizer;
