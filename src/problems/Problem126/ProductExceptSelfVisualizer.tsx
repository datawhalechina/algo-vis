import { Sigma } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateProductExceptSelfSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { motion } from "framer-motion";

interface ProductExceptSelfInput extends ProblemInput {
  nums: number[];
}

function ProductExceptSelfVisualizer() {
  return (
    <ConfigurableVisualizer<ProductExceptSelfInput, Record<string, never>>
      config={{
        defaultInput: { nums: [1, 2, 3, 4] },
        algorithm: (input) => generateProductExceptSelfSteps(input.nums),
        
        inputTypes: [
          { type: "array", key: "nums", label: "nums" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,2,3,4" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 2, 3, 4] } },
          { label: "示例 2", value: { nums: [-1, 1, 0, -3, 3] } },
          { label: "示例 3", value: { nums: [2, 3] } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as ProductExceptSelfInput;
          const nums = input.nums;
          const answer = variables?.answer as number[] | undefined;
          const left = variables?.left as number | undefined;
          const right = variables?.right as number | undefined;
          const i = variables?.i as number | undefined;
          const phase = variables?.phase as string | undefined;
          const finished = variables?.finished as boolean | undefined;
          const coreIdea = getProblemCoreIdea(126);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <Sigma size={20} className="text-blue-600" />
                  除自身以外数组的乘积（左右乘积列表）
                </h3>
                <p className="text-sm text-gray-600">
                  先计算每个位置左侧所有数的乘积，再计算右侧所有数的乘积，最后相乘。
                </p>
              </div>

              {/* 状态信息 */}
              {(left !== undefined || right !== undefined) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">算法状态</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {left !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">左侧累积乘积 (left)</div>
                        <div className="text-2xl font-bold text-blue-600">{left}</div>
                      </div>
                    )}
                    {right !== undefined && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">右侧累积乘积 (right)</div>
                        <div className="text-2xl font-bold text-purple-600">{right}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 原数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">原数组 (nums)</h4>
                <ArrayTemplate
                  data={nums}
                  renderItem={(item, index) => {
                    const isCurrent = i === index;
                    
                    return (
                      <motion.div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-white text-lg transition-all ${
                          isCurrent
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-110 shadow-lg"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: isCurrent ? 1.1 : 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {item}
                      </motion.div>
                    );
                  }}
                  getItemState={(index) => ({
                    isActive: i === index,
                  })}
                  layout={{ gap: "0.75rem", direction: "row", wrap: false }}
                />
              </div>

              {/* 结果数组可视化 */}
              {answer && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">结果数组 (answer)</h4>
                  <ArrayTemplate
                    data={answer}
                    renderItem={(item, index) => {
                      const isCurrent = i === index;
                      const isUpdated = phase === "right_multiply" && i === index;
                      
                      return (
                        <motion.div
                          className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold text-white text-lg transition-all ${
                            isCurrent
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-110 shadow-lg"
                              : isUpdated
                              ? "bg-gradient-to-br from-green-400 to-green-500 scale-105"
                              : "bg-gradient-to-br from-blue-400 to-blue-500"
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: isCurrent ? 1.1 : isUpdated ? 1.05 : 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div>{item}</div>
                          {isCurrent && (
                            <div className="text-xs mt-0.5 opacity-80">
                              {phase === "left_assign" ? "left" : phase === "right_multiply" ? "×right" : ""}
                            </div>
                          )}
                        </motion.div>
                      );
                    }}
                    getItemState={(index) => ({
                      isActive: i === index,
                    })}
                    layout={{ gap: "0.75rem", direction: "row", wrap: false }}
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
                      ✓ 完成！结果：[{answer?.join(", ")}]
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

export default ProductExceptSelfVisualizer;

