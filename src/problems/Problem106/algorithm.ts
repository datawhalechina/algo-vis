import { VisualizationStep } from "@/types";

export function coinChangeSteps(coins: number[], amount: number): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `零钱兑换：硬币面额 [${coins.join(', ')}]，目标金额 ${amount}`,
    data: { coins, amount, dp: [...dp] },
    variables: { coins, amount, dp: [...dp] },
  });

  steps.push({
    id: stepId++,
    description: `初始化 dp 数组：dp[0] = 0（金额0需要0个硬币），其余为 Infinity`,
    data: { coins, amount, dp: [...dp] },
    variables: { coins, amount, dp: [...dp] },
  });

  for (let i = 1; i <= amount; i++) {
    steps.push({
      id: stepId++,
      description: `计算凑成金额 ${i} 所需的最少硬币数`,
      data: { 
        coins, 
        amount, 
        dp: [...dp],
        currentAmount: i,
        checking: true
      },
      variables: { 
        coins, 
        amount, 
        dp: [...dp],
        currentAmount: i
      },
    });

    for (const coin of coins) {
      if (i >= coin) {
        const oldValue = dp[i];
        const newValue = dp[i - coin] + 1;
        
        if (newValue < dp[i]) {
          dp[i] = newValue;
          
          steps.push({
            id: stepId++,
            description: `使用硬币 ${coin}：dp[${i}] = min(${oldValue === Infinity ? '∞' : oldValue}, dp[${i - coin}] + 1) = min(${oldValue === Infinity ? '∞' : oldValue}, ${dp[i - coin]} + 1) = ${dp[i]}`,
            data: { 
              coins, 
              amount, 
              dp: [...dp],
              currentAmount: i,
              currentCoin: coin,
              updated: true,
              oldValue,
              newValue: dp[i]
            },
            variables: { 
              coins, 
              amount, 
              dp: [...dp],
              currentAmount: i,
              currentCoin: coin,
              updated: true
            },
          });
        } else {
          steps.push({
            id: stepId++,
            description: `使用硬币 ${coin}：dp[${i - coin}] + 1 = ${newValue === Infinity ? '∞' : newValue}，不优于当前 dp[${i}] = ${dp[i] === Infinity ? '∞' : dp[i]}`,
            data: { 
              coins, 
              amount, 
              dp: [...dp],
              currentAmount: i,
              currentCoin: coin,
              updated: false
            },
            variables: { 
              coins, 
              amount, 
              dp: [...dp],
              currentAmount: i,
              currentCoin: coin,
              updated: false
            },
          });
        }
      }
    }

    steps.push({
      id: stepId++,
      description: `金额 ${i} 计算完成：dp[${i}] = ${dp[i] === Infinity ? '∞（无法凑成）' : dp[i]}`,
      data: { 
        coins, 
        amount, 
        dp: [...dp],
        currentAmount: i
      },
      variables: { 
        coins, 
        amount, 
        dp: [...dp],
        currentAmount: i
      },
    });
  }

  const result = dp[amount] === Infinity ? -1 : dp[amount];
  
  steps.push({
    id: stepId++,
    description: result === -1 
      ? `无法凑成金额 ${amount}，返回 -1` 
      : `完成！凑成金额 ${amount} 最少需要 ${result} 个硬币`,
    data: { 
      coins, 
      amount, 
      dp: [...dp],
      result,
      completed: true
    },
    variables: { 
      coins, 
      amount, 
      dp: [...dp],
      result,
      completed: true
    },
  });

  return steps;
}
