import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateProductExceptSelfSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface ProductExceptSelfInput extends ProblemInput {
  nums: number[];
}

interface ProductExceptSelfData {
  nums?: number[];
  answer?: number[];
  leftProducts?: number[];
  rightProducts?: number[];
  currentIndex?: number;
  phase?: 'left' | 'right' | 'complete';
}

function ProductExceptSelfVisualizer() {
  return (
    <ConfigurableVisualizer<ProductExceptSelfInput, ProductExceptSelfData>
      config={{
        defaultInput: { nums: [1, 2, 3, 4] },
        algorithm: (input) => generateProductExceptSelfSteps(input.nums),
        
        inputTypes: [{ type: "array", key: "nums", label: "数组" }],
        inputFields: [{ type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔" }],
        testCases: [
          { label: "示例 1", value: { nums: [1, 2, 3, 4] } },
          { label: "示例 2", value: { nums: [-1, 1, 0, -3, 3] } },
          { label: "示例 3", value: { nums: [2, 3, 4, 5] } },
        ],
        
        render: ({ data, visualization }) => {
          const input = visualization.input as ProductExceptSelfInput;
          const nums = data.nums || input.nums;
          const answer = data.answer || [];
          const leftProducts = data.leftProducts || [];
          const rightProducts = data.rightProducts || [];
          const currentIndex = data.currentIndex;
          const phase = data.phase;
          
          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <ArrowLeftRight size={20} className="text-blue-600" />
                  左右乘积列表
                </h3>
                <p className="text-sm text-gray-600">
                  先计算每个位置左侧所有数的乘积，再计算右侧所有数的乘积，最后相乘得到结果。
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">原数组</h4>
                <div className="flex gap-2 justify-center flex-wrap">
                  {nums.map((num, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`w-14 h-14 flex flex-col items-center justify-center border-2 rounded-lg ${
                        currentIndex === idx ? 'border-blue-500 bg-blue-100 scale-110' : 'border-gray-400 bg-gray-50'
                      }`}
                    >
                      <div className="text-xs text-gray-500">#{idx}</div>
                      <div className="font-bold text-gray-800">{num}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {leftProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">
                    左侧乘积{phase === 'left' && ' (计算中...)'}
                  </h4>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {leftProducts.map((num, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-14 h-14 flex items-center justify-center border-2 border-blue-400 bg-blue-50 rounded-lg font-bold text-blue-700"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {rightProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">
                    右侧乘积{phase === 'right' && ' (计算中...)'}
                  </h4>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {rightProducts.map((num, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-14 h-14 flex items-center justify-center border-2 border-purple-400 bg-purple-50 rounded-lg font-bold text-purple-700"
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {answer.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-semibold mb-3 text-gray-700">
                    结果数组 {phase === 'complete' && '✓'}
                  </h4>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {answer.map((num, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-14 h-14 flex items-center justify-center border-2 border-green-500 bg-green-100 rounded-lg font-bold text-green-700"
                      >
                        {num}
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

export default ProductExceptSelfVisualizer;
