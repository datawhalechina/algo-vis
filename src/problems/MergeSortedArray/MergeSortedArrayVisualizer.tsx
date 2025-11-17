import { useState } from "react";
import PlaybackControls from "@/components/controls/PlaybackControls";
import { generateMergeSortedArraySteps } from "./algorithm";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useVisualization } from "@/hooks/useVisualization";

interface MergeSortedArrayInput {
  nums1: number[];
  m: number;
  nums2: number[];
  n: number;
}

function MergeSortedArrayVisualizer() {
  const visualization = useVisualization<MergeSortedArrayInput>(
    (input) => generateMergeSortedArraySteps(input.nums1, input.m, input.nums2, input.n),
    { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 }
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
  const [nums1String, setNums1String] = useState<string>(input.nums1.join(","));
  const [mString, setMString] = useState<string>(input.m.toString());
  const [nums2String, setNums2String] = useState<string>(input.nums2.join(","));
  const [nString, setNString] = useState<string>(input.n.toString());

  // 处理 nums1 输入变化
  const handleNums1Change = (value: string) => {
    setNums1String(value);
    const nums1 = value
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n));
    
    if (nums1.length > 0) {
      setInput({ ...input, nums1 });
    }
  };

  // 处理 m 输入变化
  const handleMChange = (value: string) => {
    setMString(value);
    const m = parseInt(value);
    if (!isNaN(m) && m >= 0) {
      setInput({ ...input, m });
    }
  };

  // 处理 nums2 输入变化
  const handleNums2Change = (value: string) => {
    setNums2String(value);
    const nums2 = value
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n));
    
    if (nums2.length > 0) {
      setInput({ ...input, nums2 });
    }
  };

  // 处理 n 输入变化
  const handleNChange = (value: string) => {
    setNString(value);
    const n = parseInt(value);
    if (!isNaN(n) && n >= 0) {
      setInput({ ...input, n });
    }
  };

  // 处理预设测试用例
  const handleTestCaseSelect = (nums1: number[], m: number, nums2: number[], n: number) => {
    setNums1String(nums1.join(","));
    setMString(m.toString());
    setNums2String(nums2.join(","));
    setNString(n.toString());
    setInput({ nums1, m, nums2, n });
  };
  const currentNums1 = (currentStepData?.data as { nums1: number[]; nums2: number[] })?.nums1 || input.nums1;
  const currentNums2 = (currentStepData?.data as { nums1: number[]; nums2: number[] })?.nums2 || input.nums2;
  
  const p1 = currentStepData?.variables?.p1 as number | undefined;
  const p2 = currentStepData?.variables?.p2 as number | undefined;
  const p = currentStepData?.variables?.p as number | undefined;
  const movedFrom = currentStepData?.variables?.movedFrom as string | undefined;
  const completed = currentStepData?.variables?.completed as boolean | undefined;

  return (
    <div className="flex flex-col h-full">
      {/* 播放控制 */}
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
                nums1 (包含末尾的0):
              </label>
              <input
                type="text"
                value={nums1String}
                onChange={(e) => handleNums1Change(e.target.value)}
                placeholder="如: 1,2,3,0,0,0"
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">
                m (nums1 有效元素个数):
              </label>
              <input
                type="number"
                min="0"
                value={mString}
                onChange={(e) => handleMChange(e.target.value)}
                placeholder="如: 3"
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                nums2:
              </label>
              <input
                type="text"
                value={nums2String}
                onChange={(e) => handleNums2Change(e.target.value)}
                placeholder="如: 2,5,6"
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">
                n (nums2 元素个数):
              </label>
              <input
                type="number"
                min="0"
                value={nString}
                onChange={(e) => handleNChange(e.target.value)}
                placeholder="如: 3"
                className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            {[
              { label: "示例 1", nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 },
              { label: "示例 2", nums1: [1], m: 1, nums2: [], n: 0 },
              { label: "示例 3", nums1: [0], m: 0, nums2: [1], n: 1 },
            ].map((testCase, index) => (
              <button
                key={index}
                onClick={() => handleTestCaseSelect(testCase.nums1, testCase.m, testCase.nums2, testCase.n)}
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
                <p className="text-gray-800 font-medium leading-relaxed">
                  {currentStepData.description}
                </p>
                {currentStepData.variables && (
                  <div className="mt-3 bg-white rounded-lg p-4 border border-amber-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      指针状态：
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-sm">
                        <span className="font-mono text-blue-600 font-semibold">
                          p1
                        </span>
                        <span className="text-gray-500"> = </span>
                        <span className="font-mono text-gray-800 font-semibold">
                          {p1 !== undefined ? p1 : "N/A"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-mono text-purple-600 font-semibold">
                          p2
                        </span>
                        <span className="text-gray-500"> = </span>
                        <span className="font-mono text-gray-800 font-semibold">
                          {p2 !== undefined ? p2 : "N/A"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-mono text-green-600 font-semibold">
                          p
                        </span>
                        <span className="text-gray-500"> = </span>
                        <span className="font-mono text-gray-800 font-semibold">
                          {p !== undefined ? p : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 双数组可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            双指针从后向前合并
          </h3>

          {/* nums1 数组 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                nums1（合并目标数组）
              </h4>
              {p1 !== undefined && p1 >= 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                  p1 = {p1}
                </span>
              )}
              {p !== undefined && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  p = {p}
                </span>
              )}
            </div>
            <div className="flex items-end justify-center gap-2 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
              {currentNums1.map((value, index) => {
                const isP1 = p1 === index;
                const isP = p === index;
                const isValid = index < input.m;

                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    {/* 指针标记 */}
                    <AnimatePresence>
                      {(isP1 || isP) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="relative"
                        >
                          <ArrowDown
                            className={`${
                              isP1 ? "text-blue-600" : "text-green-600"
                            }`}
                            size={20}
                          />
                          <span
                            className={`absolute -top-1 -right-1 text-xs font-bold ${
                              isP1
                                ? "text-blue-600"
                                : isP
                                ? "text-green-600"
                                : ""
                            }`}
                          >
                            {isP1 ? "p1" : "p"}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 值显示 */}
                    <motion.div
                      className={`text-sm font-bold ${
                        completed
                          ? "text-green-600"
                          : isP
                          ? "text-green-600"
                          : isP1
                          ? "text-blue-600"
                          : value === 0 && !isValid
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                      animate={{
                        scale: isP1 || isP ? 1.2 : 1,
                      }}
                    >
                      {value}
                    </motion.div>

                    {/* 柱状图 */}
                    <motion.div
                      className={`w-12 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                        completed
                          ? "bg-gradient-to-t from-green-500 to-green-400 shadow-md"
                          : isP
                          ? "bg-gradient-to-t from-green-500 to-green-400 shadow-lg shadow-green-200"
                          : isP1
                          ? "bg-gradient-to-t from-blue-500 to-blue-400 shadow-lg shadow-blue-200"
                          : value === 0 && !isValid
                          ? "bg-gradient-to-t from-gray-200 to-gray-100 border-2 border-dashed border-gray-300"
                          : "bg-gradient-to-t from-indigo-400 to-indigo-300"
                      }`}
                      style={{
                        height: `${
                          value === 0 && !isValid
                            ? 60
                            : Math.max(60, Math.abs(value) * 15)
                        }px`,
                      }}
                      animate={{
                        scale: isP1 || isP ? 1.05 : 1,
                      }}
                    >
                      <span className="text-white text-sm font-bold">
                        {value}
                      </span>
                    </motion.div>

                    {/* 索引 */}
                    <div
                      className={`text-xs font-semibold ${
                        completed
                          ? "text-green-600"
                          : isP
                          ? "text-green-600"
                          : isP1
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      [{index}]
                    </div>

                    {/* 区域标识 */}
                    {index === input.m - 1 && !completed && (
                      <div className="absolute mt-[280px] text-xs text-gray-500 font-semibold">
                        ← 有效元素
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 移动动画指示 */}
          {movedFrom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center mb-4"
            >
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-lg border border-purple-200">
                <span className="font-semibold text-purple-700">
                  {movedFrom === "nums1" ? "从 nums1 移动" : "从 nums2 移动"}
                </span>
                <ArrowDown className="text-purple-500" size={20} />
              </div>
            </motion.div>
          )}

          {/* nums2 数组 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                nums2（源数组）
              </h4>
              {p2 !== undefined && p2 >= 0 && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                  p2 = {p2}
                </span>
              )}
            </div>
            <div className="flex items-end justify-center gap-2 min-h-[200px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
              {currentNums2.map((value, index) => {
                const isP2 = p2 === index;
                const isProcessed = p2 !== undefined && index > p2;

                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    {/* 指针标记 */}
                    <AnimatePresence>
                      {isP2 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="relative"
                        >
                          <ArrowDown className="text-purple-600" size={20} />
                          <span className="absolute -top-1 -right-1 text-xs font-bold text-purple-600">
                            p2
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 值显示 */}
                    <motion.div
                      className={`text-sm font-bold ${
                        isProcessed
                          ? "text-gray-400 line-through"
                          : isP2
                          ? "text-purple-600"
                          : "text-gray-700"
                      }`}
                      animate={{
                        scale: isP2 ? 1.2 : 1,
                      }}
                    >
                      {value}
                    </motion.div>

                    {/* 柱状图 */}
                    <motion.div
                      className={`w-12 rounded-lg transition-all duration-300 flex items-end justify-center pb-2 ${
                        isProcessed
                          ? "bg-gradient-to-t from-gray-300 to-gray-200 opacity-40"
                          : isP2
                          ? "bg-gradient-to-t from-purple-500 to-purple-400 shadow-lg shadow-purple-200"
                          : "bg-gradient-to-t from-pink-400 to-pink-300"
                      }`}
                      style={{
                        height: `${Math.max(60, Math.abs(value) * 15)}px`,
                      }}
                      animate={{
                        scale: isP2 ? 1.05 : 1,
                      }}
                    >
                      <span className="text-white text-sm font-bold">
                        {value}
                      </span>
                    </motion.div>

                    {/* 索引 */}
                    <div
                      className={`text-xs font-semibold ${
                        isP2 ? "text-purple-600" : "text-gray-500"
                      }`}
                    >
                      [{index}]
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 图例 */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-blue-500 to-blue-400 rounded"></div>
              <span className="text-gray-700">p1 (nums1 指针)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-purple-500 to-purple-400 rounded"></div>
              <span className="text-gray-700">p2 (nums2 指针)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded"></div>
              <span className="text-gray-700">p (合并位置)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-t from-gray-200 to-gray-100 border-2 border-dashed border-gray-300 rounded"></div>
              <span className="text-gray-700">待填充位置</span>
            </div>
          </div>
        </div>

        {/* 算法核心思想 */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-5 border border-cyan-200">
          <h3 className="text-lg font-semibold text-cyan-900 mb-3">
            💡 核心思想
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold mt-1">•</span>
              <span>
                <strong className="text-cyan-800">从后向前：</strong>
                避免覆盖 nums1 中未处理的元素
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold mt-1">•</span>
              <span>
                <strong className="text-cyan-800">三个指针：</strong>
                p1 指向 nums1 有效元素末尾，p2 指向 nums2 末尾，p 指向合并位置末尾
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold mt-1">•</span>
              <span>
                <strong className="text-cyan-800">每次选择较大值：</strong>
                比较 nums1[p1] 和 nums2[p2]，将较大值放到 nums1[p]
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-600 font-bold mt-1">•</span>
              <span>
                <strong className="text-cyan-800">终止条件：</strong>
                当 p2 &lt; 0 时，nums2 的所有元素都已处理完
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MergeSortedArrayVisualizer;

