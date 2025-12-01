import { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * 堆节点状态
 */
export interface HeapNodeState {
  value: number;
  index: number;
  isTop?: boolean;
  isHighlighted?: boolean;
}

/**
 * DualHeapTemplate 属性
 */
export interface DualHeapTemplateProps {
  // 最大堆数据（较小的一半）
  maxHeap: number[];
  
  // 最小堆数据（较大的一半）
  minHeap: number[];
  
  // 自定义渲染函数
  renderMaxHeapNode?: (node: HeapNodeState) => ReactNode;
  renderMinHeapNode?: (node: HeapNodeState) => ReactNode;
  
  // 布局配置
  layout?: {
    nodeSize?: number;
    gap?: number;
    direction?: "vertical" | "horizontal";
  };
  
  // 样式
  className?: string;
  
  // 显示标签
  showLabels?: boolean;
  
  // 显示平衡指示器
  showBalance?: boolean;
}

/**
 * 双堆可视化模板
 * 
 * 用于可视化两个堆（最大堆和最小堆）的状态
 * 常用于数据流中位数等需要维护两个堆的问题
 */
export function DualHeapTemplate({
  maxHeap,
  minHeap,
  renderMaxHeapNode,
  renderMinHeapNode,
  layout = {},
  className = '',
  showLabels = true,
  showBalance = true,
}: DualHeapTemplateProps) {
  const {
    nodeSize = 60,
    gap = 12,
    direction = "vertical",
  } = layout;

  // 默认渲染函数
  const defaultRenderNode = (node: HeapNodeState, isMaxHeap: boolean) => (
    <motion.div
      key={node.index}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: node.index * 0.1 }}
      className={`w-${nodeSize} h-${nodeSize} rounded-lg flex items-center justify-center font-bold text-white transition-all ${
        node.isTop
          ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-110 shadow-lg"
          : isMaxHeap
          ? "bg-gradient-to-br from-blue-400 to-blue-500 shadow-md"
          : "bg-gradient-to-br from-green-400 to-green-500 shadow-md"
      }`}
      style={{ width: nodeSize, height: nodeSize }}
    >
      <div className="text-center">
        <div className="text-lg">{node.value}</div>
        {node.isTop && (
          <div className="text-xs mt-0.5 opacity-80">堆顶</div>
        )}
      </div>
    </motion.div>
  );

  // 计算平衡状态
  const balanceDiff = Math.abs(maxHeap.length - minHeap.length);
  const isBalanced = balanceDiff <= 1;

  return (
    <div className={`dual-heap-template ${className}`}>
      <div
        className={`grid ${direction === "vertical" ? "grid-cols-2" : "grid-rows-2"} gap-6`}
        style={{ gap }}
      >
        {/* 最大堆（较小的一半） */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {showLabels && (
            <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              最大堆（较小的一半）
            </h4>
          )}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 min-h-[200px]">
            {maxHeap.length > 0 ? (
              <div className={`flex ${direction === "vertical" ? "flex-col-reverse" : "flex-row-reverse"} gap-2 items-center justify-center`}>
                {maxHeap.map((val, idx) => {
                  const node: HeapNodeState = {
                    value: val,
                    index: idx,
                    isTop: idx === 0,
                    isHighlighted: idx === 0,
                  };
                  return renderMaxHeapNode ? renderMaxHeapNode(node) : defaultRenderNode(node, true);
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">空</div>
            )}
          </div>
          {showLabels && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              大小: {maxHeap.length}
            </div>
          )}
        </div>

        {/* 最小堆（较大的一半） */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {showLabels && (
            <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              最小堆（较大的一半）
            </h4>
          )}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 min-h-[200px]">
            {minHeap.length > 0 ? (
              <div className={`flex ${direction === "vertical" ? "flex-col-reverse" : "flex-row-reverse"} gap-2 items-center justify-center`}>
                {minHeap.map((val, idx) => {
                  const node: HeapNodeState = {
                    value: val,
                    index: idx,
                    isTop: idx === 0,
                    isHighlighted: idx === 0,
                  };
                  return renderMinHeapNode ? renderMinHeapNode(node) : defaultRenderNode(node, false);
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">空</div>
            )}
          </div>
          {showLabels && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              大小: {minHeap.length}
            </div>
          )}
        </div>
      </div>

      {/* 平衡指示器 */}
      {showBalance && (
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">堆平衡状态</span>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              isBalanced
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {isBalanced ? "✓ 平衡" : `⚠ 不平衡 (差值: ${balanceDiff})`}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isBalanced ? "bg-green-500" : "bg-yellow-500"
                }`}
                style={{
                  width: `${(maxHeap.length / (maxHeap.length + minHeap.length || 1)) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-600">
              {maxHeap.length} : {minHeap.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

