import type { GuidedLessonSeed } from "../guidedLessonTypes.ts";

export const diffusionLessonBlueprints: GuidedLessonSeed[] = [
  {
    id: 10111,
    title: "DDPM 正/反向过程剖析",
    intuition:
      "前向过程像把一张照片分很多次撒上细沙，直到只剩随机噪声；训练时网络看到某个 xₜ，要估计它相对原图 x₀ 累计混入的整份噪声，采样时再据此一步步还原图像。",
    formula:
      "q(x_t\\mid x_0)=\\mathcal N\\!\\left(\\sqrt{\\bar\\alpha_t}x_0,(1-\\bar\\alpha_t)I\\right),\\qquad \\hat x_0=\\frac{x_t-\\sqrt{1-\\bar\\alpha_t}\\,\\epsilon_\\theta(x_t,t)}{\\sqrt{\\bar\\alpha_t}}",
    symbols: [
      { symbol: "x_0", meaning: "未加噪的原始样本" },
      { symbol: "x_t", meaning: "扩散到第 t 步的带噪样本" },
      {
        symbol: "\\bar\\alpha_t=\\prod_{s=1}^{t}(1-\\beta_s)",
        meaning: "截至第 t 步累计保留下来的信号比例",
      },
      {
        symbol: "\\epsilon_\\theta(x_t,t)",
        meaning: "网络预测的 x_t 相对 x_0 的累计标准化噪声",
      },
    ],
    flow: ["从干净样本取 x₀", "按累计系数一次采到 xₜ", "预测 xₜ 相对 x₀ 的累计噪声", "据此逐步还原干净样本"],
    misconception:
      "epsilon_theta 预测的不是最后一小步 beta_t 新加的噪声，也不是把随机过程原样倒放；在这组闭式公式里，它对应 xₜ 相对 x₀ 的累计噪声。",
    debugTip:
      "固定一个 x₀ 和 t，打印采样噪声的均值、标准差以及 xₜ 的经验方差，并逐时刻记录噪声预测 MSE；方差不符先检查 bar-alpha 的累计乘积。",
    takeaway: "DDPM 用可直接采样的前向加噪过程，训练出能够逐步估计噪声的反向过程。",
  },
  {
    id: 10112,
    title: "噪声调度实验室",
    intuition:
      "噪声调度像安排每节课擦掉多少黑板内容：擦得太急，模型来不及辨认；擦得太慢，又会浪费许多几乎没有变化的步骤。",
    formula:
      "\\alpha_t=1-\\beta_t,\\qquad \\bar\\alpha_t=\\prod_{s=1}^{t}\\alpha_s,\\qquad \\operatorname{SNR}(t)=\\frac{\\bar\\alpha_t}{1-\\bar\\alpha_t}",
    symbols: [
      { symbol: "\\beta_t", meaning: "第 t 步新加入的噪声方差" },
      { symbol: "\\alpha_t", meaning: "第 t 步保留信号的比例" },
      { symbol: "\\bar\\alpha_t", meaning: "从起点到第 t 步累计保留的信号比例" },
      { symbol: "\\operatorname{SNR}(t)", meaning: "第 t 步的信噪比" },
    ],
    flow: [
      "为每种候选调度生成 β、bar-alpha 与 SNR",
      "分别按对应前向过程训练模型，或执行经过验证的兼容适配",
      "保持数据、更新次数与训练计算量一致",
      "固定采样器、seed，并按相同 NFE 生成",
      "汇总 FID/PSNR、耗时与稳定性",
    ],
    misconception:
      "线性调度只表示 β 随时间线性变化，不代表 SNR 线性下降；也不能给同一个未适配模型直接换训练调度，就把质量差异归因于调度。",
    debugTip:
      "逐步打印 βₜ、bar-alphaₜ 和 SNR，断言 0<βₜ<1、bar-alpha 单调下降且没有 NaN；比较实验还要核对各调度的训练更新数、实际 NFE、seed 和评估样本完全对齐。",
    takeaway: "公平比较噪声调度，需要匹配各自的训练前向过程，并在相同训练量和 NFE 下评估累计 SNR 与生成质量。",
  },
  {
    id: 10113,
    title: "DDIM 采样器对比",
    intuition:
      "采样器像选择不同的路线和步法从噪声走回图像：DDIM 可按少量路标跳步，DPM++、Heun 与 Euler 则用不同数值更新；只有给它们相同的模型调用预算，速度和质量才可公平比较。",
    formula:
      "x_s=\\sqrt{\\bar\\alpha_s}\\,\\hat x_0+\\sqrt{1-\\bar\\alpha_s-\\sigma_{t\\to s}^2}\\,\\epsilon_\\theta(x_t,t)+\\sigma_{t\\to s}z,\\qquad \\sigma_{t\\to s}=\\eta\\sqrt{\\frac{1-\\bar\\alpha_s}{1-\\bar\\alpha_t}}\\sqrt{1-\\frac{\\bar\\alpha_t}{\\bar\\alpha_s}},\\quad s<t",
    symbols: [
      { symbol: "\\hat x_0", meaning: "由当前带噪样本估计的干净样本" },
      { symbol: "\\eta", meaning: "DDIM 采样中额外随机性的控制系数" },
      { symbol: "s", meaning: "采样序列中 t 之后选定的更早时刻，不要求等于 t-1" },
      { symbol: "\\sigma_{t\\to s}", meaning: "从 t 跳到上一选定时刻 s 时注入的噪声尺度" },
      { symbol: "z\\sim\\mathcal N(0,I)", meaning: "采样步骤中新加入的标准高斯噪声" },
    ],
    flow: [
      "固定模型、提示词、seed 与初始噪声",
      "为 DDIM、DPM++、Heun、Euler 建立独立分支",
      "按相同 NFE 预算执行各分支的 t→s 更新",
      "记录实际 U-Net 调用数与端到端耗时",
      "在同一批样本上比较 FID、CLIP score 与伪影",
    ],
    misconception:
      "采样步数不一定等于 NFE，例如 Heun 的一步可能调用网络两次；DDIM 跳步也必须使用上一选定时刻 s 的累计 alpha，而不是默认相邻的 t-1。",
    debugTip:
      "每个分支逐步记录 t、s、x₀ 估计范围、根号项和累计 NFE，断言数值有效；再核对相同预算下的实际调用数、计时区间和评估样本 ID，eta=0 的 DDIM 同 seed 应可复现。",
    takeaway: "采样器对比必须分支执行并统一 NFE 与输入，再共同报告耗时和质量，才能判断不同更新规则的真实取舍。",
  },
  {
    id: 10114,
    title: "CFG 引导系数调参",
    intuition:
      "模型先给出一份不看提示词的普通去噪意见，再看提示词给出有条件意见；CFG 把两者的差异当作朝提示词方向的推力。",
    formula:
      "\\epsilon_{\\mathrm{cfg}}=\\epsilon_{\\mathrm{uncond}}+s\\left(\\epsilon_{\\mathrm{cond}}-\\epsilon_{\\mathrm{uncond}}\\right)",
    symbols: [
      { symbol: "\\epsilon_{\\mathrm{cond}}", meaning: "使用文本条件得到的噪声预测" },
      { symbol: "\\epsilon_{\\mathrm{uncond}}", meaning: "空条件或负面条件分支的噪声预测" },
      { symbol: "s", meaning: "guidance scale，引导差分的放大倍数" },
      { symbol: "\\epsilon_{\\mathrm{cfg}}", meaning: "最终用于采样更新的引导噪声" },
    ],
    flow: [
      "固定提示词、seed 与同一初始 latent",
      "建立一组候选 guidance scale",
      "每个 scale 都完成条件/无条件预测与整段采样",
      "评价文本一致性、自然度与饱和/裁切伪影",
      "综合评分选择工作点并用额外 seed 复核",
    ],
    misconception:
      "guidance scale 不是提示词正确率，也不是越大越好；过度外推会放大饱和、轮廓破碎和构图裁切。",
    debugTip:
      "确认 scale 扫描复用同一 seed 和初始 latent，逐项保存两分支预测范数、CFG 后范数、评分与伪影标记；若 scale 改变却结果不变，检查条件批次拼接和分支切片。",
    takeaway: "CFG 调参要在固定输入上扫描 scale、生成并评价结果，再选择兼顾文本一致性和自然度的工作点。",
  },
  {
    id: 10115,
    title: "Latent Diffusion U-Net 拆解",
    intuition:
      "LDM 先把大图压成一张小而浓缩的特征地图，再让 U-Net 在不同分辨率上反复看全局轮廓和局部细节，文本通过交叉注意力参与每次判断。",
    formula:
      "z_0=E(x),\\qquad z_t=\\sqrt{\\bar\\alpha_t}z_0+\\sqrt{1-\\bar\\alpha_t}\\epsilon,\\qquad \\mathcal L=\\mathbb E\\!\\left[\\lVert\\epsilon-\\epsilon_\\theta(z_t,t,c)\\rVert_2^2\\right]",
    symbols: [
      { symbol: "E(x)", meaning: "VAE 编码器把图像压缩得到的 latent" },
      { symbol: "z_t", meaning: "latent 空间第 t 步的带噪表示" },
      { symbol: "c", meaning: "通过交叉注意力注入的文本条件" },
      { symbol: "\\epsilon_\\theta", meaning: "多分辨率 U-Net 的噪声预测" },
    ],
    flow: [
      "训练时 VAE 编码图像，采样时准备噪声 latent",
      "每个时刻在 down 模块降采样并执行文本交叉注意力",
      "在 mid 模块用交叉注意力融合最低分辨率语义与文本",
      "在 up 模块合并跳跃特征并再次执行交叉注意力",
      "沿多个时刻重复 U-Net 预测与采样更新直到 z₀",
      "只把最终去噪 latent 交给 VAE 解码",
    ],
    misconception:
      "latent 空间更小不等于模型只生成缩略图；最终分辨率由 VAE 解码器恢复，而压缩过强才会真正丢失细节。",
    debugTip:
      "给 down、mid、skip、up 模块挂 shape hook，逐层核对尺寸，并确认预期模块都收到文本交叉注意力；再记录每个采样时刻的 latent 与 U-Net 调用次数，确保 VAE 只在循环结束后解码一次。",
    takeaway: "Latent Diffusion 在压缩空间反复运行带多尺度文本交叉注意力的 U-Net，全部去噪完成后才用 VAE 恢复图像。",
  },
  {
    id: 10116,
    title: "ControlNet 条件控制",
    intuition:
      "主 U-Net 像已经会画画的画师，ControlNet 像铺在旁边的描图纸；边缘、深度或姿态被变成逐层提示，通过起初为零的接口轻推画师而不破坏原能力。",
    formula:
      "h_\\ell'=h_\\ell^{\\mathrm{base}}(z_t,t,c_{\\mathrm{text}})+s\\,r_\\ell(z_t,t,c_{\\mathrm{text}},c_{\\mathrm{ctrl}}),\\qquad r_\\ell=\\operatorname{ZeroConv}_\\ell\\!\\left(C_\\ell(z_t,t,c_{\\mathrm{text}},c_{\\mathrm{ctrl}})\\right)",
    symbols: [
      { symbol: "h_\\ell^{\\mathrm{base}}", meaning: "冻结主干 U-Net 在第 ell 层的特征" },
      { symbol: "z_t,t", meaning: "当前带噪 latent 与扩散时刻" },
      { symbol: "c_{\\mathrm{text}}", meaning: "文本条件" },
      { symbol: "c_{\\mathrm{ctrl}}", meaning: "边缘、深度或姿态等空间控制条件" },
      { symbol: "r_\\ell", meaning: "ControlNet 在第 ell 层输出的控制残差" },
      { symbol: "s", meaning: "conditioning strength，控制残差的缩放系数" },
    ],
    flow: ["预处理空间控制条件", "条件分支同时接收 zₜ、时刻、文本与控制条件", "提取多尺度特征并经零卷积产生残差", "残差注入冻结主干", "按条件一致性评估输出"],
    misconception:
      "ControlNet 不是持续与主干共享同一组可训练权重；它从预训练权重复制出可训练分支，同时保留冻结主干来守住原生成能力。",
    debugTip:
      "训练开始前逐层检查 ZeroConv 输出范数应接近 0，随后记录各层 residual norm 与主干特征 shape；strength=0 的结果应与原主干在同一 seed 下吻合。",
    takeaway: "ControlNet 通过多尺度残差把空间条件接入冻结扩散主干，从而兼顾可控性与原模型能力。",
  },
  {
    id: 10117,
    title: "Consistency / SDS 蒸馏",
    intuition:
      "一致性蒸馏教学生从不同噪声高度都直接认出同一个终点；SDS 则把扩散模型当作评审，把它的去噪意见变成更新 3D 场景的方向。",
    formula:
      "\\mathcal L_{\\mathrm{CM}}=\\mathbb E\\!\\left[d\\!\\left(f_\\theta(x_t,t),\\operatorname{sg}(f_{\\bar\\theta}(x_s,s))\\right)\\right],\\qquad \\nabla_\\phi\\mathcal L_{\\mathrm{SDS}}=\\mathbb E\\!\\left[w(t)(\\epsilon_\\theta(x_t;y,t)-\\epsilon)\\frac{\\partial x}{\\partial\\phi}\\right]",
    symbols: [
      { symbol: "f_\\theta", meaning: "把任意噪声时刻映射到一致结果的学生模型" },
      { symbol: "f_{\\bar\\theta}", meaning: "停止梯度的教师或 EMA 目标模型" },
      { symbol: "\\phi", meaning: "SDS 中待优化的 3D 表示或渲染参数" },
      { symbol: "w(t)", meaning: "不同噪声时刻的 SDS 梯度权重" },
    ],
    flow: ["采样时间与共享噪声", "教师给出去噪方向", "构造一致性目标或 SDS 梯度", "只更新学生或场景参数", "比较速度与质量差距"],
    misconception:
      "Consistency loss 和 SDS 不是同一个目标：前者训练快速生成模型保持跨时刻一致，后者通常用冻结扩散先验优化另一个可微表示。",
    debugTip:
      "确认教师输出已 stop-gradient，并打印成对时刻的预测距离；做 SDS 时分别记录噪声残差范数、w(t) 和渲染参数梯度范数，定位极端 t 导致的梯度爆炸。",
    takeaway: "两类方法都借用教师的去噪知识，但一致性蒸馏优化学生输出，SDS 优化外部可微对象。",
  },
  {
    id: 10118,
    title: "文生图生产级流水线",
    intuition:
      "生产文生图不是只调用一次模型，而是一条可计量的装配线：提示模板、模型插件、批量采样、质量门禁和后处理都要留下配置与耗时。",
    formula:
      "\\operatorname{Throughput}_{\\mathrm{image}}=\\frac{B}{T_{\\mathrm{batch}}}\\;[\\mathrm{images/s}],\\qquad C_{\\mathrm{image}}=\\frac{C_{\\mathrm{gpu}}T_{\\mathrm{batch}}}{3600B}+C_{\\mathrm{post}}",
    symbols: [
      { symbol: "B", meaning: "一次推理批次实际产出的图像数" },
      { symbol: "T_{\\mathrm{batch}}", meaning: "该批次从采样到返回的总秒数" },
      { symbol: "C_{\\mathrm{gpu}}", meaning: "GPU 每小时成本" },
      { symbol: "C_{\\mathrm{post}}", meaning: "单图审核、放大与修复的后处理成本" },
    ],
    flow: ["规范化正负提示词", "加载并记录 LoRA 与控制参数", "批量执行扩散采样", "运行审核和图像后处理", "汇总质量、吞吐与成本"],
    misconception:
      "这里的 B 是图像数，所以 B/T_batch 是图像吞吐而不是请求 QPS；把 batch size 加倍也不保证 images/s 加倍，其他阶段可能成为瓶颈。",
    debugTip:
      "为文本编码、每步 U-Net、VAE 解码、审核和后处理分别打点，记录 batch、seed、模型与 LoRA 哈希；用各阶段耗时重算单图成本并对照账单。",
    takeaway: "生产流水线要同时固定生成配置、分解阶段延迟，并用质量门禁约束吞吐和成本优化。",
  },
];
