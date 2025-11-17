import { useState } from "react";
import PlaybackControls from "@/components/controls/PlaybackControls";
import { generateMoveZeroesSteps } from "./algorithm";
import { motion } from "framer-motion";
import { useVisualization } from "@/hooks/useVisualization";

interface MoveZeroesInput {
  nums: number[];
}

function MoveZeroesVisualizer() {
  const visualization = useVisualization<MoveZeroesInput>(
    (input) => generateMoveZeroesSteps(input.nums),
    { nums: [0, 1, 0, 3, 12] }
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

  // 用于输入框的临时字符串值
  const [inputString, setInputString] = useState<string>(input.nums.join(","));

  const handleInputChange = (value: string) => {
    setInputString(value);
    const nums = value
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n));
    
    if (nums.length > 0) {
      setInput({ nums });
    }
  };

  // 处理预设测试用例
  const handleTestCaseSelect = (nums: number[]) => {
    setInputString(nums.join(","));
    setInput({ nums });
  };

  const nums = (currentStepData?.data as { nums: number[] })?.nums || input.nums;
  const slow = currentStepData?.variables?.slow as number | undefined;
  const fast = currentStepData?.variables?.fast as number | undefined;
  const beforeSwap = currentStepData?.variables?.beforeSwap as boolean | undefined;
  const afterSwap = currentStepData?.variables?.afterSwap as boolean | undefined;
  const finished = currentStepData?.variables?.finished as boolean | undefined;

  return (
    <div className="flex flex-col h-full">

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

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 测试用例 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">测试用例</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数组 nums:
            </label>
            <input
              type="text"
              value={inputString}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="输入数字，用逗号分隔，如: 0,1,0,3,12"
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
            />
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            {[
              { label: "示例 1", nums: [0, 1, 0, 3, 12] },
              { label: "示例 2", nums: [0] },
              { label: "示例 3", nums: [1, 0, 2, 0, 3] },
            ].map((testCase, index) => (
              <button
                key={index}
                onClick={() => handleTestCaseSelect(testCase.nums)}
                className="px-3 py-1 bg-white text-primary-700 text-sm rounded-md hover:bg-blue-100 transition border border-blue-200 font-medium"
              >
                {testCase.label}
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
                <div className="mt-3 bg-white rounded-lg p-4 border">
                  <div className="flex gap-6 text-sm">
                    {slow !== undefined && (
                      <div>
                        <span className="font-mono text-blue-600 font-semibold">slow</span>
                        <span className="text-gray-500"> = </span>
                        <span className="font-mono text-gray-800 font-semibold">{slow}</span>
                      </div>
                    )}
                    {fast !== undefined && (
                      <div>
                        <span className="font-mono text-green-600 font-semibold">fast</span>
                        <span className="text-gray-500"> = </span>
                        <span className="font-mono text-gray-800 font-semibold">{fast}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 数组可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">数组可视化</h3>
          <div className="flex items-center justify-center gap-3 min-h-[150px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg">
            {nums.map((value: number, index: number) => {
              const isSlow = slow === index;
              const isFast = fast === index;
              const isZero = value === 0;

              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: (beforeSwap || afterSwap) && (isSlow || isFast) ? 1.1 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {/* 指针标记 */}
                  {(isSlow || isFast) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        isSlow ? 'bg-blue-600' : 'bg-green-600'
                      }`}
                    >
                      {isSlow ? 'SLOW' : 'FAST'}
                    </motion.div>
                  )}

                  {/* 数组元素 */}
                  <motion.div
                    className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg ${
                      isZero
                        ? 'bg-gray-200 text-gray-500 border-gray-400'
                        : isSlow || isFast
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white border-blue-600 shadow-lg'
                        : 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border-green-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {value}
                  </motion.div>

                  {/* 索引 */}
                  <div className="text-sm text-gray-600 font-mono">[{index}]</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 最终结果 */}
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 mb-2">
                ✓ 移动完成！
              </div>
              <div className="text-lg text-gray-700">
                结果：<span className="font-mono font-bold text-green-600">[{nums.join(', ')}]</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default MoveZeroesVisualizer;
