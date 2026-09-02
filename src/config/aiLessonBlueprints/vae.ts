import type { GuidedLessonSeed } from "../guidedLessonTypes.ts";

export const vaeLessonBlueprints: GuidedLessonSeed[] = [
  {
    id: 10127,
    title: "重参数化技巧动图",
    intuition:
      "编码器不直接掷出一个无法求导的随机点，而是先画出分布的中心和宽度，再从固定标准噪声中取样并缩放平移；梯度因此能沿中心和宽度返回。",
    formula:
      "(\\mu_\\phi(x),\\log\\sigma_\\phi^2(x))=\\operatorname{Encoder}_\\phi(x),\\quad \\sigma_\\phi(x)=\\exp\\!\\left(\\tfrac12\\log\\sigma_\\phi^2(x)\\right),\\qquad z=\\mu_\\phi(x)+\\sigma_\\phi(x)\\odot\\epsilon,\\quad \\epsilon\\sim\\mathcal N(0,I)",
    symbols: [
      { symbol: "\\mu_\\phi(x)", meaning: "编码器预测的潜变量均值" },
      { symbol: "\\log\\sigma_\\phi^2(x)", meaning: "编码器预测的潜变量对数方差" },
      { symbol: "\\sigma_\\phi(x)", meaning: "编码器预测的潜变量标准差" },
      { symbol: "\\epsilon", meaning: "与模型参数无关的标准高斯噪声" },
      { symbol: "\\odot", meaning: "逐元素相乘" },
      { symbol: "z", meaning: "送入解码器的随机潜变量" },
    ],
    flow: ["编码输入得到 μ 与 log-variance", "把 log-variance 转成标准差", "采样独立标准噪声 ε", "缩放平移得到 z", "损失沿确定性路径反传"],
    misconception:
      "若网络输出的是 log-variance，标准差应计算为 exp(0.5·logvar)，直接使用 exp(logvar) 会把方差误当成标准差。",
    debugTip:
      "固定 μ、logvar 后大量采样 z，比较经验均值和方差是否接近 μ 与 exp(logvar)；再检查 μ、logvar 两个输出头的梯度都非零且无 NaN。",
    takeaway: "重参数化把随机性隔离到独立噪声 epsilon，使分布参数能够通过普通反向传播学习。",
  },
  {
    id: 10128,
    title: "β-VAE 解耦实验",
    intuition:
      "普通 VAE 要同时记住图像和整理潜空间；β 像提高整理费，迫使每个潜变量只保留更独立、更有规律的信息，但收费过高会让重构细节被丢掉。",
    formula:
      "\\mathcal L_{\\beta\\text{-VAE}}=-\\mathbb E_{q_\\phi(z\\mid x)}[\\log p_\\theta(x\\mid z)]+\\beta D_{\\mathrm{KL}}\\!\\left(q_\\phi(z\\mid x)\\,\\|\\,p(z)\\right)",
    symbols: [
      { symbol: "q_\\phi(z\\mid x)", meaning: "编码器给出的近似后验分布" },
      { symbol: "p_\\theta(x\\mid z)", meaning: "解码器定义的重构分布" },
      { symbol: "D_{\\mathrm{KL}}", meaning: "近似后验偏离先验的代价" },
      { symbol: "\\beta", meaning: "KL 正则相对重构项的权重" },
    ],
    flow: ["编码样本得到潜分布", "采样并重构输入", "分别计算重构项与 KL", "乘 β 后联合更新", "逐维遍历潜变量观察属性"],
    misconception:
      "更大的 β 不会自动保证语义解耦；它只加强信息瓶颈，数据因素、模型归纳偏置和容量都会影响最终轴向含义。",
    debugTip:
      "每步分别记录 reconstruction、总 KL 和逐维 KL，统计接近零的 inactive units；扫描 β 时用同一批样本保存 traversal，并同时比较 MIG 与重构误差。",
    takeaway: "β-VAE 通过加重 KL 信息瓶颈推动潜因素分离，但解耦提升通常以重构能力为代价。",
  },
  {
    id: 10129,
    title: "条件 VAE (CVAE) 生成管线",
    intuition:
      "条件变量先规定要画哪一类，潜变量再决定这一类内部的写法和细节；因此同一个数字标签可以配合不同 z 生成许多不同样式。",
    formula:
      "\\mathcal L_{\\mathrm{CVAE}}=-\\mathbb E_{q_\\phi(z\\mid x,c)}[\\log p_\\theta(x\\mid z,c)]+D_{\\mathrm{KL}}\\!\\left(q_\\phi(z\\mid x,c)\\,\\|\\,p(z\\mid c)\\right),\\qquad c\\to z\\sim p(z\\mid c)\\to x\\sim p_\\theta(x\\mid z,c)",
    symbols: [
      { symbol: "c", meaning: "类别、说话人或其他生成条件" },
      { symbol: "q_\\phi(z\\mid x,c)", meaning: "同时观察样本与条件的编码分布" },
      { symbol: "p(z\\mid c)", meaning: "给定条件时的潜变量先验" },
      { symbol: "p_\\theta(x\\mid z,c)", meaning: "由潜变量和条件共同控制的解码分布" },
    ],
    flow: [
      "训练重构：将样本与条件编码为 q(z|x,c)",
      "训练重构：从后验采样并用 p(x|z,c) 重构",
      "训练重构：计算重构项与后验/先验 KL 后更新参数",
      "推理生成：只给定 c，从条件先验 p(z|c) 采样",
      "推理生成：把 z 与 c 直接交给解码器生成",
      "检查条件一致性与同条件下的多样性",
    ],
    misconception:
      "q(z|x,c) 需要真实样本 x，只能用于训练重构；推理生成时没有待生成的 x，必须从 p(z|c) 采样，并让解码器同时看到 z 和 c。",
    debugTip:
      "训练时分别打印 reconstruction 与 KL，确认 z 来自 q(z|x,c)；推理时禁用编码器，从 p(z|c) 采样，固定 z 切换 c、再固定 c 重采样 z，检查类别一致性与样本差异。",
    takeaway: "CVAE 训练时用条件后验学习重构，推理时改从条件先验采样，再由 z 与 c 共同生成新样本。",
  },
  {
    id: 10130,
    title: "VQ-VAE 码本量化",
    intuition:
      "编码器产生连续坐标后，不直接交给解码器，而是从共享词典里挑最近的一个向量当作离散 token；直通估计器让训练梯度假装这次替换是透明的。",
    formula:
      "k^*=\\arg\\min_k\\lVert z_e(x)-e_k\\rVert_2^2,\\qquad z_q(x)=e_{k^*},\\qquad \\mathcal L=\\mathcal L_{\\mathrm{rec}}+\\lVert\\operatorname{sg}[z_e]-e_{k^*}\\rVert_2^2+\\beta\\lVert z_e-\\operatorname{sg}[e_{k^*}]\\rVert_2^2",
    symbols: [
      { symbol: "z_e(x)", meaning: "编码器输出的连续表示" },
      { symbol: "e_k", meaning: "码本中的第 k 个嵌入向量" },
      { symbol: "k^*", meaning: "与编码表示距离最近的码本索引" },
      { symbol: "\\operatorname{sg}", meaning: "前向保持数值、反向停止梯度的操作" },
      { symbol: "\\beta", meaning: "让编码器承诺靠近选中码字的损失权重" },
    ],
    flow: [
      "编码得到连续特征 z_e",
      "计算距离并用最近码字得到 z_q",
      "先把 z_q 解码为重构 x-hat",
      "计算重构、码本与承诺损失",
      "再经直通估计反传编码器与解码器",
      "最后用梯度或 EMA 更新码本",
    ],
    misconception:
      "argmin 本身不可导，不能期待梯度自然穿过离散索引；必须使用 straight-through，并选择损失更新或 EMA 更新码本。",
    debugTip:
      "前向先打印 z_q、重构与三项损失，再启动 backward；随后分别检查 encoder/decoder grad，并确认码本只按所选的梯度或 EMA 规则更新，同时统计命中次数与 perplexity。",
    takeaway: "VQ-VAE 先完成量化、解码与损失计算，再用直通估计反传，并以梯度或 EMA 更新码本。",
  },
  {
    id: 10131,
    title: "IWAE 多样本估计",
    intuition:
      "VAE 每次只拿一张潜变量彩票估计样本概率，IWAE 同时拿 K 张，再让更能解释数据的样本占更大权重，通常得到更紧的下界。",
    formula:
      "\\mathcal L_K=\\mathbb E_{z_{1:K}\\sim q_\\phi(z\\mid x)}\\left[\\log\\frac{1}{K}\\sum_{k=1}^{K}w_k\\right],\\qquad w_k=\\frac{p_\\theta(x,z_k)}{q_\\phi(z_k\\mid x)}",
    symbols: [
      { symbol: "K", meaning: "每个输入使用的重要性样本数量" },
      { symbol: "z_{1:K}", meaning: "从近似后验独立取得的 K 个潜样本" },
      { symbol: "w_k", meaning: "第 k 个样本的未归一化重要性权重" },
      { symbol: "\\mathcal L_K", meaning: "K 样本重要性加权下界" },
    ],
    flow: ["为每个输入采 K 个 z", "逐样本计算 log p 与 log q", "在 log 空间聚合权重", "平均批次下界", "比较 K 对界和耗时的影响"],
    misconception:
      "实现时直接计算 exp(log-weight) 再求和很容易上溢或下溢；增加 K 也不保证有限批次的每一步估计都单调变好。",
    debugTip:
      "打印 log-w 的最小值、最大值和归一化权重有效样本量，使用 logsumexp 验证聚合；K=1 的结果应与同一定义下的普通 VAE ELBO 数值一致。",
    takeaway: "IWAE 用多个重要性样本重加权似然估计，使训练下界更接近真实对数似然但增加计算成本。",
  },
  {
    id: 10132,
    title: "VAE 异常检测仪表板",
    intuition:
      "只用正常数据训练的 VAE 熟悉正常模式；新样本若难以重构，或编码后落在先验很不常见的位置，就会得到更高的异常分数。",
    formula:
      "s(x)=\\lambda_{\\mathrm{rec}}\\lVert x-\\hat x\\rVert_2^2+\\lambda_{\\mathrm{KL}}D_{\\mathrm{KL}}\\!\\left(q_\\phi(z\\mid x)\\,\\|\\,p(z)\\right),\\qquad \\hat y=\\mathbf 1[s(x)>\\tau]",
    symbols: [
      { symbol: "\\hat x", meaning: "VAE 对输入 x 的重构" },
      { symbol: "s(x)", meaning: "融合重构和潜分布偏离的异常分数" },
      { symbol: "\\tau", meaning: "触发异常告警的分数阈值" },
      { symbol: "\\lambda_{\\mathrm{rec}}", meaning: "重构误差在总分中的权重" },
      { symbol: "\\lambda_{\\mathrm{KL}}", meaning: "潜空间偏离在总分中的权重" },
    ],
    flow: ["用正常窗口拟合 VAE", "对新窗口重构并编码", "计算两项异常分数", "按验证集选择阈值", "输出告警并监控漂移"],
    misconception:
      "训练损失不能直接当作通用告警阈值；特征尺度、窗口长度和正常数据漂移都会改变异常分数分布。",
    debugTip:
      "逐特征记录标准化前后范围和重构误差贡献，分别画正常/异常的 reconstruction、KL 与总分直方图；再从 confusion matrix 核对阈值对应的 precision 与 recall。",
    takeaway: "VAE 异常检测依赖可校准的重构与潜空间分数，阈值必须在真实验证分布上选择并持续监控。",
  },
  {
    id: 10133,
    title: "分层 VAE (HVAE)",
    intuition:
      "分层 VAE 像先写故事提纲再补句子：高层潜变量描述全局结构，低层潜变量在上层条件下补充局部细节，每层都要真正贡献信息。",
    formula:
      "p_\\theta(x,z_{1:L})=p_\\theta(x\\mid z_1)\\prod_{\\ell=1}^{L-1}p_\\theta(z_\\ell\\mid z_{\\ell+1})p(z_L),\\qquad \\mathcal L=\\mathbb E_q[\\log p_\\theta(x\\mid z_1)]-\\sum_{\\ell=1}^{L}D_{\\mathrm{KL}}^{(\\ell)}",
    symbols: [
      { symbol: "z_1", meaning: "靠近数据、负责较细节表示的底层潜变量" },
      { symbol: "z_L", meaning: "位于顶层、表达全局结构的潜变量" },
      { symbol: "p_\\theta(z_\\ell\\mid z_{\\ell+1})", meaning: "由更高层潜变量给出的条件先验" },
      { symbol: "D_{\\mathrm{KL}}^{(\\ell)}", meaning: "第 ell 层后验与条件先验之间的 KL 项" },
    ],
    flow: ["自底向上提取输入特征", "顶层采样全局潜变量", "自顶向下生成条件先验", "逐层融合后验并采样", "由底层潜变量重构数据"],
    misconception:
      "堆叠更多潜层不保证获得层级语义；若强解码器绕过某一层，该层 KL 会塌到零并停止携带信息。",
    debugTip:
      "分别记录每层 KL、posterior 均值方差和梯度范数，并做逐层消融采样；若某层 KL 长期近零且替换该层不影响输出，检查 skip 路径和 KL warm-up。",
    takeaway: "HVAE 用条件先验把全局到局部的潜变量串起来，训练时必须确认每一层都在实际传递信息。",
  },
  {
    id: 10134,
    title: "VAE × 强化学习表示学习",
    intuition:
      "智能体不必直接在每一帧像素上思考，而是把画面压成短小潜状态，再学习潜状态如何随动作变化，并在这张内部地图上规划。",
    formula:
      "q_\\phi(z_t\\mid o_t,z_{t-1},a_{t-1})=\\mathcal N(\\mu_t^{\\mathrm{post}},\\operatorname{diag}((\\sigma_t^{\\mathrm{post}})^2)),\\quad p_\\psi(z_t\\mid z_{t-1},a_{t-1})=\\mathcal N(\\mu_t^{\\mathrm{prior}},\\operatorname{diag}((\\sigma_t^{\\mathrm{prior}})^2)),\\quad \\mathcal L=\\lambda_{\\mathrm{rec}}\\lVert o_t-g_\\theta(z_t)\\rVert_2^2+\\lambda_{\\mathrm{pred}}\\lVert\\operatorname{sg}[z_{t+1}]-f_\\psi(z_t,a_t)\\rVert_2^2+\\beta D_{\\mathrm{KL}}\\!\\left(q_\\phi(z_t\\mid o_t,z_{t-1},a_{t-1})\\,\\|\\,p_\\psi(z_t\\mid z_{t-1},a_{t-1})\\right)",
    symbols: [
      { symbol: "o_t", meaning: "智能体在时间 t 接收的高维观测" },
      { symbol: "z_t", meaning: "VAE 压缩出的潜状态" },
      { symbol: "a_t", meaning: "智能体在时间 t 执行的动作" },
      {
        symbol: "\\mu_t^{\\mathrm{post}},\\sigma_t^{\\mathrm{post}}",
        meaning: "结合当前观测与历史得到的后验均值和标准差",
      },
      {
        symbol: "\\mu_t^{\\mathrm{prior}},\\sigma_t^{\\mathrm{prior}}",
        meaning: "只根据上一状态和动作预测的先验均值和标准差",
      },
      {
        symbol: "D_{\\mathrm{KL}}(q_\\phi\\|p_\\psi)",
        meaning: "让观测后验贴近动作条件动力学先验的 KL 项",
      },
      { symbol: "f_\\psi", meaning: "预测动作后下一潜状态的动力学模型" },
      { symbol: "\\lambda_{\\mathrm{pred}}", meaning: "潜状态可预测性损失的权重" },
    ],
    flow: [
      "结合观测与历史推断潜状态后验",
      "策略基于 zₜ 选择动作",
      "动作条件动力学预测下一状态先验",
      "计算后验/先验 KL，并用重构或价值目标监督表示",
      "在潜在模型中 rollout，再用真实转移校正模型与策略",
    ],
    misconception:
      "像素重构清晰不代表潜状态适合控制；与奖励和动作无关的背景细节可能占满容量，而关键动力学信息反而被忽略。",
    debugTip:
      "同步记录后验/先验的均值、标准差、KL、一步潜预测误差与策略回报；把 zₜ 与动作送入预测器后核对 hat-z 下一步 shape，并用 open-loop rollout 看误差何时发散。",
    takeaway: "在基于模型强化学习中，VAE/RSSM 用后验编码观测、用先验预测动力学，并让策略在可预测的潜在世界模型中学习。",
  },
];
