import { VisualizationStep } from "@/types";

interface MinStackOperation {
  type: 'push' | 'pop' | 'top' | 'getMin';
  value?: number;
}

function parseOperations(operations: string): MinStackOperation[] {
  const ops: MinStackOperation[] = [];
  const parts = operations.split(',').map(s => s.trim());
  
  for (const part of parts) {
    if (part.startsWith('push(')) {
      const value = parseInt(part.match(/push\((-?\d+)\)/)?.[1] || '0');
      ops.push({ type: 'push', value });
    } else if (part === 'pop' || part === 'pop()') {
      ops.push({ type: 'pop' });
    } else if (part === 'top' || part === 'top()') {
      ops.push({ type: 'top' });
    } else if (part === 'getMin' || part === 'getMin()') {
      ops.push({ type: 'getMin' });
    }
  }
  
  return ops;
}

export function minStackSteps(operations: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;
  
  const stack: number[] = [];
  const minStack: number[] = [];
  const ops = parseOperations(operations);
  
  steps.push({
    id: stepId++,
    description: `初始化最小栈，准备执行 ${ops.length} 个操作`,
    data: { 
      stack: [...stack], 
      minStack: [...minStack],
      operations: ops.map(o => o.type + (o.value !== undefined ? `(${o.value})` : '()')).join(', ')
    },
    variables: { stack: [...stack], minStack: [...minStack] },
  });

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    
    if (op.type === 'push' && op.value !== undefined) {
      stack.push(op.value);
      
      // 如果最小栈为空，或者新值小于等于当前最小值，也push到最小栈
      if (minStack.length === 0 || op.value <= minStack[minStack.length - 1]) {
        minStack.push(op.value);
      }
      
      steps.push({
        id: stepId++,
        description: `push(${op.value}): 将 ${op.value} 压入主栈${minStack[minStack.length - 1] === op.value ? '，同时压入最小栈（新最小值）' : ''}`,
        data: { 
          stack: [...stack], 
          minStack: [...minStack],
          operation: `push(${op.value})`,
          currentOp: i,
          highlighted: stack.length - 1
        },
        variables: { stack: [...stack], minStack: [...minStack], operation: `push(${op.value})` },
      });
      
    } else if (op.type === 'pop') {
      if (stack.length > 0) {
        const val = stack.pop()!;
        
        // 如果弹出的是最小值，最小栈也要pop
        if (minStack.length > 0 && val === minStack[minStack.length - 1]) {
          minStack.pop();
        }
        
        steps.push({
          id: stepId++,
          description: `pop(): 弹出栈顶元素 ${val}${minStack.length < stack.length + 1 ? '，同时弹出最小栈' : ''}`,
          data: { 
            stack: [...stack], 
            minStack: [...minStack],
            operation: 'pop()',
            currentOp: i,
            poppedValue: val
          },
          variables: { stack: [...stack], minStack: [...minStack], poppedValue: val },
        });
      }
      
    } else if (op.type === 'top') {
      const val = stack.length > 0 ? stack[stack.length - 1] : undefined;
      
      steps.push({
        id: stepId++,
        description: `top(): 获取栈顶元素 = ${val}`,
        data: { 
          stack: [...stack], 
          minStack: [...minStack],
          operation: 'top()',
          currentOp: i,
          result: val,
          highlighted: stack.length - 1
        },
        variables: { stack: [...stack], minStack: [...minStack], result: val },
      });
      
    } else if (op.type === 'getMin') {
      const minVal = minStack.length > 0 ? minStack[minStack.length - 1] : undefined;
      
      steps.push({
        id: stepId++,
        description: `getMin(): 获取当前最小值 = ${minVal}`,
        data: { 
          stack: [...stack], 
          minStack: [...minStack],
          operation: 'getMin()',
          currentOp: i,
          result: minVal,
          highlightMin: true
        },
        variables: { stack: [...stack], minStack: [...minStack], minValue: minVal },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `完成！所有操作执行完毕`,
    data: { 
      stack: [...stack], 
      minStack: [...minStack],
      completed: true
    },
    variables: { stack: [...stack], minStack: [...minStack] },
  });

  return steps;
}
