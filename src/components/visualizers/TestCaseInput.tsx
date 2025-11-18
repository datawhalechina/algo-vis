import React from 'react';
import { ProblemInput } from '@/types/visualization';

/**
 * 输入字段配置
 */
export type InputFieldConfig = 
  | { type: 'array'; key: string; label: string; placeholder?: string }
  | { type: 'number'; key: string; label: string; placeholder?: string; min?: number; max?: number }
  | { type: 'string'; key: string; label: string; placeholder?: string }
  | { type: 'array-and-number'; arrayKey: string; numberKey: string; arrayLabel: string; numberLabel: string; arrayPlaceholder?: string; numberPlaceholder?: string }
  | { type: 'array-and-number-m'; arrayKey: string; numberKey: string; arrayLabel: string; numberLabel: string; arrayPlaceholder?: string; numberPlaceholder?: string };

/**
 * 测试用例输入组件 Props
 */
export interface TestCaseInputProps<T> {
  /** 输入字段配置 */
  fields: InputFieldConfig[];
  /** 输入字符串值 */
  inputStrings: Record<string, string>;
  /** 处理输入变化 */
  onInputChange: (key: string, value: string) => void;
  /** 测试用例列表 */
  testCases?: Array<{ label: string; value: T }>;
  /** 处理测试用例选择 */
  onTestCaseSelect?: (value: T) => void;
}

/**
 * 测试用例输入组件
 * 
 * 统一的测试用例输入UI，支持多种输入类型
 * 
 * @example
 * ```tsx
 * <TestCaseInput
 *   fields={[{ type: 'array', key: 'nums', label: '数组' }]}
 *   inputStrings={inputHandler.inputStrings}
 *   onInputChange={inputHandler.handleInputChange}
 *   testCases={[
 *     { label: '示例1', value: { nums: [1, 2, 3] } }
 *   ]}
 *   onTestCaseSelect={inputHandler.handleTestCaseSelect}
 * />
 * ```
 */
export function TestCaseInput<T extends ProblemInput>({
  fields,
  inputStrings,
  onInputChange,
  testCases,
  onTestCaseSelect,
}: TestCaseInputProps<T>) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">测试用例</h3>
      
      <div className={`grid gap-4 ${fields.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {fields.map((field) => {
          if (field.type === 'array') {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}:
                </label>
                <input
                  type="text"
                  value={inputStrings[field.key] || ''}
                  onChange={(e) => onInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `输入数字，用逗号分隔，如: 1,2,3`}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
                />
              </div>
            );
          } else if (field.type === 'number') {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}:
                </label>
                <input
                  type="number"
                  value={inputStrings[field.key] || ''}
                  onChange={(e) => onInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `请输入数字`}
                  min={field.min}
                  max={field.max}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
                />
              </div>
            );
          } else if (field.type === 'string') {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}:
                </label>
                <input
                  type="text"
                  value={inputStrings[field.key] || ''}
                  onChange={(e) => onInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `请输入字符串`}
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
                />
              </div>
            );
          } else if (field.type === 'array-and-number' || field.type === 'array-and-number-m') {
            return (
              <React.Fragment key={`${field.arrayKey}-${field.numberKey}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.arrayLabel}:
                  </label>
                  <input
                    type="text"
                    value={inputStrings[field.arrayKey] || ''}
                    onChange={(e) => onInputChange(field.arrayKey, e.target.value)}
                    placeholder={field.arrayPlaceholder || `输入数字，用逗号分隔，如: 1,2,3`}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.numberLabel}:
                  </label>
                  <input
                    type="number"
                    value={inputStrings[field.numberKey] || ''}
                    onChange={(e) => onInputChange(field.numberKey, e.target.value)}
                    placeholder={field.numberPlaceholder || `请输入数字`}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white text-gray-800 font-semibold"
                  />
                </div>
              </React.Fragment>
            );
          }
          return null;
        })}
      </div>

      {/* 测试用例按钮 */}
      {testCases && testCases.length > 0 && onTestCaseSelect && (
        <div className="flex gap-2 flex-wrap mt-3">
          {testCases.map((testCase, index) => (
            <button
              key={index}
              onClick={() => onTestCaseSelect(testCase.value)}
              className="px-3 py-1 bg-white text-primary-700 text-sm rounded-md hover:bg-blue-100 transition border border-blue-200 font-medium"
            >
              {testCase.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

