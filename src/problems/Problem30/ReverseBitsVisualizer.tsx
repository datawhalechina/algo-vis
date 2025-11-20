import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateReverseBitsSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface ReverseBitsInput extends ProblemInput {
  n: number;
}

function ReverseBitsVisualizer() {

  return (
    <ConfigurableVisualizer<ReverseBitsInput, { n?: number }>
      config={{
        defaultInput: { n: 43261596 },
        algorithm: (input) => generateReverseBitsSteps(input.n),
        
        inputTypes: [
          { type: "number", key: "n", label: "n" },
        ],
        inputFields: [
          { type: "number", key: "n", label: "数字 n", placeholder: "请输入一个非负整数" },
        ],
        testCases: [
          { label: "示例 1", value: { n: 43261596 } },
          { label: "示例 2", value: { n: 4294967293 } },
          { label: "示例 3", value: { n: 1 } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['originalBinary', 'resultBinary', 'finished'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-mono text-blue-600 font-semibold">{key}</span>
                      <span className="text-gray-500"> = </span>
                      <span className="font-mono text-gray-800 font-semibold">
                        {JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
              </div>
            );
          }
          return null;
        },
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as ReverseBitsInput;
          const i = variables?.i as number | undefined;
          const bit = variables?.bit as number | undefined;
          const result = variables?.result as number | undefined;
          const originalBinary = variables?.originalBinary as string | undefined;
          const resultBinary = variables?.resultBinary as string | undefined;
          const finished = variables?.finished as boolean | undefined;
          
          return (
            <>
              {/* 二进制可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">位反转可视化</h3>
                
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-blue-700">核心思想：</span>
                    从低位到高位逐位取出原数字的每一位，然后将其添加到结果的最低位（通过左移和或运算）。
                    处理完32位后，得到的就是翻转后的结果。
                  </p>
                </div>

                {/* 数值显示 */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                    <div className="text-sm text-gray-600 mb-2">原始数字</div>
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {input.n.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      (十进制)
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="text-sm text-gray-600 mb-2">翻转后</div>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {((result ?? 0) >>> 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      (十进制)
                    </div>
                  </div>
                </div>

                {/* 原始二进制 */}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">原始二进制（32位）</div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 overflow-x-auto">
                    <div className="flex gap-1 font-mono text-sm justify-center">
                      {originalBinary?.split('').map((b, idx) => {
                        const isReading = i !== undefined && i === idx;
                        
                        return (
                          <motion.div
                            key={idx}
                            animate={{
                              scale: isReading ? 1.3 : 1,
                              backgroundColor: isReading ? '#a855f7' : '#f3e8ff',
                            }}
                            className={`w-7 h-7 flex items-center justify-center rounded ${
                              isReading ? 'text-white font-bold' : 'text-purple-700'
                            } transition-all`}
                          >
                            {b}
                          </motion.div>
                        );
                      })}
                    </div>
                    {i !== undefined && i >= 0 && (
                      <div className="text-center mt-2 text-sm text-purple-600">
                        ↑ 正在读取第 {i} 位，值为 {bit}
                      </div>
                    )}
                  </div>
                </div>

                {/* 结果二进制 */}
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">结果二进制（32位）</div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200 overflow-x-auto">
                    <div className="flex gap-1 font-mono text-sm justify-center">
                      {resultBinary?.split('').map((b, idx) => {
                        const isWriting = i !== undefined && i >= 0 && idx === 31 - i;
                        
                        return (
                          <motion.div
                            key={idx}
                            initial={{ backgroundColor: '#f0fdf4' }}
                            animate={{
                              scale: isWriting ? 1.3 : 1,
                              backgroundColor: isWriting ? '#10b981' : b === '1' ? '#d1fae5' : '#f0fdf4',
                            }}
                            className={`w-7 h-7 flex items-center justify-center rounded ${
                              isWriting 
                                ? 'text-white font-bold' 
                                : b === '1'
                                ? 'text-green-700 font-semibold'
                                : 'text-green-500'
                            } transition-all`}
                          >
                            {b}
                          </motion.div>
                        );
                      })}
                    </div>
                    {i !== undefined && i >= 0 && (
                      <div className="text-center mt-2 text-sm text-green-600">
                        ↑ 正在写入第 {31 - i} 位，值为 {bit}
                      </div>
                    )}
                  </div>
                </div>

                {finished && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300"
                  >
                    <div className="text-center text-green-700 font-semibold">
                      ✓ 翻转完成！所有32位已处理
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 位操作说明 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">位操作说明</h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="font-semibold text-blue-700 mb-2">1. 取出第 i 位</div>
                    <div className="font-mono text-sm text-gray-700">
                      bit = (n {'>>>'} i) & 1
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      无符号右移 i 位，然后与 1 进行按位与运算
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="font-semibold text-green-700 mb-2">2. 添加到结果</div>
                    <div className="font-mono text-sm text-gray-700">
                      result = (result {'<<'} 1) | bit
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      结果左移 1 位腾出空间，然后用或运算将 bit 添加到最低位
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="font-semibold text-purple-700 mb-2">3. 无符号右移（{'>>>'}）</div>
                    <div className="text-sm text-gray-600">
                      JavaScript 中使用无符号右移确保处理的是32位无符号整数
                    </div>
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

export default ReverseBitsVisualizer;
