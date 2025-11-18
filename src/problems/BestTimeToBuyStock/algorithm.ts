import { VisualizationStep } from "@/types";

/**
 * 生成买卖股票可视化步骤
 */
export function generateBestTimeToBuyStockSteps(
  prices: number[]
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  // 初始状态
  steps.push({
    id: stepId++,
    description: `初始化：minPrice = ${prices[0]}（第一天的价格），maxProfit = 0（初始利润为0）`,
    data: { prices: [...prices] },
    variables: {
      day: 0,
      minPrice: prices[0],
      maxProfit: 0,
      minDay: 0,
    },
  });

  let minPrice = prices[0];
  let maxProfit = 0;
  let minDay = 0;
  let maxProfitBuyDay = 0;
  let maxProfitSellDay = 0;

  // 遍历数组
  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i];
    const profit = currentPrice - minPrice;

    // 计算利润
    steps.push({
      id: stepId++,
      description: `第 ${i + 1} 天：价格 = ${currentPrice}，如果在第 ${minDay + 1} 天（价格 ${minPrice}）买入，今天卖出，利润 = ${currentPrice} - ${minPrice} = ${profit}`,
      data: { prices: [...prices] },
      variables: {
        day: i,
        currentPrice,
        minPrice,
        maxProfit,
        profit,
        minDay,
        calculating: true,
      },
    });

    // 更新最大利润
    if (profit > maxProfit) {
      maxProfit = profit;
      maxProfitBuyDay = minDay;
      maxProfitSellDay = i;
      
      steps.push({
        id: stepId++,
        description: `✓ 找到更大的利润！更新 maxProfit = ${maxProfit}（在第 ${maxProfitBuyDay + 1} 天买入，第 ${maxProfitSellDay + 1} 天卖出）`,
        data: { prices: [...prices] },
        variables: {
          day: i,
          currentPrice,
          minPrice,
          maxProfit,
          profit,
          minDay,
          maxProfitBuyDay,
          maxProfitSellDay,
          isNewMax: true,
        },
      });
    } else {
      steps.push({
        id: stepId++,
        description: `当前利润 ${profit} 不大于最大利润 ${maxProfit}，保持不变`,
        data: { prices: [...prices] },
        variables: {
          day: i,
          currentPrice,
          minPrice,
          maxProfit,
          profit,
          minDay,
          maxProfitBuyDay,
          maxProfitSellDay,
        },
      });
    }

    // 更新最低价格
    if (currentPrice < minPrice) {
      minPrice = currentPrice;
      minDay = i;
      
      steps.push({
        id: stepId++,
        description: `✓ 发现更低的价格！更新 minPrice = ${minPrice}（第 ${minDay + 1} 天）`,
        data: { prices: [...prices] },
        variables: {
          day: i,
          currentPrice,
          minPrice,
          maxProfit,
          profit,
          minDay,
          maxProfitBuyDay,
          maxProfitSellDay,
          isNewMin: true,
        },
      });
    }
  }

  // 最终结果
  steps.push({
    id: stepId++,
    description: maxProfit > 0 
      ? `算法完成！最大利润为 ${maxProfit}，在第 ${maxProfitBuyDay + 1} 天（价格 ${prices[maxProfitBuyDay]}）买入，第 ${maxProfitSellDay + 1} 天（价格 ${prices[maxProfitSellDay]}）卖出`
      : `算法完成！价格持续下跌，无法获利，最大利润为 0`,
    data: { prices: [...prices] },
    variables: {
      minPrice,
      maxProfit,
      minDay,
      maxProfitBuyDay,
      maxProfitSellDay,
      finished: true,
    },
  });

  return steps;
}
