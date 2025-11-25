import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateIsomorphicStringsSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface IsomorphicStringsInput extends ProblemInput {
  s: string;
  t: string;
}

function IsomorphicStringsVisualizer() {

  return (
    <ConfigurableVisualizer<IsomorphicStringsInput, { s?: string; t?: string }>
      config={{
        defaultInput: { s: "egg", t: "add" },
        algorithm: (input) => generateIsomorphicStringsSteps(input.s, input.t),
        
        inputTypes: [
          { type: "string", key: "s", label: "s" },
          { type: "string", key: "t", label: "t" },
        ],
        inputFields: [
          { type: "string", key: "s", label: "字符串 s", placeholder: "请输入字符串 s" },
          { type: "string", key: "t", label: "字符串 t", placeholder: "请输入字符串 t" },
        ],
        testCases: [
          { label: "示例 1 (同构)", value: { s: "egg", t: "add" } },
          { label: "示例 2 (不同构)", value: { s: "foo", t: "bar" } },
          { label: "示例 3 (同构)", value: { s: "paper", t: "title" } },
        ],
        
        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => !['mapST', 'mapTS', 'finished', 'conflict'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-mono text-blue-600 font-semibold">{key}</span>
                      <span className="text-gray-500"> = </span>
                      <span className="font-mono text-gray-800 font-semibold">
                        {typeof value === 'string' ? `"${value}"` : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
              </div>
            );
          }
          return null;
        },
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as IsomorphicStringsInput;
          const i = variables?.i as number | undefined;
          const charS = variables?.charS as string | undefined;
          const charT = variables?.charT as string | undefined;
          const mapST = variables?.mapST as Record<string, string> | undefined;
          const mapTS = variables?.mapTS as Record<string, string> | undefined;
          const isIsomorphic = variables?.isIsomorphic as boolean | undefined;
          const conflict = variables?.conflict as boolean | undefined;
          const finished = variables?.finished as boolean | undefined;
          
          return (
            <>
              {/* 字符串可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">字符串对比</h3>
                
                <div className="mb-4 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-teal-700">核心思想：</span>
                    使用两个哈希表分别记录 s→t 和 t→s 的映射关系，确保每个字符的映射是唯一且双向一致的。
                  </p>
                </div>

                {/* 两个字符串 */}
                <div className="space-y-6">
                  {/* 字符串 s */}
                  <div>
                    <div className="text-sm text-gray-600 mb-2">字符串 s</div>
                    <div className="flex gap-2 justify-center">
                      {input.s.split('').map((char, idx) => {
                        const isCurrent = i === idx;
                        const isPassed = i !== undefined && i > idx;
                        
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              scale: isCurrent ? 1.15 : 1
                            }}
                            transition={{ delay: idx * 0.05 }}
                            className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold transition-all ${
                              conflict && isCurrent
                                ? "bg-red-500 text-white shadow-lg"
                                : isCurrent
                                ? "bg-blue-500 text-white shadow-lg"
                                : isPassed
                                ? "bg-green-100 text-green-700 border-2 border-green-300"
                                : "bg-gray-100 text-gray-600 border-2 border-gray-200"
                            }`}
                          >
                            {char}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 映射指示 */}
                  {i !== undefined && i >= 0 && charS && charT && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg ${
                        conflict 
                          ? "bg-red-100 border-2 border-red-300" 
                          : "bg-blue-100 border-2 border-blue-300"
                      }`}>
                        <span className="text-2xl font-bold">{charS}</span>
                        <span className="text-xl">→</span>
                        <span className="text-2xl font-bold">{charT}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* 字符串 t */}
                  <div>
                    <div className="text-sm text-gray-600 mb-2">字符串 t</div>
                    <div className="flex gap-2 justify-center">
                      {input.t.split('').map((char, idx) => {
                        const isCurrent = i === idx;
                        const isPassed = i !== undefined && i > idx;
                        
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              scale: isCurrent ? 1.15 : 1
                            }}
                            transition={{ delay: idx * 0.05 }}
                            className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold transition-all ${
                              conflict && isCurrent
                                ? "bg-red-500 text-white shadow-lg"
                                : isCurrent
                                ? "bg-purple-500 text-white shadow-lg"
                                : isPassed
                                ? "bg-green-100 text-green-700 border-2 border-green-300"
                                : "bg-gray-100 text-gray-600 border-2 border-gray-200"
                            }`}
                          >
                            {char}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 结果显示 */}
                {finished && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-6 text-center"
                  >
                    <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-lg text-white text-xl font-bold ${
                      isIsomorphic ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {isIsomorphic ? (
                        <>
                          <CheckCircle size={28} />
                          两个字符串同构！
                        </>
                      ) : (
                        <>
                          <XCircle size={28} />
                          两个字符串不同构
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 映射表 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">映射关系</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* s -> t 映射 */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-700 mb-3">s → t 映射</h4>
                    {mapST && Object.keys(mapST).length > 0 ? (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {Object.entries(mapST).map(([key, value], idx) => (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-white rounded px-4 py-2 flex items-center justify-between border border-blue-200"
                            >
                              <span className="font-bold text-lg text-blue-600">'{key}'</span>
                              <span className="text-gray-400">→</span>
                              <span className="font-bold text-lg text-purple-600">'{value}'</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-4">映射表为空</div>
                    )}
                  </div>

                  {/* t -> s 映射 */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="text-sm font-semibold text-purple-700 mb-3">t → s 映射</h4>
                    {mapTS && Object.keys(mapTS).length > 0 ? (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {Object.entries(mapTS).map(([key, value], idx) => (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-white rounded px-4 py-2 flex items-center justify-between border border-purple-200"
                            >
                              <span className="font-bold text-lg text-purple-600">'{key}'</span>
                              <span className="text-gray-400">→</span>
                              <span className="font-bold text-lg text-blue-600">'{value}'</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-4">映射表为空</div>
                    )}
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

export default IsomorphicStringsVisualizer;
