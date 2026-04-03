import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * LLM（大语言模型）经典架构相关题目数据
 */
export const llmProblems: AIProblem[] = [
  {
    id: 10002,
    slug: "scaled-dot-product-attention",
    title: "缩放点积注意力",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现并可视化 Transformer 核心的缩放点积注意力机制，展示 Query、Key、Value 矩阵的计算过程，包括点积、缩放、Softmax 和加权求和。核心公式为 $\\text{Attention}(Q,K,V) = \\text{softmax}\\!\\left(\\dfrac{QK^T}{\\sqrt{d_k}}\\right)V$。",
    learningGoals: [
      "理解注意力机制的核心公式：$\\text{Attention}(Q,K,V) = \\text{softmax}\\!\\left(\\dfrac{QK^T}{\\sqrt{d_k}}\\right)V$",
      "掌握缩放因子 $\\sqrt{d_k}$ 的作用（防止点积过大导致梯度消失）",
      "观察注意力权重如何决定每个位置对输出的贡献",
      "理解 Query、Key、Value 的语义含义",
    ],
    inputs: [
      "Q：Query 矩阵，形状为 $[\\text{seq\\_len},\\, d_k]$",
      "K：Key 矩阵，形状为 $[\\text{seq\\_len},\\, d_k]$",
      "V：Value 矩阵，形状为 $[\\text{seq\\_len},\\, d_v]$",
      "$d_k$：Key 的维度，用于缩放",
    ],
    outputs: [
      "scores：$QK^T$ 的点积结果",
      "scaled_scores：$QK^T / \\sqrt{d_k}$ 缩放后的分数",
      "attention_weights：$\\text{softmax}(\\cdot)$ 后的注意力权重",
      "output：加权求和 $\\text{softmax}(\\cdot)\\,V$ 后的输出向量",
    ],
    tags: ["Transformer", "Attention", "Self-Attention", "核心算法"],
    examples: [
      {
        input:
          "Q = [[1,2],[3,4]]，K = [[1,1],[2,2]]，V = [[0.5,1],[1.5,2]]，$d_k = 2$",
        output: "attention_weights ≈ [[0.73, 0.27], [0.27, 0.73]]",
        explanation:
          "第一个 token 更关注自己（权重 0.73），缩放因子 $\\sqrt{d_k}$ 防止了数值过大。",
      },
    ],
    heroNote: "这是 Transformer 架构的核心组件，所有现代 LLM 的基础。",
  },
  {
    id: 10003,
    slug: "multi-head-attention",
    title: "多头注意力机制",
    domain: AIDomain.LLM,
    difficulty: Difficulty.HARD,
    description:
      "实现多头注意力（Multi-Head Attention），将输入分成多个头分别计算注意力，再拼接并线性变换。公式为 $\\text{MultiHead}(Q,K,V) = \\text{Concat}(\\text{head}_1,\\ldots,\\text{head}_h)W^O$，其中 $\\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$。",
    learningGoals: [
      "理解多头注意力的设计动机（并行捕获不同类型的依赖关系）",
      "掌握多个注意力头的并行计算：$\\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$",
      "理解每头维度 $d_k = d_{\\text{model}} / h$（$h$ 为头数）",
      "观察拼接 $\\text{Concat}(\\text{head}_1,\\ldots,\\text{head}_h)$ 与线性变换 $W^O$ 的作用",
    ],
    inputs: [
      "Q：Query 矩阵，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "K：Key 矩阵，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "V：Value 矩阵，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "num_heads：注意力头数 $h$",
      "$d_{\\text{model}}$：模型总维度",
    ],
    outputs: [
      "head_outputs：每个头的输出，各形状 $[\\text{seq\\_len},\\, d_k]$",
      "concatenated：拼接后结果，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "final_output：线性变换 $W^O$ 后的最终输出",
    ],
    tags: ["Transformer", "Multi-Head Attention", "并行计算"],
    examples: [
      {
        input: "num_heads = 4，$d_{\\text{model}} = 512$",
        output: "每头维度 $d_k = 128$，4 个头并行计算后拼接",
        explanation:
          "多头允许模型同时关注不同类型的信息（语法、语义、位置等）。",
      },
    ],
    heroNote:
      "多头注意力是 Transformer 的关键创新，使模型能并行捕获多种关系。",
  },
  {
    id: 10004,
    slug: "self-attention-mechanism",
    title: "自注意力机制",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示自注意力机制：Query、Key、Value 均来自同一输入序列 X，通过三个权重矩阵 $W_Q, W_K, W_V$ 线性投影后计算缩放点积注意力，让每个位置都能关注序列中所有位置。",
    learningGoals: [
      "理解自注意力与普通注意力的区别：$Q = XW_Q,\\; K = XW_K,\\; V = XW_V$",
      "掌握如何从同一输入 $X$ 生成 Q、K、V（通过可学习矩阵投影）",
      "观察序列中每个位置如何关注其他所有位置（全局感受野）",
      "理解自注意力如何并行捕获序列内的长距离依赖",
    ],
    inputs: [
      "X：输入序列，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "$W_Q$：Query 权重矩阵，形状 $[d_{\\text{model}},\\, d_k]$",
      "$W_K$：Key 权重矩阵，形状 $[d_{\\text{model}},\\, d_k]$",
      "$W_V$：Value 权重矩阵，形状 $[d_{\\text{model}},\\, d_v]$",
    ],
    outputs: [
      "Q：Query 矩阵 $= XW_Q$",
      "K：Key 矩阵 $= XW_K$",
      "V：Value 矩阵 $= XW_V$",
      "attention_output：自注意力输出，形状 $[\\text{seq\\_len},\\, d_v]$",
    ],
    tags: ["Transformer", "Self-Attention", "Encoder"],
    examples: [
      {
        input: "X 形状 $[3, d_{\\text{model}}]$（3 个 token）",
        output: "每个 token 都会关注所有 token（包括自己），输出形状不变",
        explanation:
          "自注意力让每个位置直接访问序列中的所有位置，捕获长距离依赖。",
      },
    ],
    heroNote: "自注意力是 BERT 等模型的基础，能并行处理整个序列。",
  },
  {
    id: 10005,
    slug: "positional-encoding",
    title: "位置编码",
    domain: AIDomain.LLM,
    difficulty: Difficulty.EASY,
    description:
      "实现 Transformer 中的正弦位置编码，将位置信息注入 token 嵌入中。编码公式为偶数维 $\\text{PE}(pos, 2i) = \\sin\\!\\left(\\dfrac{pos}{10000^{2i/d}}\\right)$，奇数维 $\\text{PE}(pos, 2i+1) = \\cos\\!\\left(\\dfrac{pos}{10000^{2i/d}}\\right)$。",
    learningGoals: [
      "理解为什么需要位置编码（注意力机制本身是位置无关的）",
      "掌握正弦位置编码公式：$\\text{PE}(pos, 2i) = \\sin(pos / 10000^{2i/d})$",
      "观察不同频率的正弦波如何编码不同粒度的位置信息",
      "理解位置编码与 token 嵌入相加：$\\text{input} = \\text{Embed}(x) + \\text{PE}$",
    ],
    inputs: [
      "seq_len：序列长度",
      "$d_{\\text{model}}$：模型维度",
      "pos：位置索引 $\\in \\{0, 1, \\ldots, \\text{seq\\_len}-1\\}$",
      "i：维度索引 $\\in \\{0, 1, \\ldots, d_{\\text{model}}/2-1\\}$",
    ],
    outputs: [
      "pos_encoding：位置编码矩阵，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "encoded_input：token 嵌入 $+$ 位置编码",
    ],
    tags: ["Transformer", "Positional Encoding", "位置信息"],
    examples: [
      {
        input: "seq_len = 10，$d_{\\text{model}} = 512$",
        output: "形状 $[10, 512]$ 的位置编码矩阵",
        explanation:
          "偶数维使用 $\\sin$，奇数维使用 $\\cos$，不同频率覆盖多粒度位置信息。",
      },
    ],
    heroNote:
      "位置编码是 Transformer 理解序列顺序的关键，没有它模型无法区分词序。",
  },
  {
    id: 10006,
    slug: "causal-attention",
    title: "因果注意力（掩码注意力）",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 GPT 风格的因果注意力：使用下三角掩码矩阵 $M$（上三角置为 $-\\infty$）防止模型看到未来信息，计算公式为 $\\text{CausalAttn}(Q,K,V) = \\text{softmax}\\!\\left(\\dfrac{QK^T}{\\sqrt{d_k}} + M\\right)V$。",
    learningGoals: [
      "理解因果掩码的作用：将未来位置的注意力分数置为 $-\\infty$",
      "掌握下三角掩码矩阵 $M[i,j] = \\begin{cases}0 & j \\leq i \\\\ -\\infty & j > i\\end{cases}$",
      "观察掩码如何使 $\\text{softmax}(-\\infty)=0$，从而屏蔽未来位置",
      "理解自回归生成的工作原理：逐步预测下一个 token",
    ],
    inputs: [
      "Q：Query 矩阵，形状 $[\\text{seq\\_len},\\, d_k]$",
      "K：Key 矩阵，形状 $[\\text{seq\\_len},\\, d_k]$",
      "V：Value 矩阵，形状 $[\\text{seq\\_len},\\, d_v]$",
      "seq_len：序列长度",
    ],
    outputs: [
      "mask：下三角掩码矩阵 $M$，上三角为 $-\\infty$",
      "masked_scores：掩码后的注意力分数 $\\frac{QK^T}{\\sqrt{d_k}} + M$",
      "causal_attention_weights：$\\text{softmax}$ 后的因果注意力权重",
      "output：因果注意力输出",
    ],
    tags: ["GPT", "Causal Attention", "Mask", "自回归"],
    examples: [
      {
        input: "seq_len = 4",
        output: "位置 $i$ 只能看到位置 $0$ 到 $i$ 的信息",
        explanation:
          "第一个 token 只能看到自己，第二个可以看到前两个，以此类推。",
      },
    ],
    heroNote:
      "因果注意力是 GPT、LLaMA 等自回归模型的核心，确保生成时不会看到未来。",
  },
  {
    id: 10007,
    slug: "feed-forward-network",
    title: "前馈神经网络（FFN）",
    domain: AIDomain.LLM,
    difficulty: Difficulty.EASY,
    description:
      "实现 Transformer 中的前馈神经网络层，公式为 $\\text{FFN}(x) = \\text{ReLU}(xW_1 + b_1)W_2 + b_2$，通过「扩展-激活-压缩」结构为每个 token 提供逐位置的非线性变换。",
    learningGoals: [
      "理解 FFN 在 Transformer 中的作用（逐 token 的非线性变换）",
      "掌握计算过程：$\\text{FFN}(x) = \\text{ReLU}(xW_1 + b_1)W_2 + b_2$",
      "理解 $d_{ff} \\approx 4 \\times d_{\\text{model}}$ 的「扩展」设计",
      "观察 $\\text{ReLU}$ 激活函数引入的稀疏性（负值置零）",
    ],
    inputs: [
      "X：输入，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "$W_1$：第一层权重，形状 $[d_{\\text{model}},\\, d_{ff}]$",
      "$b_1$：第一层偏置，形状 $[d_{ff}]$",
      "$W_2$：第二层权重，形状 $[d_{ff},\\, d_{\\text{model}}]$",
      "$b_2$：第二层偏置，形状 $[d_{\\text{model}}]$",
    ],
    outputs: [
      "hidden：$\\text{ReLU}(XW_1 + b_1)$，形状 $[\\text{seq\\_len},\\, d_{ff}]$",
      "output：$\\text{hidden} \\cdot W_2 + b_2$，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
    ],
    tags: ["Transformer", "FFN", "Feed-Forward", "激活函数"],
    examples: [
      {
        input: "$d_{\\text{model}} = 512$，$d_{ff} = 2048$",
        output: "先扩展到 2048 维，再压缩回 512 维",
        explanation: "FFN 通过先扩展再压缩的方式，增加模型的非线性表达能力。",
      },
    ],
    heroNote: "FFN 是 Transformer 中参数最多的组件，通常占模型参数的一半以上。",
  },
  {
    id: 10008,
    slug: "layer-normalization",
    title: "层归一化",
    domain: AIDomain.LLM,
    difficulty: Difficulty.EASY,
    description:
      "实现 Layer Normalization：对每个样本的特征维度计算均值 $\\mu$ 和方差 $\\sigma^2$，归一化后用可学习参数 $\\gamma, \\beta$ 恢复表达能力。公式为 $\\text{LN}(x) = \\dfrac{x - \\mu}{\\sqrt{\\sigma^2 + \\varepsilon}} \\cdot \\gamma + \\beta$。",
    learningGoals: [
      "理解 Layer Norm 与 Batch Norm 的区别（LN 对特征维度归一化，不依赖 batch）",
      "掌握计算过程：$\\mu = \\frac{1}{d}\\sum x_i$，$\\sigma^2 = \\frac{1}{d}\\sum(x_i-\\mu)^2$",
      "理解 $\\text{LN}(x) = \\dfrac{x - \\mu}{\\sqrt{\\sigma^2 + \\varepsilon}} \\cdot \\gamma + \\beta$",
      "理解可学习参数 $\\gamma$（缩放）和 $\\beta$（偏移）的作用",
    ],
    inputs: [
      "X：输入，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "$\\varepsilon$：防止除零的小常数（如 $10^{-5}$）",
      "$\\gamma$：可学习缩放参数，形状 $[d_{\\text{model}}]$",
      "$\\beta$：可学习偏移参数，形状 $[d_{\\text{model}}]$",
    ],
    outputs: [
      "$\\mu$：每个 token 的均值，形状 $[\\text{seq\\_len}]$",
      "$\\sigma^2$：每个 token 的方差，形状 $[\\text{seq\\_len}]$",
      "normalized：$\\dfrac{x - \\mu}{\\sqrt{\\sigma^2 + \\varepsilon}}$",
      "output：$\\text{normalized} \\cdot \\gamma + \\beta$",
    ],
    tags: ["Transformer", "Layer Normalization", "归一化"],
    examples: [
      {
        input: "X = [[1,2,3],[4,5,6]]，$d_{\\text{model}} = 3$",
        output: "每行独立归一化，均值为 0，方差为 1",
        explanation:
          "Layer Norm 对每个 token 的特征维度归一化，不依赖 batch 大小。",
      },
    ],
    heroNote:
      "Layer Norm 是 Transformer 训练稳定的关键，放在注意力层和 FFN 之后。",
  },
  {
    id: 10009,
    slug: "residual-connection",
    title: "残差连接",
    domain: AIDomain.LLM,
    difficulty: Difficulty.EASY,
    description:
      "展示 Transformer 中的残差连接（Add & Norm）：将子层输入 $x$ 直接加到子层输出 $F(x)$ 上，再经层归一化，公式为 $\\text{output} = \\text{LayerNorm}(x + F(x))$，构成梯度高速公路。",
    learningGoals: [
      "理解残差连接的设计动机（解决深层网络梯度消失）",
      "掌握 Add & Norm：$\\text{output} = \\text{LayerNorm}(x + F(x))$",
      "理解子层只需学习残差映射 $F(x) = H(x) - x$，而非完整映射",
      "观察 Pre-LN 与 Post-LN 的区别",
    ],
    inputs: [
      "input $x$：子层输入向量，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "sublayer_output $F(x)$：注意力层或 FFN 的输出",
    ],
    outputs: [
      "residual_output：$\\text{LayerNorm}(x + F(x))$，形状同输入",
    ],
    tags: ["Transformer", "Residual Connection", "梯度流动"],
    examples: [
      {
        input: "$x = [1, 2, 3]$，$F(x) = [0.1, 0.2, 0.3]$",
        output: "$x + F(x) = [1.1, 2.2, 3.3]$，再经 LayerNorm",
        explanation:
          "残差连接允许信息直接传递，即使子层学习很少，梯度也能正常流动。",
      },
    ],
    heroNote:
      "残差连接是 Transformer 能堆叠多层的关键，来自 ResNet 的经典设计。",
  },
  {
    id: 10010,
    slug: "cross-attention",
    title: "交叉注意力",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 Encoder-Decoder 架构中的交叉注意力：$Q$ 来自 Decoder，$K/V$ 来自 Encoder 输出，计算 $\\text{CrossAttn}(Q_{dec}, K_{enc}, V_{enc}) = \\text{softmax}\\!\\left(\\dfrac{Q_{dec}K_{enc}^T}{\\sqrt{d_k}}\\right)V_{enc}$。",
    learningGoals: [
      "理解交叉注意力与自注意力的区别：Q/K/V 来自不同序列",
      "掌握 $Q$ 来自 Decoder，$K/V$ 来自 Encoder 的设计原理",
      "观察 $Q_{dec} K_{enc}^T$ 的注意力权重形状 $[L_{dec},\\, L_{enc}]$",
      "理解机器翻译等 Seq2Seq 任务中交叉注意力的作用",
    ],
    inputs: [
      "decoder_input：Decoder 输入（作为 Q），形状 $[L_{dec},\\, d_{\\text{model}}]$",
      "encoder_output：Encoder 输出（作为 K 和 V），形状 $[L_{enc},\\, d_{\\text{model}}]$",
    ],
    outputs: [
      "cross_attention_weights：形状 $[L_{dec},\\, L_{enc}]$，行和为 1",
      "cross_attention_output：形状 $[L_{dec},\\, d_{\\text{model}}]$",
    ],
    tags: ["Transformer", "Cross-Attention", "Encoder-Decoder"],
    examples: [
      {
        input: "Decoder 生成第 3 个 token，关注 Encoder 的所有 $L_{enc}$ 个输出",
        output: "Decoder 每个位置都能访问 Encoder 的完整上下文",
        explanation:
          "交叉注意力让 Decoder 在生成时能参考 Encoder 的完整上下文。",
      },
    ],
    heroNote: "交叉注意力是机器翻译、摘要等序列到序列任务的核心机制。",
  },
  {
    id: 10011,
    slug: "autoregressive-generation",
    title: "自回归生成过程",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示 GPT 等模型的自回归生成：每步将已生成序列 $x_{1:t}$ 送入模型，通过 $p(x_{t+1} \\mid x_{1:t})$ 采样下一 token，循环直到生成 $\\langle\\text{EOS}\\rangle$ 或达到最大步数。",
    learningGoals: [
      "理解自回归生成的链式分解：$p(x_{1:T}) = \\prod_{t=1}^{T} p(x_t \\mid x_{1:t-1})$",
      "掌握逐 token 生成的推理流程",
      "理解 KV 缓存如何将每步复杂度从 $O(t^2)$ 降至 $O(t)$",
      "观察生成过程中注意力的变化",
    ],
    inputs: [
      "prompt：初始提示文本 $x_{1:n}$",
      "max_length：最大生成步数",
      "temperature：采样温度 $T > 0$",
    ],
    outputs: [
      "generated_tokens：逐步生成的 token 序列",
      "attention_weights：每步的注意力权重矩阵",
      "probabilities：每步的 token 概率分布 $p(x_{t+1} \\mid x_{1:t})$",
    ],
    tags: ["GPT", "Generation", "自回归", "推理"],
    examples: [
      {
        input: "prompt = 'The cat'，max_length = 10",
        output: "逐步生成：'The cat sat on the mat'",
        explanation:
          "每生成一个 token，都基于之前所有 token 计算 $p(\\cdot \\mid x_{1:t})$。",
      },
    ],
    heroNote: "自回归生成是 ChatGPT、Claude 等模型生成文本的核心机制。",
  },
  {
    id: 10012,
    slug: "top-k-sampling",
    title: "Top-k 采样",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 Top-k 采样：对模型 logits 经温度缩放 $z_i / T$ 后取全分布 $\\text{softmax}$，仅保留概率最高的 $k$ 个 token 并重归一化，在这 $k$ 个候选中按概率采样。",
    learningGoals: [
      "理解 Top-k 采样的原理（截断低概率候选，提升生成质量）",
      "掌握温度缩放：$p_i \\propto \\exp(z_i / T)$",
      "理解重归一化：$\\tilde{p}_i = p_i / \\sum_{j \\in \\text{top-}k} p_j$",
      "观察 $k$ 值对生成多样性与质量的权衡",
    ],
    inputs: [
      "logits $z$：模型输出的原始分数，形状 $[|V|]$",
      "$k$：保留的 token 数量",
      "$T$：温度参数（可选，默认 1.0）",
    ],
    outputs: [
      "top_k_logits：top-$k$ 个 token 的分数",
      "probabilities：重归一化后的概率分布 $\\tilde{p}$",
      "sampled_token：按 $\\tilde{p}$ 采样得到的 token",
    ],
    tags: ["Sampling", "Generation", "Top-k", "推理策略"],
    examples: [
      {
        input: "$k = 5$，从概率最高的 5 个 token 中采样",
        output: "排除低概率 token，提高生成质量",
        explanation:
          "$k$ 越小越保守（更倾向于选高概率词），$k$ 越大越多样。",
      },
    ],
    heroNote: "Top-k 采样是 GPT-2 等模型使用的经典采样策略。",
  },
  {
    id: 10013,
    slug: "top-p-nucleus-sampling",
    title: "Top-p（Nucleus）采样",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 Top-p（核采样）：将 token 按概率从大到小排列，选出累积概率恰好超过阈值 $p$ 的最小 token 集合（「核」），在核内重归一化后采样，比 Top-k 能自适应分布集中度。",
    learningGoals: [
      "理解核采样的原理：动态选择包含累积概率 $\\geq p$ 的最小 token 集",
      "掌握累积概率计算：$\\sum_{i=1}^{k} p_{(i)} \\geq p$，取满足条件的最小 $k$",
      "理解 $p$ 值越大，候选集越大，生成越多样",
      "对比 Top-p 与 Top-k 的优劣（Top-p 能自适应分布集中度）",
    ],
    inputs: [
      "logits $z$：模型输出的原始分数",
      "$p$：累积概率阈值（通常 0.9~0.95）",
      "$T$：温度参数（可选）",
    ],
    outputs: [
      "sorted_tokens：按概率降序排列的 token",
      "cumulative_prob：累积概率 $\\sum_{i=1}^{k} p_{(i)}$",
      "nucleus_tokens：满足 $\\sum_{i=1}^{k} p_{(i)} \\geq p$ 的最小核集合",
      "sampled_token：在核内按重归一化概率采样的 token",
    ],
    tags: ["Sampling", "Nucleus", "Top-p", "推理策略"],
    examples: [
      {
        input: "$p = 0.9$，选累积概率达到 90% 的 token",
        output: "动态确定 token 数量，分布集中时核小，分散时核大",
        explanation:
          "Top-p 根据概率分布自适应调整候选数量，比固定 $k$ 值更灵活。",
      },
    ],
    heroNote:
      "Top-p 采样是 GPT-3、ChatGPT 等模型使用的采样策略，效果优于 Top-k。",
  },
  {
    id: 10014,
    slug: "temperature-sampling",
    title: "温度采样",
    domain: AIDomain.LLM,
    difficulty: Difficulty.EASY,
    description:
      "展示温度参数对采样分布的影响：将 logits 除以温度 $T$ 再取 $\\text{softmax}$，即 $p_i = \\dfrac{\\exp(z_i / T)}{\\sum_j \\exp(z_j / T)}$。$T < 1$ 使分布更尖锐，$T > 1$ 使分布更平坦。",
    learningGoals: [
      "理解温度缩放：$p_i \\propto \\exp(z_i / T)$，$T$ 控制分布平滑程度",
      "掌握 $T < 1$ 时概率分布更尖锐（确定）、$T > 1$ 时更平坦（随机）",
      "理解极端情况：$T \\to 0$ 退化为 $\\text{argmax}$，$T \\to \\infty$ 退化为均匀分布",
      "通过熵 $H = -\\sum_i p_i \\log p_i$ 量化分布随机性",
    ],
    inputs: [
      "logits $z$：模型输出的原始分数",
      "temperature $T > 0$：温度参数",
    ],
    outputs: [
      "scaled_logits：$z / T$",
      "probabilities：$\\text{softmax}(z / T)$ 调整后的概率分布",
      "entropy $H$：$-\\sum_i p_i \\log p_i$（量化随机性）",
    ],
    tags: ["Sampling", "Temperature", "生成控制"],
    examples: [
      {
        input: "$T = 0.1$（低温度）",
        output: "概率分布更尖锐，更倾向于高概率 token",
        explanation:
          "低温度使生成更确定、保守；高温度使生成更随机、有创造性。",
      },
      {
        input: "$T = 2.0$（高温度）",
        output: "概率分布更平坦，所有 token 概率接近",
        explanation: "高温度增加多样性，但可能降低生成质量。",
      },
    ],
    heroNote: "温度采样是控制 LLM 生成风格的重要参数，通常与 Top-p 结合使用。",
  },
  {
    id: 10015,
    slug: "beam-search",
    title: "束搜索（Beam Search）",
    domain: AIDomain.LLM,
    difficulty: Difficulty.HARD,
    description:
      "实现束搜索：每步将 $B$ 条活跃路径各自扩展全部词表，共产生 $B \\times |V|$ 个候选，按累积 $\\log$ 概率（含长度惩罚）选出最优 $B$ 条保留，比贪心搜索更不容易陷入局部最优。",
    learningGoals: [
      "理解束搜索的工作原理：同时维护 $B$ 条候选路径",
      "掌握累积分数：$\\text{score}(x_{1:t}) = \\sum_{i=1}^{t} \\log p(x_i \\mid x_{1:i-1})$",
      "理解长度惩罚：$\\text{score} / \\text{len}^\\alpha$ 避免偏好短序列",
      "对比束搜索（$B > 1$）与贪心搜索（$B = 1$）的区别",
    ],
    inputs: [
      "prompt：初始提示",
      "$B$（beam_width）：束宽，即保留的候选数量",
      "max_length：最大生成长度",
    ],
    outputs: [
      "beam_candidates：每个时间步的 $B$ 条候选序列",
      "scores：每条候选的累积 $\\log$ 概率",
      "final_sequences：最终 top-$B$ 序列",
    ],
    tags: ["Beam Search", "搜索算法", "生成策略"],
    examples: [
      {
        input: "$B = 3$，每步保留 3 条最优候选",
        output: "最终返回累积 $\\log$ 概率最高的序列",
        explanation:
          "束搜索避免贪心搜索的局部最优问题，但计算成本是贪心的 $B$ 倍。",
      },
    ],
    heroNote:
      "束搜索常用于机器翻译等任务，但在对话生成中较少使用（因为太慢）。",
  },
  {
    id: 10016,
    slug: "transformer-encoder-layer",
    title: "Transformer Encoder 层",
    domain: AIDomain.LLM,
    difficulty: Difficulty.HARD,
    description:
      "实现完整的 Transformer Encoder 层：多头自注意力 $\\to$ Add & Norm$_1$ $\\to$ FFN $\\to$ Add & Norm$_2$，即 $x' = \\text{LN}(x + \\text{MHSA}(x))$，$\\text{out} = \\text{LN}(x' + \\text{FFN}(x'))$。",
    learningGoals: [
      "理解 Encoder 层的完整结构（两个子层，每个后跟 Add & Norm）",
      "掌握 Post-LN：$x' = \\text{LN}(x + \\text{Sub}(x))$",
      "掌握 Pre-LN（现代常用）：$x' = x + \\text{Sub}(\\text{LN}(x))$",
      "观察信息在 Encoder 中的逐层流动",
    ],
    inputs: [
      "X：输入序列，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "注意力权重矩阵 $W_Q, W_K, W_V, W^O$",
      "FFN 权重矩阵 $W_1, W_2$",
    ],
    outputs: [
      "attention_output：多头自注意力输出",
      "ffn_output：FFN 输出",
      "encoder_output：Encoder 层最终输出，形状同输入",
    ],
    tags: ["Transformer", "Encoder", "完整架构"],
    examples: [
      {
        input: "6 层 Encoder 堆叠，$d_{\\text{model}} = 512$",
        output: "每层都包含 MHSA 和 FFN，逐步提取特征",
        explanation:
          "Encoder 层是 BERT 等双向模型的基础，能并行处理整个序列。",
      },
    ],
    heroNote: "理解 Encoder 层是理解 BERT、RoBERTa 等模型的关键。",
  },
  {
    id: 10017,
    slug: "transformer-decoder-layer",
    title: "Transformer Decoder 层",
    domain: AIDomain.LLM,
    difficulty: Difficulty.HARD,
    description:
      "实现完整的 Transformer Decoder 层（三个子层）：① 因果掩码自注意力（保证自回归） → ② 交叉注意力（$Q$ 来自 Decoder，$K/V$ 来自 Encoder） → ③ FFN，每层后均有 Add & Norm。",
    learningGoals: [
      "理解 Decoder 层的三子层结构",
      "掌握掩码自注意力：$\\text{MaskedAttn}(Q,K,V) = \\text{softmax}\\!\\left(\\dfrac{QK^T}{\\sqrt{d_k}} + M\\right)V$",
      "理解交叉注意力：$Q$ 来自 Decoder，$K/V$ 来自 Encoder",
      "对比 Encoder 与 Decoder 的结构差异",
    ],
    inputs: [
      "decoder_input：Decoder 输入，形状 $[L_{dec},\\, d_{\\text{model}}]$",
      "encoder_output：Encoder 输出（提供 $K/V$），形状 $[L_{enc},\\, d_{\\text{model}}]$",
      "mask $M$：因果掩码（上三角为 $-\\infty$）",
    ],
    outputs: [
      "masked_attention_output：掩码自注意力输出",
      "cross_attention_output：交叉注意力输出",
      "decoder_output：Decoder 层最终输出，形状 $[L_{dec},\\, d_{\\text{model}}]$",
    ],
    tags: ["Transformer", "Decoder", "完整架构"],
    examples: [
      {
        input: "6 层 Decoder 堆叠，$L_{dec} = 5$，$L_{enc} = 7$",
        output: "每层包含掩码自注意力、交叉注意力和 FFN",
        explanation:
          "Decoder 层是 GPT、T5 等生成模型的基础，能自回归生成序列。",
      },
    ],
    heroNote: "理解 Decoder 层是理解 GPT、LLaMA 等自回归模型的关键。",
  },
  {
    id: 10018,
    slug: "flash-attention",
    title: "Flash Attention",
    domain: AIDomain.LLM,
    difficulty: Difficulty.HARD,
    description:
      "实现 Flash Attention：通过将 $Q$、$K$、$V$ 分块加载到 SRAM 并使用在线 Softmax（Online Softmax）进行重归一化，避免存储完整的 $[N \\times N]$ 注意力矩阵，内存复杂度从 $O(N^2)$ 降至 $O(N)$。",
    learningGoals: [
      "理解 Flash Attention 的动机：标准注意力需要 $O(N^2)$ 内存存储中间矩阵",
      "掌握分块计算（Tiling）：$Q$、$K$、$V$ 分成块 $B$，逐块计算",
      "理解在线 Softmax：$m_{\\text{new}} = \\max(m_{\\text{prev}}, m_{\\text{block}})$ 增量更新最大值",
      "观察内存 $O(N^2) \\to O(N \\cdot B)$ 的节省",
    ],
    inputs: [
      "Q：Query 矩阵，形状 $[N,\\, d]$",
      "K：Key 矩阵，形状 $[N,\\, d]$",
      "V：Value 矩阵，形状 $[N,\\, d]$",
      "block_size $B$：分块大小",
    ],
    outputs: [
      "block_outputs：每个块的局部计算结果",
      "running_max $m$：在线 Softmax 的运行最大值",
      "running_sum $\\ell$：在线 Softmax 的运行分母",
      "final_output：$O = \\text{output\\_accum} / \\ell$",
    ],
    tags: ["Flash Attention", "内存优化", "高效计算", "长序列"],
    examples: [
      {
        input: "$N = 4096$，$d = 64$，$B = 128$",
        output: "内存从 $O(4096^2)$ 降低到 $O(4096 \\times 128)$",
        explanation:
          "Flash Attention 通过分块计算，避免存储完整注意力矩阵，大幅降低内存。",
      },
    ],
    heroNote: "Flash Attention 是处理长序列的关键技术，被 LLaMA、GPT-4 等模型广泛使用。",
  },
  {
    id: 10019,
    slug: "rotary-position-embedding",
    title: "旋转位置编码（RoPE）",
    domain: AIDomain.LLM,
    difficulty: Difficulty.HARD,
    description:
      "实现 RoPE：对 $Q$、$K$ 向量的每对维度 $(x_{2i}, x_{2i+1})$ 施加旋转矩阵 $R(m\\theta_i)$，旋转角度为 $m \\cdot \\theta_i$（$m$ 为位置，$\\theta_i = 1/10000^{2i/d}$），使点积 $q_m \\cdot k_n$ 只依赖相对位置 $(m-n)$。",
    learningGoals: [
      "理解 RoPE 的旋转原理：$\\theta_i = 1 / \\text{base}^{2i/d}$",
      "掌握旋转变换：$(x_{2i}', x_{2i+1}') = R(m\\theta_i)(x_{2i}, x_{2i+1})$",
      "理解相对位置性质：$\\langle R_m \\mathbf{q}, R_n \\mathbf{k} \\rangle = \\langle R_{m-n} \\mathbf{q}, \\mathbf{k} \\rangle$",
      "观察 RoPE 如何支持超出训练长度的外推（Extrapolation）",
    ],
    inputs: [
      "Q：Query 矩阵，形状 $[\\text{seq\\_len},\\, d]$",
      "K：Key 矩阵，形状 $[\\text{seq\\_len},\\, d]$",
      "positions：位置索引 $m \\in \\{0, 1, \\ldots, \\text{seq\\_len}-1\\}$",
      "base：旋转基底（默认 10000）",
    ],
    outputs: [
      "$\\theta_i = 1/\\text{base}^{2i/d}$：旋转频率，共 $d/2$ 个",
      "rotated_Q：施加旋转后的 Query",
      "rotated_K：施加旋转后的 Key",
      "attention_scores：$\\text{rotated\\_Q} \\cdot \\text{rotated\\_K}^T / \\sqrt{d}$",
    ],
    tags: ["RoPE", "位置编码", "相对位置", "外推"],
    examples: [
      {
        input: "训练序列长度 512，测试时扩展到 4096",
        output: "旋转公式对任意位置 $m$ 均成立，无需重新训练",
        explanation:
          "RoPE 的旋转特性使其能自然处理训练时未见过的序列长度。",
      },
    ],
    heroNote: "RoPE 是 LLaMA、PaLM 等模型使用的位置编码，支持更好的长度外推。",
  },
  {
    id: 10020,
    slug: "grouped-query-attention",
    title: "分组查询注意力（GQA）",
    domain: AIDomain.LLM,
    difficulty: Difficulty.HARD,
    description:
      "实现 GQA：将 $H_Q$ 个 Query 头分为 $G$ 组（$G = H_{KV}$），每组 $H_Q / G$ 个 Query 头共享一组 $K/V$ 头，KV 缓存从 $H_Q$ 组减少到 $G$ 组，实现 $(1 - G/H_Q)\\times 100\\%$ 的 KV 缓存节省。",
    learningGoals: [
      "理解 GQA 的动机：KV 缓存是 LLM 推理的主要内存瓶颈",
      "掌握 Q 头分组：$G = H_Q / G_{\\text{per}}$，每组共享一对 $K/V$",
      "理解 MHA（$H_Q = H_{KV}$）、GQA（$1 < H_{KV} < H_Q$）、MQA（$H_{KV} = 1$）三者关系",
      "KV 缓存节省比例：$(1 - H_{KV}/H_Q) \\times 100\\%$",
    ],
    inputs: [
      "Q：Query，形状 $[N,\\, H_Q,\\, d_h]$",
      "K：Key，形状 $[N,\\, H_{KV},\\, d_h]$",
      "V：Value，形状 $[N,\\, H_{KV},\\, d_h]$",
      "num_groups $G = H_{KV}$：KV 头数",
    ],
    outputs: [
      "grouped_Q：按组分配的 Query",
      "shared_KV：共享的 Key/Value 头",
      "gqa_output：拼接输出，形状 $[N,\\, H_Q \\cdot d_h]$",
    ],
    tags: ["GQA", "KV 缓存", "内存优化", "推理优化"],
    examples: [
      {
        input: "$H_Q = 32$，$H_{KV} = 8$",
        output: "KV 缓存减少 $1 - 8/32 = 75\\%$，性能损失 $< 5\\%$",
        explanation:
          "GQA 通过让 4 个 Q 头共享 1 组 KV，大幅减少推理内存占用。",
      },
    ],
    heroNote: "GQA 是 LLaMA-2、Mistral 等模型使用的注意力变体，显著降低推理成本。",
  },
  {
    id: 10021,
    slug: "swiglu-activation",
    title: "SwiGLU 激活函数",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 SwiGLU FFN：$\\text{SwiGLU}(x) = (\\text{Swish}(xW_{\\text{gate}}) \\odot xW_{\\text{up}})W_{\\text{down}}$，其中 $\\text{Swish}(x) = x \\cdot \\sigma(x) = x/(1+e^{-x})$，门控机制动态调节信息流。",
    learningGoals: [
      "理解 SwiGLU 公式：$\\text{SwiGLU}(x) = \\text{Swish}(xW_g) \\odot (xW_u)$，再乘 $W_d$",
      "掌握 Swish 激活：$\\text{Swish}(x) = x \\cdot \\sigma(x) = x/(1+e^{-x})$",
      "理解门控机制：$\\text{Swish}(\\cdot)$ 接近 0 时抑制该维度信息",
      "理解参数量与标准 FFN 相当：LLaMA 中 $d_{ff} = 8/3 \\times d_{\\text{model}}$",
    ],
    inputs: [
      "x：输入，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "$W_{\\text{gate}}$：门控投影权重，形状 $[d_{\\text{model}},\\, d_{ff}]$",
      "$W_{\\text{up}}$：值投影权重，形状 $[d_{\\text{model}},\\, d_{ff}]$",
      "$W_{\\text{down}}$：输出投影权重，形状 $[d_{ff},\\, d_{\\text{model}}]$",
    ],
    outputs: [
      "gate：$xW_{\\text{gate}}$，形状 $[\\text{seq\\_len},\\, d_{ff}]$",
      "gate_swish：$\\text{Swish}(xW_{\\text{gate}})$",
      "gated_product：$\\text{Swish}(xW_{\\text{gate}}) \\odot (xW_{\\text{up}})$",
      "output：$\\text{gated\\_product} \\cdot W_{\\text{down}}$，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
    ],
    tags: ["SwiGLU", "激活函数", "GLU", "FFN"],
    examples: [
      {
        input: "$d_{\\text{model}} = 512$，$d_{ff} = 1365$（约 $8/3 \\times 512$）",
        output: "3 个权重矩阵，总参数量与标准 FFN（$d_{ff} = 2048$）相当",
        explanation:
          "SwiGLU 门控机制让模型学习哪些维度的信息应当传递，提升表达能力。",
      },
    ],
    heroNote: "SwiGLU 是 PaLM、LLaMA 等模型在 FFN 中使用的激活函数，性能优于 GELU。",
  },
  {
    id: 10022,
    slug: "rms-normalization",
    title: "RMS 归一化（RMSNorm）",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 RMSNorm：省去 LayerNorm 中的均值计算，仅用均方根归一化，公式为 $\\text{RMSNorm}(x) = \\dfrac{x}{\\text{RMS}(x)} \\odot \\gamma$，其中 $\\text{RMS}(x) = \\sqrt{\\dfrac{1}{d}\\sum_i x_i^2 + \\varepsilon}$。",
    learningGoals: [
      "理解 RMSNorm 与 LayerNorm 的区别：省略了均值项 $\\mu$ 的计算",
      "掌握公式：$\\text{RMS}(x) = \\sqrt{\\frac{1}{d}\\sum_i x_i^2 + \\varepsilon}$",
      "理解归一化：$\\hat{x}_i = x_i / \\text{RMS}(x)$，再乘可学习参数 $\\gamma$",
      "计算量比 LayerNorm 减少约 20%（省去 $\\mu$ 和 $\\beta$ 的计算）",
    ],
    inputs: [
      "X：输入，形状 $[\\text{seq\\_len},\\, d_{\\text{model}}]$",
      "$\\varepsilon$：防止除零的小常数",
      "$\\gamma$：可学习缩放参数，形状 $[d_{\\text{model}}]$",
    ],
    outputs: [
      "$\\text{RMS}(x) = \\sqrt{\\frac{1}{d}\\sum_i x_i^2 + \\varepsilon}$：每 token 的 RMS 标量",
      "$\\hat{x} = x / \\text{RMS}(x)$：归一化后的向量",
      "output $= \\gamma \\odot \\hat{x}$：缩放后的最终输出",
    ],
    tags: ["RMSNorm", "归一化", "Layer Norm", "优化"],
    examples: [
      {
        input: "X 形状 $[3, 6]$，$\\varepsilon = 10^{-5}$，$\\gamma = \\mathbf{1}$",
        output: "每行 RMS $\\approx 1$，计算量比 LayerNorm 减少约 20%",
        explanation:
          "RMSNorm 省略了均值计算，在保持性能的同时提升了计算效率。",
      },
    ],
    heroNote: "RMSNorm 是 LLaMA、GPT-NeoX 等模型使用的归一化方法，计算更高效。",
  },
  {
    id: 10023,
    slug: "kv-cache-optimization",
    title: "KV 缓存优化",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示 KV 缓存在自回归生成中的优化：Prefill 阶段一次性计算并缓存所有 Prompt 的 $K/V$；Generate 阶段每步只计算新 token 的 $K/V$ 追加到缓存，单步注意力从 $O(t^2 d)$ 降至 $O(t \\cdot d)$。",
    learningGoals: [
      "理解 KV 缓存的原理：缓存 $K_{1:t}, V_{1:t}$，避免每步重新计算",
      "掌握生成第 $t$ 步的计算：$\\text{Attn}(q_t, K_{1:t}, V_{1:t})$",
      "计算节省：每步从 $O(t^2 d)$ 降至 $O(td)$，加速约 $t$ 倍",
      "了解内存代价：缓存大小 = $2 \\times \\text{layers} \\times H \\times t \\times d_h$（字节）",
    ],
    inputs: [
      "new_token：新生成的 token（提供查询 $q_t$）",
      "kv_cache：之前时间步缓存的 $K_{1:t-1}$、$V_{1:t-1}$",
    ],
    outputs: [
      "new_kv：新 token 的 $k_t,\\, v_t$",
      "updated_cache：$K_{1:t} = [K_{1:t-1}; k_t]$，$V_{1:t} = [V_{1:t-1}; v_t]$",
      "attention_output：$\\text{softmax}\\!\\left(\\dfrac{q_t K_{1:t}^T}{\\sqrt{d_k}}\\right) V_{1:t}$",
    ],
    tags: ["KV Cache", "推理优化", "缓存", "生成加速"],
    examples: [
      {
        input: "生成第 100 个 token",
        output: "只需计算新 $k_{100}, v_{100}$，复用前 99 个 token 的缓存",
        explanation:
          "KV 缓存将生成复杂度从 $O(N^2)$ 降低到 $O(N)$，大幅提升推理速度。",
      },
    ],
    heroNote: "KV 缓存是 LLM 推理加速的关键技术，几乎所有现代模型都使用它。",
  },
  {
    id: 10024,
    slug: "sliding-window-attention",
    title: "滑动窗口注意力",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现滑动窗口注意力：每个位置 $i$ 只关注 $|i-j| \\leq w/2$ 范围内的位置，窗口外设置 $-\\infty$ 掩码，将单层复杂度从 $O(N^2)$ 降至 $O(N \\cdot w)$，多层堆叠后感受野扩展。",
    learningGoals: [
      "理解窗口掩码：$M[i,j] = 0$（若 $|i-j| \\leq w/2$），否则 $-\\infty$",
      "单层复杂度：$O(N^2 d) \\to O(N \\cdot w \\cdot d)$，节省 $(1 - w/N) \\times 100\\%$",
      "感受野扩展：$L$ 层后感受野 $= L \\times w$，$\\lceil N/w \\rceil$ 层可覆盖全局",
      "对比全局注意力：准确性稍低，但适合超长序列",
    ],
    inputs: [
      "Q：形状 $[N,\\, d_h]$",
      "K：形状 $[N,\\, d_h]$",
      "V：形状 $[N,\\, d_h]$",
      "$w$（window_size）：窗口大小",
    ],
    outputs: [
      "window_mask $M$：带状掩码矩阵，非零带宽 $= w$",
      "windowed_attention：窗口注意力输出",
      "complexity：$O(N \\cdot w)$ vs $O(N^2)$",
    ],
    tags: ["滑动窗口", "稀疏注意力", "长序列", "计算优化"],
    examples: [
      {
        input: "$w = 128$，序列长度 $N = 4096$",
        output: "复杂度从 $O(4096^2)$ 降至 $O(4096 \\times 128)$，节省 97%",
        explanation:
          "每个位置只关注前后 64 个位置，32 层后感受野覆盖整个序列。",
      },
    ],
    heroNote: "滑动窗口注意力是 Longformer、Mistral 等模型处理长序列的关键技术。",
  },
  {
    id: 10025,
    slug: "alibi-position-bias",
    title: "ALiBi 位置偏置",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 ALiBi：在注意力分数中添加线性位置偏置 $\\text{bias}_h[i,j] = m_h \\cdot (-|i-j|)$，其中斜率 $m_h = 2^{-8h/H}$ 因头而异，无需位置嵌入即可编码相对位置，并天然支持长度外推。",
    learningGoals: [
      "理解 ALiBi 偏置：$\\text{bias}_h[i,j] = m_h \\cdot (-|i-j|)$，距离越远惩罚越大",
      "掌握斜率计算：$m_h = 2^{-8h/H}$，不同头有不同的位置感知范围",
      "ALiBi 注意力：$\\text{softmax}\\!\\left(\\dfrac{QK^T}{\\sqrt{d_k}} + \\text{bias}_h\\right)V$",
      "理解无需位置嵌入的外推能力：偏置公式对任意位置 $i,j$ 成立",
    ],
    inputs: [
      "attention_scores：$QK^T / \\sqrt{d_k}$，形状 $[\\text{seq\\_len},\\, \\text{seq\\_len}]$",
      "positions：位置索引 $\\{0, 1, \\ldots, N-1\\}$",
      "slopes：斜率序列 $m_1, m_2, \\ldots, m_H$（每个头一个）",
    ],
    outputs: [
      "position_bias $\\text{bias}_h$：$m_h \\cdot (-|i-j|)$，形状 $[N,\\, N]$",
      "biased_scores：$\\text{scores} + \\text{bias}_h$",
      "alibi_attention：$\\text{softmax}(\\text{biased\\_scores}) \\cdot V$",
    ],
    tags: ["ALiBi", "位置偏置", "外推", "无位置编码"],
    examples: [
      {
        input: "训练长度 $N = 1024$，测试长度 $N' = 2048$",
        output: "$\\text{bias}_h[i,j] = m_h \\cdot (-|i-j|)$ 对任意 $N'$ 均成立",
        explanation:
          "ALiBi 的线性偏置设计使其能自然处理训练时未见过的序列长度。",
      },
    ],
    heroNote: "ALiBi 是 BLOOM 模型使用的位置编码方法，支持出色的长度外推能力。",
  },
];
