import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * 视觉（Vision）相关题目数据
 * 计算机视觉经典题型
 */
export const visionProblems: AIProblem[] = [
  {
    id: 10001,
    slug: "vision-attention-heatmap",
    title: "视觉注意力热力图",
    domain: AIDomain.VISION,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示 Vision Transformer 中 Query/Key 点积、温度缩放和 Softmax 后的注意力分布，帮助理解模型为何聚焦在特定图像 patch 上。",
    learningGoals: [
      "理解 Query 与 Key 向量的点积如何影响注意力强度",
      "掌握温度缩放与 Softmax 对权重的影响",
      "观察注意力权重与上下文向量之间的对应关系",
    ],
    inputs: [
      "patches：JSON 字符串，包含每个 patch 的特征向量（二维数组）",
      "queryIndex：作为 Query 的 patch 下标",
      'temperature：温度系数，越小越"尖锐"',
    ],
    outputs: [
      "rawScores：Query 与所有 Key 的点积结果",
      "weights：Softmax 注意力权重",
      "contextVector：基于注意力权重聚合后的向量",
    ],
    tags: ["Vision Transformer", "Attention", "Softmax"],
    examples: [
      {
        input:
          "patches = [[0.8,0.3,0.1],[0.2,0.7,0.4],[0.9,0.1,0.5],[0.4,0.6,0.2]], queryIndex = 0, temperature = 0.8",
        output: "weights ≈ [0.44, 0.19, 0.27, 0.10]",
        explanation:
          "Query 更关注自身和相似特征的 patch，温度越小越偏向最大值。",
      },
    ],
    heroNote: "默认示例基于 2x2 patch tokens，演示局部注意力分布。",
  },
  {
    id: 10026,
    slug: "convolution-operation",
    title: "卷积操作",
    domain: AIDomain.VISION,
    difficulty: Difficulty.EASY,
    description:
      "可视化卷积神经网络中的核心操作——卷积。展示卷积核如何在输入特征图上滑动，计算点积并生成输出特征图。理解卷积如何提取局部特征。",
    learningGoals: [
      "理解卷积操作的基本原理和计算过程",
      "掌握卷积核滑动窗口的计算方式",
      "观察不同卷积核提取的不同特征",
      "理解步长（stride）和填充（padding）的作用",
    ],
    inputs: [
      "input：输入特征图，形状为 [H, W, C]",
      "kernel：卷积核，形状为 [K, K, C, out_channels]",
      "stride：步长，控制卷积核移动的步数",
      "padding：填充方式（'same' 或 'valid'）",
    ],
    outputs: [
      "output：输出特征图，形状为 [H', W', out_channels]",
      "feature_maps：每个卷积核产生的特征图",
      "activation：激活函数后的结果",
    ],
    tags: ["CNN", "卷积", "特征提取", "基础操作"],
    examples: [
      {
        input: "input = 5x5 图像，kernel = 3x3，stride = 1, padding = 'same'",
        output: "output = 5x5 特征图",
        explanation:
          "使用 'same' 填充保持输出尺寸与输入相同，每个位置都是卷积核与对应区域的点积。",
      },
    ],
    heroNote: "卷积是 CNN 的基础，通过局部感受野提取空间特征。",
  },
  {
    id: 10027,
    slug: "max-pooling",
    title: "最大池化",
    domain: AIDomain.VISION,
    difficulty: Difficulty.EASY,
    description:
      "展示最大池化操作如何通过取局部区域的最大值来降低特征图的空间维度，同时保留最重要的特征信息。理解池化在减少参数和防止过拟合中的作用。",
    learningGoals: [
      "理解池化操作的目的和作用",
      "掌握最大池化的计算过程",
      "理解池化如何实现平移不变性",
      "观察池化对特征图尺寸的影响",
    ],
    inputs: [
      "input：输入特征图，形状为 [H, W, C]",
      "pool_size：池化窗口大小（如 2x2）",
      "stride：步长，通常等于 pool_size",
    ],
    outputs: [
      "output：池化后的特征图，形状为 [H', W', C]",
      "indices：每个池化区域最大值的索引位置",
    ],
    tags: ["CNN", "池化", "下采样", "特征降维"],
    examples: [
      {
        input: "input = 4x4 特征图，pool_size = 2x2，stride = 2",
        output: "output = 2x2 特征图",
        explanation:
          "将 4x4 区域划分为 4 个 2x2 窗口，每个窗口取最大值，得到 2x2 输出。",
      },
    ],
    heroNote: "池化操作减少计算量，同时保留最重要的特征。",
  },
  {
    id: 10028,
    slug: "batch-normalization",
    title: "批量归一化",
    domain: AIDomain.VISION,
    difficulty: Difficulty.MEDIUM,
    description:
      "可视化批量归一化（Batch Normalization）如何对每个批次的数据进行标准化，加速训练并提高模型稳定性。理解归一化对梯度流和训练速度的影响。",
    learningGoals: [
      "理解批量归一化的数学原理",
      "掌握均值和方差的计算过程",
      "理解可学习的缩放和平移参数（γ 和 β）",
      "观察归一化对激活值分布的影响",
    ],
    inputs: [
      "input：输入特征，形状为 [batch_size, H, W, C]",
      "gamma：缩放参数，可学习",
      "beta：平移参数，可学习",
      "epsilon：防止除零的小常数",
    ],
    outputs: [
      "normalized：归一化后的特征",
      "mean：批次均值",
      "variance：批次方差",
      "output：缩放和平移后的最终输出",
    ],
    tags: ["CNN", "归一化", "训练加速", "深度网络"],
    examples: [
      {
        input: "input = [2, 4, 4, 3] 批次，gamma = 1, beta = 0",
        output: "normalized 特征，均值为 0，方差为 1",
        explanation:
          "对每个通道独立计算均值和方差，然后标准化，最后应用可学习的缩放和平移。",
      },
    ],
    heroNote: "批量归一化是训练深度网络的关键技术，允许使用更大的学习率。",
  },
  {
    id: 10029,
    slug: "residual-connection",
    title: "残差连接",
    domain: AIDomain.VISION,
    difficulty: Difficulty.MEDIUM,
    description:
      "展示残差连接（Residual Connection）如何通过跳跃连接将输入直接传递到输出，解决深度网络的梯度消失问题。理解残差学习的基本思想。",
    learningGoals: [
      "理解残差连接的基本原理",
      "掌握残差块的前向传播过程",
      "理解残差如何缓解梯度消失",
      "观察残差连接对网络训练的影响",
    ],
    inputs: [
      "input：输入特征，形状为 [H, W, C]",
      "conv_layers：卷积层序列",
      "activation：激活函数",
    ],
    outputs: [
      "residual：残差（卷积层输出）",
      "output：最终输出（input + residual）",
      "gradient：反向传播的梯度流",
    ],
    tags: ["ResNet", "残差网络", "深度网络", "梯度流"],
    examples: [
      {
        input: "input = [H, W, 64]，经过 2 个卷积层",
        output: "output = input + conv2(conv1(input))",
        explanation: "残差连接允许梯度直接流向输入，使得深层网络更容易训练。",
      },
    ],
    heroNote: "残差连接是 ResNet 的核心，使得训练数百层的网络成为可能。",
  },
  {
    id: 10030,
    slug: "non-maximum-suppression",
    title: "非极大值抑制（NMS）",
    domain: AIDomain.VISION,
    difficulty: Difficulty.MEDIUM,
    description:
      "可视化非极大值抑制（NMS）算法如何从多个重叠的检测框中筛选出最佳结果。这是目标检测中的关键后处理步骤，用于去除冗余检测框。",
    learningGoals: [
      "理解 NMS 算法的基本原理",
      "掌握 IoU（交并比）的计算方法",
      "理解置信度阈值和 IoU 阈值的作用",
      "观察 NMS 如何去除重复检测",
    ],
    inputs: [
      "boxes：检测框列表，每个框包含 [x1, y1, x2, y2]",
      "scores：每个检测框的置信度分数",
      "iou_threshold：IoU 阈值，超过此值的框会被抑制",
      "score_threshold：置信度阈值",
    ],
    outputs: [
      "selected_boxes：筛选后的检测框",
      "selected_scores：对应的置信度分数",
      "iou_matrix：所有框之间的 IoU 矩阵",
    ],
    tags: ["目标检测", "NMS", "后处理", "YOLO", "R-CNN"],
    examples: [
      {
        input:
          "boxes = [[10,10,50,50], [12,12,52,52], [100,100,150,150]], scores = [0.9, 0.8, 0.7], iou_threshold = 0.5",
        output: "selected_boxes = [[10,10,50,50], [100,100,150,150]]",
        explanation:
          "前两个框 IoU 超过阈值，保留置信度更高的第一个框，第三个框独立保留。",
      },
    ],
    heroNote: "NMS 是目标检测算法中不可或缺的后处理步骤。",
  },
  {
    id: 10031,
    slug: "roi-pooling",
    title: "ROI Pooling",
    domain: AIDomain.VISION,
    difficulty: Difficulty.HARD,
    description:
      "展示 ROI Pooling 如何将不同尺寸的感兴趣区域（Region of Interest）统一转换为固定尺寸的特征图。对于尺寸为 $W_{roi} \\times H_{roi}$ 的 ROI，将其划分为 $pool_w \\times pool_h$ 个 bin，每个 bin 执行最大池化：$y_{i,j} = \\max_{(r,c) \\in bin_{i,j}} f(r,c)$。这是 Faster R-CNN 系列算法的关键组件。",
    learningGoals: [
      "理解 ROI Pooling 的目的：将任意尺寸 ROI 映射为固定尺寸 $pool_h \\times pool_w$",
      "掌握 bin 区域划分：$bin_w = W_{roi} / pool_w$，$bin_h = H_{roi} / pool_h$",
      "理解最大池化如何在每个 bin 内提取最显著特征",
      "观察 ROI Pooling 如何使检测网络处理多尺度目标",
    ],
    inputs: [
      "feature_map：骨干网络输出的特征图，形状为 $[H, W, C]$",
      "rois：感兴趣区域列表，每个 ROI 为特征图坐标系下的 $[x_1, y_1, x_2, y_2]$",
      "pool_size：目标池化尺寸，如 $7 \\times 7$",
    ],
    outputs: [
      "pooled_features：池化后的固定尺寸特征，形状为 $[N_{roi}, pool_h, pool_w, C]$",
      "bin_map：每个 bin 对应的特征图区域映射",
    ],
    tags: ["目标检测", "R-CNN", "ROI", "特征提取"],
    examples: [
      {
        input:
          "feature_map = $[8, 8, 256]$，rois = [[1,1,4,4], [3,3,7,7]]，pool_size = $3 \\times 3$",
        output: "pooled_features = $[2, 3, 3, 256]$",
        explanation:
          "将每个 ROI 划分为 $3 \\times 3$ 的 bin 网格，每个 bin 宽高 $= W_{roi}/3$，对每个 bin 区域执行 $\\max$ 池化得到固定尺寸特征。",
      },
    ],
    heroNote: "ROI Pooling 解耦了检测框尺寸与后续分类网络，使 Faster R-CNN 能高效处理多尺度目标。",
  },
  {
    id: 10032,
    slug: "anchor-boxes",
    title: "锚框（Anchor Boxes）",
    domain: AIDomain.VISION,
    difficulty: Difficulty.MEDIUM,
    description:
      "可视化锚框（Anchor Boxes）如何在特征图的每个位置生成多种候选框。对于尺度 $s$ 和宽高比 $r$，锚框面积 $A = (s \\cdot \\text{stride})^2$，宽高分别为 $w = \\sqrt{A \\cdot r}$，$h = \\sqrt{A / r}$。每个位置生成 $|\\text{scales}| \\times |\\text{ratios}|$ 个锚框，是 YOLO、SSD、Faster R-CNN 的核心机制。",
    learningGoals: [
      "理解锚框的生成公式：面积 $A=(s \\cdot \\text{stride})^2$，宽 $w=\\sqrt{Ar}$，高 $h=\\sqrt{A/r}$",
      "掌握特征图每格中心点到原图坐标的映射：$c_x = (j+0.5)\\cdot\\text{stride}$",
      "理解总锚框数 $= H \\times W \\times |\\text{scales}| \\times |\\text{ratios}|$",
      "观察不同尺度和宽高比的锚框如何覆盖多样化目标",
    ],
    inputs: [
      "feature_map_size：特征图尺寸 $[H, W]$",
      "anchor_scales：尺度列表，如 $[1, 2]$",
      "anchor_ratios：宽高比列表，如 $[0.5, 1.0, 2.0]$",
      "stride：特征图相对原图的步长",
    ],
    outputs: [
      "anchor_boxes：所有位置锚框，共 $H \\times W \\times K$ 个（$K = |\\text{scales}| \\times |\\text{ratios}|$）",
      "matched_boxes：与真实目标 IoU 超过阈值的正样本锚框",
    ],
    tags: ["目标检测", "YOLO", "SSD", "锚框", "单阶段检测"],
    examples: [
      {
        input:
          "feature_map_size = $[4, 4]$，scales = $[1, 2]$，ratios = $[0.5, 1, 2]$，stride = 16",
        output: "anchor_boxes = $4 \\times 4 \\times 6 = 96$ 个锚框",
        explanation:
          "每格生成 $2 \\times 3 = 6$ 个锚框，特征图共 16 格，总计 96 个候选框，覆盖 $64 \\times 64$ 原图的各种目标。",
      },
    ],
    heroNote: "锚框机制将目标检测转化为分类+回归问题，使单阶段检测器能高效覆盖多尺度目标。",
  },
  {
    id: 10033,
    slug: "semantic-segmentation",
    title: "语义分割",
    domain: AIDomain.VISION,
    difficulty: Difficulty.HARD,
    description:
      "展示语义分割如何对图像中每个像素进行分类。基于 U-Net 编码器-解码器架构：编码器逐层下采样提取语义特征，解码器通过上采样 $F_{up} = F_{low}\\uparrow_s + F_{skip}$ 恢复分辨率，最终 Softmax 输出每像素类别概率 $p(c|x_{i,j})$，实现像素级分类。",
    learningGoals: [
      "理解语义分割与图像分类的区别：输出为与输入同尺寸的像素级标注图",
      "掌握编码器下采样（提取语义）与解码器上采样（恢复分辨率）的过程",
      "理解跳跃连接 $F_{skip}$ 如何将编码器细节补充到解码器",
      "观察 Softmax 如何将特征图转化为像素级概率分布 $\\hat{y}_{i,j} = \\arg\\max_c\\, p(c|x_{i,j})$",
    ],
    inputs: [
      "image：输入图像，形状为 $[H, W, 3]$",
      "model：编码器-解码器分割模型（U-Net / FCN）",
    ],
    outputs: [
      "feature_maps：编码器各层特征 $\\{F_1, F_2, \\ldots\\}$",
      "upsampled：解码器上采样后的特征图",
      "segmentation_mask：像素级分类结果，形状为 $[H, W, C]$，$C$ 为类别数",
    ],
    tags: ["语义分割", "FCN", "U-Net", "像素级分类"],
    examples: [
      {
        input: "image = $8 \\times 8$ RGB 图像，包含人物、车辆、建筑、植被、背景共 5 类",
        output: "segmentation_mask = $8 \\times 8$，每像素属于 5 类之一",
        explanation:
          "编码器将 $8 \\times 8$ 压缩至 $2 \\times 2$ 提取语义，解码器逐步恢复至 $8 \\times 8$，跳跃连接融合细节，Softmax 输出像素级类别标注。",
      },
    ],
    heroNote:
      "语义分割广泛应用于自动驾驶、医学影像分析等场景，U-Net 的跳跃连接是实现高精度分割的关键。",
  },
  {
    id: 10034,
    slug: "feature-pyramid-network",
    title: "特征金字塔网络（FPN）",
    domain: AIDomain.VISION,
    difficulty: Difficulty.HARD,
    description:
      "可视化特征金字塔网络（FPN）如何融合不同尺度的特征。骨干网络自底向上提取 C2~C5，FPN 自顶向下通过横向连接（1×1 卷积统一通道为 256）和上采样融合：$P_i = \\text{Conv}_{1\\times1}(C_i) + \\text{Upsample}(P_{i+1})$，使低层特征兼具语义；最终输出 P2~P6 供各尺度检测头使用。",
    learningGoals: [
      "理解自底向上路径：骨干网络 C2~C5，分辨率依次减半，通道依次翻倍",
      "掌握横向连接：$\\text{Conv}_{1\\times1}(C_i)$ 将通道统一为 256",
      "理解自顶向下融合：$P_i = L_i + \\text{Upsample}(P_{i+1})$",
      "观察 P2（大分辨率）检测小目标、P5（低分辨率）检测大目标的多尺度机制",
    ],
    inputs: ["backbone_features：骨干网络特征 $[C_2, C_3, C_4, C_5]$，分辨率比为 4:2:1:1/2"],
    outputs: [
      "lateral_features：横向连接后特征 $[L_2, L_3, L_4, L_5]$，均为 256 通道",
      "fpn_features：融合后的金字塔 $[P_2, P_3, P_4, P_5, P_6]$",
    ],
    tags: ["FPN", "多尺度", "目标检测", "特征融合"],
    examples: [
      {
        input: "backbone_features：$[8\\times8\\times256,\\, 4\\times4\\times512,\\, 2\\times2\\times1024,\\, 1\\times1\\times2048]$",
        output: "fpn_features：$P_2\\sim P_6$ 均为 256 通道，分辨率从 $8\\times8$ 到 $1\\times1$",
        explanation:
          "P5 由 C5 直接 $1\\times1$ 卷积得到，P4 = $\\text{Conv}_{1\\times1}(C_4)$ + $\\text{Upsample}(P_5)$，以此类推；P6 由 P5 下采样生成，全程通道固定为 256。",
      },
    ],
    heroNote:
      "FPN 是现代目标检测系统（Mask R-CNN、RetinaNet 等）的标准组件，自顶向下路径赋予低层特征强语义，显著提升多尺度检测性能。",
  },
];
