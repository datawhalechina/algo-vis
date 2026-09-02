import type { GuidedLessonSeed } from "../guidedLessonTypes";

export const reshapeTransposeLessonBlueprints: GuidedLessonSeed[] = [
  {
    id: 601,
    title: "Transpose",
    intuition: "直接转置会让连续读取变成跨行写入；先把方块搬进共享内存，再交换行列坐标读出，就能让两端都保持连续访问。",
    formula: "B_{j,i}=A_{i,j}",
    symbols: [
      { symbol: "A_{i,j}", meaning: "输入矩阵第 i 行、第 j 列元素" },
      { symbol: "B_{j,i}", meaning: "转置后交换行列位置的输出元素" },
      { symbol: "i,j", meaning: "输入矩阵的行列下标" },
    ],
    flow: [
      "线程块领取输入矩阵 tile",
      "线程从全局内存按行合并读取到带 padding 的 shared memory；边缘 partial tile 只让坐标有效的线程装载",
      "块内同步确保 tile 完整",
      "交换局部行列坐标读取 shared memory",
      "按输出行合并写回矩阵 B；边缘 partial tile 再次检查交换后的输出坐标",
    ],
    misconception: "shared memory 本身不会自动消除 bank conflict；tile 的第二维常加 1 个 padding，避免转置列访问落到同一 bank。",
    debugTip: "用非方阵 2x3 打印输入坐标、shared 地址、输出坐标和全局写地址；确认六个元素各写一次，并用 profiler 检查 shared bank conflict。",
    takeaway: "高效转置用 shared tile 改变访问方向，以一次块内同步换取读写两端的合并访问。",
  },
  {
    id: 602,
    title: "Gather / ScatterAdd",
    intuition: "Gather 是线程拿着清单去不同位置取货；本课把 Scatter 的冲突规则固定为整型 ScatterAdd，多个线程送到同一位置时把货物相加，而不是争夺最后一次覆盖。",
    formula: "y_i=x_{g_i},\\qquad z_j=\\sum_{i:\\,s_i=j}x_i\\quad(z\\text{ 先清零})",
    symbols: [
      { symbol: "g_i", meaning: "Gather 中线程 i 要读取的源下标" },
      { symbol: "s_i", meaning: "ScatterAdd 中线程 i 要累加的目标下标" },
      { symbol: "y_i", meaning: "Gather 产生的连续输出" },
      { symbol: "z_j", meaning: "所有指向 j 的整型输入之和；本课假设结果不溢出" },
    ],
    flow: [
      "Gather kernel 的线程 i 连续读取 g_i，检查范围后随机读取 x_{g_i}",
      "每个 Gather 线程独立写回 y_i，无需线程同步",
      "ScatterAdd 前在同一 stream 用 cudaMemsetAsync 或 clear kernel 把全局 z 清零",
      "清零完成后启动 ScatterAdd kernel；线程 i 连续读取 s_i 与整型 x_i 并检查范围",
      "线程执行 atomicAdd(&z[s_i], x_i)，重复索引按求和语义合并",
      "ScatterAdd kernel 结束后再读取 z，得到唯一可判定的全局结果",
    ],
    misconception: "本课的 Scatter 不是普通赋值，也不能在 atomicAdd 和“索引唯一”之间临时二选一；重复索引始终执行整型求和，且目标数组必须先清零。",
    debugTip: "Gather 用 Src=[10,20,30]、g=[2,0] 应得到 [30,10]；ScatterAdd 用 x=[10,20,30]、s=[1,1,0]、长度 3，应稳定得到 z=[30,30,0]，并确认 z 先被清零、每个索引都在范围内。",
    takeaway: "Gather 独立读取，ScatterAdd 则以清零加整型 atomicAdd 固定重复索引的求和语义。",
  },
];
