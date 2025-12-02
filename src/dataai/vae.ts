import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * VAE（变分自编码器）题目数据
 * 涵盖经典重参数技巧、β-VAE 解耦、VQ-VAE 与 CVAE 应用
 */
export const vaeProblems: AIProblem[] = [
  {
    id: 10127,
    slug: "reparameterization-trick",
    title: "重参数化技巧动图",
    domain: AIDomain.VAE,
    difficulty: Difficulty.EASY,
    description:
      "通过动画展示 VAE 中 μ、σ 的采样过程，重点讲解重参数化如何允许梯度反传，配合手写数字示例。",
    learningGoals: [
      "掌握 q(z|x) 的均值/方差预测方式",
      "理解 ε ~ N(0, I) 与 z = μ + σ ⊙ ε 的关系",
      "观察梯度如何绕过采样节点",
      "对比直接采样 vs. 重参数的训练曲线",
    ],
    inputs: [
      "latent_dim：潜变量维度",
      "sigma_clip：方差裁剪范围",
      "sample_count：可视化样本数",
    ],
    outputs: [
      "sampling_animation：重参数化动图",
      "gradient_flow：梯度示意",
      "kl_components：KL 项拆解",
    ],
    tags: ["VAE", "重参数化", "基础"],
    examples: [
      {
        input: "latent_dim = 2",
        output: "潜空间可视化",
        explanation: "低维潜空间便于展示椭圆分布与采样路径。",
      },
    ],
    heroNote: "重参数化是 VAE 可训练的核心技巧，必须吃透。",
  },
  {
    id: 10128,
    slug: "beta-vae-disentanglement",
    title: "β-VAE 解耦实验",
    domain: AIDomain.VAE,
    difficulty: Difficulty.MEDIUM,
    description:
      "复现 β-VAE 在 dSprites / 3D Chairs 上的解耦实验，探索 β 参数对重构质量与解耦指标的影响。",
    learningGoals: [
      "理解 ELBO 中 β 系数的作用",
      "掌握 FactorVAE / MIG 等解耦指标",
      "观察不同 β 下的潜变量 traversal",
      "权衡解耦与重构质量的折中",
    ],
    inputs: [
      "dataset：dSprites / 3DChairs / CLEVR",
      "beta_value：KL 权重",
      "traversal_range：潜变量遍历范围",
    ],
    outputs: [
      "traversal_grid：潜变量控制图",
      "disentanglement_metrics：MIG / DCI",
      "reconstruction_loss：重构误差",
    ],
    tags: ["β-VAE", "解耦", "潜变量"],
    examples: [
      {
        input: "beta = 4",
        output: "MIG ↑, Recon ↓",
        explanation: "更大 β 强化 KL，提升解耦但损失重构质量。",
      },
    ],
    heroNote: "β-VAE 在自动驾驶/机器人中用于可控语义编码。",
  },
  {
    id: 10129,
    slug: "conditional-vae",
    title: "条件 VAE (CVAE) 生成管线",
    domain: AIDomain.VAE,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 CVAE 在手写数字/语音等条件生成任务中的流程，展示条件编码、潜变量拼接、调参技巧。",
    learningGoals: [
      "理解 p(x|z, c) 的条件依赖结构",
      "掌握条件向量与潜变量的融合方式",
      "观察条件控制对输出分布的影响",
      "评估多条件场景下的 BLEU / CER 指标",
    ],
    inputs: [
      "condition_type：one-hot / embedding",
      "latent_dim：潜空间维度",
      "condition_dropout：条件丢弃率",
    ],
    outputs: [
      "conditional_samples：条件生成结果",
      "metric_table：条件一致性指标",
      "latent_projection：按条件上色的潜空间",
    ],
    tags: ["CVAE", "条件生成", "多模态"],
    examples: [
      {
        input: "condition=数字类别 7",
        output: "生成多样化 7",
        explanation: "CVAE 通过条件向量控制类别属性。",
      },
    ],
    heroNote: "CVAE 是语音合成、推荐召回重排序中常用的条件生成模块。",
  },
  {
    id: 10130,
    slug: "vq-vae-tokenization",
    title: "VQ-VAE 码本量化",
    domain: AIDomain.VAE,
    difficulty: Difficulty.MEDIUM,
    description:
      "可视化 Vector Quantized VAE 的编码器、码本、直通估计器，比较不同码本大小对重构和离散化效果的影响。",
    learningGoals: [
      "理解连续表示到离散码的量化过程",
      "掌握 EMA 码本更新 vs. 直接梯度的差异",
      "观察码本利用率与重构 PSNR 的关系",
      "连接离散 token 与后续 Transformer 建模",
    ],
    inputs: [
      "codebook_size：码本大小",
      "commitment_beta：承诺损失",
      "ema_decay：EMA 衰减系数",
    ],
    outputs: [
      "codebook_usage：码本利用率统计",
      "reconstruction_samples：重构展示",
      "token_map：离散 token 可视化",
    ],
    tags: ["VQ-VAE", "码本", "离散表示"],
    examples: [
      {
        input: "codebook_size = 1024",
        output: "token 重复率 < 5%",
        explanation: "较大码本提升表示能力，适合与 Transformer 结合。",
      },
    ],
    heroNote: "VQ-VAE 是 ImageNet 文本化和 AudioLM 等模型的底座。",
  },
  {
    id: 10131,
    slug: "vae-importance-weighted",
    title: "IWAE 多样本估计",
    domain: AIDomain.VAE,
    difficulty: Difficulty.HARD,
    description:
      "展示 Importance Weighted Autoencoder 的多样本对 ELBO 的 tightening 效果，比较不同样本数 K 的性能。",
    learningGoals: [
      "理解 IWAE 目标函数推导",
      "掌握多样本梯度估计的实现",
      "观察 K 对训练稳定性与时间的影响",
      "量化 IWAE vs. VAE 在复杂数据上的优势",
    ],
    inputs: [
      "num_samples：重要性样本 K",
      "encoder_arch：编码器结构",
      "dataset：CIFAR10 / CelebA",
    ],
    outputs: [
      "elbo_curve：ELBO vs K",
      "training_time：耗时统计",
      "sample_quality：生成样本比较",
    ],
    tags: ["IWAE", "重要性采样", "理论提升"],
    examples: [
      {
        input: "K = 5",
        output: "ELBO 提升 0.4 nats",
        explanation: "更多样本 tighter bound，但计算成本增加。",
      },
    ],
    heroNote: "IWAE 展示了通过重要性采样改进 VAE 下界的常见路径。",
  },
  {
    id: 10132,
    slug: "vae-anomaly-detection",
    title: "VAE 异常检测仪表板",
    domain: AIDomain.VAE,
    difficulty: Difficulty.MEDIUM,
    description:
      "利用 VAE 的重构误差与潜空间密度进行异常检测，可切换工业设备/网络流量等场景，并含阈值自动化。",
    learningGoals: [
      "掌握基于重构误差的检测流程",
      "理解潜变量分布用于异常评分",
      "观察阈值选择对召回/精度的影响",
      "结合 ROC/PR 曲线调优告警策略",
    ],
    inputs: [
      "window_size：滑动窗口",
      "threshold_strategy：static/auto",
      "feature_scaling：标准化方式",
    ],
    outputs: [
      "anomaly_score_stream：时间序列",
      "roc_pr_curves：评估结果",
      "alert_report：异常样本详情",
    ],
    tags: ["异常检测", "工业场景", "可视分析"],
    examples: [
      {
        input: "threshold_strategy = auto",
        output: "F1 ↑ 8%",
        explanation: "动态阈值可适应概念漂移。",
      },
    ],
    heroNote: "VAE 在日志/设备监控中常被用作无监督异常检测器。",
  },
  {
    id: 10133,
    slug: "hierarchical-vae",
    title: "分层 VAE (HVAE)",
    domain: AIDomain.VAE,
    difficulty: Difficulty.HARD,
    description:
      "构建多层潜变量的层级 VAE，展示自顶向下生成、逐层 KL 项、跳跃连接等机制。",
    learningGoals: [
      "理解多层潜变量的联合分布",
      "掌握自顶向下/自底向上推断网络设计",
      "观察层级潜变量对长程结构的建模能力",
      "分析训练不稳定的常见陷阱与缓解方式",
    ],
    inputs: [
      "num_layers：潜变量层数",
      "skip_connections：是否使用 skip",
      "kl_weights：逐层 KL 系数",
    ],
    outputs: [
      "hierarchy_graph：层级结构示意",
      "layerwise_kl：KL 分布",
      "sample_gallery：多层采样结果",
    ],
    tags: ["HVAE", "层级潜变量", "结构建模"],
    examples: [
      {
        input: "num_layers = 3",
        output: "KL 逐层递减",
        explanation: "上层编码全局结构，下层关注细节。",
      },
    ],
    heroNote: "HVAE 适合生成长序列、段落或复杂图形结构。",
  },
  {
    id: 10134,
    slug: "vae-rl-representation",
    title: "VAE × 强化学习表示学习",
    domain: AIDomain.VAE,
    difficulty: Difficulty.HARD,
    description:
      "展示在无模型强化学习中使用 VAE 进行状态压缩的流程，结合 Dreamer/Plan2Explore 等方法。",
    learningGoals: [
      "理解通过 VAE 提取低维可控状态",
      "掌握 RSSM / World Model 中 VAE 的角色",
      "观察潜状态对策略学习样本效率的影响",
      "评估 reconstruction vs. prediction 目标组合",
    ],
    inputs: [
      "env：CartPole / Atari / DMControl",
      "latent_dim：潜空间大小",
      "predictive_loss_weight：预测损失权重",
    ],
    outputs: [
      "policy_learning_curve：奖励进展",
      "latent_rollouts：潜空间 roll-out",
      "metric_table：样本效率对比",
    ],
    tags: ["World Model", "RL 表示", "Dreamer"],
    examples: [
      {
        input: "latent_dim = 64",
        output: "样本效率提升 2×",
        explanation: "紧凑潜空间帮助策略网络更快学习。",
      },
    ],
    heroNote: "VAE + RL 在机器人、自动驾驶仿真中非常热门。",
  },
];

