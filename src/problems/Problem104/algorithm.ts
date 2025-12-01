import { VisualizationStep } from "@/types";

export function mergeIntervalsSteps(intervals: number[][]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  if (intervals.length === 0) {
    steps.push({
      id: stepId++,
      description: "输入为空，返回空数组",
      data: { intervals: [], result: [] },
      variables: { intervals: [], result: [] },
    });
    return steps;
  }

  steps.push({
    id: stepId++,
    description: `开始合并区间，共 ${intervals.length} 个区间`,
    data: { intervals: [...intervals.map(i => [...i])], originalIntervals: [...intervals.map(i => [...i])] },
    variables: { intervals: [...intervals.map(i => [...i])], originalIntervals: [...intervals.map(i => [...i])] },
  });

  // 按起始位置排序
  const sortedIntervals = [...intervals].sort((a, b) => a[0] - b[0]);
  
  steps.push({
    id: stepId++,
    description: "按区间起始位置排序",
    data: { 
      intervals: sortedIntervals.map(i => [...i]),
      sorted: true,
      originalIntervals: [...intervals.map(i => [...i])]
    },
    variables: { 
      intervals: sortedIntervals.map(i => [...i]),
      sorted: true
    },
  });

  const result: number[][] = [];
  let current = [...sortedIntervals[0]];

  steps.push({
    id: stepId++,
    description: `初始化当前区间为 [${current[0]}, ${current[1]}]`,
    data: { 
      intervals: sortedIntervals.map(i => [...i]),
      current: [...current],
      result: [...result],
      currentIndex: 0
    },
    variables: { 
      intervals: sortedIntervals.map(i => [...i]),
      current: [...current],
      result: [...result],
      currentIndex: 0
    },
  });

  for (let i = 1; i < sortedIntervals.length; i++) {
    const interval = sortedIntervals[i];
    
    steps.push({
      id: stepId++,
      description: `检查区间 [${interval[0]}, ${interval[1]}]`,
      data: { 
        intervals: sortedIntervals.map(i => [...i]),
        current: [...current],
        result: [...result],
        currentIndex: i,
        checkingInterval: [...interval]
      },
      variables: { 
        intervals: sortedIntervals.map(i => [...i]),
        current: [...current],
        result: [...result],
        currentIndex: i,
        checkingInterval: [...interval]
      },
    });

    if (interval[0] <= current[1]) {
      // 重叠，合并
      const oldCurrent = [...current];
      current[1] = Math.max(current[1], interval[1]);
      
      steps.push({
        id: stepId++,
        description: `区间 [${interval[0]}, ${interval[1]}] 与当前区间 [${oldCurrent[0]}, ${oldCurrent[1]}] 重叠，合并为 [${current[0]}, ${current[1]}]`,
        data: { 
          intervals: sortedIntervals.map(i => [...i]),
          current: [...current],
          result: [...result],
          currentIndex: i,
          merged: true,
          oldCurrent: [...oldCurrent]
        },
        variables: { 
          intervals: sortedIntervals.map(i => [...i]),
          current: [...current],
          result: [...result],
          currentIndex: i,
          merged: true
        },
      });
    } else {
      // 不重叠，加入结果
      result.push([...current]);
      
      steps.push({
        id: stepId++,
        description: `区间 [${interval[0]}, ${interval[1]}] 与当前区间 [${current[0]}, ${current[1]}] 不重叠，将 [${current[0]}, ${current[1]}] 加入结果`,
        data: { 
          intervals: sortedIntervals.map(i => [...i]),
          current: [...current],
          result: result.map(r => [...r]),
          currentIndex: i,
          merged: false
        },
        variables: { 
          intervals: sortedIntervals.map(i => [...i]),
          current: [...current],
          result: result.map(r => [...r]),
          currentIndex: i,
          merged: false
        },
      });
      
      current = [...interval];
      
      steps.push({
        id: stepId++,
        description: `更新当前区间为 [${current[0]}, ${current[1]}]`,
        data: { 
          intervals: sortedIntervals.map(i => [...i]),
          current: [...current],
          result: result.map(r => [...r]),
          currentIndex: i
        },
        variables: { 
          intervals: sortedIntervals.map(i => [...i]),
          current: [...current],
          result: result.map(r => [...r]),
          currentIndex: i
        },
      });
    }
  }

  // 加入最后一个区间
  result.push([...current]);
  
  steps.push({
    id: stepId++,
    description: `加入最后一个区间 [${current[0]}, ${current[1]}]`,
    data: { 
      intervals: sortedIntervals.map(i => [...i]),
      current: [...current],
      result: result.map(r => [...r]),
      completed: true
    },
    variables: { 
      intervals: sortedIntervals.map(i => [...i]),
      current: [...current],
      result: result.map(r => [...r]),
      completed: true
    },
  });

  steps.push({
    id: stepId++,
    description: `完成！合并后得到 ${result.length} 个区间`,
    data: { 
      intervals: sortedIntervals.map(i => [...i]),
      result: result.map(r => [...r]),
      completed: true,
      finalResult: result.map(r => [...r])
    },
    variables: { 
      intervals: sortedIntervals.map(i => [...i]),
      result: result.map(r => [...r]),
      completed: true,
      finalResult: result.map(r => [...r])
    },
  });

  return steps;
}
