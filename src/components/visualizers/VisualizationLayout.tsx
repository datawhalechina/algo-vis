import React from 'react';
import PlaybackControls from '@/components/controls/PlaybackControls';
import { VisualizationControls } from '@/hooks/useVisualization';
import { TestCaseInput, InputFieldConfig } from './TestCaseInput';
import { StepDescriptionPanel } from './StepDescriptionPanel';
import { useInputHandler, InputType } from '@/hooks/useInputHandler';
import { ProblemInput, StepVariables, getBooleanVariable } from '@/types/visualization';

/**
 * 可视化布局组件 Props
 */
export interface VisualizationLayoutProps<T extends ProblemInput> {
  /** 可视化控制对象（来自 useVisualization Hook） */
  visualization: VisualizationControls<T>;
  /** 输入类型配置 */
  inputTypes: InputType[];
  /** 输入字段配置（用于UI显示） */
  inputFields: InputFieldConfig[];
  /** 测试用例列表 */
  testCases?: Array<{ label: string; value: T }>;
  /** 步骤说明面板的自定义变量显示（可选） */
  customStepVariables?: (variables: StepVariables) => React.ReactNode;
  /** 子组件（题目特定的可视化内容） */
  children: React.ReactNode;
}

/**
 * 可视化布局组件
 * 
 * 统一的布局容器，包含：
 * - 播放控制器
 * - 测试用例输入
 * - 步骤说明面板
 * - 题目特定的可视化内容（children）
 * 
 * @example
 * ```tsx
 * <VisualizationLayout
 *   visualization={visualization}
 *   inputTypes={[{ type: 'array', key: 'nums', label: '数组' }]}
 *   inputFields={[{ type: 'array', key: 'nums', label: '数组' }]}
 *   testCases={[
 *     { label: '示例1', value: { nums: [1, 2, 3] } }
 *   ]}
 * >
 *   {/* 题目特定的可视化内容 *\/}
 *   <ArrayVisualizer array={...} />
 * </VisualizationLayout>
 * ```
 */
export function VisualizationLayout<T extends ProblemInput>({
  visualization,
  inputTypes,
  inputFields,
  testCases,
  customStepVariables,
  children,
}: VisualizationLayoutProps<T>) {
  // 使用输入处理 Hook
  const inputHandler = useInputHandler<T>({
    inputs: inputTypes,
    initialValue: visualization.input,
    onInputChange: visualization.setInput,
    testCases,
  });

  const finished = getBooleanVariable(
    visualization.currentStepData?.variables,
    'finished'
  );

  return (
    <div className="flex flex-col h-full">
      {/* 播放控制器 */}
      {visualization.steps.length > 0 && (
        <PlaybackControls
          isPlaying={visualization.isPlaying}
          currentStep={visualization.currentStep}
          totalSteps={visualization.steps.length}
          speed={visualization.speed}
          onPlay={visualization.handlePlay}
          onPause={visualization.handlePause}
          onStepForward={visualization.handleStepForward}
          onStepBackward={visualization.handleStepBackward}
          onReset={visualization.handleReset}
          onSpeedChange={visualization.setSpeed}
        />
      )}

      {/* 可视化区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 测试用例输入 */}
        <TestCaseInput
          fields={inputFields}
          inputStrings={inputHandler.inputStrings}
          onInputChange={inputHandler.handleInputChange}
          testCases={testCases}
          onTestCaseSelect={inputHandler.handleTestCaseSelect}
        />

        {/* 步骤说明面板 */}
        <StepDescriptionPanel
          step={visualization.currentStepData}
          customVariables={customStepVariables}
          finished={finished}
        />

        {/* 题目特定的可视化内容 */}
        {children}
      </div>
    </div>
  );
}

