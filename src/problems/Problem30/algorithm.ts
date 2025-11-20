import { VisualizationStep } from '@/types';

export function generateReverseBitsSteps(n: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let result = 0;
  let stepId = 0;

  // 将n转为32位二进制字符串
  const originalBinary = (n >>> 0).toString(2).padStart(32, '0');
  
  steps.push({
    id: stepId++,
    description: '初始化：result = 0，准备逐位处理32位二进制数',
    data: { n, result },
    variables: { 
      result, 
      i: -1,
      originalBinary,
      resultBinary: (0).toString(2).padStart(32, '0')
    },
    code: '2',
  });

  for (let i = 0; i < 32; i++) {
    const bit = (n >>> i) & 1;
    const resultBinary = (result >>> 0).toString(2).padStart(32, '0');
    
    steps.push({
      id: stepId++,
      description: `第 ${i} 位：取出第 ${i} 位的值 = ${bit}`,
      data: { n, result },
      variables: {
        i,
        bit,
        result,
        originalBinary,
        resultBinary,
      },
      code: '4',
    });

    result = (result << 1) | bit;
    const newResultBinary = (result >>> 0).toString(2).padStart(32, '0');

    steps.push({
      id: stepId++,
      description: `将 ${bit} 添加到结果的最低位，result 左移后或运算`,
      data: { n, result },
      variables: {
        i,
        bit,
        result,
        originalBinary,
        resultBinary: newResultBinary,
      },
      code: '5',
    });
  }

  const finalBinary = (result >>> 0).toString(2).padStart(32, '0');
  steps.push({
    id: stepId++,
    description: `完成！翻转后的结果为 ${result >>> 0}`,
    data: { n, result },
    variables: {
      result: result >>> 0,
      finished: true,
      originalBinary,
      resultBinary: finalBinary,
    },
    code: '8',
  });

  return steps;
}
