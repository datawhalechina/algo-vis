import { useState } from "react";
import PlaybackControls from "@/components/controls/PlaybackControls";
import { generateClimbingStairsSteps } from "./algorithm";
import { motion } from "framer-motion";
import { useVisualization } from "@/hooks/useVisualization";

interface ClimbingStairsInput {
  n: number;
}

function ClimbingStairsVisualizer() {
  const visualization = useVisualization<ClimbingStairsInput>(
    (input) => generateClimbingStairsSteps(input.n),
    { n: 5 }
  );

  const {
    input,
    setInput,
    steps,
    currentStep,
    isPlaying,
    speed,
    setSpeed,
    handlePlay,
    handlePause,
    handleStepForward,
    handleStepBackward,
    handleReset,
    currentStepData,
  } = visualization;

  // 用于输入框的临时值
  const [inputValue, setInputValue] = useState<string>(input.n.toString());

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const n = parseInt(value);
    if (!isNaN(n) && n >= 1 && n <= 45) {
      setInput({ n });
    }
  };

  const dp = (currentStepData?.data as { dp?: number[] })?.dp || [];
  const currentStepNum = currentStepData?.variables?.step as number | undefined;
  const formula = currentStepData?.variables?.formula as string | undefined;
  const prev1 = currentStepData?.variables?.prev1 as number | undefined;
  const prev2 = currentStepData?.variables?.prev2 as number | undefined;
  const currentValue = currentStepData?.variables?.current as number | undefined;
  const finished = currentStepData?.variables?.finished as boolean | undefined;
  const result = currentStepData?.variables?.result as number | undefined;

  return (
    <div className="flex flex-col h-full">

      {/* 播放控制器 */}
      {steps.length > 0 && (
        <PlaybackControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={steps.length}
          speed={speed}
          onPlay={handlePlay}
          onPause={handlePause}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onReset={handleReset}
          onSpeedChange={setSpeed}
        />
      )}

      {/* 可视化区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 测试用例 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">测试用例</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              楼梯阶数 n (1-45):
            </label>
            <input
              type="number"
              min="1"
              max="45"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="请输入1-45之间的数字"
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
            />
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            {[3, 5, 10, 20, 30].map((n) => (
              <button
                key={n}
                onClick={() => handleInputChange(n.toString())}
                className="px-3 py-1 bg-white text-primary-700 text-sm rounded-md hover:bg-blue-100 transition border border-blue-200 font-medium"
              >
                n = {n}
              </button>
            ))}
          </div>
        </div>

        {/* 步骤说明 */}
        {currentStepData && (
          <div className={`rounded-lg p-5 border ${
            finished
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                finished ? 'bg-green-500' : 'bg-amber-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium leading-relaxed">
                  {currentStepData.description}
                </p>
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
              </div>
            </div>
          </div>
        )}

        {/* 楼梯可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <span>🪜</span>
            楼梯可视化
          </h3>
          <div className="flex items-end justify-center min-h-[350px] bg-gradient-to-b from-slate-50 to-white p-8 rounded-xl border border-gray-100">
            {/* 楼梯台阶 */}
            <div className="flex flex-col-reverse items-start gap-2">
              {Array.from({ length: input.n }, (_, i) => i + 1).map((step) => {
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
                爬 <span className="font-bold text-white text-xl">{input.n}</span> 阶楼梯共有
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
      </div>
    </div>
  );
}

export default ClimbingStairsVisualizer;
