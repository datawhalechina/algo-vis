import { Difficulty } from "@/types";
import { DRLCategory, DRLProblem } from "@/types/drl";

export const monteCarloProblems: DRLProblem[] = [
  {
    id: 30029,
    slug: "monte-carlo-estimation",
    title: "蒙特卡洛估计",
    category: DRLCategory.MONTE_CARLO,
    difficulty: Difficulty.EASY,
    description:
      "蒙特卡洛方法通过重复随机采样来估计难以直接计算的期望。在强化学习中，它使用完整回合的真实回报 $G_t$ 评价状态或动作，是理解策略梯度、重要性采样和蒙特卡洛树搜索的基础。",
    learningGoals: [
      "理解样本均值为什么能估计期望",
      "掌握回合回报 $G_t$ 的反向计算",
      "理解样本数量与估计方差的关系",
      "区分蒙特卡洛方法与 TD 自举更新",
    ],
    inputs: [
      "采样轨迹 $\\tau=(s_0,a_0,r_1,\\ldots,s_T)$",
      "折扣因子 $\\gamma$",
      "样本数量 $N$",
    ],
    outputs: [
      "期望回报的样本估计 $\\hat V(s)$",
      "每个时间步的回报 $G_t$",
    ],
    tags: ["蒙特卡洛", "采样", "回报", "期望", "方差"],
    examples: [
      {
        input: "某状态被访问 4 次，观测回报为 2、6、4、8",
        output: "$\\hat V(s)=(2+6+4+8)/4=5$",
        explanation: "用独立样本的平均值近似该状态的期望回报。",
      },
    ],
    heroNote: "先理解随机采样如何估计期望，再学习 TD 的自举思想，会更容易看清两者的偏差与方差差异。",
  },
];
