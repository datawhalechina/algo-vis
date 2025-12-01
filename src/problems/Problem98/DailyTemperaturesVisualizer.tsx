import { TrendingUp } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";
import { dailyTemperaturesSteps } from "./algorithm";

interface DailyTemperaturesInput extends ProblemInput {
  temperatures: number[];
}

function DailyTemperaturesVisualizer() {
  return (
    <ConfigurableVisualizer<DailyTemperaturesInput, Record<string, any>>
      config={{
        defaultInput: { temperatures: [73, 74, 75, 71, 69, 72, 76, 73] },
        algorithm: (input) => dailyTemperaturesSteps(input.temperatures),
        
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
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as DailyTemperaturesInput;
          const temperatures = input.temperatures;
          const answer = variables?.answer as number[] | undefined;
          const stack = variables?.stack as number[] | undefined;
          const currentIndex = variables?.currentIndex as number | undefined;
          const currentTemp = variables?.currentTemp as number | undefined;

          const coreIdea = getProblemCoreIdea(98);
          
          return (
            <>
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-red-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-800">每日温度 - 单调栈</h3>
                </div>

              {/* 当前温度 */}
              {currentTemp !== undefined && currentIndex !== undefined && (
                <div className="mb-6 p-4 bg-blue-100 rounded-lg border-2 border-blue-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700">当前检查</div>
                    <div className="text-2xl font-bold text-blue-700">
                      第 {currentIndex} 天: {currentTemp}°
                    </div>
                  </div>
                </div>
              )}

              {/* 温度数组 */}
              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">温度数组</div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <ArrayTemplate
                    data={temperatures}
                    renderItem={(temp: number, index: number, state) => {
                      const isActive = state.isActive;
                      return (
                        <div 
                          className="w-16 h-20 rounded-lg flex flex-col items-center justify-center border-2 transition-all"
                          style={{
                            backgroundColor: isActive 
                              ? '#fecaca' 
                              : '#fed7aa',
                            borderColor: isActive ? '#dc2626' : '#f97316',
                            transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          }}
                        >
                          <div className="text-xs text-gray-600">Day {index}</div>
                          <div className="text-xl font-bold text-red-700">{temp}°</div>
                        </div>
                      );
                    }}
                    getItemState={(index: number) => ({
                      isActive: currentIndex === index,
                    })}
                    layout={{
                      direction: 'row',
                      gap: '0.5rem',
                      wrap: true,
                      justify: 'center'
                    }}
                    animation={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* 答案数组 */}
              {answer && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">答案数组（几天后温度升高）</div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <ArrayTemplate
                      data={answer}
                      renderItem={(days: number, index: number) => (
                        <div 
                          className="w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold border-2"
                          style={{
                            backgroundColor: days > 0 ? '#bbf7d0' : '#f3f4f6',
                            borderColor: days > 0 ? '#16a34a' : '#d1d5db',
                            color: days > 0 ? '#15803d' : '#6b7280',
                          }}
                        >
                          <div className="text-xs opacity-70">[{index}]</div>
                          <div className="text-lg">{days}</div>
                        </div>
                      )}
                      getItemState={(index: number) => ({
                        isActive: currentIndex === index,
                      })}
                      layout={{
                        direction: 'row',
                        gap: '0.5rem',
                        wrap: true,
                        justify: 'center'
                      }}
                      animation={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* 单调栈 */}
              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-700 mb-2">单调栈（存储索引）</div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 min-h-24">
                  {stack && stack.length > 0 ? (
                    <ArrayTemplate
                      data={stack}
                      renderItem={(idx: number) => (
                        <div className="w-20 h-16 rounded-lg flex flex-col items-center justify-center font-bold text-lg bg-gradient-to-br from-purple-100 to-purple-200 text-purple-900 border-2 border-purple-400 shadow-md">
                          <div className="text-xs opacity-70">索引</div>
                          <div>{idx}</div>
                          <div className="text-xs opacity-70">{temperatures[idx]}°</div>
                        </div>
                      )}
                      getItemState={() => ({ isActive: false })}
                      layout={{
                        direction: 'row',
                        gap: '0.5rem',
                        wrap: true,
                        justify: 'center'
                      }}
                      animation={{ duration: 0.3 }}
                    />
                  ) : (
                    <div className="text-center text-gray-400 py-4">栈为空</div>
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

export default DailyTemperaturesVisualizer;
