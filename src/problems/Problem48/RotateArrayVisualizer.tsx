import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateRotateArraySteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface RotateArrayInput extends ProblemInput {
  nums: number[];
  k: number;
}

interface RotateArrayData {
  nums?: number[];
  k?: number;
}

function RotateArrayVisualizer() {
  return (
    <ConfigurableVisualizer<RotateArrayInput, RotateArrayData>
      config={{
        defaultInput: { nums: [1,2,3,4,5,6,7], k: 3 },
        algorithm: (input) => generateRotateArraySteps(input.nums, input.k),
        
        inputTypes: [
          { type: "array-and-number", arrayKey: "nums", numberKey: "k", arrayLabel: "nums", numberLabel: "k" },
        ],
        inputFields: [
          { type: "array", key: "nums", label: "数组 nums", placeholder: "输入数字，用逗号分隔，如: 1,2,3,4,5,6,7" },
          { type: "number", key: "k", label: "轮转次数 k", placeholder: "请输入轮转次数" },
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1,2,3,4,5,6,7], k: 3 } },
          { label: "示例 2", value: { nums: [-1,-100,3,99], k: 2 } },
          { label: "示例 3", value: { nums: [1,2], k: 3 } },
        ],
        
        render: ({ getNumberVariable, variables, visualization }) => {
          const input = visualization.input as RotateArrayInput;
          const step = getNumberVariable('step');
          const currentNums = (variables?.nums || input.nums) as number[];
          const reverseRange = variables?.reverseRange as number[] | undefined;
          const originalNums = variables?.originalNums as number[] | undefined;
          const coreIdea = getProblemCoreIdea(48);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 算法说明 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <RotateCw size={20} className="text-blue-600" />
                  三次反转法
                </h3>
                
                {step !== undefined && (
                  <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="text-center">
                      <span className="font-semibold text-gray-700">当前步骤：</span>
                      <span className="ml-2 font-mono text-purple-700 font-bold text-lg">
                        步骤 {step}/3
                      </span>
                      {reverseRange && (
                        <span className="ml-2 text-gray-600">
                          (反转区间 [{reverseRange[0]}, {reverseRange[1]}])
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">数组状态</h3>
                
                {originalNums && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">原始数组：</div>
                    <div className="flex gap-2 justify-center p-3 bg-gray-50 rounded-lg">
                      {originalNums.map((num, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-700 rounded font-mono font-bold"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-gray-600 mb-2">
                  {step === 3 ? "轮转后数组：" : "当前数组："}
                </div>
                <div className="flex gap-2 justify-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                  {currentNums.map((num: number, idx: number) => {
                    const inReverseRange = reverseRange && 
                      idx >= reverseRange[0] && 
                      idx <= reverseRange[1];

                    return (
                      <motion.div
                        key={idx}
                        className={`w-14 h-14 flex items-center justify-center rounded-lg font-mono font-bold text-lg border-2 ${
                          step === 3
                            ? "bg-gradient-to-br from-green-400 to-green-500 text-white border-green-600 shadow-lg"
                            : inReverseRange
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-yellow-600 shadow-lg"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                        animate={{
                          scale: inReverseRange ? 1.1 : 1,
                          rotate: inReverseRange ? [0, -5, 5, 0] : 0,
                        }}
                        transition={{
                          rotate: { duration: 0.5 }
                        }}
                      >
                        {num}
                      </motion.div>
                    );
                  })}
                </div>

                {/* 图例 */}
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  {reverseRange && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded"></div>
                      <span className="text-gray-700">反转区间</span>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded"></div>
                      <span className="text-gray-700">完成轮转</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 步骤说明 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">算法步骤</h3>
                <div className="space-y-3">
                  {[
                    { num: 1, desc: "反转整个数组", done: (step || 0) >= 1 },
                    { num: 2, desc: `反转前 ${input.k % input.nums.length} 个元素`, done: (step || 0) >= 2 },
                    { num: 3, desc: `反转后 ${input.nums.length - (input.k % input.nums.length)} 个元素`, done: (step || 0) >= 3 },
                  ].map((s) => (
                    <motion.div
                      key={s.num}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                        step === s.num
                          ? "bg-blue-50 border-blue-500"
                          : s.done
                          ? "bg-green-50 border-green-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                      animate={{
                        scale: step === s.num ? 1.02 : 1,
                      }}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                        s.done ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                      }`}>
                        {s.done ? "✓" : s.num}
                      </div>
                      <div className="flex-1 text-gray-700">{s.desc}</div>
                      {step === s.num && (
                        <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          进行中
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default RotateArrayVisualizer;
