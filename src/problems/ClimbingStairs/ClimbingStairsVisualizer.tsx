import { generateClimbingStairsSteps } from "./algorithm";
import { motion } from "framer-motion";
import { useVisualization } from "@/hooks/useVisualization";
import { VisualizationLayout } from "@/components/visualizers/VisualizationLayout";
import {
  getNumberVariable,
  getBooleanVariable,
  StepVariables,
} from "@/types/visualization";

interface ClimbingStairsInput {
  n: number;
}

function ClimbingStairsVisualizer() {
  const visualization = useVisualization<ClimbingStairsInput>(
    (input) => generateClimbingStairsSteps(input.n),
    { n: 5 }
  );

  const variables = visualization.currentStepData?.variables;
  const dp = (visualization.currentStepData?.data as { dp?: number[] })?.dp || [];
  const currentStepNum = getNumberVariable(variables, 'step');
  const finished = getBooleanVariable(variables, 'finished');
  const result = getNumberVariable(variables, 'result');

  // 自定义变量显示
  const customVariables = (variables: StepVariables) => {
    const prev1 = getNumberVariable(variables, 'prev1');
    const prev2 = getNumberVariable(variables, 'prev2');
    const currentValue = getNumberVariable(variables, 'current');
    const formula = variables?.formula as string | undefined;
    
    return (
      <>
        {formula && (
          <div className="mt-3 bg-white rounded-lg p-4 border border-amber-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">状态转移方程：</p>
            <p className="font-mono text-lg text-blue-700 font-bold">{formula}</p>
          </div>
        )}
        {(prev1 !== undefined || prev2 !== undefined) && (
          <div className="mt-3 bg-white rounded-lg p-4 border">
            <div className="flex gap-6 text-sm">
              {prev2 !== undefined && (
                <div>
                  <span className="font-mono text-purple-600 font-semibold">prev2</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{prev2}</span>
                </div>
              )}
              {prev1 !== undefined && (
                <div>
                  <span className="font-mono text-blue-600 font-semibold">prev1</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{prev1}</span>
                </div>
              )}
              {currentValue !== undefined && (
                <div>
                  <span className="font-mono text-green-600 font-semibold">current</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{currentValue}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <VisualizationLayout
      visualization={visualization}
      inputTypes={[{ type: "number", key: "n", label: "楼梯阶数" }]}
      inputFields={[{ type: "number", key: "n", label: "楼梯阶数 n (1-45)", placeholder: "请输入1-45之间的数字" }]}
      testCases={[
        { label: "n = 3", value: { n: 3 } },
        { label: "n = 5", value: { n: 5 } },
        { label: "n = 10", value: { n: 10 } },
        { label: "n = 20", value: { n: 20 } },
        { label: "n = 30", value: { n: 30 } },
      ]}
      customStepVariables={customVariables}
    >

        {/* 楼梯可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>🪜</span>
            楼梯可视化
          </h3>
          <div className="flex items-end justify-center min-h-[350px] bg-gradient-to-b from-slate-50 to-white p-8 rounded-xl border border-gray-100">
            {/* 楼梯台阶 */}
            <div className="flex flex-col-reverse items-start gap-2">
              {Array.from({ length: visualization.input.n }, (_, i) => i + 1).map((step) => {
                const isCurrentStep = currentStepNum === step;
                const isComputed = dp[step] !== undefined;
                const stairWidth = Math.max(160, 100 + step * 15);

                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step * 0.05 }}
                    className="relative"
                    style={{ width: stairWidth }}
                  >
                    {/* 台阶 */}
                    <motion.div
                      className={`h-16 rounded-r-xl border-2 flex items-center justify-between px-5 shadow-md ${
                        isCurrentStep
                          ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 border-blue-600 shadow-blue-200 shadow-lg'
                          : isComputed
                          ? 'bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 border-green-400 shadow-green-100'
                          : 'bg-gradient-to-r from-gray-100 via-gray-150 to-gray-200 border-gray-300'
                      }`}
                      animate={{
                        scale: isCurrentStep ? 1.03 : 1,
                        y: isCurrentStep ? -2 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* 左侧：阶数 */}
                      <div className="flex flex-col">
                        <span className={`text-xs font-semibold ${
                          isCurrentStep ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          STEP
                        </span>
                        <span className={`text-lg font-bold ${
                          isCurrentStep ? 'text-white' : 'text-gray-700'
                        }`}>
                          {step}
                        </span>
                      </div>

                      {/* 右侧：方法数 */}
                      {isComputed && (
                        <motion.div
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className={`flex items-baseline gap-1 ${
                            isCurrentStep 
                              ? 'bg-white/20 backdrop-blur-sm' 
                              : 'bg-white/50'
                          } px-3 py-1.5 rounded-lg`}
                        >
                          <span className={`font-mono font-bold text-2xl ${
                            isCurrentStep ? 'text-white' : 'text-green-700'
                          }`}>
                            {dp[step]}
                          </span>
                          <span className={`text-xs font-semibold ${
                            isCurrentStep ? 'text-blue-100' : 'text-gray-600'
                          }`}>
                            种
                          </span>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* 当前步骤标记 */}
                    {isCurrentStep && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute -right-20 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-1"
                      >
                        <span>👉</span>
                        当前
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DP数组可视化 */}
        {dp.length > 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <span>📊</span>
              动态规划数组 (DP Table)
            </h3>
            <div className="flex flex-wrap gap-4 justify-center p-4">
              {dp.slice(1).map((value, index) => {
                const step = index + 1;
                const isCurrentStep = currentStepNum === step;
                
                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isCurrentStep ? 1.08 : 1,
                      y: isCurrentStep ? -4 : 0
                    }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 min-w-[100px] transition-all ${
                      isCurrentStep
                        ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 border-blue-600 shadow-xl shadow-blue-200'
                        : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-300 shadow-md hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {/* 顶部标签 */}
                    <div className={`text-xs font-bold tracking-wider ${
                      isCurrentStep ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      f({step})
                    </div>
                    
                    {/* 数值 */}
                    <div className={`text-3xl font-bold font-mono ${
                      isCurrentStep ? 'text-white' : 'text-gray-800'
                    }`}>
                      {value}
                    </div>
                    
                    {/* 底部标签 */}
                    <div className={`text-xs font-semibold ${
                      isCurrentStep 
                        ? 'bg-white/20 text-white px-3 py-1 rounded-full' 
                        : 'text-gray-500'
                    }`}>
                      第 {step} 阶
                    </div>

                    {/* 当前标记 */}
                    {isCurrentStep && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                      >
                        ⭐
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* 算法说明 */}
        <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              动态规划思路
            </span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg">
              <span className="text-purple-600 font-bold text-sm">📌</span>
              <div>
                <strong className="text-purple-700">状态定义：</strong>
                <span className="text-gray-700 ml-2">f(n) 表示爬到第 n 阶的方法数</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg">
              <span className="text-indigo-600 font-bold text-sm">🔄</span>
              <div>
                <strong className="text-indigo-700">状态转移：</strong>
                <span className="text-gray-700 ml-2 font-mono">f(n) = f(n-1) + f(n-2)</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg">
              <span className="text-blue-600 font-bold text-sm">🎯</span>
              <div>
                <strong className="text-blue-700">初始状态：</strong>
                <span className="text-gray-700 ml-2 font-mono">f(1) = 1, f(2) = 2</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg">
              <span className="text-cyan-600 font-bold text-sm">✨</span>
              <div>
                <strong className="text-cyan-700">解释：</strong>
                <span className="text-gray-700 ml-2">到达第 n 阶可以从第 n-1 阶爬1步，或从第 n-2 阶爬2步</span>
              </div>
            </div>
          </div>
        </div>

      {/* 最终结果 */}
      {finished && result !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          {/* 内容 */}
          <div className="relative text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <div className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
              计算完成！
            </div>
            <div className="text-lg text-white/90 mb-4">
              爬 <span className="font-bold text-white text-xl">{visualization.input.n}</span> 阶楼梯共有
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
              className="inline-block bg-white rounded-2xl px-8 py-4 shadow-xl"
            >
              <span className="font-mono font-bold text-transparent bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-5xl">
                {result}
              </span>
              <span className="text-gray-600 text-2xl ml-3 font-semibold">种方法</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </VisualizationLayout>
  );
}

export default ClimbingStairsVisualizer;
