import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";

/**
 * 网格单元格状态
 */
export interface GridCellState {
  row: number;
  col: number;
  value: number | string;
  isCurrent?: boolean;
  isHighlighted?: boolean;
  isVisited?: boolean;
  isInRegion?: boolean;
  customState?: Record<string, any>;
}

/**
 * GridTemplate 属性
 */
export interface GridTemplateProps {
  // 数据：二维网格
  data: (number | string)[][];
  
  // 核心渲染函数（完全自定义单元格渲染）
  renderCell: (cell: GridCellState) => ReactNode;
  
  // 可选的自定义渲染
  renderContainer?: (children: ReactNode) => ReactNode;
  renderHeader?: () => ReactNode;
  renderFooter?: () => ReactNode;
  renderLegend?: () => ReactNode;
  
  // 状态计算函数
  getCellState?: (row: number, col: number, value: number | string) => Partial<GridCellState>;
  
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
    staggerDelay?: number; // 每个单元格的延迟时间
  };
  
  // 样式
  className?: string;
  
  // 空网格显示
  emptyMessage?: string;
  
  // 显示行列标签
  showLabels?: boolean;
}

/**
 * 通用网格可视化模板
 * 
 * 特点：
 * 1. 提供统一的网格布局和动画框架
 * 2. 支持自定义单元格渲染
 * 3. 支持单元格状态管理（当前、高亮、访问、区域等）
 * 4. 自动计算单元格大小以适应容器
 * 5. 提供插槽式扩展（header/footer/legend）
 */
export function GridTemplate({
  data,
  renderCell,
  renderContainer,
  renderHeader,
  renderFooter,
  renderLegend,
  getCellState,
  layout = {},
  animation,
  className = '',
  emptyMessage = '网格为空',
  showLabels = false,
}: GridTemplateProps) {
  const {
    cellSize: providedCellSize,
    gap = 4,
    maxWidth = 800,
    maxHeight = 600,
  } = layout;

  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isEmpty = data.length === 0 || data.every(row => row.length === 0);

  const rows = data.length;
  const cols = data[0]?.length || 0;

  // 自动计算单元格大小
  const cellSize = providedCellSize || Math.min(
    Math.floor((maxWidth - gap * (cols + 1)) / cols),
    Math.floor((maxHeight - gap * (rows + 1)) / rows),
    80 // 最大80px
  );

  // GSAP 动画：单元格进入动画
  useEffect(() => {
    if (isEmpty) return;

    const cellElements = Array.from(cellRefs.current.values());
    
    if (cellElements.length > 0) {
      const cellAnimation = animation?.cell || {};
      const hiddenVars = cellAnimation.hidden || { scale: 0, opacity: 0, rotate: -180 };
      const visibleVars = cellAnimation.visible || { scale: 1, opacity: 1, rotate: 0 };
      const duration = animation?.duration || 0.4;
      const staggerDelay = animation?.staggerDelay || 0.02;

      // 设置初始状态
      gsap.set(cellElements, hiddenVars);

      // 执行进入动画
      gsap.to(cellElements, {
        ...visibleVars,
        duration,
        stagger: staggerDelay,
        ease: "back.out(1.2)",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, cols, isEmpty]);

  // 空网格处理
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

    // 渲染行标签
    if (showLabels) {
      for (let i = 0; i < rows; i++) {
        cells.push(
          <div
            key={`row-label-${i}`}
            className="flex items-center justify-center font-semibold text-gray-600 text-sm"
            style={{ width: 30, height: cellSize }}
          >
            {i}
          </div>
        );
      }
    }

    // 渲染网格单元格
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const value = data[i]?.[j] ?? '';
        const state: GridCellState = {
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
          >
            {renderCell(state)}
          </div>
        );
      }
    }

    // 渲染列标签
    if (showLabels) {
      for (let j = 0; j < cols; j++) {
        cells.push(
          <div
            key={`col-label-${j}`}
            className="flex items-center justify-center font-semibold text-gray-600 text-sm"
            style={{ width: cellSize, height: 30 }}
          >
            {j}
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
      ? `30px repeat(${cols}, ${cellSize}px)`
      : `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: showLabels
      ? `30px repeat(${rows}, ${cellSize}px)`
      : `repeat(${rows}, ${cellSize}px)`,
    gap: `${gap}px`,
    width: 'fit-content',
  };

  return (
    <div className={`w-full ${className}`}>
      {/* 头部插槽 */}
      {renderHeader?.()}

      {/* 网格容器 */}
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

