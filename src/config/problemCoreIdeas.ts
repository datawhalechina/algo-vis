import { CoreIdeaColor } from "@/components/visualizers/CoreIdeaBox";

/**
 * 题目核心思想配置
 */
export interface ProblemCoreIdeaConfig {
  /** 核心思想描述 */
  idea: string;
  /** 颜色主题 */
  color: CoreIdeaColor;
  /** 特点标签 */
  features?: string[];
}

/**
 * 题目ID到核心思想的映射表
 * 
 * 如果题目没有在这里配置，将从 data/*.ts 中的 solution.methodDescription 读取
 */
export const problemCoreIdeas: Record<number, ProblemCoreIdeaConfig> = {
  // Problem 1-10: 基础题目
  1: {
    idea: "使用哈希表存储遍历过的数字及其索引，查找 target - 当前数字 是否存在。",
    color: "blue",
    features: ["遍历数组", "检查 target - num 是否在哈希表中", "找到则返回索引"],
  },
  2: {
    idea: "使用三个指针（prev, curr, next）迭代遍历链表，逐个反转节点的指向。",
    color: "blue",
    features: ["保存 next 节点", "反转 curr.next 指向 prev", "移动指针继续"],
  },
  3: {
    idea: "使用双指针从后向前遍历两个数组，将较大的元素放到 nums1 的末尾。",
    color: "purple",
    features: ["从两个数组末尾开始", "比较并放置较大元素", "逆向填充"],
  },
  4: {
    idea: "使用栈匹配括号，左括号入栈，右括号与栈顶匹配。",
    color: "purple",
    features: ["左括号 → 入栈", "右括号 → 与栈顶匹配", "最后栈为空则有效"],
  },
  5: {
    idea: "到达第 n 阶的方法数 = 到达第 n-1 阶的方法数 + 到达第 n-2 阶的方法数。",
    color: "amber",
    features: ["f(n) = f(n-1) + f(n-2)", "初始化 f(1)=1, f(2)=2", "递推计算"],
  },
  6: {
    idea: "使用双指针从两端向中间移动，每次移动较短的那条边，寻找最大面积。",
    color: "blue",
    features: ["left 和 right 指针", "计算当前面积", "移动较短的边"],
  },
  7: {
    idea: "使用快慢指针，慢指针指向下一个非零元素应该放置的位置，快指针遍历数组寻找非零元素。",
    color: "purple",
    features: ["快指针遍历", "找到非零元素", "与慢指针位置交换"],
  },
  8: {
    idea: "维护当前最低价格和最大利润，遍历数组时更新这两个值。",
    color: "green",
    features: ["记录历史最低价", "计算当前利润", "更新最大利润"],
  },
  9: {
    idea: "以第一个字符串为基准，逐个与其他字符串比较，缩短公共前缀。",
    color: "indigo",
    features: ["第一个字符串作基准", "逐个字符比较", "发现不同则缩短前缀"],
  },
  10: {
    idea: "当前位置的最大和 = max(当前元素, 前一位置最大和 + 当前元素)。",
    color: "orange",
    features: ["dp[i] = max(nums[i], dp[i-1] + nums[i])", "记录全局最大值", "一次遍历完成"],
  },

  // Problem 11-30: 基础题目
  11: {
    idea: "从最高位开始比较，逐位判断是否相等。",
    color: "indigo",
    features: ["提取各位数字", "从高位到低位比较", "不等则返回 false"],
  },
  12: {
    idea: "同时遍历两个链表，逐个比较节点值并创建新节点。",
    color: "blue",
    features: ["比较两个节点值", "选择较小的节点", "连接到结果链表"],
  },
  13: {
    idea: "使用双指针，快指针遍历，慢指针记录不重复位置。",
    color: "purple",
    features: ["快指针遍历", "与前一个不同 → 慢指针位置赋值", "返回新长度"],
  },
  14: {
    idea: "使用二分查找在有序数组中定位插入位置。",
    color: "blue",
    features: ["left 和 right 指针", "mid 与 target 比较", "找到位置或返回插入点"],
  },
  15: {
    idea: "从最后一位开始加1，处理进位。",
    color: "green",
    features: ["从末尾遍历", "当前位 +1", "处理进位 carry"],
  },
  16: {
    idea: "使用双指针从两端向中间移动，寻找和为目标值的两数。",
    color: "blue",
    features: ["left + right 与 target 比较", "和太小 → left++", "和太大 → right--"],
  },
  17: {
    idea: "每一行的值 = 上一行相邻两数之和。",
    color: "amber",
    features: ["每行首尾都是 1", "中间元素 = 上一行[i-1] + 上一行[i]", "逐行生成"],
  },
  18: {
    idea: "贪心算法：只要后一天价格高于今天，就在今天买入明天卖出。",
    color: "green",
    features: ["遍历价格数组", "prices[i] > prices[i-1] → 买卖", "累加所有利润"],
  },
  19: {
    idea: "使用哈希表或摩尔投票法，找出现次数超过 n/2 的元素。",
    color: "purple",
    features: ["候选者 candidate", "计数 count", "遇到相同 +1, 不同 -1"],
  },
  20: {
    idea: "使用双指针从两端向中间交换字符。",
    color: "indigo",
    features: ["left 和 right 指针", "交换字符", "向中间移动"],
  },
  21: {
    idea: "递归计算左右子树深度，当前节点深度 = max(左深度, 右深度) + 1。",
    color: "green",
    features: ["递归左子树深度", "递归右子树深度", "返回 max(left, right) + 1"],
  },
  22: {
    idea: "使用 BFS 或 DFS 遍历网格，标记访问过的岛屿。",
    color: "orange",
    features: ["遍历网格找到陆地", "DFS/BFS 标记整个岛屿", "计数岛屿数量"],
  },
  23: {
    idea: "使用异或运算，相同数字异或为0，最后剩下单独的数字。",
    color: "purple",
    features: ["遍历数组", "result ^= num", "相同数字抵消"],
  },
  24: {
    idea: "重复计算各位数字平方和，用哈希表检测循环。",
    color: "blue",
    features: ["计算各位平方和", "用 Set 检测循环", "等于 1 则是快乐数"],
  },
  25: {
    idea: "埃拉托斯特尼筛法：标记所有质数的倍数。",
    color: "amber",
    features: ["创建布尔数组", "标记每个质数的倍数", "统计未标记的数"],
  },
  26: {
    idea: "使用两个哈希表分别记录 s→t 和 t→s 的映射。",
    color: "indigo",
    features: ["建立字符映射", "检查映射是否一致", "双向验证"],
  },
  27: {
    idea: "使用哈希表记录每个数字是否出现。",
    color: "purple",
    features: ["遍历数组", "检查 Set 中是否存在", "存在 → 返回 true"],
  },
  28: {
    idea: "使用哈希表记录数字及其最近出现的索引。",
    color: "blue",
    features: ["遍历数组", "检查索引差是否 ≤ k", "更新哈希表"],
  },
  29: {
    idea: "判断 n 是否能表示为 3^x。",
    color: "green",
    features: ["n 为正数", "不断除以 3", "最后等于 1"],
  },
  30: {
    idea: "逐位反转二进制数。",
    color: "cyan",
    features: ["提取最低位", "添加到结果", "右移继续"],
  },

  // Problem 31-55: 中级题目
  31: {
    idea: "从后向前找到第一个升序对，交换并排序后面部分。",
    color: "orange",
    features: ["从后找第一个 nums[i] < nums[i+1]", "找比 nums[i] 大的最小数交换", "反转 i+1 后面部分"],
  },
  32: {
    idea: "使用栈记录左括号索引，动态规划计算最长有效长度。",
    color: "purple",
    features: ["栈存储索引", "遇到 ) 出栈配对", "计算有效长度"],
  },
  33: {
    idea: "判断哪一半有序，在有序部分二分查找。",
    color: "blue",
    features: ["判断左半或右半有序", "在有序部分查找", "否则搜索另一半"],
  },
  34: {
    idea: "两次二分查找分别找左右边界。",
    color: "cyan",
    features: ["二分找第一个等于 target", "二分找最后一个等于 target", "返回区间"],
  },
  35: {
    idea: "使用哈希表分别检查行、列、3x3宫格是否有重复。",
    color: "indigo",
    features: ["遍历每个单元格", "检查行/列/宫格", "用 Set 记录已出现数字"],
  },
  36: {
    idea: "回溯法：每个数字可以重复使用，和等于目标值时记录。",
    color: "orange",
    features: ["选择数字加入路径", "递归搜索剩余目标", "回溯撤销选择"],
  },
  37: {
    idea: "原地哈希：将数字放到对应索引位置。",
    color: "red",
    features: ["遍历数组", "将 nums[i] 放到索引 nums[i]-1", "找第一个不匹配的位置"],
  },
  38: {
    idea: "双指针法：左右柱子的较小值决定能接多少水。",
    color: "blue",
    features: ["left 和 right 指针", "记录左右最大高度", "计算当前位置接水量"],
  },
  39: {
    idea: "回溯法：逐个选择元素，生成所有排列。",
    color: "purple",
    features: ["选择一个未使用元素", "递归生成剩余排列", "回溯撤销选择"],
  },
  40: {
    idea: "回溯 + 去重：先排序，跳过重复元素。",
    color: "pink",
    features: ["先排序数组", "选择元素时跳过重复", "回溯生成排列"],
  },
  41: {
    idea: "使用哈希表将相同字母异位词分组。",
    color: "indigo",
    features: ["对每个单词排序", "排序后作为 key", "分组到哈希表"],
  },
  42: {
    idea: "使用哈希表存储数字，检查连续序列。",
    color: "green",
    features: ["将数字放入 Set", "从序列起点开始", "计算连续长度"],
  },
  43: {
    idea: "双指针 + 排序：固定一个数，双指针找另外两个数。",
    color: "blue",
    features: ["排序数组", "固定 nums[i]", "双指针找 -nums[i]"],
  },
  44: {
    idea: "滑动窗口 + 哈希表：记录窗口内字符。",
    color: "cyan",
    features: ["right 扩展窗口", "出现重复 → left 收缩", "更新最大长度"],
  },
  45: {
    idea: "滑动窗口 + 哈希表：固定窗口大小。",
    color: "purple",
    features: ["固定窗口大小", "比较窗口字符频率", "记录起始索引"],
  },
  46: {
    idea: "前缀和 + 哈希表：记录前缀和出现次数。",
    color: "orange",
    features: ["计算前缀和", "查找 preSum - k", "累加结果"],
  },
  47: {
    idea: "排序 + 合并：判断区间是否重叠。",
    color: "blue",
    features: ["按起始位置排序", "重叠 → 合并", "不重叠 → 保存"],
  },
  48: {
    idea: "三次反转：整体反转，再分段反转。",
    color: "green",
    features: ["反转整个数组", "反转前 k 个", "反转后 n-k 个"],
  },
  49: {
    idea: "单调队列：维护窗口内最大值。",
    color: "red",
    features: ["队列存储索引", "保持队列递减", "队首是最大值"],
  },
  50: {
    idea: "滑动窗口：记录目标字符，收缩窗口。",
    color: "indigo",
    features: ["right 扩展找包含子串", "left 收缩到最小", "记录最小窗口"],
  },
  51: {
    idea: "前后缀乘积：分别计算左右两侧乘积。",
    color: "amber",
    features: ["计算左侧乘积", "计算右侧乘积", "相乘得结果"],
  },
  52: {
    idea: "记录需要置零的行列，最后统一置零。",
    color: "purple",
    features: ["遍历标记需要置零的行列", "第二次遍历置零", "处理第一行列"],
  },
  53: {
    idea: "按顺序访问：右→下→左→上，逐圈遍历。",
    color: "cyan",
    features: ["定义上下左右边界", "按顺时针方向遍历", "缩小边界继续"],
  },
  54: {
    idea: "原地旋转：四个位置一组循环替换。",
    color: "orange",
    features: ["逐层处理", "每层四个位置一组", "原地交换"],
  },
  55: {
    idea: "从右上角或左下角开始，类似二叉搜索树查找。",
    color: "blue",
    features: ["从右上角开始", "大于 target → 左移", "小于 target → 下移"],
  },

  // Problem 56-67: 链表题目
  56: {
    idea: "使用哈希表或双指针找到相交节点。",
    color: "blue",
    features: ["双指针走到末尾", "交换链表继续走", "相遇点即交点"],
  },
  57: {
    idea: "快慢指针找中点，反转后半部分，逐个比较。",
    color: "purple",
    features: ["快慢指针找中点", "反转后半链表", "比较两部分"],
  },
  58: {
    idea: "快慢指针：快指针走两步，慢指针走一步。",
    color: "cyan",
    features: ["fast 走两步", "slow 走一步", "相遇则有环"],
  },
  59: {
    idea: "快慢指针找环，再找环入口。",
    color: "indigo",
    features: ["快慢指针找环", "一个指针从头开始", "相遇点即入口"],
  },
  60: {
    idea: "逐位相加两个链表，处理进位。",
    color: "green",
    features: ["同时遍历两链表", "对应位相加", "处理进位 carry"],
  },
  61: {
    idea: "快慢指针：快指针先走 n 步。",
    color: "blue",
    features: ["fast 先走 n 步", "fast 和 slow 同时走", "slow 即为目标前一个"],
  },
  62: {
    idea: "递归或迭代：交换相邻两个节点。",
    color: "amber",
    features: ["保存 next", "交换 first 和 second", "递归处理剩余"],
  },
  63: {
    idea: "递归分组反转：每 k 个一组反转。",
    color: "orange",
    features: ["分组反转 k 个节点", "连接已反转部分", "递归处理剩余"],
  },
  64: {
    idea: "哈希表 + 两次遍历：复制节点和随机指针。",
    color: "purple",
    features: ["第一遍复制节点", "第二遍复制 random", "用哈希表映射"],
  },
  65: {
    idea: "归并排序：分割链表，合并有序链表。",
    color: "blue",
    features: ["快慢指针找中点", "递归排序两部分", "合并有序链表"],
  },
  66: {
    idea: "优先队列（小根堆）：每次取最小节点。",
    color: "red",
    features: ["所有链表头入堆", "取出最小节点", "该链表下一个入堆"],
  },
  67: {
    idea: "哈希表 + 双向链表：实现 O(1) 访问和更新。",
    color: "cyan",
    features: ["哈希表存节点", "双向链表维护顺序", "LRU 时删除尾节点"],
  },

  // Problem 68-93: 树、图、回溯
  68: {
    idea: "递归遍历：左子树 → 根节点 → 右子树。中序遍历二叉搜索树会得到升序序列。",
    color: "indigo",
    features: ["递归左子树", "访问根节点", "递归右子树"],
  },
  69: {
    idea: "使用哈希表将相同字母异位词分组（同 Problem 41）。",
    color: "indigo",
    features: ["对每个单词排序", "排序后作为 key", "分组到哈希表"],
  },
  70: {
    idea: "使用哈希表存储数字，检查连续序列（同 Problem 42）。",
    color: "green",
    features: ["将数字放入 Set", "从序列起点开始", "计算连续长度"],
  },
  71: {
    idea: "双指针 + 排序：固定一个数，双指针找另外两个数（同 Problem 43）。",
    color: "blue",
    features: ["排序数组", "固定 nums[i]", "双指针找 -nums[i]"],
  },
  72: {
    idea: "递归翻转左右子树，然后交换当前节点的左右子节点。",
    color: "cyan",
    features: ["递归反转左子树", "递归反转右子树", "交换左右子树"],
  },
  73: {
    idea: "单调队列：维护窗口内最大值（同 Problem 49）。",
    color: "red",
    features: ["队列存储索引", "保持队列递减", "队首是最大值"],
  },
  74: {
    idea: "递归比较左右子树是否镜像对称。左子树的左节点与右子树的右节点比较，左子树的右节点与右子树的左节点比较。",
    color: "purple",
    features: ["比较左右子树根节点", "左的左 vs 右的右", "左的右 vs 右的左"],
  },
  75: {
    idea: "在计算深度的同时维护最大直径。每个节点的直径 = 左子树深度 + 右子树深度。",
    color: "orange",
    features: ["递归计算深度", "直径 = 左深度 + 右深度", "更新最大值"],
  },
  76: {
    idea: "使用队列（BFS）逐层遍历。每次处理一整层的节点，将下一层节点加入队列。",
    color: "teal",
    features: ["队列初始化根节点", "逐层处理", "记录每层节点值"],
  },
  77: {
    idea: "选择中间元素作为根节点，左半部分构建左子树，右半部分构建右子树，自然形成平衡BST。",
    color: "indigo",
    features: ["选中间元素作根", "左半部分递归建左子树", "右半部分递归建右子树"],
  },
  78: {
    idea: "递归验证每个节点是否在合法范围 (min, max) 内。左子树更新上界，右子树更新下界。",
    color: "green",
    features: ["左子树 < root < 右子树", "递归验证左子树", "递归验证右子树"],
  },
  79: {
    idea: "BST的中序遍历结果是升序的，因此第k个访问的节点就是第k小的元素。",
    color: "blue",
    features: ["中序遍历", "计数访问节点", "第 k 个返回"],
  },
  80: {
    idea: "BFS 层序遍历：记录每层最右节点。",
    color: "orange",
    features: ["BFS 遍历", "记录每层节点", "取每层最后一个"],
  },
  81: {
    idea: "前序遍历：将左子树移到右子树，原右子树接到左子树末尾。",
    color: "red",
    features: ["保存右子树", "左子树移到右边", "原右子树接到末尾"],
  },
  82: {
    idea: "递归构建：前序第一个是根，在中序中分割左右。",
    color: "blue",
    features: ["前序第一个是根", "中序找根位置分割", "递归构建左右子树"],
  },
  83: {
    idea: "双重递归：对每个节点作为起点向下搜索。",
    color: "indigo",
    features: ["遍历每个节点作起点", "从起点向下 DFS", "累加路径数"],
  },
  84: {
    idea: "递归查找：根节点是 p 或 q 之一，或左右子树都找到。",
    color: "purple",
    features: ["根是 p 或 q → 返回根", "左右都找到 → 返回根", "只一边找到 → 返回那边"],
  },
  85: {
    idea: "递归计算每个节点的最大贡献值。",
    color: "orange",
    features: ["递归计算左右贡献", "路径和 = 节点值 + 左贡献 + 右贡献", "更新全局最大值"],
  },
  86: {
    idea: "BFS：从所有腐烂橘子同时开始扩散。",
    color: "red",
    features: ["所有腐烂橘子入队", "BFS 扩散感染", "记录时间"],
  },
  87: {
    idea: "拓扑排序：统计入度，BFS 删除入度为 0 的节点。",
    color: "blue",
    features: ["统计每门课入度", "入度为 0 入队", "BFS 减少入度"],
  },
  88: {
    idea: "Trie 树：每个节点存储字符，标记单词结束。",
    color: "green",
    features: ["插入 → 逐字符建节点", "查找 → 逐字符匹配", "标记单词结束"],
  },
  89: {
    idea: "回溯法：每个元素选或不选。",
    color: "purple",
    features: ["选择当前元素", "递归处理剩余", "回溯不选"],
  },
  90: {
    idea: "回溯法：每个数字对应多个字母，逐个选择。",
    color: "cyan",
    features: ["选择当前数字的一个字母", "递归处理下一个数字", "回溯尝试其他字母"],
  },
  91: {
    idea: "回溯法：选择左右括号，保证左括号数 ≤ n，右括号数 ≤ 左括号数。",
    color: "indigo",
    features: ["选择左括号（如果 < n）", "选择右括号（如果 < 左括号数）", "递归生成"],
  },
  92: {
    idea: "DFS + 回溯：从匹配首字母的位置开始，向四个方向搜索。",
    color: "orange",
    features: ["找到首字母位置", "DFS 向四个方向", "标记访问 + 回溯"],
  },
  93: {
    idea: "回溯法：枚举所有分割方式，检查每个子串是否为回文。",
    color: "teal",
    features: ["枚举分割位置", "检查子串是否回文", "递归处理剩余字符串"],
  },

  // Problem 94-98: 二分查找和栈类
  94: {
    idea: "使用二分查找在有序数组中定位目标值或插入位置。",
    color: "blue",
    features: ["左右指针 left, right", "mid = (left + right) / 2", "根据大小调整边界"],
  },
  95: {
    idea: "判断哪一半有序，在有序部分查找目标值。",
    color: "orange",
    features: ["判断左半或右半有序", "在有序部分二分查找", "否则搜索另一半"],
  },
  96: {
    idea: "使用栈匹配括号，左括号入栈，右括号与栈顶匹配。",
    color: "purple",
    features: ["左括号 → 入栈", "右括号 → 与栈顶匹配", "最后栈为空则有效"],
  },
  97: {
    idea: "使用辅助栈同步记录当前栈中的最小值，每次push和pop时同步更新。",
    color: "teal",
    features: ["主栈存储所有元素", "辅助栈存储最小值", "push/pop 同步操作"],
  },
  98: {
    idea: "使用单调递减栈存储索引，当遇到更高温度时，栈中所有较低温度都找到了答案。",
    color: "red",
    features: ["栈存储索引", "遇到更高温度 → 出栈", "记录天数差"],
  },
  99: {
    idea: "使用两个栈分别存储数字和字符串。遇到 '[' 时入栈，遇到 ']' 时出栈并重复字符串。",
    color: "indigo",
    features: ["数字栈 + 字符串栈", "遇到 [ → 入栈", "遇到 ] → 出栈重复"],
  },

  // Problem 100-108: 贪心、动态规划
  100: {
    idea: "维护一个最远可达位置，遍历数组时更新这个位置。",
    color: "green",
    features: ["记录最远可达 maxReach", "更新 maxReach = max(maxReach, i + nums[i])", "判断能否到达终点"],
  },
  101: {
    idea: "dp[i] = max(dp[i-1], dp[i-2] + nums[i])，表示偷或不偷当前房屋。",
    color: "amber",
    features: ["不偷 → dp[i-1]", "偷 → dp[i-2] + nums[i]", "取最大值"],
  },
  102: {
    idea: "使用快慢指针找到中点，反转后半部分链表，然后比较两部分是否相同。",
    color: "blue",
    features: ["快慢指针找中点", "反转后半部分", "逐个比较节点"],
  },
  103: {
    idea: "dp[i] 表示和为 i 的完全平方数的最少数量。",
    color: "purple",
    features: ["初始化 dp[0] = 0", "枚举所有完全平方数", "dp[i] = min(dp[i], dp[i-j²] + 1)"],
  },
  104: {
    idea: "先按区间起始位置排序，然后遍历区间，判断是否重叠并合并。",
    color: "blue",
    features: ["按起始位置排序", "当前区间与下一个重叠 → 合并", "不重叠 → 保存结果"],
  },
  105: {
    idea: "dp[i] 表示以 nums[i] 结尾的最长递增子序列长度。",
    color: "green",
    features: ["初始化 dp[i] = 1", "遍历 j < i, 如果 nums[j] < nums[i]", "dp[i] = max(dp[i], dp[j] + 1)"],
  },
  106: {
    idea: "完全背包问题：dp[i] 表示凑成金额 i 所需的最少硬币数。",
    color: "amber",
    features: ["初始化 dp[0] = 0", "枚举每个硬币", "dp[i] = min(dp[i], dp[i-coin] + 1)"],
  },
  107: {
    idea: "dp[i][j] = dp[i-1][j] + dp[i][j-1]，到达每个位置的路径数。",
    color: "indigo",
    features: ["初始化第一行第一列为 1", "从上方来 → dp[i-1][j]", "从左方来 → dp[i][j-1]"],
  },
  108: {
    idea: "同时维护最大值和最小值，因为负数会使最大变最小、最小变最大。",
    color: "red",
    features: ["maxDP 记录最大乘积", "minDP 记录最小乘积", "更新 max/min(num, maxDP*num, minDP*num)"],
  },
};

/**
 * 根据题目ID获取核心思想配置
 * 
 * @param problemId 题目ID
 * @returns 核心思想配置，如果不存在则返回 undefined
 */
export function getProblemCoreIdea(problemId: number): ProblemCoreIdeaConfig | undefined {
  return problemCoreIdeas[problemId];
}

/**
 * 根据题目ID获取颜色主题
 * 
 * @param problemId 题目ID
 * @returns 颜色主题，默认返回 'blue'
 */
export function getProblemColor(problemId: number): CoreIdeaColor {
  return problemCoreIdeas[problemId]?.color || 'blue';
}
