import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrayTemplate } from "./ArrayTemplate";

/**
 * 数组元素状态
 */
export interface ArrayElementState {
  value: number;
  index: number;
  isPartition?: boolean; // 是否是分割点
  isLeft?: boolean; // 是否在分割点左侧
  isRight?: boolean; // 是否在分割点右侧
  isHighlighted?: boolean;
}

/**
 * DualArrayBinarySearchTemplate 属性
 */
export interface DualArrayBinarySearchTemplateProps {
  // 第一个数组
  array1: number[];
  
  // 第二个数组
  array2: number[];
  
  // 第一个数组的分割点（索引）
  partition1?: number;
  
  // 第二个数组的分割点（索引）
  partition2?: number;
  
  // 自定义渲染函数
  renderArray1Element?: (element: ArrayElementState) => ReactNode;
  renderArray2Element?: (element: ArrayElementState) => ReactNode;
  
  // 布局配置
  layout?: {
    gap?: number;
    direction?: "vertical" | "horizontal";
  };
  
  // 样式
  className?: string;
  
  // 显示标签
  showLabels?: boolean;
  
  // 显示分割线
  showPartition?: boolean;
  
  // 显示合并视图
  showMerged?: boolean;
}

/**
 * 双数组二分查找可视化模板
 * 
 * 用于可视化两个数组的分割状态
 * 常用于寻找两个正序数组的中位数等问题
 */
export function DualArrayBinarySearchTemplate({
  array1,
  array2,
  partition1,
  partition2,
  renderArray1Element,
  renderArray2Element,
  layout = {},
  className = '',
  showLabels = true,
  showPartition = true,
  showMerged = true,
}: DualArrayBinarySearchTemplateProps) {
  const {
    gap = 16,
    direction = "vertical",
  } = layout;

  // 默认渲染函数
  const defaultRenderElement = (element: ArrayElementState, isArray1: boolean) => (
    <motion.div
      key={element.index}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: element.index * 0.05 }}
      className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold text-white transition-all ${
        element.isPartition
          ? "bg-gradient-to-br from-yellow-400 to-yellow-500 scale-110 shadow-lg"
          : element.isLeft
          ? isArray1
            ? "bg-gradient-to-br from-blue-300 to-blue-400"
            : "bg-gradient-to-br from-purple-300 to-purple-400"
          : element.isRight
          ? isArray1
            ? "bg-gradient-to-br from-green-300 to-green-400"
            : "bg-gradient-to-br from-pink-300 to-pink-400"
          : isArray1
          ? "bg-gradient-to-br from-blue-400 to-blue-500"
          : "bg-gradient-to-br from-purple-400 to-purple-500"
      }`}
    >
      <div className="text-lg">{element.value}</div>
      {element.isPartition && (
        <div className="text-xs mt-0.5 opacity-80">分割</div>
      )}
    </motion.div>
  );

  // 计算分割点左侧和右侧的元素
  const getElementState = (index: number, partition: number | undefined): Partial<ArrayElementState> => {
    if (partition === undefined) {
      return {};
    }
    return {
      isPartition: index === partition,
      isLeft: index < partition,
      isRight: index >= partition,
    };
  };

  return (
    <div className={`dual-array-binary-search-template ${className}`}>
      <div
        className={`flex ${direction === "vertical" ? "flex-col" : "flex-row"} gap-4`}
        style={{ gap }}
      >
        {/* 第一个数组 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1">
          {showLabels && (
            <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              数组 1 (nums1)
            </h4>
          )}
          <ArrayTemplate
            data={array1}
            renderItem={(item, index) => {
              const element: ArrayElementState = {
                value: item as number,
                index,
                ...getElementState(index, partition1),
              };
              return renderArray1Element ? renderArray1Element(element) : defaultRenderElement(element, true);
            }}
            getItemState={(index) => getElementState(index, partition1)}
            layout={{ gap: "0.75rem", direction: "row", wrap: false }}
          />
          {showPartition && partition1 !== undefined && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              分割点: 索引 {partition1} (左侧 {partition1} 个元素，右侧 {array1.length - partition1} 个元素)
            </div>
          )}
        </div>

        {/* 第二个数组 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1">
          {showLabels && (
            <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              数组 2 (nums2)
            </h4>
          )}
          <ArrayTemplate
            data={array2}
            renderItem={(item, index) => {
              const element: ArrayElementState = {
                value: item as number,
                index,
                ...getElementState(index, partition2),
              };
              return renderArray2Element ? renderArray2Element(element) : defaultRenderElement(element, false);
            }}
            getItemState={(index) => getElementState(index, partition2)}
            layout={{ gap: "0.75rem", direction: "row", wrap: false }}
          />
          {showPartition && partition2 !== undefined && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              分割点: 索引 {partition2} (左侧 {partition2} 个元素，右侧 {array2.length - partition2} 个元素)
            </div>
          )}
        </div>
      </div>

      {/* 合并视图 */}
      {showMerged && (partition1 !== undefined || partition2 !== undefined) && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-semibold mb-3 text-gray-700">合并视图</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-2 flex-wrap">
              {/* 数组1左侧 */}
              {partition1 !== undefined && array1.slice(0, partition1).map((val, idx) => (
                <motion.div
                  key={`a1-left-${idx}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-2 rounded-lg bg-blue-300 text-blue-900 font-bold"
                >
                  {val}
                </motion.div>
              ))}
              {/* 数组2左侧 */}
              {partition2 !== undefined && array2.slice(0, partition2).map((val, idx) => (
                <motion.div
                  key={`a2-left-${idx}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-2 rounded-lg bg-purple-300 text-purple-900 font-bold"
                >
                  {val}
                </motion.div>
              ))}
              {/* 分割线 */}
              <div className="px-2 py-2 text-gray-500 font-bold">|</div>
              {/* 数组1右侧 */}
              {partition1 !== undefined && array1.slice(partition1).map((val, idx) => (
                <motion.div
                  key={`a1-right-${idx}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-2 rounded-lg bg-green-300 text-green-900 font-bold"
                >
                  {val}
                </motion.div>
              ))}
              {/* 数组2右侧 */}
              {partition2 !== undefined && array2.slice(partition2).map((val, idx) => (
                <motion.div
                  key={`a2-right-${idx}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-2 rounded-lg bg-pink-300 text-pink-900 font-bold"
                >
                  {val}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

