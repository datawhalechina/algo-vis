export type GuidedLessonPhase =
  | "intuition"
  | "symbols"
  | "formula"
  | "transition"
  | "reflection"
  | "summary";

export interface LessonSymbol {
  symbol: string;
  meaning: string;
}

export interface DRLLessonBlueprint {
  title: string;
  intuition: string;
  formula: string;
  symbols: LessonSymbol[];
  flow: string[];
  misconception: string;
  takeaway: string;
}

export interface GuidedLessonStep {
  phase: GuidedLessonPhase;
  title: string;
  description: string;
  formula?: string;
  activeFlowIndex?: number;
  finished?: boolean;
}

const commonSymbols = {
  policy: { symbol: "\\pi(a\\mid s)", meaning: "在状态 s 下选择动作 a 的策略" },
  value: { symbol: "V(s)", meaning: "从状态 s 出发的期望回报" },
  actionValue: { symbol: "Q(s,a)", meaning: "在状态 s 执行动作 a 后的期望回报" },
  reward: { symbol: "r_t", meaning: "时间步 t 获得的即时奖励" },
  discount: { symbol: "\\gamma", meaning: "未来奖励的折扣因子" },
  advantage: { symbol: "A(s,a)", meaning: "动作相对平均水平好多少" },
};

const blueprintEntries: Array<[number, DRLLessonBlueprint]> = [
  [30001, {
    title: "强化学习基础",
    intuition: "把智能体想成第一次走迷宫的学生：它观察位置、采取动作、收到反馈，再据此调整下一次选择。",
    formula: "G_t = \\sum_{k=0}^{\\infty} \\gamma^k r_{t+k+1}",
    symbols: [commonSymbols.reward, commonSymbols.discount, { symbol: "G_t", meaning: "从时间步 t 开始的折扣回报" }],
    flow: ["观察状态", "按策略选择动作", "环境返回奖励与新状态", "累计回报并改进策略"],
    misconception: "奖励是单步反馈，回报是从当前时刻向后的累计目标，两者不是同一个量。",
    takeaway: "强化学习学习的是能让长期回报最大的行为规则。",
  }],
  [30002, {
    title: "基于价值的学习",
    intuition: "先给每个局面和动作打一个长期分数，再总选分数最高的动作。",
    formula: "Q^*(s,a)=\\mathbb{E}[r+\\gamma\\max_{a'}Q^*(s',a')\\mid s,a]",
    symbols: [commonSymbols.actionValue, commonSymbols.reward, commonSymbols.discount],
    flow: ["观察转移样本", "估计当前动作价值", "比较下一状态的动作", "更新并选最大价值动作"],
    misconception: "价值不是即时奖励，而是当前选择对未来全部奖励的长期影响。",
    takeaway: "价值函数把长期决策压缩成当前可比较的分数。",
  }],
  [30003, {
    title: "基于策略的学习",
    intuition: "不再先维护动作分数表，而是直接调整行动概率，让带来高回报的动作更常发生。",
    formula: "\\nabla_\\theta J(\\theta)=\\mathbb{E}[G_t\\nabla_\\theta\\log\\pi_\\theta(a_t\\mid s_t)]",
    symbols: [commonSymbols.policy, { symbol: "\\theta", meaning: "策略网络参数" }, { symbol: "J(\\theta)", meaning: "策略的期望回报目标" }],
    flow: ["按当前策略采样轨迹", "计算每一步回报", "放大高回报动作概率", "更新策略参数"],
    misconception: "策略梯度并不是对离散动作求导，而是对产生动作概率的参数求导。",
    takeaway: "策略方法直接学习怎么做，而非只学习一个评分表。",
  }],
  [30004, {
    title: "Actor-Critic 方法",
    intuition: "Actor 像运动员负责行动，Critic 像教练实时判断这次行动是否比预期更好。",
    formula: "\\delta_t=r_t+\\gamma V_w(s_{t+1})-V_w(s_t)",
    symbols: [commonSymbols.policy, commonSymbols.value, { symbol: "\\delta_t", meaning: "Critic 给出的 TD 误差" }],
    flow: ["Actor 选择动作", "环境产生反馈", "Critic 计算 TD 误差", "同时更新 Actor 与 Critic"],
    misconception: "Critic 不直接决定动作，它提供低方差的学习信号。",
    takeaway: "Actor-Critic 用价值估计指导策略更新。",
  }],
  [30005, {
    title: "AlphaGo",
    intuition: "策略网络缩小候选范围，价值网络判断局面，树搜索在两者之间反复试走和回传。",
    formula: "a^*=\\arg\\max_a\\left(Q(s,a)+c_{puct}P(s,a)\\frac{\\sqrt{N(s)}}{1+N(s,a)}\\right)",
    symbols: [{ symbol: "P(s,a)", meaning: "策略网络给出的先验概率" }, { symbol: "Q(s,a)", meaning: "搜索得到的平均价值" }, { symbol: "N(s,a)", meaning: "边的访问次数" }],
    flow: ["选择最有潜力的分支", "扩展新局面", "价值网络评估", "沿路径回传结果"],
    misconception: "AlphaGo 不是只靠神经网络落子，搜索过程仍是决策质量的核心。",
    takeaway: "MCTS 把策略先验、价值估计和探索次数组合成可迭代的决策。",
  }],
  [30006, {
    title: "Sarsa",
    intuition: "更新时使用下一步真正准备执行的动作，因此学习结果会考虑探索策略带来的风险。",
    formula: "Q(s_t,a_t)\\leftarrow Q(s_t,a_t)+\\alpha[r_{t+1}+\\gamma Q(s_{t+1},a_{t+1})-Q(s_t,a_t)]",
    symbols: [commonSymbols.actionValue, { symbol: "\\alpha", meaning: "学习率" }, { symbol: "a_{t+1}", meaning: "行为策略实际选择的下一动作" }],
    flow: ["在 s 选 a", "执行后得到 r 与 s'", "在 s' 选真实动作 a'", "用五元组更新 Q"],
    misconception: "On-policy 不等于没有探索；它恰恰评估包含探索的当前策略。",
    takeaway: "Sarsa 学习当前实际行为策略的价值。",
  }],
  [30007, {
    title: "Q-Learning",
    intuition: "行动时可以探索，但学习目标始终假设下一步会选择当前最优动作。",
    formula: "Q(s_t,a_t)\\leftarrow Q(s_t,a_t)+\\alpha[r_{t+1}+\\gamma\\max_a Q(s_{t+1},a)-Q(s_t,a_t)]",
    symbols: [commonSymbols.actionValue, { symbol: "\\alpha", meaning: "学习率" }, { symbol: "\\max_a Q(s',a)", meaning: "下一状态的贪婪目标" }],
    flow: ["行为策略采样动作", "观察奖励与新状态", "查找新状态最大 Q 值", "向贪婪目标更新"],
    misconception: "Off-policy 指行为策略和目标策略可不同，不代表数据一定来自离线数据集。",
    takeaway: "Q-Learning 用探索数据直接逼近最优动作价值。",
  }],
  [30008, {
    title: "多步 TD 目标",
    intuition: "向前多看几步真实奖励，再接上一个价值估计，在偏差和方差之间调节。",
    formula: "G_t^{(n)}=\\sum_{k=0}^{n-1}\\gamma^k r_{t+k+1}+\\gamma^nV(s_{t+n})",
    symbols: [{ symbol: "n", meaning: "真实奖励展开步数" }, commonSymbols.discount, commonSymbols.value],
    flow: ["收集 n 步轨迹", "折扣累加真实奖励", "接上第 n 步价值", "用多步目标更新"],
    misconception: "n 越大并非总越好；自举偏差减少时，采样方差通常会上升。",
    takeaway: "多步 TD 是单步 TD 与蒙特卡洛回报之间的连续桥梁。",
  }],
  [30009, {
    title: "经验回放与优先经验回放",
    intuition: "把交互经验放进题库随机复习，并让当前最意外的错题更常被抽到。",
    formula: "P(i)=\\frac{p_i^\\alpha}{\\sum_k p_k^\\alpha},\\quad w_i=(N P(i))^{-\\beta}",
    symbols: [{ symbol: "p_i", meaning: "样本优先级，常由 TD 误差给出" }, { symbol: "P(i)", meaning: "样本 i 的采样概率" }, { symbol: "w_i", meaning: "纠正采样偏差的重要性权重" }],
    flow: ["存储 transition", "计算样本优先级", "按概率采样小批次", "更新网络与优先级"],
    misconception: "优先采样会引入分布偏差，需要重要性采样权重修正。",
    takeaway: "回放缓冲区提升数据复用，优先回放把算力集中到更有信息的样本。",
  }],
  [30010, {
    title: "过估计、目标网络与 Double DQN",
    intuition: "同一个估计器既选最高分又给它打分，容易把噪声中的幸运高分当成真实优势。",
    formula: "y=r+\\gamma Q_{\\theta^-}(s',\\arg\\max_a Q_\\theta(s',a))",
    symbols: [{ symbol: "Q_\\theta", meaning: "在线网络，负责选择动作" }, { symbol: "Q_{\\theta^-}", meaning: "目标网络，负责评价动作" }, { symbol: "y", meaning: "Double DQN 学习目标" }],
    flow: ["在线网络选择动作", "目标网络评价该动作", "构造 TD 目标", "周期性同步目标网络"],
    misconception: "Double DQN 不是简单使用两个独立 Q 值，而是拆分选择和评价。",
    takeaway: "解耦选择与评价可以显著缓解最大化带来的过估计。",
  }],
  [30011, {
    title: "Dueling Networks",
    intuition: "先判断局面本身好不好，再判断每个动作相对平均水平多好。",
    formula: "Q(s,a)=V(s)+A(s,a)-\\frac{1}{|\\mathcal A|}\\sum_{a'}A(s,a')",
    symbols: [commonSymbols.value, commonSymbols.advantage, commonSymbols.actionValue],
    flow: ["共享编码状态", "价值分支估计 V", "优势分支估计 A", "聚合得到每个动作 Q"],
    misconception: "减去平均优势不是装饰，它消除了 V 与 A 分解的不唯一性。",
    takeaway: "Dueling 架构让网络更有效地学习与动作无关的状态价值。",
  }],
  [30012, {
    title: "带基线的策略梯度",
    intuition: "不问奖励绝对有多高，而问它比当前状态下的正常水平高多少。",
    formula: "\\nabla_\\theta J=\\mathbb E[(G_t-b(s_t))\\nabla_\\theta\\log\\pi_\\theta(a_t\\mid s_t)]",
    symbols: [{ symbol: "b(s_t)", meaning: "不依赖当前动作的基线" }, { symbol: "G_t-b(s_t)", meaning: "中心化后的学习信号" }, commonSymbols.policy],
    flow: ["采样轨迹", "计算回报", "减去状态基线", "加权策略梯度"],
    misconception: "只要基线不依赖当前动作，它不会改变梯度期望，只会降低方差。",
    takeaway: "Baseline 让策略梯度方向不变，但训练信号更稳定。",
  }],
  [30013, {
    title: "REINFORCE with Baseline",
    intuition: "回合结束后复盘：比预期更好的动作被鼓励，比预期更差的动作被抑制。",
    formula: "\\theta\\leftarrow\\theta+\\alpha(G_t-V_w(s_t))\\nabla_\\theta\\log\\pi_\\theta(a_t\\mid s_t)",
    symbols: [commonSymbols.value, commonSymbols.policy, { symbol: "G_t-V_w(s_t)", meaning: "蒙特卡洛优势估计" }],
    flow: ["生成完整回合", "从后向前计算回报", "训练价值基线", "更新策略"],
    misconception: "即使加入基线，REINFORCE 仍需等待完整回合后才能获得蒙特卡洛回报。",
    takeaway: "价值基线减少方差，但不会把 REINFORCE 变成 TD 方法。",
  }],
  [30014, {
    title: "Advantage Actor-Critic（A2C）",
    intuition: "Critic 每走一步就给 Actor 反馈，不必等整局结束再复盘。",
    formula: "A_t\\approx r_{t+1}+\\gamma V_w(s_{t+1})-V_w(s_t)",
    symbols: [commonSymbols.advantage, commonSymbols.value, commonSymbols.reward],
    flow: ["Actor 采样动作", "Critic 估计相邻状态", "计算一步优势", "同步更新两个网络"],
    misconception: "A2C 中的优势通常是估计值；低方差来自自举，但会引入偏差。",
    takeaway: "A2C 用一步 TD 信号实现更及时、更稳定的策略学习。",
  }],
  [30015, {
    title: "REINFORCE 与 A2C 对比",
    intuition: "一个等完整结果再复盘，一个边行动边听教练点评。",
    formula: "A_t^{MC}=G_t-V(s_t),\\qquad A_t^{TD}=r_{t+1}+\\gamma V(s_{t+1})-V(s_t)",
    symbols: [{ symbol: "A_t^{MC}", meaning: "蒙特卡洛优势，偏差低而方差高" }, { symbol: "A_t^{TD}", meaning: "TD 优势，方差低但有自举偏差" }],
    flow: ["比较采样方式", "比较优势估计", "观察偏差与方差", "按任务选择算法"],
    misconception: "A2C 并非总优于 REINFORCE；价值估计不准时，自举偏差可能更明显。",
    takeaway: "两者的核心差异是优势信号来自完整回报还是自举估计。",
  }],
  [30016, {
    title: "信任域策略优化（TRPO）",
    intuition: "每次只允许策略迈一小步，避免一次更新把原本有效的行为彻底破坏。",
    formula: "\\max_\\theta\\;\\mathbb E[r_t(\\theta)A_t]\\quad\\text{s.t.}\\quad\\mathbb E[D_{KL}(\\pi_{old}\\|\\pi_\\theta)]\\le\\delta",
    symbols: [{ symbol: "r_t(\\theta)", meaning: "新旧策略概率比" }, { symbol: "D_{KL}", meaning: "策略分布变化量" }, { symbol: "\\delta", meaning: "信赖域半径" }],
    flow: ["估计策略优势", "建立局部代理目标", "约束 KL 距离", "在线搜索可接受步长"],
    misconception: "信赖域限制的是策略分布变化，不是参数的欧氏距离。",
    takeaway: "TRPO 用显式 KL 约束换取稳定的策略改进。",
  }],
  [30017, {
    title: "部分观测与 RNN",
    intuition: "当一帧观察不能确定真实状态时，智能体需要把历史线索压缩进记忆。",
    formula: "h_t=f_\\theta(h_{t-1},o_t),\\quad a_t\\sim\\pi_\\theta(\\cdot\\mid h_t)",
    symbols: [{ symbol: "o_t", meaning: "不完整的当前观测" }, { symbol: "h_t", meaning: "RNN 汇总历史后的隐状态" }, commonSymbols.policy],
    flow: ["接收局部观测", "更新记忆状态", "基于记忆选择动作", "通过序列反向传播"],
    misconception: "RNN 不会让环境变成完全可观测，只是在历史信息中学习近似信念状态。",
    takeaway: "记忆让策略能够利用观测历史处理 POMDP。",
  }],
  [30018, {
    title: "离散与连续控制",
    intuition: "离散控制像选择按钮，连续控制则要精确决定方向盘角度或电机扭矩。",
    formula: "a_{discrete}\\in\\{1,\\dots,K\\},\\qquad a_{continuous}\\in\\mathbb R^d",
    symbols: [{ symbol: "K", meaning: "离散动作数量" }, { symbol: "d", meaning: "连续动作维度" }],
    flow: ["识别动作空间", "选择策略分布", "输出动作", "根据控制误差更新"],
    misconception: "连续动作不能可靠地靠枚举最大 Q 值求解，需要策略网络或优化器。",
    takeaway: "动作空间的形态决定策略输出层和优化方法。",
  }],
  [30019, {
    title: "确定性策略梯度（DPG）",
    intuition: "Actor 直接给出唯一连续动作，Critic 告诉它动作沿哪个方向微调会更好。",
    formula: "\\nabla_\\theta J\\approx\\mathbb E[\\nabla_a Q_w(s,a)|_{a=\\mu_\\theta(s)}\\nabla_\\theta\\mu_\\theta(s)]",
    symbols: [{ symbol: "\\mu_\\theta(s)", meaning: "确定性 Actor 输出" }, commonSymbols.actionValue, { symbol: "\\nabla_a Q", meaning: "Critic 对动作的改进方向" }],
    flow: ["Actor 输出连续动作", "Critic 评估动作", "对动作求价值梯度", "链式更新 Actor"],
    misconception: "确定性策略本身不提供探索，训练时通常要额外加入噪声。",
    takeaway: "DPG 通过 Critic 对动作的梯度高效优化连续控制策略。",
  }],
  [30020, {
    title: "随机策略梯度（连续动作）",
    intuition: "Actor 输出动作分布而不是单点，既能表达不确定性，也天然保留探索。",
    formula: "a_t\\sim\\mathcal N(\\mu_\\theta(s_t),\\sigma_\\theta^2(s_t)),\\quad\\nabla_\\theta J=\\mathbb E[A_t\\nabla_\\theta\\log\\pi_\\theta(a_t\\mid s_t)]",
    symbols: [{ symbol: "\\mu_\\theta", meaning: "高斯策略均值" }, { symbol: "\\sigma_\\theta", meaning: "高斯策略标准差" }, commonSymbols.advantage],
    flow: ["预测分布参数", "从分布采样动作", "环境返回奖励", "按优势更新分布"],
    misconception: "随机策略的方差是可学习的探索强度，不应与环境噪声混为一谈。",
    takeaway: "连续随机策略用概率密度统一表达控制和探索。",
  }],
  [30021, {
    title: "多智能体强化学习：基础与挑战",
    intuition: "多个学习者同时改变行为，每个智能体看到的环境因此也不断变化。",
    formula: "Q_i^\\pi(s,\\mathbf a)=\\mathbb E_\\pi[G_t\\mid s_t=s,\\mathbf a_t=\\mathbf a]",
    symbols: [{ symbol: "\\mathbf a", meaning: "所有智能体的联合动作" }, { symbol: "Q_i", meaning: "智能体 i 对联合行为的价值" }],
    flow: ["多个智能体同时观察", "联合执行动作", "共享或独立获得奖励", "处理非平稳与信用分配"],
    misconception: "把其他智能体简单视为环境，会导致转移规律随着对方学习而改变。",
    takeaway: "多智能体问题的关键是相互影响、协调与信用分配。",
  }],
  [30022, {
    title: "集中式训练与去中心化执行（CTDE）",
    intuition: "训练时教练能看到全场，比赛时每位队员只能依据自己的视野独立行动。",
    formula: "a_i\\sim\\pi_i(a_i\\mid o_i),\\qquad Q_i=Q_i(s,a_1,\\ldots,a_n)",
    symbols: [{ symbol: "o_i", meaning: "智能体 i 的局部观测" }, { symbol: "Q_i(s,\\mathbf a)", meaning: "训练期使用全局信息的 Critic" }],
    flow: ["汇总全局训练信息", "集中式 Critic 评价", "分别更新局部 Actor", "仅用局部观测执行"],
    misconception: "去中心化执行不要求训练也完全去中心化。",
    takeaway: "CTDE 在训练信息充分与部署约束之间取得平衡。",
  }],
  [30023, {
    title: "逆强化学习（IRL）",
    intuition: "只看到专家怎么做，反推出他心里在优化什么，再据此学策略。",
    formula: "R^*=\\arg\\max_R\\left(\\mathbb E_{\\pi_E}[R]-\\max_\\pi\\mathbb E_\\pi[R]\\right)",
    symbols: [{ symbol: "\\pi_E", meaning: "专家策略" }, { symbol: "R", meaning: "待推断的奖励函数" }],
    flow: ["收集专家轨迹", "猜测奖励函数", "求该奖励下的策略", "比较并修正奖励"],
    misconception: "IRL 的直接目标是恢复奖励，不是简单复制专家动作。",
    takeaway: "逆强化学习从行为中推断目标，再通过目标生成策略。",
  }],
  [30024, {
    title: "生成对抗模仿学习（GAIL）",
    intuition: "判别器区分专家与智能体轨迹，策略则努力生成越来越像专家的行为。",
    formula: "\\min_\\pi\\max_D\\;\\mathbb E_{\\pi_E}[\\log D(s,a)]+\\mathbb E_\\pi[\\log(1-D(s,a))]",
    symbols: [{ symbol: "D(s,a)", meaning: "状态动作对来自专家的概率" }, { symbol: "\\pi_E", meaning: "专家策略" }, commonSymbols.policy],
    flow: ["采样专家轨迹", "采样策略轨迹", "训练判别器", "用判别奖励更新策略"],
    misconception: "GAIL 通常不显式恢复可解释奖励，而是匹配专家的占用分布。",
    takeaway: "GAIL 把模仿学习转化为策略与判别器的对抗优化。",
  }],
  [30025, {
    title: "PPO 与 RLHF",
    intuition: "用偏好奖励改进语言模型，同时限制新策略不要一次偏离原模型太远。",
    formula: "L^{clip}=\\mathbb E[\\min(r_tA_t,\\operatorname{clip}(r_t,1-\\epsilon,1+\\epsilon)A_t)]",
    symbols: [{ symbol: "r_t", meaning: "新旧策略对当前 token 的概率比" }, commonSymbols.advantage, { symbol: "\\epsilon", meaning: "策略更新的裁剪范围" }],
    flow: ["模型生成回答", "奖励模型评分", "计算优势与概率比", "裁剪后更新策略"],
    misconception: "PPO 的裁剪并不保证严格信赖域，但能抑制破坏性的大步更新。",
    takeaway: "PPO 用简单可实现的裁剪目标稳定优化语言模型策略。",
  }],
  [30026, {
    title: "GRPO（组相对策略优化）",
    intuition: "同一道题生成一组答案，用组内相对成绩判断哪些输出值得鼓励。",
    formula: "\\hat A_i=\\frac{r_i-\\operatorname{mean}(r_{1:G})}{\\operatorname{std}(r_{1:G})+\\varepsilon}",
    symbols: [{ symbol: "G", meaning: "同一提示的采样回答数" }, { symbol: "\\hat A_i", meaning: "组内标准化后的相对优势" }],
    flow: ["同题采样多条回答", "分别计算奖励", "组内标准化", "用相对优势更新策略"],
    misconception: "GRPO 省去独立 Critic，但仍需要可靠奖励和参考策略约束。",
    takeaway: "组内比较用多个候选答案替代显式价值网络。",
  }],
  [30027, {
    title: "RLOO（Leave-One-Out）",
    intuition: "评价一个答案时，用同组其他答案的平均成绩作为基线，避免它给自己打分。",
    formula: "\\hat A_i=r_i-\\frac{1}{G-1}\\sum_{j\\ne i}r_j",
    symbols: [{ symbol: "r_i", meaning: "第 i 个回答的奖励" }, { symbol: "G", meaning: "同一提示的回答数量" }],
    flow: ["采样回答组", "逐个排除当前样本", "计算其余样本均值", "得到无偏相对优势"],
    misconception: "Leave-one-out 的关键是当前样本不参与自己的基线计算。",
    takeaway: "RLOO 用简单的组内基线降低策略梯度方差。",
  }],
  [30028, {
    title: "DAPO（解耦裁剪与动态采样）",
    intuition: "给概率上升和下降不同的活动空间，并优先训练真正有区分度的题目组。",
    formula: "\\operatorname{clip}(r_t,1-\\epsilon_{low},1+\\epsilon_{high})",
    symbols: [{ symbol: "\\epsilon_{low}", meaning: "限制概率下降的裁剪量" }, { symbol: "\\epsilon_{high}", meaning: "限制概率上升的裁剪量" }, { symbol: "r_t", meaning: "策略概率比" }],
    flow: ["生成成组回答", "过滤全对或全错组", "计算 token 级优势", "使用非对称裁剪更新"],
    misconception: "动态采样不是简单丢弃难题，而是移除组内没有区分信号的样本。",
    takeaway: "解耦裁剪与动态采样共同改善长推理训练的探索和数据效率。",
  }],
  [30029, {
    title: "蒙特卡洛估计",
    intuition: "无法直接计算复杂期望时，重复随机实验，再用样本平均逼近答案。",
    formula: "\\mathbb E_{X\\sim p}[f(X)]\\approx\\frac{1}{N}\\sum_{i=1}^{N}f(x_i)",
    symbols: [{ symbol: "x_i", meaning: "从分布 p 独立采样的第 i 个样本" }, { symbol: "N", meaning: "样本数量" }, { symbol: "f(X)", meaning: "需要求期望的量" }],
    flow: ["定义目标分布", "反复独立采样", "计算每个样本结果", "用样本均值估计期望"],
    misconception: "蒙特卡洛不是一个特定 RL 算法，而是一类用随机样本估计期望的方法。",
    takeaway: "采样越多，估计通常越稳定，但计算成本也随之增加。",
  }],
  [30030, {
    title: "分布式 LLM RL 系统全景",
    intuition: "把生成、评分、价值估计和训练拆给不同角色，再由统一控制面编排数据流。",
    formula: "\\text{prompt}\\rightarrow\\text{rollout}\\rightarrow\\text{reward}\\rightarrow\\text{advantage}\\rightarrow\\text{update}",
    symbols: [{ symbol: "\\theta", meaning: "Actor 参数" }, { symbol: "\\phi", meaning: "Critic 参数" }, { symbol: "\\pi_{ref}", meaning: "冻结的参考策略" }],
    flow: ["调度 Prompt 批次", "并行生成与评估", "汇总优势信号", "分布式更新参数"],
    misconception: "分布式 RL 系统不等于某一个框架；相同角色和数据依赖可由不同运行时实现。",
    takeaway: "系统设计的核心是让异构角色高效协同并保持算法语义正确。",
  }],
  [30031, {
    title: "集中式编排与 Worker Group",
    intuition: "控制器只描述算法顺序，Worker Group 负责把同一计算映射到多张设备。",
    formula: "B=\\bigcup_{i=1}^{N}B_i,\\qquad f(B)=\\operatorname{concat}_{i=1}^{N}f_i(B_i)",
    symbols: [{ symbol: "B_i", meaning: "分配给第 i 个 Worker 的数据分片" }, { symbol: "N", meaning: "Worker 数量" }],
    flow: ["控制器构建调用", "切分或广播数据", "Worker 并行计算", "聚合结果继续流程"],
    misconception: "集中式控制不代表计算集中；控制流集中而算力仍分布在多个 Worker。",
    takeaway: "控制与计算解耦让算法代码更清晰，也便于替换训练后端。",
  }],
  [30032, {
    title: "分布式 On-policy 训练循环",
    intuition: "一轮训练像流水线：先用当前策略生产样本，再完成评分和更新，之后才能进入下一轮。",
    formula: "\\theta_{k+1}=\\operatorname{Update}(\\theta_k,\\mathcal D_{\\pi_{\\theta_k}})",
    symbols: [{ symbol: "\\mathcal D_{\\pi_{\\theta_k}}", meaning: "由当前策略生成的训练批次" }, { symbol: "\\theta_k", meaning: "第 k 轮策略参数" }],
    flow: ["生成序列", "计算策略与参考概率", "计算奖励和优势", "更新 Actor 与 Critic"],
    misconception: "On-policy 数据有时效性；策略变化后，旧样本不能无限重复使用。",
    takeaway: "分布式训练循环必须同时管理依赖顺序、吞吐和样本新鲜度。",
  }],
  [30033, {
    title: "Actor 与 Rollout 生成",
    intuition: "同一个策略既要高吞吐地生成数据，也要保留可微计算图参与训练。",
    formula: "p(y\\mid x)=\\prod_{t=1}^{T}\\pi_\\theta(y_t\\mid x,y_{<t})",
    symbols: [{ symbol: "x", meaning: "输入提示" }, { symbol: "y_t", meaning: "第 t 个生成 token" }, { symbol: "y_{<t}", meaning: "此前已生成的 token" }],
    flow: ["同步最新 Actor 权重", "推理引擎批量生成", "记录 token 与旧概率", "训练引擎重算可微概率"],
    misconception: "高速生成概率与训练用概率可能来自不同执行引擎，必须控制数值偏差。",
    takeaway: "Actor/Rollout 协同决定系统最主要的数据生产吞吐。",
  }],
  [30034, {
    title: "Critic 与优势估计",
    intuition: "Critic 为每个生成位置给出预期分数，优势则指出实际结果相对预期好多少。",
    formula: "\\delta_t=r_t+\\gamma V(s_{t+1})-V(s_t),\\quad A_t=\\delta_t+\\gamma\\lambda A_{t+1}",
    symbols: [{ symbol: "\\delta_t", meaning: "一步 TD 残差" }, { symbol: "\\lambda", meaning: "GAE 的偏差方差调节系数" }, commonSymbols.advantage],
    flow: ["Critic 预测 token 价值", "合并奖励信号", "从后向前计算 TD 残差", "递推得到 GAE 优势"],
    misconception: "序列级奖励通常只出现在末尾，需要 GAE 等方法把信号传播到前序 token。",
    takeaway: "优势估计把稀疏结果转成每个决策位置可学习的信号。",
  }],
  [30035, {
    title: "奖励服务与可验证奖励",
    intuition: "奖励系统把回答质量转成数值，可以来自偏好模型，也可以来自答案检查器或代码沙箱。",
    formula: "R=\\lambda_{rm}R_{model}+\\lambda_{rule}R_{rule}-\\beta D_{KL}(\\pi_\\theta\\|\\pi_{ref})",
    symbols: [{ symbol: "R_{model}", meaning: "奖励模型分数" }, { symbol: "R_{rule}", meaning: "规则或验证器分数" }, { symbol: "\\beta", meaning: "KL 约束权重" }],
    flow: ["接收提示与回答", "并行调用评分器", "校验格式与正确性", "组合并归一化奖励"],
    misconception: "奖励越复杂不一定越好；可被钻漏洞的奖励会把策略引向错误目标。",
    takeaway: "奖励质量决定优化方向，服务设计还要保证可复现和可扩展。",
  }],
  [30036, {
    title: "训练推理资源切换与参数重分片",
    intuition: "训练和生成需要不同的显存布局，系统要在两种形态之间搬运同一组权重。",
    formula: "W_{train}^{(DP/FSDP)}\\xleftrightarrow{\\;reshard\\;}W_{infer}^{(TP/PP)}",
    symbols: [{ symbol: "W_{train}", meaning: "训练布局中的参数分片" }, { symbol: "W_{infer}", meaning: "推理布局中的参数分片" }, { symbol: "TP/PP", meaning: "张量并行与流水线并行" }],
    flow: ["暂停当前执行阶段", "聚合并交换参数分片", "重建目标并行布局", "恢复生成或训练"],
    misconception: "重分片能减少常驻副本，但会引入通信和切换开销，需要按批次规模权衡。",
    takeaway: "混合执行引擎用调度与通信换取更高的设备利用率。",
  }],
];

const blueprints = new Map<number, DRLLessonBlueprint>(blueprintEntries);

export function getDrlLessonBlueprint(id: number): DRLLessonBlueprint | undefined {
  return blueprints.get(id);
}

export function createGuidedLessonSteps(id: number): GuidedLessonStep[] {
  const lesson = getDrlLessonBlueprint(id);
  if (!lesson) return [];

  return [
    {
      phase: "intuition",
      title: "先建立直觉",
      description: lesson.intuition,
      activeFlowIndex: 0,
    },
    {
      phase: "symbols",
      title: "认识符号",
      description: "先逐个认识公式中的量，再看它们如何组合。",
      activeFlowIndex: 0,
    },
    {
      phase: "formula",
      title: "拆解核心公式",
      description: "把公式按信息来源、目标和更新方向拆开理解。",
      formula: lesson.formula,
      activeFlowIndex: 1,
    },
    {
      phase: "transition",
      title: "跟随一次更新",
      description: "沿着数据流观察输入如何一步步转化为学习信号。",
      formula: lesson.formula,
      activeFlowIndex: Math.min(2, lesson.flow.length - 1),
    },
    {
      phase: "reflection",
      title: "避开常见误区",
      description: lesson.misconception,
      activeFlowIndex: lesson.flow.length - 1,
    },
    {
      phase: "summary",
      title: "一句话带走",
      description: lesson.takeaway,
      formula: lesson.formula,
      activeFlowIndex: lesson.flow.length - 1,
      finished: true,
    },
  ];
}

