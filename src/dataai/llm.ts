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
      "实现并可视化 Transformer 核心的缩放点积注意力机制。展示 Query、Key、Value 矩阵的计算过程，包括点积、缩放、Softmax 和加权求和。",
    learningGoals: [
      "理解注意力机制的核心公式：Attention(Q,K,V) = softmax(QK^T/√d_k)V",
      "掌握缩放因子 √d_k 的作用（防止点积过大导致梯度消失）",
      "观察注意力权重如何决定每个位置对输出的贡献",
      "理解 Query、Key、Value 的语义含义",
    ],
    inputs: [
      "Q：Query 矩阵，形状为 [seq_len, d_k]",
      "K：Key 矩阵，形状为 [seq_len, d_k]",
      "V：Value 矩阵，形状为 [seq_len, d_v]",
      "d_k：Key 的维度，用于缩放",
    ],
    outputs: [
      "scores：QK^T 的点积结果",
      "scaled_scores：缩放后的分数",
      "attention_weights：Softmax 后的注意力权重",
      "output：加权求和后的输出向量",
    ],
    tags: ["Transformer", "Attention", "Self-Attention", "核心算法"],
    examples: [
      {
        input:
          "Q = [[1,2],[3,4]], K = [[1,1],[2,2]], V = [[0.5,1],[1.5,2]], d_k = 2",
        output: "attention_weights ≈ [[0.73,0.27],[0.27,0.73]]",
        explanation:
          "第一个 token 更关注自己（权重 0.73），第二个 token 也更关注自己。缩放因子防止了数值过大。",
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
      "实现多头注意力（Multi-Head Attention），展示如何将输入分成多个头，每个头独立计算注意力，最后拼接并线性变换。",
    learningGoals: [
      "理解多头注意力的设计动机（捕获不同类型的依赖关系）",
      "掌握多个注意力头的并行计算过程",
      "理解头拼接和线性变换的作用",
      "观察不同头关注的不同模式",
    ],
    inputs: [
      "Q：Query 矩阵",
      "K：Key 矩阵",
      "V：Value 矩阵",
      "num_heads：注意力头的数量",
      "d_model：模型维度",
    ],
    outputs: [
      "head_outputs：每个头的输出",
      "concatenated：拼接后的结果",
      "final_output：线性变换后的最终输出",
    ],
    tags: ["Transformer", "Multi-Head Attention", "并行计算"],
    examples: [
      {
        input: "num_heads = 4, d_model = 512",
        output: "每个头维度为 128，4 个头并行计算后拼接",
        explanation:
          "多头允许模型同时关注不同类型的信息（语法、语义、位置等）。",
      },
    ],
    heroNote:
      "多头注意力是 Transformer 的关键创新，使模型能够并行捕获多种关系。",
  },
  {
    id: 10004,
    slug: "self-attention-mechanism",
    title: "自注意力机制",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示自注意力机制，其中 Query、Key、Value 都来自同一个输入序列。这是 Transformer Encoder 的核心。",
    learningGoals: [
      "理解自注意力与普通注意力的区别",
      "掌握如何从同一输入生成 Q、K、V",
      "观察序列中每个位置如何关注其他位置",
      "理解自注意力如何捕获序列内的依赖关系",
    ],
    inputs: [
      "X：输入序列，形状为 [seq_len, d_model]",
      "W_q：Query 权重矩阵",
      "W_k：Key 权重矩阵",
      "W_v：Value 权重矩阵",
    ],
    outputs: [
      "Q：Query 矩阵",
      "K：Key 矩阵",
      "V：Value 矩阵",
      "attention_output：自注意力输出",
    ],
    tags: ["Transformer", "Self-Attention", "Encoder"],
    examples: [
      {
        input: "X = [[1,2,3],[4,5,6],[7,8,9]], 3个token的序列",
        output: "每个token都会关注所有token（包括自己）",
        explanation:
          "自注意力让每个位置都能直接访问序列中的所有位置，捕获长距离依赖。",
      },
    ],
    heroNote: "自注意力是 BERT 等模型的基础，能够并行处理整个序列。",
  },
  {
    id: 10005,
    slug: "positional-encoding",
    title: "位置编码",
    domain: AIDomain.LLM,
    difficulty: Difficulty.EASY,
    description:
      "实现 Transformer 中的正弦位置编码，展示如何将位置信息注入到 token 嵌入中，使模型理解序列的顺序。",
    learningGoals: [
      "理解为什么需要位置编码（注意力机制本身是位置无关的）",
      "掌握正弦位置编码的数学公式",
      "观察不同频率的正弦波如何编码不同位置",
      "理解位置编码如何与 token 嵌入相加",
    ],
    inputs: [
      "seq_len：序列长度",
      "d_model：模型维度",
      "pos：位置索引",
      "i：维度索引",
    ],
    outputs: [
      "pos_encoding：位置编码矩阵，形状为 [seq_len, d_model]",
      "encoded_input：token 嵌入 + 位置编码",
    ],
    tags: ["Transformer", "Positional Encoding", "位置信息"],
    examples: [
      {
        input: "seq_len = 10, d_model = 512",
        output: "10x512 的位置编码矩阵",
        explanation:
          "偶数维度使用 sin，奇数维度使用 cos，不同频率编码不同位置信息。",
      },
    ],
    heroNote:
      "位置编码是 Transformer 理解序列顺序的关键，没有它模型无法区分顺序。",
  },
  {
    id: 10006,
    slug: "causal-attention",
    title: "因果注意力（掩码注意力）",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 GPT 风格的因果注意力，使用下三角掩码防止模型看到未来的信息，确保生成过程的自回归特性。",
    learningGoals: [
      "理解因果掩码的作用（防止信息泄露）",
      "掌握下三角掩码矩阵的构造",
      "观察掩码如何影响注意力权重",
      "理解自回归生成的工作原理",
    ],
    inputs: [
      "Q：Query 矩阵",
      "K：Key 矩阵",
      "V：Value 矩阵",
      "seq_len：序列长度",
    ],
    outputs: [
      "mask：下三角掩码矩阵",
      "masked_scores：掩码后的注意力分数",
      "causal_attention_weights：因果注意力权重",
      "output：因果注意力输出",
    ],
    tags: ["GPT", "Causal Attention", "Mask", "自回归"],
    examples: [
      {
        input: "seq_len = 4",
        output: "位置 i 只能看到位置 0 到 i 的信息",
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
      "实现 Transformer 中的前馈神经网络层，展示两层线性变换和激活函数的作用。",
    learningGoals: [
      "理解 FFN 在 Transformer 中的作用",
      "掌握两层线性变换的计算过程",
      "理解激活函数（ReLU/GELU）的作用",
      "观察 FFN 如何扩展模型容量",
    ],
    inputs: [
      "X：输入向量，形状为 [seq_len, d_model]",
      "W1：第一层权重矩阵，形状为 [d_model, d_ff]",
      "b1：第一层偏置",
      "W2：第二层权重矩阵，形状为 [d_ff, d_model]",
      "b2：第二层偏置",
    ],
    outputs: [
      "hidden：第一层输出（经过激活函数）",
      "output：第二层输出（最终 FFN 输出）",
    ],
    tags: ["Transformer", "FFN", "Feed-Forward", "激活函数"],
    examples: [
      {
        input: "d_model = 512, d_ff = 2048",
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
      "实现 Layer Normalization，展示如何对每个样本的特征维度进行归一化，稳定训练过程。",
    learningGoals: [
      "理解 Layer Norm 与 Batch Norm 的区别",
      "掌握归一化的计算过程（均值、方差、标准化）",
      "理解可学习的缩放和偏移参数",
      "观察归一化如何稳定梯度",
    ],
    inputs: [
      "X：输入向量，形状为 [seq_len, d_model]",
      "eps：防止除零的小常数",
      "gamma：可学习的缩放参数",
      "beta：可学习的偏移参数",
    ],
    outputs: [
      "mean：每个样本的均值",
      "variance：每个样本的方差",
      "normalized：归一化后的结果",
      "output：缩放和偏移后的最终输出",
    ],
    tags: ["Transformer", "Layer Normalization", "归一化"],
    examples: [
      {
        input: "X = [[1,2,3],[4,5,6]], d_model = 3",
        output: "每行独立归一化，均值为 0，方差为 1",
        explanation:
          "Layer Norm 对每个样本的特征维度归一化，不依赖 batch 大小。",
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
      "展示 Transformer 中的残差连接，理解如何通过跳跃连接解决深度网络的梯度消失问题。",
    learningGoals: [
      "理解残差连接的设计动机",
      "掌握残差连接的计算：output = input + sublayer(input)",
      "理解残差连接如何帮助梯度流动",
      "观察残差连接对训练的影响",
    ],
    inputs: ["input：输入向量", "sublayer_output：子层（注意力或FFN）的输出"],
    outputs: ["residual_output：残差连接的输出（input + sublayer_output）"],
    tags: ["Transformer", "Residual Connection", "梯度流动"],
    examples: [
      {
        input: "input = [1,2,3], sublayer_output = [0.1,0.2,0.3]",
        output: "residual_output = [1.1,2.2,3.3]",
        explanation:
          "残差连接允许信息直接传递，即使子层学习很少，梯度也能正常流动。",
      },
    ],
    heroNote:
      "残差连接是 Transformer 能够堆叠多层的关键，来自 ResNet 的经典设计。",
  },
  {
    id: 10010,
    slug: "cross-attention",
    title: "交叉注意力",
    domain: AIDomain.LLM,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 Encoder-Decoder 架构中的交叉注意力，展示 Decoder 如何关注 Encoder 的输出。",
    learningGoals: [
      "理解交叉注意力与自注意力的区别",
      "掌握 Query 来自 Decoder，Key/Value 来自 Encoder 的设计",
      "观察 Decoder 如何利用 Encoder 的信息",
      "理解机器翻译等任务中的注意力机制",
    ],
    inputs: [
      "decoder_input：Decoder 的输入（作为 Query）",
      "encoder_output：Encoder 的输出（作为 Key 和 Value）",
    ],
    outputs: [
      "cross_attention_weights：交叉注意力权重",
      "cross_attention_output：交叉注意力输出",
    ],
    tags: ["Transformer", "Cross-Attention", "Encoder-Decoder"],
    examples: [
      {
        input: "decoder 生成第 3 个 token 时，关注 encoder 的所有输出",
        output: "decoder 的每个位置都能访问 encoder 的所有信息",
        explanation:
          "交叉注意力让 Decoder 在生成时能够参考 Encoder 的完整上下文。",
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
      "展示 GPT 等模型的自回归生成过程，逐步生成每个 token，每一步都使用之前生成的所有 token。",
    learningGoals: [
      "理解自回归生成的工作原理",
      "掌握逐步生成的过程",
      "理解 KV 缓存的优化",
      "观察生成过程中注意力的变化",
    ],
    inputs: [
      "prompt：初始提示文本",
      "max_length：最大生成长度",
      "model：语言模型",
    ],
    outputs: [
      "generated_tokens：逐步生成的 token 序列",
      "attention_weights：每步的注意力权重",
      "probabilities：每步的 token 概率分布",
    ],
    tags: ["GPT", "Generation", "自回归", "推理"],
    examples: [
      {
        input: "prompt = 'The cat', max_length = 10",
        output: "逐步生成：'The cat sat on the mat'",
        explanation:
          "每生成一个 token，都会基于之前所有 token 计算下一个 token 的概率。",
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
      "实现 Top-k 采样策略，只从概率最高的 k 个 token 中采样，平衡生成质量和多样性。",
    learningGoals: [
      "理解 Top-k 采样的原理",
      "掌握如何选择 top-k 个 token",
      "理解 k 值对生成的影响",
      "观察不同 k 值下的生成多样性",
    ],
    inputs: [
      "logits：模型输出的原始分数",
      "k：采样的 token 数量",
      "temperature：温度参数（可选）",
    ],
    outputs: [
      "top_k_logits：top-k 个 token 的分数",
      "probabilities：归一化后的概率分布",
      "sampled_token：采样得到的 token",
    ],
    tags: ["Sampling", "Generation", "Top-k", "推理策略"],
    examples: [
      {
        input: "k = 5, 从概率最高的 5 个 token 中采样",
        output: "排除低概率 token，提高生成质量",
        explanation:
          "k 值越小越保守（更可能生成常见词），k 值越大越多样（可能生成罕见词）。",
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
      "实现 Top-p（核采样）策略，动态选择累积概率达到 p 的最小 token 集合，比 Top-k 更灵活。",
    learningGoals: [
      "理解 Top-p 采样的原理（动态选择 token 数量）",
      "掌握累积概率的计算",
      "理解 p 值对生成的影响",
      "对比 Top-p 与 Top-k 的优劣",
    ],
    inputs: [
      "logits：模型输出的原始分数",
      "p：累积概率阈值（通常 0.9-0.95）",
      "temperature：温度参数（可选）",
    ],
    outputs: [
      "sorted_tokens：按概率排序的 token",
      "cumulative_prob：累积概率",
      "nucleus_tokens：核采样集合",
      "sampled_token：采样得到的 token",
    ],
    tags: ["Sampling", "Nucleus", "Top-p", "推理策略"],
    examples: [
      {
        input: "p = 0.9, 选择累积概率达到 90% 的 token",
        output: "动态确定 token 数量，可能包含 5 个或 50 个 token",
        explanation:
          "Top-p 根据概率分布自适应选择 token 数量，比固定 k 值更灵活。",
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
      "展示温度参数对采样分布的影响，理解如何通过温度控制生成的随机性和创造性。",
    learningGoals: [
      "理解温度参数的作用机制",
      "掌握温度缩放公式：logits / temperature",
      "理解不同温度值对概率分布的影响",
      "观察温度如何控制生成的随机性",
    ],
    inputs: ["logits：模型输出的原始分数", "temperature：温度参数（> 0）"],
    outputs: [
      "scaled_logits：缩放后的分数",
      "probabilities：温度调整后的概率分布",
      "entropy：分布的熵（衡量随机性）",
    ],
    tags: ["Sampling", "Temperature", "生成控制"],
    examples: [
      {
        input: "temperature = 0.1（低温度）",
        output: "概率分布更尖锐，更倾向于高概率 token",
        explanation:
          "低温度使生成更确定、更保守；高温度使生成更随机、更有创造性。",
      },
      {
        input: "temperature = 2.0（高温度）",
        output: "概率分布更平滑，所有 token 概率更接近",
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
      "实现束搜索算法，维护多个候选序列，在生成过程中保留最优的 k 条路径，用于提高生成质量。",
    learningGoals: [
      "理解束搜索的工作原理",
      "掌握如何维护多个候选序列",
      "理解束宽（beam width）对结果的影响",
      "对比束搜索与贪心搜索的区别",
    ],
    inputs: [
      "prompt：初始提示",
      "beam_width：束宽（保留的候选数量）",
      "max_length：最大长度",
      "model：语言模型",
    ],
    outputs: [
      "beam_candidates：每个时间步的候选序列",
      "scores：每个候选的累积分数",
      "final_sequences：最终生成的 top-k 序列",
    ],
    tags: ["Beam Search", "搜索算法", "生成策略"],
    examples: [
      {
        input: "beam_width = 3, 每步保留 3 个最优候选",
        output: "最终返回累积分数最高的序列",
        explanation:
          "束搜索通过维护多个候选，避免贪心搜索的局部最优问题，但计算成本更高。",
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
      "实现完整的 Transformer Encoder 层，包括多头自注意力、残差连接、层归一化和前馈网络。",
    learningGoals: [
      "理解 Encoder 层的完整结构",
      "掌握各个组件的连接顺序",
      "理解残差连接和层归一化的位置",
      "观察信息在 Encoder 中的流动",
    ],
    inputs: [
      "X：输入序列",
      "attention_weights：注意力权重矩阵",
      "ffn_weights：FFN 权重矩阵",
    ],
    outputs: [
      "attention_output：注意力层输出",
      "ffn_output：FFN 层输出",
      "encoder_output：Encoder 层最终输出",
    ],
    tags: ["Transformer", "Encoder", "完整架构"],
    examples: [
      {
        input: "6 层 Encoder 堆叠",
        output: "每层都包含自注意力和 FFN，逐步提取特征",
        explanation:
          "Encoder 层是 BERT 等双向模型的基础，能够并行处理整个序列。",
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
      "实现完整的 Transformer Decoder 层，包括掩码自注意力、交叉注意力和前馈网络。",
    learningGoals: [
      "理解 Decoder 层的完整结构",
      "掌握掩码自注意力的作用",
      "理解交叉注意力如何连接 Encoder 和 Decoder",
      "观察 Decoder 如何逐步生成序列",
    ],
    inputs: [
      "decoder_input：Decoder 输入",
      "encoder_output：Encoder 输出",
      "mask：因果掩码",
    ],
    outputs: [
      "masked_attention_output：掩码自注意力输出",
      "cross_attention_output：交叉注意力输出",
      "decoder_output：Decoder 层最终输出",
    ],
    tags: ["Transformer", "Decoder", "完整架构"],
    examples: [
      {
        input: "6 层 Decoder 堆叠",
        output: "每层包含掩码自注意力、交叉注意力和 FFN",
        explanation:
          "Decoder 层是 GPT、T5 等生成模型的基础，能够自回归生成序列。",
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
      "实现 Flash Attention 算法，通过分块计算和在线 Softmax 优化，将注意力计算的内存复杂度从 O(N²) 降低到 O(N)，大幅提升长序列处理能力。",
    learningGoals: [
      "理解 Flash Attention 的设计动机（内存优化）",
      "掌握分块计算（Tiling）的原理",
      "理解在线 Softmax 和在线 Softmax 重归一化",
      "观察内存使用和计算效率的权衡",
    ],
    inputs: [
      "Q：Query 矩阵，形状为 [N, d]",
      "K：Key 矩阵，形状为 [N, d]",
      "V：Value 矩阵，形状为 [N, d]",
      "block_size：分块大小",
    ],
    outputs: [
      "block_outputs：每个块的计算结果",
      "online_softmax：在线 Softmax 值",
      "final_output：Flash Attention 输出",
      "memory_usage：内存使用量对比",
    ],
    tags: ["Flash Attention", "内存优化", "高效计算", "长序列"],
    examples: [
      {
        input: "N = 4096, d = 64, block_size = 128",
        output: "内存从 O(4096²) 降低到 O(4096×128)",
        explanation:
          "Flash Attention 通过分块计算，避免存储完整的注意力矩阵，大幅降低内存占用。",
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
      "实现 Rotary Position Embedding（RoPE），通过复数旋转将相对位置信息编码到注意力计算中，相比绝对位置编码更灵活。",
    learningGoals: [
      "理解 RoPE 的设计原理（复数旋转）",
      "掌握相对位置编码的优势",
      "理解如何将位置信息融入 Q、K 向量",
      "观察 RoPE 如何支持外推（extrapolation）",
    ],
    inputs: [
      "Q：Query 矩阵",
      "K：Key 矩阵",
      "positions：位置索引",
      "d_model：模型维度",
    ],
    outputs: [
      "rotated_Q：旋转后的 Query 矩阵",
      "rotated_K：旋转后的 Key 矩阵",
      "attention_scores：包含相对位置信息的注意力分数",
    ],
    tags: ["RoPE", "位置编码", "相对位置", "外推"],
    examples: [
      {
        input: "序列长度 512，训练时最大长度 2048",
        output: "可以外推到 4096 甚至更长",
        explanation:
          "RoPE 的旋转特性使其能够自然地处理训练时未见过的序列长度。",
      },
    ],
    heroNote: "RoPE 是 LLaMA、PaLM 等模型使用的位置编码方法，支持更好的长度外推。",
  },
  {
    id: 10020,
    slug: "grouped-query-attention",
    title: "分组查询注意力（GQA）",
    domain: AIDomain.LLM,
    difficulty: Difficulty.HARD,
    description:
      "实现 Grouped Query Attention（GQA），多个 Query 头共享同一组 Key/Value，在保持性能的同时大幅降低 KV 缓存的内存占用。",
    learningGoals: [
      "理解 GQA 的设计动机（减少 KV 缓存）",
      "掌握 Query 分组和 KV 共享的机制",
      "理解 GQA 与 MHA、MQA 的区别",
      "观察内存节省和性能的权衡",
    ],
    inputs: [
      "Q：Query 矩阵，形状为 [N, num_q_heads, d]",
      "K：Key 矩阵，形状为 [N, num_kv_heads, d]",
      "V：Value 矩阵，形状为 [N, num_kv_heads, d]",
      "num_groups：分组数量",
    ],
    outputs: [
      "grouped_Q：分组后的 Query",
      "shared_KV：共享的 Key/Value",
      "gqa_output：GQA 输出",
      "kv_cache_size：KV 缓存大小对比",
    ],
    tags: ["GQA", "KV 缓存", "内存优化", "推理优化"],
    examples: [
      {
        input: "num_q_heads = 32, num_kv_heads = 8",
        output: "KV 缓存减少 75%，性能损失 < 5%",
        explanation:
          "GQA 通过让 4 个 Query 头共享 1 组 KV，大幅减少推理时的内存占用。",
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
      "实现 SwiGLU 激活函数，这是 GLU（Gated Linear Unit）的变体，使用 Swish 作为门控函数，在 Transformer 的 FFN 中表现优于 ReLU 和 GELU。",
    learningGoals: [
      "理解 SwiGLU 的数学公式",
      "掌握门控机制的作用",
      "理解 SwiGLU 相比其他激活函数的优势",
      "观察门控如何控制信息流",
    ],
    inputs: [
      "x：输入向量",
      "W1：第一层权重（分为两部分）",
      "W2：第二层权重",
    ],
    outputs: [
      "gate：门控输出",
      "value：值输出",
      "gated_value：门控后的值",
      "swiglu_output：SwiGLU 最终输出",
    ],
    tags: ["SwiGLU", "激活函数", "GLU", "FFN"],
    examples: [
      {
        input: "SwiGLU(x) = Swish(xW1 + b1) ⊙ (xW2 + b2)",
        output: "门控机制选择性地传递信息",
        explanation:
          "SwiGLU 通过门控机制，让模型学习哪些信息应该被传递，提升表达能力。",
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
      "实现 RMS Normalization，这是 Layer Norm 的简化版本，只计算均方根而不减去均值，计算更高效且性能相当。",
    learningGoals: [
      "理解 RMSNorm 与 Layer Norm 的区别",
      "掌握 RMSNorm 的计算公式",
      "理解为什么可以省略均值项",
      "观察计算效率的提升",
    ],
    inputs: [
      "X：输入向量，形状为 [seq_len, d_model]",
      "eps：防止除零的小常数",
      "gamma：可学习的缩放参数",
    ],
    outputs: [
      "rms：均方根值",
      "normalized：归一化后的结果",
      "output：缩放后的最终输出",
    ],
    tags: ["RMSNorm", "归一化", "Layer Norm", "优化"],
    examples: [
      {
        input: "RMSNorm(x) = (x / RMS(x)) * γ",
        output: "计算量比 Layer Norm 减少约 20%",
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
      "展示 KV 缓存在自回归生成中的优化作用，通过缓存之前计算的 Key 和 Value，避免重复计算，大幅提升生成速度。",
    learningGoals: [
      "理解 KV 缓存的设计动机",
      "掌握缓存更新的机制",
      "理解缓存如何减少计算量",
      "观察缓存对生成速度的提升",
    ],
    inputs: [
      "new_token：新生成的 token",
      "kv_cache：之前的 KV 缓存",
      "model：语言模型",
    ],
    outputs: [
      "new_kv：新 token 的 Key/Value",
      "updated_cache：更新后的缓存",
      "attention_output：使用缓存的注意力输出",
      "computation_saved：节省的计算量",
    ],
    tags: ["KV Cache", "推理优化", "缓存", "生成加速"],
    examples: [
      {
        input: "生成第 100 个 token",
        output: "只需计算新 token 的 KV，复用前 99 个 token 的缓存",
        explanation:
          "KV 缓存将生成复杂度从 O(N²) 降低到 O(N)，大幅提升推理速度。",
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
      "实现滑动窗口注意力（Sliding Window Attention），限制每个位置只关注固定窗口内的其他位置，降低计算复杂度。",
    learningGoals: [
      "理解滑动窗口注意力的设计动机",
      "掌握窗口大小的选择",
      "理解如何通过多层堆叠扩大感受野",
      "观察计算复杂度的降低",
    ],
    inputs: [
      "Q：Query 矩阵",
      "K：Key 矩阵",
      "V：Value 矩阵",
      "window_size：窗口大小",
    ],
    outputs: [
      "window_mask：窗口掩码",
      "windowed_attention：窗口注意力输出",
      "computation_complexity：计算复杂度",
    ],
    tags: ["滑动窗口", "稀疏注意力", "长序列", "计算优化"],
    examples: [
      {
        input: "window_size = 128, 序列长度 = 4096",
        output: "每个位置只关注前后 128 个位置",
        explanation:
          "滑动窗口将注意力复杂度从 O(N²) 降低到 O(N×W)，其中 W 是窗口大小。",
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
      "实现 ALiBi（Attention with Linear Biases）位置偏置，通过在注意力分数中添加线性偏置来编码位置信息，无需位置嵌入即可处理不同长度序列。",
    learningGoals: [
      "理解 ALiBi 的设计原理",
      "掌握线性偏置的计算方法",
      "理解 ALiBi 如何支持长度外推",
      "观察与位置编码的区别",
    ],
    inputs: [
      "attention_scores：注意力分数矩阵",
      "positions：位置索引",
      "slope：斜率参数（每个头不同）",
    ],
    outputs: [
      "position_bias：位置偏置矩阵",
      "biased_scores：添加偏置后的分数",
      "alibi_attention：ALiBi 注意力输出",
    ],
    tags: ["ALiBi", "位置偏置", "外推", "无位置编码"],
    examples: [
      {
        input: "训练长度 1024，测试长度 2048",
        output: "可以自然外推到更长序列",
        explanation:
          "ALiBi 的线性偏置设计使其能够自然地处理训练时未见过的序列长度。",
      },
    ],
    heroNote: "ALiBi 是 BLOOM 模型使用的位置编码方法，支持出色的长度外推能力。",
  },
];
