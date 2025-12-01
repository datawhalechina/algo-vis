import { generateBestTimeToBuyStockIISteps } from "./algorithm";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getProblemCoreIdea } from "@/config/problemCoreIdeas";
import { ProblemInput } from "@/types/visualization";

interface BestTimeToBuyStockIIInput extends ProblemInput {
  prices: number[];
}

interface BestTimeToBuyStockIIData {
  prices?: number[];
}

function BestTimeToBuyStockIIVisualizer() {
  return (
    <ConfigurableVisualizer<BestTimeToBuyStockIIInput, BestTimeToBuyStockIIData>
      config={{
        defaultInput: { prices: [7, 1, 5, 3, 6, 4] },
        algorithm: (input) => generateBestTimeToBuyStockIISteps(input.prices),
        
        inputTypes: [{ type: "array", key: "prices", label: "价格数组" }],
        inputFields: [{ type: "array", key: "prices", label: "价格数组 prices", placeholder: "输入价格，如: 7,1,5,3,6,4" }],
        testCases: [
          { label: "示例 1", value: { prices: [7, 1, 5, 3, 6, 4] } },
          { label: "示例 2", value: { prices: [1, 2, 3, 4, 5] } },
          { label: "示例 3", value: { prices: [7, 6, 4, 3, 1] } },
          { label: "示例 4", value: { prices: [3, 3, 5, 0, 0, 3, 1, 4] } },
        ],
        
        customStepVariables: (variables) => {
          const totalProfit = variables?.totalProfit as number | undefined;
          const profit = variables?.profit as number | undefined;
          const day = variables?.day as number | undefined;
          
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {day !== undefined && (
                <div>
                  <span className="font-mono text-blue-600 font-semibold">当前天数</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{day + 1}</span>
                </div>
              )}
              {profit !== undefined && (
                <div>
                  <span className="font-mono text-purple-600 font-semibold">当日利润</span>
                  <span className="text-gray-500"> = </span>
                  <span className={`font-mono font-semibold ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profit > 0 ? '+' : ''}{profit}
                  </span>
                </div>
              )}
              {totalProfit !== undefined && (
                <div>
                  <span className="font-mono text-green-600 font-semibold">总利润</span>
                  <span className="text-gray-500"> = </span>
                  <span className="font-mono text-gray-800 font-semibold">{totalProfit}</span>
                </div>
              )}
            </div>
          );
        },
        
        render: ({ data, getNumberVariable, getBooleanVariable }) => {
          const { prices = [] } = data;
          const day = getNumberVariable('day');
          const totalProfit = getNumberVariable('totalProfit');
          const profit = getNumberVariable('profit');
          const buyDay = getNumberVariable('buyDay');
          const sellDay = getNumberVariable('sellDay');
          const hasProfit = getBooleanVariable('hasProfit');
          const finished = getBooleanVariable('finished');
          const coreIdea = getProblemCoreIdea(18);

          const maxPrice = Math.max(...(prices as number[]), 1);

          return (
            <div className="space-y-6">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}
              {/* 股票价格图 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" size={20} />
                  股票价格走势（贪心策略）
                </h3>
                
                <div className="relative h-[280px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  <div className="absolute left-6 bottom-6 right-6 top-6 flex items-end justify-around">
                    {(prices as number[]).map((price: number, index: number) => {
                      const height = (price / maxPrice) * 200;
                      const isCurrentDay = day === index;
                      const isBuyDay = buyDay === index;
                      const isSellDay = sellDay === index;
                      const isPrevDay = day !== undefined && index === day - 1;
                      
                      return (
                        <div key={index} className="relative flex flex-col items-center">
                          <motion.div
                            className="relative"
                            style={{ height }}
                            initial={{ height: 0 }}
                            animate={{ height }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              className={`w-12 h-full rounded-t-lg border-2 ${
                                isBuyDay && hasProfit
                                  ? 'bg-gradient-to-t from-green-400 to-green-500 border-green-600 shadow-xl'
                                  : isSellDay && hasProfit
                                  ? 'bg-gradient-to-t from-blue-400 to-blue-500 border-blue-600 shadow-xl'
                                  : isCurrentDay
                                  ? 'bg-gradient-to-t from-amber-400 to-orange-500 border-orange-600 shadow-lg'
                                  : isPrevDay && day !== undefined
                                  ? 'bg-gradient-to-t from-purple-300 to-purple-400 border-purple-500'
                                  : 'bg-gradient-to-t from-gray-200 to-gray-300 border-gray-400'
                              }`}
                              animate={{
                                scale: isCurrentDay || isBuyDay || isSellDay ? 1.05 : 1,
                              }}
                            />
                          </motion.div>

                          <div className={`mt-2 text-sm font-bold ${
                            isBuyDay && hasProfit ? 'text-green-700' : 
                            isSellDay && hasProfit ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            ¥{price}
                          </div>

                          <div className="text-xs text-gray-500">第{index + 1}天</div>

                          {isBuyDay && hasProfit && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -top-8 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full"
                            >
                              买入
                            </motion.div>
                          )}
                          {isSellDay && hasProfit && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -top-8 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full"
                            >
                              卖出
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 当前利润显示 */}
              {profit !== undefined && !finished && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg border-2 text-center ${
                    profit > 0
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className={`text-lg font-semibold flex items-center justify-center gap-2 ${
                    profit > 0 ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {profit > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    <span>今日{profit > 0 ? '盈利' : '无利润'}: </span>
                    <span className="text-2xl font-bold">
                      {profit > 0 ? '+' : ''}{profit}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* 最终结果 */}
              {finished && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl p-8 shadow-2xl text-center text-white"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <DollarSign className="mx-auto mb-4" size={64} strokeWidth={2.5} />
                  </motion.div>
                  <div className="text-3xl font-bold mb-4">
                    {totalProfit && totalProfit > 0 ? '最大利润' : '无法获利'}
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="inline-block bg-white rounded-2xl px-8 py-4 shadow-xl"
                  >
                    <span className={`font-mono font-bold text-5xl ${
                      totalProfit && totalProfit > 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      ¥{totalProfit}
                    </span>
                  </motion.div>
                  <div className="mt-4 text-lg opacity-90">
                    贪心策略：只要第二天价格高于今天，就交易
                  </div>
                </motion.div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default BestTimeToBuyStockIIVisualizer;
