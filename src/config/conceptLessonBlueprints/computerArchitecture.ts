import type { ConceptLessonSeed } from "./types";

export const computerArchitectureLessons: ConceptLessonSeed[] = [
  {
    id: 40031,
    slug: "instruction-encoding",
    bookId: 6,
    category: "computer_architecture",
    difficulty: "easy",
    title: "指令编码",
    description:
      "理解机器指令如何把操作码、寄存器编号和立即数装入固定宽度比特字段，并被 CPU 解码。",
    keyPoints: ["指令格式规定各字段位置", "操作码决定执行操作", "立即数宽度限制可直接表示的范围"],
    relatedConcepts: ["指令集架构", "汇编语言", "寻址方式"],
    tags: ["计算机组成", "指令集", "编码"],
    heroNote: "一条汇编指令最终必须变成处理器能按字段拆读的一串比特。",
    intuition:
      "把指令想成一张固定格数的表单：一格填写做什么，几格填写从哪些寄存器取数，剩余格子填写常量或地址偏移。",
    formula:
      "W=w_{\\mathrm{imm}}\\Vert w_{\\mathrm{rs1}}\\Vert w_{\\mathrm{funct3}}\\Vert w_{\\mathrm{rd}}\\Vert w_{\\mathrm{op}},\\qquad |W|=12+5+3+5+7=32",
    symbols: [
      { symbol: "W", meaning: "按 I 型位序拼出的 32 位机器字" },
      { symbol: "w_{\\mathrm{op}}", meaning: "位于 [6:0] 的 7 位操作码" },
      { symbol: "w_{\\mathrm{rd}}", meaning: "位于 [11:7] 的 5 位目的寄存器编号" },
      { symbol: "w_{\\mathrm{funct3}}", meaning: "位于 [14:12] 的 3 位功能码" },
      { symbol: "w_{\\mathrm{rs1}}", meaning: "位于 [19:15] 的 5 位源寄存器编号" },
      { symbol: "w_{\\mathrm{imm}}", meaning: "位于 [31:20] 的 12 位立即数补码" },
    ],
    flow: ["解析助记符与操作数", "选择匹配的指令格式和操作码", "编码寄存器编号与立即数", "按位段拼接机器字", "解码机器字验证原指令"],
    misconception:
      "汇编中的每个数字都不是原样写进机器码；立即数要受位宽、符号扩展、对齐和具体指令格式约束。",
    debugTip:
      "列出机器字每个字段的起止位和二进制值，单独检查立即数范围与符号扩展，再反汇编该机器字，核对助记符和全部操作数是否回到原值。",
    takeaway: "指令编码按 ISA 规定的位段，把操作和操作数无歧义地压入机器字。",
  },
  {
    id: 40032,
    slug: "cpu-pipeline",
    bookId: 6,
    category: "computer_architecture",
    difficulty: "medium",
    title: "CPU 流水线",
    description:
      "理解多条指令如何重叠经过取指、译码、执行、访存和写回阶段，以及冒险为何产生停顿。",
    keyPoints: ["流水线提高吞吐率而非单条指令延迟", "数据与控制相关会造成冒险", "转发、停顿和冲刷维持正确性"],
    relatedConcepts: ["数据冒险", "指令级并行", "分支预测"],
    tags: ["计算机组成", "CPU", "流水线"],
    heroNote: "流水线让多条指令错峰加工，理想情况下每周期完成一条。",
    intuition:
      "把 CPU 流水线想成洗衣流程：不同衣物可同时处在清洗、漂洗和烘干阶段，但后一件需要前一件结果时就必须等待或转交。",
    formula:
      "C_{\\mathrm{actual}}=k+n-1+b,\\qquad S=\\frac{nk}{k+n-1+b}",
    symbols: [
      { symbol: "n", meaning: "连续进入流水线的指令数量" },
      { symbol: "k", meaning: "理想等长流水线的阶段数量" },
      { symbol: "b", meaning: "数据或控制冒险插入的气泡周期总数；理想情况为 0" },
      { symbol: "C_{\\mathrm{actual}}", meaning: "完成 n 条指令所需的实际周期数" },
      { symbol: "S", meaning: "相对于逐条执行共需 nk 个周期的加速比" },
    ],
    flow: [
      "例：I1=lw x1,0(x2)，I2=add x3,x1,x4",
      "周期 1：I1 取指；周期 2：I1 译码，同时 I2 取指，出现重叠",
      "周期 3：I1 执行地址计算，I2 译码并发现需要 x1",
      "周期 4：I1 访存，I2 在译码级 stall，一个气泡进入执行级",
      "周期 5：I1 写回，I2 通过转发取得 x1 后执行",
      "周期 6 至 7：I2 经过访存级并写回；此例 n=2、k=5、b=1，共 7 周期",
    ],
    misconception:
      "流水级数增加不等于单条指令更快；它主要提高稳定吞吐率，寄存器开销和冒险还可能拉长实际执行时间。",
    debugTip:
      "画出逐周期流水线表，记录每条指令所在阶段、源目的寄存器、转发选择和 stall/flush 信号；再核对写回顺序与最终寄存器值。",
    takeaway: "多条指令重叠提高吞吐；示例中的 load-use 相关即使用转发也需停顿一周期，因此实际周期数要加上气泡数 b。",
  },
  {
    id: 40035,
    slug: "branch-prediction",
    bookId: 6,
    category: "computer_architecture",
    difficulty: "hard",
    title: "分支预测",
    description:
      "理解处理器如何在分支结果产生前预测方向与目标，并用两位饱和计数器从历史结果中更新判断。",
    keyPoints: ["预测保持前端持续取指", "每个已解析分支都更新两位计数器", "只有误预测才冲刷并重定向"],
    relatedConcepts: ["CPU 流水线", "推测执行", "分支目标缓冲器"],
    tags: ["计算机组成", "分支预测", "推测执行"],
    heroNote: "分支预测用过去猜未来，猜错的代价是丢弃已经开始的工作。",
    intuition:
      "把分支预测想成在岔路口提前派车：根据以往路线先选一边继续行驶，答案揭晓后猜对就省下等待，猜错则掉头并清理错误路线。",
    formula:
      "\\widehat{y}_t=\\mathbf{1}[s_t\\ge2],\\qquad s_{t+1}=\\begin{cases}\\min(3,s_t+1),&y_t=1\\\\\\max(0,s_t-1),&y_t=0\\end{cases}",
    symbols: [
      { symbol: "s_t", meaning: "预测前处于 0 到 3 的两位饱和计数器状态" },
      { symbol: "\\widehat{y}_t", meaning: "计数器给出的预测方向，1 表示跳转" },
      { symbol: "y_t", meaning: "分支执行后得到的真实方向" },
      { symbol: "t", meaning: "同一预测表项被更新的时序编号" },
    ],
    flow: ["用分支 PC 索引预测表", "读取计数器并预测方向", "按预测方向和目标继续取指", "执行阶段解析真实结果 y_t", "每次解析后都用 y_t 饱和更新计数器", "仅当误预测时冲刷错误路径并把 PC 重定向到正确目标"],
    misconception:
      "预测正确时虽然不用冲刷，计数器仍要按真实结果更新；预测器只选择推测路径，真实结果负责校验并纠正体系结构状态。",
    debugTip:
      "逐次记录分支 PC、表索引、更新前计数器、预测方向、真实方向和更新后计数器，核对状态始终在 0 到 3，并统计误预测对应的冲刷周期。",
    takeaway: "每个已解析分支都训练计数器；预测正确时继续执行，只有误预测才冲刷错误路径并重定向取指。",
  },
  {
    id: 40033,
    slug: "cache-hierarchy",
    bookId: 6,
    category: "computer_architecture",
    difficulty: "medium",
    title: "缓存层次",
    description:
      "理解缓存如何利用时间和空间局部性，在容量、速度与成本不同的多级存储之间隐藏内存延迟。",
    keyPoints: ["地址拆分为标记、组索引和块内偏移", "命中率与命中时间共同决定性能", "替换和写策略影响流量与一致性"],
    relatedConcepts: ["局部性原理", "组相联缓存", "缓存一致性"],
    tags: ["计算机组成", "缓存", "存储层次"],
    heroNote: "缓存赌的是刚访问过或相邻的数据很快还会再用。",
    intuition:
      "把存储层次想成书桌、书架和仓库：常用资料放在更近但更小的位置，找不到时才逐级去更远的大空间取回一整叠。",
    formula:
      "T_{\\mathrm{avg}}=t_{L1}+m_{L1}\\left(t_{L2}+m_{L2}t_{\\mathrm{mem}}\\right)",
    symbols: [
      { symbol: "t_{L1},t_{L2}", meaning: "访问一级和二级缓存所需时间" },
      { symbol: "m_{L1},m_{L2}", meaning: "一级和二级缓存各自的局部未命中率" },
      { symbol: "t_{\\mathrm{mem}}", meaning: "访问主存的额外时间" },
      { symbol: "T_{\\mathrm{avg}}", meaning: "该两级模型下的平均存储访问时间" },
    ],
    flow: ["把地址拆成标记、组号和偏移", "在 L1 目标组并行比较标记", "未命中时继续查询下一级", "从更低层取回完整缓存块", "按替换与写策略更新缓存行"],
    misconception:
      "缓存更大并不必然更快；容量增加可能拉长命中时间，而且冲突模式、块大小和访问局部性都会改变收益。",
    debugTip:
      "对每次访存记录地址拆分、目标组、各路 tag、valid/dirty 位和逐级命中结果，再由计数器计算局部未命中率并代入公式核对平均延迟。",
    takeaway: "缓存层次利用局部性让多数访问停在近端，实际性能由命中时间和逐级未命中共同决定。",
  },
  {
    id: 40034,
    slug: "address-translation",
    bookId: 6,
    category: "computer_architecture",
    difficulty: "medium",
    title: "地址转换",
    description:
      "理解虚拟地址如何拆成页号与页内偏移，并经 TLB 和页表转换为物理地址或触发缺页处理。",
    keyPoints: ["页内偏移在转换前后保持不变", "TLB 缓存近期页表映射", "页表项同时保存页框号和权限状态"],
    relatedConcepts: ["虚拟内存", "页表", "TLB"],
    tags: ["计算机组成", "地址转换", "虚拟内存"],
    heroNote: "地址转换只替换页号，页内的具体位置原样保留。",
    intuition:
      "把虚拟地址想成公寓的房间编号：先用住户目录把虚拟楼号翻成真实楼号，房间在楼内的偏移则不需要改变。",
    formula: "v=pP+d,\\qquad a=f(p)P+d,\\qquad 0\\le d<P",
    symbols: [
      { symbol: "v", meaning: "处理器生成的虚拟地址" },
      { symbol: "P", meaning: "每一页包含的字节数" },
      { symbol: "p,d", meaning: "虚拟页号与页内偏移" },
      { symbol: "f(p)", meaning: "页表为虚拟页 p 给出的物理页框号" },
      { symbol: "a", meaning: "转换后用于访问内存的物理地址" },
    ],
    flow: [
      "TLB miss：拆分虚拟地址并查询 TLB",
      "页表项有效位为 0：触发缺页异常",
      "缺页处理：调页并安装有效映射",
      "权限检查允许本次访问",
      "填充 TLB 并重试命中",
      "拼接页框与偏移得到物理地址",
    ],
    misconception:
      "TLB 未命中不等于缺页；前者可能只需从内存页表补入映射，只有页表项无效才需要操作系统调页。",
    debugTip:
      "打印虚拟页号和偏移、TLB 结果、页表项有效位与权限；有效位为 0 时确认进入缺页处理而非拼接地址，重试成功后再核对转换前后偏移相同。",
    takeaway: "地址转换先区分缺页、保护异常和有效映射；只有页表项有效且获准时，才用页框号和原偏移组成物理地址。",
  },
  {
    id: 40036,
    slug: "simd-and-multicore-parallelism",
    bookId: 6,
    category: "computer_architecture",
    difficulty: "hard",
    title: "SIMD 与多核并行",
    description:
      "区分单核内的 SIMD 数据并行与多核线程并行，理解串行比例、负载均衡和同步如何限制加速。",
    keyPoints: ["SIMD 一条指令同时处理多个数据通道", "多核把任务分配给独立执行核心", "串行部分和协调开销限制总加速比"],
    relatedConcepts: ["向量化", "线程同步", "缓存一致性"],
    tags: ["计算机组成", "SIMD", "多核并行"],
    heroNote: "并行资源只有拿到彼此独立且分配均匀的工作时才会转化为速度。",
    intuition:
      "SIMD 像一个口令让整排工人做同一动作，多核则像多个小组各自完成任务；只要有人必须单独收尾，其他人再多也要等待。",
    formula: "S(p)=\\frac{1}{(1-\\alpha)+\\frac{\\alpha}{p}}",
    symbols: [
      { symbol: "\\alpha", meaning: "程序中能够并行执行的时间比例" },
      { symbol: "1-\\alpha", meaning: "无论增加多少资源都仍需串行执行的比例" },
      { symbol: "p", meaning: "用于并行部分的有效处理通道或核心数" },
      { symbol: "S(p)", meaning: "忽略额外开销时相对单处理单元的理论加速比" },
    ],
    flow: ["识别可独立处理的数据或任务", "把连续数据打包进 SIMD 通道", "把数据块均衡分给多个核心", "各核心执行并处理尾部掩码", "同步归并局部结果"],
    misconception:
      "通道或核心数量翻倍不会保证速度翻倍；串行代码、尾部通道空闲、负载不均和缓存争用都会降低收益。",
    debugTip:
      "先保留标量结果作基线，再记录每核数据区间、每个向量的有效通道掩码和线程耗时；核对输出校验和一致，并分开测量计算、同步与访存时间。",
    takeaway: "SIMD 扩展单条指令的数据宽度，多核扩展并行任务数，而串行比例与协调成本决定最终加速。",
  },
];
