/**
 * 可视化系统类型定义
 *
 * 这个文件定义了完整的类型系统，用于替代所有 any 类型
 * 提供类型安全和更好的开发体验
 */

import { VisualizationStep } from "./index";

// ============================================================================
// 输入值类型定义
// ============================================================================

/**
 * 允许的输入值类型
 * 这些是算法输入可以包含的所有基本类型
 */
export type InputValue = number | string | number[] | string[] | string[][] | boolean | (number | null)[] | any[];

/**
 * 输入对象的约束
 * 所有输入必须是键值对对象，值必须是 InputValue 类型
 */
export type ProblemInput = Record<string, InputValue>;

/**
 * 常见的输入类型组合（用于类型推断和文档）
 */
export type SingleArrayInput = { nums: number[] };
export type ArrayAndNumberInput = { nums: number[]; target: number };
export type SingleNumberInput = { n: number };
export type SingleStringInput = { str: string };
export type ArrayAndStringInput = { arr: number[]; str: string };

// ============================================================================
// 变量类型定义
// ============================================================================

/**
 * 步骤变量中允许的值类型
 * 这些是算法执行过程中变量可以包含的类型
 */
export type VariableValue =
  | number
  | string
  | number[]
  | string[]
  | string[][]
  | boolean
  | null
  | undefined;

/**
 * 步骤变量对象类型
 * 用于 VisualizationStep.variables
 */
export type StepVariables = Record<string, VariableValue>;

/**
 * 步骤数据对象类型
 * 用于 VisualizationStep.data
 */
export type StepData = Record<string, unknown>;

// ============================================================================
// 类型守卫函数
// ============================================================================

/**
 * 检查值是否为数字数组
 */
export function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((v) => typeof v === "number");
}

/**
 * 检查值是否为字符串数组
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

/**
 * 检查值是否为数组（数字或字符串）
 */
export function isArray(value: unknown): value is number[] | string[] {
  return Array.isArray(value);
}

/**
 * 检查值是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * 检查值是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * 检查值是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * 检查值是否为二维字符串数组
 */
export function isString2DArray(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every((row) => 
    Array.isArray(row) && row.every((v) => typeof v === "string")
  );
}

/**
 * 检查值是否为有效的输入值
 */
export function isInputValue(value: unknown): value is InputValue {
  return (
    isNumber(value) ||
    isString(value) ||
    isNumberArray(value) ||
    isStringArray(value) ||
    isString2DArray(value) ||
    isBoolean(value)
  );
}

/**
 * 检查对象是否为有效的输入对象
 */
export function isProblemInput(value: unknown): value is ProblemInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.values(value).every(isInputValue);
}

/**
 * 安全获取对象属性值
 */
export function getValueSafely<
  T extends Record<string, unknown>,
  K extends keyof T
>(obj: T, key: K): T[K] | undefined {
  return obj[key];
}

/**
 * 安全获取数组值（从输入对象中）
 */
export function getArrayValue<T extends ProblemInput>(
  obj: T,
  key: keyof T
): number[] | string[] | undefined {
  const value = obj[key];
  if (isArray(value)) {
    return value;
  }
  return undefined;
}

/**
 * 安全获取数字值（从输入对象中）
 */
export function getNumberValue<T extends ProblemInput>(
  obj: T,
  key: keyof T
): number | undefined {
  const value = obj[key];
  if (isNumber(value)) {
    return value;
  }
  return undefined;
}

/**
 * 安全获取字符串值（从输入对象中）
 */
export function getStringValue<T extends ProblemInput>(
  obj: T,
  key: keyof T
): string | undefined {
  const value = obj[key];
  if (isString(value)) {
    return value;
  }
  return undefined;
}

/**
 * 将 VisualizationStep.variables 转换为 StepVariables
 * 用于类型安全的变量访问
 */
function convertToStepVariables(
  variables: Record<string, unknown> | undefined
): StepVariables | undefined {
  if (!variables) return undefined;

  const result: StepVariables = {};
  for (const [key, value] of Object.entries(variables)) {
    if (
      value === null ||
      value === undefined ||
      typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      isArray(value) ||
      isString2DArray(value)
    ) {
      result[key] = value as VariableValue;
    }
  }
  return result;
}

/**
 * 获取类型安全的变量对象
 */
function getSafeVariables(
  variables: Record<string, unknown> | StepVariables | undefined
): StepVariables | undefined {
  if (!variables) return undefined;
  // 如果已经是 StepVariables，直接返回
  // 否则进行转换
  return convertToStepVariables(variables as Record<string, unknown>);
}

/**
 * 安全获取布尔值（从变量对象中）
 */
export function getBooleanVariable(
  variables: Record<string, unknown> | StepVariables | undefined,
  key: string
): boolean | undefined {
  const stepVars = getSafeVariables(variables);
  if (!stepVars) return undefined;
  const value = stepVars[key];
  if (isBoolean(value)) {
    return value;
  }
  return undefined;
}

/**
 * 安全获取数字变量（从变量对象中）
 */
export function getNumberVariable(
  variables: Record<string, unknown> | StepVariables | undefined,
  key: string
): number | undefined {
  const stepVars = getSafeVariables(variables);
  if (!stepVars) return undefined;
  const value = stepVars[key];
  if (isNumber(value)) {
    return value;
  }
  return undefined;
}

/**
 * 安全获取数组变量（从变量对象中）
 */
export function getArrayVariable(
  variables: Record<string, unknown> | StepVariables | undefined,
  key: string
): number[] | string[] | undefined {
  const stepVars = getSafeVariables(variables);
  if (!stepVars) return undefined;
  const value = stepVars[key];
  if (isArray(value)) {
    return value;
  }
  return undefined;
}

// ============================================================================
// 类型辅助工具
// ============================================================================

/**
 * 从步骤数据中安全提取类型化的数据
 */
export function extractStepData<T extends StepData>(
  step: VisualizationStep | null,
  defaultValue: T
): T {
  if (!step?.data) return defaultValue;

  // 类型检查：确保 data 符合 T 的结构
  if (typeof step.data === "object" && step.data !== null) {
    return step.data as T;
  }

  return defaultValue;
}

/**
 * 从步骤变量中安全提取类型化的变量
 */
export function extractStepVariables(
  step: VisualizationStep | null
): StepVariables {
  if (!step?.variables) return {};

  // 类型转换：VisualizationStep.variables 是 Record<string, unknown>
  // 我们需要将其转换为 StepVariables
  const variables: StepVariables = {};
  for (const [key, value] of Object.entries(step.variables)) {
    if (
      value === null ||
      value === undefined ||
      typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      isArray(value) ||
      isString2DArray(value)
    ) {
      variables[key] = value as VariableValue;
    }
  }
  return variables;
}

/**
 * 类型安全的变量访问器
 * 用于在组件中安全地访问步骤变量
 */
export class StepVariableAccessor {
  constructor(private variables: StepVariables | undefined) {}

  getNumber(key: string): number | undefined {
    return getNumberVariable(this.variables, key);
  }

  getBoolean(key: string): boolean | undefined {
    return getBooleanVariable(this.variables, key);
  }

  getArray(key: string): number[] | string[] | undefined {
    return getArrayVariable(this.variables, key);
  }

  getString(key: string): string | undefined {
    if (!this.variables) return undefined;
    const value = this.variables[key];
    if (isString(value)) {
      return value;
    }
    return undefined;
  }

  has(key: string): boolean {
    return this.variables !== undefined && key in this.variables;
  }
}

// 类型已在上面定义并导出，无需重复导出
