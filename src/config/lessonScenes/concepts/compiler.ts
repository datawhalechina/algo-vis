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
  }));
}

export const compilerSceneProfiles = {
  40025: {
    kind: "sequence",
    entities: [
      entity("source-text", "源文本", "input", "age+1", 0, "输入"), entity("cursor", "当前偏移 i", "control", 0, 0, "输入"),
      entity("current-char", "当前字符 c_i", "intermediate", "a", 0, "输入"), entity("automaton-state", "自动机状态 q_i", "intermediate", "start", 1, "状态"),
      entity("last-accept", "最近接受位置", "intermediate", 0, 2, "状态"), entity("tokens", "token 序列 t_j", "output", [], 3, "输出"),
      entity("token-count", "token 数 m", "output", 0, 3, "输出"),
    ],
    connections: [connection("source-char", "source-text", "current-char"), connection("char-state", "current-char", "automaton-state"), connection("state-accept", "automaton-state", "last-accept"), connection("accept-tokens", "last-accept", "tokens"), connection("source-tokens", "source-text", "tokens"), connection("tokens-count", "tokens", "token-count")],
    formulaBindings: { c_i: ["current-char"], q_i: ["automaton-state"], "\\delta": ["automaton-state"], t_j: ["tokens"] },
    frames: frames([
      { sources: ["source-text", "cursor"], targets: ["current-char"], values: { "current-char": "a" }, connections: ["source-char"], transfers: [transfer("read-a", "source-text", "current-char", "age+1", "读取偏移 0")], result: "读取字符 a", check: check("current-char", "a", "首字符为 a") },
      { sources: ["current-char", "automaton-state"], targets: ["automaton-state", "cursor"], values: { "automaton-state": "identifier", cursor: 1 }, connections: ["char-state"], transfers: [transfer("classify-a", "current-char", "automaton-state", "a", "按字母边转移")], result: "start --a--> identifier", check: check("automaton-state", "identifier", "进入标识符态") },
      { sources: ["source-text", "automaton-state"], targets: ["last-accept", "cursor", "current-char"], values: { "last-accept": 3, cursor: 3, "current-char": "+" }, connections: ["state-accept", "source-char"], transfers: [transfer("remember-age", "automaton-state", "last-accept", "identifier", "记录 age 的接受位置")], result: "扫描 age，最近接受偏移为 3", check: check("last-accept", 3, "最长标识符长度为 3") },
      { sources: ["source-text", "last-accept", "current-char"], targets: ["tokens", "token-count"], values: { tokens: ["identifier(age)"], "token-count": 1 }, connections: ["accept-tokens", "source-tokens", "tokens-count"], transfers: [transfer("emit-age", "source-text", "tokens", "age+1", "按接受位置切出 age")], result: "输出 identifier(age)", check: check("tokens", ["identifier(age)"], "最长匹配 token 已输出") },
      { sources: ["source-text", "tokens", "cursor"], targets: ["tokens", "token-count", "cursor", "current-char", "automaton-state", "last-accept"], values: { tokens: ["identifier(age)", "plus(+)", "number(1)"], "token-count": 3, cursor: 5, "current-char": "EOF", "automaton-state": "EOF", "last-accept": 5 }, connections: ["source-char", "char-state", "state-accept", "accept-tokens", "source-tokens", "tokens-count"], transfers: [transfer("scan-rest", "source-text", "tokens", "age+1", "继续扫描 + 和 1，直至 EOF")], result: "输出 identifier、plus、number，并在偏移 5 到达 EOF", check: check("token-count", 3, "age+1 必须产生 3 个 token"), checks: [check("tokens", ["identifier(age)", "plus(+)", "number(1)"], "token 类型与词素完整"), check("automaton-state", "EOF", "扫描器已收敛到 EOF"), check("last-accept", 5, "最后一个 token 在偏移 5 接受") ] },
    ]),
    explanations: ["从偏移 0 读取 a。", "自动机按字母类别进入 identifier 状态。", "继续扫描 g、e，把最近接受位置推进到 3。", "遇到 + 无法延长标识符，先输出最长词素 age。", "继续扫描 + 与数字 1，最终显式得到三个 token，而不是两个。"],
  },
  40026: {
    kind: "sequence",
    entities: [
      entity("token-stream", "输入 token", "input", ["id", "+", "id", "*", "id"], 0, "输入"),
      entity("remaining-input", "剩余输入", "intermediate", ["id", "+", "id", "*", "id"], 0, "输入"),
      entity("parse-stack", "分析栈", "control", ["$", "E"], 0, "分析器"), entity("lookahead", "向前看", "control", "id", 0, "分析器"),
      entity("production", "选中产生式", "intermediate", "none", 1, "分析器"), entity("matched-count", "已匹配 token 数", "intermediate", 0, 2, "分析器"),
      entity("ast", "增量 AST", "output", [], 2, "输出"), entity("ast-node-count", "AST 节点数", "output", 0, 3, "输出"),
      entity("accepted", "接受状态", "output", false, 4, "输出"),
    ],
    connections: [connection("tokens-remaining", "token-stream", "remaining-input"), connection("remaining-lookahead", "remaining-input", "lookahead"), connection("lookahead-production", "lookahead", "production"), connection("production-stack", "production", "parse-stack"), connection("stack-matched", "parse-stack", "matched-count"), connection("matched-ast", "matched-count", "ast"), connection("ast-count", "ast", "ast-node-count"), connection("ast-accepted", "ast", "accepted")],
    formulaBindings: { "E,E'": ["parse-stack", "production"], "T,T'": ["parse-stack", "production"], F: ["parse-stack", "production"], "\\varepsilon": ["production"], "\\mathrm{id}": ["token-stream", "lookahead"] },
    frames: frames([
      { sources: ["token-stream", "parse-stack"], targets: ["remaining-input", "lookahead"], connections: ["tokens-remaining", "remaining-lookahead"], transfers: [transfer("read-first-token", "token-stream", "remaining-input", ["id", "+", "id", "*", "id"], "载入 token 流")], result: "栈顶 E，lookahead=id", check: check("remaining-input", ["id", "+", "id", "*", "id"], "五个 token 尚未消费") },
      { sources: ["lookahead", "parse-stack"], targets: ["production", "parse-stack"], values: { production: "E->TE'; T->FT'; F->id", "parse-stack": ["$", "E'", "T'", "id"] }, connections: ["lookahead-production", "production-stack"], transfers: [transfer("select-production", "lookahead", "production", "id", "依次查表展开 E、T、F")], result: "依次展开 E->TE'、T->FT'、F->id", check: check("parse-stack", ["$", "E'", "T'", "id"], "栈顶终结符与 lookahead 同为 id"), checks: [check("production", "E->TE'; T->FT'; F->id", "展开链由 lookahead=id 唯一决定") ] },
      { sources: ["parse-stack", "remaining-input", "lookahead"], targets: ["matched-count", "remaining-input", "lookahead", "production", "parse-stack", "ast"], values: { "matched-count": 1, "remaining-input": ["+", "id", "*", "id"], lookahead: "+", production: "T'->epsilon; E'->+TE'", "parse-stack": ["$", "E'", "T", "+"], ast: ["id"] }, connections: ["remaining-lookahead", "lookahead-production", "production-stack", "stack-matched", "matched-ast"], transfers: [transfer("match-first-id", "parse-stack", "matched-count", ["$", "E'", "T", "+"], "匹配 id 后按 + 展开栈")], result: "匹配 id；用 T'->epsilon，再展开 E'->+TE'", check: check("matched-count", 1, "已消费一个 token"), checks: [check("lookahead", "+", "lookahead 已推进到 +"), check("parse-stack", ["$", "E'", "T", "+"], "栈顶 + 可与 lookahead 匹配") ] },
      { sources: ["token-stream", "remaining-input", "parse-stack", "lookahead", "ast"], targets: ["remaining-input", "lookahead", "matched-count", "parse-stack", "production", "ast", "ast-node-count"], values: { "remaining-input": [], lookahead: "EOF", "matched-count": 5, "parse-stack": ["$", "E'", "T'"], production: "T->FT'; F->id; T'->*FT'; F->id", ast: ["+", "id", "*", "id", "id"], "ast-node-count": 5 }, connections: ["tokens-remaining", "remaining-lookahead", "lookahead-production", "production-stack", "stack-matched", "matched-ast", "ast-count"], transfers: [transfer("consume-token-stream", "token-stream", "remaining-input", ["id", "+", "id", "*", "id"], "匹配 +、id、*、id")], result: "五个 token 已匹配；lookahead=EOF，栈中等待两个 epsilon", check: check("lookahead", "EOF", "接受前必须看到 EOF"), checks: [check("remaining-input", [], "五个 token 已全部消费"), check("parse-stack", ["$", "E'", "T'"], "只剩可在 EOF 下归约为空的非终结符"), check("ast", ["+", "id", "*", "id", "id"], "前序 AST 以加法为根、乘法为右子树") ] },
      { sources: ["remaining-input", "lookahead", "parse-stack", "ast"], targets: ["production", "parse-stack", "accepted", "ast-node-count"], values: { production: "T'->epsilon; E'->epsilon; accept", "parse-stack": ["$"], accepted: true, "ast-node-count": 5 }, connections: ["remaining-lookahead", "lookahead-production", "production-stack", "ast-accepted", "ast-count"], transfers: [transfer("accept-ast", "ast", "accepted", ["+", "id", "*", "id", "id"], "在 EOF 完成 epsilon 归约并接受")], result: "在 EOF 应用两个 epsilon 产生式，接受 5 节点 AST", check: check("accepted", true, "分析器进入接受态"), checks: [check("lookahead", "EOF", "接受时 lookahead 仍为 EOF"), check("production", "T'->epsilon; E'->epsilon; accept", "最终产生式明确收敛到 accept"), check("remaining-input", [], "剩余输入为空"), check("parse-stack", ["$"], "分析栈已完成"), check("matched-count", 5, "五个 token 全部匹配"), check("ast-node-count", 5, "AST 有 5 个节点") ] },
    ]),
    explanations: ["固定输入 id+id*id，共五个 token，分析栈从 E 开始。", "根据 lookahead=id 连续展开 E、T、F，此时栈顶 id 可以匹配。", "匹配首个 id 后看到 +：T' 归约为空，E' 展开加法分支，栈顶变为 +。", "依次匹配 +、id、*、id；乘法在右侧 T 中完成，因此前序 AST 为 +,id,*,id,id。", "lookahead=EOF 时，T' 与 E' 依次归约为空；输入耗尽且栈只剩 $ 后才接受。"],
  },
  40027: {
    kind: "pipeline",
    entities: [
      entity("scope", "作用域 Γ", "input", "function"), entity("declarations", "声明", "intermediate", [], 0),
      entity("name-references", "名称引用", "input", ["x", "y"], 1), entity("bindings", "名称绑定", "intermediate", [], 1),
      entity("operand-types", "操作数类型", "intermediate", [], 2), entity("expression-type", "表达式类型", "output", "unknown", 2),
      entity("constraints", "赋值/返回约束", "intermediate", [], 3), entity("constraint-count", "通过约束数", "intermediate", 0, 3),
      entity("annotated-ast", "带类型 AST", "output", "pending", 4),
    ],
    connections: [connection("scope-declarations", "scope", "declarations"), connection("refs-bindings", "name-references", "bindings"), connection("declarations-bindings", "declarations", "bindings"), connection("bindings-types", "bindings", "operand-types"), connection("types-expression", "operand-types", "expression-type"), connection("expression-constraints", "expression-type", "constraints"), connection("constraints-ast", "constraints", "annotated-ast")],
    formulaBindings: { "\\Gamma": ["scope", "declarations"], "e_1,e_2": ["operand-types"], "\\vdash": ["bindings", "expression-type"], "\\mathrm{int}": ["operand-types", "expression-type"] },
    frames: frames([
      { sources: ["scope"], targets: ["declarations"], values: { declarations: ["x:int", "y:int"] }, connections: ["scope-declarations"], transfers: [transfer("declare-symbols", "scope", "declarations", "function", "写入局部声明")], result: "Γ 包含 x:int、y:int", check: check("declarations", ["x:int", "y:int"], "两个声明进入当前作用域") },
      { sources: ["name-references", "declarations"], targets: ["bindings"], values: { bindings: ["x->x:int", "y->y:int"] }, connections: ["refs-bindings", "declarations-bindings"], transfers: [transfer("resolve-names", "name-references", "bindings", ["x", "y"], "查找唯一声明")], result: "两个引用绑定到唯一声明", check: check("bindings", ["x->x:int", "y->y:int"], "名称绑定无歧义") },
      { sources: ["bindings"], targets: ["operand-types", "expression-type"], values: { "operand-types": ["int", "int"], "expression-type": "int" }, connections: ["bindings-types", "types-expression"], transfers: [transfer("infer-operands", "bindings", "operand-types", ["x->x:int", "y->y:int"], "读取声明类型")], result: "int + int 推导为 int", check: check("expression-type", "int", "表达式类型为 int") },
      { sources: ["expression-type", "declarations"], targets: ["constraints", "constraint-count"], values: { constraints: ["assignment:int=int", "return:int=int"], "constraint-count": 2 }, connections: ["expression-constraints"], transfers: [transfer("check-types", "expression-type", "constraints", "int", "检查赋值和返回")], result: "两个类型约束均成立", check: check("constraint-count", 2, "两个约束均通过") },
      { sources: ["constraints", "expression-type"], targets: ["annotated-ast"], values: { "annotated-ast": "success:int" }, connections: ["constraints-ast"], transfers: [transfer("annotate-ast", "constraints", "annotated-ast", ["assignment:int=int", "return:int=int"], "写入类型注解")], result: "AST 标注成功且结果类型为 int", check: check("annotated-ast", "success:int", "语义检查成功"), checks: [check("expression-type", "int", "推导类型仍为 int") ] },
    ]),
    explanations: ["进入函数作用域并记录 x、y 两个 int 声明。", "每个名称引用绑定到唯一声明。", "从绑定读取操作数类型，自底向上得到 int 结果。", "赋值与返回类型约束分别核对。", "全部约束成立后，AST 才获得成功类型注解。"],
  },
  40028: {
    kind: "pipeline",
    entities: [
      entity("ast", "源 AST", "input", "if (c) x=1 else x=2; use(x)"), entity("basic-blocks", "基本块", "intermediate", [], 0),
      entity("cfg-edges", "CFG 边", "intermediate", [], 1), entity("dominance-frontier", "支配边界", "intermediate", [], 2),
      entity("phi-node", "phi 节点", "intermediate", "none", 3), entity("ssa-definitions", "SSA 定义", "output", [], 4),
      entity("ssa-definition-count", "SSA 定义数", "output", 0, 4),
    ],
    connections: [connection("ast-blocks", "ast", "basic-blocks"), connection("blocks-cfg", "basic-blocks", "cfg-edges"), connection("cfg-df", "cfg-edges", "dominance-frontier"), connection("df-phi", "dominance-frontier", "phi-node"), connection("phi-ssa", "phi-node", "ssa-definitions")],
    formulaBindings: { "x_1,x_2": ["basic-blocks", "ssa-definitions"], "\\phi": ["phi-node"], x_3: ["phi-node", "ssa-definitions"], "\\operatorname{defs}(x_i)": ["ssa-definitions"] },
    frames: frames([
      { sources: ["ast", "ast"], targets: ["basic-blocks"], values: { "basic-blocks": ["entry", "then:x=1", "else:x=2", "merge:use(x)"] }, connections: ["ast-blocks"], transfers: [transfer("lower-ast", "ast", "basic-blocks", "if (c) x=1 else x=2; use(x)", "降低为块指令")], result: "生成 entry/then/else/merge 四块", check: check("basic-blocks", ["entry", "then:x=1", "else:x=2", "merge:use(x)"], "基本块完整") },
      { sources: ["basic-blocks"], targets: ["cfg-edges"], values: { "cfg-edges": ["entry->then", "entry->else", "then->merge", "else->merge"] }, connections: ["blocks-cfg"], transfers: [transfer("connect-cfg", "basic-blocks", "cfg-edges", ["entry", "then:x=1", "else:x=2", "merge:use(x)"], "连接控制流")], result: "CFG 有四条有向边", check: check("cfg-edges", ["entry->then", "entry->else", "then->merge", "else->merge"], "控制流边完整") },
      { sources: ["cfg-edges", "basic-blocks"], targets: ["dominance-frontier"], values: { "dominance-frontier": ["merge"] }, connections: ["cfg-df"], transfers: [transfer("compute-df", "cfg-edges", "dominance-frontier", ["entry->then", "entry->else", "then->merge", "else->merge"], "计算汇合支配边界")], result: "then/else 的支配边界包含 merge", check: check("dominance-frontier", ["merge"], "phi 应放在 merge") },
      { sources: ["dominance-frontier", "basic-blocks"], targets: ["phi-node"], values: { "phi-node": "x3=phi(x1,x2)" }, connections: ["df-phi"], transfers: [transfer("insert-phi", "dominance-frontier", "phi-node", ["merge"], "在汇合点插入 phi")], result: "merge 插入 x3=phi(x1,x2)", check: check("phi-node", "x3=phi(x1,x2)", "phi 输入覆盖两个前驱") },
      { sources: ["phi-node", "basic-blocks"], targets: ["ssa-definitions", "ssa-definition-count"], values: { "ssa-definitions": ["x1=1", "x2=2", "x3=phi(x1,x2)"], "ssa-definition-count": 3 }, connections: ["phi-ssa"], transfers: [transfer("rename-ssa", "phi-node", "ssa-definitions", "x3=phi(x1,x2)", "沿支配树重命名")], result: "x1、x2、x3 各定义一次", check: check("ssa-definition-count", 3, "恰有三个 SSA 定义"), checks: [check("ssa-definitions", ["x1=1", "x2=2", "x3=phi(x1,x2)"], "SSA 定义唯一"), check("phi-node", "x3=phi(x1,x2)", "phi 输入数与前驱数一致") ] },
    ]),
    explanations: ["AST 降低成四个带具体指令的基本块。", "条件分支和汇合形成四条 CFG 边。", "两条定义路径在 merge 的支配边界相遇。", "在 merge 显式插入 x3=phi(x1,x2)。", "重命名后每个 SSA 名字恰好定义一次。"],
  },
  40029: {
    kind: "pipeline",
    entities: [
      entity("entry-env", "入口环境 σ", "input", ["param=NAC", "x=UNDEF", "y=UNDEF"]),
      entity("predecessor-outs", "前驱 OUT[P]", "input", ["P1:x=4", "P2:x=4"], 1), entity("block-in", "IN[B]", "intermediate", [], 0),
      entity("x-value", "x 的格值", "intermediate", "UNDEF", 1), entity("expression", "表达式 e=x+2", "input", "x+2", 2),
      entity("y-value", "y 的格值", "intermediate", "UNDEF", 2), entity("block-out", "OUT[B]", "intermediate", [], 2),
      entity("changed-environments", "本轮变化环境数", "control", 1, 3), entity("fixed-point", "不动点", "control", false, 3),
      entity("folded-expression", "折叠结果", "output", "none", 4),
    ],
    connections: [connection("entry-in", "entry-env", "block-in"), connection("pred-in", "predecessor-outs", "block-in"), connection("in-x", "block-in", "x-value"), connection("x-y", "x-value", "y-value"), connection("expr-y", "expression", "y-value"), connection("y-out", "y-value", "block-out"), connection("out-changed", "block-out", "changed-environments"), connection("changed-fixed", "changed-environments", "fixed-point"), connection("out-folded", "block-out", "folded-expression")],
    formulaBindings: { B: ["block-in", "block-out"], P: ["predecessor-outs"], v: ["x-value", "y-value"], e: ["expression"], "\\mathrm{IN}[B],\\mathrm{OUT}[B]": ["block-in", "block-out"], "\\operatorname{pred}(B)": ["predecessor-outs"], "\\mathcal L": ["entry-env", "x-value", "y-value"], "\\mathrm{UNDEF},\\mathrm{NAC}": ["entry-env"], "\\sqcap": ["block-in", "x-value"], "\\sigma": ["entry-env", "block-in", "block-out"], F_B: ["block-out"], "\\operatorname{Eval}(e,\\sigma)": ["expression", "y-value"] },
    frames: frames([
      { sources: ["entry-env", "entry-env"], targets: ["block-in"], values: { "block-in": ["param=NAC", "x=UNDEF", "y=UNDEF"] }, connections: ["entry-in"], transfers: [transfer("seed-environment", "entry-env", "block-in", ["param=NAC", "x=UNDEF", "y=UNDEF"], "初始化入口环境")], result: "参数为 NAC，局部量为 UNDEF", check: check("block-in", ["param=NAC", "x=UNDEF", "y=UNDEF"], "初始格值正确") },
      { sources: ["predecessor-outs", "block-in"], targets: ["block-in", "x-value"], values: { "block-in": ["x=4", "y=UNDEF"], "x-value": 4 }, connections: ["pred-in", "in-x"], transfers: [transfer("meet-preds", "predecessor-outs", "block-in", ["P1:x=4", "P2:x=4"], "逐变量 meet"), transfer("read-x", "block-in", "x-value", ["x=4", "y=UNDEF"], "读取合流后 x")], result: "相同常量 meet 后 x=4", check: check("x-value", 4, "x 保持常量 4") },
      { sources: ["x-value", "expression"], targets: ["y-value", "block-out"], values: { "y-value": 6, "block-out": ["x=4", "y=6"] }, connections: ["x-y", "expr-y", "y-out"], transfers: [transfer("x-to-y", "x-value", "y-value", 4, "代入 x+2"), transfer("eval-expression", "expression", "y-value", "x+2", "求值表达式")], result: "Eval(x+2)=6，OUT[B]={x=4,y=6}", check: check("y-value", 6, "y 的常量值为 6") },
      { sources: ["block-in", "block-out"], targets: ["changed-environments", "fixed-point"], values: { "changed-environments": 0, "fixed-point": true }, connections: ["out-changed", "changed-fixed"], transfers: [transfer("compare-rounds", "block-out", "changed-environments", ["x=4", "y=6"], "比较相邻轮环境")], result: "连续两轮环境相同，变化数为 0", check: check("changed-environments", 0, "没有环境继续变化"), checks: [check("fixed-point", true, "已达到不动点") ] },
      { sources: ["block-out", "fixed-point"], targets: ["folded-expression"], values: { "folded-expression": "x+2 -> 6" }, connections: ["out-folded"], transfers: [transfer("fold-constant", "block-out", "folded-expression", ["x=4", "y=6"], "使用稳定常量折叠")], result: "把 x+2 安全替换为 6", check: check("folded-expression", "x+2 -> 6", "只折叠稳定具体常量"), checks: [check("x-value", 4, "x=4 可追溯"), check("y-value", 6, "y=6 可追溯") ] },
    ]),
    explanations: ["入口环境分别标记运行时参数 NAC 和未定义局部量 UNDEF。", "两个前驱都给 x=4，所以 meet 后仍是具体常量 4。", "块内真实求值 x+2，得到 y=6 并写入 OUT 环境。", "下一轮没有任何环境变化，显式到达不动点。", "只有稳定的 x=4、y=6 才允许把表达式折叠为 6。"],
  },
  40030: {
    kind: "pipeline",
    entities: [
      entity("ir-operations", "IR 操作", "input", ["add", "mul", "sub"]), entity("target-instructions", "目标指令", "intermediate", [], 0),
      entity("live-ranges", "活跃区间", "intermediate", [], 1), entity("interference-edges", "干涉边 E", "intermediate", [], 1),
      entity("virtual-registers", "虚拟寄存器 V", "input", ["v1", "v2", "v3"]), entity("physical-register-count", "物理寄存器 K", "input", 2),
      entity("spill-set", "溢出集合 S", "intermediate", [], 2), entity("rewritten-ir", "重写后 IR", "intermediate", [], 3),
      entity("locations", "最终位置 rho/stack", "output", [], 4), entity("machine-instruction-count", "机器指令数", "output", 0, 4),
    ],
    connections: [connection("ir-target", "ir-operations", "target-instructions"), connection("target-live", "target-instructions", "live-ranges"), connection("live-interference", "live-ranges", "interference-edges"), connection("interference-spill", "interference-edges", "spill-set"), connection("registers-spill", "virtual-registers", "spill-set"), connection("spill-rewrite", "spill-set", "rewritten-ir"), connection("rewrite-locations", "rewritten-ir", "locations"), connection("locations-output", "locations", "machine-instruction-count")],
    formulaBindings: { V: ["virtual-registers"], S: ["spill-set"], E: ["interference-edges"], "u,v": ["interference-edges"], K: ["physical-register-count"], "r_1,\\ldots,r_K": ["physical-register-count", "locations"], "\\rho": ["locations"] },
    frames: frames([
      { sources: ["ir-operations", "virtual-registers"], targets: ["target-instructions"], values: { "target-instructions": ["ADD v1", "MUL v2", "SUB v3"] }, connections: ["ir-target"], transfers: [transfer("select-instructions", "ir-operations", "target-instructions", ["add", "mul", "sub"], "匹配机器模式")], result: "选择 3 条目标指令", check: check("target-instructions", ["ADD v1", "MUL v2", "SUB v3"], "指令选择完整") },
      { sources: ["target-instructions", "virtual-registers"], targets: ["live-ranges", "interference-edges"], values: { "live-ranges": ["v1:1-3", "v2:2-4", "v3:2-5"], "interference-edges": ["v1-v2", "v1-v3", "v2-v3"] }, connections: ["target-live", "live-interference"], transfers: [transfer("analyze-liveness", "target-instructions", "live-ranges", ["ADD v1", "MUL v2", "SUB v3"], "计算 use/def 与活跃区间")], result: "V={v1,v2,v3} 的活跃重叠形成三角干涉图", check: check("interference-edges", ["v1-v2", "v1-v3", "v2-v3"], "每条干涉边的端点都属于 V") },
      { sources: ["interference-edges", "virtual-registers", "physical-register-count"], targets: ["spill-set"], values: { "spill-set": ["v3"] }, connections: ["interference-spill", "registers-spill"], transfers: [transfer("color-graph", "interference-edges", "spill-set", ["v1-v2", "v1-v3", "v2-v3"], "用 K=2 尝试着色")], result: "三角图无法用两种颜色着色，第一轮 S={v3}", check: check("spill-set", ["v3"], "仅 v3 进入溢出集合") },
      { sources: ["spill-set", "target-instructions"], targets: ["rewritten-ir", "live-ranges", "interference-edges"], values: { "rewritten-ir": ["ADD v1", "MUL v2", "LOAD v3 <- stack[0]", "SUB v3", "STORE stack[0] <- v3"], "live-ranges": ["v1:1-2", "v2:2-2", "v3:3-5"], "interference-edges": ["v1-v2"] }, connections: ["spill-rewrite", "target-live", "live-interference"], transfers: [transfer("rewrite-spill", "spill-set", "rewritten-ir", ["v3"], "在原 SUB v3 前后插入 load/store")], result: "保留 SUB v3，并在其前后插入必要的 load/store", check: check("rewritten-ir", ["ADD v1", "MUL v2", "LOAD v3 <- stack[0]", "SUB v3", "STORE stack[0] <- v3"], "溢出重写保留原指令且共有 5 条"), checks: [check("interference-edges", ["v1-v2"], "重写后干涉图已重新计算") ] },
      { sources: ["rewritten-ir", "physical-register-count", "interference-edges"], targets: ["spill-set", "locations", "machine-instruction-count"], values: { "spill-set": [], locations: ["v1:r1", "v2:r2", "v3:stack[0]"], "machine-instruction-count": 5 }, connections: ["rewrite-locations", "locations-output"], transfers: [transfer("allocate-round-two", "rewritten-ir", "locations", ["ADD v1", "MUL v2", "LOAD v3 <- stack[0]", "SUB v3", "STORE stack[0] <- v3"], "第二轮分配")], result: "第二轮 S=empty，5 条重写指令进入最终机器代码", check: check("spill-set", [], "当前轮不再有待重写溢出值"), checks: [check("locations", ["v1:r1", "v2:r2", "v3:stack[0]"], "每个值位置明确"), check("machine-instruction-count", 5, "机器指令计数等于重写列表长度") ] },
    ]),
    explanations: ["三条 IR 操作先匹配为具体目标指令。", "从 use/def 得到活跃区间，再建立干涉边。", "K=2 无法同时容纳全部值，第一轮明确选择 S={v3}。", "插入访存后重新计算活跃范围与干涉图，而不沿用旧状态。", "第二轮的当前溢出集合已经清空，最终位置仍说明 v3 驻留栈槽。"],
  },
} satisfies ConceptSceneProfileTable;
