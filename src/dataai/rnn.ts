import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * RNN（循环神经网络）相关题目数据
 * 经典 RNN / LSTM / GRU 题型
 */
export const rnnProblems: AIProblem[] = [
  {
    id: 10082,
    slug: "rnn-cell",
    title: "基础 RNN Cell",
    domain: AIDomain.RNN,
    difficulty: Difficulty.EASY,
    description:
      "展示最基础的 Elman RNN Cell 如何接收当前输入与上一隐藏状态，通过线性变换与激活函数生成新的隐藏状态。",
    learningGoals: [
      "理解 RNN Cell 的数学公式",
      "掌握隐藏状态在时间维度的传递方式",
      "观察激活函数对状态范围的影响",
      "识别参数矩阵的维度关系",
    ],
    inputs: [
      "x_t：当前时刻输入向量",
      "h_{t-1}：上一隐藏状态",
      "W_xh, W_hh：权重矩阵",
      "b_h：偏置",
    ],
    outputs: ["pre_activation：线性组合结果", "h_t：新的隐藏状态"],
    tags: ["RNN", "隐藏状态", "基础"],
    examples: [
      {
        input: "x_t ∈ R^4, h_{t-1} ∈ R^8",
        output: "h_t = tanh(W_xh x_t + W_hh h_{t-1} + b_h)",
        explanation: "展示线性变换后再经过 tanh 得到新的隐藏状态。",
      },
    ],
    heroNote: "RNN Cell 是所有循环结构的基础，后续架构在其上扩展而来。",
  },
  {
    id: 10083,
    slug: "rnn-forward-sequence",
    title: "RNN 序列前向传播",
    domain: AIDomain.RNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "可视化标准 RNN 在完整序列上的前向传播过程，包括隐藏状态随时间的更新、输出的生成，以及时间展开图。",
    learningGoals: [
      "理解 RNN 在时间维度的展开",
      "掌握批量序列的处理方式",
      "观察隐藏状态与输出序列的对应关系",
      "分析序列长度对计算的影响",
    ],
    inputs: [
      "sequence：输入序列 [T, input_dim]",
      "initial_state：初始隐藏状态",
      "output_layer：输出层权重",
    ],
    outputs: [
      "hidden_states：每个时间步的隐藏状态",
      "outputs：对应的输出序列",
      "timeline_view：时间展开示意",
    ],
    tags: ["RNN", "前向传播", "序列模型"],
    examples: [
      {
        input: "sequence 长度 5, hidden_dim 16",
        output: "hidden_states ∈ R^{5×16}",
        explanation: "依次计算每个时间步的隐藏状态并堆叠形成矩阵。",
      },
    ],
    heroNote: "理解序列展开是实现自定义 RNN 的第一步。",
  },
  {
    id: 10084,
    slug: "vanishing-gradient",
    title: "梯度消失演示",
    domain: AIDomain.RNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "通过长序列反向传播的可视化，展示 RNN 在深时间维度上出现梯度消失/爆炸的问题，并与梯度裁剪对比。",
    learningGoals: [
      "观察梯度随时间步的指数衰减",
      "理解激活函数与权重初始化的影响",
      "掌握梯度裁剪的效果",
      "认识 LSTM/GRU 设计动机",
    ],
    inputs: [
      "sequence_length：序列长度",
      "hidden_dim：隐藏维度",
      "activation：激活函数类型",
      "clip_norm：梯度裁剪阈值（可选）",
    ],
    outputs: [
      "gradient_curve：梯度随时间的曲线",
      "clipped_gradient_curve：裁剪后的梯度",
      "vanishing_metric：梯度范数统计",
    ],
    tags: ["RNN", "梯度消失", "训练稳定性"],
    examples: [
      {
        input: "sequence_length = 50, activation = tanh",
        output: "梯度在 30 个时间步后趋近于 0",
        explanation: "长序列导致梯度不断乘以 <1 的系数，迅速衰减。",
      },
    ],
    heroNote: "梯度消失是 LSTM/GRU 被提出的核心原因。",
  },
  {
    id: 10085,
    slug: "lstm-cell",
    title: "LSTM Cell 结构",
    domain: AIDomain.RNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "拆解 LSTM 的输入门、遗忘门、输出门和候选状态，展示门控如何控制信息流动，并可视化细胞状态。",
    learningGoals: [
      "理解 LSTM 四个门的计算公式",
      "掌握细胞状态与隐藏状态的区别",
      "观察门控参数对信息保留的影响",
      "分析遗忘门在长期依赖中的作用",
    ],
    inputs: [
      "x_t：当前输入",
      "h_{t-1}, c_{t-1}：上一隐藏状态与细胞状态",
      "weights：门控权重集合",
    ],
    outputs: [
      "gate_values：输入/遗忘/输出门值",
      "candidate_state：候选状态",
      "c_t, h_t：更新后的细胞与隐藏状态",
    ],
    tags: ["LSTM", "门控机制", "长程依赖"],
    examples: [
      {
        input: "遗忘门 ≈1, 输入门 ≈0",
        output: "c_t ≈ c_{t-1}",
        explanation: "遗忘门打开、输入门关闭时，细胞状态被完整保留下来。",
      },
    ],
    heroNote: "LSTM 通过门控机制高效解决长程依赖问题。",
  },
  {
    id: 10086,
    slug: "lstm-vs-gru",
    title: "LSTM 与 GRU 对比",
    domain: AIDomain.RNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "比较 LSTM 与 GRU 的门控结构、参数数量与信息流，展示两者在不同任务上的表现差异。",
    learningGoals: [
      "理解 GRU 的更新/重置门设计",
      "掌握 LSTM/GRU 参数规模差异",
      "观察在短序列 vs 长序列任务的表现",
      "分析推理速度与内存占用",
    ],
    inputs: [
      "sequence：输入序列",
      "hidden_dim：隐藏维度",
      "task_type：任务类型（短依赖/长依赖）",
    ],
    outputs: [
      "lstm_metrics：LSTM 的损失与准确率",
      "gru_metrics：GRU 的损失与准确率",
      "param_comparison：参数数量对比",
    ],
    tags: ["LSTM", "GRU", "架构对比"],
    examples: [
      {
        input: "task_type = 长依赖",
        output: "LSTM 收敛更稳定",
        explanation: "额外的细胞状态帮助 LSTM 处理更长的依赖。",
      },
    ],
    heroNote: "根据任务需求选择 LSTM 还是 GRU，可以在速度与性能间权衡。",
  },
  {
    id: 10087,
    slug: "bidirectional-rnn",
    title: "双向 RNN",
    domain: AIDomain.RNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "演示双向 RNN 如何同时利用前向与后向的信息，适用于完整序列可用的任务，如命名实体识别。",
    learningGoals: [
      "理解双向结构的前后向隐藏状态",
      "掌握拼接/求和融合方式",
      "观察双向与单向性能对比",
      "分析实时任务中无法使用的原因",
    ],
    inputs: ["sequence：完整输入序列", "merge_mode：前后向融合方式"],
    outputs: [
      "forward_states, backward_states：双向隐藏状态",
      "merged_output：融合后的输出",
      "performance_gain：性能提升统计",
    ],
    tags: ["双向 RNN", "上下文", "序列标注"],
    examples: [
      {
        input: "merge_mode = concat",
        output: "输出维度 = 2 × hidden_dim",
        explanation: "拼接模式会将前向与后向状态在通道维度上合并。",
      },
    ],
    heroNote: "双向 RNN 提供完整上下文信息，是序列标注经典结构。",
  },
  {
    id: 10088,
    slug: "seq2seq-rnn",
    title: "RNN Seq2Seq",
    domain: AIDomain.RNN,
    difficulty: Difficulty.HARD,
    description:
      "展示基于 RNN 编码器-解码器的 Seq2Seq 模型，强调上下文向量、教师强制与推理阶段的差异。",
    learningGoals: [
      "理解编码器如何压缩输入序列",
      "掌握解码器的自回归生成流程",
      "观察教师强制与自由解码的对比",
      "分析长句子时信息瓶颈问题",
    ],
    inputs: [
      "source_sequence：源语言序列",
      "target_sequence：目标序列（训练阶段）",
      "teacher_forcing_ratio：教师强制比例",
    ],
    outputs: [
      "context_vector：编码器最终隐藏状态",
      "decoder_steps：解码过程日志",
      "generated_sequence：模型输出",
    ],
    tags: ["Seq2Seq", "编码器-解码器", "机器翻译"],
    examples: [
      {
        input: "teacher_forcing_ratio = 0.5",
        output: "训练时一半步骤使用真实标签",
        explanation: "教师强制可以稳定训练，但推理时需完全自回归。",
      },
    ],
    heroNote: "经典 Seq2Seq 为注意力与 Transformer 铺平了道路。",
  },
  {
    id: 10089,
    slug: "ctc-loss",
    title: "CTC Loss 解读",
    domain: AIDomain.RNN,
    difficulty: Difficulty.HARD,
    description:
      "解析连接时序分类（CTC）如何在未对齐的输入输出之间计算概率，常用于语音识别与手写识别。",
    learningGoals: [
      "理解 CTC 中的 blank 符号",
      "掌握前向-后向算法计算路径概率",
      "观察动态规划表的构造",
      "分析束搜索解码流程",
    ],
    inputs: [
      "logits：RNN 输出的时间-字符概率",
      "target_sequence：目标标签序列",
    ],
    outputs: [
      "alignment_lattice：前后向概率表",
      "ctc_loss：损失值",
      "decoded_sequence：束搜索解码结果",
    ],
    tags: ["CTC", "对齐", "语音识别"],
    examples: [
      {
        input: "logits 时间步 = 5, target 长度 = 3",
        output: "存在多条有效路径",
        explanation: "CTC 允许插入 blank 与重复字符实现柔性对齐。",
      },
    ],
    heroNote: "CTC 让 RNN 能直接处理未对齐序列，广泛用于语音文字转换。",
  },
  {
    id: 10090,
    slug: "attention-on-rnn",
    title: "RNN 注意力机制",
    domain: AIDomain.RNN,
    difficulty: Difficulty.HARD,
    description:
      "在 RNN Seq2Seq 基础上添加 Bahdanau / Luong 注意力，展示解码器如何利用所有编码器隐藏状态提升翻译质量。",
    learningGoals: [
      "理解注意力权重的计算方式",
      "掌握上下文向量的构造",
      "观察注意力热力图与输出词的对应",
      "比较无注意力与有注意力的性能",
    ],
    inputs: [
      "encoder_states：编码器隐藏状态序列",
      "decoder_state：当前解码器状态",
      "attention_type：Bahdanau 或 Luong",
    ],
    outputs: [
      "attention_weights：权重分布",
      "context_vector：加权和",
      "decoder_output：当前预测",
    ],
    tags: ["注意力", "Seq2Seq", "RNN"],
    examples: [
      {
        input: "attention_type = Bahdanau",
        output: "权重 = softmax(v^T tanh(W[h_i; s_t]))",
        explanation: "可视化每个源词对当前目标词的贡献。",
      },
    ],
    heroNote: "RNN+Attention 是 Transformer 出现前的主流翻译架构。",
  },
  {
    id: 10091,
    slug: "rnn-regularization",
    title: "RNN 正则化技巧",
    domain: AIDomain.RNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "总结并演示 RNN 常用的正则化方法，包括 dropout、变长序列 mask、层归一化等，展示其对过拟合的抑制作用。",
    learningGoals: [
      "理解 dropout 在时间维度的应用方式",
      "掌握变长序列的 mask 处理",
      "观察 LayerNorm 对收敛的影响",
      "比较不同正则化组合的效果",
    ],
    inputs: [
      "sequence_batch：批量序列数据",
      "dropout_rate：dropout 比例",
      "use_layer_norm：是否启用层归一化",
    ],
    outputs: [
      "train_loss_curve：训练损失曲线",
      "val_performance：验证集表现",
      "regularization_summary：不同设置对比",
    ],
    tags: ["RNN", "正则化", "Dropout"],
    examples: [
      {
        input: "dropout_rate = 0.3, use_layer_norm = true",
        output: "验证集性能提升",
        explanation: "时间维度共享 dropout mask + LayerNorm 可稳定训练。",
      },
    ],
    heroNote: "合适的正则化可以显著提升 RNN 的泛化能力。",
  },
];
