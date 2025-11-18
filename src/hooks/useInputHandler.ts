import { useState, useCallback } from "react";
import {
  ProblemInput,
  getArrayValue,
  getNumberValue,
  getStringValue,
} from "@/types/visualization";

/**
 * 输入类型配置
 */
export type InputType =
  | { type: "array"; key: string; label: string }
  | { type: "number"; key: string; label: string; min?: number; max?: number }
  | { type: "string"; key: string; label: string }
  | {
      type: "array-and-number";
      arrayKey: string;
      numberKey: string;
      arrayLabel: string;
      numberLabel: string;
    }
  | {
      type: "array-and-number-m";
      arrayKey: string;
      numberKey: string;
      arrayLabel: string;
      numberLabel: string;
    };

/**
 * 输入处理配置
 */
export interface InputHandlerConfig<T> {
  /** 输入类型配置 */
  inputs: InputType[];
  /** 初始值 */
  initialValue: T;
  /** 更新输入的回调 */
  onInputChange: (value: T) => void;
  /** 测试用例列表 */
  testCases?: Array<{ label: string; value: T }>;
}

/**
 * 输入处理 Hook 返回值
 */
export interface InputHandlerReturn<T> {
  /** 输入字符串值（用于显示在输入框中） */
  inputStrings: Record<string, string>;
  /** 处理输入变化 */
  handleInputChange: (key: string, value: string) => void;
  /** 选择测试用例 */
  handleTestCaseSelect: (value: T) => void;
  /** 当前输入值 */
  currentValue: T;
}

/**
 * 通用输入处理 Hook
 *
 * 统一处理各种输入类型的字符串转换和验证
 * 支持：数组、数字、字符串、数组+数字等组合
 *
 * @example
 * ```typescript
 * // 单个数组
 * const inputHandler = useInputHandler({
 *   inputs: [{ type: 'array', key: 'nums', label: '数组' }],
 *   initialValue: { nums: [1, 2, 3] },
 *   onInputChange: setInput,
 *   testCases: [
 *     { label: '示例1', value: { nums: [1, 2, 3] } }
 *   ]
 * });
 *
 * // 数组+数字
 * const inputHandler = useInputHandler({
 *   inputs: [{
 *     type: 'array-and-number',
 *     arrayKey: 'nums',
 *     numberKey: 'target',
 *     arrayLabel: '数组',
 *     numberLabel: '目标值'
 *   }],
 *   initialValue: { nums: [2, 7, 11, 15], target: 9 },
 *   onInputChange: setInput,
 * });
 * ```
 */
export function useInputHandler<T extends ProblemInput>(
  config: InputHandlerConfig<T>
): InputHandlerReturn<T> {
  const { inputs, initialValue, onInputChange } = config;

  // 初始化输入字符串值
  const getInitialStrings = useCallback(() => {
    const strings: Record<string, string> = {};
    inputs.forEach((input) => {
      if (input.type === "array") {
        const value = getArrayValue(initialValue, input.key);
        if (value) {
          strings[input.key] = value.join(",");
        } else {
          strings[input.key] = "";
        }
      } else if (input.type === "number") {
        const value = getNumberValue(initialValue, input.key);
        strings[input.key] = value !== undefined ? String(value) : "";
      } else if (input.type === "string") {
        const value = getStringValue(initialValue, input.key);
        strings[input.key] = value !== undefined ? value : "";
      } else if (
        input.type === "array-and-number" ||
        input.type === "array-and-number-m"
      ) {
        const arrayValue = getArrayValue(initialValue, input.arrayKey);
        strings[input.arrayKey] = arrayValue ? arrayValue.join(",") : "";
        const numberValue = getNumberValue(initialValue, input.numberKey);
        strings[input.numberKey] =
          numberValue !== undefined ? String(numberValue) : "";
      }
    });
    return strings;
  }, [inputs, initialValue]);

  const [inputStrings, setInputStrings] =
    useState<Record<string, string>>(getInitialStrings);

  // 解析数组字符串
  const parseArray = useCallback((str: string): number[] => {
    return str
      .split(",")
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n));
  }, []);

  // 处理输入变化
  const handleInputChange = useCallback(
    (key: string, value: string) => {
      setInputStrings((prev) => ({ ...prev, [key]: value }));

      // 找到对应的输入配置
      const inputConfig = inputs.find((input) => {
        if (input.type === "array") return input.key === key;
        if (input.type === "number") return input.key === key;
        if (input.type === "string") return input.key === key;
        if (
          input.type === "array-and-number" ||
          input.type === "array-and-number-m"
        ) {
          return input.arrayKey === key || input.numberKey === key;
        }
        return false;
      });

      if (!inputConfig) return;

      // 根据类型更新值
      const newValue = { ...initialValue } as T;

      if (inputConfig.type === "array") {
        const nums = parseArray(value);
        if (nums.length > 0 && inputConfig.key in newValue) {
          (newValue[inputConfig.key] as unknown) = nums;
          onInputChange(newValue);
        }
      } else if (inputConfig.type === "number") {
        const num = parseInt(value);
        if (!isNaN(num)) {
          const min = inputConfig.min;
          const max = inputConfig.max;
          if (
            (min === undefined || num >= min) &&
            (max === undefined || num <= max) &&
            inputConfig.key in newValue
          ) {
            (newValue[inputConfig.key] as unknown) = num;
            onInputChange(newValue);
          }
        }
      } else if (inputConfig.type === "string") {
        if (inputConfig.key in newValue) {
          (newValue[inputConfig.key] as unknown) = value;
          onInputChange(newValue);
        }
      } else if (
        inputConfig.type === "array-and-number" ||
        inputConfig.type === "array-and-number-m"
      ) {
        if (key === inputConfig.arrayKey) {
          const nums = parseArray(value);
          if (nums.length > 0 && inputConfig.arrayKey in newValue) {
            (newValue[inputConfig.arrayKey] as unknown) = nums;
            onInputChange(newValue);
          }
        } else if (key === inputConfig.numberKey) {
          const num = parseInt(value);
          if (!isNaN(num) && inputConfig.numberKey in newValue) {
            (newValue[inputConfig.numberKey] as unknown) = num;
            onInputChange(newValue);
          }
        }
      }
    },
    [inputs, initialValue, onInputChange, parseArray]
  );

  // 处理测试用例选择
  const handleTestCaseSelect = useCallback(
    (value: T) => {
      const strings: Record<string, string> = {};
      inputs.forEach((input) => {
        if (input.type === "array") {
          const arr = getArrayValue(value, input.key);
          strings[input.key] = arr ? arr.join(",") : "";
        } else if (input.type === "number") {
          const num = getNumberValue(value, input.key);
          strings[input.key] = num !== undefined ? String(num) : "";
        } else if (input.type === "string") {
          const str = getStringValue(value, input.key);
          strings[input.key] = str !== undefined ? str : "";
        } else if (
          input.type === "array-and-number" ||
          input.type === "array-and-number-m"
        ) {
          const arrayValue = getArrayValue(value, input.arrayKey);
          strings[input.arrayKey] = arrayValue ? arrayValue.join(",") : "";
          const numberValue = getNumberValue(value, input.numberKey);
          strings[input.numberKey] =
            numberValue !== undefined ? String(numberValue) : "";
        }
      });
      setInputStrings(strings);
      onInputChange(value);
    },
    [inputs, onInputChange]
  );

  return {
    inputStrings,
    handleInputChange,
    handleTestCaseSelect,
    currentValue: initialValue,
  };
}
