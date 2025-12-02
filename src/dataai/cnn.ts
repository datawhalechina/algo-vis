import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * CNN（卷积神经网络）相关题目数据
 * 经典 CNN 题型
 */
export const cnnProblems: AIProblem[] = [
  {
    id: 10072,
    slug: "conv2d-forward",
    title: "二维卷积前向传播",
    domain: AIDomain.CNN,
    difficulty: Difficulty.EASY,
    description:
      "可视化 2D 卷积如何在输入特征图上滑动卷积核并计算逐元素乘加（点积），帮助理解卷积操作产生输出特征图的全过程。",
    learningGoals: [
      "理解二维卷积的基本公式",
      "掌握卷积核滑动窗口的计算过程",
      "观察不同卷积核提取的特征",
      "理解输出尺寸与输入/卷积核/步长的关系",
    ],
    inputs: [
      "input：输入特征图，形状为 [H, W, C]",
      "kernel：卷积核，形状为 [K, K, C, out_channels]",
      "stride：步长",
      "padding：填充大小",
    ],
    outputs: [
      "feature_map：卷积输出",
      "patches：当前卷积核覆盖的输入窗口",
      "dot_products：每个位置的点积结果",
    ],
    tags: ["卷积", "前向传播", "基础操作"],
    examples: [
      {
        input: "input = 5x5, kernel = 3x3, stride = 1, padding = 0",
        output: "feature_map = 3x3",
        explanation: "没有填充时，5x5 输入与 3x3 卷积核得到 3x3 输出。",
      },
    ],
    heroNote: "卷积是 CNN 的核心运算，负责从局部区域提取模式。",
  },
  {
    id: 10073,
    slug: "stride-and-padding",
    title: "步长与填充",
    domain: AIDomain.CNN,
    difficulty: Difficulty.EASY,
    description:
      "展示更改步长（Stride）与填充（Padding）如何影响输出尺寸以及感受野覆盖区域，帮助理解 SAME 与 VALID 卷积的差异。",
    learningGoals: [
      "理解步长对输出尺寸的影响",
      "掌握填充如何保持空间尺寸",
      "观察感受野如何扩展",
      "分析 SAME/VALID 设置的区别",
    ],
    inputs: [
      "input：输入特征图尺寸",
      "kernel_size：卷积核大小",
      "stride：步长值",
      "padding_mode：填充模式（same/valid/custom）",
    ],
    outputs: [
      "output_shape：输出尺寸",
      "receptive_field：覆盖的输入区域",
      "padding_map：填充示意",
    ],
    tags: ["步长", "填充", "尺寸计算"],
    examples: [
      {
        input: "input = 32x32, kernel = 3, stride = 2, padding = 'same'",
        output: "output = 16x16",
        explanation: "SAME 填充保持输出 ceil(32/2)=16，VALID 则为 15。",
      },
    ],
    heroNote: "合理设置步长与填充有助于控制网络深度与计算量。",
  },
  {
    id: 10074,
    slug: "dilated-convolution",
    title: "空洞卷积",
    domain: AIDomain.CNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示空洞卷积（Dilated Convolution）如何在不增加参数的情况下扩大感受野，常用于语义分割与语音建模。",
    learningGoals: [
      "理解空洞卷积的采样方式",
      "掌握扩张率（dilation rate）的作用",
      "观察感受野扩大但分辨率保持的现象",
      "比较标准卷积与空洞卷积的差异",
    ],
    inputs: [
      "input：输入特征图",
      "kernel：卷积核",
      "dilation_rate：空洞率",
      "padding：填充设置",
    ],
    outputs: [
      "dilated_kernel：带空洞的卷积核布局",
      "feature_map：输出特征图",
      "receptive_field_map：感受野覆盖图",
    ],
    tags: ["空洞卷积", "感受野", "语义分割"],
    examples: [
      {
        input: "kernel = 3x3, dilation = 2",
        output: "有效感受野 = 5x5",
        explanation: "在核元素之间插入一个空洞，使感受野扩大到 5x5。",
      },
    ],
    heroNote: "空洞卷积是 DeepLab 等分割模型提升感受野的关键技巧。",
  },
  {
    id: 10075,
    slug: "transposed-convolution",
    title: "转置卷积（反卷积）",
    domain: AIDomain.CNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "可视化转置卷积如何将低分辨率特征图上采样为更高分辨率，用于生成模型和分割解码器。",
    learningGoals: [
      "理解转置卷积与普通卷积的关系",
      "掌握上采样过程中插值与卷积的结合",
      "观察输出尺寸受步长与填充影响的方式",
      "理解棋盘效应的来源",
    ],
    inputs: [
      "input：低分辨率特征图",
      "kernel：卷积核",
      "stride：步长",
      "padding：填充",
    ],
    outputs: [
      "upsampled_feature：上采样后的特征图",
      "inserted_zero_map：插入零后的中间表示",
      "convolution_steps：卷积计算过程",
    ],
    tags: ["转置卷积", "上采样", "生成模型"],
    examples: [
      {
        input: "input = 4x4, kernel = 3x3, stride = 2",
        output: "output = 7x7",
        explanation: "stride=2 时插入零并卷积得到 7x7 输出。",
      },
    ],
    heroNote: "转置卷积广泛用于 U-Net、GAN 解码器等结构。",
  },
  {
    id: 10076,
    slug: "depthwise-separable-conv",
    title: "深度可分离卷积",
    domain: AIDomain.CNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示深度可分离卷积（Depthwise Separable Convolution）如何将标准卷积分解为逐通道卷积与 1x1 点卷积，显著减少计算量。",
    learningGoals: [
      "理解 depthwise 与 pointwise 卷积的流程",
      "掌握与标准卷积的参数/计算对比",
      "观察 MobileNet 等轻量网络的关键设计",
      "分析加速背后的数学原因",
    ],
    inputs: [
      "input：输入特征图",
      "depthwise_kernel：逐通道卷积核",
      "pointwise_kernel：1x1 卷积核",
    ],
    outputs: [
      "depthwise_output：逐通道卷积结果",
      "pointwise_output：融合后的输出",
      "flops_comparison：计算量对比",
    ],
    tags: ["Depthwise", "Separable Conv", "轻量化"],
    examples: [
      {
        input: "input channels = 32, output channels = 64",
        output: "计算量减少 ≈8 倍",
        explanation: "深度可分离卷积显著减少参数与 FLOPs。",
      },
    ],
    heroNote: "移动端网络（MobileNet、Xception）都依赖深度可分离卷积。",
  },
  {
    id: 10077,
    slug: "group-convolution",
    title: "分组卷积",
    domain: AIDomain.CNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示分组卷积（Group Convolution）如何将通道分成多个组分别卷积，再在输出维度拼接，用于 ResNeXt、ShuffleNet 等结构。",
    learningGoals: [
      "理解分组卷积的参数组织方式",
      "掌握组数对通道交互的影响",
      "观察分组卷积的计算并行性",
      "理解 ResNeXt 中 Cardinality 的含义",
    ],
    inputs: ["input：输入特征图", "kernel：卷积核", "groups：分组数量"],
    outputs: [
      "group_outputs：每个组的卷积结果",
      "concatenated_output：拼接后的输出",
      "param_comparison：参数对比",
    ],
    tags: ["分组卷积", "ResNeXt", "高效卷积"],
    examples: [
      {
        input: "channels = 64, groups = 4",
        output: "每组处理 16 个通道",
        explanation: "分组卷积将输入通道平均分配到各组，减少计算并提升表达力。",
      },
    ],
    heroNote: "分组卷积在高效 CNN 与多分支结构中广泛使用。",
  },
  {
    id: 10078,
    slug: "residual-block",
    title: "残差块可视化",
    domain: AIDomain.CNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示残差块（Residual Block）如何通过恒等映射或 1x1 卷积跳跃连接缓解梯度消失，并可视化前向/反向过程中梯度流动。",
    learningGoals: [
      "理解残差连接的数学形式",
      "掌握恒等映射与投影映射的区别",
      "观察梯度如何跨层传播",
      "理解深层网络训练稳定性的提升",
    ],
    inputs: [
      "input：输入特征",
      "conv_layers：残差块内部卷积层配置",
      "shortcut_type：恒等/1x1 投影",
    ],
    outputs: [
      "residual：残差分支输出",
      "output：残差块最终输出",
      "gradient_flow：梯度流可视化",
    ],
    tags: ["ResNet", "残差块", "梯度流"],
    examples: [
      {
        input: "shortcut_type = 'projection', stride = 2",
        output: "使用 1x1 卷积匹配维度与步长",
        explanation: "当输入输出通道或尺寸不一致时需使用 1x1 卷积投影。",
      },
    ],
    heroNote: "残差连接是 ResNet 成功训练超深网络的关键。",
  },
  {
    id: 10079,
    slug: "inception-module",
    title: "Inception 模块",
    domain: AIDomain.CNN,
    difficulty: Difficulty.HARD,
    description:
      "展示 Inception 模块如何在同一层内使用多种卷积核和池化分支，再拼接输出，提升多尺度特征提取能力。",
    learningGoals: [
      "理解 Inception 模块的多分支结构",
      "掌握 1x1 卷积在降维中的作用",
      "观察多尺度特征的融合方式",
      "分析计算量与效果的平衡",
    ],
    inputs: ["input：输入特征", "branch_configs：各分支卷积/池化配置"],
    outputs: [
      "branch_outputs：各分支输出",
      "concatenated_feature：拼接后的特征",
      "channel_distribution：通道分配图",
    ],
    tags: ["Inception", "多分支", "多尺度"],
    examples: [
      {
        input: "分支 = {1x1, 3x3, 5x5, 池化}",
        output: "concat 输出通道 = 各分支通道之和",
        explanation: "多分支结构捕获不同尺度信息后进行拼接。",
      },
    ],
    heroNote: "GoogLeNet 的 Inception 模块在高效多尺度建模上具有代表性。",
  },
  {
    id: 10080,
    slug: "temporal-convolution",
    title: "一维时序卷积",
    domain: AIDomain.CNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示 1D 卷积如何在时间序列上滑动提取局部模式，应用于语音、序列信号等领域，并与 RNN 进行对比。",
    learningGoals: [
      "理解 1D 卷积在时间轴上的计算",
      "掌握感受野与卷积层堆叠的关系",
      "观察不同核大小捕获的时间模式",
      "比较 1D CNN 与 RNN 的优劣",
    ],
    inputs: [
      "sequence：输入序列，形状为 [T, C]",
      "kernel_size：卷积核长度",
      "dilation：空洞率（可选）",
    ],
    outputs: [
      "temporal_feature：时间卷积输出",
      "receptive_field_plot：感受野随层数变化图",
      "comparison_stats：与 RNN 的计算对比",
    ],
    tags: ["1D 卷积", "时间序列", "TCN"],
    examples: [
      {
        input: "kernel = 3, dilation = 1",
        output: "感受野随堆叠线性增长",
        explanation: "连续堆叠 1D 卷积层可以快速扩大时间感受野，适合并行计算。",
      },
    ],
    heroNote: "Temporal Convolution Network（TCN）在多种序列任务上表现优异。",
  },
  {
    id: 10081,
    slug: "receptive-field-visualizer",
    title: "感受野可视化",
    domain: AIDomain.CNN,
    difficulty: Difficulty.MEDIUM,
    description:
      "通过逐层计算感受野（Receptive Field）大小，展示深度 CNN 中某个输出像素对应输入图像的区域，帮助理解网络在不同层关注的范围。",
    learningGoals: [
      "理解感受野的逐层递推公式",
      "掌握步长/卷积核/填充对感受野的影响",
      "观察不同层的感受野覆盖范围",
      "分析大感受野在检测/分割中的作用",
    ],
    inputs: [
      "layers：网络层配置（kernel, stride, padding）",
      "target_layer：目标层索引",
    ],
    outputs: [
      "receptive_field_size：感受野尺寸",
      "center_position：感受野中心位置映射",
      "layerwise_table：逐层感受野统计",
    ],
    tags: ["感受野", "网络分析", "可视化"],
    examples: [
      {
        input: "layers = [[3,1,1], [3,2,1], [3,1,1]]",
        output: "目标层感受野 = 10",
        explanation:
          "通过递推公式 RF_l = RF_{l-1} + (kernel-1)*prod(strides)，可得到最终感受野大小。",
      },
    ],
    heroNote: "感受野分析帮助我们理解深层特征是否覆盖到足够大的区域。",
  },
];
