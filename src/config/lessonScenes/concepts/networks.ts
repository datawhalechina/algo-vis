import {
  check,
  connection,
  entity,
  transfer,
  type ConceptFrameProfile,
  type ConceptSceneProfileTable,
} from "./profile.ts";

function frames(stages: Array<{
  sources: string[];
  targets: string[];
  values?: ConceptFrameProfile["values"];
  connections?: string[];
  transfers?: ConceptFrameProfile["transfers"];
  result: string;
  check: ReturnType<typeof check>;
  checks?: ReturnType<typeof check>[];
  inputs?: string[];
  outputs?: string[];
  metrics?: string[];
  expression?: string;
}>): ConceptFrameProfile[] {
  return stages.map((stage) => ({
    sourceEntityIds: stage.sources,
    targetEntityIds: stage.targets,
    values: stage.values ?? {},
    visibleConnectionIds: stage.connections ?? [],
    transfers: stage.transfers ?? [],
    result: stage.result,
    check: stage.check,
    checks: stage.checks,
    inputEntityIds: stage.inputs,
    outputEntityIds: stage.outputs,
    metricEntityIds: stage.metrics,
    expression: stage.expression,
  }));
}

export const networkSceneProfiles = {
  40013: {
    kind: "pipeline",
    entities: [
      entity("app-payload", "应用载荷 P", "input", 0, 0, "应用层", "byte"),
      entity("tcp-header", "TCP 首部 H", "input", 20, 1, "传输层", "byte"),
      entity("tcp-segment", "TCP 段", "intermediate", 0, 1, "传输层", "byte"),
      entity("ip-header", "IP 首部 H", "input", 20, 2, "网络层", "byte"),
      entity("ip-datagram", "IP 数据报", "intermediate", 0, 2, "网络层", "byte"),
      entity("link-overhead", "链路头尾 H/T", "input", 18, 3, "链路层", "byte"),
      entity("link-frame", "链路帧", "output", 0, 3, "链路层", "byte"),
    ],
    connections: [connection("app-tcp", "app-payload", "tcp-segment"), connection("tcp-header-segment", "tcp-header", "tcp-segment"), connection("tcp-ip", "tcp-segment", "ip-datagram"), connection("ip-header-datagram", "ip-header", "ip-datagram"), connection("ip-link", "ip-datagram", "link-frame"), connection("overhead-link", "link-overhead", "link-frame")],
    formulaBindings: { P_k: ["tcp-segment", "ip-datagram", "link-frame"], H_k: ["tcp-header", "ip-header", "link-overhead"], "P_{k+1}": ["app-payload", "tcp-segment", "ip-datagram"], T_k: ["link-overhead"] },
    frames: frames([
      { sources: ["app-payload"], targets: ["app-payload"], values: { "app-payload": 100 }, result: "应用产生 100 字节载荷", check: check("app-payload", 100, "原始载荷为 100") },
      { sources: ["app-payload", "tcp-header"], targets: ["tcp-segment"], values: { "tcp-segment": 120 }, connections: ["app-tcp", "tcp-header-segment"], transfers: [transfer("payload-to-tcp", "app-payload", "tcp-segment", 100, "载荷下传"), transfer("tcp-header", "tcp-header", "tcp-segment", 20, "加入 TCP 首部")], result: "TCP 段长 120 字节", check: check("tcp-segment", 120, "100+20=120") },
      { sources: ["tcp-segment", "ip-header"], targets: ["ip-datagram"], values: { "ip-datagram": 140 }, connections: ["tcp-ip", "ip-header-datagram"], transfers: [transfer("segment-to-ip", "tcp-segment", "ip-datagram", 120, "TCP 段下传"), transfer("ip-header", "ip-header", "ip-datagram", 20, "加入 IP 首部")], result: "IP 数据报长 140 字节", check: check("ip-datagram", 140, "120+20=140") },
      { sources: ["ip-datagram", "link-overhead"], targets: ["link-frame"], values: { "link-frame": 158 }, connections: ["ip-link", "overhead-link"], transfers: [transfer("datagram-to-link", "ip-datagram", "link-frame", 140, "数据报下传"), transfer("link-fields", "link-overhead", "link-frame", 18, "加入链路字段")], result: "发送 158 字节链路帧", check: check("link-frame", 158, "140+18=158"), checks: [check("app-payload", 100, "原始载荷保持不变")] },
    ]),
    explanations: ["应用产生 100 字节原始载荷。", "TCP 首部与载荷共同组成 120 字节段。", "网络层再封装为 140 字节数据报。", "链路层加入 18 字节头尾后发送 158 字节帧。"],
  },
  40014: {
    kind: "graph",
    entities: [
      entity("packet", "输入数据报", "input", "packet#1"), entity("destination-address", "目的地址 d", "input", "10.1.2.9"),
      entity("route-table", "路由表 R", "input", ["0.0.0.0/0 -> 1", "10.0.0.0/8 -> 4", "10.1.2.0/24 -> 7"]),
      entity("matching-prefixes", "匹配前缀", "intermediate", [], 1), entity("selected-route", "最长匹配 r*", "intermediate", "none", 2),
      entity("next-hop", "下一跳", "output", 0, 2), entity("ttl", "TTL", "control", 64), entity("forwarded-packet", "转发数据报", "output", "pending", 3),
    ],
    connections: [connection("packet-destination", "packet", "destination-address"), connection("destination-matches", "destination-address", "matching-prefixes"), connection("table-matches", "route-table", "matching-prefixes"), connection("matches-selected", "matching-prefixes", "selected-route"), connection("route-hop", "selected-route", "next-hop"), connection("packet-forwarded", "packet", "forwarded-packet"), connection("hop-forwarded", "next-hop", "forwarded-packet"), connection("ttl-forwarded", "ttl", "forwarded-packet")],
    formulaBindings: { d: ["destination-address"], R: ["route-table"], p_r: ["matching-prefixes"], "\\ell(p_r)": ["matching-prefixes", "selected-route"], "r^*": ["selected-route"] },
    frames: frames([
      { sources: ["packet", "destination-address"], targets: ["destination-address"], connections: ["packet-destination"], transfers: [transfer("read-destination", "packet", "destination-address", "packet#1", "读取 IP 目的字段")], result: "读取 d=10.1.2.9，TTL=64", check: check("destination-address", "10.1.2.9", "目的地址完整可见") },
      { sources: ["destination-address", "route-table"], targets: ["matching-prefixes"], values: { "matching-prefixes": ["0.0.0.0/0", "10.0.0.0/8", "10.1.2.0/24"] }, connections: ["destination-matches", "table-matches"], transfers: [transfer("address-to-matches", "destination-address", "matching-prefixes", "10.1.2.9", "逐位匹配目的地址"), transfer("routes-to-matches", "route-table", "matching-prefixes", ["0.0.0.0/0 -> 1", "10.0.0.0/8 -> 4", "10.1.2.0/24 -> 7"], "筛选路由表")], result: "默认、/8、/24 三条均匹配", check: check("matching-prefixes", ["0.0.0.0/0", "10.0.0.0/8", "10.1.2.0/24"], "匹配集合完整") },
      { sources: ["matching-prefixes"], targets: ["selected-route", "next-hop"], values: { "selected-route": "10.1.2.0/24", "next-hop": 7 }, connections: ["matches-selected", "route-hop"], transfers: [transfer("choose-longest", "matching-prefixes", "selected-route", ["0.0.0.0/0", "10.0.0.0/8", "10.1.2.0/24"], "比较前缀长度"), transfer("route-to-hop", "selected-route", "next-hop", "10.1.2.0/24", "读取下一跳")], result: "r*=10.1.2.0/24，下一跳 7", check: check("selected-route", "10.1.2.0/24", "选择最长 /24"), checks: [check("next-hop", 7, "下一跳来自所选条目")] },
      { sources: ["packet", "ttl", "next-hop"], targets: ["ttl", "forwarded-packet"], values: { ttl: 63, "forwarded-packet": "packet#1 -> hop 7" }, connections: ["packet-forwarded", "hop-forwarded", "ttl-forwarded"], transfers: [transfer("forward-packet", "packet", "forwarded-packet", "packet#1", "沿下一跳转发"), transfer("hop-choice", "next-hop", "forwarded-packet", 7, "应用下一跳")], result: "TTL 递减为 63 后发往下一跳 7", check: check("ttl", 63, "TTL 恰好减一"), checks: [check("next-hop", 7, "转发下一跳为 7"), check("selected-route", "10.1.2.0/24", "转发使用最长前缀") ] },
    ]),
    explanations: ["路由器从数据报读取完整目的地址 10.1.2.9 和 TTL=64。", "地址同时匹配默认路由、/8 和 /24 三个候选。", "比较前缀长度后显式选择 /24，并从该条目读取下一跳 7。", "转发前 TTL 变为 63，数据报沿下一跳 7 发出。"],
  },
  40015: {
    kind: "pipeline",
    entities: [
      entity("segment-seq", "当前段 SEQ", "input", 100), entity("segment-length", "当前段 LEN", "input", 4),
      entity("sent-interval", "已发送区间", "intermediate", [], 0), entity("later-segment", "后续到达区间", "input", [104, 108], 1),
      entity("out-of-order", "乱序缓存区间", "intermediate", [], 1),
      entity("cumulative-ack", "累计 ACK / RCV.NXT", "output", 0, 2), entity("missing-byte", "首个缺失字节 k", "control", 0, 2),
      entity("retransmit-seq", "重传 SEQ", "output", "pending", 3), entity("delivered-interval", "连续交付区间", "output", [], 3),
    ],
    connections: [connection("seq-sent", "segment-seq", "sent-interval"), connection("len-sent", "segment-length", "sent-interval"), connection("later-buffer", "later-segment", "out-of-order"), connection("buffer-ack", "out-of-order", "cumulative-ack"), connection("ack-missing", "cumulative-ack", "missing-byte"), connection("missing-retransmit", "missing-byte", "retransmit-seq"), connection("retransmit-delivered", "retransmit-seq", "delivered-interval")],
    formulaBindings: { "\\mathrm{SEQ}": ["segment-seq", "retransmit-seq"], "\\mathrm{LEN}": ["segment-length"], "\\mathrm{RCV.NXT}": ["cumulative-ack"], k: ["missing-byte"] },
    frames: frames([
      { sources: ["segment-seq", "segment-length"], targets: ["sent-interval"], values: { "sent-interval": [100, 104] }, connections: ["seq-sent", "len-sent"], transfers: [transfer("seq-to-interval", "segment-seq", "sent-interval", 100, "区间左端"), transfer("len-to-interval", "segment-length", "sent-interval", 4, "计算区间右端")], result: "发送区间 [100,104)", check: check("sent-interval", [100, 104], "SEQ 与 LEN 定义区间") },
      { sources: ["later-segment", "sent-interval"], targets: ["out-of-order"], values: { "out-of-order": [104, 108] }, connections: ["later-buffer"], transfers: [transfer("buffer-later-segment", "later-segment", "out-of-order", [104, 108], "后续段先到达")], result: "缓存乱序区间 [104,108)", check: check("out-of-order", [104, 108], "缓存 4 个后续字节") },
      { sources: ["sent-interval", "out-of-order"], targets: ["cumulative-ack", "missing-byte"], values: { "cumulative-ack": 100, "missing-byte": 100 }, connections: ["buffer-ack", "ack-missing"], transfers: [transfer("gap-to-ack", "out-of-order", "cumulative-ack", [104, 108], "缺口限制累计确认"), transfer("ack-to-missing", "cumulative-ack", "missing-byte", 100, "ACK 指向首个缺失字节")], result: "缺口仍在 100，ACK 保持 100", check: check("cumulative-ack", 100, "累计 ACK 不越过缺口") },
      { sources: ["missing-byte", "segment-length"], targets: ["retransmit-seq", "delivered-interval"], values: { "retransmit-seq": 100, "delivered-interval": [100, 108] }, connections: ["missing-retransmit", "retransmit-delivered"], transfers: [transfer("retransmit-gap", "missing-byte", "retransmit-seq", 100, "重传缺失起点"), transfer("fill-gap", "retransmit-seq", "delivered-interval", 100, "补齐连续区间")], result: "重传 SEQ=100 后连续交付 [100,108)", check: check("retransmit-seq", 100, "重传起点就是缺口"), checks: [check("delivered-interval", [100, 108], "缓存数据可连续交付") ] },
    ]),
    explanations: ["当前段明确从 SEQ=100 开始，长度 4，覆盖 [100,104)。", "后续 [104,108) 先到达，只能暂存在乱序缓存。", "首个缺失字节仍是 100，因此累计 ACK 必须保持 100。", "重传标记此时才出现为 100，补齐后才能连续交付到 108。"],
  },
  40016: {
    kind: "pipeline",
    entities: [
      entity("current-cwnd", "当前 cwnd", "input", 8), entity("mss", "MSS", "input", 1),
      entity("in-flight", "允许在途段数", "intermediate", 0), entity("ack-cwnd", "ACK 后 cwnd", "intermediate", 0, 1),
      entity("rtt", "观测 RTT", "intermediate", 0, 2, undefined, "ms"), entity("loss-signal", "拥塞损失", "control", false, 2),
      entity("loss-cwnd", "丢包后 cwnd", "output", 0, 3),
    ],
    connections: [connection("cwnd-flight", "current-cwnd", "in-flight"), connection("mss-flight", "mss", "in-flight"), connection("cwnd-ack", "current-cwnd", "ack-cwnd"), connection("mss-ack", "mss", "ack-cwnd"), connection("ack-rtt", "ack-cwnd", "rtt"), connection("rtt-loss", "rtt", "loss-signal"), connection("ack-loss-window", "ack-cwnd", "loss-cwnd"), connection("loss-window", "loss-signal", "loss-cwnd")],
    formulaBindings: { "\\mathrm{cwnd}": ["current-cwnd"], "\\mathrm{MSS}": ["mss"], "\\mathrm{cwnd}_{\\mathrm{ACK}}": ["ack-cwnd"], "\\mathrm{cwnd}_{\\mathrm{loss}}": ["loss-cwnd"] },
    frames: frames([
      { sources: ["current-cwnd", "mss"], targets: ["in-flight"], values: { "in-flight": 8 }, connections: ["cwnd-flight", "mss-flight"], transfers: [transfer("window-budget", "current-cwnd", "in-flight", 8, "窗口限制在途量"), transfer("segment-unit", "mss", "in-flight", 1, "以 MSS 为单位")], result: "cwnd=8、MSS=1，允许 8 段在途", check: check("in-flight", 8, "在途上限为 8") },
      { sources: ["current-cwnd", "mss"], targets: ["ack-cwnd"], values: { "ack-cwnd": 8.125 }, connections: ["cwnd-ack", "mss-ack"], transfers: [transfer("cwnd-to-ack", "current-cwnd", "ack-cwnd", 8, "旧窗口参与更新"), transfer("mss-to-ack", "mss", "ack-cwnd", 1, "MSS 参与增量")], result: "8+1^2/8=8.125", check: check("ack-cwnd", 8.125, "ACK 后窗口正确") },
      { sources: ["ack-cwnd", "in-flight"], targets: ["rtt", "loss-signal"], values: { rtt: 80, "loss-signal": true }, connections: ["ack-rtt", "rtt-loss"], transfers: [], result: "观测 RTT=80ms 并检测到丢包", check: check("rtt", 80, "RTT 样本为 80ms") },
      { sources: ["ack-cwnd", "loss-signal"], targets: ["loss-cwnd"], values: { "loss-cwnd": 4.0625 }, connections: ["ack-loss-window", "loss-window"], transfers: [transfer("halve-window", "ack-cwnd", "loss-cwnd", 8.125, "丢包触发减半"), transfer("loss-event", "loss-signal", "loss-cwnd", true, "应用拥塞反馈")], result: "丢包后 cwnd=8.125/2=4.0625", check: check("loss-cwnd", 4.0625, "损失窗口正确"), checks: [check("current-cwnd", 8, "原始窗口仍可核对"), check("mss", 1, "MSS 为 1") ] },
    ]),
    explanations: ["当前 cwnd=8、MSS=1，明确得到 8 个在途段的预算。", "收到 ACK 后从原始窗口计算出 8.125。", "持续观测到 80ms RTT，并把丢包记为拥塞信号。", "损失更新读取 ACK 后窗口 8.125，减半得到 4.0625。"],
  },
  40017: {
    kind: "graph",
    entities: [
      entity("query-name", "查询名称", "input", "example.test"), entity("recursive-resolver", "递归解析器", "intermediate", "cache-miss"),
      entity("root-referral", "根委派", "intermediate", ".test NS", 1), entity("tld-referral", "TLD 委派", "intermediate", "ns.example.test", 2),
      entity("authoritative-server", "权威服务器", "intermediate", "ns.example.test", 2), entity("answer-address", "A 记录地址", "output", "", 2),
      entity("receive-time", "接收时刻", "input", 0), entity("ttl", "TTL", "input", 3600), entity("expiry-time", "缓存到期时刻", "output", 0, 3),
    ],
    connections: [connection("query-resolver", "query-name", "recursive-resolver"), connection("resolver-root", "recursive-resolver", "root-referral"), connection("root-tld", "root-referral", "tld-referral"), connection("tld-auth", "tld-referral", "authoritative-server"), connection("auth-answer", "authoritative-server", "answer-address"), connection("answer-expiry", "answer-address", "expiry-time"), connection("ttl-expiry", "ttl", "expiry-time")],
    formulaBindings: { "t_{\\mathrm{receive}}": ["receive-time"], "\\mathrm{TTL}": ["ttl"], "t_{\\mathrm{expire}}": ["expiry-time"] },
    frames: frames([
      { sources: ["query-name"], targets: ["recursive-resolver"], values: { "recursive-resolver": "query-received" }, connections: ["query-resolver"], transfers: [transfer("client-query", "query-name", "recursive-resolver", "example.test", "提交递归查询")], result: "解析器收到 example.test", check: check("recursive-resolver", "query-received", "查询已到达解析器") },
      { sources: ["recursive-resolver"], targets: ["root-referral"], values: {}, connections: ["resolver-root"], transfers: [transfer("ask-root", "recursive-resolver", "root-referral", "query-received", "查询根服务器")], result: "根返回 .test 委派", check: check("root-referral", ".test NS", "根只返回委派") },
      { sources: ["root-referral", "tld-referral", "authoritative-server"], targets: ["answer-address"], values: { "answer-address": "192.0.2.34" }, connections: ["root-tld", "tld-auth", "auth-answer"], transfers: [transfer("root-to-tld", "root-referral", "tld-referral", ".test NS", "沿委派查询 TLD"), transfer("auth-answer", "authoritative-server", "answer-address", "ns.example.test", "权威服务器返回记录")], result: "权威服务器返回 192.0.2.34", check: check("answer-address", "192.0.2.34", "答案来自权威记录") },
      { sources: ["answer-address", "receive-time", "ttl"], targets: ["expiry-time", "recursive-resolver"], values: { "expiry-time": 3600, "recursive-resolver": "cached-and-returned" }, connections: ["answer-expiry", "ttl-expiry", "query-resolver"], transfers: [transfer("cache-answer", "answer-address", "expiry-time", "192.0.2.34", "缓存答案"), transfer("ttl-to-expiry", "ttl", "expiry-time", 3600, "计算到期时刻")], result: "缓存到 3600 秒并返回地址", check: check("expiry-time", 3600, "到期时刻为 receive+TTL"), checks: [check("answer-address", "192.0.2.34", "缓存值与权威答案一致") ] },
    ]),
    explanations: ["客户端先把域名交给递归解析器，此时答案尚不可见。", "缓存未命中后，根只提供 .test 的委派。", "沿 TLD 到权威服务器后才揭示完整地址 192.0.2.34。", "以接收时刻 0 加 TTL=3600 得到缓存到期时刻。"],
  },
  40018: {
    kind: "pipeline",
    entities: [
      entity("dns-time", "DNS 耗时", "input", 15, 0, undefined, "ms"),
      entity("connect-time", "连接耗时", "input", 25, 0, undefined, "ms"),
      entity("tls-time", "TLS 耗时", "input", 30, 0, undefined, "ms"),
      entity("request-time", "请求阶段总耗时 T_request", "intermediate", 50, 0, undefined, "ms"),
      entity("request-send-duration", "请求发送与传播耗时", "input", 20, 2, undefined, "ms"),
      entity("server-first-byte-duration", "服务端处理与首字节返回耗时", "input", 30, 2, undefined, "ms"),
      entity("connection-ready", "连接就绪时刻", "intermediate", 0),
      entity("tls-ready", "TLS 就绪时刻", "intermediate", 0, 1),
      entity("request-sent", "请求发出时刻", "intermediate", 0, 2),
      entity("first-byte-time", "首字节总耗时", "output", 0, 3),
    ],
    connections: [
      connection("dns-connection", "dns-time", "connection-ready"),
      connection("connect-connection", "connect-time", "connection-ready"),
      connection("connection-tls", "connection-ready", "tls-ready"),
      connection("tls-duration-ready", "tls-time", "tls-ready"),
      connection("tls-request", "tls-ready", "request-sent"),
      connection("send-duration-request", "request-send-duration", "request-sent"),
      connection("send-duration-total", "request-send-duration", "request-time"),
      connection("server-duration-total", "server-first-byte-duration", "request-time"),
      connection("request-first", "request-sent", "first-byte-time"),
      connection("server-duration-first", "server-first-byte-duration", "first-byte-time"),
      connection("dns-first", "dns-time", "first-byte-time"),
      connection("connect-first", "connect-time", "first-byte-time"),
      connection("tls-first", "tls-time", "first-byte-time"),
      connection("request-total-first", "request-time", "first-byte-time"),
    ],
    formulaBindings: { "T_{\\mathrm{first\\ byte}}": ["first-byte-time"], "T_{\\mathrm{DNS}}": ["dns-time"], "T_{\\mathrm{connect}}": ["connect-time"], "T_{\\mathrm{TLS}}": ["tls-time"], "T_{\\mathrm{request}}": ["request-time"] },
    frames: frames([
      {
        sources: ["dns-time", "connect-time"],
        targets: ["connection-ready"],
        values: { "connection-ready": 40 },
        connections: ["dns-connection", "connect-connection"],
        transfers: [
          transfer("dns-duration", "dns-time", "connection-ready", 15, "DNS 阶段"),
          transfer("connect-duration", "connect-time", "connection-ready", 25, "连接阶段"),
        ],
        expression: "15+25=40\\,\\mathrm{ms}",
        result: "15+25=40ms 时连接就绪",
        check: check("connection-ready", 40, "连接累计时刻为 40ms"),
        checks: [check("dns-time", 15, "DNS 耗时为 15ms"), check("connect-time", 25, "连接耗时为 25ms")],
      },
      {
        sources: ["connection-ready", "tls-time"],
        targets: ["tls-ready"],
        values: { "tls-ready": 70 },
        connections: ["connection-tls", "tls-duration-ready"],
        transfers: [
          transfer("connection-to-tls", "connection-ready", "tls-ready", 40, "连接后开始 TLS"),
          transfer("tls-duration", "tls-time", "tls-ready", 30, "TLS 握手"),
        ],
        expression: "40+30=70\\,\\mathrm{ms}",
        result: "40+30=70ms 时 TLS 就绪",
        check: check("tls-ready", 70, "TLS 累计时刻为 70ms"),
        checks: [check("connection-ready", 40, "TLS 从连接就绪时刻开始"), check("tls-time", 30, "TLS 握手耗时为 30ms")],
      },
      {
        sources: ["tls-ready", "request-send-duration", "server-first-byte-duration"],
        targets: ["request-sent", "request-time"],
        values: { "request-sent": 90, "request-time": 50 },
        connections: ["tls-request", "send-duration-request", "send-duration-total", "server-duration-total"],
        transfers: [
          transfer("tls-ready-to-request", "tls-ready", "request-sent", 70, "从 TLS 就绪时刻发送"),
          transfer("send-request", "request-send-duration", "request-sent", 20, "请求发送与传播"),
          transfer("send-part", "request-send-duration", "request-time", 20, "请求阶段前半段"),
          transfer("server-part", "server-first-byte-duration", "request-time", 30, "请求阶段后半段"),
        ],
        expression: "t_{\\mathrm{send}}=70+20=90,\\quad T_{\\mathrm{request}}=20+30=50\\,\\mathrm{ms}",
        result: "发送传播 20ms：请求于 90ms 发出；请求阶段共 20+30=50ms",
        check: check("request-sent", 90, "请求发送累计时刻为 90ms"),
        checks: [check("request-time", 50, "请求阶段拆分为 20+30=50ms"), check("request-send-duration", 20, "发送传播耗时为 20ms"), check("server-first-byte-duration", 30, "处理与返回耗时为 30ms")],
      },
      {
        sources: ["request-sent", "server-first-byte-duration", "dns-time", "connect-time", "tls-time", "request-time"],
        targets: ["first-byte-time"],
        values: { "first-byte-time": 120 },
        connections: ["request-first", "server-duration-first", "dns-first", "connect-first", "tls-first", "request-total-first"],
        transfers: [
          transfer("request-to-first-byte", "request-sent", "first-byte-time", 90, "从请求发出时刻等待"),
          transfer("server-to-first-byte", "server-first-byte-duration", "first-byte-time", 30, "服务端处理并返回首字节"),
          transfer("dns-to-total", "dns-time", "first-byte-time", 15, "DNS 耗时进入总和"),
          transfer("connect-to-total", "connect-time", "first-byte-time", 25, "连接耗时进入总和"),
          transfer("tls-to-total", "tls-time", "first-byte-time", 30, "TLS 耗时进入总和"),
          transfer("request-total", "request-time", "first-byte-time", 50, "完整请求阶段进入总和"),
        ],
        expression: "90+30=15+25+30+50=120\\,\\mathrm{ms}",
        result: "90+30=15+25+30+50=120ms，收到首字节",
        check: check("first-byte-time", 120, "四阶段总和为 120ms"),
        checks: [check("request-sent", 90, "首字节等待从 90ms 开始"), check("request-time", 50, "请求阶段总耗时保持 50ms"), check("server-first-byte-duration", 30, "最后一段耗时为 30ms")],
      },
    ]),
    explanations: [
      "DNS 15ms 与连接 25ms 是独立时长，累计到 40ms。",
      "连接就绪后 TLS 再消耗 30ms，累计时刻变为 70ms。",
      "请求发送与传播用 20ms，所以发出时刻为 90ms；再加后续 30ms，T_request 恰为 50ms。",
      "服务端处理与首字节返回用 30ms，因此 90+30=120ms；按公式复算也是 15+25+30+50=120ms。",
    ],
  },
} satisfies ConceptSceneProfileTable;
