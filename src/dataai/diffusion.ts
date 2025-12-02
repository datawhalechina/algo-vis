import { Difficulty } from "@/types";
import { AIProblem, AIDomain } from "@/types/ai";

/**
 * Diffusion（扩散模型）题目数据
 * 覆盖经典 DDPM/DDIM 理论与热门 LDM、ControlNet 实践
 */
export const diffusionProblems: AIProblem[] = [
  {
    id: 10111,
    slug: "ddpm-forward-reverse",
    title: "DDPM 正/反向过程剖析",
    domain: AIDomain.DIFFUSION,
    difficulty: Difficulty.EASY,
    description:
      "通过动画展示 Denoising Diffusion Probabilistic Model 的前向加噪与反向去噪链路，帮助理解马尔可夫链与噪声调度的关系。",
    learningGoals: [
      "掌握前向过程 q(x_t | x_{t-1}) 的高斯形式",
      "理解反向过程与噪声预测网络的联系",
      "观察不同时刻 t 的噪声程度与信息保留",
      "区分 β 调度对去噪难度的影响",
    ],
    inputs: [
      "beta_schedule：线性 / 余弦 / 自定义",
      "timesteps：扩散步数",
      "sample_image：待加噪图片",
    ],
    outputs: [
      "forward_frames：正向加噪序列",
      "reverse_frames：反向去噪重建",
      "signal_to_noise_plot：SNR 变化曲线",
    ],
    tags: ["DDPM", "扩散过程", "可视化"],
    examples: [
      {
        input: "timesteps = 1000, beta_schedule = linear",
        output: "信噪比随 t 线性下降",
        explanation: "经典 DDPM 设定中 β_t 缓慢增加，确保渐进加噪。",
      },
    ],
    heroNote: "理解正反过程是掌握扩散模型的第一步，决定了采样直觉。",
  },
  {
    id: 10112,
    slug: "noise-schedule-lab",
    title: "噪声调度实验室",
    domain: AIDomain.DIFFUSION,
    difficulty: Difficulty.MEDIUM,
    description:
      "对比不同 β/α 调度（线性、余弦、指数）在收敛速度、FID、NFE 上的表现，提供交互式参数扫描与可视化。",
    learningGoals: [
      "理解噪声调度对训练稳定性的影响",
      "掌握余弦调度带来的高频保留优势",
      "分析加速采样与质量之间的折中",
      "结合 FID/PSNR 指标评估调度优劣",
    ],
    inputs: [
      "schedule_type：linear/cosine/exp",
      "timesteps：扩散步长",
      "eval_metric：FID / PSNR",
    ],
    outputs: [
      "schedule_curve：β_t / α_t 图像",
      "metric_table：指标对比",
      "optimal_config：最优调度推荐",
    ],
    tags: ["噪声调度", "训练稳定性", "指标对比"],
    examples: [
      {
        input: "schedule_type = cosine, timesteps = 4000",
        output: "FID ↓ 0.8",
        explanation: "余弦调度在同等 NFE 下往往取得更低 FID。",
      },
    ],
    heroNote: "调度选择决定扩散模型的收敛速度，是参数调优的高频问题。",
  },
  {
    id: 10113,
    slug: "ddim-sampler-comparison",
    title: "DDIM 采样器对比",
    domain: AIDomain.DIFFUSION,
    difficulty: Difficulty.MEDIUM,
    description:
      "实现 DDIM / DPM++ / Heun 等常见采样器，支持设置采样步数、Eta、跳步策略，展示速度与质量差异。",
    learningGoals: [
      "理解确定性采样（DDIM）的推导",
      "掌握常见采样器的参数意义",
      "观察少步采样下的质量劣化模式",
      "结合曲线分析 NFE 与 FID 的 trade-off",
    ],
    inputs: [
      "sampler：ddim / dpmpp / heun / euler",
      "steps：采样步数",
      "eta：随机性控制参数",
    ],
    outputs: [
      "sampling_video：逐步生成画面",
      "quality_metrics：FID / CLIP score",
      "nfe_breakdown：推理耗时统计",
    ],
    tags: ["DDIM", "采样器", "推理加速"],
    examples: [
      {
        input: "sampler = ddim, steps = 20",
        output: "FID = 11.2",
        explanation: "少步采样仍保持合理质量，展示 DDIM 的确定性优势。",
      },
    ],
    heroNote: "采样策略决定推理体验，是 Diffusion 工程优化的主战场。",
  },
  {
    id: 10114,
    slug: "classifier-free-guidance",
    title: "CFG 引导系数调参",
    domain: AIDomain.DIFFUSION,
    difficulty: Difficulty.MEDIUM,
    description:
      "结合文本到图像任务，展示 Classifier-Free Guidance 系数对细节、色彩、构图的影响，并提供自动寻找最佳 CFG 的策略。",
    learningGoals: [
      "理解无分类器引导的条件/无条件分支",
      "掌握 guidance scale 对噪声预测的调整公式",
      "观察过高 CFG 带来的曝光/裁剪问题",
      "利用网格搜索或二分法快速定位最佳 CFG",
    ],
    inputs: [
      "prompt：文本提示词",
      "negative_prompt：反向提示",
      "guidance_scale：CFG 系数",
    ],
    outputs: [
      "grid_gallery：不同 CFG 生成结果",
      "cfg_curve：评分 vs scale",
      "recommendation：建议数值",
    ],
    tags: ["CFG", "文生图", "参数调优"],
    examples: [
      {
        input: "guidance_scale = [3,7,11]",
        output: "scale=7 评分最高",
        explanation: "中等 CFG 往往兼顾细节与全局构图。",
      },
    ],
    heroNote: "CFG 是 Stable Diffusion 调参的首要旋钮，直接影响创作体验。",
  },
  {
    id: 10115,
    slug: "latent-diffusion-unet",
    title: "Latent Diffusion U-Net 拆解",
    domain: AIDomain.DIFFUSION,
    difficulty: Difficulty.HARD,
    description:
      "分析 Latent Diffusion U-Net 的多分辨率结构、Cross-Attention 插槽与时间嵌入，帮助理解 why LDM 更高效。",
    learningGoals: [
      "掌握在 VAE latent 空间进行扩散的优势",
      "理解 UNet 的 downsample/upsample 对称结构",
      "观察 Cross-Attention 注入文本特征的路径",
      "分析内存占用与速度收益",
    ],
    inputs: [
      "latent_shape：潜空间尺寸",
      "cross_attention_heads：注意力头数",
      "channels_per_stage：各 stage 通道数",
    ],
    outputs: [
      "unet_diagram：网络拓扑图",
      "memory_profile：显存统计",
      "attention_hotspots：跨模态对齐可视化",
    ],
    tags: ["Latent Diffusion", "UNet", "Cross Attention"],
    examples: [
      {
        input: "latent_shape = 64x64",
        output: "显存占用下降 75%",
        explanation: "在 1/8 尺寸 latent 上扩散，大幅降低计算量。",
      },
    ],
    heroNote: "LDM 结构是 SD/SDXL 的核心，了解其 UNet 设计有助于插件开发。",
  },
  {
    id: 10116,
    slug: "controlnet-conditioning",
    title: "ControlNet 条件控制",
    domain: AIDomain.DIFFUSION,
    difficulty: Difficulty.HARD,
    description:
      "构建 ControlNet 框架，演示 Canny / Depth / Pose 等条件输入如何影响生成效果，并支持多条件叠加。",
    learningGoals: [
      "理解主干 UNet 与 ControlNet 的权重共享方式",
      "掌握条件编码插入位置（Down/Up/Skip）",
      "评估不同条件对一致性的贡献",
      "探索多 Control 信号融合策略",
    ],
    inputs: [
      "conditioning_type：canny/depth/pose/normals",
      "conditioning_strength：控制权重",
      "multi_condition：条件组合",
    ],
    outputs: [
      "controlled_results：受控生成图",
      "residual_maps：控制残差可视化",
      "consistency_metrics：姿态 / 边界一致性指标",
    ],
    tags: ["ControlNet", "条件扩散", "多模态"],
    examples: [
      {
        input: "conditioning_type = pose, strength = 1.2",
        output: "姿态保持率 0.93",
        explanation: "较高强度可确保骨架一致，但过高会损失细节。",
      },
    ],
    heroNote: "ControlNet 让扩散模型具备可控性，是 AIGC 产品的爆款特性。",
  },
  {
    id: 10117,
    slug: "consistency-distillation",
    title: "Consistency / SDS 蒸馏",
    domain: AIDomain.DIFFUSION,
    difficulty: Difficulty.HARD,
    description:
      "实现 Consistency Model / Score Distillation Sampling，将多步扩散蒸馏为一步生成或 3D 监督，展示训练曲线与质量对比。",
    learningGoals: [
      "理解 score distillation loss 的来源",
      "掌握单步生成网络的训练流程",
      "观察蒸馏后速度提升与质量损失",
      "分析 3D 资产生成中的 SDS 作用",
    ],
    inputs: [
      "teacher_sampler：ddpm / ddim",
      "student_steps：目标推理步数",
      "distillation_loss：consistency / sds",
    ],
    outputs: [
      "speedup_metrics：推理速度对比",
      "quality_gap：蒸馏前后 FID 差值",
      "training_curve：损失下降趋势",
    ],
    tags: ["Consistency Model", "蒸馏", "3D 生成"],
    examples: [
      {
        input: "student_steps = 1",
        output: "速度提升 20×",
        explanation: "一步模型大幅降低 NFE，但需蒸馏保持质量。",
      },
    ],
    heroNote: "Consistency / SDS 是 2023-2024 扩散提速与 3D 生成的热点话题。",
  },
  {
    id: 10118,
    slug: "text-to-image-production-pipeline",
    title: "文生图生产级流水线",
    domain: AIDomain.DIFFUSION,
    difficulty: Difficulty.HARD,
    description:
      "串联 Prompt 工程、LORA/LoRA、负面提示库、后处理（ESRGAN/FaceFix），构建企业级文生图流水线并量化吞吐与成本。",
    learningGoals: [
      "理解 Prompt + Negative Prompt 模板化管理",
      "掌握 LoRA/ControlNet 的加载与调权",
      "评估多 GPU 并行与批处理策略",
      "制定质量评估（A/B test、审计）流程",
    ],
    inputs: [
      "prompt_pack：提示模板集合",
      "lora_list：增量 LoRA 配置",
      "batch_size：推理批大小",
      "post_process：upscale / facetune",
    ],
    outputs: [
      "throughput_stats：QPS 与成本曲线",
      "quality_dashboard：评分与审查结果",
      "ops_checklist：上线巡检清单",
    ],
    tags: ["生产部署", "LoRA", "AIGC 工程"],
    examples: [
      {
        input: "batch_size = 8, gpu = A100",
        output: "QPS ≈ 2.6, 成本 0.04 USD/图",
        explanation: "基于 40 NFE 推理的参考吞吐，含后处理耗时。",
      },
    ],
    heroNote:
      "生产级流水线是各家 AIGC 产品落地的关键指标，涵盖全链路工程问题。",
  },
];
