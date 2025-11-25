import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generatePlusOneSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { Plus, ArrowBigUp, CheckCircle } from "lucide-react";

interface PlusOneInput extends ProblemInput {
  digits: number[];
}

interface PlusOneData {
  digits?: number[];
}

function PlusOneVisualizer() {
  return (
    <ConfigurableVisualizer<PlusOneInput, PlusOneData>
      config={{
        defaultInput: { digits: [1, 2, 9] },
        algorithm: (input) => generatePlusOneSteps(input.digits),
        
        inputTypes: [{ type: "array", key: "digits", label: "数字数组" }],
        inputFields: [
          { type: "array", key: "digits", label: "数字数组 digits", placeholder: "输入数字，如: 1,2,9" }
        ],
        testCases: [
          { label: "示例 1", value: { digits: [1, 2, 3] } },
          { label: "示例 2", value: { digits: [4, 3, 2, 1] } },
          { label: "示例 3", value: { digits: [9] } },
          { label: "示例 4", value: { digits: [9, 9, 9] } },
        ],
        
        customStepVariables: (variables) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {variables.index !== undefined && (
              <div>
                <span className="font-mono text-purple-600 font-semibold">index</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.index as number}</span>
              </div>
            )}
            {variables.carry !== undefined && (
              <div>
                <span className="font-mono text-orange-600 font-semibold">carry</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.carry as number}</span>
              </div>
            )}
            {variables.currentDigit !== undefined && (
              <div>
                <span className="font-mono text-blue-600 font-semibold">当前位</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.currentDigit as number}</span>
              </div>
            )}
            {variables.sum !== undefined && (
              <div>
                <span className="font-mono text-green-600 font-semibold">sum</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.sum as number}</span>
              </div>
            )}
          </div>
        ),
        
        render: ({ data, getNumberVariable, getBooleanVariable, getArrayVariable }) => {
          const { digits = [] } = data;
          const carry = getNumberVariable('carry');
          const index = getNumberVariable('index');
          const hasCarry = getBooleanVariable('hasCarry');
          const noCarry = getBooleanVariable('noCarry');
          const overflow = getBooleanVariable('overflow');
          const finished = getBooleanVariable('finished');
          const result = getArrayVariable('result') as number[] | undefined;
          
          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Plus className="text-green-600" size={20} />
                加一运算
              </h3>
              
              <div className="flex gap-2 items-center justify-center mb-6">
                {digits.map((digit: number, idx: number) => {
                  const isProcessing = index === idx;
                  const isPast = index !== undefined && idx > index && !finished;
                  const isNew = overflow && idx === 0;
                  
                  return (
                    <motion.div
                      key={`${idx}-${digit}`}
                      className="relative"
                      initial={isNew ? { scale: 0, x: -50 } : {}}
                      animate={isNew ? { scale: 1, x: 0 } : { scale: isProcessing ? 1.15 : 1 }}
                      transition={{ duration: 0.3, type: "spring" }}
                    >
                      <motion.div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl border-2 ${
                          isNew
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-orange-600 shadow-xl'
                            : hasCarry && isProcessing
                            ? 'bg-gradient-to-br from-red-400 to-red-600 text-white border-red-700 shadow-lg'
                            : noCarry && isProcessing
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-lg'
                            : isProcessing
                            ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white border-purple-700 shadow-lg'
                            : isPast
                            ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 border-gray-400'
                            : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-700'
                        }`}
                      >
                        {digit}
                      </motion.div>
                      
                      {isProcessing && !finished && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-purple-600 whitespace-nowrap"
                        >
                          ↑ 处理中
                        </motion.div>
                      )}
                      
                      {isNew && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -top-10 left-1/2 -translate-x-1/2"
                        >
                          <ArrowBigUp className="text-orange-600" size={24} />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
                
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="ml-4"
                >
                  <Plus className="text-green-600" size={32} />
                </motion.div>
                <div className="ml-2 text-4xl font-bold text-green-600">1</div>
              </div>

              {carry !== undefined && carry > 0 && !finished && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg text-center"
                >
                  <div className="text-orange-600 font-bold flex items-center justify-center gap-2">
                    <ArrowBigUp size={24} />
                    <span className="text-lg">进位 Carry = {carry}</span>
                  </div>
                </motion.div>
              )}

              {finished && result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 shadow-xl text-center text-white"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <CheckCircle className="mx-auto mb-3" size={48} />
                  </motion.div>
                  <div className="text-2xl font-bold mb-2">计算完成！</div>
                  <div className="text-lg">
                    结果：<span className="font-mono text-3xl font-bold">{result.join('')}</span>
                  </div>
                </motion.div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default PlusOneVisualizer;
