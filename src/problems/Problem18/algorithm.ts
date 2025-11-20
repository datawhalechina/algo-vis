import { VisualizationStep } from "@/types";

export function generateBestTimeToBuyStockIISteps(prices: number[]): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: `开始计算：价格数组 [${prices.join(', ')}]，可以多次买卖`,
    data: { prices: [...prices] },
    variables: { totalProfit: 0, day: 0 },
  });

  let totalProfit = 0;
  const transactions: Array<{ buy: number; sell: number; profit: number }> = [];

  for (let i = 1; i < prices.length; i++) {
    const profit = prices[i] - prices[i - 1];
    
    steps.push({
      id: stepId++,
      description: `第 ${i + 1} 天：价格 ${prices[i]}，与前一天比较 ${prices[i]} - ${prices[i - 1]} = ${profit}`,
      data: { prices: [...prices] },
      variables: { totalProfit, day: i, profit, prevDay: i - 1 },
    });

    if (profit > 0) {
      totalProfit += profit;
      transactions.push({ buy: i - 1, sell: i, profit });
      
      steps.push({
        id: stepId++,
        description: `有利润！在第 ${i} 天买入，第 ${i + 1} 天卖出，利润 +${profit}，总利润 = ${totalProfit}`,
        data: { prices: [...prices] },
        variables: { 
          totalProfit, 
          day: i, 
          profit, 
          buyDay: i - 1,
          sellDay: i,
          hasProfit: true,
          transactions: [...transactions],
        },
      });
    } else {
      steps.push({
        id: stepId++,
        description: `价格下跌或持平，不交易`,
        data: { prices: [...prices] },
        variables: { totalProfit, day: i, profit, noTrade: true },
      });
    }
  }

  steps.push({
    id: stepId++,
    description: `计算完成！最大利润 = ${totalProfit}，共进行 ${transactions.length} 笔交易`,
    data: { prices: [...prices] },
    variables: { totalProfit, transactions: [...transactions], finished: true },
  });

  return steps;
}
