import { Problem, Difficulty, Category, SolutionMethod } from "@/types";

/**
 * 链表类题目数据
 */
export const linkedListProblems: Problem[] = [
  {
    id: 2,
    leetcodeNumber: 206,
    title: "反转链表",
    difficulty: Difficulty.EASY,
    category: [Category.LINKED_LIST],
    methods: [
      SolutionMethod.TWO_POINTERS,
      SolutionMethod.ITERATION,
      SolutionMethod.RECURSION,
    ],
    description: `给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。`,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
      },
      {
        input: "head = []",
        output: "[]",
      },
    ],
    constraints: [
      "链表中节点的数目范围是 [0, 5000]",
      "-5000 <= Node.val <= 5000",
    ],
    hints: [
      "可以使用迭代或递归两种方法",
      "迭代法需要用三个指针：prev, curr, next",
      "递归法要理解递归返回后的操作",
    ],
    solution: {
      methodName: "迭代法（双指针）",
      methodDescription:
        "使用双指针迭代遍历链表，逐个反转节点的指向。这是最直观、最容易理解的解法。",
      code: `function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr: ListNode | null = head;
  
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  
  return prev;
}`,
      language: "typescript",
      keyLines: [6, 7, 8, 9],
      steps: [
        "初始化两个指针：prev = null（前驱节点），curr = head（当前节点）",
        "遍历链表，对于每个节点：",
        "  • 先保存下一个节点：next = curr.next",
        "  • 反转当前节点的指针：curr.next = prev",
        "  • 移动两个指针：prev = curr, curr = next",
        "当 curr 为 null 时，prev 就是新的头节点",
      ],
      advantages: [
        "空间复杂度低：只需要常数级别的额外空间",
        "逻辑清晰：容易理解和实现",
        "适合面试：是面试官最期待看到的解法",
      ],
      timeComplexity: {
        value: "O(n)",
        description: "需要遍历链表一次，n 为链表长度",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个指针变量",
      },
      comparisons: [
        {
          name: "迭代法（双指针）",
          description: "使用两个指针遍历并反转",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["空间效率高", "易于理解", "最常用"],
          cons: ["需要仔细处理指针"],
        },
        {
          name: "递归法",
          description: "利用递归栈反转链表",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["代码简洁", "体现递归思想"],
          cons: ["递归栈空间开销", "可能栈溢出"],
        },
      ],
    },
  },
  {
    id: 12,
    leetcodeNumber: 21,
    title: "合并两个有序链表",
    difficulty: Difficulty.EASY,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.TWO_POINTERS, SolutionMethod.ITERATION],
    description: `将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。`,
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
      },
      {
        input: "list1 = [], list2 = []",
        output: "[]",
      },
      {
        input: "list1 = [], list2 = [0]",
        output: "[0]",
      },
    ],
    constraints: [
      "两个链表的节点数目范围是 [0, 50]",
      "-100 <= Node.val <= 100",
      "list1 和 list2 均按非递减顺序排列",
    ],
    hints: [
      "使用双指针分别指向两个链表",
      "每次选择较小的节点加入结果链表",
      "注意处理链表为空的情况",
    ],
    solution: {
      methodName: "迭代法（双指针）",
      methodDescription:
        "使用双指针分别遍历两个链表，每次选择较小的节点加入结果链表，直到某个链表遍历完，然后将剩余节点直接连接。",
      code: `function mergeTwoLists(list1: ListNode | null, list2: ListNode | null): ListNode | null {
  const dummy = new ListNode();
  let current = dummy;
  
  while (list1 !== null && list2 !== null) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }
  
  current.next = list1 !== null ? list1 : list2;
  return dummy.next;
}`,
      language: "typescript",
      keyLines: [6, 7, 10, 15],
      steps: [
        "创建哑节点 dummy，简化边界处理",
        "当两个链表都不为空时循环：",
        "  • 比较两个链表当前节点的值",
        "  • 将较小的节点加入结果链表",
        "  • 移动对应链表的指针",
        "将剩余的非空链表直接连接到结果链表",
        "返回 dummy.next（跳过哑节点）",
      ],
      advantages: [
        "简单直观：逻辑清晰易懂",
        "时间最优：O(n+m) 一次遍历",
        "空间优化：O(1) 只使用指针",
      ],
      timeComplexity: {
        value: "O(n + m)",
        description: "需要遍历两个链表的所有节点",
      },
      spaceComplexity: {
        value: "O(1)",
        description: "只使用了常数个指针变量",
      },
      comparisons: [
        {
          name: "迭代法",
          description: "使用双指针逐个比较合并",
          timeComplexity: "O(n + m)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["最优解法", "空间效率高"],
          cons: ["需要处理边界情况"],
        },
        {
          name: "递归法",
          description: "递归比较并连接节点",
          timeComplexity: "O(n + m)",
          spaceComplexity: "O(n + m)",
          isRecommended: false,
          pros: ["代码简洁"],
          cons: ["递归栈空间开销"],
        },
      ],
    },
  },
  // Problem 56: 相交链表
  {
    id: 56,
    leetcodeNumber: 160,
    title: "相交链表",
    difficulty: Difficulty.EASY,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.TWO_POINTERS],
    description: `给你两个单链表的头节点 headA 和 headB ，请你找出并返回两个单链表相交的起始节点。如果两个链表不存在相交节点，返回 null 。`,
    examples: [
      {
        input: "intersectVal = 8, listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], skipA = 2, skipB = 3",
        output: "8",
        explanation: "相交节点的值为 8",
      },
    ],
    constraints: [
      "listA 中节点数目为 m",
      "listB 中节点数目为 n",
      "1 <= m, n <= 3 * 10⁴",
      "1 <= Node.val <= 10⁵",
    ],
    hints: ["使用双指针", "消除长度差"],
    solution: {
      methodName: "双指针",
      methodDescription: "两个指针分别遍历两个链表，到达末尾后切换到另一个链表头部，相遇点就是交点",
      code: `function getIntersectionNode(headA: ListNode | null, headB: ListNode | null): ListNode | null {
  if (!headA || !headB) return null;
  
  let pA: ListNode | null = headA;
  let pB: ListNode | null = headB;
  
  while (pA !== pB) {
    pA = pA === null ? headB : pA.next;
    pB = pB === null ? headA : pB.next;
  }
  
  return pA;
}`,
      language: "typescript",
      keyLines: [7, 8, 9],
      steps: ["两指针同时遍历", "到末尾切换链表", "相遇即为交点"],
      advantages: ["O(m+n)时间", "O(1)空间", "巧妙消除长度差"],
      timeComplexity: { value: "O(m+n)", description: "遍历两个链表" },
      spaceComplexity: { value: "O(1)", description: "常数空间" },
      comparisons: [],
    },
  },
  // Problem 57: 回文链表
  {
    id: 57,
    leetcodeNumber: 234,
    title: "回文链表",
    difficulty: Difficulty.EASY,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.TWO_POINTERS],
    description: `给你一个单链表的头节点 head ，请你判断该链表是否为回文链表。如果是，返回 true ；否则，返回 false 。`,
    examples: [
      {
        input: "head = [1,2,2,1]",
        output: "true",
      },
      {
        input: "head = [1,2]",
        output: "false",
      },
    ],
    constraints: [
      "链表中节点数目在范围 [1, 10⁵] 内",
      "0 <= Node.val <= 9",
    ],
    hints: ["快慢指针找中点", "反转后半部分", "比较两部分"],
    solution: {
      methodName: "快慢指针+反转",
      methodDescription: "用快慢指针找到中点，反转后半部分链表，然后比较前后两部分",
      code: `function isPalindrome(head: ListNode | null): boolean {
  if (!head || !head.next) return true;
  
  // 快慢指针找中点
  let slow: ListNode | null = head;
  let fast: ListNode | null = head;
  
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  
  // 反转后半部分
  let prev: ListNode | null = null;
  while (slow) {
    const next = slow.next;
    slow.next = prev;
    prev = slow;
    slow = next;
  }
  
  // 比较两部分
  let left: ListNode | null = head;
  let right: ListNode | null = prev;
  
  while (right) {
    if (left!.val !== right.val) return false;
    left = left!.next;
    right = right.next;
  }
  
  return true;
}`,
      language: "typescript",
      keyLines: [8, 14, 26],
      steps: ["快慢指针找中点", "反转后半部分", "比较两部分"],
      advantages: ["O(n)时间", "O(1)空间"],
      timeComplexity: { value: "O(n)", description: "遍历链表" },
      spaceComplexity: { value: "O(1)", description: "常数空间" },
      comparisons: [],
    },
  },
  // Problem 58: 环形链表
  {
    id: 58,
    leetcodeNumber: 141,
    title: "环形链表",
    difficulty: Difficulty.EASY,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.TWO_POINTERS],
    description: `给你一个链表的头节点 head ，判断链表中是否有环。

如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。 为了表示给定链表中的环，评测系统内部使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。注意：pos 不作为参数进行传递 。仅仅是为了标识链表的实际情况。

如果链表中存在环 ，则返回 true 。 否则，返回 false 。`,
    examples: [
      {
        input: "head = [3,2,0,-4], pos = 1",
        output: "true",
        explanation: "链表中有一个环，其尾部连接到第二个节点。",
      },
      {
        input: "head = [1,2], pos = 0",
        output: "true",
        explanation: "链表中有一个环，其尾部连接到第一个节点。",
      },
      {
        input: "head = [1], pos = -1",
        output: "false",
        explanation: "链表中没有环。",
      },
    ],
    constraints: [
      "链表中节点的数目范围是 [0, 10⁴]",
      "-10⁵ <= Node.val <= 10⁵",
      "pos 为 -1 或者链表中的一个有效索引",
    ],
    hints: ["使用快慢指针", "快指针每次走2步，慢指针每次走1步", "如果有环，快慢指针一定会相遇"],
    solution: {
      methodName: "快慢指针（Floyd判圈算法）",
      methodDescription: "使用快慢指针，快指针每次走两步，慢指针每次走一步。如果有环，两指针必然相遇",
      code: `function hasCycle(head: ListNode | null): boolean {
  if (!head || !head.next) return false;
  
  let slow: ListNode | null = head;
  let fast: ListNode | null = head.next;
  
  while (slow !== fast) {
    if (!fast || !fast.next) return false;
    slow = slow!.next;
    fast = fast.next.next;
  }
  
  return true;
}`,
      language: "typescript",
      keyLines: [7, 8, 9, 10],
      steps: ["初始化快慢指针", "快指针走2步，慢指针走1步", "如果相遇则有环", "快指针到末尾则无环"],
      advantages: ["O(n)时间", "O(1)空间", "经典算法"],
      timeComplexity: { value: "O(n)", description: "最多遍历n个节点" },
      spaceComplexity: { value: "O(1)", description: "只用两个指针" },
      comparisons: [
        {
          name: "哈希表",
          description: "用Set记录访问过的节点",
          timeComplexity: "O(n)",
          spaceComplexity: "O(n)",
          isRecommended: false,
          pros: ["直观"],
          cons: ["需要额外空间"],
        },
        {
          name: "快慢指针",
          description: "Floyd判圈算法",
          timeComplexity: "O(n)",
          spaceComplexity: "O(1)",
          isRecommended: true,
          pros: ["空间最优", "经典算法"],
          cons: ["需要理解原理"],
        },
      ],
    },
  },
  // Problem 59: 环形链表 II
  {
    id: 59,
    leetcodeNumber: 142,
    title: "环形链表 II",
    difficulty: Difficulty.MEDIUM,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.TWO_POINTERS],
    description: `给定一个链表的头节点 head ，返回链表开始入环的第一个节点。如果链表无环，则返回 null。

不允许修改链表。`,
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "返回索引为1的节点" },
      { input: "head = [1,2], pos = 0", output: "返回索引为0的节点" },
      { input: "head = [1], pos = -1", output: "null" },
    ],
    constraints: [
      "链表中节点的数目范围在 [0, 10⁴] 内",
      "-10⁵ <= Node.val <= 10⁵",
    ],
    hints: ["快慢指针", "Floyd判圈算法", "数学证明"],
    solution: {
      methodName: "快慢指针",
      methodDescription: "快慢指针相遇后，一个指针从头开始，再次相遇即为入口",
      code: `function detectCycle(head: ListNode | null): ListNode | null {
  let slow = head, fast = head;
  
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      let ptr = head;
      while (ptr !== slow) {
        ptr = ptr!.next;
        slow = slow!.next;
      }
      return ptr;
    }
  }
  
  return null;
}`,
      language: "typescript",
      keyLines: [7, 9, 10, 11],
      steps: ["快慢指针判环", "相遇后从头开始", "再次相遇即入口"],
      advantages: ["O(n)时间", "O(1)空间"],
      timeComplexity: { value: "O(n)", description: "遍历链表" },
      spaceComplexity: { value: "O(1)", description: "常数空间" },
      comparisons: [],
    },
  },
  // Problem 60: 两数相加
  {
    id: 60,
    leetcodeNumber: 2,
    title: "两数相加",
    difficulty: Difficulty.MEDIUM,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.ITERATION],
    description: `给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照逆序的方式存储的，并且每个节点只能存储一位数字。请你将两个数相加，并以相同形式返回一个表示和的链表。`,
    examples: [
      { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807" },
      { input: "l1 = [0], l2 = [0]", output: "[0]" },
    ],
    constraints: [
      "每个链表中的节点数在范围 [1, 100] 内",
      "0 <= Node.val <= 9",
    ],
    hints: ["模拟加法", "处理进位"],
    solution: {
      methodName: "模拟加法",
      methodDescription: "逐位相加，处理进位",
      code: `function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let current = dummy, carry = 0;
  
  while (l1 || l2 || carry) {
    const sum = (l1?.val || 0) + (l2?.val || 0) + carry;
    carry = Math.floor(sum / 10);
    current.next = new ListNode(sum % 10);
    current = current.next;
    
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  
  return dummy.next;
}`,
      language: "typescript",
      keyLines: [5, 6, 7],
      steps: ["初始化", "逐位相加", "处理进位"],
      advantages: ["一次遍历", "逻辑清晰"],
      timeComplexity: { value: "O(max(m,n))", description: "m和n是链表长度" },
      spaceComplexity: { value: "O(max(m,n))", description: "结果链表" },
      comparisons: [],
    },
  },
  // Problem 61: 删除链表的倒数第N个结点
  {
    id: 61,
    leetcodeNumber: 19,
    title: "删除链表的倒数第 N 个结点",
    difficulty: Difficulty.MEDIUM,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.TWO_POINTERS],
    description: `给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。`,
    examples: [
      { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]" },
      { input: "head = [1], n = 1", output: "[]" },
    ],
    constraints: ["链表中结点的数目为 sz", "1 <= sz <= 30", "1 <= n <= sz"],
    hints: ["快慢指针", "快指针先走n步"],
    solution: {
      methodName: "双指针",
      methodDescription: "快指针先走n步，然后同步前进",
      code: `function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let fast = dummy, slow = dummy;
  
  for (let i = 0; i < n; i++) {
    fast = fast!.next;
  }
  
  while (fast && fast.next) {
    fast = fast.next;
    slow = slow!.next;
  }
  
  slow!.next = slow!.next!.next;
  return dummy.next;
}`,
      language: "typescript",
      keyLines: [5, 9, 14],
      steps: ["快指针先走n步", "同步前进", "删除节点"],
      advantages: ["一次遍历", "O(1)空间"],
      timeComplexity: { value: "O(L)", description: "L是链表长度" },
      spaceComplexity: { value: "O(1)", description: "常数空间" },
      comparisons: [],
    },
  },
  // Problem 62: 两两交换链表中的节点
  {
    id: 62,
    leetcodeNumber: 24,
    title: "两两交换链表中的节点",
    difficulty: Difficulty.MEDIUM,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.ITERATION],
    description: `给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须在不修改节点内部的值的情况下完成本题。`,
    examples: [
      { input: "head = [1,2,3,4]", output: "[2,1,4,3]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["链表中节点的数目在范围 [0, 100] 内", "0 <= Node.val <= 100"],
    hints: ["迭代或递归", "注意指针顺序"],
    solution: {
      methodName: "迭代",
      methodDescription: "每次交换两个节点",
      code: `function swapPairs(head: ListNode | null): ListNode | null {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  
  while (prev.next && prev.next.next) {
    const first = prev.next;
    const second = prev.next.next;
    
    first.next = second.next;
    second.next = first;
    prev.next = second;
    prev = first;
  }
  
  return dummy.next;
}`,
      language: "typescript",
      keyLines: [5, 9, 10, 11],
      steps: ["获取两节点", "交换", "移动指针"],
      advantages: ["原地操作", "逻辑清晰"],
      timeComplexity: { value: "O(n)", description: "遍历链表" },
      spaceComplexity: { value: "O(1)", description: "常数空间" },
      comparisons: [],
    },
  },
  // Problem 63: K个一组翻转链表
  {
    id: 63,
    leetcodeNumber: 25,
    title: "K 个一组翻转链表",
    difficulty: Difficulty.HARD,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.ITERATION],
    description: `给你链表的头节点 head ，每 k 个节点一组进行翻转，请你返回修改后的链表。k 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。`,
    examples: [
      { input: "head = [1,2,3,4,5], k = 2", output: "[2,1,4,3,5]" },
      { input: "head = [1,2,3,4,5], k = 3", output: "[3,2,1,4,5]" },
    ],
    constraints: ["1 <= k <= n <= 5000", "0 <= Node.val <= 1000"],
    hints: ["分组反转", "递归或迭代"],
    solution: {
      methodName: "迭代反转",
      methodDescription: "分组反转k个节点",
      code: `function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let prevGroup = dummy;
  
  while (true) {
    const kth = getKth(prevGroup, k);
    if (!kth) break;
    
    const groupNext = kth.next;
    let prev = kth.next, curr = prevGroup.next;
    
    while (curr !== groupNext) {
      const next = curr!.next;
      curr!.next = prev;
      prev = curr;
      curr = next;
    }
    
    const tmp = prevGroup.next;
    prevGroup.next = kth;
    prevGroup = tmp!;
  }
  
  return dummy.next;
}`,
      language: "typescript",
      keyLines: [6, 10, 13, 20],
      steps: ["检查k个节点", "反转", "连接"],
      advantages: ["原地操作"],
      timeComplexity: { value: "O(n)", description: "遍历所有节点" },
      spaceComplexity: { value: "O(1)", description: "常数空间" },
      comparisons: [],
    },
  },
  // Problem 64: 随机链表的复制
  {
    id: 64,
    leetcodeNumber: 138,
    title: "随机链表的复制",
    difficulty: Difficulty.MEDIUM,
    category: [Category.LINKED_LIST, Category.HASH_TABLE],
    methods: [SolutionMethod.ITERATION],
    description: `给你一个长度为 n 的链表，每个节点包含一个额外增加的随机指针 random ，该指针可以指向链表中的任何节点或空节点。构造这个链表的深拷贝。`,
    examples: [
      { input: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]', output: '[[7,null],[13,0],[11,4],[10,2],[1,0]]' },
    ],
    constraints: ["0 <= n <= 1000", "-10⁴ <= Node.val <= 10⁴"],
    hints: ["哈希表映射", "两次遍历"],
    solution: {
      methodName: "哈希表",
      methodDescription: "建立原节点到新节点的映射",
      code: `function copyRandomList(head: Node | null): Node | null {
  if (!head) return null;
  const map = new Map<Node, Node>();
  
  let curr = head;
  while (curr) {
    map.set(curr, new Node(curr.val));
    curr = curr.next;
  }
  
  curr = head;
  while (curr) {
    const newNode = map.get(curr)!;
    newNode.next = map.get(curr.next!) || null;
    newNode.random = map.get(curr.random!) || null;
    curr = curr.next;
  }
  
  return map.get(head)!;
}`,
      language: "typescript",
      keyLines: [7, 14, 15],
      steps: ["复制节点", "复制指针", "返回新链表"],
      advantages: ["思路清晰"],
      timeComplexity: { value: "O(n)", description: "两次遍历" },
      spaceComplexity: { value: "O(n)", description: "哈希表" },
      comparisons: [],
    },
  },
  // Problem 65: 排序链表
  {
    id: 65,
    leetcodeNumber: 148,
    title: "排序链表",
    difficulty: Difficulty.MEDIUM,
    category: [Category.LINKED_LIST],
    methods: [SolutionMethod.SORTING, SolutionMethod.DIVIDE_CONQUER],
    description: `给你链表的头结点 head ，请将其按升序排列并返回排序后的链表。`,
    examples: [
      { input: "head = [4,2,1,3]", output: "[1,2,3,4]" },
      { input: "head = [-1,5,3,4,0]", output: "[-1,0,3,4,5]" },
    ],
    constraints: ["链表中节点的数目在范围 [0, 5 * 10⁴] 内"],
    hints: ["归并排序", "快慢指针找中点"],
    solution: {
      methodName: "归并排序",
      methodDescription: "递归分治，合并有序链表",
      code: `function sortList(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return head;
  
  let slow = head, fast = head.next;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  
  const mid = slow!.next;
  slow!.next = null;
  
  return merge(sortList(head), sortList(mid));
}`,
      language: "typescript",
      keyLines: [5, 13],
      steps: ["找中点", "递归排序", "合并"],
      advantages: ["稳定排序", "O(nlogn)"],
      timeComplexity: { value: "O(nlogn)", description: "归并排序" },
      spaceComplexity: { value: "O(logn)", description: "递归栈" },
      comparisons: [],
    },
  },
  // Problem 66: 合并K个升序链表
  {
    id: 66,
    leetcodeNumber: 23,
    title: "合并 K 个升序链表",
    difficulty: Difficulty.HARD,
    category: [Category.LINKED_LIST, Category.HEAP],
    methods: [SolutionMethod.DIVIDE_CONQUER],
    description: `给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。`,
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
      { input: "lists = []", output: "[]" },
    ],
    constraints: ["k == lists.length", "0 <= k <= 10⁴"],
    hints: ["分治法", "两两合并", "优先队列"],
    solution: {
      methodName: "分治",
      methodDescription: "分治合并k个链表",
      code: `function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  if (!lists.length) return null;
  return mergeLists(lists, 0, lists.length - 1);
}

function mergeLists(lists: Array<ListNode | null>, left: number, right: number): ListNode | null {
  if (left === right) return lists[left];
  const mid = Math.floor((left + right) / 2);
  return merge(mergeLists(lists, left, mid), mergeLists(lists, mid + 1, right));
}`,
      language: "typescript",
      keyLines: [3, 9],
      steps: ["分治", "合并"],
      advantages: ["O(nlogk)"],
      timeComplexity: { value: "O(nlogk)", description: "n是总节点数，k是链表数" },
      spaceComplexity: { value: "O(logk)", description: "递归栈" },
      comparisons: [],
    },
  },
  // Problem 67: LRU缓存
  {
    id: 67,
    leetcodeNumber: 146,
    title: "LRU 缓存",
    difficulty: Difficulty.MEDIUM,
    category: [Category.LINKED_LIST, Category.HASH_TABLE],
    methods: [SolutionMethod.ITERATION],
    description: `请你设计并实现一个满足 LRU (最近最少使用) 缓存约束的数据结构。实现 LRUCache 类，支持 get 和 put 操作，时间复杂度都是 O(1)。`,
    examples: [
      { input: 'LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2);', output: '1, -1' },
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10⁴"],
    hints: ["哈希表+双向链表", "O(1)操作"],
    solution: {
      methodName: "哈希表+双向链表",
      methodDescription: "哈希表存储key到节点的映射，双向链表维护访问顺序",
      code: `class LRUCache {
  private capacity: number;
  private map: Map<number, Node>;
  private head: Node;
  private tail: Node;
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  
  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key)!;
    this.moveToHead(node);
    return node.value;
  }
  
  put(key: number, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.moveToHead(node);
    } else {
      const node = new Node(key, value);
      this.map.set(key, node);
      this.addToHead(node);
      if (this.map.size > this.capacity) {
        const removed = this.removeTail();
        this.map.delete(removed.key);
      }
    }
  }
}`,
      language: "typescript",
      keyLines: [17, 19, 31, 33],
      steps: ["哈希表查找", "移到链表头", "淘汰尾节点"],
      advantages: ["O(1)操作"],
      timeComplexity: { value: "O(1)", description: "get和put都是O(1)" },
      spaceComplexity: { value: "O(capacity)", description: "存储capacity个键值对" },
      comparisons: [],
    },
  },
];
