import type { GuidedLessonSeed } from "../guidedLessonTypes";

export const transformerLessonBlueprints: GuidedLessonSeed[] = [
  {
    id: 10092,
    title: "Transformer 架构总览",
    intuition:
      "把 Transformer 想成一条反复加工序列的流水线：注意力先让每个词交换信息，前馈网络再逐个加工，残差连接则保留原始线索。",
    formula:
      "\\begin{aligned}E_a&=\\operatorname{LN}(E+\\operatorname{MHA}_{self}(E,E,E)),&E'&=\\operatorname{LN}(E_a+\\operatorname{FFN}(E_a))\\\\D_a&=\\operatorname{LN}(D+\\operatorname{MHA}_{mask}(D,D,D)),&D_c&=\\operatorname{LN}(D_a+\\operatorname{MHA}_{cross}(D_a,E',E'))\\\\D'&=\\operatorname{LN}(D_c+\\operatorname{FFN}(D_c))&&\\end{aligned}",
    symbols: [
      { symbol: "E,E_a,E'", meaning: "编码器输入、自注意力结果与 FFN 结果" },
      { symbol: "D,D_a,D_c,D'", meaning: "解码器输入、掩码注意力、交叉注意力与 FFN 结果" },
      { symbol: "\\operatorname{MHA}_{mask}", meaning: "不能看到未来 token 的因果多头注意力" },
      { symbol: "\\operatorname{MHA}_{cross}", meaning: "以解码器为 Query、编码器为 Key/Value 的交叉注意力" },
      { symbol: "\\operatorname{FFN}", meaning: "逐位置前馈网络" },
      { symbol: "\\operatorname{LN}", meaning: "层归一化操作" },
    ],
    flow: [
      "嵌入 token 与位置",
      "编码器反复整合上下文",
      "解码器读取历史与编码结果",
      "投影得到下一个 token",
    ],
    misconception:
      "注意力不是 Transformer 的全部；残差、归一化和 FFN 同样出现在每一层并直接影响信息与梯度的传递。",
    debugTip:
      "逐模块打印形状：编码器自注意力权重应为 [B,h,L_source,L_source]，解码器交叉注意力权重应为 [B,h,L_target,L_source]；再确认因果 mask 遮住未来位置且每次残差两侧形状相同。",
    takeaway:
      "Transformer 用注意力交换位置间的信息，再用 FFN 加工每个位置，并靠残差与归一化稳定堆叠。",
  },
  {
    id: 10093,
    title: "位置编码",
    intuition:
      "自注意力本身只看词之间的关系，不知道谁先谁后；位置编码像给每个座位贴上一组不同频率的坐标标签。",
    formula:
      "\\mathrm{PE}_{p,2i}=\\sin\\!\\left(p/10000^{2i/d_{\\text{model}}}\\right),\\quad \\mathrm{PE}_{p,2i+1}=\\cos\\!\\left(p/10000^{2i/d_{\\text{model}}}\\right)",
    symbols: [
      { symbol: "p", meaning: "token 在序列中的位置" },
      { symbol: "i", meaning: "正弦余弦维度对的编号" },
      { symbol: "d_{\\text{model}}", meaning: "模型隐藏维度" },
      { symbol: "\\mathrm{PE}_{p,j}", meaning: "位置 p 在维度 j 上的编码值" },
    ],
    flow: [
      "选择固定或可学习编码",
      "固定编码按维度计算不同频率",
      "交替填入正弦和余弦",
      "可学习编码按位置查表",
      "与 token 嵌入逐元素相加",
      "比较两类编码的注意力图",
    ],
    misconception:
      "正弦位置编码不是给每个位置加一个递增整数，而是在多个频率上共同表示位置和相对位移。",
    debugTip:
      "检查编码矩阵形状为 [L,d_model]，并核对 p=0 时偶数维为 0、奇数维为 1；相加前再确认位置编码能广播到批次维。",
    takeaway:
      "位置编码用多频坐标把顺序信息注入不含循环结构的 Transformer。",
  },
  {
    id: 10094,
    title: "多头注意力可视化",
    intuition:
      "多头注意力像让几位观察者同时读一句话：每个人使用自己的投影角度寻找关系，最后再汇总各自看到的线索。",
    formula:
      "\\operatorname{head}_i=\\operatorname{softmax}\\!\\left(\\frac{Q_iK_i^{\\mathsf T}}{\\sqrt{d_k}}+M\\right)V_i,\\quad \\operatorname{MHA}=\\operatorname{Concat}(\\operatorname{head}_1,\\ldots,\\operatorname{head}_h)W^O",
    symbols: [
      { symbol: "Q_i,K_i,V_i", meaning: "第 i 个头的查询、键和值" },
      { symbol: "d_k", meaning: "单个注意力头的键维度" },
      { symbol: "M", meaning: "屏蔽非法关注位置的掩码" },
      { symbol: "h", meaning: "并行注意力头数量" },
    ],
    flow: [
      "分别投影 Q、K、V",
      "计算缩放相似度",
      "掩码后归一化权重",
      "加权求和并拼接各头",
    ],
    misconception:
      "多个头不是复制同一张注意力图；每个头有独立投影参数，可能学习不同的关系模式。",
    debugTip:
      "打印每头 Q/K/V 与权重矩阵形状，逐行检查 softmax 权重和约为 1，并确认被 mask 的位置权重为 0、拼接后最后一维回到 h*d_v。",
    takeaway:
      "多头注意力在多个表示子空间中并行聚合信息，再把互补结果合成一个输出。",
  },
  {
    id: 10095,
    title: "前馈网络 (FFN)",
    intuition:
      "注意力负责让不同位置互相交流，FFN 则像同一位加工师逐个处理每个位置，把特征先展开、非线性筛选，再压回原维度。",
    formula:
      "\\operatorname{FFN}(x)=\\phi(xW_1+b_1)W_2+b_2",
    symbols: [
      { symbol: "x", meaning: "某个位置的 d_model 维输入" },
      { symbol: "W_1,W_2", meaning: "扩展到 d_ff 再压回 d_model 的权重" },
      { symbol: "\\phi", meaning: "ReLU 或 GELU 等非线性激活" },
      { symbol: "b_1,b_2", meaning: "两层线性变换的偏置" },
    ],
    flow: [
      "每个位置独立进入线性层",
      "扩展到 d_ff 维",
      "应用非线性激活",
      "投影回 d_model 维",
    ],
    misconception:
      "FFN 不在序列位置之间混合信息；它对所有位置使用同一组参数，只在特征通道之间变换。",
    debugTip:
      "分别记录 xW1+b1、激活结果和最终输出的形状，应依次为 [B,L,d_ff]、[B,L,d_ff]、[B,L,d_model]；同时检查激活值是否存在 NaN 或异常全零。",
    takeaway:
      "FFN 以共享的逐位置非线性变换补充注意力的跨位置混合。",
  },
  {
    id: 10096,
    title: "LayerNorm 在 Transformer 中的作用",
    intuition:
      "LayerNorm 像为每个 token 单独校准仪表，把它各通道的数值拉回稳定尺度，再允许模型用可学习参数重新调整。",
    formula:
      "\\begin{aligned}\\operatorname{LN}(x)&=\\gamma\\odot\\frac{x-\\mu}{\\sqrt{\\sigma^2+\\varepsilon}}+\\beta\\\\H_{pre}&=x+\\operatorname{Sublayer}(\\operatorname{LN}(x))\\\\H_{post}&=\\operatorname{LN}(x+\\operatorname{Sublayer}(x))\\end{aligned}",
    symbols: [
      { symbol: "\\mu,\\sigma^2", meaning: "单个 token 跨隐藏维计算的均值与方差" },
      { symbol: "\\varepsilon", meaning: "避免除零的数值稳定项" },
      { symbol: "\\gamma,\\beta", meaning: "可学习的缩放与平移参数" },
      { symbol: "d", meaning: "被归一化的隐藏维度" },
      { symbol: "H_{pre}", meaning: "先归一化、再过子层并接残差的 Pre-LN 输出" },
      { symbol: "H_{post}", meaning: "先过子层并接残差、最后归一化的 Post-LN 输出" },
    ],
    flow: [
      "选择 Pre-LN 或 Post-LN 路径",
      "Pre-LN：先归一化 x 再进入子层",
      "Pre-LN：把子层输出与原始 x 相加",
      "Post-LN：先计算子层输出并与 x 相加",
      "Post-LN：最后归一化残差和",
      "比较两条路径的激活与梯度范数",
    ],
    misconception:
      "LayerNorm 不像 BatchNorm 那样跨样本统计；它通常独立归一化每个 token 的隐藏通道。",
    debugTip:
      "在乘 gamma、加 beta 前检查每个 token 的标准化向量均值接近 0、方差接近 1；再分别记录 Pre-LN 与 Post-LN 各层输出范数和梯度范数。",
    takeaway:
      "LayerNorm 控制单个 token 的特征尺度，放置位置则会改变深层网络的优化稳定性。",
  },
  {
    id: 10097,
    title: "Transformer 编码器堆叠",
    intuition:
      "每个编码器层都让 token 再交流和加工一次：浅层常先捕捉局部线索，层层传递后，每个位置能形成更完整的上下文表示。",
    formula:
      "H^{(l+1)}=\\operatorname{EncoderLayer}_l(H^{(l)}),\\quad l=0,1,\\ldots,L-1",
    symbols: [
      { symbol: "H^{(l)}", meaning: "第 l 层的全部 token 表示" },
      { symbol: "\\operatorname{EncoderLayer}_l", meaning: "第 l 层的注意力与 FFN 组合" },
      { symbol: "L", meaning: "编码器总层数" },
      { symbol: "H^{(L)}", meaning: "最终上下文表示" },
    ],
    flow: [
      "输入嵌入进入第一层",
      "自注意力整合上下文",
      "FFN 更新通道特征",
      "残差结果传给下一层",
    ],
    misconception:
      "堆叠更多层不等于简单扩大一次注意力；每层有自己的参数和中间表示，也可能出现过平滑或训练不稳。",
    debugTip:
      "保存每层 H 的形状、均值、范数及相邻层余弦相似度；若形状改变、范数爆炸，或多层相似度长期接近 1，应定位对应层的残差、归一化和注意力输出。",
    takeaway:
      "编码器通过重复的注意力与 FFN 逐层把原始嵌入提炼成上下文化表示。",
  },
  {
    id: 10098,
    title: "解码器与交叉注意力",
    intuition:
      "解码器写下每个目标词时，先回看自己已经写过的内容，再拿当前问题去编码器的源句笔记里寻找相关线索。",
    formula:
      "\\operatorname{CrossAttn}(H_D,H_E)=\\operatorname{softmax}\\!\\left(\\frac{(H_DW^Q)(H_EW^K)^{\\mathsf T}}{\\sqrt{d_k}}\\right)(H_EW^V)",
    symbols: [
      { symbol: "H_D", meaning: "解码器当前的目标端表示，产生 Query" },
      { symbol: "H_E", meaning: "编码器输出，产生 Key 和 Value" },
      { symbol: "W^Q,W^K,W^V", meaning: "查询、键和值的投影参数" },
      { symbol: "d_k", meaning: "键向量维度" },
    ],
    flow: [
      "因果自注意力读取已生成内容",
      "目标端状态生成 Query",
      "源端状态生成 Key 与 Value",
      "交叉注意力注入源句信息",
      "FFN 产出下一步表示",
      "训练时对照 Teacher Forcing，推理时改用自身预测",
    ],
    misconception:
      "交叉注意力的 Q、K、V 并非都来自解码器；Q 来自目标端，而 K 和 V 来自编码器输出。",
    debugTip:
      "检查交叉权重形状为 [B,h,L_target,L_source] 且每行和约为 1；另查因果自注意力上三角权重为 0，并在代码中追踪 Q 来自解码器、K/V 来自编码器。",
    takeaway:
      "解码器用因果自注意力维持生成顺序，再用交叉注意力按需读取编码器信息。",
  },
  {
    id: 10099,
    title: "Transformer 训练技巧",
    intuition:
      "训练大模型像启动重型机器：学习率先缓慢升温，标签不设成绝对答案，显存不足时则分几次累计动力再更新。",
    formula:
      "\\operatorname{lr}(t)=d_{\\text{model}}^{-1/2}\\min\\!\\left(t^{-1/2},t\\,w^{-3/2}\\right),\\quad q_k=(1-\\varepsilon)\\mathbf{1}_{k=y}+\\frac{\\varepsilon}{K}",
    symbols: [
      { symbol: "t", meaning: "当前优化器更新步数" },
      { symbol: "w", meaning: "学习率预热步数" },
      { symbol: "\\varepsilon", meaning: "标签平滑强度" },
      { symbol: "K", meaning: "预测类别或词表大小" },
    ],
    flow: [
      "构造平滑目标分布",
      "逐微批计算梯度",
      "累计后执行一次更新",
      "按 warmup 曲线调整学习率",
    ],
    misconception:
      "梯度累积步数不会自动放大学习率，而且 label smoothing 也不是把错误类别概率随意设为同一个未归一化常数。",
    debugTip:
      "记录 t=1、t=w、t=4w 的实际学习率，确认先升后按平方根衰减；再检查每个平滑标签行和为 1，并比较累积微批梯度与等效大批次梯度的范数。",
    takeaway:
      "Warmup、标签平滑和梯度累积分别控制更新尺度、监督置信度与有效批大小。",
  },
  {
    id: 10100,
    title: "Transformer 推理与 Beam Search",
    intuition:
      "贪心搜索每步只留眼前最好的词，Beam Search 则同时保留几条有希望的句子，避免过早走进无法挽回的分支。",
    formula:
      "p_T(y)=\\operatorname{softmax}(z/T),\\quad s(y_{1:t})=\\frac{\\sum_{j=1}^{t}[\\log p_T(y_j\\mid y_{<j},x)-\\lambda n_j]}{\\left((5+t)/6\\right)^{\\alpha}}",
    symbols: [
      { symbol: "y_{1:t}", meaning: "长度为 t 的候选输出序列" },
      { symbol: "p(y_j\\mid y_{<j},x)", meaning: "第 j 步条件 token 概率" },
      { symbol: "\\alpha", meaning: "长度归一化强度" },
      { symbol: "T", meaning: "控制分布平滑程度的采样温度" },
      { symbol: "\\lambda n_j", meaning: "对重复 token 的累计惩罚" },
      { symbol: "s(y_{1:t})", meaning: "用于候选排序的累计分数" },
    ],
    flow: [
      "按温度缩放 logits 并执行 Top-k 截断",
      "展开每条 beam 的下一 token",
      "累加 token 对数概率",
      "应用重复惩罚与长度归一化",
      "从全部扩展中保留 top beam",
      "遇到 EOS 后冻结候选",
      "按最终分数选择序列",
    ],
    misconception:
      "束宽增大不保证生成质量单调提升；未经长度归一化的累计对数概率还会天然偏爱短序列。",
    debugTip:
      "每步打印候选的父 beam、token、累计 log 概率和归一化分数；确认裁剪前有 beam_size*词表大小个扩展，EOS 候选不再展开，最终排序使用同一评分规则。",
    takeaway:
      "Beam Search 用有限宽度保存多条高分路径，并依靠一致的序列评分选出最终结果。",
  },
  {
    id: 10101,
    title: "Transformer Scaling Law",
    intuition:
      "训练预算像一笔固定资金：模型太大而数据太少会学不充分，数据很多而模型太小又装不下规律，最优方案要平衡两边的瓶颈。",
    formula:
      "L(N,D)=E+\\frac{A}{N^{\\alpha}}+\\frac{B}{D^{\\beta}},\\quad C\\approx 6ND",
    symbols: [
      { symbol: "L(N,D)", meaning: "给定模型和数据规模时的预测损失" },
      { symbol: "N", meaning: "模型参数量" },
      { symbol: "D", meaning: "训练 token 数" },
      { symbol: "C", meaning: "近似训练计算量" },
      { symbol: "\\alpha,\\beta", meaning: "模型与数据扩展的经验幂指数" },
    ],
    flow: [
      "确定可用计算预算",
      "选择参数量 N",
      "由预算匹配 token 数 D",
      "估计两项缩放损失",
      "比较候选配置的边际收益",
    ],
    misconception:
      "Scaling Law 不是模型越大就一定越好；在固定计算量下，参数和训练数据任一不足都会形成瓶颈。",
    debugTip:
      "对每个候选配置重算 6ND 并核对未超预算，再分别打印 A/N^alpha 与 B/D^beta；若一项远大于另一项，就能直接定位模型受限还是数据受限。",
    takeaway:
      "Scaling Law 用经验曲线把参数、数据和算力放进同一预算权衡中。",
  },
];
