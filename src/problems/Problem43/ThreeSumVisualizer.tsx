import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateThreeSumSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface ThreeSumInput extends ProblemInput {
  nums: number[];
}

interface ThreeSumData {
  nums?: number[];
}

function ThreeSumVisualizer() {
  return (
    <ConfigurableVisualizer<ThreeSumInput, ThreeSumData>
      config={{
        defaultInput: { nums: [-1, 0, 1, 2, -1, -4] },
        algorithm: (input) => generateThreeSumSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "数组" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: -1,0,1,2,-1,-4" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [-1, 0, 1, 2, -1, -4] } },
          { label: "示例 2", value: { nums: [0, 1, 1] } },
          { label: "示例 3", value: { nums: [0, 0, 0] } },
        ],
        
        render: ({ getNumberVariable, variables, visualization }) => {
          const input = visualization.input as ThreeSumInput;
          const sortedNums = (variables?.sortedNums || variables?.nums || input.nums) as number[];
          const i = getNumberVariable('i');
          const left = getNumberVariable('left');
          const right = getNumberVariable('right');
          const sum = getNumberVariable('sum');
          const result = variables?.result as number[][] | undefined;
          
          return (
            <>
              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <ArrowLeftRight size={20} className="text-blue-600" />
                  排序数组 + 双指针
                </h3>
                
                <div className="mb-4 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-cyan-700">核心思想：</span>
                    排序后固定一个数，用双指针在剩余数组中找另外两个数使三数之和为0。
                  </p>
                </div>
                
                {sum !== undefined && (
                  <div className="mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-lg border border-amber-200">
                    <div className="text-center font-mono text-sm">
                      <span className="font-semibold">当前计算：</span>
                      <span className="ml-2 text-amber-700 font-bold">
                        {sortedNums[i!]} + {sortedNums[left!]} + {sortedNums[right!]} = {sum}
                      </span>
                      <span className="ml-2 text-gray-600">
                        {sum === 0 ? '✓ 找到答案！' : sum < 0 ? '< 0 (left++)' : '> 0 (right--)'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-end justify-center gap-2 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {sortedNums.map((value: number, index: number) => {
                    const isI = i === index;
                    const isLeft = left === index;
                    const isRight = right === index;
                    const isActive = isI || isLeft || isRight;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        animate={{ 
                          scale: isActive ? 1.05 : 1
                        }}
                      >
                        {/* 标签 */}
                        {(isI || isLeft || isRight) && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              isI ? "bg-red-500 text-white" : 
                              isLeft ? "bg-blue-500 text-white" : 
                              "bg-green-500 text-white"
                            }`}
                          >
                            {isI ? "固定" : isLeft ? "left" : "right"}
                          </motion.div>
                        )}

                        {/* 值 */}
                        <div className={`text-sm font-bold ${
                          isI ? "text-red-600" : 
                          isLeft ? "text-blue-600" : 
                          isRight ? "text-green-600" : "text-gray-600"
                        }`}>
                          {value}
                        </div>

                        {/* 柱状图 */}
                        <motion.div
                          className={`w-14 rounded-lg flex items-end justify-center pb-2 ${
                            isI ? "bg-gradient-to-t from-red-500 to-red-400 shadow-lg" : 
                            isLeft ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-lg" : 
                            isRight ? "bg-gradient-to-t from-green-500 to-green-400 shadow-lg" : 
                            "bg-gradient-to-t from-gray-400 to-gray-300"
                          }`}
                          style={{ height: `${Math.max(50, Math.abs(value) * 15 + 40)}px` }}
                        >
                          <span className="text-white text-xs font-bold">{value}</span>
                        </motion.div>

                        {/* 索引 */}
                        <div className={`text-xs font-semibold ${
                          isActive ? "text-gray-700" : "text-gray-500"
                        }`}>
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* 结果显示 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">找到的三元组</h3>
                {result && result.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {result.map((triplet, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200"
                      >
                        <div className="flex items-center justify-center gap-2 font-mono text-lg">
                          <span className="text-purple-700 font-bold">[</span>
                          {triplet.map((num, i) => (
                            <span key={i}>
                              <span className="text-purple-600 font-bold">{num}</span>
                              {i < 2 && <span className="text-gray-400">, </span>}
                            </span>
                          ))}
                          <span className="text-purple-700 font-bold">]</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">还未找到解...</div>
                )}
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default ThreeSumVisualizer;
