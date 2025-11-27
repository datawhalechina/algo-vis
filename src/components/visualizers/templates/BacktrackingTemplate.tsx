import { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * 回溯算法可视化模板
 * 
 * 适用于：子集、排列、组合、分割等回溯问题
 */

/**
 * 选择项状态
 */
export interface ChoiceState {
  value: any;
  label: string;
  isSelected?: boolean;    // 当前是否被选中
  isAvailable?: boolean;   // 是否可选
  isHighlighted?: boolean; // 是否高亮（正在考虑）
  customState?: Record<string, any>;
}

/**
 * BacktrackingTemplate 属性
 */
export interface BacktrackingTemplateProps {
  // 当前路径（已选择的元素）
  currentPath: any[];
  
  // 已找到的所有解
  solutions: any[][];
  
  // 可选择的选项列表
  choices?: ChoiceState[];
  
  // 自定义渲染函数
  renderChoice?: (choice: ChoiceState, index: number) => ReactNode;
  renderPathItem?: (item: any, index: number) => ReactNode;
  renderSolution?: (solution: any[], index: number) => ReactNode;
  
  // 可选的自定义区域
  renderHeader?: () => ReactNode;
  renderStats?: () => ReactNode;
  renderFooter?: () => ReactNode;
  
  // 标题和描述
  title?: string;
  description?: string;
  
  // 状态信息
  isBacktracking?: boolean;  // 是否正在回溯
  currentAction?: string;     // 当前动作描述
  
  // 样式配置
  pathConfig?: {
    emptyMessage?: string;
    containerClassName?: string;
    itemClassName?: string;
  };
  
  choicesConfig?: {
    title?: string;
    containerClassName?: string;
    gridCols?: number;
  };
  
  solutionsConfig?: {
    title?: string;
    maxHeight?: string;
    gridCols?: number;
    emptyMessage?: string;
  };
  
  // 颜色主题
  theme?: {
    primary?: string;      // 主色调
    secondary?: string;    // 次色调
    success?: string;      // 成功色
    warning?: string;      // 警告色
    danger?: string;       // 危险色
  };
}

/**
 * 回溯可视化模板
 */
export function BacktrackingTemplate({
  currentPath,
  solutions,
  choices,
  renderChoice,
  renderPathItem,
  renderSolution,
  renderHeader,
  renderStats,
  renderFooter,
  title = "回溯算法",
  description,
  isBacktracking = false,
  currentAction,
  pathConfig = {},
  choicesConfig = {},
  solutionsConfig = {},
}: BacktrackingTemplateProps) {
  const {
    emptyMessage = "开始构建...",
    containerClassName = "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200",
    itemClassName = "bg-purple-500",
  } = pathConfig;

  const {
    title: choicesTitle = "可选项",
    containerClassName: choicesContainerClassName = "",
    gridCols: choicesGridCols = 4,
  } = choicesConfig;

  const {
    title: solutionsTitle = "已找到的解",
    maxHeight = "max-h-64",
    gridCols: solutionsGridCols = 2,
    emptyMessage: solutionsEmptyMessage = "暂无解",
  } = solutionsConfig;

  // 默认的选择项渲染
  const defaultRenderChoice = (choice: ChoiceState, index: number) => {
    let className = "px-4 py-3 rounded-lg border-2 font-bold text-center transition-all duration-300";

    if (choice.isSelected) {
      className += " bg-blue-500 text-white border-blue-600 shadow-md";
    } else if (choice.isHighlighted) {
      className += " bg-yellow-400 text-gray-900 border-yellow-600 shadow-lg";
    } else if (choice.isAvailable === false) {
      className += " bg-gray-200 text-gray-400 border-gray-300";
    } else {
      className += " bg-gray-100 text-gray-700 border-gray-300";
    }

    return (
      <motion.div
        key={index}
        animate={{
          scale: choice.isHighlighted ? 1.1 : choice.isAvailable === false ? 0.9 : 1,
          opacity: choice.isAvailable === false ? 0.4 : 1,
        }}
        className={className}
      >
        {choice.label}
      </motion.div>
    );
  };

  // 默认的路径项渲染
  const defaultRenderPathItem = (item: any, index: number) => {
    const baseClassName = "px-4 py-3 rounded-lg font-bold text-white shadow-md";
    const colorClassName = isBacktracking ? "bg-red-500" : itemClassName;
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${baseClassName} ${colorClassName}`}
      >
        {String(item)}
      </motion.div>
    );
  };

  // 默认的解决方案渲染
  const defaultRenderSolution = (solution: any[], index: number) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-3 border border-green-300"
      >
        <div className="flex gap-1 flex-wrap justify-center">
          {solution.map((item, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-green-500 text-white rounded font-bold"
            >
              {String(item)}
            </span>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 标题 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {/* 自定义头部 */}
      {renderHeader && <div className="mb-4">{renderHeader()}</div>}

      {/* 统计信息 */}
      {renderStats && <div className="mb-4">{renderStats()}</div>}

      {/* 当前动作 */}
      {currentAction && (
        <div className={`mb-4 p-3 rounded-lg border ${
          isBacktracking 
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <div className="text-sm font-semibold">
            {isBacktracking ? '⬅️ 回溯' : '➡️ 前进'}: {currentAction}
          </div>
        </div>
      )}

      {/* 当前路径 */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-gray-700 mb-2">当前路径</div>
        <div className={`
          rounded-lg p-4 border min-h-[80px]
          flex items-center justify-center
          ${containerClassName}
        `}>
          {currentPath && currentPath.length > 0 ? (
            <div className="flex gap-2 flex-wrap justify-center">
              {currentPath.map((item, index) => 
                renderPathItem 
                  ? renderPathItem(item, index)
                  : defaultRenderPathItem(item, index)
              )}
            </div>
          ) : (
            <div className="text-gray-500">{emptyMessage}</div>
          )}
        </div>
      </div>

      {/* 可选项 */}
      {choices && choices.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            {choicesTitle}
          </div>
          <div className={`
            grid gap-2
            ${choicesContainerClassName}
          `}
          style={{ gridTemplateColumns: `repeat(${choicesGridCols}, minmax(0, 1fr))` }}
          >
            {choices.map((choice, index) =>
              renderChoice
                ? renderChoice(choice, index)
                : defaultRenderChoice(choice, index)
            )}
          </div>
        </div>
      )}

      {/* 已找到的解 */}
      <div>
        <div className="text-sm font-semibold text-gray-700 mb-2">
          {solutionsTitle} ({solutions.length})
        </div>
        <div className={`
          bg-gradient-to-br from-green-50 to-emerald-50
          rounded-lg p-4 border border-green-200
          ${maxHeight} overflow-y-auto
        `}>
          {solutions.length > 0 ? (
            <div className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${solutionsGridCols}, minmax(0, 1fr))` }}
            >
              {solutions.map((solution, index) =>
                renderSolution
                  ? renderSolution(solution, index)
                  : defaultRenderSolution(solution, index)
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 text-gray-500">
              {solutionsEmptyMessage}
            </div>
          )}
        </div>
      </div>

      {/* 自定义底部 */}
      {renderFooter && <div className="mt-4">{renderFooter()}</div>}
    </div>
  );
}
