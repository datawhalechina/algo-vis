import { useState } from "react";
import PlaybackControls from "@/components/controls/PlaybackControls";
import { generateContainerSteps } from "./algorithm";
import { motion } from "framer-motion";
import { useVisualization } from "@/hooks/useVisualization";

interface ContainerInput {
  height: number[];
}

function ContainerVisualizer() {
  // 使用通用 Hook
  const visualization = useVisualization<ContainerInput>(
    (input) => generateContainerSteps(input.height),
    { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }
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
  const [heightString, setHeightString] = useState<string>(input.height.join(","));

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setHeightString(value);
    const height = value
      .split(",")
      .map((h) => parseInt(h.trim()))
      .filter((h) => !isNaN(h) && h >= 0);
    
    if (height.length >= 2) {
      setInput({ height });
    }
  };

  // 处理预设测试用例
  const handleTestCaseSelect = (height: number[]) => {
    setHeightString(height.join(","));
    setInput({ height });
  };

  const left = currentStepData?.variables?.left as number | undefined;
  const right = currentStepData?.variables?.right as number | undefined;
  const maxArea = currentStepData?.variables?.maxArea as number | undefined;
  const currentArea = currentStepData?.variables?.currentArea as number | undefined;
  const currentHeight = currentStepData?.variables?.currentHeight as number | undefined;
  const width = currentStepData?.variables?.width as number | undefined;
  const isNewMax = currentStepData?.variables?.isNewMax as boolean | undefined;
  const finished = currentStepData?.variables?.finished as boolean | undefined;

  // 计算最大高度用于归一化
  const maxHeight = Math.max(...input.height, 1);

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
              高度数组 height (至少两个元素):
            </label>
            <input
              type="text"
              value={heightString}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="输入高度数组，用逗号分隔，如: 1,8,6,2,5,4,8,3,7"
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
            />
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            {[
              { label: "示例 1", height: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
              { label: "示例 2", height: [1, 1] },
              { label: "示例 3", height: [4, 3, 2, 1, 4] },
              { label: "大数据", height: [1, 2, 4, 3, 7, 5, 8, 9, 6, 2] },
            ].map((testCase, index) => (
              <button
                key={index}
                onClick={() => handleTestCaseSelect(testCase.height)}
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
            isNewMax
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              : finished
              ? 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200'
              : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                isNewMax ? 'bg-green-500' : finished ? 'bg-purple-500' : 'bg-amber-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium leading-relaxed">
                  {currentStepData.description}
                </p>
                {currentStepData.variables && (
                  <div className="mt-3 bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">当前变量：</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {left !== undefined && (
                        <div>
                          <span className="font-mono text-blue-600 font-semibold">left</span>
                          <span className="text-gray-500"> = </span>
                          <span className="font-mono text-gray-800 font-semibold">{left}</span>
                        </div>
                      )}
                      {right !== undefined && (
                        <div>
                          <span className="font-mono text-blue-600 font-semibold">right</span>
                          <span className="text-gray-500"> = </span>
                          <span className="font-mono text-gray-800 font-semibold">{right}</span>
                        </div>
                      )}
                      {maxArea !== undefined && (
                        <div>
                          <span className="font-mono text-purple-600 font-semibold">maxArea</span>
                          <span className="text-gray-500"> = </span>
                          <span className="font-mono text-gray-800 font-semibold">{maxArea}</span>
                        </div>
                      )}
                      {currentArea !== undefined && (
                        <div>
                          <span className="font-mono text-green-600 font-semibold">currentArea</span>
                          <span className="text-gray-500"> = </span>
                          <span className="font-mono text-gray-800 font-semibold">{currentArea}</span>
                        </div>
                      )}
                      {width !== undefined && (
                        <div>
                          <span className="font-mono text-orange-600 font-semibold">width</span>
                          <span className="text-gray-500"> = </span>
                          <span className="font-mono text-gray-800 font-semibold">{width}</span>
                        </div>
                      )}
                      {currentHeight !== undefined && (
                        <div>
                          <span className="font-mono text-cyan-600 font-semibold">height</span>
                          <span className="text-gray-500"> = </span>
                          <span className="font-mono text-gray-800 font-semibold">{currentHeight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 容器可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">容器可视化</h3>
          
          {/* 当前面积显示 */}
          {currentArea !== undefined && (
            <div className="mb-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="font-semibold text-gray-700">当前容器：</span>
                <span className="font-mono text-cyan-700 font-bold">
                  面积 = {width} × {currentHeight} = {currentArea}
                </span>
                {maxArea !== undefined && maxArea > 0 && (
                  <span className={`font-semibold ${
                    currentArea === maxArea ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {currentArea === maxArea ? '✓ 当前最大' : `最大: ${maxArea}`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 柱状图 */}
          <div className="relative flex items-end justify-center gap-1 min-h-[300px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
            {input.height.map((h: number, index: number) => {
              const isLeft = left === index;
              const isRight = right === index;
              const isBetween = left !== undefined && right !== undefined && index > left && index < right;
              const normalizedHeight = (h / maxHeight) * 250;

              return (
                <div key={index} className="relative flex flex-col items-center gap-2">
                  {/* 柱子 */}
                  <motion.div
                    className="relative"
                    style={{ height: normalizedHeight }}
                    initial={{ height: 0 }}
                    animate={{ height: normalizedHeight }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={`w-12 h-full rounded-t-lg border-2 transition-all ${
                        isLeft
                          ? 'bg-gradient-to-t from-blue-400 to-blue-500 border-blue-600 shadow-lg'
                          : isRight
                          ? 'bg-gradient-to-t from-green-400 to-green-500 border-green-600 shadow-lg'
                          : isBetween && currentHeight
                          ? 'bg-gradient-to-t from-cyan-200 to-cyan-300 border-cyan-400'
                          : 'bg-gradient-to-t from-gray-200 to-gray-300 border-gray-400'
                      }`}
                      animate={{
                        scale: isLeft || isRight ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    {/* 水面标记 */}
                    {isBetween && currentHeight && (
                      <motion.div
                        className="absolute left-0 right-0 bg-cyan-400 opacity-30"
                        style={{
                          bottom: 0,
                          height: Math.min(normalizedHeight, (currentHeight / maxHeight) * 250),
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                      />
                    )}
                  </motion.div>

                  {/* 高度标签 */}
                  <div className={`text-xs font-mono font-bold ${
                    isLeft || isRight ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {h}
                  </div>

                  {/* 索引 */}
                  <div className="text-xs text-gray-500 font-mono">[{index}]</div>

                  {/* 指针标记 */}
                  {(isLeft || isRight) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`absolute -top-8 px-2 py-1 rounded-full text-xs font-bold text-white ${
                        isLeft ? 'bg-blue-600' : 'bg-green-600'
                      }`}
                    >
                      {isLeft ? 'LEFT' : 'RIGHT'}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 最终结果 */}
        {finished && maxArea !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 mb-2">
                ✓ 找到最大容器！
              </div>
              <div className="text-lg text-gray-700">
                最大面积 = <span className="font-mono font-bold text-green-600">{maxArea}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ContainerVisualizer;
