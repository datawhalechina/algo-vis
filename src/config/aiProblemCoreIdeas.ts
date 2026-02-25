import type { ProblemCoreIdeaConfig } from "./problemCoreIdeas";

/**
 * AI 题目核心思想
 */
export const aiProblemCoreIdeas: Record<number, ProblemCoreIdeaConfig> = {
  10001: {
    idea: "通过 Query 与所有 Key 做点积，结合温度缩放后输入 Softmax 得到注意力权重，再对 Value 向量进行加权求和，从而凸显与 Query 最匹配的 patch。",
    color: "purple",
    features: [
      "Q·K 点积衡量相关性",
      "温度缩放控制分布尖锐度",
      "Softmax 权重加权 Value 得上下文",
    ],
  },
  10026: {
    idea: "卷积核在输入特征图上滑动，每个位置计算局部区域与卷积核的点积，从而提取局部空间特征。",
    color: "blue",
    features: [
      "局部感受野提取空间模式",
      "参数共享减少模型复杂度",
      "步长和填充控制输出尺寸",
    ],
  },
  10027: {
    idea: "在每个池化窗口中选取最大值，保留最显著的特征信号，同时降低空间维度以减少计算量。",
    color: "emerald",
    features: [
      "下采样降低空间分辨率",
      "保留最强特征响应",
      "增强平移不变性",
    ],
  },
  10028: {
    idea: "对每个特征维度独立计算批次统计量（均值、方差），标准化后通过可学习参数恢复表达能力。",
    color: "cyan",
    features: [
      "标准化稳定激活分布",
      "γ/β 参数恢复表达能力",
      "加速训练并允许更大学习率",
    ],
  },
  10029: {
    idea: "通过跳跃连接将输入直接加到变换后的输出，使梯度能够无衰减地反向传播，解决深度网络训练困难。",
    color: "rose",
    features: [
      "恒等映射保证梯度直通",
      "学习残差而非完整映射",
      "支持训练数百层网络",
    ],
  },
  10030: {
    idea: "从重叠的检测框中筛选最优结果：按置信度排序后，保留最高分框并抑制与其 IoU 超过阈值的框。",
    color: "amber",
    features: [
      "贪心策略选择高置信框",
      "IoU 衡量框重叠程度",
      "去除冗余检测结果",
    ],
  },
};

/**
 * 根据 AI 题目 ID 获取核心思想
 */
export function getAiProblemCoreIdea(
  problemId: number
): ProblemCoreIdeaConfig | undefined {
  return aiProblemCoreIdeas[problemId];
}
