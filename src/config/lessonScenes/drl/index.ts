import { drlLessonBlueprints } from "../../drlLessonBlueprints.ts";
import type {
  EntityRole,
  LessonSceneConnection,
  LessonSceneEntity,
  LessonSceneFrame,
  LessonSceneKind,
  LessonSceneSpec,
  SceneDebugAssertion,
  SceneEntityState,
  SceneValue,
} from "../../lessonSceneTypes.ts";

interface DrlEntity {
  id: string;
  label: string;
  value: SceneValue;
  role?: EntityRole;
}

interface DrlFrame {
  sources: readonly string[];
  targets: readonly string[];
  writes: Readonly<Record<string, SceneValue>>;
  expression: string;
  transfers?: readonly (readonly [from: string, to: string])[];
  assertion?: Omit<SceneDebugAssertion, "entityId"> & { entityId?: string };
  explanation?: string;
}

interface DrlSceneProfile {
  kind: Extract<LessonSceneKind, "graph" | "sequence" | "distribution" | "pipeline">;
  entities: readonly DrlEntity[];
  frames: readonly DrlFrame[];
  bindings: Readonly<Record<string, string>>;
  distribution?: {
    xLabel: string;
    yLabel: string;
    yDomain: readonly [number, number];
  };
}

const tex = String.raw;

const entity = (
  id: string,
  label: string,
  value: SceneValue,
  role?: EntityRole,
): DrlEntity => ({ id, label, value, role });

const frame = (
  sources: readonly string[],
  targets: readonly string[],
  writes: Readonly<Record<string, SceneValue>>,
  expression: string,
  transfers?: readonly (readonly [from: string, to: string])[],
  assertion?: DrlFrame["assertion"],
  explanation?: string,
): DrlFrame => ({ sources, targets, writes, expression, transfers, assertion, explanation });

const sceneKindLabels: Record<DrlSceneProfile["kind"], string> = {
  graph: "状态关系图",
  sequence: "轨迹序列",
  distribution: "概率与信号分布",
  pipeline: "数据流水线",
};

export const drlSceneProfiles = new Map<number, DrlSceneProfile>([
  [30001, {
    kind: "graph",
    entities: [
      entity("state", "当前状态 s0", 0, "input"),
      entity("sensor", "状态观测有效", 1, "control"),
      entity("observation", "送入策略的观测", 0),
      entity("policy-before", "当前策略 π", 0.6),
      entity("action", "动作：向右", 0),
      entity("next-state", "新状态 s1", 0),
      entity("reward", "即时奖励 r1", 0),
      entity("future-reward", "下一步奖励 r2", 1, "input"),
      entity("discount", "折扣因子 γ", 0.8, "control"),
      entity("return", "折扣回报 G0", 0),
      entity("policy-after", "改进后的策略 π'", 0.6, "output"),
    ],
    bindings: { r_t: "reward", [tex`\gamma`]: "discount", G_t: "return" },
    frames: [
      frame(["state", "sensor"], ["observation"], { observation: 0 }, tex`o_0=\operatorname{observe}(s_0)`),
      frame(["observation", "policy-before"], ["action"], { action: 1 }, tex`a_0\sim\pi(\cdot\mid s_0)`),
      frame(["state", "action"], ["next-state", "reward"], { "next-state": 1, reward: 2 }, tex`(s_1,r_1)=P(\cdot\mid s_0,a_0)`),
      frame(
        ["reward", "future-reward", "discount", "policy-before"],
        ["return", "policy-after"],
        { return: 2.8, "policy-after": 0.64 },
        tex`G_0=r_1+\gamma r_2=2+0.8\times1=2.8`,
        undefined,
        { label: "回报必须等于手算的折扣和", entityId: "return", operator: "approx", expected: 2.8 },
      ),
    ],
  }],
  [30002, {
    kind: "graph",
    entities: [
      entity("transition", "转移样本 (s,a,r,s')", 1, "input"),
      entity("observed-transition", "已读取转移样本", 0),
      entity("q-before", "更新前 Q(s,a)", 0.2),
      entity("q-current", "读取的 Q(s,a)", 0),
      entity("reward", "即时奖励 r", 0.1),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("next-q-values", "下一状态候选 Q", [0.7, 0.4]),
      entity("selected-action", "贪婪动作索引", 0),
      entity("max-next-q", "最大下一状态价值", 0),
      entity("td-target", "Bellman 目标", 0),
      entity("learning-rate", "学习率 α", 0.3, "control"),
      entity("q-after", "更新后 Q(s,a)", 0.2, "output"),
    ],
    bindings: { "Q(s,a)": "q-before", r_t: "reward", [tex`\gamma`]: "discount" },
    frames: [
      frame(["transition", "reward"], ["observed-transition"], { "observed-transition": 1 }, tex`(s,a,r,s')\ \text{已读入},\quad r=0.1`),
      frame(["observed-transition", "q-before"], ["q-current"], { "q-current": 0.2 }, tex`Q(s,a)=0.2`),
      frame(
        ["next-q-values"],
        ["max-next-q", "selected-action"],
        { "selected-action": 0, "max-next-q": 0.7 },
        tex`a^*=\arg\max_{a'}Q(s',a')=0,\quad \max Q=0.7`,
      ),
      frame(
        ["reward", "discount", "max-next-q", "q-current", "learning-rate"],
        ["td-target", "q-after"],
        { "td-target": 0.73, "q-after": 0.359 },
        tex`y=0.1+0.9\times0.7=0.73,\quad Q'=0.2+0.3(0.73-0.2)=0.359`,
        undefined,
        { label: "更新值必须位于旧值和目标之间", entityId: "q-after", operator: "range", expected: [0.2, 0.73] },
      ),
    ],
  }],
  [30003, {
    kind: "distribution",
    entities: [
      entity("state", "当前状态", 0.6, "input"),
      entity("policy-before", "当前动作概率 π(a|s)", 0.35),
      entity("sampled-action", "采样动作", 0),
      entity("trajectory-probability", "轨迹中动作概率", 0),
      entity("reward-trace", "奖励序列", [1, 0.5]),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("return", "折扣回报 Gt", 0),
      entity("objective", "目标 J(θ)", 0),
      entity("logprob-gradient", "对数概率梯度", 0.425),
      entity("weighted-gradient", "回报加权梯度", 0),
      entity("policy-learning-rate", "策略学习率", 0.1, "control"),
      entity("theta-before", "策略参数 θ", 1, "control"),
      entity("theta-after", "更新后参数 θ'", 1),
      entity("policy-after", "更新后动作概率", 0.35, "output"),
    ],
    bindings: { [tex`\pi(a\mid s)`]: "policy-before", [tex`\theta`]: "theta-before", [tex`J(\theta)`]: "objective" },
    distribution: { xLabel: "策略梯度中的可见量", yLabel: "概率或训练信号", yDomain: [0, 1.5] },
    frames: [
      frame(["state", "policy-before"], ["trajectory-probability", "sampled-action"], { "sampled-action": 1, "trajectory-probability": 0.35 }, tex`a_t\sim\pi_\theta(\cdot\mid s_t)`),
      frame(["reward-trace", "discount"], ["return", "objective"], { return: 1.45, objective: 1.45 }, tex`G_t=1+0.9\times0.5=1.45`),
      frame(["return", "logprob-gradient", "policy-before", "policy-learning-rate"], ["weighted-gradient", "policy-after"], { "weighted-gradient": 0.61625, "policy-after": 0.411625 }, tex`g=1.45\times0.425=0.61625,\quad\pi'=0.35+0.1g=0.411625`),
      frame(["theta-before", "weighted-gradient", "policy-learning-rate"], ["theta-after"], { "theta-after": 1.061625 }, tex`\theta'=1+0.1\times0.61625=1.061625`),
    ],
  }],
  [30004, {
    kind: "graph",
    entities: [
      entity("state", "状态 s", 0.2, "input"),
      entity("actor-before", "更新前 Actor 概率", 0.55),
      entity("action", "采样动作", 0),
      entity("reward", "即时奖励 r", 0),
      entity("next-state", "下一状态 s'", 0),
      entity("value-current", "Critic V(s)", 0.4),
      entity("value-next", "Critic V(s')", 0.58),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("td-error", "TD 误差 δ", 0),
      entity("actor-learning-rate", "Actor 学习率", 0.02, "control"),
      entity("critic-learning-rate", "Critic 学习率", 0.1, "control"),
      entity("actor-after", "更新后 Actor 概率", 0.55, "output"),
      entity("critic-after", "更新后 Critic V(s)", 0.4, "output"),
    ],
    bindings: { [tex`\pi(a\mid s)`]: "actor-before", "V(s)": "value-current", [tex`\delta_t`]: "td-error" },
    frames: [
      frame(["state", "actor-before"], ["action"], { action: 1 }, tex`a_t\sim\pi(\cdot\mid s_t)`),
      frame(["state", "action"], ["reward", "next-state"], { reward: 1, "next-state": 0.7 }, tex`(r_{t+1},s_{t+1})=P(s_t,a_t)`, [["state", "reward"], ["action", "reward"], ["state", "next-state"], ["action", "next-state"]]),
      frame(["reward", "discount", "value-next", "value-current"], ["td-error"], { "td-error": 1.122 }, tex`\delta_t=1+0.9\times0.58-0.4=1.122`, undefined, { label: "TD 误差必须等于奖励加自举值减当前值", entityId: "td-error", operator: "approx", expected: 1.122 }),
      frame(["actor-before", "value-current", "td-error", "actor-learning-rate", "critic-learning-rate"], ["actor-after", "critic-after"], { "actor-after": 0.57244, "critic-after": 0.5122 }, tex`\pi'=0.55+0.02\times1.122=0.57244,\quad V'=0.4+0.1\times1.122=0.5122`),
    ],
  }],
  [30005, {
    kind: "graph",
    entities: [
      entity("root-state", "根节点状态", 1, "input"),
      entity("policy-prior", "策略先验 P(s,a)", 0.45),
      entity("edge-q", "搜索平均价值 Q(s,a)", 0.35),
      entity("parent-visits", "父节点访问次数 N(s)", 12),
      entity("edge-visits", "动作边访问次数 N(s,a)", 3),
      entity("exploration-coefficient", "探索系数 c_puct", 1.5, "control"),
      entity("puct-score", "PUCT 分支分数", 0),
      entity("selected-branch", "选中分支", 0),
      entity("leaf-state", "扩展的新局面", 0),
      entity("leaf-value", "价值网络叶子估值", 0),
      entity("q-after", "回传后 Q(s,a)", 0.35, "output"),
    ],
    bindings: { "P(s,a)": "policy-prior", "Q(s,a)": "edge-q", "N(s)": "parent-visits", "N(s,a)": "edge-visits", [tex`c_{puct}`]: "exploration-coefficient" },
    frames: [
      frame(["policy-prior", "edge-q", "parent-visits", "edge-visits", "exploration-coefficient"], ["puct-score", "selected-branch"], { "puct-score": 0.934567, "selected-branch": 1 }, tex`U=0.35+1.5\times0.45\frac{\sqrt{12}}{1+3}=0.934567`),
      frame(["root-state", "selected-branch"], ["leaf-state"], { "leaf-state": 1 }, tex`s_{leaf}=P(s_{root},a^*)`),
      frame(["leaf-state", "policy-prior"], ["leaf-value"], { "leaf-value": 0.68 }, tex`v_{leaf}=V_\theta(s_{leaf})=0.68`),
      frame(["leaf-value", "edge-q", "edge-visits"], ["q-after"], { "q-after": 0.4325 }, tex`Q'=\frac{3\times0.35+0.68}{4}=0.4325`, undefined, { label: "回传均值必须落在旧 Q 与叶子估值之间", entityId: "q-after", operator: "range", expected: [0.35, 0.68] }),
    ],
  }],
  [30006, {
    kind: "graph",
    entities: [
      entity("state", "当前状态 s", 0, "input"),
      entity("behavior-policy", "行为策略探索率", 0.2),
      entity("action", "实际动作 a", 0),
      entity("reward", "奖励 r", 0),
      entity("next-state", "下一状态 s'", 0),
      entity("next-action", "真实下一动作 a'", 0),
      entity("next-action-q", "Q(s',a')", 0.4),
      entity("q-before", "更新前 Q(s,a)", 0.25),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("learning-rate", "学习率 α", 0.2, "control"),
      entity("sarsa-target", "Sarsa 目标", 0),
      entity("q-after", "更新后 Q(s,a)", 0.25, "output"),
    ],
    bindings: { "Q(s,a)": "q-before", [tex`\alpha`]: "learning-rate", [tex`a_{t+1}`]: "next-action" },
    frames: [
      frame(["state", "behavior-policy"], ["action"], { action: 1 }, tex`a_t\sim\mu(\cdot\mid s_t)`),
      frame(["state", "action"], ["reward", "next-state"], { reward: 1, "next-state": 1 }, tex`(r_{t+1},s_{t+1})=P(s_t,a_t)`, [["state", "reward"], ["action", "reward"], ["state", "next-state"], ["action", "next-state"]]),
      frame(["next-state", "behavior-policy"], ["next-action", "next-action-q"], { "next-action": 1, "next-action-q": 0.4 }, tex`a_{t+1}\sim\mu(\cdot\mid s_{t+1}),\quad Q(s',a')=0.4`),
      frame(["q-before", "learning-rate", "reward", "discount", "next-action-q"], ["sarsa-target", "q-after"], { "sarsa-target": 1.36, "q-after": 0.472 }, tex`y=1+0.9\times0.4=1.36,\quad Q'=0.25+0.2(1.36-0.25)=0.472`),
    ],
  }],
  [30007, {
    kind: "graph",
    entities: [
      entity("state", "当前状态 s", 0, "input"),
      entity("behavior-policy", "ε-greedy 行为策略", 0.2),
      entity("action", "探索动作 a", 0),
      entity("reward", "奖励 r", 0),
      entity("next-state", "下一状态 s'", 0),
      entity("next-q-values", "下一状态全部 Q", [0.8, 0.3]),
      entity("greedy-action", "目标贪婪动作", 0),
      entity("max-next-q", "max Q(s',a)", 0),
      entity("q-before", "更新前 Q(s,a)", 0.2),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("learning-rate", "学习率 α", 0.3, "control"),
      entity("q-target", "Q-learning 目标", 0),
      entity("q-after", "更新后 Q(s,a)", 0.2, "output"),
    ],
    bindings: { "Q(s,a)": "q-before", [tex`\alpha`]: "learning-rate", [tex`\max_a Q(s',a)`]: "max-next-q" },
    frames: [
      frame(["state", "behavior-policy"], ["action"], { action: 1 }, tex`a_t\sim\mu_{\epsilon\text{-greedy}}(\cdot\mid s_t)`),
      frame(["state", "action"], ["reward", "next-state"], { reward: 1, "next-state": 1 }, tex`(r_{t+1},s_{t+1})=P(s_t,a_t)`, [["state", "reward"], ["action", "reward"], ["state", "next-state"], ["action", "next-state"]]),
      frame(["next-state", "next-q-values"], ["max-next-q", "greedy-action"], { "greedy-action": 0, "max-next-q": 0.8 }, tex`a^*=\arg\max_a Q(s',a)=0,\quad \max Q=0.8`),
      frame(["q-before", "learning-rate", "reward", "discount", "max-next-q"], ["q-target", "q-after"], { "q-target": 1.72, "q-after": 0.656 }, tex`y=1+0.9\times0.8=1.72,\quad Q'=0.2+0.3(1.72-0.2)=0.656`),
    ],
  }],
  [30008, {
    kind: "sequence",
    entities: [
      entity("start-state", "起始状态 s_t", 0, "input"),
      entity("step-count", "展开步数 n", 3, "control"),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("reward-trace", "三步奖励 [r1,r2,r3]", [1, 1, 1]),
      entity("discounted-rewards", "折扣奖励和", 0),
      entity("bootstrap-value", "V(s_{t+3})", 0.4),
      entity("bootstrap-term", "γ^n V(s_{t+n})", 0),
      entity("n-step-target", "n 步目标", 0),
      entity("value-before", "更新前 V(s_t)", 0.5),
      entity("learning-rate", "学习率 α", 0.4, "control"),
      entity("value-after", "更新后 V(s_t)", 0.5, "output"),
    ],
    bindings: { n: "step-count", [tex`\gamma`]: "discount", "V(s)": "bootstrap-value" },
    frames: [
      frame(["start-state", "step-count"], ["reward-trace"], { "reward-trace": [1, 1, 1] }, tex`(r_{t+1},r_{t+2},r_{t+3})=(1,1,1)`),
      frame(["reward-trace", "discount", "step-count"], ["discounted-rewards"], { "discounted-rewards": 2.71 }, tex`1+0.9+0.9^2=2.71`),
      frame(["discounted-rewards", "discount", "step-count", "bootstrap-value"], ["bootstrap-term", "n-step-target"], { "bootstrap-term": 0.2916, "n-step-target": 3.0016 }, tex`G_t^{(3)}=2.71+0.9^3\times0.4=3.0016`),
      frame(["value-before", "learning-rate", "n-step-target"], ["value-after"], { "value-after": 1.50064 }, tex`V'=0.5+0.4(3.0016-0.5)=1.50064`),
    ],
  }],
  [30009, {
    kind: "distribution",
    entities: [
      entity("transition", "新 transition", 1, "input"),
      entity("buffer-size", "回放区样本数 N", 100),
      entity("stored-transition", "已存样本", 0),
      entity("td-error", "TD 误差 |δ_i|", 0.7),
      entity("priority", "优先级 p_i", 0.2),
      entity("priority-sum", "全体优先级幂之和", 1.85),
      entity("sampling-probability", "采样概率 P(i)", 0.2),
      entity("importance-exponent", "重要性指数 β", 0.4, "control"),
      entity("importance-weight", "归一化权重 w_i", 1),
      entity("network-before", "更新前网络参数", 0.5),
      entity("sample-gradient", "样本梯度", 0.3),
      entity("learning-rate", "网络学习率", 0.1, "control"),
      entity("network-after", "更新后网络参数", 0.5, "output"),
      entity("td-error-after", "更新后 TD 误差", 0.5),
      entity("priority-after", "刷新后优先级", 0.2, "output"),
    ],
    bindings: { p_i: "priority", "P(i)": "sampling-probability", w_i: "importance-weight" },
    distribution: { xLabel: "优先回放信号", yLabel: "概率与权重", yDomain: [0, 1.2] },
    frames: [
      frame(["transition", "buffer-size"], ["stored-transition"], { "stored-transition": 1 }, tex`\mathcal B\leftarrow\mathcal B\cup\{(s,a,r,s')\}`),
      frame(["stored-transition", "td-error"], ["priority"], { priority: 0.71 }, tex`p_i=|\delta_i|+0.01=0.71`),
      frame(["priority", "priority-sum"], ["sampling-probability"], { "sampling-probability": 0.44 }, tex`P(i)=p_i^{0.6}/\sum_kp_k^{0.6}=0.44`),
      frame(
        ["sampling-probability", "buffer-size", "importance-exponent", "network-before", "sample-gradient", "learning-rate", "td-error-after"],
        ["importance-weight", "network-after", "priority-after"],
        { "importance-weight": 0.220099, "network-after": 0.493397, "priority-after": 0.51 },
        tex`w_i=(100\times0.44)^{-0.4}=0.220099,\quad\theta'=0.5-0.1\times w_i\times0.3=0.493397,\quad p_i'=0.51`,
        [["sampling-probability", "importance-weight"], ["buffer-size", "importance-weight"], ["importance-exponent", "importance-weight"], ["sampling-probability", "network-after"], ["buffer-size", "network-after"], ["importance-exponent", "network-after"], ["network-before", "network-after"], ["sample-gradient", "network-after"], ["learning-rate", "network-after"], ["td-error-after", "priority-after"]],
      ),
    ],
  }],
  [30010, {
    kind: "graph",
    entities: [
      entity("next-state", "下一状态 s'", 1, "input"),
      entity("online-scores", "在线网络 Qθ(s',·)", [0.62, 0.81]),
      entity("selected-action", "在线网络所选动作", 0),
      entity("target-scores", "目标网络 Qθ-(s',·)", [0.48, 0.55]),
      entity("target-evaluation", "目标网络对已选动作评价", 0),
      entity("reward", "奖励 r", 0.45),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("td-target", "Double DQN 目标 y", 0),
      entity("online-q-before", "更新前在线 Q", 0.35),
      entity("learning-rate", "学习率 α", 0.12, "control"),
      entity("online-q-after", "更新后在线 Q", 0.35, "output"),
      entity("online-version", "在线网络版本", 2),
      entity("target-version", "目标网络版本", 1),
      entity("target-version-after", "同步后目标版本", 1, "output"),
    ],
    bindings: { [tex`Q_\theta`]: "online-scores", [tex`Q_{\theta^-}`]: "target-scores", y: "td-target" },
    frames: [
      frame(["next-state", "online-scores"], ["selected-action"], { "selected-action": 1 }, tex`a^*=\arg\max_aQ_\theta(s',a)=1`),
      frame(["selected-action", "target-scores"], ["target-evaluation"], { "target-evaluation": 0.55 }, tex`Q_{\theta^-}(s',a^*)=0.55`),
      frame(["reward", "discount", "target-evaluation"], ["td-target"], { "td-target": 0.945 }, tex`y=0.45+0.9\times0.55=0.945`),
      frame(["online-q-before", "learning-rate", "td-target", "online-version", "target-version"], ["online-q-after", "target-version-after"], { "online-q-after": 0.4214, "target-version-after": 2 }, tex`Q'=0.35+0.12(0.945-0.35)=0.4214,\quad\theta^-\leftarrow\theta`, [["online-q-before", "online-q-after"], ["learning-rate", "online-q-after"], ["td-target", "online-q-after"], ["online-version", "target-version-after"], ["target-version", "target-version-after"]]),
    ],
  }],
  [30011, {
    kind: "graph",
    entities: [
      entity("state", "输入状态 s", 0.7, "input"),
      entity("shared-weights", "共享编码器参数", 0.8, "control"),
      entity("state-encoding", "共享状态编码", 0),
      entity("value-head", "价值分支权重", 0.6, "control"),
      entity("state-value", "状态价值 V(s)", 0),
      entity("advantage-head", "优势分支权重", 0.5, "control"),
      entity("raw-advantages", "原始优势 A(s,·)", [0.3, 0.1]),
      entity("mean-advantage", "动作平均优势", 0),
      entity("centered-advantage", "选中动作中心化优势", 0),
      entity("action-value", "聚合动作价值 Q(s,a)", 0, "output"),
      entity("best-action", "当前最优动作", 0, "output"),
    ],
    bindings: { "V(s)": "state-value", "A(s,a)": "raw-advantages", "Q(s,a)": "action-value" },
    frames: [
      frame(["state", "shared-weights"], ["state-encoding"], { "state-encoding": 0.6 }, tex`h=f_{shared}(s)=0.6`),
      frame(["state-encoding", "value-head"], ["state-value"], { "state-value": 0.48 }, tex`V(s)=f_V(h)=0.48`),
      frame(["state-encoding", "advantage-head", "raw-advantages"], ["mean-advantage", "centered-advantage"], { "mean-advantage": 0.2, "centered-advantage": 0.1 }, tex`\bar A=(0.3+0.1)/2=0.2,\quad A_0-\bar A=0.1`),
      frame(["state-value", "centered-advantage", "raw-advantages"], ["action-value", "best-action"], { "action-value": 0.58, "best-action": 0 }, tex`Q(s,a_0)=0.48+0.1=0.58`),
    ],
  }],
  [30012, {
    kind: "distribution",
    entities: [
      entity("state", "当前状态 s_t", 0.6, "input"),
      entity("policy-before", "更新前动作概率 π", 0.4),
      entity("trajectory", "采样轨迹", 0),
      entity("reward-trace", "轨迹奖励序列", [0.5, 0.4]),
      entity("discount", "折扣因子 γ", 1, "control"),
      entity("return", "轨迹回报 G_t", 0),
      entity("baseline", "状态基线 b(s_t)", 0.5),
      entity("advantage", "中心化信号 G_t-b(s_t)", 0),
      entity("policy-step-size", "策略更新步长", 0.1, "control"),
      entity("policy-after", "更新后动作概率 π'", 0.4, "output"),
    ],
    bindings: { [tex`b(s_t)`]: "baseline", [tex`G_t-b(s_t)`]: "advantage", [tex`\pi(a\mid s)`]: "policy-before" },
    distribution: { xLabel: "带基线的策略信号", yLabel: "概率、回报或优势", yDomain: [0, 1] },
    frames: [
      frame(["state", "policy-before"], ["trajectory"], { trajectory: 1 }, tex`\tau\sim\pi_\theta,\quad \pi(a_t\mid s_t)=0.4`),
      frame(["trajectory", "reward-trace", "discount"], ["return"], { return: 0.9 }, tex`G_t=0.5+1\times0.4=0.9`),
      frame(["return", "baseline"], ["advantage"], { advantage: 0.4 }, tex`G_t-b(s_t)=0.9-0.5=0.4`, undefined, { label: "中心化信号必须等于回报减基线", entityId: "advantage", operator: "approx", expected: 0.4 }),
      frame(["policy-before", "advantage", "policy-step-size"], ["policy-after"], { "policy-after": 0.44 }, tex`\pi'=\pi+0.1(G_t-b)=0.4+0.1\times0.4=0.44`, undefined, { label: "更新后概率必须位于 0 到 1", entityId: "policy-after", operator: "range", expected: [0, 1] }),
    ],
  }],
  [30013, {
    kind: "sequence",
    entities: [
      entity("state", "回合起始状态", 0.4, "input"),
      entity("policy-before", "更新前策略概率 π", 0.4),
      entity("episode", "完整回合", 0),
      entity("episode-length", "回合长度", 0),
      entity("reward-trace", "完整奖励序列", [1, 1, 1]),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("return", "蒙特卡洛回报 G_t", 0),
      entity("value-before", "原价值基线 V(s_t)", 0.5),
      entity("value-baseline", "训练后价值基线 V(s_t)", 0.5),
      entity("advantage", "MC 优势 G_t-V(s_t)", 0),
      entity("policy-step-size", "策略更新步长", 0.033493, "control"),
      entity("policy-after", "更新后策略概率 π'", 0.4, "output"),
    ],
    bindings: { "V(s)": "value-baseline", [tex`\pi(a\mid s)`]: "policy-before", [tex`G_t-V_w(s_t)`]: "advantage" },
    frames: [
      frame(["state", "policy-before"], ["episode", "episode-length"], { episode: 1, "episode-length": 3 }, tex`\tau\sim\pi_\theta,\quad T=3`),
      frame(["episode", "reward-trace", "discount"], ["return"], { return: 2.71 }, tex`G_t=1+0.9+0.9^2=2.71`),
      frame(["state", "return", "value-before"], ["value-baseline"], { "value-baseline": 0.62 }, tex`V_w(s_t)\leftarrow0.62\ \text{以拟合}\ G_t`),
      frame(["policy-before", "return", "value-baseline", "policy-step-size"], ["advantage", "policy-after"], { advantage: 2.09, "policy-after": 0.47 }, tex`A_t=2.71-0.62=2.09,\quad\pi'=0.4+0.033493\times2.09=0.47`),
    ],
  }],
  [30014, {
    kind: "graph",
    entities: [
      entity("state", "当前状态 s_t", 0.3, "input"),
      entity("actor-before", "更新前 Actor 概率", 0.5),
      entity("action", "采样动作", 0),
      entity("next-state", "下一状态 s_{t+1}", 0),
      entity("reward", "即时奖励 r_{t+1}", 0),
      entity("value-current", "Critic V(s_t)", 0),
      entity("value-next", "Critic V(s_{t+1})", 0),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("advantage", "一步优势 A_t", 0),
      entity("actor-learning-rate", "Actor 学习率", 0.067227, "control"),
      entity("critic-learning-rate", "Critic 学习率", 0.1, "control"),
      entity("actor-after", "更新后 Actor 概率", 0.5, "output"),
      entity("critic-after", "更新后 Critic V(s_t)", 0.4, "output"),
    ],
    bindings: { "A(s,a)": "advantage", "V(s)": "value-current", r_t: "reward" },
    frames: [
      frame(["state", "actor-before"], ["action"], { action: 1 }, tex`a_t\sim\pi(\cdot\mid s_t)`),
      frame(["state", "action"], ["next-state", "reward", "value-current", "value-next"], { "next-state": 0.8, reward: 0.5, "value-current": 0.4, "value-next": 0.55 }, tex`V(s_t)=0.4,\quad V(s_{t+1})=0.55`, [["state", "next-state"], ["action", "next-state"], ["state", "reward"], ["action", "reward"], ["state", "value-current"], ["state", "value-next"], ["action", "value-next"]]),
      frame(["reward", "discount", "value-next", "value-current"], ["advantage"], { advantage: 0.595 }, tex`A_t=0.5+0.9\times0.55-0.4=0.595`, undefined, { label: "一步优势应由奖励和两个价值共同得到", entityId: "advantage", operator: "approx", expected: 0.595 }),
      frame(["actor-before", "value-current", "advantage", "actor-learning-rate", "critic-learning-rate"], ["actor-after", "critic-after"], { "actor-after": 0.54, "critic-after": 0.4595 }, tex`\pi'=0.5+0.067227\times0.595=0.54,\quad V'=0.4+0.1\times0.595=0.4595`),
    ],
  }],
  [30015, {
    kind: "sequence",
    entities: [
      entity("random-seed", "固定采样种子", 7, "control"),
      entity("environment", "同一环境", 1, "input"),
      entity("shared-trajectory", "共享短轨迹", [0.5, 0.4, 0.3]),
      entity("full-return", "完整回报 G_t", 1.3),
      entity("value-current", "当前价值 V(s_t)", 0.4),
      entity("reward", "一步奖励 r_{t+1}", 0.3),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("value-next", "下一状态价值", 0.5),
      entity("mc-advantage", "MC 优势", 0),
      entity("td-advantage", "TD 优势", 0),
      entity("mc-variance", "MC 样本方差", 0.62),
      entity("td-variance", "TD 样本方差", 0.21),
      entity("bias-variance-score", "偏差方差权衡指标", 0),
      entity("selected-method", "选择的估计方法", 0, "output"),
    ],
    bindings: { [tex`A_t^{MC}`]: "mc-advantage", [tex`A_t^{TD}`]: "td-advantage" },
    frames: [
      frame(["environment", "random-seed"], ["shared-trajectory"], { "shared-trajectory": [0.5, 0.4, 0.3] }, tex`\tau_{MC}=\tau_{TD}\quad\text{同一随机种子}`),
      frame(["shared-trajectory", "full-return", "value-current", "reward", "discount", "value-next"], ["mc-advantage", "td-advantage"], { "mc-advantage": 0.9, "td-advantage": 0.35 }, tex`A^{MC}=1.3-0.4=0.9,\quad A^{TD}=0.3+0.9\times0.5-0.4=0.35`),
      frame(["mc-advantage", "td-advantage", "mc-variance", "td-variance"], ["bias-variance-score"], { "bias-variance-score": 0.41 }, tex`\Delta_{var}=0.62-0.21=0.41`),
      frame(["mc-advantage", "td-advantage", "bias-variance-score"], ["selected-method"], { "selected-method": 1 }, tex`\Delta_{var}=0.41>0.3\Rightarrow\text{选择低方差 TD}`),
    ],
  }],
  [30016, {
    kind: "distribution",
    entities: [
      entity("reward", "样本回报", 0.7, "input"),
      entity("baseline", "价值基线", 0.4),
      entity("advantage", "策略优势 A_t", 0),
      entity("old-probability", "旧策略动作概率", 0.4),
      entity("candidate-probability", "候选策略动作概率", 0.432),
      entity("ratio", "新旧概率比 r_t(θ)", 1),
      entity("surrogate", "局部代理收益", 0),
      entity("old-distribution", "旧动作分布", [0.4, 0.6]),
      entity("candidate-distribution", "候选动作分布", [0.432, 0.568]),
      entity("kl-divergence", "平均 KL 距离", 0),
      entity("trust-radius", "信赖域半径 δ", 0.01, "control"),
      entity("line-search-scale", "线搜索步长比例", 1, "control"),
      entity("accepted-probability", "接受后的动作概率", 0.4, "output"),
    ],
    bindings: { [tex`r_t(\theta)`]: "ratio", [tex`D_{KL}`]: "kl-divergence", [tex`\delta`]: "trust-radius" },
    distribution: { xLabel: "TRPO 候选更新", yLabel: "概率、收益或约束", yDomain: [0, 1.2] },
    frames: [
      frame(["reward", "baseline"], ["advantage"], { advantage: 0.3 }, tex`A_t=0.7-0.4=0.3`),
      frame(["old-probability", "candidate-probability", "advantage"], ["ratio", "surrogate"], { ratio: 1.08, surrogate: 0.324 }, tex`r_t=0.432/0.4=1.08,\quad r_tA_t=0.324`),
      frame(["old-distribution", "candidate-distribution"], ["kl-divergence"], { "kl-divergence": 0.002101 }, tex`D_{KL}([0.4,0.6]\|[0.432,0.568])=0.002101`),
      frame(["candidate-probability", "kl-divergence", "trust-radius", "line-search-scale"], ["accepted-probability"], { "accepted-probability": 0.432 }, tex`0.002101\le0.01\Rightarrow\pi_{new}(a\mid s)=0.432`, undefined, { label: "候选 KL 必须位于信赖域内", entityId: "kl-divergence", operator: "range", expected: [0, 0.01] }),
    ],
  }],
  [30017, {
    kind: "sequence",
    entities: [
      entity("sensor-reading", "当前传感器读数", 0.3, "input"),
      entity("observation-mask", "可见观测比例", 0.6, "control"),
      entity("observation", "局部观测 o_t", 0),
      entity("hidden-previous", "上一记忆 h_{t-1}", 0.2),
      entity("input-weight", "输入权重", 1.4, "control"),
      entity("recurrent-weight", "循环权重", 1, "control"),
      entity("hidden", "记忆状态 h_t", 0),
      entity("policy-head", "策略头权重", 1.2, "control"),
      entity("action-probability", "动作概率 π(a|h_t)", 0),
      entity("action", "选中动作", 0),
      entity("reward", "序列奖励", 0.28),
      entity("sequence-gradient", "时间反传梯度", 0),
      entity("parameter-before", "循环策略参数", 1),
      entity("parameter-after", "更新后循环策略参数", 1, "output"),
    ],
    bindings: { o_t: "observation", h_t: "hidden", [tex`\pi(a\mid s)`]: "action-probability" },
    frames: [
      frame(["sensor-reading", "observation-mask"], ["observation"], { observation: 0.18 }, tex`o_t=0.3\times0.6=0.18`),
      frame(["observation", "hidden-previous", "input-weight", "recurrent-weight"], ["hidden"], { hidden: 0.423542 }, tex`h_t=\tanh(1.4\times0.18+1\times0.2)=0.423542`),
      frame(["hidden", "policy-head"], ["action-probability", "action"], { "action-probability": 0.624396, action: 1 }, tex`\pi(a=1\mid h_t)=\sigma(1.2h_t)=0.624396`),
      frame(["reward", "action-probability", "hidden", "parameter-before"], ["sequence-gradient", "parameter-after"], { "sequence-gradient": 0.036, "parameter-after": 1.0036 }, tex`g_{BPTT}=0.036,\quad\theta'=1+0.1g=1.0036`),
    ],
  }],
  [30018, {
    kind: "distribution",
    entities: [
      entity("environment-spec", "环境动作说明", 1, "input"),
      entity("action-bound", "连续动作边界", 1, "control"),
      entity("discrete-count", "离散动作数 K", 0),
      entity("continuous-dimension", "连续维度 d", 0),
      entity("discrete-logits", "离散策略 logits", [0.2, 0.1]),
      entity("discrete-probabilities", "离散动作概率", [0.525, 0.475]),
      entity("continuous-mean", "连续策略均值", 0),
      entity("continuous-std", "连续策略标准差", 0.3),
      entity("sample-noise", "标准高斯噪声", -0.5, "input"),
      entity("discrete-action", "离散动作", 0),
      entity("continuous-action", "连续控制量", 0),
      entity("control-target", "目标控制量", -0.2),
      entity("control-error", "归一化控制误差", 0.4),
      entity("mean-step-size", "均值更新步长", 0.4, "control"),
      entity("policy-after", "更新后连续均值", 0, "output"),
    ],
    bindings: { K: "discrete-count", d: "continuous-dimension" },
    distribution: { xLabel: "离散与连续动作量", yLabel: "概率或控制值", yDomain: [-1, 2.2] },
    frames: [
      frame(["environment-spec", "action-bound"], ["discrete-count", "continuous-dimension"], { "discrete-count": 2, "continuous-dimension": 1 }, tex`a_d\in\{1,2\},\quad a_c\in\mathbb R^1`),
      frame(["discrete-count", "continuous-dimension", "discrete-logits"], ["discrete-probabilities", "continuous-mean", "continuous-std"], { "discrete-probabilities": [0.525, 0.475], "continuous-mean": 0.2, "continuous-std": 0.3 }, tex`\pi_d=\operatorname{softmax}([0.2,0.1]),\quad\pi_c=\mathcal N(0.2,0.3^2)`),
      frame(["discrete-probabilities", "continuous-mean", "continuous-std", "sample-noise"], ["discrete-action", "continuous-action"], { "discrete-action": 1, "continuous-action": 0.05 }, tex`a_d=1,\quad a_c=0.2+0.3(-0.5)=0.05`),
      frame(["continuous-mean", "continuous-action", "control-target", "mean-step-size"], ["control-error", "policy-after"], { "control-error": 0.25, "policy-after": 0.1 }, tex`e=|0.05-(-0.2)|=0.25,\quad\mu'=0.2-0.4\times0.25=0.1`),
    ],
  }],
  [30019, {
    kind: "graph",
    entities: [
      entity("state", "连续状态 s", 0.3, "input"),
      entity("actor-parameter-before", "更新前 Actor 参数", 0.8),
      entity("actor-action", "确定性动作 μθ(s)", 0),
      entity("critic-parameter", "Critic 参数", 0.6, "control"),
      entity("critic-value", "动作价值 Q(s,a)", 0),
      entity("action-probe", "动作微扰 Δa", 0.01, "control"),
      entity("critic-value-perturbed", "微扰动作价值 Q(s,a+Δa)", 0.7218),
      entity("action-gradient", "动作梯度 ∇aQ", 0),
      entity("actor-jacobian", "Actor 雅可比 ∇θμ", 0.5),
      entity("learning-rate", "Actor 学习率", 0.4, "control"),
      entity("actor-gradient", "Actor 参数梯度", 0),
      entity("actor-parameter-after", "更新后 Actor 参数", 0.8, "output"),
    ],
    bindings: { [tex`\mu_\theta(s)`]: "actor-action", "Q(s,a)": "critic-value", [tex`\nabla_a Q`]: "action-gradient" },
    frames: [
      frame(["state", "actor-parameter-before"], ["actor-action"], { "actor-action": 0.24 }, tex`a=\mu_\theta(s)=0.8\times0.3=0.24`),
      frame(["state", "actor-action", "critic-parameter"], ["critic-value"], { "critic-value": 0.72 }, tex`Q_w(s,a)=0.72`),
      frame(["state", "actor-action", "critic-value", "critic-value-perturbed", "action-probe"], ["action-gradient"], { "action-gradient": 0.18 }, tex`\nabla_aQ\approx\frac{0.7218-0.72}{0.01}=0.18`),
      frame(["action-gradient", "actor-jacobian", "learning-rate", "actor-parameter-before"], ["actor-gradient", "actor-parameter-after"], { "actor-gradient": 0.09, "actor-parameter-after": 0.836 }, tex`\nabla_\theta J=0.18\times0.5=0.09,\quad\theta'=0.8+0.4\times0.09=0.836`),
    ],
  }],
  [30020, {
    kind: "distribution",
    entities: [
      entity("state", "连续状态 s_t", 0.4, "input"),
      entity("actor-parameters", "高斯策略参数", 0.8, "control"),
      entity("mean", "高斯均值 μθ", 0),
      entity("std", "高斯标准差 σθ", 0.5),
      entity("noise", "采样噪声 z", 0.514286, "input"),
      entity("action", "采样动作 a_t", 0),
      entity("reward", "环境奖励", 0),
      entity("baseline", "价值基线", 0.2),
      entity("advantage", "归一化优势 A", 0),
      entity("density-before", "样本动作附近密度", 0.4),
      entity("score-gradient", "对数密度梯度", 0.45),
      entity("learning-rate", "策略学习率", 0.5, "control"),
      entity("density-after", "更新后动作密度", 0.4, "output"),
    ],
    bindings: { [tex`\mu_\theta`]: "mean", [tex`\sigma_\theta`]: "std", "A(s,a)": "advantage" },
    distribution: { xLabel: "高斯策略信号", yLabel: "参数、动作或权重", yDomain: [-0.2, 1.2] },
    frames: [
      frame(["state", "actor-parameters"], ["mean", "std"], { mean: 0.1, std: 0.35 }, tex`(\mu_\theta,\sigma_\theta)=(0.1,0.35)`),
      frame(["mean", "std", "noise"], ["action"], { action: 0.28 }, tex`a_t=0.1+0.35\times0.514286=0.28`),
      frame(["state", "action", "baseline"], ["reward", "advantage"], { reward: 1, advantage: 0.8 }, tex`A_t=r_t-b(s_t)=1-0.2=0.8`),
      frame(["density-before", "advantage", "score-gradient", "learning-rate"], ["density-after"], { "density-after": 0.58 }, tex`\rho'=0.4+0.5\times0.8\times0.45=0.58`, undefined, { label: "更新后密度必须非负", entityId: "density-after", operator: "range", expected: [0, 1.2] }),
    ],
  }],
  [30021, {
    kind: "graph",
    entities: [
      entity("observation-a", "智能体 A 观测", 0.2, "input"),
      entity("observation-b", "智能体 B 观测", 0.7, "input"),
      entity("policy-a", "智能体 A 策略", 0.6, "control"),
      entity("policy-b", "智能体 B 策略", 0.55, "control"),
      entity("action-a", "智能体 A 动作", 0),
      entity("action-b", "智能体 B 动作", 0),
      entity("joint-action", "联合动作 a", 0),
      entity("next-state", "联合动作后的状态", 0),
      entity("team-reward", "团队奖励", 0),
      entity("counterfactual-a", "无 A 贡献时价值", 0.35),
      entity("counterfactual-b", "无 B 贡献时价值", 0.5),
      entity("credit-a", "A 的信用值 Q_A", 0),
      entity("credit-b", "B 的信用值 Q_B", 0),
      entity("actor-step-size", "局部策略步长", 0.1, "control"),
      entity("policy-a-after", "更新后 A 策略", 0.6, "output"),
      entity("policy-b-after", "更新后 B 策略", 0.55, "output"),
    ],
    bindings: { [tex`\mathbf a`]: "joint-action", Q_i: "credit-a" },
    frames: [
      frame(["observation-a", "observation-b", "policy-a", "policy-b"], ["action-a", "action-b"], { "action-a": 1, "action-b": 1 }, tex`a_A\sim\pi_A(\cdot\mid o_A),\quad a_B\sim\pi_B(\cdot\mid o_B)`, [["observation-a", "action-a"], ["policy-a", "action-a"], ["observation-b", "action-b"], ["policy-b", "action-b"]]),
      frame(["action-a", "action-b"], ["joint-action", "next-state"], { "joint-action": 3, "next-state": 1 }, tex`\mathbf a=(a_A,a_B)=(1,1)`),
      frame(["joint-action", "next-state"], ["team-reward"], { "team-reward": 0.8 }, tex`r_{team}=R(s,\mathbf a)=0.8`),
      frame(
        ["team-reward", "joint-action", "counterfactual-a", "counterfactual-b", "policy-a", "policy-b", "actor-step-size"],
        ["credit-a", "credit-b", "policy-a-after", "policy-b-after"],
        { "credit-a": 0.45, "credit-b": 0.3, "policy-a-after": 0.645, "policy-b-after": 0.58 },
        tex`Q_A=0.8-0.35=0.45,\ Q_B=0.8-0.5=0.3,\quad(\pi_A',\pi_B')=(0.645,0.58)`,
        [["team-reward", "credit-a"], ["joint-action", "credit-a"], ["counterfactual-a", "credit-a"], ["team-reward", "credit-b"], ["counterfactual-b", "credit-b"], ["counterfactual-a", "policy-a-after"], ["policy-a", "policy-a-after"], ["actor-step-size", "policy-a-after"], ["counterfactual-b", "policy-b-after"], ["policy-b", "policy-b-after"], ["actor-step-size", "policy-b-after"]],
      ),
    ],
  }],
  [30022, {
    kind: "graph",
    entities: [
      entity("observation-a", "智能体 A 局部观测 o_i", 0.3, "input"),
      entity("observation-b", "智能体 B 局部观测", 0.7, "input"),
      entity("global-state", "全局训练状态 s", 1, "input"),
      entity("action-a", "A 的局部动作", 0.4),
      entity("action-b", "B 的局部动作", 0.6),
      entity("joint-action", "联合动作", 0),
      entity("training-context", "集中训练上下文", 0),
      entity("critic-parameter", "集中式 Critic 参数", 0.8, "control"),
      entity("centralized-q", "集中式 Q_i(s,a)", 0),
      entity("actor-gradient-a", "A 的 Actor 梯度", 0),
      entity("actor-gradient-b", "B 的 Actor 梯度", 0),
      entity("actor-a-before", "A 的 Actor 参数", 0.5),
      entity("actor-b-before", "B 的 Actor 参数", 0.55),
      entity("actor-step-size", "Actor 学习率", 0.1, "control"),
      entity("actor-a-after", "更新后 A Actor", 0.5),
      entity("actor-b-after", "更新后 B Actor", 0.55),
      entity("deployed-action", "去中心化执行动作", 0, "output"),
    ],
    bindings: { o_i: "observation-a", [tex`Q_i(s,\mathbf a)`]: "centralized-q" },
    frames: [
      frame(["global-state", "observation-a", "observation-b", "action-a", "action-b"], ["joint-action", "training-context"], { "joint-action": 1, "training-context": 1 }, tex`c_{train}=(s,o_A,o_B,a_A,a_B)`),
      frame(["training-context", "joint-action", "critic-parameter"], ["centralized-q"], { "centralized-q": 0.76 }, tex`Q_i(s,a_A,a_B)=0.76`),
      frame(["centralized-q", "observation-a", "observation-b", "action-a", "action-b", "actor-a-before", "actor-b-before", "actor-step-size"], ["actor-gradient-a", "actor-gradient-b", "actor-a-after", "actor-b-after"], { "actor-gradient-a": 0.12, "actor-gradient-b": 0.09, "actor-a-after": 0.512, "actor-b-after": 0.559 }, tex`\theta_A'=0.5+0.1\times0.12=0.512,\quad\theta_B'=0.55+0.1\times0.09=0.559`, [["centralized-q", "actor-gradient-a"], ["observation-a", "actor-gradient-a"], ["action-a", "actor-gradient-a"], ["centralized-q", "actor-gradient-b"], ["observation-b", "actor-gradient-b"], ["action-b", "actor-gradient-b"], ["centralized-q", "actor-a-after"], ["actor-a-before", "actor-a-after"], ["actor-step-size", "actor-a-after"], ["centralized-q", "actor-b-after"], ["actor-b-before", "actor-b-after"], ["actor-step-size", "actor-b-after"]]),
      frame(["observation-a", "actor-a-after"], ["deployed-action"], { "deployed-action": 0.65 }, tex`a_i\sim\pi_i(\cdot\mid o_i)=0.65`),
    ],
  }],
  [30023, {
    kind: "sequence",
    entities: [
      entity("expert-policy", "专家策略 π_E", 1, "input"),
      entity("environment", "示范环境", 1, "input"),
      entity("expert-trajectory", "专家轨迹 τ_E", 0),
      entity("expert-occupancy", "专家占用频率", 0),
      entity("features", "轨迹特征 φ(τ)", 0.8, "input"),
      entity("reward-parameter-before", "奖励参数 θ", 0.1),
      entity("candidate-reward", "候选轨迹奖励 Rθ(τ)", 0),
      entity("unnormalized-weight", "未归一化轨迹权重 exp(R)", 1.083287),
      entity("partition", "配分函数 Zθ", 0),
      entity("model-policy", "软最优模型策略", 0),
      entity("model-occupancy", "模型占用频率", 0.54),
      entity("occupancy-gap", "专家-模型占用差", 0),
      entity("regularization", "正则强度 λ", 0.05, "control"),
      entity("reward-gradient", "正则化奖励梯度", 0),
      entity("reward-step-size", "奖励参数学习率", 0.2, "control"),
      entity("reward-parameter-after", "更新后奖励参数", 0.1, "output"),
    ],
    bindings: { [tex`\pi_E`]: "expert-policy", [tex`R_\theta(\tau)`]: "candidate-reward", [tex`Z_\theta`]: "partition", [tex`\lambda`]: "regularization" },
    frames: [
      frame(["expert-policy", "environment"], ["expert-trajectory", "expert-occupancy"], { "expert-trajectory": 4, "expert-occupancy": 0.72 }, tex`\tau_E\sim\pi_E,\quad\rho_E(s,a)=0.72`),
      frame(["features", "reward-parameter-before"], ["candidate-reward"], { "candidate-reward": 0.08 }, tex`R_\theta(\tau)=\theta^\top\phi(\tau)=0.1\times0.8=0.08`),
      frame(["candidate-reward"], ["unnormalized-weight", "partition", "model-policy"], { "unnormalized-weight": 1.083287, partition: 1.77588, "model-policy": 0.61 }, tex`e^{R_\theta(\tau)}=1.083287,\quad Z_\theta=1.77588,\quad p_\theta(\tau)=0.61`, [["candidate-reward", "unnormalized-weight"], ["candidate-reward", "partition"], ["candidate-reward", "model-policy"]]),
      frame(["expert-occupancy", "model-occupancy"], ["occupancy-gap"], { "occupancy-gap": 0.18 }, tex`\rho_E-\rho_\theta=0.72-0.54=0.18`),
      frame(["reward-parameter-before", "occupancy-gap", "regularization", "reward-step-size"], ["reward-gradient", "reward-parameter-after"], { "reward-gradient": 0.175, "reward-parameter-after": 0.135 }, tex`g_\theta=0.18-0.05\times0.1=0.175,\quad\theta'=0.1+0.2g=0.135`, [["reward-parameter-before", "reward-gradient"], ["occupancy-gap", "reward-gradient"], ["regularization", "reward-gradient"], ["occupancy-gap", "reward-parameter-after"], ["regularization", "reward-parameter-after"], ["reward-parameter-before", "reward-parameter-after"], ["reward-step-size", "reward-parameter-after"]]),
    ],
  }],
  [30024, {
    kind: "distribution",
    entities: [
      entity("expert-policy", "专家策略 π_E", 1, "input"),
      entity("expert-sample-count", "专家样本数", 100, "control"),
      entity("expert-trajectory", "专家轨迹批次", 0),
      entity("expert-occupancy", "专家占用频率", 0),
      entity("policy-before", "更新前策略 π", 0.32),
      entity("policy-sample-count", "策略样本数", 100, "control"),
      entity("policy-trajectory", "策略轨迹批次", 0),
      entity("policy-occupancy", "当前策略占用频率", 0),
      entity("expert-label", "专家标签", 1, "control"),
      entity("policy-label", "策略标签", 0, "control"),
      entity("discriminator", "专家概率 D(s,a)", 0.5),
      entity("discriminator-reward", "判别奖励 r_D", 0),
      entity("policy-score-gradient", "策略对数概率梯度", 0.328027),
      entity("learning-rate", "策略学习率", 0.08, "control"),
      entity("policy-after", "更新后策略 π'", 0.32, "output"),
    ],
    bindings: { "D(s,a)": "discriminator", "r_D(s,a)": "discriminator-reward", [tex`\pi_E`]: "expert-policy", [tex`\pi(a\mid s)`]: "policy-before" },
    distribution: { xLabel: "GAIL 占用与奖励", yLabel: "概率、频率或奖励", yDomain: [0, 2] },
    frames: [
      frame(["expert-policy", "expert-sample-count"], ["expert-trajectory", "expert-occupancy"], { "expert-trajectory": 100, "expert-occupancy": 0.7 }, tex`\tau_E\sim\pi_E,\quad\rho_E=0.70`),
      frame(["policy-before", "policy-sample-count"], ["policy-trajectory", "policy-occupancy"], { "policy-trajectory": 100, "policy-occupancy": 0.32 }, tex`\tau_\pi\sim\pi,\quad\rho_\pi=0.32`),
      frame(["expert-trajectory", "expert-label", "policy-trajectory", "policy-label"], ["discriminator"], { discriminator: 0.82 }, tex`\max_D\;\log D(\tau_E)+\log(1-D(\tau_\pi))`),
      frame(["discriminator"], ["discriminator-reward"], { "discriminator-reward": 1.7147984280919266 }, tex`r_D=-\log(1-D(s,a))=-\log(0.18)=1.714798`, undefined, { label: "判别奖励必须等于 -log(1-D)", entityId: "discriminator-reward", operator: "approx", expected: 1.7147984280919266 }),
      frame(["policy-before", "discriminator-reward", "policy-score-gradient", "learning-rate"], ["policy-after"], { "policy-after": 0.365 }, tex`\pi'=0.32+0.08\times1.714798\times0.328027=0.365`),
    ],
  }],
  [30025, {
    kind: "distribution",
    entities: [
      entity("prompt", "输入提示", 1, "input"),
      entity("policy-before", "更新前语言策略", 0.42),
      entity("answer", "生成回答", 0),
      entity("old-probability", "旧 token 概率", 0),
      entity("reward-model", "奖励模型", 1, "control"),
      entity("reward-score", "奖励模型分数", 0),
      entity("baseline", "价值基线", 0.36),
      entity("new-probability", "新 token 概率", 0.4872),
      entity("ratio", "新旧概率比 r_t", 1),
      entity("advantage", "优势 A_t", 0),
      entity("epsilon", "裁剪范围 ε", 0.1, "control"),
      entity("clipped-objective", "PPO 裁剪目标", 0),
      entity("policy-step-size", "PPO 更新步长", 0.03, "control"),
      entity("policy-after", "更新后语言策略", 0.42, "output"),
    ],
    bindings: { r_t: "ratio", "A(s,a)": "advantage", [tex`\epsilon`]: "epsilon" },
    distribution: { xLabel: "PPO 更新信号", yLabel: "概率比、优势或目标", yDomain: [0, 1.25] },
    frames: [
      frame(["prompt", "policy-before"], ["answer", "old-probability"], { answer: 1, "old-probability": 0.42 }, tex`y\sim\pi_{old}(\cdot\mid x),\quad p_{old}=0.42`),
      frame(["answer", "reward-model"], ["reward-score"], { "reward-score": 0.82 }, tex`R_{RM}(x,y)=0.82`),
      frame(["reward-score", "baseline", "new-probability", "old-probability"], ["advantage", "ratio"], { advantage: 0.46, ratio: 1.16 }, tex`A_t=0.82-0.36=0.46,\quad r_t=0.4872/0.42=1.16`),
      frame(["ratio", "advantage", "epsilon", "policy-before", "policy-step-size"], ["clipped-objective", "policy-after"], { "clipped-objective": 0.506, "policy-after": 0.43518 }, tex`L^{clip}=0.506,\quad\pi'=0.42+0.03\times0.506=0.43518`, undefined, { label: "裁剪目标必须等于 epsilon=0.1 的手算结果", entityId: "clipped-objective", operator: "approx", expected: 0.506 }),
    ],
  }],
  [30026, {
    kind: "distribution",
    entities: [
      entity("prompt", "同一提示", 1, "input"),
      entity("group-size", "组规模 G", 8, "control"),
      entity("answer-group", "8 条候选回答", 0),
      entity("verifier", "可验证评分器", 1, "control"),
      entity("group-rewards", "组内奖励", [0.85, 1.03, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42]),
      entity("candidate-reward", "当前回答奖励 r_i", 0),
      entity("group-mean", "组内奖励均值", 0.55),
      entity("group-std", "组内奖励标准差", 0.23),
      entity("stability-epsilon", "稳定项 ε", 0.000001, "control"),
      entity("standardized-advantage", "标准化优势 Â_i", 0),
      entity("policy-before", "更新前回答概率", 0.5),
      entity("policy-step-size", "策略更新步长", 0.05, "control"),
      entity("policy-after", "更新后回答概率", 0.5, "output"),
    ],
    bindings: { G: "group-size", [tex`\hat A_i`]: "standardized-advantage" },
    distribution: { xLabel: "GRPO 组内信号", yLabel: "奖励、统计量或优势", yDomain: [-2, 8.5] },
    frames: [
      frame(["prompt", "group-size"], ["answer-group"], { "answer-group": 8 }, tex`\{y_i\}_{i=1}^{G}\sim\pi(\cdot\mid x),\quad G=8`),
      frame(["answer-group", "verifier", "group-rewards"], ["candidate-reward", "group-mean", "group-std"], { "candidate-reward": 0.85, "group-mean": 0.55, "group-std": 0.23 }, tex`r_i=0.85,\quad\operatorname{mean}(r_{1:8})=0.55,\quad\operatorname{std}\approx0.23`),
      frame(["candidate-reward", "group-mean", "group-std", "stability-epsilon"], ["standardized-advantage"], { "standardized-advantage": 1.304342 }, tex`\hat A_i=\frac{0.85-0.55}{0.23+10^{-6}}=1.304342`, undefined, { label: "标准化优势必须由奖励、均值和标准差重算", entityId: "standardized-advantage", operator: "approx", expected: 1.304342 }),
      frame(["policy-before", "standardized-advantage", "policy-step-size"], ["policy-after"], { "policy-after": 0.565217 }, tex`\pi'(y_i\mid x)=0.5+0.05\times1.304342=0.565217`, undefined, { label: "正优势应提高当前回答概率", entityId: "policy-after", operator: "range", expected: [0.5, 1] }),
    ],
  }],
  [30027, {
    kind: "distribution",
    entities: [
      entity("prompt", "同一提示", 1, "input"),
      entity("group-size", "回答数量 G", 4, "control"),
      entity("answer-group", "回答组", 0),
      entity("current-index", "当前样本索引 i", 2, "control"),
      entity("all-rewards", "全组奖励", [0.4, 0.5, 0.9, 0.6]),
      entity("current-reward", "当前回答奖励 r_i", 0.9),
      entity("other-rewards", "排除当前后的奖励", [0.4, 0.5, 0.6]),
      entity("other-sum", "其余奖励之和", 0),
      entity("leave-one-out-baseline", "留一基线", 0),
      entity("rloo-advantage", "RLOO 优势", 0, "output"),
    ],
    bindings: { r_i: "current-reward", G: "group-size" },
    distribution: { xLabel: "留一组内比较", yLabel: "奖励、基线或优势", yDomain: [-1, 4.5] },
    frames: [
      frame(["prompt", "group-size"], ["answer-group"], { "answer-group": 4 }, tex`\{y_j\}_{j=1}^{4}\sim\pi(\cdot\mid x)`),
      frame(["answer-group", "all-rewards", "current-index", "current-reward"], ["other-rewards"], { "other-rewards": [0.4, 0.5, 0.6] }, tex`\{r_j:j\ne i\}=\{0.4,0.5,0.6\}`),
      frame(["other-rewards", "group-size"], ["other-sum", "leave-one-out-baseline"], { "other-sum": 1.5, "leave-one-out-baseline": 0.5 }, tex`b_i=\frac{0.4+0.5+0.6}{4-1}=0.5`),
      frame(["current-reward", "leave-one-out-baseline"], ["rloo-advantage"], { "rloo-advantage": 0.4 }, tex`\hat A_i=0.9-0.5=0.4`, undefined, { label: "RLOO 优势必须排除当前样本", entityId: "rloo-advantage", operator: "approx", expected: 0.4 }),
    ],
  }],
  [30028, {
    kind: "distribution",
    entities: [
      entity("prompt", "训练提示", 1, "input"),
      entity("group-size", "回答组规模", 8, "control"),
      entity("answer-group", "成组回答", 0),
      entity("verifiable-reward", "可验证奖励", 0),
      entity("response-length", "原回答 token 数", 120),
      entity("maximum-length", "最大有效长度", 80, "control"),
      entity("soft-length-weight", "超长软惩罚权重", 1),
      entity("valid-token-count", "有效 token 数 |o_i|", 100),
      entity("group-reward-variance", "组内奖励方差", 0.12),
      entity("keep-threshold", "动态过滤阈值", 0.05, "control"),
      entity("candidate-group-count", "候选回答组数", 25),
      entity("kept-group-count", "过滤后保留组数", 17),
      entity("keep-rate", "动态保留率", 1),
      entity("group-mean", "组内奖励均值", 0.44),
      entity("group-std", "组内奖励标准差", 0.7),
      entity("old-token-probability", "旧 token 概率", 0.5),
      entity("new-token-probability", "新 token 概率", 0.56),
      entity("token-ratio", "token 概率比 r_i,t", 1),
      entity("token-advantage", "token 组相对优势 Â_i,t", 0),
      entity("epsilon-low", "下降侧 ε_low", 0.1, "control"),
      entity("epsilon-high", "上升侧 ε_high", 0.2, "control"),
      entity("clipped-objective", "Clip-Higher 目标", 0),
      entity("batch-objective-sum", "全批有效目标和", 68.8),
      entity("normalized-signal", "全批 token 归一化信号", 0),
      entity("policy-before", "更新前策略概率", 0.42),
      entity("policy-step-size", "策略更新步长", 0.05, "control"),
      entity("policy-after", "更新后策略概率", 0.42, "output"),
    ],
    bindings: { [tex`r_{i,t}`]: "token-ratio", [tex`\hat A_{i,t}`]: "token-advantage", [tex`\epsilon_{low}`]: "epsilon-low", [tex`\epsilon_{high}`]: "epsilon-high", [tex`|o_i|`]: "valid-token-count" },
    distribution: { xLabel: "DAPO 批次信号", yLabel: "归一化训练量", yDomain: [0, 125] },
    frames: [
      frame(["prompt", "group-size"], ["answer-group", "verifiable-reward"], { "answer-group": 8, "verifiable-reward": 0.9 }, tex`\{y_i,r_i\}_{i=1}^{8},\quad r_i=0.9`),
      frame(["verifiable-reward", "response-length", "maximum-length"], ["soft-length-weight", "valid-token-count"], { "soft-length-weight": 0.75, "valid-token-count": 80 }, tex`w_{len}=0.75,\quad |o_i|=\min(120,80)=80`),
      frame(["group-reward-variance", "keep-threshold", "candidate-group-count", "kept-group-count"], ["keep-rate"], { "keep-rate": 0.68 }, tex`\operatorname{Var}(r_{group})>0.05,\quad\rho_{keep}=17/25=0.68`),
      frame(["verifiable-reward", "group-mean", "group-std", "keep-rate", "old-token-probability", "new-token-probability"], ["token-advantage", "token-ratio"], { "token-advantage": 0.657143, "token-ratio": 1.12 }, tex`\hat A=(0.9-0.44)/0.7=0.657143,\quad r_{i,t}=0.56/0.5=1.12`),
      frame(["token-ratio", "token-advantage", "epsilon-low", "epsilon-high"], ["clipped-objective"], { "clipped-objective": 0.736 }, tex`\min(1.12\times0.657143,1.2\times0.657143)=0.736`),
      frame(["clipped-objective", "valid-token-count", "batch-objective-sum", "policy-before", "policy-step-size"], ["normalized-signal", "policy-after"], { "normalized-signal": 0.86, "policy-after": 0.463 }, tex`J=68.8/80=0.86,\quad\pi'=0.42+0.05\times0.86=0.463`),
    ],
  }],
  [30029, {
    kind: "sequence",
    entities: [
      entity("distribution-mean", "目标分布均值参数", 0.5, "input"),
      entity("distribution-std", "目标分布尺度参数", 0.2, "input"),
      entity("target-distribution", "目标分布 p(X)", 0),
      entity("sample-count", "独立样本数 N", 4, "control"),
      entity("random-seed", "固定随机种子", 11, "control"),
      entity("samples", "独立样本 x_i", [0.2, 0.5, 0.8, 1.1]),
      entity("function-definition", "函数 f(X)=0.5+0.2X", 1, "control"),
      entity("function-values", "每个 f(x_i)", [0, 0, 0, 0]),
      entity("value-sum", "样本函数值之和", 0),
      entity("previous-estimate", "上一轮期望估计", 0.5),
      entity("expectation-estimate", "样本均值估计", 0, "output"),
    ],
    bindings: { x_i: "samples", N: "sample-count", "f(X)": "function-definition" },
    frames: [
      frame(["distribution-mean", "distribution-std"], ["target-distribution"], { "target-distribution": 1 }, tex`X\sim p(\mu=0.5,\sigma=0.2)`),
      frame(["target-distribution", "sample-count", "random-seed"], ["samples"], { samples: [0.2, 0.5, 0.8, 1.1] }, tex`x_1,\ldots,x_4\overset{iid}{\sim}p`),
      frame(["samples", "function-definition"], ["function-values"], { "function-values": [0.54, 0.6, 0.66, 0.72] }, tex`f(x_{1:4})=[0.54,0.60,0.66,0.72]`),
      frame(["function-values", "sample-count", "previous-estimate"], ["value-sum", "expectation-estimate"], { "value-sum": 2.52, "expectation-estimate": 0.63 }, tex`\hat{\mathbb E}[f(X)]=2.52/4=0.63`, undefined, { label: "样本均值必须等于函数值之和除以 N", entityId: "expectation-estimate", operator: "approx", expected: 0.63 }),
    ],
  }],
  [30030, {
    kind: "pipeline",
    entities: [
      entity("controller-version", "控制面策略版本", 1, "control"),
      entity("prompt-count", "Prompt 数量", 32, "input"),
      entity("prompt-batch", "带版本 Prompt 批次", 0),
      entity("actor-parameter", "Actor 参数 θ", 1),
      entity("rollout-workers", "Rollout 工作组", 4, "control"),
      entity("rollout-batch", "生成序列批次", 0),
      entity("reward-worker", "Reward 工作组", 1, "control"),
      entity("reference-policy", "冻结参考策略 π_ref", 1, "control"),
      entity("critic-parameter", "Critic 参数 φ", 1),
      entity("reward-score", "批次奖励", 0),
      entity("reference-logprob", "参考策略 log-prob", 0),
      entity("policy-logprob", "Actor 策略 log-prob", 0),
      entity("kl-weight", "KL 权重", 0.2, "control"),
      entity("critic-value", "Critic 价值", 0),
      entity("batch-version", "Rollout 策略版本", 0),
      entity("kl-penalty", "KL 惩罚", 0),
      entity("advantage-batch", "汇总优势信号", 0),
      entity("actor-after", "更新后 Actor 版本", 1, "output"),
      entity("critic-after", "更新后 Critic 版本", 1, "output"),
    ],
    bindings: { [tex`\theta`]: "actor-parameter", [tex`\phi`]: "critic-parameter", [tex`\pi_{ref}`]: "reference-policy" },
    frames: [
      frame(["controller-version", "prompt-count"], ["prompt-batch", "batch-version"], { "prompt-batch": 32, "batch-version": 1 }, tex`B_x=(32\ \text{prompts},\ version=1)`),
      frame(
        ["prompt-batch", "actor-parameter", "rollout-workers", "reward-worker", "reference-policy", "critic-parameter"],
        ["rollout-batch", "reward-score", "reference-logprob", "policy-logprob", "critic-value"],
        { "rollout-batch": 32, "reward-score": 0.82, "reference-logprob": -0.64, "policy-logprob": -0.59, "critic-value": 0.5 },
        tex`B_y\gets\operatorname{Rollout}_\theta(B_x),\quad(R,\log\pi_{ref},V_\phi)\ \text{并行}`,
        [["prompt-batch", "rollout-batch"], ["actor-parameter", "rollout-batch"], ["rollout-workers", "rollout-batch"], ["prompt-batch", "reward-score"], ["reward-worker", "reward-score"], ["prompt-batch", "reference-logprob"], ["reference-policy", "reference-logprob"], ["prompt-batch", "policy-logprob"], ["actor-parameter", "policy-logprob"], ["prompt-batch", "critic-value"], ["critic-parameter", "critic-value"]],
      ),
      frame(["reward-score", "policy-logprob", "reference-logprob", "kl-weight", "critic-value", "batch-version"], ["kl-penalty", "advantage-batch"], { "kl-penalty": 0.01, "advantage-batch": 0.31 }, tex`\beta|\log\pi-\log\pi_{ref}|=0.2\times0.05=0.01,\quad\hat A=0.82-0.01-0.5=0.31`, [["policy-logprob", "kl-penalty"], ["reference-logprob", "kl-penalty"], ["kl-weight", "kl-penalty"], ["reward-score", "advantage-batch"], ["policy-logprob", "advantage-batch"], ["reference-logprob", "advantage-batch"], ["kl-weight", "advantage-batch"], ["critic-value", "advantage-batch"], ["batch-version", "advantage-batch"]]),
      frame(["advantage-batch", "batch-version", "controller-version", "actor-parameter", "critic-parameter"], ["actor-after", "critic-after"], { "actor-after": 2, "critic-after": 2 }, tex`version(B)=version(\theta)=1\Rightarrow(\theta',\phi')=(2,2)`),
    ],
  }],
  [30031, {
    kind: "pipeline",
    entities: [
      entity("controller", "集中式控制器", 1, "control"),
      entity("input-batch", "输入批次 B", 16, "input"),
      entity("call", "一次批处理调用", 0),
      entity("worker-count", "Worker 数量 N", 4, "control"),
      entity("shards", "数据分片 B_i", [4, 4, 4, 4]),
      entity("worker-group", "并行 Worker Group", 4, "control"),
      entity("local-results", "各 Worker 局部结果", [0, 0, 0, 0]),
      entity("original-order", "原始样本索引", [0, 1, 2, 3]),
      entity("aggregated-results", "有序聚合结果", 0),
      entity("returned-batch", "返回控制器的批次", 0, "output"),
    ],
    bindings: { B_i: "shards", N: "worker-count" },
    frames: [
      frame(["controller", "input-batch"], ["call"], { call: 16 }, tex`call=f(B),\quad |B|=16`),
      frame(["call", "input-batch", "worker-count"], ["shards"], { shards: [4, 4, 4, 4] }, tex`B=\bigcup_{i=1}^{4}B_i,\quad |B_i|=4`),
      frame(["shards", "worker-group"], ["local-results"], { "local-results": [4, 4, 4, 4] }, tex`f_i(B_i)\ \text{并行产生四组各 4 条结果}`),
      frame(["local-results", "original-order", "input-batch"], ["aggregated-results", "returned-batch"], { "aggregated-results": 16, "returned-batch": 16 }, tex`f(B)=\operatorname{concat}_{i=1}^{4}f_i(B_i),\quad |f(B)|=16`, undefined, { label: "聚合结果必须不重不漏", entityId: "returned-batch", operator: "eq", expected: 16 }),
    ],
  }],
  [30032, {
    kind: "pipeline",
    entities: [
      entity("actor-version", "当前 Actor 参数 θ_k", 7),
      entity("prompt-batch", "本轮 Prompt 批次", 8, "input"),
      entity("rollout-batch", "On-policy 数据 D_πθk", 0),
      entity("batch-policy-version", "批次策略版本", 0),
      entity("reference-policy", "参考策略版本", 7, "control"),
      entity("policy-logprob", "当前策略 log-prob", 0),
      entity("reference-logprob", "参考策略 log-prob", 0),
      entity("reward-model", "奖励模型版本", 3, "control"),
      entity("reward-model-score", "奖励模型原始分", 0.72),
      entity("kl-weight", "KL 权重", 0.2, "control"),
      entity("critic-before", "更新前 Critic 版本", 7),
      entity("critic-value", "Critic 基线值", 0.524),
      entity("reward", "序列奖励", 0),
      entity("advantage", "训练优势", 0),
      entity("actor-after", "更新后 Actor 版本", 7, "output"),
      entity("critic-after", "更新后 Critic 版本", 7, "output"),
    ],
    bindings: { [tex`\mathcal D_{\pi_{\theta_k}}`]: "rollout-batch", [tex`\theta_k`]: "actor-version" },
    frames: [
      frame(["actor-version", "prompt-batch"], ["rollout-batch", "batch-policy-version"], { "rollout-batch": 8, "batch-policy-version": 7 }, tex`\mathcal D_{\pi_{\theta_7}}=\operatorname{Rollout}(\theta_7,8\ \text{prompts})`),
      frame(["rollout-batch", "actor-version", "reference-policy"], ["policy-logprob", "reference-logprob"], { "policy-logprob": -0.58, "reference-logprob": -0.66 }, tex`(\log\pi_{\theta_k},\log\pi_{ref})=(-0.58,-0.66)`),
      frame(
        ["rollout-batch", "policy-logprob", "reference-logprob", "reward-model", "reward-model-score", "kl-weight", "critic-value"],
        ["reward", "advantage"],
        { reward: 0.704, advantage: 0.18 },
        tex`R=0.72-0.2|-0.58+0.66|=0.704,\quad\hat A=0.704-0.524=0.18`,
        [["rollout-batch", "reward"], ["reward-model", "reward"], ["reward-model-score", "reward"], ["policy-logprob", "reward"], ["reference-logprob", "reward"], ["kl-weight", "reward"], ["reward-model-score", "advantage"], ["policy-logprob", "advantage"], ["reference-logprob", "advantage"], ["kl-weight", "advantage"], ["critic-value", "advantage"]],
      ),
      frame(["actor-version", "batch-policy-version", "advantage", "critic-before"], ["actor-after", "critic-after"], { "actor-after": 8, "critic-after": 8 }, tex`version(B)=version(\theta_k)=7\Rightarrow\theta_{k+1}=8`),
    ],
  }],
  [30033, {
    kind: "pipeline",
    entities: [
      entity("training-actor", "训练侧 Actor 权重", 12, "input"),
      entity("expected-version", "目标权重版本", 12, "control"),
      entity("rollout-actor", "生成侧同步权重", 0),
      entity("prompt", "输入提示 x", 1, "input"),
      entity("prefix", "已生成前缀 y_<t", 3),
      entity("generation-engine", "批量推理引擎", 4, "control"),
      entity("token-batch", "有效 token 批次", 0),
      entity("current-token", "当前 token y_t", 0),
      entity("old-logprob", "生成侧旧 log-prob", 0),
      entity("stored-record", "训练记录 (x,y_<t,y_t)", 0),
      entity("recomputed-logprob", "训练侧重算 log-prob", 0),
      entity("logprob-difference", "双引擎数值偏差", 0, "output"),
    ],
    bindings: { x: "prompt", y_t: "current-token", [tex`y_{<t}`]: "prefix" },
    frames: [
      frame(["training-actor", "expected-version"], ["rollout-actor"], { "rollout-actor": 12 }, tex`W_{rollout}\leftarrow W_{actor}^{(12)}`),
      frame(["prompt", "prefix", "rollout-actor", "generation-engine"], ["token-batch", "current-token"], { "token-batch": 24, "current-token": 42 }, tex`y_t\sim\pi_{\theta^{(12)}}(\cdot\mid x,y_{<t}),\quad |B_{token}|=24`),
      frame(["prompt", "prefix", "current-token", "rollout-actor"], ["old-logprob", "stored-record"], { "old-logprob": -0.62, "stored-record": 1 }, tex`record=(x,y_{<t},y_t,\log\pi_{old}=-0.62)`),
      frame(["stored-record", "training-actor", "old-logprob"], ["recomputed-logprob", "logprob-difference"], { "recomputed-logprob": -0.61, "logprob-difference": 0.01 }, tex`|\log\pi_{train}-\log\pi_{old}|=|-0.61+0.62|=0.01`, undefined, { label: "双引擎 log-prob 偏差需小于 0.02", entityId: "logprob-difference", operator: "range", expected: [0, 0.02] }),
    ],
  }],
  [30034, {
    kind: "pipeline",
    entities: [
      entity("token-prefix", "token 前缀状态 s_t", 3, "input"),
      entity("next-prefix", "下一 token 前缀 s_{t+1}", 4, "input"),
      entity("critic-parameter", "Critic 参数", 5, "control"),
      entity("value-current", "当前 token 价值 V(s_t)", 0),
      entity("value-next", "下一 token 价值 V(s_{t+1})", 0),
      entity("reward-model", "末端奖励模型", 1, "control"),
      entity("terminal-mask", "有效末端标记", 1, "control"),
      entity("reward", "对齐后的奖励 r_t", 0),
      entity("discount", "折扣因子 γ", 0.9, "control"),
      entity("td-residual", "TD 残差 δ_t", 0),
      entity("gae-lambda", "GAE 系数 λ", 0.8, "control"),
      entity("next-advantage", "下一位置优势 A_{t+1}", 0.1),
      entity("gae-advantage", "当前 GAE 优势 A_t", 0, "output"),
    ],
    bindings: { [tex`\delta_t`]: "td-residual", [tex`\lambda`]: "gae-lambda", "A(s,a)": "gae-advantage" },
    frames: [
      frame(["token-prefix", "next-prefix", "critic-parameter"], ["value-current", "value-next"], { "value-current": 0.42, "value-next": 0.31 }, tex`(V(s_t),V(s_{t+1}))=(0.42,0.31)`),
      frame(["reward-model", "terminal-mask", "token-prefix"], ["reward"], { reward: 0.8 }, tex`r_t=m_tR_{terminal}=1\times0.8=0.8`),
      frame(["reward", "discount", "value-next", "value-current"], ["td-residual"], { "td-residual": 0.659 }, tex`\delta_t=0.8+0.9\times0.31-0.42=0.659`, undefined, { label: "TD 残差必须由相邻价值和奖励重算", entityId: "td-residual", operator: "approx", expected: 0.659 }),
      frame(["td-residual", "discount", "gae-lambda", "next-advantage"], ["gae-advantage"], { "gae-advantage": 0.731 }, tex`A_t=0.659+0.9\times0.8\times0.1=0.731`),
    ],
  }],
  [30035, {
    kind: "pipeline",
    entities: [
      entity("prompt", "Prompt", 1, "input"),
      entity("answer", "回答", 1, "input"),
      entity("policy-version", "策略版本", 12, "control"),
      entity("request", "可追踪评分请求", 0),
      entity("model-score", "模型评分 R_model", 0),
      entity("rule-score", "规则评分原值", 0),
      entity("format-valid", "格式校验", 1, "control"),
      entity("sandbox-pass", "沙箱执行通过", 1, "control"),
      entity("verified-rule-score", "验证后规则分 R_rule", 0),
      entity("model-weight", "模型分权重 λ_rm", 0.5, "control"),
      entity("rule-weight", "规则分权重 λ_rule", 0.4, "control"),
      entity("kl-weight", "KL 权重 β", 0.2, "control"),
      entity("kl-divergence", "策略 KL 距离", 0.5),
      entity("final-reward", "扣除 KL 的最终奖励", 0, "output"),
    ],
    bindings: { [tex`R_{model}`]: "model-score", [tex`R_{rule}`]: "verified-rule-score", [tex`\beta`]: "kl-weight" },
    frames: [
      frame(["prompt", "answer", "policy-version"], ["request"], { request: 1 }, tex`request=(x,y,version=12)`),
      frame(["request"], ["model-score", "rule-score"], { "model-score": 0.76, "rule-score": 1 }, tex`(R_{model},R_{rule}^{raw})=(0.76,1)`, [["request", "model-score"], ["request", "rule-score"]]),
      frame(["rule-score", "format-valid", "sandbox-pass"], ["verified-rule-score"], { "verified-rule-score": 1 }, tex`R_{rule}=1\times\mathbb1_{format}\times\mathbb1_{sandbox}=1`),
      frame(
        ["model-score", "model-weight", "verified-rule-score", "rule-weight", "kl-weight", "kl-divergence"],
        ["final-reward"],
        { "final-reward": 0.68 },
        tex`R=0.5\times0.76+0.4\times1-0.2\times0.5=0.68`,
        undefined,
        { label: "最终奖励必须包含模型、规则和 KL 三项", entityId: "final-reward", operator: "approx", expected: 0.68 },
      ),
    ],
  }],
  [30036, {
    kind: "pipeline",
    entities: [
      entity("execution-phase", "当前执行阶段", 1, "control"),
      entity("active-memory", "临时激活显存块", 6),
      entity("paused-phase", "暂停状态", 1),
      entity("released-memory", "已释放显存块", 0),
      entity("train-shards", "训练布局 W_train 分片", [1, 2, 3, 4]),
      entity("train-checksum", "训练参数校验和", 10),
      entity("exchange-workers", "参数通信设备数", 4, "control"),
      entity("exchange-buffer", "聚合交换缓冲", [0, 0, 0, 0]),
      entity("transferred-shards", "已传输分片数", 0),
      entity("target-layout", "目标 TP/PP 布局编码", 22, "control"),
      entity("infer-shards", "推理布局 W_infer 分片", [0, 0, 0, 0]),
      entity("rebuilt-devices", "完成重建的设备数", 0),
      entity("infer-checksum", "推理参数校验和", 0),
      entity("resumed-phase", "恢复后的执行阶段", 0, "output"),
    ],
    bindings: { [tex`W_{train}`]: "train-shards", [tex`W_{infer}`]: "infer-shards", "TP/PP": "target-layout" },
    frames: [
      frame(["execution-phase", "active-memory"], ["paused-phase", "released-memory"], { "paused-phase": 0, "released-memory": 6 }, tex`phase:1\to0,\quad memory_{released}=6`),
      frame(["paused-phase", "train-shards", "train-checksum", "exchange-workers"], ["exchange-buffer", "transferred-shards"], { "exchange-buffer": [1, 2, 3, 4], "transferred-shards": 4 }, tex`\operatorname{allgather}(W_{train}^{1:4})=[1,2,3,4]`),
      frame(["exchange-buffer", "transferred-shards", "target-layout"], ["infer-shards", "rebuilt-devices"], { "infer-shards": [1, 3, 2, 4], "rebuilt-devices": 4 }, tex`W_{infer}^{(TP2/PP2)}=\operatorname{reshard}([1,2,3,4])`),
      frame(["infer-shards", "train-checksum", "target-layout", "paused-phase"], ["infer-checksum", "resumed-phase"], { "infer-checksum": 10, "resumed-phase": 1 }, tex`checksum(W_{infer})=10=checksum(W_{train}),\quad phase:0\to1`, undefined, { label: "重分片前后校验和必须一致", entityId: "infer-checksum", operator: "eq", expected: 10 }),
    ],
  }],
]);

function transferPairs(spec: DrlFrame): (readonly [string, string])[] {
  if (spec.transfers) return [...spec.transfers];
  return spec.sources.flatMap((source) =>
    spec.targets.map((target) => [source, target] as const),
  );
}

function connectionId(from: string, to: string): string {
  return `edge-${from}-to-${to}`;
}

function displayValue(value: SceneValue | undefined): string {
  if (value === undefined) return "-";
  if (Array.isArray(value)) return `[${value.map(displayValue).join(", ")}]`;
  return String(value);
}

export function createDrlFrameSnapshots(
  currentValues: Record<string, SceneValue>,
  writes: Readonly<Record<string, SceneValue>>,
): {
  beforeValues: Record<string, SceneValue>;
  afterValues: Record<string, SceneValue>;
} {
  const beforeValues = { ...currentValues };
  Object.assign(currentValues, writes);
  return { beforeValues, afterValues: { ...currentValues } };
}

function createEntities(profile: DrlSceneProfile): LessonSceneEntity[] {
  const allSources = new Set(profile.frames.flatMap(({ sources }) => sources));
  const allTargets = new Set(profile.frames.flatMap(({ targets }) => targets));
  return profile.entities.map((item) => ({
    id: item.id,
    label: item.label,
    role: item.role
      ?? (!allTargets.has(item.id) ? "input" : !allSources.has(item.id) ? "output" : "intermediate"),
  }));
}

function createConnections(profile: DrlSceneProfile): LessonSceneConnection[] {
  const pairs = new Map<string, LessonSceneConnection>();
  for (const spec of profile.frames) {
    for (const [from, to] of transferPairs(spec)) {
      const id = connectionId(from, to);
      pairs.set(id, { id, from, to, label: "因果数据流" });
    }
  }
  return [...pairs.values()];
}

function createFrames(
  blueprint: (typeof drlLessonBlueprints)[number],
  profile: DrlSceneProfile,
  entities: LessonSceneEntity[],
): Record<string, LessonSceneFrame> {
  const values: Record<string, SceneValue> = Object.fromEntries(
    profile.entities.map(({ id, value }) => [id, value]),
  );
  const completed = new Set<string>();
  const bindingEntityIds = new Set(Object.values(profile.bindings));

  return Object.fromEntries(blueprint.flow.map((joint, index): [string, LessonSceneFrame] => {
    const spec = profile.frames[index];
    if (!spec) throw new Error(`DRL lesson ${blueprint.id} is missing frame ${index}`);
    const { beforeValues, afterValues } = createDrlFrameSnapshots(values, spec.writes);

    const active = new Set([...spec.sources, ...spec.targets]);
    const visibleIds = entities
      .map(({ id }) => id)
      .filter((id) => active.has(id) || bindingEntityIds.has(id));
    const graphColumns = Math.min(4, visibleIds.length);
    const graphRows = Math.ceil(visibleIds.length / graphColumns);
    const entityStates: Record<string, SceneEntityState> = Object.fromEntries(
      entities.map(({ id }) => {
        const visibleIndex = visibleIds.indexOf(id);
        const position = profile.kind === "graph" && visibleIndex >= 0
          ? {
              x: (visibleIndex % graphColumns + 0.5) / graphColumns,
              y: (Math.floor(visibleIndex / graphColumns) + 0.5) / graphRows,
            }
          : undefined;
        return [id, {
          value: afterValues[id],
          ...(spec.targets.includes(id)
            && Object.prototype.hasOwnProperty.call(spec.writes, id)
            && JSON.stringify(beforeValues[id]) !== JSON.stringify(afterValues[id])
            ? { previousValue: beforeValues[id] }
            : {}),
          status: active.has(id) ? "active" : completed.has(id) ? "complete" : "waiting",
          visible: visibleIndex >= 0,
          position,
        }];
      }),
    );
    const datum = (id: string, snapshot: Readonly<Record<string, SceneValue>>) => ({
      entityId: id,
      label: entities.find((candidate) => candidate.id === id)?.label ?? id,
      value: snapshot[id],
    });
    const pairs = transferPairs(spec);
    const finiteEntityId = spec.targets.find((id) => typeof afterValues[id] === "number")
      ?? spec.sources.find((id) => typeof beforeValues[id] === "number");
    if (!finiteEntityId) throw new Error(`DRL lesson ${blueprint.id}/${joint.id} needs a numeric diagnostic`);

    const debugAssertions: SceneDebugAssertion[] = [{
      label: `${datum(finiteEntityId, afterValues).label} 必须保持为有限数`,
      entityId: finiteEntityId,
      operator: "finite",
      expected: "finite",
    }];
    if (spec.assertion) {
      debugAssertions.push({
        ...spec.assertion,
        entityId: spec.assertion.entityId ?? spec.targets[0],
      });
    }

    const result = spec.targets
      .map((id) => `${datum(id, afterValues).label} = ${displayValue(afterValues[id])}`)
      .join("；");
    const inputSummary = spec.sources
      .map((id) => `${datum(id, beforeValues).label}=${displayValue(beforeValues[id])}`)
      .join("、");
    const built: LessonSceneFrame = {
      jointId: joint.id,
      title: joint.label,
      inputs: spec.sources.map((id) => datum(id, beforeValues)),
      operation: {
        label: joint.label,
        sourceEntityIds: [...spec.sources],
        targetEntityIds: [...spec.targets],
        expression: spec.expression,
      },
      outputs: spec.targets.map((id) => datum(id, afterValues)),
      entityStates,
      visibleConnectionIds: pairs.map(([from, to]) => connectionId(from, to)),
      transfers: pairs.map(([from, to], transferIndex) => ({
        id: `transfer-${joint.id}-${transferIndex}`,
        from,
        to,
        sourceValue: beforeValues[from] as LessonSceneFrame["transfers"][number]["sourceValue"],
        payload: beforeValues[from] as LessonSceneFrame["transfers"][number]["payload"],
        label: `${datum(from, beforeValues).label} 将 ${displayValue(beforeValues[from])} 送入 ${datum(to, afterValues).label}`,
      })),
      metrics: [],
      result,
      explanation: spec.explanation
        ?? `先读取 ${inputSummary}，再按本帧公式计算，因此得到 ${result}。`,
      debugAssertions,
    };
    spec.targets.forEach((id) => completed.add(id));
    return [joint.id, built];
  }));
}

function createLayout(
  kind: DrlSceneProfile["kind"],
  entities: LessonSceneEntity[],
  profile: DrlSceneProfile,
): LessonSceneSpec["layout"] {
  const entityIds = entities.map(({ id }) => id);
  switch (kind) {
    case "graph": {
      const columns = Math.min(4, entityIds.length);
      const rows = Math.ceil(entityIds.length / columns);
      return {
        nodeEntityIds: entityIds,
        positions: Object.fromEntries(entityIds.map((id, index) => [id, {
          x: (index % columns + 0.5) / columns,
          y: (Math.floor(index / columns) + 0.5) / rows,
        }])),
      };
    }
    case "sequence": {
      const trackIds = ["轨迹与观测", "计算与更新"];
      return {
        trackIds,
        trackByEntityId: Object.fromEntries(entities.map(({ id, role }) => [
          id,
          role === "input" || role === "control" ? trackIds[0] : trackIds[1],
        ])),
        orderedEntityIds: entityIds,
      };
    }
    case "pipeline": {
      const edges = new Set(createConnections(profile).map(({ from, to }) => `${from}->${to}`));
      const lanes: string[][] = [];
      for (const id of entityIds) {
        const lane = lanes.find((candidate) => edges.has(`${candidate[candidate.length - 1]}->${id}`));
        if (lane) lane.push(id);
        else lanes.push([id]);
      }
      const laneIds = lanes.map((_, index) => `数据流 ${index + 1}`);
      const laneByEntityId = Object.fromEntries(lanes.flatMap((lane, laneIndex) =>
        lane.map((id) => [id, laneIds[laneIndex]]),
      ));
      return {
        laneIds,
        laneByEntityId,
        stageEntityIds: lanes.flat(),
      };
    }
    case "distribution":
      return {
        categoryEntityIds: entityIds,
        xLabel: profile.distribution?.xLabel ?? "策略信号",
        yLabel: profile.distribution?.yLabel ?? "数值",
        yDomain: [...(profile.distribution?.yDomain ?? [-1, 2])],
      };
  }
}

function createDrlScene(
  blueprint: (typeof drlLessonBlueprints)[number],
): LessonSceneSpec {
  const profile = drlSceneProfiles.get(blueprint.id);
  if (!profile) throw new Error(`Missing DRL scene profile for lesson ${blueprint.id}`);
  if (profile.frames.length !== blueprint.flow.length) {
    throw new Error(`DRL lesson ${blueprint.id} must author every flow joint`);
  }

  const ids = profile.entities.map(({ id }) => id);
  if (new Set(ids).size !== ids.length || ids.some((id) => !id.trim())) {
    throw new Error(`DRL lesson ${blueprint.id} has duplicate or empty entity IDs`);
  }
  const knownIds = new Set(ids);
  for (const spec of profile.frames) {
    const referenced = [
      ...spec.sources,
      ...spec.targets,
      ...Object.keys(spec.writes),
      ...transferPairs(spec).flatMap(([from, to]) => [from, to]),
    ];
    if (referenced.some((id) => !knownIds.has(id))) {
      throw new Error(`DRL lesson ${blueprint.id} frame references an unknown entity`);
    }
  }

  const entities = createEntities(profile);
  const framesByJointId = createFrames(blueprint, profile, entities);
  const formulaBindings = blueprint.symbols.map(({ symbol }) => {
    const entityId = profile.bindings[symbol];
    if (!entityId || !knownIds.has(entityId)) {
      throw new Error(`DRL lesson ${blueprint.id} has no semantic binding for ${symbol}`);
    }
    return { symbol, entityIds: [entityId] };
  });
  const base = {
    lessonId: blueprint.id,
    ariaLabel: `${blueprint.title}的${sceneKindLabels[profile.kind]}逐步动画`,
    entities,
    connections: createConnections(profile),
    formulaBindings,
    framesByJointId,
  };
  const layout = createLayout(profile.kind, entities, profile);

  switch (profile.kind) {
    case "graph": return { ...base, kind: "graph", layout: layout as Extract<LessonSceneSpec, { kind: "graph" }>["layout"] };
    case "sequence": return { ...base, kind: "sequence", layout: layout as Extract<LessonSceneSpec, { kind: "sequence" }>["layout"] };
    case "pipeline": return { ...base, kind: "pipeline", layout: layout as Extract<LessonSceneSpec, { kind: "pipeline" }>["layout"] };
    case "distribution": return { ...base, kind: "distribution", layout: layout as Extract<LessonSceneSpec, { kind: "distribution" }>["layout"] };
  }
}

export const drlLessonScenes: LessonSceneSpec[] = drlLessonBlueprints.map(createDrlScene);

const drlLessonSceneById = new Map(
  drlLessonScenes.map((scene) => [scene.lessonId, scene]),
);

export function getDrlLessonScene(id: number): LessonSceneSpec | undefined {
  return drlLessonSceneById.get(id);
}
