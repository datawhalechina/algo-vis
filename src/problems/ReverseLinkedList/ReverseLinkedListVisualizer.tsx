import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import PlaybackControls from "@/components/controls/PlaybackControls";
import CodeDisplay from "@/components/CodeDisplay";
import { useVisualization } from "@/hooks/useVisualization";
import {
  generateReverseLinkedListSteps,
  defaultTestCases,
  ReverseListState,
  ListNode,
} from "./algorithm";

interface ReverseLinkedListInput {
  values: number[];
}

function ReverseLinkedListVisualizer() {
  const visualization = useVisualization<ReverseLinkedListInput>(
    (input) => generateReverseLinkedListSteps(input.values),
    { values: [1, 2, 3, 4, 5] }
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

  // 是否显示代码区域（简单题目可以关闭）
  const [showCode, setShowCode] = useState<boolean>(false);
  
  // 用于输入框的临时字符串值
  const [inputString, setInputString] = useState<string>(input.values.join(","));

  const code = `function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr: ListNode | null = head;
  
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  
  return prev;
}`;

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setInputString(value);
    const values = value
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v));
    
    if (values.length > 0) {
      setInput({ values });
    }
  };

  // 处理测试用例选择
  const handleTestCaseSelect = (values: number[]) => {
    setInputString(values.join(","));
    setInput({ values });
  };
  const state = currentStepData?.data as ReverseListState;

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              链表节点值:
            </label>
            <input
              type="text"
              value={inputString}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="输入节点值，用逗号分隔，如: 1,2,3,4,5"
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
            />
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            {defaultTestCases.map((testCase, index) => (
              <button
                key={index}
                onClick={() => handleTestCaseSelect(testCase.values)}
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
                {currentStepData.variables && Object.keys(currentStepData.variables).length > 0 && (
                  <div className="mt-3 bg-white rounded-lg p-4 border border-amber-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      当前变量：
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(currentStepData.variables).map(([key, value]) => (
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

        {/* 链表可视化 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>🔗</span>
              链表可视化 - 三指针迭代法
            </h3>
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
          {state && state.nodes.length > 0 ? (
            <div className="flex flex-col items-center space-y-8">
              {/* 链表节点 */}
              <div className="bg-gradient-to-b from-slate-50 via-gray-50 to-white p-8 rounded-xl border border-gray-200 w-full shadow-inner">
                <div className="flex items-center gap-2 flex-wrap justify-center min-h-[140px]">
                  <AnimatePresence mode="sync">
                    {state.nodes.map((node, index) => (
                      <LinkedListNodeComponent
                        key={`node-${index}`}
                        node={node}
                        index={index}
                        isPrev={index === state.prevIndex}
                        isCurr={index === state.currIndex}
                        isNext={index === state.nextIndex}
                        isComplete={state.isComplete}
                        allNodes={state.nodes}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* 图例 */}
              <div className="flex gap-4 items-center justify-center flex-wrap">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200 shadow-sm">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-md"></div>
                  <span className="text-gray-700 font-semibold text-sm">PREV 指针</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-teal-50 px-4 py-2 rounded-xl border border-green-200 shadow-sm">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg shadow-md"></div>
                  <span className="text-gray-700 font-semibold text-sm">CURR 指针</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 rounded-xl border border-orange-200 shadow-sm">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg shadow-md"></div>
                  <span className="text-gray-700 font-semibold text-sm">NEXT 指针</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              空链表
            </div>
          )}
        </div>

        {/* 代码显示（可选） */}
        {showCode && (
          <CodeDisplay
            code={code}
            language="typescript"
            title="双指针迭代法（TypeScript）"
            highlightedLines={
              currentStepData?.code
                ? code.split("\n").map((line, index) => 
                    currentStepData.code?.includes(line.trim()) ? index + 1 : -1
                  ).filter(n => n > 0)
                : []
            }
          />
        )}
      </div>
    </div>
  );
}

// 链表节点组件
interface LinkedListNodeProps {
  node: ListNode;
  index: number;
  isPrev: boolean;
  isCurr: boolean;
  isNext: boolean;
  isComplete: boolean;
  allNodes: ListNode[];
}

function LinkedListNodeComponent({
  node,
  index,
  isPrev,
  isCurr,
  isNext,
}: LinkedListNodeProps) {
  const getNodeColor = () => {
    if (isPrev) return "border-blue-500 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 shadow-lg shadow-blue-200 text-white";
    if (isCurr) return "border-green-500 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 shadow-lg shadow-green-200 text-white";
    if (isNext) return "border-orange-500 bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 shadow-lg shadow-orange-200 text-white";
    return "border-gray-300 bg-gradient-to-br from-white to-gray-50 shadow-md text-gray-800";
  };

  const getIndicatorColor = () => {
    if (isPrev) return "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg";
    if (isCurr) return "bg-gradient-to-r from-green-600 to-teal-600 shadow-lg";
    if (isNext) return "bg-gradient-to-r from-orange-600 to-amber-600 shadow-lg";
    return "bg-gray-400";
  };

  const getIndicatorLabel = () => {
    if (isPrev) return "PREV";
    if (isCurr) return "CURR";
    if (isNext) return "NEXT";
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="flex items-center gap-3"
    >
      {/* 节点 */}
      <div className="flex flex-col items-center relative">
        {/* 指针标签 */}
        {(isPrev || isCurr || isNext) && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`mb-3 px-4 py-1.5 rounded-full text-xs font-bold text-white tracking-wider ${getIndicatorColor()}`}
          >
            {getIndicatorLabel()}
          </motion.div>
        )}

        {/* 节点方框 */}
        <motion.div
          animate={{
            scale: isPrev || isCurr || isNext ? 1.08 : 1,
            y: isPrev || isCurr || isNext ? -2 : 0,
          }}
          transition={{ type: "spring", stiffness: 200 }}
          className={`w-20 h-20 border-3 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${getNodeColor()}`}
        >
          {node.val}
        </motion.div>

        {/* 索引 */}
        <div className={`mt-2 text-sm font-semibold ${
          isPrev || isCurr || isNext ? 'text-gray-700' : 'text-gray-500'
        }`}>
          [{index}]
        </div>

        {/* 发光效果 */}
        {(isPrev || isCurr || isNext) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 rounded-xl blur-xl ${
              isPrev ? 'bg-blue-400' : isCurr ? 'bg-green-400' : 'bg-orange-400'
            } -z-10`}
          />
        )}
      </div>

      {/* 箭头 */}
      {node.next !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex flex-col items-center justify-center gap-1 mx-2"
        >
          {/* 箭头图标 */}
          <motion.div
            initial={{ x: -5 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            className={`${
              node.next < index
                ? 'text-green-500'
                : 'text-gray-400'
            }`}
          >
            <ArrowRight 
              size={32} 
              strokeWidth={2.5}
              className="drop-shadow-sm"
            />
          </motion.div>

          {/* 已反转标签 */}
          {node.next < index && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md"
            >
              <Check size={12} strokeWidth={3} />
              <span className="text-[10px]">已反转</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default ReverseLinkedListVisualizer;
