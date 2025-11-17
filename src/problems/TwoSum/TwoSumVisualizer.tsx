import { useState } from "react";
import PlaybackControls from "@/components/controls/PlaybackControls";
import CodeDisplay from "@/components/CodeDisplay";
import { generateTwoSumSteps } from "./algorithm";
import { Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVisualization } from "@/hooks/useVisualization";

interface TwoSumInput {
  nums: number[];
  target: number;
}

function TwoSumVisualizer() {
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

  // 用于输入框的临时字符串值
  const [numsString, setNumsString] = useState<string>(input.nums.join(","));
  const [targetString, setTargetString] = useState<string>(input.target.toString());

  const code = `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`;

  // 是否显示代码区域
  const [showCode, setShowCode] = useState<boolean>(false);

  // 处理 nums 输入变化
  const handleNumsChange = (value: string) => {
    setNumsString(value);
    const nums = value
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n));
    
    if (nums.length > 0) {
      setInput({ nums, target: input.target });
    }
  };

  // 处理 target 输入变化
  const handleTargetChange = (value: string) => {
    setTargetString(value);
    const target = parseInt(value);
    if (!isNaN(target)) {
      setInput({ nums: input.nums, target });
    }
  };

  // 处理预设测试用例
  const handleTestCaseSelect = (nums: number[], target: number) => {
    setNumsString(nums.join(","));
    setTargetString(target.toString());
    setInput({ nums, target });
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
      {/* 播放控制栏 */}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数组 nums:
              </label>
              <input
                type="text"
                value={numsString}
                onChange={(e) => handleNumsChange(e.target.value)}
                placeholder="输入数字，用逗号分隔，如: 2,7,11,15"
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标值 target:
              </label>
              <input
                type="number"
                value={targetString}
                onChange={(e) => handleTargetChange(e.target.value)}
                placeholder="请输入目标值"
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            {[
              { label: "示例 1", nums: [2, 7, 11, 15], target: 9 },
              { label: "示例 2", nums: [3, 2, 4], target: 6 },
              { label: "示例 3", nums: [3, 3], target: 6 },
            ].map((testCase, index) => (
              <button
                key={index}
                onClick={() => handleTestCaseSelect(testCase.nums, testCase.target)}
                className="px-3 py-1 bg-white text-primary-700 text-sm rounded-md hover:bg-blue-100 transition border border-blue-200 font-medium"
              >
                {testCase.label}
              </button>
            ))}
          </div>
        </div>

        {/* 执行步骤说明 */}
        {currentStepData && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium leading-relaxed">{currentStepData.description}</p>
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
                        isComplement ? "bg-purple-500 text-white" : "bg-yellow-500 text-white"
                      }`}
                    >
                      {isComplement ? "补数" : "当前"}
                    </motion.div>
                  )}

                  {/* 值显示 */}
                  <motion.div
                    className={`text-sm font-bold ${
                      isResultIndex
                        ? "text-green-600"
                        : isComplement
                        ? "text-purple-600"
                        : isCurrentIndex
                        ? "text-yellow-600"
                        : isInHashMap
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                    animate={{
                      scale: isCurrentIndex || isResultIndex || isComplement ? 1.2 : 1,
                    }}
                  >
                    {value}
                  </motion.div>

                  {/* 柱状图 */}
                  <motion.div
                    className={`w-16 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                      isResultIndex
                        ? "bg-gradient-to-t from-green-500 to-green-400 shadow-lg shadow-green-200"
                        : isComplement
                        ? "bg-gradient-to-t from-purple-500 to-purple-400 shadow-lg shadow-purple-200"
                        : isCurrentIndex
                        ? "bg-gradient-to-t from-yellow-500 to-yellow-400 shadow-lg shadow-yellow-200"
                        : isInHashMap
                        ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-md shadow-blue-200"
                        : "bg-gradient-to-t from-gray-400 to-gray-300"
                    }`}
                    style={{ height: `${Math.max(60, Math.abs(value) * 4)}px` }}
                    animate={{
                      scale: isCurrentIndex || isResultIndex || isComplement ? 1.05 : 1,
                    }}
                  >
                    <span className="text-white text-sm font-bold">{value}</span>
                  </motion.div>

                  {/* 索引 */}
                  <div className={`text-xs font-semibold ${
                    isResultIndex
                      ? "text-green-600"
                      : isComplement
                      ? "text-purple-600"
                      : isCurrentIndex
                      ? "text-yellow-600"
                      : isInHashMap
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}>
                    [{index}]
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 图例 */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded"></div>
              <span className="text-gray-700">当前遍历</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-purple-500 to-purple-400 rounded"></div>
              <span className="text-gray-700">找到补数</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
              <span className="text-gray-700">已存入哈希表</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
              <span className="text-gray-700">找到答案</span>
            </div>
          </div>
        </div>

        {/* 哈希表可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Hash className="text-primary-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">哈希表状态（Map 存储）</h3>
            </div>
            {/* 代码切换按钮 */}
            <button
              onClick={() => setShowCode(!showCode)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center gap-2"
            >
              {showCode ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  隐藏代码
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  查看代码
                </>
              )}
            </button>
          </div>
          
          {/* 算法核心思想说明 */}
          <div className="mb-4 bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
            <p className="text-sm text-gray-700">
              <span className="font-bold text-cyan-700">核心思想：</span>
              遍历数组时，将 <span className="font-mono font-semibold">数值 → 索引</span> 存入哈希表。
              对于每个元素，检查 <span className="font-mono font-semibold">complement = target - 当前值</span> 是否在哈希表中，
              若存在则找到答案，否则继续遍历。时间复杂度 O(n)，空间复杂度 O(n)。
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200 min-h-[140px]">
            {currentHashMap.size === 0 ? (
              <div className="flex items-center justify-center h-20 text-gray-500">
                <div className="text-center">
                  <Hash className="mx-auto mb-2 text-gray-400" size={32} />
                  <p>哈希表为空，开始遍历...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence>
                    {Array.from(currentHashMap.entries()).map(([key, value], idx) => {
                      const isComplement = complement === key;
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                          animate={{ 
                            opacity: 1, 
                            scale: isComplement ? 1.05 : 1, 
                            rotateY: 0 
                          }}
                          exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                            isComplement 
                              ? "border-2 border-purple-500 shadow-lg shadow-purple-200" 
                              : "border-2 border-purple-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-xs text-gray-600 mb-1">Key (数值)</div>
                              <div className={`text-2xl font-bold ${
                                isComplement ? "text-purple-600" : "text-purple-500"
                              }`}>
                                {key}
                              </div>
                            </div>
                            <div className="text-gray-400 text-2xl mx-2">→</div>
                            <div className="flex-1 text-right">
                              <div className="text-xs text-gray-600 mb-1">Value (索引)</div>
                              <div className={`text-2xl font-bold ${
                                isComplement ? "text-purple-600" : "text-gray-700"
                              }`}>
                                [{value}]
                              </div>
                            </div>
                          </div>
                          {isComplement && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-2 text-xs text-center text-purple-600 font-bold bg-purple-100 py-1 rounded"
                            >
                              ✓ 这是补数！
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                
                {/* 哈希表大小 */}
                <div className="text-sm text-gray-600 text-center pt-2 border-t border-purple-200">
                  <span className="font-semibold">哈希表大小：</span>
                  <span className="ml-2 font-mono text-purple-600 font-bold">{currentHashMap.size}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 补数计算说明 */}
          <div className="mt-3 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="font-semibold text-amber-800">补数计算：</span>
            {complement !== undefined ? (
              <span className="ml-2 font-mono text-amber-700 font-semibold">
                complement = {input.target} - {input.nums[currentIndex!]} = {complement}
                {currentHashMap.has(complement) 
                  ? ` ✓ 存在于哈希表` 
                  : ` ✗ 不存在，将 ${input.nums[currentIndex!]} 存入哈希表`
                }
              </span>
            ) : (
              <span className="ml-2 text-gray-500">等待开始遍历...</span>
            )}
          </div>
        </div>

        {/* 代码显示（可选） */}
        {showCode && (
          <CodeDisplay
            code={code}
            language="typescript"
            title="哈希表解法（TypeScript）"
            highlightedLines={
              currentStepData?.code
                ? [parseInt(currentStepData.code)]
                : []
            }
          />
        )}
      </div>
    </div>
  );
}

export default TwoSumVisualizer;
