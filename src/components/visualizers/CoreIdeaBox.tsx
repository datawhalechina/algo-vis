import { ReactNode } from "react";
import { Check } from "lucide-react";

/**
 * 核心思想提示框的颜色主题
 */
export type CoreIdeaColor = 
  | 'blue' 
  | 'green' 
  | 'purple' 
  | 'orange' 
  | 'amber' 
  | 'indigo' 
  | 'teal'
  | 'red'
  | 'pink'
  | 'cyan'
  | 'emerald'
  | 'rose';

interface CoreIdeaBoxProps {
  /** 核心思想描述文本 */
  idea: string;
  /** 颜色主题，默认为 blue */
  color?: CoreIdeaColor;
  /** 可选的图标元素 */
  icon?: ReactNode;
  /** 特点标签列表（如：时间复杂度、空间复杂度等） */
  features?: string[];
  /** 自定义类名 */
  className?: string;
}

/**
 * 核心思想提示框组件
 * 
 * 用于在算法可视化页面中展示算法的核心思想和关键特点
 * 
 * @example
 * ```tsx
 * <CoreIdeaBox 
 *   idea="使用双指针从两端向中间移动，每次移动较短的那条边。"
 *   color="blue"
 *   features={["时间复杂度 O(n)", "空间复杂度 O(1)"]}
 * />
 * ```
 */
export function CoreIdeaBox({ 
  idea, 
  color = 'blue', 
  icon,
  features,
  className = ''
}: CoreIdeaBoxProps) {
  // 颜色配置映射
  const colorConfig: Record<CoreIdeaColor, {
    gradient: string;
    border: string;
    text: string;
    featureBg: string;
  }> = {
    blue: {
      gradient: 'from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      featureBg: 'bg-blue-100 text-blue-700',
    },
    green: {
      gradient: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      text: 'text-green-700',
      featureBg: 'bg-green-100 text-green-700',
    },
    purple: {
      gradient: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      featureBg: 'bg-purple-100 text-purple-700',
    },
    orange: {
      gradient: 'from-orange-50 to-amber-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      featureBg: 'bg-orange-100 text-orange-700',
    },
    amber: {
      gradient: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      featureBg: 'bg-amber-100 text-amber-700',
    },
    indigo: {
      gradient: 'from-indigo-50 to-purple-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
      featureBg: 'bg-indigo-100 text-indigo-700',
    },
    teal: {
      gradient: 'from-teal-50 to-cyan-50',
      border: 'border-teal-200',
      text: 'text-teal-700',
      featureBg: 'bg-teal-100 text-teal-700',
    },
    red: {
      gradient: 'from-red-50 to-pink-50',
      border: 'border-red-200',
      text: 'text-red-700',
      featureBg: 'bg-red-100 text-red-700',
    },
    pink: {
      gradient: 'from-pink-50 to-rose-50',
      border: 'border-pink-200',
      text: 'text-pink-700',
      featureBg: 'bg-pink-100 text-pink-700',
    },
    cyan: {
      gradient: 'from-cyan-50 to-blue-50',
      border: 'border-cyan-200',
      text: 'text-cyan-700',
      featureBg: 'bg-cyan-100 text-cyan-700',
    },
    emerald: {
      gradient: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      featureBg: 'bg-emerald-100 text-emerald-700',
    },
    rose: {
      gradient: 'from-rose-50 to-pink-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      featureBg: 'bg-rose-100 text-rose-700',
    },
  };

  const config = colorConfig[color];

  return (
    <div className={`mb-6 bg-gradient-to-r ${config.gradient} p-4 rounded-lg border ${config.border} ${className}`}>
      <div className="flex items-start gap-2">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className={`font-bold ${config.text}`}>💡 核心思想：</span>
            {idea}
          </p>
          
          {features && features.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${config.featureBg}`}
                >
                  <Check size={12} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
