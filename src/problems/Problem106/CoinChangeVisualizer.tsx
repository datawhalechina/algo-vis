import { Coins } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { ArrayTemplate } from "@/components/visualizers/templates/ArrayTemplate";
import { ProblemInput } from "@/types/visualization";
import { coinChangeSteps } from "./algorithm";

interface CoinChangeInput extends ProblemInput {
  coins: number[];
  amount: number;
}

function CoinChangeVisualizer() {
  return (
    <ConfigurableVisualizer<CoinChangeInput, Record<string, any>>
      config={{
        defaultInput: { coins: [1,2,5], amount: 11 },
        algorithm: (input) => coinChangeSteps(input.coins, input.amount),
        
        inputTypes: [
          { type: "array", key: "coins", label: "coins" },
          { type: "number", key: "amount", label: "amount" },
        ],
        inputFields: [
          { type: "array", key: "coins", label: "硬币面额", placeholder: "输入硬币数组" },
          { type: "number", key: "amount", label: "目标金额", placeholder: "输入目标金额" },
        ],
        testCases: [
          { label: "示例 1", value: { coins: [1,2,5], amount: 11 } },
          { label: "示例 2", value: { coins: [2], amount: 3 } },
          { label: "示例 3", value: { coins: [1], amount: 0 } },
        ],
        
        render: ({ variables, visualization }) => {
          const input = visualization.input as CoinChangeInput;
          const coins = input.coins;
          const amount = input.amount;
          const dp = variables?.dp as number[] | undefined;
          const currentAmount = variables?.currentAmount as number | undefined;
          const currentCoin = variables?.currentCoin as number | undefined;
          const result = variables?.result as number | undefined;

          return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="text-yellow-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">零钱兑换 - 完全背包</h3>
              </div>
              
              <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-yellow-700">💡 核心思想：</span>
                  dp[i] 表示凑成金额 i 所需的最少硬币数。
                </p>
              </div>

              {/* 硬币和目标 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-amber-100 rounded-lg border-2 border-amber-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-2">硬币面额</div>
                    <div className="text-lg font-bold text-amber-700">[{coins.join(', ')}]</div>
                  </div>
                </div>
                <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-2">目标金额</div>
                    <div className="text-2xl font-bold text-blue-700">{amount}</div>
                  </div>
                </div>
              </div>

              {/* 当前状态 */}
              {currentAmount !== undefined && currentCoin !== undefined && (
                <div className="mb-6 p-4 bg-purple-100 rounded-lg border-2 border-purple-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700">当前</div>
                    <div className="text-lg font-bold text-purple-700">
                      金额 {currentAmount}，尝试硬币 {currentCoin}
                    </div>
                  </div>
                </div>
              )}

              {/* DP数组 */}
              {dp && (
                <div className="mb-6">
                  <div className="text-sm font-semibold text-gray-700 mb-2">DP数组（凑成各金额所需最少硬币数）</div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
                    <ArrayTemplate
                      data={dp.slice(0, amount + 1)}
                      renderItem={(value: number, index: number, state) => {
                        const isActive = state.isActive;
                        const isInfinity = value === Infinity;
                        return (
                          <div 
                            className="w-14 h-14 rounded flex flex-col items-center justify-center border-2 transition-all"
                            style={{
                              backgroundColor: isActive ? '#3b82f6' : isInfinity ? '#fee2e2' : '#d1fae5',
                              borderColor: isActive ? '#2563eb' : isInfinity ? '#fca5a5' : '#86efac',
                              color: isActive ? '#ffffff' : isInfinity ? '#991b1b' : '#15803d',
                              transform: isActive ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >
                            <div className="text-xs opacity-70">{index}</div>
                            <div className="text-sm font-bold">
                              {value === Infinity ? '∞' : value}
                            </div>
                          </div>
                        );
                      }}
                      getItemState={(index: number) => ({
                        isActive: currentAmount === index,
                      })}
                      layout={{
                        direction: 'row',
                        gap: '0.25rem',
                        wrap: true,
                        justify: 'center'
                      }}
                      animation={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* 最终结果 */}
              {result !== undefined && (
                <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-500">
                  <div className="text-center">
                    <div className="text-sm text-gray-700 mb-1">
                      {result === -1 ? '无法凑成' : '最少硬币数'}
                    </div>
                    <div className="text-4xl font-bold text-green-700">
                      {result === -1 ? '-1' : result}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default CoinChangeVisualizer;
