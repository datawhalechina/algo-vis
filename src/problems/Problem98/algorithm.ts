import { VisualizationStep } from "@/types";

export function dailyTemperaturesSteps(temperatures: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const n = temperatures.length;
  const answer = new Array(n).fill(0);
  const stack: number[] = []; // 存储索引
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始计算每日温度，共 ${n} 天，使用单调栈（存储索引）`,
    data: { 
      temperatures, 
      answer: [...answer], 
      stack: [...stack],
      n 
    },
    variables: { temperatures, answer: [...answer], stack: [...stack], n },
  });

  steps.push({
    id: stepId++,
    description: `初始化结果数组为 [${answer.join(', ')}]，栈为空`,
    data: { 
      temperatures, 
      answer: [...answer], 
      stack: [...stack] 
    },
    variables: { temperatures, answer: [...answer], stack: [...stack] },
  });

  for (let i = 0; i < n; i++) {
    const currentTemp = temperatures[i];
    
    steps.push({
      id: stepId++,
      description: `检查第 ${i} 天，温度 = ${currentTemp}°`,
      data: { 
        temperatures, 
        answer: [...answer], 
        stack: [...stack],
        currentIndex: i,
        currentTemp,
        checking: true
      },
      variables: { 
        temperatures, 
        answer: [...answer], 
        stack: [...stack], 
        currentIndex: i, 
        currentTemp 
      },
    });

    // 当前温度大于栈顶索引对应的温度时，栈顶找到了答案
    while (stack.length > 0 && currentTemp > temperatures[stack[stack.length - 1]]) {
      const prevIndex = stack.pop()!;
      const prevTemp = temperatures[prevIndex];
      const waitDays = i - prevIndex;
      answer[prevIndex] = waitDays;
      
      steps.push({
        id: stepId++,
        description: `温度 ${currentTemp}° > 第 ${prevIndex} 天的温度 ${prevTemp}°，第 ${prevIndex} 天需要等待 ${waitDays} 天`,
        data: { 
          temperatures, 
          answer: [...answer], 
          stack: [...stack],
          currentIndex: i,
          prevIndex,
          prevTemp,
          currentTemp,
          waitDays,
          found: true
        },
        variables: { 
          temperatures, 
          answer: [...answer], 
          stack: [...stack], 
          currentIndex: i,
          prevIndex,
          waitDays 
        },
      });
    }

    // 当前索引入栈
    stack.push(i);
    
    steps.push({
      id: stepId++,
      description: `将第 ${i} 天的索引压入栈，当前栈: [${stack.join(', ')}]`,
      data: { 
        temperatures, 
        answer: [...answer], 
        stack: [...stack],
        currentIndex: i,
        pushed: true
      },
      variables: { 
        temperatures, 
        answer: [...answer], 
        stack: [...stack], 
        currentIndex: i 
      },
    });
  }

  // 处理栈中剩余的索引（这些天之后没有更高的温度）
  if (stack.length > 0) {
    steps.push({
      id: stepId++,
      description: `栈中剩余索引 [${stack.join(', ')}] 对应的天数之后没有更高温度，保持为 0`,
      data: { 
        temperatures, 
        answer: [...answer], 
        stack: [...stack],
        remaining: true
      },
      variables: { 
        temperatures, 
        answer: [...answer], 
        stack: [...stack] 
      },
    });
  }

  steps.push({
    id: stepId++,
    description: `完成！结果数组: [${answer.join(', ')}]`,
    data: { 
      temperatures, 
      answer: [...answer], 
      stack: [],
      result: answer,
      completed: true 
    },
    variables: { 
      temperatures, 
      answer: [...answer], 
      result: answer 
    },
  });

  return steps;
}
