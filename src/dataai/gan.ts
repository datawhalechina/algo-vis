import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * GAN（生成对抗网络）题目数据
 * 包含经典 DCGAN/WGAN 理论与 StyleGAN、DiffAug 等业界热点
 */
export const ganProblems: AIProblem[] = [
  {
    id: 10119,
    slug: "dcgan-convolution-block",
    title: "DCGAN 生成器/判别器模块",
    domain: AIDomain.GAN,
    difficulty: Difficulty.EASY,
    description:
      "拆解 DCGAN 结构，展示卷积/反卷积、批归一化、激活的堆叠方式，帮助建立最基础的 GAN 直觉。",
    learningGoals: [
      "理解随机噪声输入到图像的映射流程",
      "掌握转置卷积逐步上采样的细节",
      "观察判别器特征图的判别模式",
      "分析 BN/Dropout 对训练稳定性的作用",
    ],
    inputs: [
      "latent_dim：噪声维度",
      "feature_map_base：通道基数",
      "activation：ReLU/LeakyReLU",
    ],
    outputs: [
      "generator_layers：生成器结构图",
      "discriminator_layers：判别器结构图",
      "feature_maps：中间特征可视化",
    ],
    tags: ["DCGAN", "卷积生成器", "入门"],
    examples: [
      {
        input: "latent_dim = 100",
        output: "4 层转置卷积生成 64x64 图像",
        explanation: "经典 DCGAN 配置：4×4→8×8→16×16→32×32→64×64。",
      },
    ],
    heroNote: "DCGAN 是学习 GAN 的敲门砖，结构清晰且复现门槛低。",
  },
  {
    id: 10120,
    slug: "mode-collapse-diagnosis",
    title: "模式崩溃诊断仪",
    domain: AIDomain.GAN,
    difficulty: Difficulty.MEDIUM,
    description:
      "通过投影和统计分析检测 GAN 训练中的模式崩溃，支持输入生成样本、FID 曲线、Intra-FID 对比，并给出缓解建议。",
    learningGoals: [
      "识别模式崩溃的常见信号（多样性下降、判别器过强）",
      "理解 mini-batch 标准差、FID、IS 的综合用法",
      "掌握噪声重采样、经验回放、漂移罚等缓解技巧",
      "观察不同正则对训练曲线的影响",
    ],
    inputs: [
      "generated_samples：生成图集",
      "real_samples：真实图集",
      "metrics：FID/IS/Precision-Recall",
    ],
    outputs: [
      "collapse_heatmap：多样性热力图",
      "metric_trend：指标时间序列",
      "mitigation_suggestions：调整建议",
    ],
    tags: ["模式崩溃", "训练诊断", "稳定性"],
    examples: [
      {
        input: "FID 波动且 Intra-FID ↑",
        output: "建议使用 mini-batch std 层",
        explanation: "增加多样性约束可缓解崩溃现象。",
      },
    ],
    heroNote: "模式崩溃是 GAN 训练最常见的坑，需要工具及时诊断。",
  },
  {
    id: 10121,
    slug: "wgan-gradient-penalty",
    title: "WGAN-GP 梯度惩罚实践",
    domain: AIDomain.GAN,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 Wasserstein GAN with Gradient Penalty，展示 Lipschitz 约束的推导、插值采样、梯度范数统计与训练曲线。",
    learningGoals: [
      "理解 Wasserstein 距离在 GAN 中的优势",
      "掌握梯度惩罚项的实现细节",
      "对比权重裁剪 vs. GP 的效果差异",
      "分析训练稳定性与收敛速度",
    ],
    inputs: [
      "lambda_gp：梯度惩罚系数",
      "critic_iters：判别器迭代次数",
      "use_weight_clipping：是否启用权重裁剪",
    ],
    outputs: [
      "gradient_norm_hist：梯度范数分布",
      "wasserstein_curve：判别器输出曲线",
      "fid_progress：FID 随迭代变化",
    ],
    tags: ["WGAN", "梯度惩罚", "理论推导"],
    examples: [
      {
        input: "lambda_gp = 10",
        output: "梯度范数收敛到 1 附近",
        explanation: "梯度惩罚逼迫判别器满足 1-Lipschitz 条件。",
      },
    ],
    heroNote: "WGAN-GP 是工业界常用的稳定训练范式，需理解其数学动机。",
  },
  {
    id: 10122,
    slug: "stylegan-style-mixing",
    title: "StyleGAN 风格混合实验",
    domain: AIDomain.GAN,
    difficulty: Difficulty.HARD,
    description:
      "可视化 StyleGAN 的映射网络、风格注入与 AdaIN，支持 style mixing、truncation、层级编辑等操作。",
    learningGoals: [
      "理解映射网络 f: z→w 的作用",
      "掌握不同层风格对具体视觉属性的控制",
      "观察 style mixing 对多样性和一致性的影响",
      "分析 truncation ψ 与质量/多样性平衡",
    ],
    inputs: [
      "style_layers：注入层集合",
      "mixing_coefficient：风格插值系数",
      "truncation_psi：截断参数",
    ],
    outputs: [
      "layer_heatmap：层-属性映射",
      "style_mixing_gallery：混合结果",
      "psi_curve：质量 vs 多样性曲线",
    ],
    tags: ["StyleGAN", "风格控制", "潜空间"],
    examples: [
      {
        input: "style_layers = [8,9,10]",
        output: "仅改变面部细节",
        explanation: "后层主要负责局部细节，前层决定整体结构。",
      },
    ],
    heroNote: "StyleGAN 的风格空间是人像编辑、虚拟试衣等业务的基础设施。",
  },
  {
    id: 10123,
    slug: "cyclegan-domain-transfer",
    title: "CycleGAN 领域迁移",
    domain: AIDomain.GAN,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 CycleGAN 的循环一致性损失，展示双映射、身份损失、PatchGAN 判别器，适配无配对数据的风格迁移。",
    learningGoals: [
      "掌握循环一致性与身份损失的公式",
      "理解 PatchGAN 判别器的局部判别方式",
      "观察不同 λ 设置对保真度的影响",
      "分析常见应用（风景↔油画、季节转换）",
    ],
    inputs: [
      "lambda_cycle：循环损失权重",
      "lambda_identity：身份损失权重",
      "patch_size：判别器感受野",
    ],
    outputs: [
      "cycle_consistency_plot：重建误差",
      "translation_gallery：互换结果",
      "loss_components：各损失项曲线",
    ],
    tags: ["CycleGAN", "无配对迁移", "风格化"],
    examples: [
      {
        input: "lambda_cycle = 10",
        output: "重建 PSNR 提升",
        explanation: "较大循环权重可保持结构一致，避免模式崩塌。",
      },
    ],
    heroNote: "CycleGAN 解决无配对数据的迁移，仍在内容创意行业常用。",
  },
  {
    id: 10124,
    slug: "gan-diffaug-regularization",
    title: "DiffAug 数据增强正则",
    domain: AIDomain.GAN,
    difficulty: Difficulty.MEDIUM,
    description:
      "复现 Differentiable Augmentation (DiffAug) 对 GAN 稳定性的提升，支持配置颜色/几何/混合增强并监控梯度。",
    learningGoals: [
      "理解可微增强的实现方式",
      "掌握有限数据场景下的 GAN 正则技巧",
      "观察不同增强组合对 FID 的影响",
      "评估梯度通过增强模块的稳定性",
    ],
    inputs: [
      "augment_types：color/translation/cutout",
      "probability：增强概率",
      "dataset_size：训练样本量",
    ],
    outputs: [
      "fid_table：增强策略 vs FID",
      "gradient_flow：梯度可视化",
      "overfitting_score：判别器过拟合指标",
    ],
    tags: ["DiffAug", "小数据", "稳定训练"],
    examples: [
      {
        input: "augment_types = ['color','translation']",
        output: "FID 从 45 降到 23",
        explanation: "在 5k 数据上使用 DiffAug 显著减轻过拟合。",
      },
    ],
    heroNote: "DiffAug 是 Meta、Bytedance 等在小数据 GAN 训练的标配技巧。",
  },
  {
    id: 10125,
    slug: "biggan-truncation-trick",
    title: "BigGAN 截断技巧",
    domain: AIDomain.GAN,
    difficulty: Difficulty.HARD,
    description:
      "分析 BigGAN 中的截断技巧、类别嵌入与共享判别器结构，展示截断阈值对多样性与 Inception Score 的影响。",
    learningGoals: [
      "理解类别条件嵌入与共享架构",
      "掌握截断技巧与实时调节策略",
      "观察大批量训练对性能的提升",
      "评估 Precision-Recall 曲线随截断变化",
    ],
    inputs: [
      "truncation_threshold：采样阈值",
      "class_embedding_dim：类别嵌入维度",
      "batch_size：训练批大小",
    ],
    outputs: [
      "truncation_curve：IS vs threshold",
      "precision_recall_plot：质量/多样性曲线",
      "embedding_tsne：类别嵌入可视化",
    ],
    tags: ["BigGAN", "截断技巧", "条件GAN"],
    examples: [
      {
        input: "threshold = 0.4",
        output: "IS ↑, Recall ↓",
        explanation: "较低阈值提高质量但牺牲多样性，适合展示级场景。",
      },
    ],
    heroNote: "BigGAN 曾刷新 ImageNet 生成指标，截断技巧沿用至今。",
  },
  {
    id: 10126,
    slug: "stylegan-clip-editing",
    title: "StyleGAN + CLIP 文本引导编辑",
    domain: AIDomain.GAN,
    difficulty: Difficulty.HARD,
    description:
      "结合 StyleGAN 潜空间与 CLIP 指导，实现文本驱动的人像编辑，展示梯度下降、方向求解、局部 mask 控制。",
    learningGoals: [
      "理解 CLIP 损失如何作用于潜向量",
      "掌握 Latent Optimization、Mapper、Null-Text 等技巧",
      "观察不同文本提示对局部特征的影响",
      "比较全局 vs. 口罩编辑的质量差异",
    ],
    inputs: [
      "text_prompt：编辑指令",
      "edit_strategy：latent_opt / mapper / null-text",
      "mask_region：局部编辑区域（可选）",
    ],
    outputs: [
      "editing_sequence：迭代过程",
      "clip_score_curve：文本相似度变化",
      "artifact_detector：伪影检测结果",
    ],
    tags: ["StyleGAN", "CLIP", "编辑"],
    examples: [
      {
        input: "text_prompt = 'add futuristic neon makeup'",
        output: "10 步编辑完成",
        explanation: "CLIP 方向指引潜向量移动，实现文本一致的修改。",
      },
    ],
    heroNote: "GAN+CLIP 编辑在广告、影视、游戏素材生产中需求旺盛。",
  },
];

