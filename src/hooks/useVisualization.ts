import { useState, useEffect, useCallback, useRef } from "react";
import { VisualizationStep } from "@/types";

/**
 * 通用可视化 Hook
 *
 * 这个 Hook 封装了所有可视化组件共同的状态管理和控制逻辑
 * 使用它可以大幅减少每个 Visualizer 组件的重复代码
 *
 * @template TInput - 输入参数的类型（如 {nums: number[], target: number}）
 *
 * @param generateSteps - 生成可视化步骤的函数
 * @param initialInput - 初始输入参数
 * @param config - 可选配置
 *
 * @example
 * const visualization = useVisualization(
 *   (params) => generateTwoSumSteps(params.nums, params.target),
 *   { nums: [2, 7, 11, 15], target: 9 }
 * );
 */

export interface VisualizationConfig {
  /** 初始播放速度（默认 1） */
  initialSpeed?: number;
  /** 是否自动开始播放（默认 false） */
  autoPlay?: boolean;
  /** 播放结束后是否自动重置（默认 false） */
  autoReset?: boolean;
}

export interface VisualizationControls<TInput = unknown> {
  /** 当前输入参数 */
  input: TInput;
  /** 设置新的输入参数 */
  setInput: (input: TInput) => void;
  /** 所有可视化步骤 */
  steps: VisualizationStep[];
  /** 当前步骤索引 */
  currentStep: number;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 播放速度 */
  speed: number;
  /** 设置播放速度 */
  setSpeed: (speed: number) => void;
  /** 开始播放 */
  handlePlay: () => void;
  /** 暂停播放 */
  handlePause: () => void;
  /** 前进一步 */
  handleStepForward: () => void;
  /** 后退一步 */
  handleStepBackward: () => void;
  /** 重置到初始状态 */
  handleReset: () => void;
  /** 跳转到指定步骤 */
  jumpToStep: (step: number) => void;
  /** 当前步骤的数据 */
  currentStepData: VisualizationStep | null;
}

export function useVisualization<TInput = unknown>(
  generateSteps: (input: TInput) => VisualizationStep[],
  initialInput: TInput,
  config: VisualizationConfig = {}
): VisualizationControls<TInput> {
  const { initialSpeed = 1, autoPlay = false, autoReset = false } = config;

  // 状态管理
  const [input, setInput] = useState<TInput>(initialInput);
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(initialSpeed);

  const generateStepsRef = useRef(generateSteps);

  useEffect(() => {
    generateStepsRef.current = generateSteps;
  }, [generateSteps]);

  // 当输入改变时，重新生成步骤
  useEffect(() => {
    try {
      const generatedSteps = generateStepsRef.current(input);
      setSteps(generatedSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (error) {
      console.error("生成可视化步骤时出错:", error);
      setSteps([]);
    }
  }, [input]);

  // 自动播放逻辑
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;

    // 如果已经到达最后一步，停止播放
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      if (autoReset) {
        setTimeout(() => setCurrentStep(0), 500);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 1000 / speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, speed, autoReset]);

  // 控制方法
  const handlePlay = useCallback(() => {
    // 如果已经在最后一步，重置到开始
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  }, [currentStep, steps.length]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStepForward = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setIsPlaying(false);
    }
  }, [currentStep, steps.length]);

  const handleStepBackward = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setIsPlaying(false);
    }
  }, [currentStep]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const jumpToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
        setIsPlaying(false);
      }
    },
    [steps.length]
  );

  // 获取当前步骤的数据
  const currentStepData =
    steps.length > 0 && currentStep < steps.length ? steps[currentStep] : null;

  return {
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
    jumpToStep,
    currentStepData,
  };
}
