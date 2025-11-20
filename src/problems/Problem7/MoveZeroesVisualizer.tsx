import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateMoveZeroesSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface MoveZeroesInput extends ProblemInput {
  nums: number[];
}

interface MoveZeroesData {
  nums?: number[];
}

function MoveZeroesVisualizer() {
  return (
    <ConfigurableVisualizer<MoveZeroesInput, MoveZeroesData>
      config={{
        defaultInput: { nums: [0, 1, 0, 3, 12] },
        algorithm: (input) => generateMoveZeroesSteps(input.nums),
        
        inputTypes: [{ type: "array", key: "nums", label: "数组" }],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 0,1,0,3,12" }
        ],
        testCases: [
          { label: "示例 1", value: { nums: [0, 1, 0, 3, 12] } },
          { label: "示例 2", value: { nums: [0] } },
          { label: "示例 3", value: { nums: [1, 0, 2, 0, 3] } },
        ],
        
        customStepVariables: (variables) => (
          <div className="flex gap-6 text-sm">
            {variables.slow !== undefined && (
              <div>
                <span className="font-mono text-blue-600 font-semibold">slow</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.slow as number}</span>
              </div>
            )}
            {variables.fast !== undefined && (
              <div>
                <span className="font-mono text-green-600 font-semibold">fast</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.fast as number}</span>
              </div>
            )}
          </div>
        ),
        
        render: ({ data, getNumberVariable, getBooleanVariable }) => {
          const { nums = [] } = data;
          const slow = getNumberVariable('slow');
          const fast = getNumberVariable('fast');
          const beforeSwap = getBooleanVariable('beforeSwap');
          const afterSwap = getBooleanVariable('afterSwap');
          const finished = getBooleanVariable('finished');
          
          return (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">数组可视化</h3>
                <div className="flex items-center justify-center gap-3 min-h-[150px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg">
                  {nums.map((value: number, index: number) => {
                    const isSlow = slow === index;
                    const isFast = fast === index;
                    const isZero = value === 0;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: (beforeSwap || afterSwap) && (isSlow || isFast) ? 1.1 : 1
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {(isSlow || isFast) && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                              isSlow ? 'bg-blue-600' : 'bg-green-600'
                            }`}
                          >
                            {isSlow ? 'SLOW' : 'FAST'}
                          </motion.div>
                        )}

                        <motion.div
                          className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg ${
                            isZero
                              ? 'bg-gray-200 text-gray-500 border-gray-400'
                              : isSlow || isFast
                              ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white border-blue-600 shadow-lg'
                              : 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border-green-400'
                          }`}
                          whileHover={{ scale: 1.05 }}
                        >
                          {value}
                        </motion.div>

                        <div className="text-sm text-gray-600 font-mono">[{index}]</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-6"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700 mb-2">
                      ✓ 移动完成！
                    </div>
                    <div className="text-lg text-gray-700">
                      结果：<span className="font-mono font-bold text-green-600">[{nums.join(', ')}]</span>
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

export default MoveZeroesVisualizer;
