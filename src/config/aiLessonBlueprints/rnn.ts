import type { GuidedLessonSeed } from "../guidedLessonTypes";

export const rnnLessonBlueprints: GuidedLessonSeed[] = [
  {
    id: 10082,
    title: "基础 RNN Cell",
    intuition:
      "RNN Cell 像边阅读边更新的便签：它把当前输入和上一刻便签合在一起，写成此刻的新记忆。",
    formula:
      "a_t=W_{xh}x_t+W_{hh}h_{t-1}+b_h,\\qquad h_t=\\tanh(a_t)",
    symbols: [
      { symbol: "x_t", meaning: "时间步 t 的输入向量" },
      { symbol: "h_{t-1}", meaning: "上一时间步的隐藏状态" },
      { symbol: "a_t", meaning: "激活前的线性组合" },
      { symbol: "h_t", meaning: "更新后的隐藏状态" },
    ],
    flow: ["读取当前输入", "取出上一隐藏状态", "完成两路线性变换", "经 tanh 写入新状态"],
    misconception:
      "隐藏状态不是每一步重新初始化的独立输出；同一序列中 h_t 必须传给下一步，并且各时间步共享同一套权重。",
    debugTip:
      "逐步打印 W_xh x_t、W_hh h_{t-1}、a_t 和 h_t 的 shape 与最大绝对值；确认 h_t 每项落在 [-1,1]，且手算 a_t 经 tanh 后与实现一致。",
    takeaway: "基础 RNN 用共享参数把当前输入和历史状态递归压缩进新状态。",
  },
  {
    id: 10083,
    title: "RNN 序列前向传播",
    intuition:
      "把同一个 RNN Cell 沿时间展开，就像同一位读者按顺序读完整句话，每读一个词便更新一次上下文笔记。",
    formula:
      "h_t=\\tanh(W_{xh}x_t+W_{hh}h_{t-1}+b_h),\\qquad y_t=W_{hy}h_t+b_y",
    symbols: [
      { symbol: "T", meaning: "序列包含的时间步数" },
      { symbol: "h_0", meaning: "序列开始前的初始状态" },
      { symbol: "h_t", meaning: "读到时间步 t 后的状态" },
      { symbol: "y_t", meaning: "时间步 t 的输出" },
    ],
    flow: ["设置初始状态", "按时间读取输入", "递归更新隐藏状态", "堆叠各步输出"],
    misconception:
      "时间展开图中的多个 Cell 不是多套参数；它们是同一个 Cell 在不同时间步的重复调用。",
    debugTip:
      "保存全部 hidden_states，检查数量是否为 T、每项 shape 是否为 [batch,hidden_dim]；再把第 t 步保存的 h_t 直接喂给第 t+1 步，核对输出是否与整序列调用一致。",
    takeaway: "RNN 前向传播是在时间轴上反复应用同一状态更新规则。",
  },
  {
    id: 10084,
    title: "梯度消失演示",
    intuition:
      "反向信号要从句尾经过许多相乘关卡传回句首；每关都缩小一点会趋近于零，每关都放大一点则会失控。",
    formula:
      "J_k=\\operatorname{diag}\\!\\left(1-h_k^2\\right)W_{hh},\\qquad \\frac{\\partial h_T}{\\partial h_t}=J_TJ_{T-1}\\cdots J_{t+1}",
    symbols: [
      { symbol: "W_{hh}", meaning: "隐藏状态的循环权重矩阵" },
      { symbol: "1-h_k^2", meaning: "tanh 在时间步 k 的局部导数" },
      { symbol: "J_T\\cdots J_{t+1}", meaning: "按反向传播顺序排列、不可交换的雅可比乘积" },
      { symbol: "T-t", meaning: "梯度需要跨越的时间距离" },
    ],
    flow: ["从末端损失反传", "乘上激活函数导数", "乘上循环权重", "记录各时间步梯度范数"],
    misconception:
      "梯度裁剪主要限制爆炸梯度，不能把已经接近零的长程梯度重新恢复；LSTM/GRU 才是针对信息路径的结构改造。",
    debugTip:
      "对每个时间步的 h_t 调用 retain_grad，并在反传后打印 ||∂L/∂h_t||_2 及其对数；若从 T 向前呈近似直线下降或出现 inf/NaN，就能定位消失或爆炸开始的位置。",
    takeaway: "RNN 的长程梯度由重复雅可比乘积决定，因此容易指数衰减或增长。",
  },
  {
    id: 10085,
    title: "LSTM Cell 结构",
    intuition:
      "LSTM 把长期记忆放在一条细胞状态通道上，并用遗忘、写入和输出三道门决定保留什么、加入什么、展示什么。",
    formula:
      "\\begin{aligned}f_t&=\\sigma(W_f[x_t;h_{t-1}]+b_f),\\quad i_t=\\sigma(W_i[x_t;h_{t-1}]+b_i)\\\\\\tilde c_t&=\\tanh(W_c[x_t;h_{t-1}]+b_c),\\quad c_t=f_t\\odot c_{t-1}+i_t\\odot\\tilde c_t\\\\o_t&=\\sigma(W_o[x_t;h_{t-1}]+b_o),\\quad h_t=o_t\\odot\\tanh(c_t)\\end{aligned}",
    symbols: [
      { symbol: "f_t", meaning: "控制旧记忆保留比例的遗忘门" },
      { symbol: "i_t", meaning: "控制候选记忆写入比例的输入门" },
      { symbol: "o_t", meaning: "控制当前记忆对外暴露比例的输出门" },
      { symbol: "c_t", meaning: "更新后的细胞状态" },
    ],
    flow: ["计算三组门值", "生成候选记忆", "遗忘旧值并写入新值", "筛选细胞状态生成隐藏状态"],
    misconception:
      "细胞状态 c_t 与隐藏状态 h_t 不是同一个量；c_t 承载内部长期记忆，h_t 是经过输出门筛选后的可见状态。",
    debugTip:
      "逐步打印 f_t、i_t、o_t 的最小值和最大值，确认都在 [0,1]；再分别保存 f_t⊙c_{t-1} 与 i_t⊙c̃_t，检查两项之和是否精确得到 c_t。",
    takeaway: "LSTM 通过可加的细胞状态更新与门控，建立更稳定的长期信息路径。",
  },
  {
    id: 10086,
    title: "LSTM 与 GRU 对比",
    intuition:
      "LSTM 用独立细胞状态和三道门细分记忆管理，GRU 把状态合并并用两道门完成类似工作，结构更紧凑。",
    formula:
      "N_{LSTM}=4(dh+h^2+h),\\qquad N_{GRU}=3(dh+h^2+h)",
    symbols: [
      { symbol: "d", meaning: "每个时间步的输入维度" },
      { symbol: "h", meaning: "隐藏状态维度" },
      { symbol: "N_{LSTM}", meaning: "单层 LSTM 的参数量" },
      { symbol: "N_{GRU}", meaning: "单层 GRU 的参数量" },
    ],
    flow: ["统一输入与隐藏维度", "列出门控线性层", "计算参数和状态数量", "在同一数据上比较指标"],
    misconception:
      "GRU 参数更少不代表它必然更快或效果更差；实际吞吐和精度还取决于序列、硬件内核及任务依赖。",
    debugTip:
      "用相同 d、h 逐项统计门权重与偏置：每门一组偏置时应匹配公式；若框架为输入侧和隐藏侧各设偏置，LSTM 与 GRU 还应分别增加 4h 和 3h。",
    takeaway: "LSTM 提供更细的记忆控制，GRU 以更少门和参数换取紧凑计算。",
  },
  {
    id: 10087,
    title: "双向 RNN",
    intuition:
      "读一个位置时，一位读者从左边带来过去信息，另一位从右边带来未来信息，二者汇合后得到完整上下文。",
    formula:
      "\\overrightarrow h_t=F(x_t,\\overrightarrow h_{t-1}),\\quad\\overleftarrow h_t=B(x_t,\\overleftarrow h_{t+1}),\\quad y_t=\\operatorname{Merge}(\\overrightarrow h_t,\\overleftarrow h_t)",
    symbols: [
      { symbol: "\\overrightarrow h_t", meaning: "从序列开头累计到 t 的前向状态" },
      { symbol: "\\overleftarrow h_t", meaning: "从序列末尾累计到 t 的后向状态" },
      { symbol: "\\operatorname{Merge}", meaning: "按配置选择拼接或逐元素求和" },
    ],
    flow: ["正序计算前向状态", "逆序计算后向状态", "把后向结果还原时间顺序", "按配置拼接或求和双向表示", "与单向结果比较"],
    misconception:
      "双向 RNN 需要看到完整序列，所以不能直接用于只能访问过去信息的严格流式预测。",
    debugTip:
      "给每个时间步不同编号，分别打印前向和后向读取顺序；拼接前确认两者均为 [T,batch,h] 且时间索引已对齐，concat 后末维必须为 2h。",
    takeaway: "双向 RNN 为每个位置同时编码左侧和右侧上下文。",
  },
  {
    id: 10088,
    title: "RNN Seq2Seq",
    intuition:
      "编码器先把源序列读成一份摘要，解码器再拿着摘要逐词写出目标序列，并把上一个词作为下一步线索。",
    formula:
      "c=h_T^{enc},\\qquad p(y_t\\mid y_{<t},c)=\\operatorname{softmax}(W_oh_t^{dec}+b_o)",
    symbols: [
      { symbol: "c", meaning: "编码器压缩出的上下文向量" },
      { symbol: "h_T^{enc}", meaning: "编码器最后一个隐藏状态" },
      { symbol: "y_{<t}", meaning: "生成当前词前已有的目标词" },
      { symbol: "h_t^{dec}", meaning: "解码器当前隐藏状态" },
    ],
    flow: ["编码源序列", "传递最终上下文", "输入起始符", "自回归生成直到结束符"],
    misconception:
      "教师强制只在训练时把真实上一个词交给解码器；推理时没有真实目标，必须使用模型自己的预测。",
    debugTip:
      "逐步记录 decoder_input、目标 token、预测 token 和是否采用教师强制；同时检查每步 softmax 概率和约等于 1，并确认遇到 EOS 后不再写入有效输出。",
    takeaway: "经典 Seq2Seq 用编码器状态连接输入理解与自回归输出生成。",
  },
  {
    id: 10089,
    title: "CTC Loss 解读",
    intuition:
      "CTC 不要求提前标出每个字符对应哪一帧，而是把所有能去掉空白和相邻重复后得到目标文本的路径概率加起来。",
    formula:
      "\\mathcal L_{CTC}=-\\log\\sum_{\\pi:\\,B(\\pi)=y}\\prod_{t=1}^{T}p_t(\\pi_t)",
    symbols: [
      { symbol: "\\pi", meaning: "长度为 T、包含 blank 的一条对齐路径" },
      { symbol: "B(\\pi)", meaning: "先合并相邻重复再删除 blank 的映射" },
      { symbol: "p_t(\\pi_t)", meaning: "时间步 t 选择路径符号的概率" },
      { symbol: "y", meaning: "目标标签序列" },
    ],
    flow: ["在目标间插入 blank", "建立允许停留与跳转的状态", "动态规划累加路径概率", "取负对数得到损失", "用前缀束搜索解码序列"],
    misconception:
      "CTC 合并的是相邻重复；若目标本身含连续相同字符，路径中必须用 blank 把它们隔开。",
    debugTip:
      "对极短样例枚举全部路径，逐条应用 B 并筛出目标路径；将其概率乘积之和与前向 DP 终点概率比较，同时检查每个时间步类别概率和为 1。",
    takeaway: "CTC 通过汇总所有合法单调对齐路径来训练未对齐的序列标签。",
  },
  {
    id: 10090,
    title: "RNN 注意力机制",
    intuition:
      "解码器不再只依赖一份固定摘要，而是在生成每个词时重新查看全部源位置，给当前最相关的位置更高权重。",
    formula:
      "e^{add}_{t,i}=v^{\\top}\\tanh(W_ss_{t-1}+W_hh_i),\\quad e^{dot}_{t,i}=s_{t-1}^{\\top}W_ah_i,\\quad \\alpha_{t,i}=\\operatorname{softmax}_i(e_{t,i}),\\quad c_t=\\sum_i\\alpha_{t,i}h_i",
    symbols: [
      { symbol: "e_{t,i}", meaning: "解码步 t 与源位置 i 的对齐分数" },
      { symbol: "e^{add},e^{dot}", meaning: "Bahdanau 加性打分与 Luong 点积打分" },
      { symbol: "\\alpha_{t,i}", meaning: "归一化后的注意力权重" },
      { symbol: "h_i", meaning: "编码器在源位置 i 的隐藏状态" },
      { symbol: "c_t", meaning: "当前解码步的上下文向量" },
    ],
    flow: ["比较解码状态与各编码状态", "对分数做 softmax", "按权重汇总编码状态", "结合上下文预测当前词"],
    misconception:
      "注意力权重表示模型当前使用信息的分配，不应自动当成可靠的因果解释。",
    debugTip:
      "对每个解码步打印 alpha[t]，确认非 padding 位置权重均非负且总和约为 1、padding 权重接近 0；再手算 Σ_i alpha[t,i]h_i 对照 c_t。",
    takeaway: "RNN 注意力让解码器在每一步动态构造与当前输出相关的源序列摘要。",
  },
  {
    id: 10091,
    title: "RNN 正则化技巧",
    intuition:
      "正则化是在训练时限制死记硬背：随机暂时遮住部分特征、忽略补齐位置，并把每步状态缩放到稳定范围。",
    formula:
      "\\widetilde h_t=\\frac{m\\odot h_t}{1-p},\\quad m_i\\sim\\operatorname{Bernoulli}(1-p),\\qquad \\operatorname{LN}(a_t)=\\gamma\\odot\\frac{a_t-\\mu_t}{\\sqrt{\\sigma_t^2+\\varepsilon}}+\\beta",
    symbols: [
      { symbol: "p", meaning: "dropout 丢弃概率" },
      { symbol: "m", meaning: "可在时间步间共享的二值掩码" },
      { symbol: "\\mu_t,\\sigma_t^2", meaning: "当前样本时间步特征的均值与方差" },
      { symbol: "\\gamma,\\beta", meaning: "LayerNorm 的可学习缩放与平移" },
    ],
    flow: [
      "由真实长度生成 padding mask",
      "用 dropout 与 LayerNorm 完成前向传播",
      "计算逐位置损失并屏蔽 padding",
      "反向传播并更新参数",
      "关闭 dropout 后比较验证指标",
    ],
    misconception:
      "padding mask 与 dropout mask 作用不同：前者排除无效时间步，后者随机扰动有效表示；推理时只应关闭 dropout。",
    debugTip:
      "检查 mask 每行有效元素数是否等于真实长度，并确认 padding 位置对总损失贡献为 0；训练时统计 dropout 零值比例约为 p，切到 eval 后同一输入连续两次输出应一致。",
    takeaway: "RNN 正则化要同时处理特征扰动、变长序列有效性和状态尺度稳定。",
  },
];
