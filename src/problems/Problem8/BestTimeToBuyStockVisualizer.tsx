import { generateBestTimeToBuyStockSteps } from "./algorithm";
import { motion } from "framer-motion";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ProblemInput } from "@/types/visualization";

interface BestTimeToBuyStockInput extends ProblemInput {
  prices: number[];
}

interface BestTimeToBuyStockData {
  prices?: number[];
}

function BestTimeToBuyStockVisualizer() {
  return (
    <ConfigurableVisualizer<BestTimeToBuyStockInput, BestTimeToBuyStockData>
      config={{
        defaultInput: { prices: [7, 1, 5, 3, 6, 4] },
        algorithm: (input) => generateBestTimeToBuyStockSteps(input.prices),
        
        inputTypes: [{ type: "array", key: "prices", label: "价格数组" }],
        inputFields: [
          { type: "array", key: "prices", label: "价格数组 prices", placeholder: "输入价格，用逗号分隔，如: 7,1,5,3,6,4" }
        ],
        testCases: [
          { label: "示例 1", value: { prices: [7, 1, 5, 3, 6, 4] } },
          { label: "示例 2", value: { prices: [7, 6, 4, 3, 1] } },
          { label: "示例 3", value: { prices: [2, 4, 1, 7, 5, 11] } },
        ],
        
        customStepVariables: (variables) => (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {variables.minPrice !== undefined && (
              <div>
                <span className="font-mono text-blue-600 font-semibold">minPrice</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.minPrice as number}</span>
              </div>
            )}
            {variables.maxProfit !== undefined && (
              <div>
                <span className="font-mono text-green-600 font-semibold">maxProfit</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.maxProfit as number}</span>
              </div>
            )}
            {variables.profit !== undefined && (
              <div>
                <span className="font-mono text-purple-600 font-semibold">profit</span>
                <span className="text-gray-500"> = </span>
                <span className="font-mono text-gray-800 font-semibold">{variables.profit as number}</span>
              </div>
            )}
          </div>
        ),
        
        render: ({ getNumberVariable, getBooleanVariable, visualization }) => {
          const day = getNumberVariable('day');
          const maxProfit = getNumberVariable('maxProfit');
          const minDay = getNumberVariable('minDay');
          const maxProfitBuyDay = getNumberVariable('maxProfitBuyDay');
          const maxProfitSellDay = getNumberVariable('maxProfitSellDay');
          const finished = getBooleanVariable('finished');
          
          const input = visualization.input as BestTimeToBuyStockInput;
          const maxPrice = Math.max(...input.prices);

          return (
            <>

              {/* 股票价格折线图 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" size={20} />
                  股票价格走势
                </h3>
                
                <div className="relative h-[280px] bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg border border-gray-100">
                  <div className="absolute left-6 bottom-6 right-6 top-6 flex items-end justify-around">
                    {input.prices.map((price: number, index: number) => {
                      const isCurrentDay = day === index;
                      const isMinDay = minDay === index;
                      const isBuyDay = maxProfitBuyDay === index;
                      const isSellDay = maxProfitSellDay === index;
                      const height = (price / maxPrice) * 200;

                      return (
                        <div key={index} className="relative flex flex-col items-center">
                          {/* 柱状图 */}
                          <motion.div
                            className="relative"
                            style={{ height }}
                            initial={{ height: 0 }}
                            animate={{ height }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div
                              className={`w-12 h-full rounded-t-lg border-2 ${
                                isBuyDay && finished
                                  ? 'bg-gradient-to-t from-green-400 to-green-500 border-green-600 shadow-xl'
                                  : isSellDay && finished
                                  ? 'bg-gradient-to-t from-blue-400 to-blue-500 border-blue-600 shadow-xl'
                                  : isCurrentDay
                                  ? 'bg-gradient-to-t from-amber-400 to-orange-500 border-orange-600 shadow-lg'
                                  : isMinDay
                                  ? 'bg-gradient-to-t from-blue-300 to-blue-400 border-blue-500'
                                  : 'bg-gradient-to-t from-gray-200 to-gray-300 border-gray-400'
                              }`}
                              animate={{
                                scale: isCurrentDay || isBuyDay || isSellDay ? 1.05 : 1,
                              }}
                              transition={{ duration: 0.2 }}
                            />
                          </motion.div>

                          {/* 价格标签 */}
                          <div className={`mt-2 text-sm font-bold ${
                            isBuyDay && finished ? 'text-green-700' : isSellDay && finished ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            ¥{price}
                          </div>

                          {/* 日期 */}
                          <div className="text-xs text-gray-500">第{index + 1}天</div>

                          {/* 标记 */}
                          {(isBuyDay && finished) && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -top-8 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1"
                            >
                              <TrendingUp size={12} />
                              买入
                            </motion.div>
                          )}
                          {(isSellDay && finished) && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -top-8 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1"
                            >
                              <TrendingDown size={12} />
                              卖出
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 最终结果 */}
              {finished && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`rounded-2xl p-8 shadow-2xl ${
                    maxProfit && maxProfit > 0
                      ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400'
                      : 'bg-gradient-to-r from-gray-400 via-slate-400 to-gray-500'
                  }`}
                >
                  <div className="text-center text-white">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-6xl mb-4"
                    >
                      {maxProfit && maxProfit > 0 ? '🎉' : '😢'}
                    </motion.div>
                    <div className="text-3xl font-bold mb-4">
                      {maxProfit && maxProfit > 0 ? '找到最佳交易！' : '无法获利'}
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="inline-block bg-white rounded-2xl px-8 py-4 shadow-xl"
                    >
                      <span className={`font-mono font-bold text-5xl ${
                        maxProfit && maxProfit > 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        ¥{maxProfit}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </>
          );
        },
      }}
    />
  );
}

export default BestTimeToBuyStockVisualizer;
