import { useRef, ReactNode } from "react";
import * as d3 from "d3";

/**
 * 树节点位置信息
 */
export interface TreeNodePosition {
  x: number;
  y: number;
  node: {
    val: number | null;
    index: number;
  };
}

/**
 * 树节点状态
 */
export interface TreeNodeState {
  isCurrent?: boolean;
  isVisited?: boolean;
  isHighlighted?: boolean;
  customState?: Record<string, any>;
}

/**
 * 图例项配置
 */
export interface LegendItem {
  color: string;
  label: string;
  shape?: 'circle' | 'badge';
}

/**
 * TreeTemplate 属性
 */
export interface TreeTemplateProps {
  // 数据：数组形式表示的树 (number | null)[]
  data: (number | null)[];
  
  // 核心渲染函数
  renderNode: (position: TreeNodePosition, state: TreeNodeState) => ReactNode;
  renderEdge?: (from: TreeNodePosition, to: TreeNodePosition, isLeft?: boolean) => ReactNode;
  
  // 状态计算函数
  getNodeState?: (index: number, val: number | null) => Partial<TreeNodeState>;
  
  // 布局配置
  layout?: {
    horizontalSpacing?: number;
    verticalSpacing?: number;
    nodeRadius?: number;
  };
  
  // 图例配置
  legend?: LegendItem[];
  
  // 动画配置（已废弃，保留接口兼容）
  animation?: {
    node?: {
      hidden?: any;
      visible?: any;
    };
    edge?: {
      hidden?: any;
      visible?: any;
    };
    duration?: number;
    staggerDelay?: number;
  };
  
  // 空树显示
  emptyMessage?: string;
  
  // 样式
  className?: string;
}

/**
 * 辅助接口：构建树结构给 D3 使用
 */
interface D3TreeNode {
  val: number | null;
  index: number;
  parentIndex: number | null;
  children?: D3TreeNode[];
}

// 存储父子关系映射
const parentMap = new Map<number, number | null>();

/**
 * 构建树结构（LeetCode 层序遍历方式）
 */
function buildTreeStructure(arr: (number | null)[]): D3TreeNode | null {
  if (arr.length === 0 || arr[0] === null) return null;

  // 清空父子关系映射
  parentMap.clear();
  parentMap.set(0, null);

  const root: D3TreeNode = { val: arr[0], index: 0, parentIndex: null, children: [] };
  const queue: D3TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()!;

    // 左子节点
    if (i < arr.length) {
      if (arr[i] !== null) {
        const leftChild: D3TreeNode = { val: arr[i], index: i, parentIndex: node.index, children: [] };
        node.children!.push(leftChild);
        queue.push(leftChild);
        parentMap.set(i, node.index);
      }
      i++;
    }

    // 右子节点
    if (i < arr.length) {
      if (arr[i] !== null) {
        const rightChild: D3TreeNode = { val: arr[i], index: i, parentIndex: node.index, children: [] };
        node.children!.push(rightChild);
        queue.push(rightChild);
        parentMap.set(i, node.index);
      }
      i++;
    }
  }

  return root;
}

/**
 * 计算树节点的位置（使用 d3.tree 实现对称布局）
 */
function calculateTreeLayout(
  arr: (number | null)[],
  horizontalSpacing: number,
  verticalSpacing: number
): TreeNodePosition[] {
  const positions: TreeNodePosition[] = [];
  if (arr.length === 0) return positions;

  const root = buildTreeStructure(arr);
  if (!root) return positions;

  // 使用 d3.hierarchy 和 d3.tree 计算布局
  const hierarchy = d3.hierarchy(root);
  
  // d3.tree 的 nodeSize 设置为 [width, height]
  // nodeSize 的 x 是水平间距，y 是垂直间距（如果未旋转）
  const treeLayout = d3.tree<D3TreeNode>()
    .nodeSize([horizontalSpacing, verticalSpacing]); // x间距, y间距
    
  treeLayout(hierarchy);

  // 转换回 TreeNodePosition 格式
  hierarchy.descendants().forEach((d) => {
    positions.push({
      x: d.x!,
      y: d.y!,
      node: {
        val: d.data.val,
        index: d.data.index,
      },
    });
  });

  return positions;
}

/**
 * 获取父节点索引（使用 LeetCode 层序遍历构建的映射）
 */
function getParentIndex(index: number): number | null {
  return parentMap.get(index) ?? null;
}

/**
 * 通用树可视化模板
 * 
 * 特点：
 * 1. 使用 D3 生成平滑曲线
 * 2. 自动计算树节点位置
 * 3. 支持自定义节点和边的渲染
 * 4. 支持节点状态管理 (Unvisited, Visited, Current)
 */
export function TreeTemplate({
  data,
  renderNode,
  renderEdge,
  getNodeState,
  layout = {},
  legend,
  className = '',
  emptyMessage = '树为空',
}: TreeTemplateProps) {
  const {
    horizontalSpacing = 180,
    verticalSpacing = 140,
    nodeRadius = 30,
  } = layout;

  const svgRef = useRef<SVGSVGElement>(null);

  const positions = calculateTreeLayout(data, horizontalSpacing, verticalSpacing);
  
  // 空树处理
  if (positions.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-40 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
      >
        <div className="text-center">
          <p className="text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // 计算内容的真实边界
  const xVals = positions.map(p => p.x);
  const yVals = positions.map(p => p.y);
  
  const minX = xVals.length ? Math.min(...xVals) : 0;
  const maxX = xVals.length ? Math.max(...xVals) : 0;
  const maxY = yVals.length ? Math.max(...yVals) : 0;
  
  const paddingX = 60;
  const paddingY = 50;
  
  // 计算实际需要的内容宽高
  const contentWidth = maxX - minX + paddingX * 2;
  const contentHeight = maxY + paddingY * 2;
  
  // 设置一个合理的最小尺寸，避免过小
  const svgWidth = Math.max(320, contentWidth);
  const svgHeight = Math.max(240, contentHeight);
  
  // 计算 viewBox 的起始点，保证内容居中
  const centerX = (minX + maxX) / 2;
  const viewBoxX = centerX - svgWidth / 2;
  const viewBoxY = -paddingY; // 根节点在 y=0，上方留白
  
  // D3 曲线生成器
  const linkGenerator = d3.linkVertical<any, { x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y);

  return (
    <div className={`relative bg-slate-50/50 rounded-xl border border-slate-200 p-4 ${className}`}>
      <style>
        {`
          @keyframes dash-flow {
            from {
              stroke-dashoffset: 20;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
          .edge-flow {
            animation: dash-flow 1s linear infinite;
          }
          .node-transition {
            transition: all 0.3s ease-out;
          }
          .edge-transition {
            transition: stroke 0.3s ease-out, stroke-width 0.3s ease-out;
          }
        `}
      </style>
      <div className="flex justify-center overflow-auto">
        <svg 
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className="overflow-visible"
          viewBox={`${viewBoxX} ${viewBoxY} ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
        <defs>
          {/* 箭头定义 */}
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="18"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
          </marker>
          <marker
            id="arrow-visited"
            viewBox="0 0 10 10"
            refX="18"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="18"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
          </marker>
          
          {/* 节点阴影滤镜 */}
          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset in="blur" dx="2" dy="3" result="offsetBlur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 绘制连接线 */}
        {positions.map((pos) => {
          if (pos.node.val === null) return null;
          const parentIdx = getParentIndex(pos.node.index);
          if (parentIdx === null) return null;
          const parent = positions.find(p => p.node.index === parentIdx);
          if (!parent || parent.node.val === null) return null;
          
          const edgeKey = `${parent.node.index}-${pos.node.index}`;
          const isLeft = pos.node.index % 2 === 1;
          
          // 如果提供了自定义 renderEdge，使用它；否则使用默认渲染
          if (renderEdge) {
            return (
              <g key={`edge-${edgeKey}`}>
                {renderEdge(parent, pos, isLeft)}
              </g>
            );
          }
          
          const childState = getNodeState?.(pos.node.index, pos.node.val) || {};
          // 判断边的状态
          const isCurrent = childState.isCurrent;
          const isVisited = childState.isVisited;
          
          // 动态样式
          let strokeColor = "#cbd5e1"; // default slate-300
          let strokeWidth = "2";
          let markerEnd = "url(#arrow-default)";
          let className = "edge-transition";
          
          if (isCurrent) {
            strokeColor = "#3b82f6"; // blue-500
            strokeWidth = "3";
            markerEnd = "url(#arrow-active)";
            className += " edge-flow";
          } else if (isVisited) {
            strokeColor = "#94a3b8"; // slate-400
            markerEnd = "url(#arrow-visited)";
          }

          // 使用 d3 生成贝塞尔曲线路径
          const pathData = linkGenerator({
            source: { x: parent.x, y: parent.y + nodeRadius },
            target: { x: pos.x, y: pos.y - nodeRadius }
          }) || "";

          return (
            <g key={`edge-${edgeKey}`}>
              <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={isCurrent ? "8, 4" : "none"}
                markerEnd={markerEnd} // 注意：marker在曲线末端可能需要调整 refX
                className={className}
              />
            </g>
          );
        })}

        {/* 绘制节点 */}
        {positions.map((pos) => {
          if (pos.node.val === null) return null;
          
          const state = getNodeState?.(pos.node.index, pos.node.val) || {};
          
          return (
            <g
              key={`node-${pos.node.index}`}
              transform={`translate(${pos.x}, ${pos.y})`}
              filter="url(#node-shadow)"
              className="node-transition"
            >
              {renderNode(pos, state)}
            </g>
          );
        })}
        </svg>
      </div>
      
      {/* 图例 */}
      {legend && legend.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-4 text-sm flex-wrap">
          {legend.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {item.shape === 'badge' ? (
                <div className={`w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold`} style={{ backgroundColor: item.color }}>
                  N
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              )}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
