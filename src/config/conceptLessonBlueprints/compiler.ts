import type { ConceptLessonBlueprint } from "./types";

export const compilerLessons: ConceptLessonBlueprint[] = [
  {
    id: 40025,
    slug: "lexical-analysis",
    bookId: 5,
    category: "compiler",
    difficulty: "easy",
    title: "词法分析",
    description:
      "理解词法分析器如何扫描字符、依据有限自动机执行最长匹配，并输出带位置的记号流。",
    keyPoints: ["正则规则描述记号类别", "有限自动机逐字符转移状态", "最长匹配决定记号边界"],
    relatedConcepts: ["正则表达式", "有限自动机", "语法分析"],
    tags: ["编译原理", "词法分析", "Token"],
    heroNote: "词法分析先把连续字符切成语法分析器能理解的最小单元。",
    intuition:
      "把词法分析想成给一句没有标注的代码划词：扫描器从左向右读字符，尽量组成最长的合法单词，再贴上标识符或数字等标签。",
    formula: "q_{i+1}=\\delta(q_i,c_i),\\qquad (t_1,\\ldots,t_m)=\\operatorname{Lex}(c_1\\cdots c_n)",
    symbols: [
      { symbol: "c_i", meaning: "源代码中的第 i 个输入字符" },
      { symbol: "q_i", meaning: "读取字符前自动机所在的状态" },
      { symbol: "\\delta", meaning: "由当前状态和字符决定下一状态的转移函数" },
      { symbol: "t_j", meaning: "扫描完成后输出的第 j 个记号" },
    ],
    flow: ["从当前偏移读取字符", "按自动机规则转移状态", "保存最近的接受状态", "无法继续时输出最长记号", "跳过空白后扫描下一个记号"],
    misconception:
      "词法分析只识别局部字符模式，不负责判断括号是否成对或表达式结构是否完整，那是语法分析的任务。",
    debugTip:
      "逐字符打印偏移、字符、转移前后状态和最近接受位置，输出记号时核对起止区间与原文切片；遇到错误即可定位是哪次转移失效。",
    takeaway: "词法分析用自动机和最长匹配把字符流稳定地转换为带类别与位置的记号流。",
  },
  {
    id: 40026,
    slug: "parsing-and-ast",
    bookId: 5,
    category: "compiler",
    difficulty: "medium",
    title: "语法分析与 AST",
    description:
      "理解语法分析器如何依据文法组合记号、处理优先级，并构造保留程序结构的抽象语法树。",
    keyPoints: ["上下文无关文法定义合法结构", "LL(1) 用栈顶和一个向前看记号选择产生式", "AST 去除无关符号并保留语义层次"],
    relatedConcepts: ["上下文无关文法", "词法分析", "表达式优先级"],
    tags: ["编译原理", "语法分析", "AST"],
    heroNote: "AST 记录代码的结构关系，而不只是源文本的排列顺序。",
    intuition:
      "把语法分析想成搭积木：记号是单块积木，文法规定哪些形状能组合，AST 则只留下对程序含义真正重要的组合骨架。",
    formula:
      "\\begin{aligned}E&\\to TE',&E'&\\to +TE'\\mid\\varepsilon\\\\T&\\to FT',&T'&\\to *FT'\\mid\\varepsilon\\\\F&\\to \\mathrm{id}\\mid(E),&\\operatorname{AST}(\\mathrm{id}+\\mathrm{id}*\\mathrm{id})&=+(\\mathrm{id},*(\\mathrm{id},\\mathrm{id}))\\end{aligned}",
    symbols: [
      { symbol: "E,E'", meaning: "表达式及其后续加法部分；E 是开始符号" },
      { symbol: "T,T'", meaning: "乘法项及其后续乘法部分，因此乘法优先于加法" },
      { symbol: "F", meaning: "单个标识符或括号表达式" },
      { symbol: "\\varepsilon", meaning: "不消耗任何输入的空产生式" },
      { symbol: "\\mathrm{id}", meaning: "词法分析器交给语法分析器的标识符记号" },
    ],
    flow: [
      "固定用 LL(1) 分析输入 id+id*id",
      "栈顶 E、向前看 id：依次展开 E→TE'、T→FT'、F→id",
      "匹配首个 id；向前看 + 时选择 T'→ε，再展开 E'→+TE'",
      "匹配 +，展开 T→FT'、F→id 后匹配第二个 id；向前看 * 时展开 T'→*FT' 并匹配 *、id",
      "向前看文件尾时令 T'→ε、E'→ε，接受输入并构造 +(id, *(id, id))",
    ],
    misconception:
      "AST 不是混凝土语法树的原样复制；括号和分号常不成为节点，但它们影响的优先级和结构必须保留下来。",
    debugTip:
      "对 id+id*id 逐步输出 LL(1) 分析栈、剩余输入和唯一选中的产生式，再打印 AST；根节点应为加法，右子树应为乘法。",
    takeaway: "语法分析用文法验证记号组合，并把源代码压缩为体现优先级和层次的 AST。",
  },
  {
    id: 40027,
    slug: "semantic-and-type-checking",
    bookId: 5,
    category: "compiler",
    difficulty: "medium",
    title: "语义与类型检查",
    description:
      "掌握名称解析、作用域和类型规则如何为 AST 补充含义，并在运行前拒绝不合法的程序组合。",
    keyPoints: ["符号表连接名称与声明", "类型规则自底向上约束表达式", "语义检查为后续 IR 生成添加注解"],
    relatedConcepts: ["符号表", "作用域", "类型系统"],
    tags: ["编译原理", "语义分析", "类型检查"],
    heroNote: "语法正确只说明句子成形，语义检查才判断这些词能否这样使用。",
    intuition:
      "一句话可以语法通顺却意思荒谬，程序也一样；语义检查会查清每个名字指向谁，以及运算符两边的值能不能一起计算。",
    formula:
      "\\frac{\\Gamma\\vdash e_1:\\mathrm{int}\\qquad\\Gamma\\vdash e_2:\\mathrm{int}}{\\Gamma\\vdash e_1+e_2:\\mathrm{int}}",
    symbols: [
      { symbol: "\\Gamma", meaning: "当前作用域中名称到类型的环境" },
      { symbol: "e_1,e_2", meaning: "加法节点的两个子表达式" },
      { symbol: "\\vdash", meaning: "在给定类型环境下可以推出某表达式的类型" },
      { symbol: "\\mathrm{int}", meaning: "此规则要求并产生的整数类型" },
    ],
    flow: ["进入作用域并建立符号表", "把名称绑定到唯一声明", "自底向上推导表达式类型", "检查赋值与调用约束", "给 AST 加注解或报告精确错误"],
    misconception:
      "通过语法分析不代表程序可以执行；未声明名称、参数数量错误和类型不匹配都属于后续语义问题。",
    debugTip:
      "按作用域打印符号表和每个名称绑定的声明位置，再输出每个 AST 节点的期望类型、实际类型与失败约束，先定位第一条不成立的规则。",
    takeaway: "语义与类型检查把名称和类型规则附着到 AST，让错误在生成机器代码前暴露。",
  },
  {
    id: 40028,
    slug: "ir-and-ssa",
    bookId: 5,
    category: "compiler",
    difficulty: "hard",
    title: "IR 与 SSA",
    description:
      "理解中间表示如何连接前端与后端，以及 SSA 如何通过变量重命名和 phi 节点显式表达数据来源。",
    keyPoints: ["IR 提供与源语言和机器相对解耦的表示", "SSA 中每个名字只定义一次", "phi 节点合并控制流路径上的值"],
    relatedConcepts: ["控制流图", "支配关系", "数据流分析"],
    tags: ["编译原理", "IR", "SSA"],
    heroNote: "SSA 用不同版本号回答每个值究竟来自哪次定义。",
    intuition:
      "把变量的每次赋值都看成发一张新编号的票，后续使用必须拿着明确票号；不同分支汇合时，phi 节点负责按来路选择票。",
    formula: "x_3=\\phi(x_1,x_2),\\qquad \\lvert\\operatorname{defs}(x_i)\\rvert=1",
    symbols: [
      { symbol: "x_1,x_2", meaning: "不同控制流路径上产生的两个变量版本" },
      { symbol: "\\phi", meaning: "根据实际前驱路径选择输入值的 SSA 合并函数" },
      { symbol: "x_3", meaning: "控制流汇合后得到的新变量版本" },
      { symbol: "\\operatorname{defs}(x_i)", meaning: "变量版本 x_i 的定义位置集合" },
    ],
    flow: ["把 AST 降低为基本块指令", "连接基本块形成控制流图", "计算支配关系与支配边界", "在汇合点插入 phi 节点", "沿支配树重命名变量定义"],
    misconception:
      "SSA 的只赋值一次是指每个带版本的名字只有一个定义，不是说源程序中的可变变量只能被赋值一次。",
    debugTip:
      "打印每个基本块的前驱、变量定义和 phi 输入，检查每个 SSA 名字恰有一个定义、phi 输入数等于前驱数，并确认定义支配所有普通使用。",
    takeaway: "IR 隔离编译阶段，SSA 再把定义与使用关系显式化，从而简化许多优化。",
  },
  {
    id: 40029,
    slug: "data-flow-optimization",
    bookId: 5,
    category: "compiler",
    difficulty: "hard",
    title: "数据流优化：常量传播",
    description:
      "以常量传播为例，学习编译器如何在控制流图上传播变量取值直至不动点，再安全替换已知常量。",
    keyPoints: ["常量格区分未知、具体常量与非常量", "合流点逐变量合并所有前驱", "传递函数模拟基本块中的赋值"],
    relatedConcepts: ["控制流图", "常量折叠", "SSA"],
    tags: ["编译原理", "数据流分析", "常量传播"],
    heroNote: "只有所有已知来路都支持同一个常量，合流后的替换才安全。",
    intuition:
      "把每个变量的状态想成便签：还没得到信息是 UNDEF，确定为某个整数就写该整数，来路给出不同整数时改写成 NAC，表示它不再是单一常量。",
    formula:
      "\\begin{gathered}\\mathcal L=\\{\\mathrm{UNDEF}\\}\\cup\\mathbb Z\\cup\\{\\mathrm{NAC}\\},\\qquad x\\sqcap y=\\begin{cases}y,&x=\\mathrm{UNDEF}\\\\x,&y=\\mathrm{UNDEF}\\\\c,&x=y=c\\in\\mathbb Z\\\\\\mathrm{NAC},&\\text{otherwise}\\end{cases}\\\\\\mathrm{IN}[B](v)=\\mathop{\\sqcap}_{P\\in\\operatorname{pred}(B)}\\mathrm{OUT}[P](v),\\qquad \\mathrm{OUT}[B]=F_B(\\mathrm{IN}[B])\\\\F_{v:=e}(\\sigma)=\\sigma[v\\mapsto\\operatorname{Eval}(e,\\sigma)]\\end{gathered}",
    symbols: [
      { symbol: "B", meaning: "控制流图中的当前基本块" },
      { symbol: "P", meaning: "能够直接流入 B 的某个前驱基本块" },
      { symbol: "v", meaning: "正在跟踪常量状态的变量" },
      { symbol: "e", meaning: "赋值右侧、将在环境 sigma 下求值的表达式" },
      { symbol: "\\mathrm{IN}[B],\\mathrm{OUT}[B]", meaning: "基本块 B 执行前和执行后的变量格值环境" },
      { symbol: "\\operatorname{pred}(B)", meaning: "所有能够直接进入基本块 B 的前驱块" },
      { symbol: "\\mathcal L", meaning: "常量传播格：未得到信息、某个具体整数、不是单一常量" },
      { symbol: "\\mathrm{UNDEF},\\mathrm{NAC}", meaning: "尚无信息，以及已知不是单一常量的两个格值" },
      { symbol: "\\sqcap", meaning: "合流运算：相同常量仍是该常量，不同常量合为 NAC" },
      { symbol: "\\sigma", meaning: "从每个变量映射到一个常量格值的当前环境" },
      { symbol: "F_B", meaning: "按顺序解释基本块 B 中赋值的传递函数" },
      { symbol: "\\operatorname{Eval}(e,\\sigma)", meaning: "表达式求值：有 NAC 操作数则为 NAC，否则有 UNDEF 则为 UNDEF，否则折叠成具体常量" },
    ],
    flow: ["入口把运行时参数设为 NAC，把尚未定义的局部变量设为 UNDEF", "在合流点逐变量 meet 所有前驱输出", "按块内赋值计算表达式并更新环境", "重复遍历直到所有 IN 与 OUT 不再变化", "用稳定的具体常量替换变量并折叠表达式"],
    misconception:
      "这套前向方程只讲常量传播，不是后向活跃变量分析，也不能仅凭变量为 NAC 就删除代码；死代码删除还要另外证明结果无用且指令无副作用。",
    debugTip:
      "逐轮打印每个块入口和出口处各变量的 UNDEF、常量或 NAC；若合流后仍保留常量，逐个核对所有前驱，终止时再确认相邻两轮环境完全相同。",
    takeaway: "常量传播以常量格合并前驱，并用赋值传递函数求不动点，只替换最终仍为具体常量的值。",
  },
  {
    id: 40030,
    slug: "code-generation-and-register-allocation",
    bookId: 5,
    category: "compiler",
    difficulty: "hard",
    title: "代码生成与寄存器分配",
    description:
      "理解后端如何选择目标指令、分析值的活跃范围，并把有限物理寄存器分配给虚拟寄存器。",
    keyPoints: ["指令选择把 IR 模式映射为机器操作", "同时活跃的值会形成干涉边", "无法着色的值需要溢出到栈"],
    relatedConcepts: ["活跃变量分析", "图着色", "调用约定"],
    tags: ["编译原理", "代码生成", "寄存器分配"],
    heroNote: "后端要在目标机器约束下，把无限虚拟名字装进有限高速寄存器。",
    intuition:
      "把寄存器看成数量有限的工作台：使用时间重叠的零件不能放在同一张台上，实在放不下的零件只能暂存到更慢的仓库。",
    formula:
      "S\\subseteq V,\\qquad \\rho:V\\setminus S\\to\\{r_1,\\ldots,r_K\\},\\qquad (u,v)\\in E\\land u,v\\notin S\\Rightarrow\\rho(u)\\ne\\rho(v)",
    symbols: [
      { symbol: "V", meaning: "需要分配位置的虚拟寄存器集合" },
      { symbol: "S", meaning: "本轮无法着色、需要溢出到栈并重写的虚拟寄存器集合" },
      { symbol: "E", meaning: "由同时活跃关系形成的干涉边集合" },
      { symbol: "u,v", meaning: "干涉图中一条边两端的两个虚拟寄存器" },
      { symbol: "K", meaning: "目标机器当前可用于分配的物理寄存器数量" },
      { symbol: "r_1,\\ldots,r_K", meaning: "目标机器可用的 K 个物理寄存器" },
      { symbol: "\\rho", meaning: "只把未溢出的虚拟寄存器映射到物理寄存器的分配函数" },
    ],
    flow: ["匹配 IR 并选择目标指令", "计算活跃集合并建立干涉图", "尝试着色并得到本轮溢出集合 S", "若 S 非空，插入 load/store 重写 IR，再回到活跃分析并重新分配", "当 S 为空时按映射替换虚拟寄存器并输出机器代码"],
    misconception:
      "映射 ρ 不包括已经选择溢出的值；插入 load/store 会产生新的临时值和活跃范围，所以不能沿用旧图，必须重建干涉图并重新分配。",
    debugTip:
      "每轮记录 S、use、def、live-in 和 live-out；检查未溢出干涉边两端颜色不同，溢出值每次使用前有 reload、定义后有 store，并确认重写后再次运行了分配。",
    takeaway: "ρ 只覆盖 V\\S；若 S 非空，就先重写溢出访存，再重新计算活跃性和分配，直到本轮无需溢出。",
  },
];
