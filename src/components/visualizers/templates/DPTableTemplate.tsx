import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";

/**
 * DP单元格状态
 */
export interface DPCellState {
  row: number;
  col: number;
  value: number | string | boolean;
  isCurrent?: boolean;
  isHighlighted?: boolean;
  isDependency?: boolean; // 是否是依赖项（用于显示箭头）
  dependencies?: Array<{ row: number; col: number; label?: string }>; // 依赖的单元格
  customState?: Record<string, any>;
}

/**
 * DPTableTemplate 属性
 */
export interface DPTableTemplateProps {
  // 数据：二维DP数组
  data: (number | string | boolean)[][];
  
  // 行标签（可选，用于字符串DP）
  rowLabels?: string[];
  
  // 列标签（可选，用于字符串DP）
  colLabels?: string[];
  
  // 核心渲染函数（完全自定义单元格渲染）
  renderCell: (cell: DPCellState) => ReactNode;
  
  // 可选的自定义渲染
  renderContainer?: (children: ReactNode) => ReactNode;
  renderHeader?: () => ReactNode;
  renderFooter?: () => ReactNode;
  renderLegend?: () => ReactNode;
  
  // 状态计算函数
  getCellState?: (row: number, col: number, value: number | string | boolean) => Partial<DPCellState>;
  
  // 布局配置
  layout?: {
    cellSize?: number; // 单元格大小（像素）
    gap?: number; // 单元格间距
    maxWidth?: number; // 最大宽度（用于自动计算cellSize）
    maxHeight?: number; // 最大高度（用于自动计算cellSize）
  };
  
  // 动画配置
  animation?: {
    cell?: {
      hidden?: gsap.TweenVars;
      visible?: gsap.TweenVars;
    };
    duration?: number;
    staggerDelay?: number;
  };
  
  // 样式
  className?: string;
  
  // 空表格显示
  emptyMessage?: string;
  
  // 显示行列标签
  showLabels?: boolean;
}

/**
 * 通用二维DP表格可视化模板
 * 
 * 特点：
 * 1. 专门为二维DP设计，支持字符串DP和数字DP
 * 2. 支持行/列标签（用于字符串DP问题）
 * 3. 支持依赖关系可视化（箭头指向）
 * 4. 支持当前计算位置高亮
 * 5. 自动计算单元格大小以适应容器
 * 6. 提供插槽式扩展（header/footer/legend）
 */
export function DPTableTemplate({
  data,
  rowLabels,
  colLabels,
  renderCell,
  renderContainer,
  renderHeader,
  renderFooter,
  renderLegend,
  getCellState,
  layout = {},
  animation,
  className = '',
  emptyMessage = 'DP表格为空',
  showLabels = true,
}: DPTableTemplateProps) {
  const {
    cellSize: providedCellSize,
    gap = 4,
    maxWidth = 1000,
    maxHeight = 600,
  } = layout;

  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isEmpty = data.length === 0 || data.every(row => row.length === 0);

  const rows = data.length;
  const cols = data[0]?.length || 0;

  // 自动计算单元格大小
  const cellSize = providedCellSize || Math.min(
    Math.floor((maxWidth - gap * (cols + 2)) / (cols + 1)),
    Math.floor((maxHeight - gap * (rows + 2)) / (rows + 1)),
    100 // 最大100px
  );

  // GSAP 动画：单元格进入动画
  useEffect(() => {
    if (isEmpty) return;

    const cellElements = Array.from(cellRefs.current.values());
    
    if (cellElements.length > 0) {
      const cellAnimation = animation?.cell || {};
      const hiddenVars = cellAnimation.hidden || { scale: 0, opacity: 0 };
      const visibleVars = cellAnimation.visible || { scale: 1, opacity: 1 };
      const duration = animation?.duration || 0.4;
      const staggerDelay = animation?.staggerDelay || 0.02;

      gsap.set(cellElements, hiddenVars);

      gsap.to(cellElements, {
        ...visibleVars,
        duration,
        stagger: staggerDelay,
        ease: "back.out(1.2)",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols, isEmpty]);

  // 空表格处理
  if (isEmpty) {
    return (
      <div
        className={`flex items-center justify-center h-64 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center">
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // 渲染单元格
  const renderCells = () => {
    const cells: ReactNode[] = [];

    // 渲染左上角空白
    if (showLabels) {
      cells.push(
        <div
          key="corner"
          className="flex items-center justify-center font-semibold text-gray-600 text-sm bg-gray-100 rounded"
          style={{ width: cellSize, height: cellSize }}
        >
          DP
        </div>
      );
    }

    // 渲染列标签
    if (showLabels) {
      for (let j = 0; j < cols; j++) {
        const label = colLabels?.[j] ?? (j === 0 ? 'ε' : (j - 1).toString());
        cells.push(
          <div
            key={`col-label-${j}`}
            className="flex items-center justify-center font-semibold text-gray-600 text-sm bg-gray-100 rounded"
            style={{ width: cellSize, height: cellSize }}
          >
            {label}
          </div>
        );
      }
    }

    // 渲染行标签和网格单元格
    for (let i = 0; i < rows; i++) {
      // 行标签
      if (showLabels) {
        const label = rowLabels?.[i] ?? (i === 0 ? 'ε' : (i - 1).toString());
        cells.push(
          <div
            key={`row-label-${i}`}
            className="flex items-center justify-center font-semibold text-gray-600 text-sm bg-gray-100 rounded"
            style={{ width: cellSize, height: cellSize }}
          >
            {label}
          </div>
        );
      }

      // 网格单元格
      for (let j = 0; j < cols; j++) {
        const value = data[i]?.[j] ?? '';
        const state: DPCellState = {
          row: i,
          col: j,
          value,
          ...getCellState?.(i, j, value),
        };

        const cellKey = `cell-${i}-${j}`;

        cells.push(
          <div
            key={cellKey}
            ref={(el) => {
              if (el) cellRefs.current.set(cellKey, el);
            }}
            className="relative"
            style={{ width: cellSize, height: cellSize }}
          >
            {renderCell(state)}
            
            {/* 依赖箭头 - 使用简单的视觉指示器，箭头在容器级别绘制更复杂，这里用颜色和符号表示 */}
          </div>
        );
      }
    }

    return cells;
  };

  const cellElements = renderCells();

  // 计算网格容器样式
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: showLabels
      ? `${cellSize}px repeat(${cols}, ${cellSize}px)`
      : `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: showLabels
      ? `${cellSize}px repeat(${rows}, ${cellSize}px)`
      : `repeat(${rows}, ${cellSize}px)`,
    gap: `${gap}px`,
    width: 'fit-content',
  };

  return (
    <div className={`w-full ${className}`}>
      {/* 头部插槽 */}
      {renderHeader?.()}

      {/* DP表格容器 */}
      <div className="bg-gradient-to-b from-slate-50 via-gray-50 to-white rounded-xl border border-gray-200 shadow-inner p-6 overflow-auto">
        <div className="flex justify-center items-center">
          {renderContainer ? (
            renderContainer(
              <div style={gridStyle}>{cellElements}</div>
            )
          ) : (
            <div style={gridStyle}>{cellElements}</div>
          )}
        </div>
      </div>

      {/* 图例 */}
      {renderLegend?.()}

      {/* 底部插槽 */}
      {renderFooter?.()}
    </div>
  );
}

