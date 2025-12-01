import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { generateRemoveDuplicatesSteps } from "./algorithm";
import { ProblemInput } from "@/types/visualization";
import { CheckCircle, X } from "lucide-react";

interface RemoveDuplicatesInput extends ProblemInput {
  nums: number[];
}

interface RemoveDuplicatesData {
  nums?: number[];
}

function RemoveDuplicatesVisualizer() {
  return (
    <ConfigurableVisualizer<RemoveDuplicatesInput, RemoveDuplicatesData>
      config={{
        defaultInput: { nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] },
        algorithm: (input) => generateRemoveDuplicatesSteps(input.nums),
        
        inputTypes: [{ type: "array", key: "nums", label: "有序数组" }],
        inputFields: [
          { type: "array", key: "nums", label: "有序数组 nums", placeholder: "输入有序数组，如: 0,0,1,1,1,2,2,3,3,4" }
        ],
        testCases: [
          { label: "示例 1", value: { nums: [1, 1, 2] } },
          { label: "示例 2", value: { nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] } },
          { label: "示例 3", value: { nums: [1, 2, 3, 4, 5] } },
        ],
        
        customStepVariables: (variables) => (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {variables.k !== undefined && (
              <div>
                <span className="font-mono text-blue-600 font-semibold">k (不重复数)</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.k as number}</span>
              </div>
            )}
            {variables.i !== undefined && (
              <div>
                <span className="font-mono text-purple-600 font-semibold">i (当前位置)</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.i as number}</span>
              </div>
            )}
          </div>
        ),
        
        render: ({ data, getNumberVariable, getBooleanVariable, getArrayVariable }) => {
          const { nums = [] } = data;
          const k = getNumberVariable('k');
          const i = getNumberVariable('i');
          const moved = getBooleanVariable('moved');
          const skipped = getBooleanVariable('skipped');
          const finished = getBooleanVariable('finished');
          const uniqueArray = getArrayVariable('uniqueArray') as number[] | undefined;
          
          const coreIdea = getProblemCoreIdea(13);
          
          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="text-purple-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">删除有序数组中的重复项 - 双指针</h3>
              </div>
              
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              
              <div className="flex gap-2 items-center flex-wrap justify-center">
                {nums.map((num: number, index: number) => {
                  const isK = k !== undefined && index === k;
                  const isI = i !== undefined && index === i;
                  const isUnique = k !== undefined && index < k;
                  const isDuplicate = k !== undefined && index >= k && !isI;
                  
                  return (
                    <motion.div
                      key={index}
                      className="relative"
                      animate={{
                        scale: isI || isK ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-lg border-2 ${
                          moved && isI
                            ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-700 shadow-lg'
                            : skipped && isI
                            ? 'bg-gradient-to-br from-red-400 to-red-600 text-white border-red-700 shadow-lg'
                            : isUnique
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-700'
                            : isDuplicate
                            ? 'bg-gray-200 text-gray-400 border-gray-300 line-through'
                            : 'bg-gradient-to-br from-purple-300 to-purple-400 text-white border-purple-500'
                        }`}
                        initial={moved && isI ? { scale: 0.5, opacity: 0 } : {}}
                        animate={moved && isI ? { scale: 1, opacity: 1 } : {}}
                      >
                        {num}
                        {skipped && isI && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <X className="text-white" size={32} strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.div>
                      
                      {isK && !finished && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-600 whitespace-nowrap"
                        >
                          ↓ k
                        </motion.div>
                      )}
                      {isI && !finished && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-bold text-purple-600 whitespace-nowrap"
                        >
                          i ↑
                        </motion.div>
                      )}
                      
                      <div className="text-center text-xs text-gray-400 mt-1">{index}</div>
                    </motion.div>
                  );
                })}
              </div>

              {finished && uniqueArray && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 shadow-xl text-center text-white"
                >
                  <CheckCircle className="mx-auto mb-3" size={48} />
                  <div className="text-2xl font-bold mb-2">删除完成！</div>
                  <div className="text-lg">
                    不重复元素数量：<span className="font-mono text-3xl font-bold">{k}</span>
                  </div>
                  <div className="mt-3 text-lg">
                    结果数组：[{uniqueArray.join(', ')}]
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

export default RemoveDuplicatesVisualizer;
