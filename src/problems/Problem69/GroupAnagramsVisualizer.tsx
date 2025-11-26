import { motion, AnimatePresence } from "framer-motion";
import { Hash } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateGroupAnagramsSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";

interface GroupAnagramsInput extends ProblemInput {
  strs: string[];
}

interface GroupAnagramsData {
  strs?: string[];
}

function GroupAnagramsVisualizer() {
  return (
    <ConfigurableVisualizer<GroupAnagramsInput, GroupAnagramsData>
      config={{
        defaultInput: { strs: ["eat", "tea", "tan", "ate", "nat", "bat"] },
        algorithm: (input) => generateGroupAnagramsSteps(input.strs),

        inputTypes: [
          { type: "array", key: "strs", label: "字符串数组" },
        ],
        inputFields: [
          {
            type: "array",
            key: "strs",
            label: "字符串数组 strs",
            placeholder: '输入字符串，用逗号分隔，如: eat,tea,tan',
          },
        ],
        testCases: [
          { label: "示例 1", value: { strs: ["eat", "tea", "tan", "ate", "nat", "bat"] } },
          { label: "示例 2", value: { strs: [""] } },
          { label: "示例 3", value: { strs: ["a"] } },
        ],

        customStepVariables: (variables) => {
          if (variables && Object.keys(variables).length > 0) {
            return (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(variables)
                  .filter(([key]) => key !== 'map' && key !== 'result')
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

        render: ({ getNumberVariable, variables, visualization }) => {
          const getCurrentHashMap = () => {
            const map = new Map<string, string[]>();
            if (variables?.map && typeof variables.map === 'object') {
              const mapData = variables.map as unknown as Record<string, string[]>;
              Object.entries(mapData).forEach(([key, value]) => {
                map.set(key, value);
              });
            }
            return map;
          };

          const currentHashMap = getCurrentHashMap();
          const currentIndex = getNumberVariable('i');
          const currentKey = variables?.key as string | undefined;
          const input = visualization.input as GroupAnagramsInput;

          return (
            <>
              {/* 字符串数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">字符串数组可视化</h3>

                <div className="flex flex-wrap items-center justify-center gap-3 min-h-[120px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  {input.strs.map((str: string, index: number) => {
                    const isCurrentIndex = currentIndex === index;

                    return (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: 1,
                          scale: isCurrentIndex ? 1.1 : 1,
                        }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* 字符串显示 */}
                        <motion.div
                          className={`px-4 py-2 rounded-lg font-mono font-semibold text-lg ${
                            isCurrentIndex
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg"
                              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700"
                          }`}
                          animate={{
                            scale: isCurrentIndex ? 1.05 : 1,
                          }}
                        >
                          "{str}"
                        </motion.div>

                        {/* 索引 */}
                        <div
                          className={`text-xs font-semibold ${
                            isCurrentIndex ? "text-yellow-600" : "text-gray-500"
                          }`}
                        >
                          [{index}]
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* 当前操作提示 */}
                {currentKey !== undefined && (
                  <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="font-semibold text-gray-700">当前 key：</span>
                      <span className="font-mono text-blue-700 font-bold">"{currentKey}"</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hash表可视化 - 分组结果 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="text-primary-500" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">分组结果（Hash表）</h3>
                </div>

                <div className="mb-4 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-cyan-700">核心思想：</span>
                    将每个字符串排序后作为 key，原字符串作为 value 存入 Hash 表。
                    排序后相同的字符串是字母异位词，会被分到同一组。
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 min-h-[200px]">
                  {currentHashMap.size === 0 ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
                      <div className="text-center">
                        <Hash className="mx-auto mb-2 text-gray-400" size={32} />
                        <p>Hash表为空，开始遍历...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {Array.from(currentHashMap.entries()).map(([key, values], idx) => {
                          const isCurrentKey = currentKey === key;
                          return (
                            <motion.div
                              key={key}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                scale: isCurrentKey ? 1.02 : 1,
                              }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`bg-white rounded-lg p-4 shadow-sm ${
                                isCurrentKey
                                  ? "border-2 border-purple-500 shadow-lg"
                                  : "border-2 border-purple-200"
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <div className="text-xs text-gray-600 mb-1">Key (排序后)</div>
                                  <div
                                    className={`font-mono text-lg font-bold px-3 py-1 rounded ${
                                      isCurrentKey
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    "{key}"
                                  </div>
                                </div>
                                <div className="text-gray-400 text-2xl self-center">→</div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-600 mb-2">分组 (字母异位词)</div>
                                  <div className="flex flex-wrap gap-2">
                                    {values.map((str, i) => (
                                      <span
                                        key={i}
                                        className={`font-mono px-3 py-1 rounded text-sm font-semibold ${
                                          isCurrentKey
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-blue-100 text-blue-700"
                                        }`}
                                      >
                                        "{str}"
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      {/* 统计信息 */}
                      <div className="text-sm text-gray-600 text-center pt-2 border-t border-purple-200">
                        <span className="font-semibold">分组数量：</span>
                        <span className="ml-2 font-mono text-purple-600 font-bold">
                          {currentHashMap.size}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        },
      }}
    />
  );
}

export default GroupAnagramsVisualizer;
