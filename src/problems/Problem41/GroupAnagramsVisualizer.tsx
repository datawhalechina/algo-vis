import { motion } from "framer-motion";
import { Hash, ListTree } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
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
          { type: "array", key: "strs", label: "字符串数组", placeholder: '输入字符串，用逗号分隔，如: eat,tea,tan,ate,nat,bat' },
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
                  .filter(([key]) => !['map', 'result'].includes(key))
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
          const coreIdea = getProblemCoreIdea(41);
          const getCurrentHashMap = () => {
            const map = new Map<string, string[]>();
            if (variables?.map && typeof variables.map === 'object' && !Array.isArray(variables.map)) {
              const mapData = variables.map as Record<string, string[]>;
              Object.entries(mapData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                  map.set(key, value as string[]);
                }
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
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 字符串数组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <ListTree size={20} className="text-blue-600" />
                  字符串数组可视化
                </h3>
                
                <div className="flex flex-wrap gap-3 justify-center p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-100">
                  {input.strs.map((str: string, index: number) => {
                    const isCurrentIndex = currentIndex === index;
                    const sortedKey = str.split('').sort().join('');
                    const isCurrentKey = currentKey === sortedKey;

                    return (
                      <motion.div
                        key={index}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          isCurrentIndex
                            ? "bg-yellow-50 border-yellow-500 shadow-lg"
                            : isCurrentKey
                            ? "bg-blue-50 border-blue-400"
                            : "bg-white border-gray-200"
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: isCurrentIndex ? 1.05 : 1
                        }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className={`text-lg font-mono font-bold ${
                          isCurrentIndex ? "text-yellow-700" : isCurrentKey ? "text-blue-700" : "text-gray-700"
                        }`}>
                          "{str}"
                        </div>
                        <div className="text-xs text-gray-500">
                          索引 [{index}]
                        </div>
                        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          排序后: {sortedKey}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Hash表分组可视化 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="text-primary-500" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">Hash表分组状态</h3>
                </div>
                
                <div className="mb-4 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-cyan-700">核心思想：</span>
                    将每个字符串排序后作为key，原字符串存入对应分组。
                    相同字母异位词排序后得到相同的key，从而被分到同一组。
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 min-h-[140px]">
                  {currentHashMap.size === 0 ? (
                    <div className="flex items-center justify-center h-20 text-gray-500">
                      <div className="text-center">
                        <Hash className="mx-auto mb-2 text-gray-400" size={32} />
                        <p>Hash表为空，开始遍历...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Array.from(currentHashMap.entries()).map(([key, group], idx) => {
                        const isCurrentKey = currentKey === key;
                        return (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ 
                              opacity: 1, 
                              x: 0,
                              scale: isCurrentKey ? 1.02 : 1
                            }}
                            transition={{ delay: idx * 0.1 }}
                            className={`bg-white rounded-lg p-4 ${
                              isCurrentKey 
                                ? "border-2 border-purple-500 shadow-lg" 
                                : "border-2 border-purple-200"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="text-xs text-gray-600 mb-1">Key (排序后)</div>
                                <div className={`text-lg font-mono font-bold ${
                                  isCurrentKey ? "text-purple-600" : "text-purple-500"
                                }`}>
                                  "{key}"
                                </div>
                              </div>
                              <div className="text-gray-400 text-2xl">→</div>
                              <div className="flex-1">
                                <div className="text-xs text-gray-600 mb-2">分组 ({group.length}个)</div>
                                <div className="flex flex-wrap gap-2">
                                  {group.map((str, i) => (
                                    <div
                                      key={i}
                                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-mono"
                                    >
                                      "{str}"
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      
                      <div className="text-sm text-gray-600 text-center pt-2 border-t border-purple-200">
                        <span className="font-semibold">分组数量：</span>
                        <span className="ml-2 font-mono text-purple-600 font-bold">{currentHashMap.size}</span>
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
