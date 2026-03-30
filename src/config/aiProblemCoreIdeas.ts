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
  10002: {
    idea: "计算 Q 与所有 K 的点积后除以 √d_k 进行缩放，经 Softmax 得到注意力权重，再对 V 加权求和，实现序列各位置的动态信息聚合。",
    color: "purple",
    features: [
      "QKᵀ 点积衡量 Query 与 Key 的相关性",
      "除以 √d_k 防止梯度消失，稳定训练",
      "Softmax 权重加权 Value 完成信息融合",
    ],
  },
  10003: {
    idea: "将 Q/K/V 矩阵按列切分为多个头，每个头在低维子空间独立执行缩放点积注意力，最后拼接所有头的输出，使模型并行捕获多种类型的上下文依赖关系。",
    color: "blue",
    features: [
      "多头并行捕获不同类型的依赖关系",
      "d_k = d_model / num_heads 控制每头维度",
      "拼接后可经线性变换整合多头信息",
    ],
  },
  10004: {
    idea: "将同一输入序列 X 通过三个权重矩阵 W_Q、W_K、W_V 分别投影为 Q、K、V，再执行缩放点积注意力，让每个位置都能「关注」序列中的所有位置，捕获长距离依赖。",
    color: "indigo",
    features: [
      "Q=K=V 均来自同一序列，体现「自」注意力的本质",
      "线性投影 W_Q/W_K/W_V 让模型学习最优的注意力空间",
      "并行计算全序列注意力，是 BERT/GPT 等模型的核心组件",
    ],
  },
  10005: {
    idea: "用不同频率的正弦/余弦函数为每个位置生成唯一的编码向量，与 token 嵌入相加后，使注意力机制能够感知词序，同时支持任意长度的序列外推。",
    color: "purple",
    features: [
      "sin/cos 函数生成位置唯一编码",
      "低维高频、高维低频，覆盖多粒度",
      "与嵌入直接相加，无需额外参数",
    ],
  },
  10006: {
    idea: "在缩放点积注意力基础上，用下三角掩码矩阵将上三角（未来位置）的分数置为 -∞，确保 Softmax 后每个位置只能看到当前及之前的 Token，是 GPT 等自回归解码器的核心机制。",
    color: "rose",
    features: [
      "下三角掩码禁止看到未来",
      "-∞ 使 Softmax 权重为零",
      "保证自回归生成合理性",
    ],
  },
  10007: {
    idea: "FFN 通过「扩展-激活-压缩」两层全连接结构，对每个 Token 独立进行非线性特征变换：先将维度扩展 4 倍，ReLU 引入稀疏激活，再压缩回原始维度，为 Transformer 提供逐位置的非线性表达能力。",
    color: "emerald",
    features: [
      "两层线性变换夹 ReLU 激活",
      "d_ff ≈ 4×d_model 扩展维度",
      "逐 Token 独立计算，无位置交互",
    ],
  },
  10008: {
    idea: "在单个样本的所有特征维度上计算均值和方差，标准化后通过可学习参数 γ/β 恢复表达能力，使模型在任意批次大小下都能稳定训练。",
    color: "cyan",
    features: [
      "沿特征维度归一化（非批次维度）",
      "γ/β 参数恢复表达能力",
      "不依赖批次大小，NLP 首选",
    ],
  },
  10009: {
    idea: "将子层输入 x 通过跳跃连接直接加到子层输出 F(x)，再送入层归一化，形成梯度高速公路，让子层只需学习残差映射，从而支持 Transformer 堆叠数十乃至上百层。",
    color: "rose",
    features: [
      "跳跃路径使梯度畅通反传",
      "子层学习残差而非完整映射",
      "Add & Norm 是每个 Transformer 块的标配",
    ],
  },
  10010: {
    idea: "Query 来自 Decoder，Key/Value 来自 Encoder，通过 softmax(QKᵀ/√d_k)·V 计算 Decoder 每个位置对 Encoder 全局上下文的动态关注权重，是 Seq2Seq 任务的核心桥梁。",
    color: "amber",
    features: [
      "Q/K/V 跨序列来源",
      "动态关注 Encoder 上下文",
      "Seq2Seq 任务的核心",
    ],
  },
  10011: {
    idea: "每步将已生成序列送入模型，取最后位置 logits 经温度缩放 Softmax 得到概率分布，采样选出下一 token 并追加到序列，循环直到生成 <EOS> 或达到最大步数。",
    color: "purple",
    features: [
      "逐 token 自回归循环生成",
      "温度 T 控制分布尖锐度",
      "<EOS> 标记终止生成",
    ],
  },
  10012: {
    idea: "对模型 logits 经温度缩放后取全分布 Softmax，保留概率最高的 k 个 token 并重归一化，在这 k 个候选中按概率随机采样，兼顾生成质量与多样性。",
    color: "amber",
    features: [
      "截断低概率候选防止噪声输出",
      "重归一化保证 top-k 概率之和为 1",
      "k 值控制多样性与质量的权衡",
    ],
  },
  10015: {
    idea: "每步将 B 条活跃路径各自扩展全部 token，共产生 B×|V| 个候选，按累积 log 概率（含长度惩罚）选出最优 B 条保留，兼顾搜索质量与计算开销。",
    color: "blue",
    features: [
      "同时维护 B 条路径",
      "长度惩罚避免偏短",
      "B=1 退化为贪心搜索",
    ],
  },
  10014: {
    idea: "将 logits 除以温度参数 T 后做 Softmax：T<1 放大差异使分布更尖锐（确定），T>1 压缩差异使分布更平坦（随机），通过调节 T 控制生成的多样性与质量。",
    color: "purple",
    features: [
      "T<1 分布尖锐、生成确定",
      "T>1 分布平坦、生成多样",
      "熵 H 量化随机性变化",
    ],
  },
  10013: {
    idea: "从高概率 token 开始累加，选出累积概率恰好超过阈值 p 的最小 token 集合（核），在核内重归一化后采样，自适应分布集中度动态调整候选数量。",
    color: "amber",
    features: [
      "累积概率阈值自适应候选数",
      "分布集中时核小，分散时核大",
      "比 Top-k 更灵活，GPT-3 默认策略",
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
  10016: {
    idea: "Encoder 层将多头自注意力（捕获全局依赖）与前馈网络（逐位置非线性变换）串联，每个子层后用残差连接+LayerNorm 稳定训练，堆叠多层即可获得深层语义表示。",
    color: "blue",
    features: [
      "MHSA 并行捕获多类型依赖",
      "FFN 提供逐 token 非线性变换",
      "残差+LayerNorm 保障训练稳定",
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
