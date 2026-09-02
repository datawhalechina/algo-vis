import type { GuidedLessonSeed } from "../guidedLessonTypes.ts";

export const ganLessonBlueprints: GuidedLessonSeed[] = [
  {
    id: 10119,
    title: "DCGAN 生成器/判别器模块",
    intuition:
      "生成器把一小团随机数逐层铺成更大的特征图，判别器则反向把图像逐层压缩成一个真假判断；两边在同一套图像尺度上相向练习。",
    formula:
      "h_{\\ell+1}^{G}=\\operatorname{ReLU}\\!\\left(\\operatorname{BN}(W_\\ell^{\\top}*h_\\ell^G)\\right),\\qquad D(x)=\\sigma\\!\\left(W_D*h_L^D\\right)",
    symbols: [
      { symbol: "h_\\ell^G", meaning: "生成器第 ell 层的特征图" },
      { symbol: "W_\\ell^{\\top}*h_\\ell^G", meaning: "通过转置卷积完成的可学习上采样" },
      { symbol: "\\operatorname{BN}", meaning: "批归一化，用于稳定中间激活" },
      { symbol: "D(x)", meaning: "判别器对输入为真实样本的评分" },
    ],
    flow: ["从随机向量整形成小特征图", "转置卷积逐级放大", "判别器卷积逐级压缩", "真假损失交替更新两端"],
    misconception:
      "转置卷积不是普通卷积的严格逆运算，它是一个可学习的上采样算子，核大小与步长不合适时还会产生棋盘格伪影。",
    debugTip:
      "逐层打印 NCHW shape、激活均值和标准差，确认生成器空间尺寸按计划翻倍；若出现棋盘格，再检查 kernel 是否能被 stride 整齐覆盖。",
    takeaway: "DCGAN 用镜像的上采样生成器和下采样判别器，把随机向量逐步变成可辨认图像。",
  },
  {
    id: 10120,
    title: "模式崩溃诊断仪",
    intuition:
      "模式崩溃像一位只会背一道标准答案的学生：单张结果可能很像真的，但换许多噪声输入仍反复交出几乎同一张图。",
    formula:
      "\\operatorname{Div}(\\{x_i\\})=\\frac{2}{n(n-1)}\\sum_{1\\le i<j\\le n}\\lVert\\phi(x_i)-\\phi(x_j)\\rVert_2",
    symbols: [
      { symbol: "n", meaning: "同一检查批次中的生成样本数" },
      { symbol: "\\phi(x_i)", meaning: "用于比较语义差异的样本特征" },
      { symbol: "\\operatorname{Div}", meaning: "批次内两两特征距离的平均值" },
      { symbol: "\\lVert\\cdot\\rVert_2", meaning: "特征空间中的欧氏距离" },
    ],
    flow: ["固定模型采多组噪声", "提取生成样本特征", "计算两两距离与类别覆盖", "对齐训练步观察下降时刻", "结合判别器状态定位原因"],
    misconception:
      "FID 暂时较低不能排除模式崩溃，因为总体均值和协方差可能掩盖少数类别或局部模式的缺失。",
    debugTip:
      "每个 checkpoint 用同一组 seed 生成样本，记录特征两两距离、最近邻重复率、类别直方图和判别器真假 logit 均值；先找哪个量率先塌缩。",
    takeaway: "诊断模式崩溃要跟踪批内多样性和模式覆盖，而不能只看单张质量或一个总体分数。",
  },
  {
    id: 10121,
    title: "WGAN-GP 梯度惩罚实践",
    intuition:
      "WGAN 的 critic 像一把刻度连续的尺子，而不是只回答真假；梯度惩罚沿真假样本之间抽查尺子的斜率，让刻度不要突然拉伸。",
    formula:
      "\\mathcal L_D=\\mathbb E_{\\tilde x\\sim P_g}[D(\\tilde x)]-\\mathbb E_{x\\sim P_r}[D(x)]+\\lambda\\,\\mathbb E_{\\hat x}\\!\\left(\\lVert\\nabla_{\\hat x}D(\\hat x)\\rVert_2-1\\right)^2,\\quad \\hat x=\\epsilon x+(1-\\epsilon)\\tilde x,\\quad \\epsilon\\sim\\mathcal U(0,1)",
    symbols: [
      { symbol: "P_r", meaning: "真实数据分布" },
      { symbol: "P_g", meaning: "生成器产生的样本分布" },
      { symbol: "\\epsilon\\sim\\mathcal U(0,1)", meaning: "为每对真假样本采样的均匀插值系数" },
      { symbol: "\\hat x", meaning: "真实样本和生成样本之间的随机插值点" },
      { symbol: "\\lambda", meaning: "梯度惩罚项的权重" },
      { symbol: "\\lVert\\nabla_{\\hat x}D(\\hat x)\\rVert_2", meaning: "critic 对插值输入的梯度范数" },
    ],
    flow: ["分别取得真实与生成样本", "在线段上随机插值", "对插值输入求 critic 梯度", "惩罚梯度范数偏离 1", "多次更新 critic 后更新生成器"],
    misconception:
      "梯度惩罚要求的是输入梯度范数接近 1，不是网络参数梯度接近 1，也不应和权重裁剪同时默认开启。",
    debugTip:
      "保留 hat-x 的 requires_grad，画出每批输入梯度范数直方图并分别记录 Wasserstein 项和 GP 项；范数全为零时检查 autograd graph 是否被 detach。",
    takeaway: "WGAN-GP 在真假样本的插值区域约束 critic 输入梯度，从而比粗暴权重裁剪更稳定。",
  },
  {
    id: 10122,
    title: "StyleGAN 风格混合实验",
    intuition:
      "StyleGAN 把一张图的生成拆成多层旋钮：前层多管姿态和轮廓，后层多管纹理和颜色；风格混合就是在某一层把一组旋钮换成另一组。",
    formula:
      "w^{(j)}=f(z_j),\\qquad w^{(j,\\psi)}=\\bar w+\\psi(w^{(j)}-\\bar w),\\qquad w_\\ell^{\\mathrm{mix}}=\\begin{cases}w^{(a)},&\\ell<\\ell_c\\\\w^{(b)},&\\ell\\ge\\ell_c\\end{cases},\\quad x=G(\\{w_\\ell\\})",
    symbols: [
      { symbol: "f", meaning: "把输入噪声 z 映射到风格空间的网络" },
      { symbol: "w^{(j,\\psi)}", meaning: "来源 j 在注入合成层之前完成截断的风格" },
      { symbol: "w_\\ell^{\\mathrm{mix}}", meaning: "风格混合支路注入第 ell 个合成层的风格" },
      { symbol: "\\ell_c", meaning: "从来源 a 切换到来源 b 的层级" },
      { symbol: "\\psi", meaning: "把风格向平均向量收缩的截断系数" },
      { symbol: "\\bar w", meaning: "训练分布中的平均风格向量" },
    ],
    flow: [
      "两份噪声分别经映射网络得到 w",
      "风格混合支路固定 ψ=1，按切换层组装逐层风格后注入并合成",
      "截断支路固定单一来源，先按 ψ 把 w 拉向平均风格",
      "将截断后的 w 注入各合成层并生成图像",
      "分别比较切换层属性，以及 ψ 的质量/多样性曲线",
    ],
    misconception:
      "truncation 必须在风格注入与图像合成之前改变 w，不能生成后再补做；粗中细层的属性分工也只是统计倾向，并非固定规律。",
    debugTip:
      "混合实验固定 z_a、z_b 与 ψ=1，只移动切换层；截断实验固定一个 z 并扫描 ψ，逐次确认注入的是已截断 style，再分别保存向量范数、输出差分和质量/多样性指标。",
    takeaway: "风格混合与截断应分支实验：前者切换逐层来源，后者在注入前收缩风格，再各自衡量输出变化。",
  },
  {
    id: 10123,
    title: "CycleGAN 领域迁移",
    intuition:
      "没有成对照片时，模型学两张相反方向的翻译器；一张马的照片翻成斑马后再翻回来，应该仍能认出原来的那匹马。",
    formula:
      "\\mathcal L_{\\mathrm{cyc}}=\\mathbb E_{x\\sim X}\\lVert F(G(x))-x\\rVert_1+\\mathbb E_{y\\sim Y}\\lVert G(F(y))-y\\rVert_1,\\qquad \\mathcal L=\\mathcal L_{\\mathrm{GAN}}+\\lambda_{\\mathrm{cyc}}\\mathcal L_{\\mathrm{cyc}}+\\lambda_{\\mathrm{id}}\\mathcal L_{\\mathrm{id}}",
    symbols: [
      { symbol: "G:X\\to Y", meaning: "从领域 X 翻译到领域 Y 的生成器" },
      { symbol: "F:Y\\to X", meaning: "从领域 Y 翻译回领域 X 的生成器" },
      { symbol: "\\mathcal L_{\\mathrm{cyc}}", meaning: "往返翻译后的循环一致性误差" },
      { symbol: "\\lambda_{\\mathrm{id}}", meaning: "保持目标域已有内容不变的身份损失权重" },
    ],
    flow: ["X 样本翻译到 Y", "译图再返回 X", "Y 样本执行反向循环", "PatchGAN 判断局部真伪", "加权三类损失更新"],
    misconception:
      "循环一致性只能约束可逆和内容保留，不能保证翻译结果具有唯一正确语义；模型仍可能学到隐藏信息或错误映射。",
    debugTip:
      "分别记录 X→Y→X、Y→X→Y 的 L1 误差、identity loss 和两个判别器的 patch logit 均值；同时保存输入、直译、循环重建三联图。",
    takeaway: "CycleGAN 用双向对抗学习目标域外观，再用循环和身份约束守住输入内容。",
  },
  {
    id: 10124,
    title: "DiffAug 数据增强正则",
    intuition:
      "小数据时判别器很容易背下训练图片；DiffAug 让真假图片都经过同一类随机且可求导的变换，使判别器只能学习更稳定的线索。",
    formula:
      "\\min_G\\max_D\\;\\mathbb E_{x\\sim P_r}[\\log D(T(x))]+\\mathbb E_{z\\sim P_z}[\\log(1-D(T(G(z))))]",
    symbols: [
      { symbol: "T", meaning: "颜色、平移或遮挡等可微随机增强" },
      { symbol: "P_r", meaning: "有限的真实训练数据分布" },
      { symbol: "P_z", meaning: "生成器输入噪声的分布" },
      { symbol: "D(T(G(z)))", meaning: "判别器对增强后生成样本的判断" },
    ],
    flow: ["为本批采样增强参数", "同策略增强真实图", "同策略增强生成图", "判别器比较增强后样本", "梯度穿过增强回到生成器"],
    misconception:
      "只增强真实图会制造一条真假捷径；DiffAug 的关键是两边使用同一增强策略，并让生成器梯度能穿过该变换。",
    debugTip:
      "对同一批次保存 T(x) 与 T(G(z))，检查 shape 和数值范围；在增强前后分别 retain grad，确认生成器参数梯度非零，并记录真实训练集与验证集判别准确率差。",
    takeaway: "DiffAug 通过对真假样本对称施加可微增强，减少判别器在小数据上的记忆式过拟合。",
  },
  {
    id: 10125,
    title: "BigGAN 截断技巧",
    intuition:
      "截断采样只从潜空间中心附近挑噪声，像让生成器只答最熟悉的题：通常画得更稳、更像真图，但能展示的变化也更少。",
    formula:
      "z_i\\sim\\mathcal N(0,1)\\mid |z_i|\\le\\tau,\\qquad x=G(z,e_y),\\qquad (\\operatorname{Precision}(\\tau),\\operatorname{Recall}(\\tau))\\;\\text{由实验评估}",
    symbols: [
      { symbol: "\\tau", meaning: "逐维截断高斯采样的阈值" },
      { symbol: "z", meaning: "送入生成器的截断潜向量" },
      { symbol: "e_y", meaning: "类别 y 的条件嵌入" },
      { symbol: "\\operatorname{Precision}", meaning: "生成样本逼真程度的覆盖指标" },
      { symbol: "\\operatorname{Recall}", meaning: "真实数据模式被覆盖的程度" },
    ],
    flow: ["选定类别嵌入", "按阈值重采样潜变量", "条件生成一批图像", "计算质量与覆盖指标", "扫描阈值选择工作点"],
    misconception:
      "截断技巧不是训练正则；阈值降低时 Precision 常升、Recall 常降只是经验趋势，不是数学定律，具体方向还受模型、类别和指标估计影响。",
    debugTip:
      "对每个 tau 记录 z 各维最大绝对值、接受率、样本特征方差以及 Precision/Recall；若阈值变小而潜变量方差不变，检查是否仍从未截断高斯取样。",
    takeaway: "BigGAN 截断在推理阶段收窄潜变量分布，通常以多样性换质量，但必须扫描阈值并用实际指标确认趋势。",
  },
  {
    id: 10126,
    title: "StyleGAN + CLIP 文本引导编辑",
    intuition:
      "先把原图放进 StyleGAN 的可编辑潜空间，再让 CLIP 比较当前图和文字指令；每次沿着更符合文字、同时又不远离原图的方向移动一点。",
    formula:
      "w^*=\\arg\\min_w\\left[\\mathcal L_{\\mathrm{CLIP}}(G(w),p)+\\lambda_{\\mathrm{keep}}\\lVert(1-M)\\odot(G(w)-x_0)\\rVert_2^2+\\lambda_w\\lVert w-w_0\\rVert_2^2\\right],\\qquad x_{\\mathrm{edit}}=M\\odot G(w^*)+(1-M)\\odot x_0",
    symbols: [
      { symbol: "w_0", meaning: "原图反演得到的初始 StyleGAN 潜向量" },
      { symbol: "p", meaning: "描述目标编辑效果的文本提示" },
      { symbol: "\\mathcal L_{\\mathrm{CLIP}}", meaning: "让生成图像接近文本语义的损失" },
      { symbol: "M", meaning: "编辑区域为 1、保留区域为 0 的 mask" },
      { symbol: "\\lambda_{\\mathrm{keep}}", meaning: "mask 外区域保持损失的权重" },
      { symbol: "x_{\\mathrm{edit}}", meaning: "用 mask 将生成编辑区与原图保留区最终合成的结果" },
    ],
    flow: ["将原图反演到 w₀", "生成当前候选编辑图", "用 mask 计算文本目标与区域外保持损失", "反传并更新潜向量", "用同一 mask 合成编辑区与原图保留区"],
    misconception:
      "CLIP 相似度高不代表身份和局部细节自然；单独优化文本目标很容易通过整体改色、裁切或伪影投机。",
    debugTip:
      "每步记录 CLIP cosine、identity loss、潜向量位移和 mask 内外像素差；若未编辑区域漂移，检查 mask 是否同时约束损失和最终合成。",
    takeaway: "文本引导编辑需要同时优化语义方向与内容保持，并用潜空间和局部约束限制副作用。",
  },
];
