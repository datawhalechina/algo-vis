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
];
