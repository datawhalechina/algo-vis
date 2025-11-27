import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ProblemInput } from "@/types/visualization";

interface DailyTemperaturesInput extends ProblemInput {
  temperatures: number[];
}

function DailyTemperaturesVisualizer() {
  return (
    <ConfigurableVisualizer<DailyTemperaturesInput, Record<string, any>>
      config={{
        defaultInput: { temperatures: [73, 74, 75, 71, 69, 72, 76, 73] },
        algorithm: () => [],
        
        inputTypes: [
          { type: "array", key: "temperatures", label: "temperatures" },
        ],
        inputFields: [
          { type: "array", key: "temperatures", label: "温度数组", placeholder: "输入每日温度" },
        ],
        testCases: [
          { label: "示例 1", value: { temperatures: [73, 74, 75, 71, 69, 72, 76, 73] } },
          { label: "示例 2", value: { temperatures: [30, 40, 50, 60] } },
          { label: "示例 3", value: { temperatures: [30, 60, 90] } },
        ],
        
        render: ({ visualization }) => {
          const input = visualization.input as DailyTemperaturesInput;
          const temperatures = input.temperatures;

          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-red-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">每日温度（单调栈）</h3>
              </div>
              
              <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-red-700">💡 核心思想：</span>
                  使用单调递减栈存储索引，当遇到更高温度时，栈中所有较低温度都找到了答案。
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  注：本题目可视化较复杂，建议查看题解代码理解单调栈的应用。
                </p>
              </div>

              <div className="flex gap-2 justify-center flex-wrap">
                {temperatures.map((temp, idx) => (
                  <motion.div
                    key={idx}
                    className="w-16 h-20 bg-gradient-to-t from-red-100 to-orange-100 rounded-lg flex flex-col items-center justify-center border-2 border-red-300"
                  >
                    <div className="text-xs text-gray-600">Day {idx}</div>
                    <div className="text-xl font-bold text-red-700">{temp}°</div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default DailyTemperaturesVisualizer;
