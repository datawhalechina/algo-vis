import React from 'react';
import { VisualizationStep } from '@/types';
import { StepVariables } from '@/types/visualization';

/**
 * 步骤说明面板组件 Props
 */
export interface StepDescriptionPanelProps {
  /** 当前步骤数据 */
  step: VisualizationStep | null;
  /** 自定义变量显示（可选） */
  customVariables?: (variables: StepVariables) => React.ReactNode;
  /** 是否完成状态（用于改变样式） */
  finished?: boolean;
}

/**
 * 步骤说明面板组件
 * 
 * 统一的步骤说明UI，显示当前步骤的描述和变量
 * 
 * @example
 * ```tsx
 * <StepDescriptionPanel 
 *   step={visualization.currentStepData}
 *   finished={currentStepData?.variables?.finished}
 * />
 * ```
 */
export function StepDescriptionPanel({
  step,
  customVariables,
  finished,
}: StepDescriptionPanelProps) {
  if (!step) return null;

  const variables = step.variables || {};
  const hasVariables = Object.keys(variables).length > 0;

  return (
    <div
      className={`rounded-lg p-5 border ${
        finished
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
            finished ? 'bg-green-500' : 'bg-amber-500'
          }`}
        ></div>
        <div className="flex-1">
          <p className="text-gray-800 font-medium leading-relaxed">
            {step.description}
          </p>
          
          {/* 变量显示 */}
          {hasVariables && (
            <div className="mt-3 bg-white rounded-lg p-4 border">
              {customVariables ? (
                customVariables(variables as StepVariables)
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    当前变量：
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(variables).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-mono text-blue-600 font-semibold">
                          {key}
                        </span>
                        <span className="text-gray-500"> = </span>
                        <span className="font-mono text-gray-800 font-semibold">
                          {JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

