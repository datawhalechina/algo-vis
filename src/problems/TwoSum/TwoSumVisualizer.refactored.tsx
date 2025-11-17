/**
 * 两数之和 - 可视化组件（重构版）
 * 
 * 使用新的 useVisualization Hook 大幅简化代码
 * 从原来的 488 行减少到 ~250 行
 */

import PlaybackControls from "@/components/controls/PlaybackControls";
import { generateTwoSumSteps } from "./algorithm";
import { motion } from "framer-motion";
import { useVisualization } from "@/hooks/useVisualization";

interface TwoSumInput {
  nums: number[];
  target: number;
}

function TwoSumVisualizer() {
  // 使用通用的可视化 Hook - 大幅简化状态管理
  const visualization = useVisualization<TwoSumInput>(
    (input) => generateTwoSumSteps(input.nums, input.target),
    { nums: [2, 7, 11, 15], target: 9 }
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

  // 自定义输入处理
  const handleInputChange = () => {
    const numsInput = prompt("请输入数组（用逗号分隔）", input.nums.join(","));
    const targetInput = prompt("请输入目标值", input.target.toString());

    if (numsInput) {
      const newNums = numsInput.split(",").map((n) => parseInt(n.trim()));
      if (newNums.every((n) => !isNaN(n))) {
        setInput({ ...input, nums: newNums });
      }
    }

    if (targetInput) {
      const newTarget = parseInt(targetInput);
      if (!isNaN(newTarget)) {
        setInput({ ...input, target: newTarget });
      }
    }
  };

  // 获取当前哈希表状态
  const getCurrentHashMap = () => {
    const map = new Map<number, number>();
    if (currentStepData?.variables?.map) {
      const mapData = currentStepData.variables.map as Record<number, number>;
      Object.entries(mapData).forEach(([key, value]) => {
        map.set(parseInt(key), value as number);
      });
    }
    return map;
  };

  const currentHashMap = getCurrentHashMap();
  const currentIndex = currentStepData?.variables?.i as number | undefined;
  const complement = currentStepData?.variables?.complement as number | undefined;
  const result = currentStepData?.variables?.result as [number, number] | undefined;

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">测试用例</h3>
            <button
              onClick={handleInputChange}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white rounded-lg transition text-sm font-medium shadow-sm hover:shadow"
            >
              自定义输入
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数组 nums:
              </label>
              <div className="font-mono bg-white px-4 py-3 rounded-lg border border-blue-200 text-gray-800 font-semibold">
                [{input.nums.join(', ')}]
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标值 target:
              </label>
              <div className="font-mono bg-white px-4 py-3 rounded-lg border border-blue-200 text-gray-800 font-semibold">
                {input.target}
              </div>
            </div>
          </div>
        </div>

        {/* 执行步骤说明 */}
        {currentStepData && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium leading-relaxed">
                  {currentStepData.description}
                </p>
                {currentStepData.variables && Object.keys(currentStepData.variables).length > 0 && (
                  <div className="mt-3 bg-white rounded-lg p-4 border border-amber-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      当前变量：
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(currentStepData.variables)
                        .filter(([key]) => key !== 'map')
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
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 数组可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">数组可视化 - 哈希表解法</h3>
          
          {/* 当前操作提示 */}
          {complement !== undefined && (
            <div className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="font-semibold text-gray-700">当前操作：</span>
                <span className="font-mono text-blue-700 font-bold">
                  target({input.target}) - nums[{currentIndex}]({input.nums[currentIndex!]}) = {complement}
                </span>
                <span className="text-gray-600">
                  {currentHashMap.has(complement) 
                    ? `✓ 在哈希表中找到 ${complement}！` 
                    : `✗ 哈希表中没有 ${complement}，继续遍历`
                  }
                </span>
              </div>
            </div>
          )}
          
          {/* 数组元素 */}
          <div className="flex items-end justify-center gap-3 min-h-[180px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
            {input.nums.map((value: number, index: number) => {
              const isCurrentIndex = currentIndex === index;
              const isResultIndex = result && (result[0] === index || result[1] === index);
              const isInHashMap = Array.from(currentHashMap.values()).includes(index);
              const isComplement = currentHashMap.get(complement!) === index;

              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: isCurrentIndex || isResultIndex || isComplement ? 1.05 : 1
                  }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* 标签 */}
                  {(isCurrentIndex || isComplement) && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        isComplement 
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-blue-100 text-blue-700 border border-blue-300'
                      }`}
                    >
                      {isComplement ? '配对' : '当前'}
                    </motion.div>
                  )}

                  {/* 数组元素 */}
                  <motion.div
                    className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 font-bold text-lg transition-all ${
                      isResultIndex
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white border-green-600 shadow-lg'
                        : isCurrentIndex
                        ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white border-blue-600 shadow-lg'
                        : isComplement
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border-green-400'
                        : isInHashMap
                        ? 'bg-gradient-to-br from-purple-100 to-violet-100 text-purple-700 border-purple-300'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {value}
                  </motion.div>

                  {/* 索引 */}
                  <div className="text-sm text-gray-600 font-mono">
                    [{index}]
                  </div>

                  {/* 哈希表状态 */}
                  {isInHashMap && !isResultIndex && (
                    <div className="text-xs text-purple-600 font-semibold">
                      已存储
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 哈希表可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">哈希表状态</h3>
          {currentHashMap.size > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from(currentHashMap.entries()).map(([key, value]: [number, number]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4"
                >
                  <div className="text-sm text-gray-600 mb-1">值 → 索引</div>
                  <div className="font-mono text-lg font-bold text-purple-700">
                    {key} → {value}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              哈希表为空，遍历过程中会逐步填充
            </div>
          )}
        </div>

        {/* 结果展示 */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 mb-2">
                ✓ 找到答案！
              </div>
              <div className="text-lg text-gray-700">
                索引 <span className="font-mono font-bold text-green-600">[{result[0]}, {result[1]}]</span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {input.nums[result[0]]} + {input.nums[result[1]]} = {input.target}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default TwoSumVisualizer;
