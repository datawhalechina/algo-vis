import type { ConceptLessonBlueprint } from "./types";

export const networkLessons: ConceptLessonBlueprint[] = [
  {
    id: 40013,
    slug: "layering-and-encapsulation",
    bookId: 3,
    category: "network",
    difficulty: "easy",
    title: "分层与封装",
    description:
      "理解网络分层如何划分职责，以及数据在发送端逐层加头、接收端逐层解封装的过程。",
    keyPoints: [
      "每层只依赖相邻层提供的服务",
      "发送时各层加入控制信息",
      "接收时依据首部逐层分用数据",
    ],
    relatedConcepts: ["TCP/IP 模型", "协议数据单元", "端口复用"],
    tags: ["网络分层", "封装", "协议"],
    heroNote: "分层让协议可以独立演进，封装则把每层需要的控制信息随数据一起传递。",
    intuition:
      "发送网络数据像寄国际包裹：内容先装入应用包装，再贴上传输、网络和链路标签；接收方按相反顺序拆开，每层只处理自己的标签。",
    formula: "P_k=H_k\\mathbin{\\Vert}P_{k+1}\\mathbin{\\Vert}T_k",
    symbols: [
      { symbol: "P_k", meaning: "第 k 层封装完成后的协议数据单元" },
      { symbol: "H_k", meaning: "第 k 层添加的首部" },
      { symbol: "P_{k+1}", meaning: "上层交付给第 k 层的载荷" },
      { symbol: "T_k", meaning: "第 k 层可选的尾部" },
    ],
    flow: ["应用生成原始数据", "传输层加入端口信息", "网络层加入 IP 信息", "链路层成帧后发送"],
    misconception:
      "分层不是说每层都独立传一份数据；同一份载荷会在向下传递时被逐层包裹，接收时再按层拆开。",
    debugTip:
      "抓取一个数据包并逐层记录 frame、packet、segment 的长度与协议字段；检查外层 payload 长度是否等于内层整体长度。",
    takeaway: "网络分层拆分通信职责，封装让各层控制信息围绕同一份载荷有序叠加。",
  },
  {
    id: 40014,
    slug: "ip-and-routing",
    bookId: 3,
    category: "network",
    difficulty: "medium",
    title: "IP 与路由",
    description:
      "理解 IP 数据报如何携带端到端地址，并由每一跳路由器按照最长前缀匹配选择出口。",
    keyPoints: [
      "IP 地址标识网络接口的逻辑位置",
      "路由表保存目标前缀与下一跳",
      "多个前缀命中时选择最长者",
    ],
    relatedConcepts: ["子网划分", "ARP", "路由协议"],
    tags: ["IP", "路由", "最长前缀匹配"],
    heroNote: "数据报不预先携带完整路径，每台路由器只为下一跳做一次局部决定。",
    intuition:
      "路由像按地址分拣信件：先找所有能覆盖目的地址的地区规则，再选择最具体的那条，把数据报交给对应下一站。",
    formula: "r^*=\\operatorname*{arg\\,max}_{r\\in R,\\ d\\in p_r}\\ell(p_r)",
    symbols: [
      { symbol: "d", meaning: "数据报的目的 IP 地址" },
      { symbol: "R", meaning: "当前路由器中的路由条目集合" },
      { symbol: "p_r", meaning: "路由条目 r 对应的目标网络前缀" },
      { symbol: "\\ell(p_r)", meaning: "前缀包含的有效比特数" },
      { symbol: "r^*", meaning: "最长前缀匹配选中的路由条目" },
    ],
    flow: ["读取数据报目的地址", "筛出所有匹配前缀", "选择前缀最长的条目", "递减 TTL 后发往下一跳"],
    misconception:
      "路由器不是选择数值上最接近的 IP，也不是总走默认路由；它优先使用能够匹配目的地址的最长网络前缀。",
    debugTip:
      "列出目的地址与每条路由掩码后的结果，标记所有命中项及其前缀长度；检查最终下一跳来自长度最大的命中项。",
    takeaway: "IP 提供跨网络寻址，路由器通过逐跳最长前缀匹配把数据报推向目的地。",
  },
  {
    id: 40015,
    slug: "tcp-reliable-transport",
    bookId: 3,
    category: "network",
    difficulty: "hard",
    title: "TCP 可靠传输",
    description:
      "理解 TCP 如何组合序列号、累计确认、校验与超时重传，把不可靠 IP 服务变成有序字节流。",
    keyPoints: [
      "序列号按字节定位发送数据",
      "累计 ACK 表示下一段期望的字节",
      "超时与重复确认触发丢失数据重传",
    ],
    relatedConcepts: ["滑动窗口", "往返时延", "拥塞控制"],
    tags: ["TCP", "可靠传输", "重传"],
    heroNote: "TCP 不保证每个报文段只发送一次，它保证应用最终看到无重复且有序的字节流。",
    intuition:
      "TCP 像给长信的每个字节编号：收件人不断回复下一处缺口，寄件人保留未确认副本，超时或发现缺口时就重新寄送。",
    formula: "\\mathrm{ACK}=\\mathrm{RCV.NXT}=\\min\\{k\\mid k\\text{ 尚未按序收到}\\}",
    symbols: [
      { symbol: "\\mathrm{SEQ}", meaning: "当前报文段第一个数据字节的序列号" },
      { symbol: "\\mathrm{LEN}", meaning: "当前报文段承载的数据字节数" },
      { symbol: "\\mathrm{RCV.NXT}", meaning: "接收方首个尚未按序收到、下一步期望的字节序号" },
      { symbol: "k", meaning: "TCP 字节序号空间中的候选位置" },
    ],
    flow: ["按字节编号并发送报文段", "接收方校验和重排", "返回累计 ACK", "超时或缺口出现时重传"],
    misconception:
      "ACK 值通常不是最后收到的字节编号，而是接收方下一步期望的字节编号；乱序段也不一定立即推进累计 ACK。",
    debugTip:
      "抓包记录每段 SEQ、LEN、ACK 与重传时间，把已接收字节画成区间；从旧 RCV.NXT 开始只跨过连续无缺口区间，检查新 ACK 是否恰好停在首个缺口，而不是机械等于刚到报文段的 SEQ+LEN。",
    takeaway: "TCP 用字节序号、确认和重传修补丢失与乱序，对应用呈现可靠有序的流。",
  },
  {
    id: 40016,
    slug: "congestion-control",
    bookId: 3,
    category: "network",
    difficulty: "hard",
    title: "拥塞控制",
    description:
      "理解发送方如何根据确认与丢包信号调节拥塞窗口，避免向共享网络注入超过承载能力的数据。",
    keyPoints: [
      "拥塞窗口限制网络中的未确认数据",
      "确认到达时逐步增加发送速率",
      "丢包或显式拥塞信号要求降低速率",
    ],
    relatedConcepts: ["TCP 可靠传输", "带宽时延积", "队列管理"],
    tags: ["拥塞控制", "cwnd", "AIMD"],
    heroNote: "流量控制保护接收方，拥塞控制保护路径中的共享网络，两者限制来源不同。",
    intuition:
      "本课用经典 TCP Reno 拥塞避免阶段的 AIMD 简化模型：畅通时谨慎加速，检测到拥塞损失就明显减速。其他 TCP 版本或超时路径会采用不同规则。",
    formula: "\\mathrm{cwnd}_{\\mathrm{ACK}}\\leftarrow\\mathrm{cwnd}+\\frac{\\mathrm{MSS}^2}{\\mathrm{cwnd}},\\qquad \\mathrm{cwnd}_{\\mathrm{loss}}\\leftarrow\\frac{\\mathrm{cwnd}}{2}",
    symbols: [
      { symbol: "\\mathrm{cwnd}", meaning: "发送方估计网络可容纳的未确认数据量" },
      { symbol: "\\mathrm{MSS}", meaning: "单个 TCP 报文段的最大数据长度" },
      { symbol: "\\mathrm{cwnd}_{\\mathrm{ACK}}", meaning: "拥塞避免阶段收到确认后的窗口" },
      { symbol: "\\mathrm{cwnd}_{\\mathrm{loss}}", meaning: "检测到拥塞损失后的窗口" },
    ],
    flow: ["按 cwnd 限制在途数据", "收到 ACK 后增大窗口", "持续观察 RTT 与丢包", "检测拥塞后降低窗口"],
    misconception:
      "公式描述 Reno 风格拥塞避免的简化更新，不代表所有 TCP 版本或所有丢包路径都恰好减半。丢包重传属于可靠性恢复，而缩小 cwnd 属于拥塞响应。",
    debugTip:
      "按 RTT 绘制 cwnd、在途字节数、ACK 数和丢包点；检查在途量未超过 min(cwnd,rwnd)，并确认丢包后 cwnd 确实下降。",
    takeaway: "拥塞控制依据网络反馈增减发送窗口，让单个连接提速时仍顾及共享路径容量。",
  },
  {
    id: 40017,
    slug: "dns-resolution",
    bookId: 3,
    category: "network",
    difficulty: "medium",
    title: "DNS",
    description:
      "理解域名如何经递归解析器和分层权威服务器转成资源记录，以及 TTL 如何控制缓存有效期。",
    keyPoints: [
      "DNS 名字空间按层次委派管理",
      "递归解析器替客户端追踪权威答案",
      "TTL 决定缓存记录可复用的时间",
    ],
    relatedConcepts: ["域名层次", "递归查询", "CDN"],
    tags: ["DNS", "域名解析", "缓存"],
    heroNote: "一次看似简单的域名查询，可能沿根、顶级域和权威服务器逐级找到答案。",
    intuition:
      "DNS 像分级通讯录：本地查询员若没有缓存，就先问总目录该找哪个地区，再问地区目录该找哪个机构，最后从权威目录取得具体地址。",
    formula: "t_{\\mathrm{expire}}=t_{\\mathrm{receive}}+\\mathrm{TTL}",
    symbols: [
      { symbol: "t_{\\mathrm{receive}}", meaning: "解析器收到并缓存资源记录的时刻" },
      { symbol: "\\mathrm{TTL}", meaning: "权威记录允许被缓存的存活时间" },
      { symbol: "t_{\\mathrm{expire}}", meaning: "缓存记录到期、必须重新查询的时刻" },
    ],
    flow: ["客户端询问递归解析器", "缓存未命中时查询根提示", "沿 TLD 找到权威服务器", "缓存并返回资源记录"],
    misconception:
      "DNS 不是一台保存全部域名的中央服务器；解析依赖层次委派，递归解析器也可能直接用未过期缓存回答。",
    debugTip:
      "用 dig 查看每次响应的记录类型、权威来源和剩余 TTL；连续查询时检查 TTL 是否递减，并在到期后确认产生新的上游查询。",
    takeaway: "DNS 通过层次委派找到权威记录，再用 TTL 缓存减少重复查询和解析延迟。",
  },
  {
    id: 40018,
    slug: "http-and-tls",
    bookId: 3,
    category: "network",
    difficulty: "medium",
    title: "HTTP 与 TLS",
    description:
      "理解 HTTP 请求响应语义如何运行在连接之上，以及 TLS 如何认证对端并保护传输内容。",
    keyPoints: [
      "HTTP 用方法、状态码和首部表达应用语义",
      "TLS 握手认证身份并协商会话密钥",
      "加密后的 HTTP 内容仍由可靠传输承载",
    ],
    relatedConcepts: ["TCP", "公钥证书", "HTTP/2"],
    tags: ["HTTP", "TLS", "HTTPS"],
    heroNote: "HTTPS 是 HTTP 语义经过 TLS 保护后的通信，不是另一套网页业务协议。",
    intuition:
      "访问 HTTPS 网站像先核对接线员证件并商定只有双方知道的暗号，再用加密信封交换 HTTP 请求和响应；每个阶段都会增加首字节等待。",
    formula: "T_{\\mathrm{first\\ byte}}\\approx T_{\\mathrm{DNS}}+T_{\\mathrm{connect}}+T_{\\mathrm{TLS}}+T_{\\mathrm{request}}",
    symbols: [
      { symbol: "T_{\\mathrm{first\\ byte}}", meaning: "从开始访问到收到首个响应字节的时间" },
      { symbol: "T_{\\mathrm{DNS}}", meaning: "解析服务器地址所需时间" },
      { symbol: "T_{\\mathrm{connect}}", meaning: "建立底层传输连接所需时间" },
      { symbol: "T_{\\mathrm{TLS}}", meaning: "认证对端并协商密钥的握手时间" },
      { symbol: "T_{\\mathrm{request}}", meaning: "发送请求并等待服务器首字节的时间" },
    ],
    flow: ["解析域名并建立连接", "完成证书校验与密钥协商", "加密发送 HTTP 请求", "解密并解释 HTTP 响应"],
    misconception:
      "TLS 能提供机密性、完整性和基于证书的身份认证，但不会自动证明网页业务内容真实无误或服务器没有漏洞。",
    debugTip:
      "在浏览器网络面板或 curl 计时中分别记录 DNS、connect、TLS 和 TTFB；检查证书主机名、有效期、响应状态码与解密后的首部。",
    takeaway: "HTTP 定义应用层请求响应，TLS 在其下方完成身份认证、密钥协商与传输保护。",
  },
];
