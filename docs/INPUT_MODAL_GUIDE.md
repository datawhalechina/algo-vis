# InputModal 组件使用指南

## 概述

`InputModal` 是一个通用的输入模态框组件，用于替代原生的 `prompt()` 弹窗，提供更好的用户体验。

## 特性

✅ **美观的模态框** - 使用 Framer Motion 动画  
✅ **实时验证** - 输入时即时验证，错误提示清晰  
✅ **支持多种类型** - text、number、array  
✅ **自定义验证** - 可添加自定义验证规则  
✅ **响应式设计** - 适配桌面和移动端  

## 使用方法

### 1. 导入组件

```typescript
import { useState } from "react";
import InputModal from "@/components/InputModal";
```

### 2. 添加状态

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 3. 处理提交

```typescript
const handleInputSubmit = (values: Record<string, any>) => {
  setInput({ nums: values.nums });
};
```

### 4. 渲染组件

```tsx
<InputModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleInputSubmit}
  title="自定义输入"
  fields={[
    {
      name: 'nums',
      label: '数组',
      type: 'array',
      defaultValue: input.nums.join(','),
      placeholder: '例如：1,2,3,4,5',
    },
  ]}
/>
```

### 5. 触发按钮

```tsx
<button onClick={() => setIsModalOpen(true)}>
  自定义输入
</button>
```

## 字段配置

### InputField 接口

```typescript
interface InputField {
  name: string;              // 字段名称
  label: string;             // 显示标签
  type: 'text' | 'number' | 'array';  // 字段类型
  defaultValue: string;      // 默认值
  placeholder?: string;      // 占位符
  validation?: (value: string) => boolean;  // 自定义验证
  errorMessage?: string;     // 错误提示
}
```

### 字段类型

**text** - 文本输入
```typescript
{
  name: 'text',
  label: '文本',
  type: 'text',
  defaultValue: 'hello',
}
```

**number** - 数字输入
```typescript
{
  name: 'target',
  label: '目标值',
  type: 'number',
  defaultValue: '9',
}
```

**array** - 数组输入（逗号分隔）
```typescript
{
  name: 'nums',
  label: '数组',
  type: 'array',
  defaultValue: '1,2,3',
  placeholder: '用逗号分隔数字',
}
```

## 多字段示例

```tsx
<InputModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleInputSubmit}
  title="自定义输入"
  fields={[
    {
      name: 'nums',
      label: '数组 nums',
      type: 'array',
      defaultValue: input.nums.join(','),
    },
    {
      name: 'target',
      label: '目标值 target',
      type: 'number',
      defaultValue: input.target.toString(),
    },
  ]}
/>
```

## 自定义验证

```typescript
{
  name: 'height',
  label: '高度数组',
  type: 'array',
  defaultValue: '1,8,6',
  validation: (value) => {
    const arr = value.split(',').map(n => Number(n.trim()));
    return arr.every(n => !isNaN(n) && n >= 0);
  },
  errorMessage: '请输入非负整数数组',
}
```

## 已更新的组件

- ✅ `ContainerVisualizer` - 盛最多水的容器
- ✅ `MoveZeroesVisualizer` - 移动零
- 🔜 其他可视化组件（待更新）

## 对比

### 旧方式（prompt）
```typescript
const handleInputChange = () => {
  const input = prompt("请输入数组", "1,2,3");
  if (input) {
    // 处理输入
  }
};
```

❌ 样式单调  
❌ 无法验证  
❌ 体验差  

### 新方式（InputModal）
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);

<InputModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleInputSubmit}
  fields={[...]}
/>
```

✅ 美观的UI  
✅ 实时验证  
✅ 错误提示  
✅ 动画效果  

## 开发建议

1. **新题目**：直接使用 `InputModal`
2. **旧题目**：逐步迁移到 `InputModal`
3. **自定义验证**：根据题目需求添加验证规则
4. **多字段**：复杂输入使用多个字段

## 示例代码

完整示例请参考：
- `src/problems/ContainerWithMostWater/ContainerVisualizer.tsx`
- `src/problems/MoveZeroes/MoveZeroesVisualizer.tsx`
