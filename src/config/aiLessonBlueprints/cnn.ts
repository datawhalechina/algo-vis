import type { GuidedLessonSeed } from "../guidedLessonTypes";

export const cnnLessonBlueprints: GuidedLessonSeed[] = [
  {
    id: 10072,
    title: "二维卷积前向传播",
    intuition:
      "把卷积核想成一块小印章：它每次只盖住输入的一小片，把对应位置相乘后相加，所得分数就写进输出特征图的一个格子。",
    formula:
      "Y_{i,j,o}=b_o+\\sum_{u=0}^{K_h-1}\\sum_{v=0}^{K_w-1}\\sum_{c=0}^{C_{in}-1}X_{iS_h+u-P_h,\\,jS_w+v-P_w,\\,c}W_{u,v,c,o}",
    symbols: [
      { symbol: "X", meaning: "输入特征图" },
      { symbol: "W", meaning: "卷积核权重" },
      { symbol: "Y_{i,j,o}", meaning: "输出通道 o 在位置 (i,j) 的值" },
      { symbol: "S_h,S_w", meaning: "纵向与横向步长" },
    ],
    flow: ["补齐输入边界", "截取当前位置窗口", "逐元素乘加", "写入输出格子"],
    misconception:
      "深度学习库通常实现的是互相关，不会先把卷积核翻转；这不影响学习能力，但手算时要与所用定义保持一致。",
    debugTip:
      "固定输出位置 (0,0) 和一个输出通道，打印对应输入 patch、卷积核切片及二者乘积；确认三者形状均为 K_h×K_w×C_in，且乘积总和加 b_o 后等于 Y[0,0,o]。",
    takeaway: "二维卷积的每个输出值，都是一个局部输入窗口与卷积核的点积。",
  },
  {
    id: 10073,
    title: "步长与填充",
    intuition:
      "填充是在图像四周加边框，步长是卷积核每次跨几格；边框决定能否看到边缘，跨距决定输出采样有多密。",
    formula:
      "H_{out}=\\left\\lfloor\\frac{H_{in}+P_{left}+P_{right}-D(K-1)-1}{S}\\right\\rfloor+1",
    symbols: [
      { symbol: "H_{in}", meaning: "输入的空间尺寸" },
      { symbol: "H_{out}", meaning: "输出的空间尺寸" },
      { symbol: "P_{left},P_{right}", meaning: "两侧填充量；SAME 模式下可能不相等" },
      { symbol: "S", meaning: "卷积步长" },
      { symbol: "D", meaning: "空洞率" },
    ],
    flow: ["计算有效卷积核", "加上两侧填充", "按步长放置窗口", "取整得到输出尺寸"],
    misconception:
      "SAME 不总是让输出与输入同大；当步长大于 1 时，它通常保证的是 H_out=ceil(H_in/S)。",
    debugTip:
      "逐轴记录 H_in、K、D、S、P_left、P_right 并代入公式；再检查最后一个窗口的起点 (H_out-1)S-P_left，确认覆盖范围与实际 padding 后张量一致。",
    takeaway: "填充控制边界覆盖，步长控制采样密度，两者共同决定输出尺寸。",
  },
  {
    id: 10074,
    title: "空洞卷积",
    intuition:
      "空洞卷积像把卷积核的采样点拉开间距：仍只读取原来数量的像素，却能跨过更大的输入区域。",
    formula: "K_{eff}=D(K-1)+1",
    symbols: [
      { symbol: "K", meaning: "原始卷积核边长" },
      { symbol: "D", meaning: "相邻核元素在输入上的间隔，即空洞率" },
      { symbol: "K_{eff}", meaning: "卷积核覆盖的有效边长" },
    ],
    flow: ["确定空洞率", "展开采样坐标", "读取间隔像素", "乘加生成响应"],
    misconception:
      "空洞率增大的是采样点间距和覆盖范围，不会给卷积核增加可学习参数，也不是在输入中真正插入零。",
    debugTip:
      "对一个 3×3 核打印九个输入采样坐标；当 D=2 时，相邻坐标差应为 2、最远坐标差应为 4，并核对有效边长确为 5。",
    takeaway: "空洞卷积用稀疏采样扩大感受野，而不增加核参数量。",
  },
  {
    id: 10075,
    title: "转置卷积（反卷积）",
    intuition:
      "普通卷积把一个窗口汇成一个数，转置卷积则让每个输入值按卷积核形状向更大的画布散开，重叠处相加。",
    formula: "H_{out}=(H_{in}-1)S-2P+D(K-1)+P_{out}+1",
    symbols: [
      { symbol: "H_{in}", meaning: "低分辨率输入尺寸" },
      { symbol: "S", meaning: "转置卷积步长" },
      { symbol: "P", meaning: "配对普通卷积的填充" },
      { symbol: "P_{out}", meaning: "用于消除尺寸歧义的 output padding" },
      { symbol: "H_{out}", meaning: "上采样后的输出尺寸" },
    ],
    flow: ["按步长展开输入位置", "用核权重散射贡献", "累加重叠区域", "裁剪边界并加偏置"],
    misconception:
      "转置卷积不是卷积的数值逆运算，不能保证恢复原输入；它只是普通卷积线性变换的转置。",
    debugTip:
      "用仅含一个非零元素的输入运行一遍，检查输出中是否出现对应核形状；再逐位置累计贡献，确认重叠格子的手算和等于实际输出。",
    takeaway: "转置卷积通过散射并叠加局部核响应来学习上采样。",
  },
  {
    id: 10076,
    title: "深度可分离卷积",
    intuition:
      "先让每个输入通道各自寻找空间纹理，再用 1×1 卷积把各通道信息调配组合，代替一次完成空间和通道混合。",
    formula:
      "\\mathrm{Cost}_{sep}=K^2C_{in}HW+C_{in}C_{out}HW",
    symbols: [
      { symbol: "K", meaning: "depthwise 卷积核边长" },
      { symbol: "C_{in}", meaning: "输入通道数" },
      { symbol: "C_{out}", meaning: "pointwise 卷积产生的输出通道数" },
      { symbol: "H,W", meaning: "输出特征图的高与宽" },
    ],
    flow: ["逐通道提取空间特征", "保留通道对应关系", "用 1×1 核混合通道", "形成目标通道输出"],
    misconception:
      "depthwise 阶段只处理各自通道，真正的跨通道融合发生在后续 pointwise 阶段。",
    debugTip:
      "打印两个中间张量：depthwise 输出通道数应为 C_in（depth multiplier 为 1 时），pointwise 权重应为 1×1×C_in×C_out；再分别核对参数量 K²C_in 与 C_inC_out。",
    takeaway: "深度可分离卷积拆开空间提取和通道融合，以更少计算获得卷积特征。",
  },
  {
    id: 10077,
    title: "分组卷积",
    intuition:
      "把输入通道分成几个互不干扰的小组，每组用自己的卷积核加工，最后把各组结果沿通道方向拼回去。",
    formula: "N_{param}=K^2\\frac{C_{in}C_{out}}{G}",
    symbols: [
      { symbol: "G", meaning: "分组数量" },
      { symbol: "C_{in}", meaning: "输入通道数" },
      { symbol: "C_{out}", meaning: "输出通道数" },
      { symbol: "N_{param}", meaning: "不计偏置的参数量" },
    ],
    flow: ["按通道划分输入", "分配每组卷积核", "各组独立卷积", "沿输出通道拼接"],
    misconception:
      "分组不是把同一份完整输入复制给多个分支；每个组默认只能看到 C_in/G 个输入通道。",
    debugTip:
      "确认 C_in 和 C_out 都能被 G 整除，逐组打印输入与输出通道区间；把某组输入置零后，该组对应输出应只剩偏置，其他组输出应保持不变。",
    takeaway: "分组卷积用受限的通道连接减少参数和计算，并支持并行分支。",
  },
  {
    id: 10078,
    title: "残差块可视化",
    intuition:
      "残差块让堆叠层只学习需要改动的部分，原输入像一条直达通道绕过复杂变换，再与改动量相加。",
    formula: "Y=\\phi\\!\\left(F(X;\\theta)+P(X)\\right)",
    symbols: [
      { symbol: "X", meaning: "残差块输入" },
      { symbol: "F(X;\\theta)", meaning: "卷积分支学习到的残差" },
      { symbol: "P(X)", meaning: "恒等映射或 1×1 投影捷径" },
      { symbol: "\\phi", meaning: "相加后使用的激活函数" },
    ],
    flow: ["输入分成两路", "主分支计算残差", "捷径匹配形状", "逐元素相加并激活"],
    misconception:
      "只有主分支与捷径的空间尺寸和通道数完全一致时才能直接相加；尺寸变化时需要投影捷径。",
    debugTip:
      "在相加前打印 F(X) 与 P(X) 的完整 shape，并分别记录两支输出范数；再用非饱和的固定测试输入反向传播，检查输入梯度和主分支首层梯度均有限，并与无捷径版本对照。",
    takeaway: "残差连接提供直接的信息与梯度路径，使深层网络更容易优化。",
  },
  {
    id: 10079,
    title: "Inception 模块",
    intuition:
      "同一份特征同时交给近看、远看和汇总信息的多条分支，最后把不同尺度的观察结果按通道装订在一起。",
    formula:
      "Y=\\operatorname{Concat}_{c}\\!\\left(B_{1\\times1}(X),B_{3\\times3}(X),B_{5\\times5}(X),B_{pool}(X)\\right)",
    symbols: [
      { symbol: "B_{k\\times k}", meaning: "使用 k×k 卷积的特征分支" },
      { symbol: "B_{pool}", meaning: "池化后再投影的分支" },
      { symbol: "\\operatorname{Concat}_{c}", meaning: "沿通道维拼接" },
      { symbol: "Y", meaning: "融合后的多尺度特征" },
    ],
    flow: ["复制输入到各分支", "在 3×3 与 5×5 分支先用 1×1 核降维", "并行提取多尺度特征", "对齐空间尺寸后拼接"],
    misconception:
      "各分支输出不是逐元素相加，而是沿通道拼接；因此空间高宽要一致，输出通道数则会相加。",
    debugTip:
      "打印每个分支输出的 [H,W,C_b]，确认 H、W 全部相同；随后核对拼接结果通道数是否等于各 C_b 之和，并单独统计降维前后的 3×3、5×5 参数量。",
    takeaway: "Inception 用并行分支在一次模块中融合不同尺度的局部信息。",
  },
  {
    id: 10080,
    title: "一维时序卷积",
    intuition:
      "把一维卷积核当作沿时间轴移动的短尺，每次查看相邻几帧，从中识别突变、周期或局部语音片段。",
    formula:
      "Y_{t,o}=b_o+\\sum_{u=0}^{K-1}\\sum_{c=0}^{C_{in}-1}X_{tS+uD-P,c}W_{u,c,o}",
    symbols: [
      { symbol: "t", meaning: "输出的时间位置" },
      { symbol: "K", meaning: "时间卷积核长度" },
      { symbol: "D", meaning: "时间轴上的空洞率" },
      { symbol: "C_{in}", meaning: "每个时间步的输入通道数" },
    ],
    flow: ["沿时间轴选窗口", "汇集窗口内各通道", "与时间卷积核乘加", "并行生成所有时间位置", "与逐步递归的 RNN 路径对照"],
    misconception:
      "1D 卷积中的一维指卷积核只沿一个空间或时间维滑动，不代表每个时间步只能有一个通道。",
    debugTip:
      "固定时间点 t，打印实际读取的时间索引 tS+uD-P；确认索引间隔等于 D、窗口含 K 个位置，并手算该窗口的通道乘加来对照 Y[t,o]。",
    takeaway: "一维时序卷积以可并行的局部窗口提取序列模式。",
  },
  {
    id: 10081,
    title: "感受野可视化",
    intuition:
      "越深层的一个格子会间接汇总越大片原图；感受野就是追溯这个格子时，在输入上能影响它的区域大小。",
    formula:
      "j_l=j_{l-1}S_l,\\qquad r_l=r_{l-1}+(K_l-1)D_lj_{l-1}",
    symbols: [
      { symbol: "r_l", meaning: "第 l 层单个位置的理论感受野" },
      { symbol: "j_l", meaning: "第 l 层相邻位置映射到输入的间距" },
      { symbol: "K_l", meaning: "第 l 层卷积核大小" },
      { symbol: "S_l,D_l", meaning: "第 l 层步长与空洞率" },
    ],
    flow: [
      "初始化输入层 r_0=j_0=1",
      "读取本层核、步长与空洞率",
      "用旧 j 计算并加入覆盖增量",
      "再令 j 乘以本层步长",
      "逐层重复直到目标层",
    ],
    misconception:
      "填充通常移动感受野的中心或引入边界虚拟值，但不会直接出现在理论感受野大小 r_l 的递推增量中。",
    debugTip:
      "建立逐层表格，初值设 r_0=j_0=1；每层记录 K、S、D、旧 j、新 j 和新 r，最后用输入梯度非零区域的边界检查理论覆盖范围。",
    takeaway: "感受野由每层核大小按此前累计步长逐层扩张。",
  },
];
