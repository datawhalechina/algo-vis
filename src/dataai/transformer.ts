import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * Transformer 相关题目数据
 * 经典 Transformer / Encoder-Decoder / 注意力题型
 */
export const transformerProblems: AIProblem[] = [
  {
    id: 10092,
    slug: "transformer-architecture",
    title: "Transformer 架构总览",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.EASY,
    description:
      "交互式拆解 Transformer 的整体结构，展示编码器/解码器堆叠、注意力与前馈层的组合方式，帮助建立宏观认识。",
    learningGoals: [
      "理解 Transformer 编码器-解码器组成",
      "掌握自注意力与交叉注意力在流程中的位置",
      "观察残差、归一化、前馈层的重复模式",
      "了解模型超参（层数、头数、隐藏维度）",
    ],
    inputs: [
      "num_layers：编码器/解码器层数",
      "num_heads：多头注意力的头数",
      "d_model：隐藏维度",
      "d_ff：前馈层维度",
    ],
    outputs: [
      "layer_diagram：分层结构示意",
      "parameter_count：参数估算",
      "data_flow：数据流动动画",
    ],
    tags: ["Transformer", "架构", "可视化"],
    examples: [
      {
        input: "num_layers = 6, num_heads = 8, d_model = 512",
        output: "参数 ≈ 65M",
        explanation: "复现经典 Transformer Base 配置的整体结构。",
      },
    ],
    heroNote: "宏观理解有助于在后续题目中定位各个模块。",
  },
  {
    id: 10093,
    slug: "positional-encoding",
    title: "位置编码",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.EASY,
    description:
      "展示正弦/余弦位置编码与可学习位置向量如何注入顺序信息，可视化不同维度的波形与相位。",
    learningGoals: [
      "理解正弦位置编码公式",
      "掌握频率随维度变化的规律",
      "观察可学习位置编码与固定编码差异",
      "分析位置编码对注意力的影响",
    ],
    inputs: [
      "sequence_length：序列长度",
      "d_model：隐藏维度",
      "encoding_type：sinusoidal / learned",
    ],
    outputs: [
      "encoding_matrix：位置编码矩阵",
      "wave_plot：不同维度的波形",
      "heatmap：位置编码热力图",
    ],
    tags: ["位置编码", "Sinusoidal", "序列表示"],
    examples: [
      {
        input: "sequence_length = 10, d_model = 16",
        output: "热力图呈现周期性斜纹",
        explanation: "不同频率叠加提供唯一的位置表示。",
      },
    ],
    heroNote: "位置编码让无卷积/无循环的 Transformer 具备顺序感知能力。",
  },
  {
    id: 10094,
    slug: "multi-head-attention-visualizer",
    title: "多头注意力可视化",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示多头注意力如何对同一序列执行多组 Query/Key/Value 投影，并可视化每个头的注意力热力图与输出拼接过程。",
    learningGoals: [
      "理解多头注意力的线性投影与并行计算",
      "掌握缩放点积注意力与 softmax 的作用",
      "观察不同头关注的模式差异",
      "了解头输出拼接与线性变换",
    ],
    inputs: [
      "sequence：输入序列",
      "num_heads：注意力头数",
      "mask：可选的注意力 mask",
    ],
    outputs: [
      "head_weights：每个头的注意力权重",
      "head_outputs：头输出向量",
      "concatenated_output：拼接后的结果",
    ],
    tags: ["Multi-Head", "Attention", "可视化"],
    examples: [
      {
        input: "num_heads = 4",
        output: "每头权重矩阵大小 = [seq_len, seq_len]",
        explanation: "显示各头在不同 token 间的关注分布。",
      },
    ],
    heroNote: "多头机制让模型从多个子空间捕获关系。",
  },
  {
    id: 10095,
    slug: "feed-forward-network",
    title: "前馈网络 (FFN)",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.EASY,
    description:
      "解析 Transformer 层中的位置前馈网络（FFN），展示其对每个位置独立应用的两层全连接及激活函数。",
    learningGoals: [
      "理解 FFN 公式：FFN(x)=max(0,xW1+b1)W2+b2",
      "掌握 d_model 与 d_ff 的关系",
      "观察非线性对特征的变化",
      "认识 FFN 作为通道混合的角色",
    ],
    inputs: [
      "input_tensor：形状 [seq_len, d_model]",
      "d_ff：隐藏维度",
      "activation：ReLU/GELU",
    ],
    outputs: [
      "hidden_output：第一层激活结果",
      "ffn_output：最终输出",
      "activation_distribution：激活分布图",
    ],
    tags: ["FFN", "通道混合", "激活函数"],
    examples: [
      {
        input: "d_model = 512, d_ff = 2048",
        output: "参数量 ≈ 2×512×2048",
        explanation: "FFN 参数占 Transformer 大部分容量。",
      },
    ],
    heroNote: "FFN 为每个位置引入非线性与通道交互。",
  },
  {
    id: 10096,
    slug: "layer-normalization",
    title: "LayerNorm 在 Transformer 中的作用",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示 LayerNorm 在残差连接前后的不同放置策略（Post-LN / Pre-LN），可视化归一化对激活分布的影响。",
    learningGoals: [
      "理解 LayerNorm 的计算步骤",
      "掌握 Post-LN 与 Pre-LN 的差异",
      "观察均值/方差随训练步变化",
      "分析 Pre-LN 稳定深层训练的原因",
    ],
    inputs: [
      "activations：输入激活",
      "mode：post_ln / pre_ln",
      "epsilon：数值稳定项",
    ],
    outputs: [
      "normalized_output：归一化结果",
      "stats_curve：均值方差曲线",
      "residual_diagram：残差路径示意",
    ],
    tags: ["LayerNorm", "残差", "训练稳定"],
    examples: [
      {
        input: "mode = pre_ln",
        output: "梯度更稳定",
        explanation: "Pre-LN 将归一化放在注意力/FFN 之前，缓解梯度消失。",
      },
    ],
    heroNote: "LayerNorm 是 Transformer 层得以稳定堆叠数十层的关键组件。",
  },
  {
    id: 10097,
    slug: "encoder-stack",
    title: "Transformer 编码器堆叠",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.MEDIUM,
    description:
      "演示多个编码器层如何级联，展示每层输出在注意力与前馈后发生的特征演化，并支持查看任意层的隐表示。",
    learningGoals: [
      "理解编码器层的重复结构",
      "观察层数对表现的影响",
      "掌握残差堆叠后的信息整合",
      "分析深层 vs 浅层的表示差异",
    ],
    inputs: [
      "input_sequence：序列嵌入",
      "num_layers：编码器层数",
      "probe_layer：指定查看的层",
    ],
    outputs: [
      "layer_outputs：各层输出快照",
      "attention_stats：各层注意力统计",
      "probe_visualization：指定层的特征可视化",
    ],
    tags: ["编码器", "层堆叠", "表示演化"],
    examples: [
      {
        input: "num_layers = 12, probe_layer = 6",
        output: "展示第 6 层的注意力和特征",
        explanation: "中间层通常兼顾局部与全局上下文。",
      },
    ],
    heroNote: "编码器堆叠是 BERT、ViT 等模型的核心。",
  },
  {
    id: 10098,
    slug: "decoder-with-cross-attention",
    title: "解码器与交叉注意力",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.HARD,
    description:
      "深入可视化 Transformer 解码器中的自注意力、交叉注意力、前馈三阶段，特别聚焦交叉注意力如何将编码器信息注入解码过程。",
    learningGoals: [
      "理解掩码自注意力的因果约束",
      "掌握交叉注意力 Query/Key/Value 来源",
      "观察每个解码步如何聚焦编码器隐状态",
      "分析 Teacher Forcing 与推理的区别",
    ],
    inputs: [
      "encoder_states：编码器输出",
      "decoder_inputs：解码输入（shifted targets）",
      "step：查看的解码步",
    ],
    outputs: [
      "self_attention_weights：掩码自注意力权重",
      "cross_attention_weights：交叉注意力热力图",
      "decoder_hidden_state：当前隐藏状态",
    ],
    tags: ["解码器", "交叉注意力", "机器翻译"],
    examples: [
      {
        input: "step = 3",
        output: "cross attention 聚焦相关源词",
        explanation: "第三个目标词根据源句中相关位置聚合信息。",
      },
    ],
    heroNote: "交叉注意力将编码器上下文动态注入解码过程。",
  },
  {
    id: 10099,
    slug: "transformer-training-tricks",
    title: "Transformer 训练技巧",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.MEDIUM,
    description:
      "总结并可视化 Transformer 训练时常用的技巧：学习率 warmup、label smoothing、梯度累积等，展示它们对损失曲线的影响。",
    learningGoals: [
      "理解学习率预热与余弦衰减",
      "掌握 label smoothing 的交叉熵公式",
      "观察梯度累积等效批大小",
      "分析不同超参组合对收敛的作用",
    ],
    inputs: [
      "warmup_steps：预热步数",
      "label_smoothing：平滑系数",
      "accumulation_steps：梯度累积步数",
    ],
    outputs: [
      "lr_schedule：学习率曲线",
      "loss_curve：训练/验证损失",
      "comparison_table：不同技巧对比",
    ],
    tags: ["训练技巧", "Warmup", "Label Smoothing"],
    examples: [
      {
        input: "warmup_steps = 4000",
        output: "学习率先升后降",
        explanation: "复现原论文提出的 warmup + inverse sqrt 衰减曲线。",
      },
    ],
    heroNote: "合适的训练策略是 Transformer 成功的保障之一。",
  },
  {
    id: 10100,
    slug: "transformer-beam-search",
    title: "Transformer 推理与 Beam Search",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.HARD,
    description:
      "展示 Transformer 在推理阶段如何使用贪心搜索、束搜索 (Beam Search)、温度与重复惩罚来生成高质量序列。",
    learningGoals: [
      "理解自回归生成流程",
      "掌握束搜索的候选维护与打分",
      "观察温度/Top-k/重复惩罚对输出的影响",
      "比较不同搜索策略的多样性与准确性",
    ],
    inputs: [
      "start_token：起始符",
      "beam_size：束宽",
      "max_length：最大生成长度",
      "sampling_strategy：greedy / beam / topk",
    ],
    outputs: [
      "candidate_sequences：候选序列及分数",
      "search_tree：搜索路径可视化",
      "final_output：选定的输出",
    ],
    tags: ["推理", "Beam Search", "生成"],
    examples: [
      {
        input: "beam_size = 4",
        output: "生成 4 条候选并选择最高分",
        explanation: "束搜索在每个步骤保留 top beam_size 条路径。",
      },
    ],
    heroNote: "推理策略直接影响 Transformer 文本生成质量。",
  },
  {
    id: 10101,
    slug: "transformer-scaling-laws",
    title: "Transformer Scaling Law",
    domain: AIDomain.TRANSFORMER,
    difficulty: Difficulty.MEDIUM,
    description:
      "可视化模型规模、数据量、训练计算量与性能的 scaling law 曲线，理解在大模型训练中如何平衡三者。",
    learningGoals: [
      "理解 Chinchilla Scaling Law 的公式",
      "掌握参数规模 vs 数据规模的最佳比例",
      "观察 under-training 与 over-training 区域",
      "分析扩展模型或数据的收益递减",
    ],
    inputs: [
      "model_params：模型参数规模",
      "data_tokens：训练 token 数",
      "compute_budget：训练 FLOPs",
    ],
    outputs: [
      "scaling_curve：损失随规模变化曲线",
      "optimal_region：最优配置区间",
      "tradeoff_table：三要素对比表",
    ],
    tags: ["Scaling Law", "大模型", "算力规划"],
    examples: [
      {
        input: "model_params=1B, data_tokens=200B",
        output: "处于 compute-limited 区域",
        explanation: "数据远超参数规模，模型容量成为瓶颈。",
      },
    ],
    heroNote: "Scaling Law 指导大语言模型的规模规划与训练预算。",
  },
];
