import { useEffect, useRef, ReactNode } from "react";
import * as d3 from "d3";
import { gsap } from "gsap";

/**
 * Trie节点状态
 */
export interface TrieNodeState {
  id: string; // 唯一标识符（路径）
  char: string; // 字符（根节点为空）
  level: number; // 层级
  isEnd: boolean; // 是否为单词结尾
  isCurrent?: boolean; // 是否为当前访问节点
  isInPath?: boolean; // 是否在搜索路径中
  isMatched?: boolean; // 是否匹配成功
  children?: string[]; // 子节点id列表
  x?: number; // 节点x坐标
  y?: number; // 节点y坐标
  customState?: Record<string, any>;
}

/**
 * Trie边状态
 */
export interface TrieEdgeState {
  from: string; // 父节点id
  to: string; // 子节点id
  char: string; // 边上的字符
  isInPath?: boolean; // 是否在当前路径中
  isHighlighted?: boolean;
}

/**
 * TrieTemplate 属性
 */
export interface TrieTemplateProps {
  // 节点数据
  nodes: TrieNodeState[];
  
  // 边数据
  edges: TrieEdgeState[];
  
  // 核心渲染函数
  renderNode: (node: TrieNodeState) => ReactNode;
  renderEdge?: (edge: TrieEdgeState, fromPos: { x: number; y: number }, toPos: { x: number; y: number }) => ReactNode;
  
  // 布局配置
  layout?: {
    nodeSize?: number; // 节点大小
    levelHeight?: number; // 层级高度
    nodeSpacing?: number; // 同层节点间距
    width?: number; // 画布宽度
    height?: number; // 画布高度
  };
  
  // 自定义渲染
  renderHeader?: () => ReactNode;
  renderFooter?: () => ReactNode;
  renderLegend?: () => ReactNode;
  
  // 样式
  className?: string;
}

/**
 * D3 Trie 节点结构
 */
interface D3TrieNode {
  id: string;
  char: string;
  isEnd: boolean;
  children: D3TrieNode[];
}

/**
 * 构建 Trie 的 D3 层次结构
 */
function buildTrieHierarchy(nodes: TrieNodeState[], edges: TrieEdgeState[]): D3TrieNode | null {
  if (nodes.length === 0) return null;
  
  const root = nodes.find(n => n.char === 'root');
  if (!root) return null;
  
  const nodeMap = new Map<string, D3TrieNode>();
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      id: node.id,
      char: node.char,
      isEnd: node.isEnd || false,
      children: [],
    });
  });
  
  edges.forEach(edge => {
    const parent = nodeMap.get(edge.from);
    const child = nodeMap.get(edge.to);
    if (parent && child) {
      parent.children.push(child);
    }
  });
  
  return nodeMap.get(root.id) || null;
}

/**
 * 计算Trie树的布局位置（使用 D3 tree 布局，参考 TreeTemplate）
 */
function calculateTrieLayout(
  nodes: TrieNodeState[],
  edges: TrieEdgeState[],
  horizontalSpacing: number,
  verticalSpacing: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  
  if (nodes.length === 0) return positions;
  
  const root = buildTrieHierarchy(nodes, edges);
  if (!root) return positions;
  
  // 使用 d3.tree 布局（与 TreeTemplate 相同的方式）
  const hierarchy = d3.hierarchy(root);
  const treeLayout = d3.tree<D3TrieNode>()
    .nodeSize([horizontalSpacing, verticalSpacing]);
    
  treeLayout(hierarchy);
  
  // 提取位置
  hierarchy.descendants().forEach(node => {
    positions.set(node.data.id, {
      x: node.x!,
      y: node.y!,
    });
  });
  
  return positions;
}

/**
 * 通用Trie树可视化模板
 */
export function TrieTemplate({
  nodes,
  edges,
  renderNode,
  renderEdge,
  layout = {},
  renderHeader,
  renderFooter,
  renderLegend,
  className = '',
}: TrieTemplateProps) {
  const {
    nodeSize = 40,
    levelHeight = 80,
    nodeSpacing = 60,
    width = 900,
    height = 600,
  } = layout;

  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // 计算节点位置
  const nodePositions = (() => {
    // 如果节点已有自定义位置，使用它们
    if (nodes.every(n => n.x !== undefined && n.y !== undefined)) {
      const positions = new Map<string, { x: number; y: number }>();
      nodes.forEach(n => positions.set(n.id, { x: n.x!, y: n.y! }));
      return positions;
    }

    // 否则计算布局（使用 D3 tree）
    const rawPositions = calculateTrieLayout(nodes, edges, nodeSpacing, levelHeight);
    
    // 计算偏移量以居中显示（参考 TreeTemplate）
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    rawPositions.forEach(pos => {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    });
    
    const treeWidth = maxX - minX;
    const offsetX = (width - treeWidth) / 2 - minX;
    const offsetY = 60; // 顶部边距
    
    // 应用偏移
    const centeredPositions = new Map<string, { x: number; y: number }>();
    rawPositions.forEach((pos, id) => {
      centeredPositions.set(id, {
        x: pos.x + offsetX,
        y: pos.y - minY + offsetY,
      });
    });
    
    return centeredPositions;
  })();

  // 使用 gsap 做位置和状态动画（D3 计算 + gsap 渲染）
  useEffect(() => {
    nodeRefs.current.forEach((element, id) => {
      const node = nodes.find(n => n.id === id);
      const pos = nodePositions.get(id);
      if (!element || !node || !pos) return;

      // 1. 位置动画（平滑过渡到新位置）
      gsap.to(element, {
        left: pos.x - nodeSize / 2,
        top: pos.y - nodeSize / 2,
        duration: 0.5,
        ease: "power2.out",
      });

      // 2. 状态动画（颜色、缩放等由 renderNode 中的 className 控制）
      // gsap 主要用于位置的平滑过渡
    });
  }, [nodes, nodePositions, nodeSize]);

  return (
    <div className={`trie-template ${className}`}>
      {renderHeader && renderHeader()}

      <div className="relative bg-white rounded-lg border border-gray-200 p-4" style={{ minHeight: height }}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {/* 渲染边 */}
          {edges.map((edge, idx) => {
            const fromPos = nodePositions.get(edge.from);
            const toPos = nodePositions.get(edge.to);
            
            if (!fromPos || !toPos) return null;

            // 计算边的起点和终点（紧贴节点边缘）
            // 起点：从源节点底部边缘出发
            // 终点：紧贴目标节点顶部边缘
            const radius = nodeSize / 2;
            
            // 对于垂直对齐的节点（x坐标差异很小），强制使用相同的x坐标
            const dx = Math.abs(toPos.x - fromPos.x);
            const isVertical = dx < 5; // 容差5px
            const centerX = isVertical ? (fromPos.x + toPos.x) / 2 : fromPos.x;
            
            const startX = isVertical ? centerX : fromPos.x;
            const startY = fromPos.y + radius - 1;  // 底部边缘，稍微往内1px
            const endX = isVertical ? centerX : toPos.x;
            const endY = toPos.y - radius + 2;      // 顶部边缘，Trie无箭头，直接贴边

            const strokeColor = edge.isInPath
              ? '#34D399'
              : '#D1D5DB';
            
            const strokeWidth = 2; // 固定线宽，保持简洁
            const opacity = edge.isInPath ? 0.9 : 0.6;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                {/* 边上显示字符 */}
                <text
                  x={(startX + endX) / 2 + 10}
                  y={(startY + endY) / 2 - 5}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight={edge.isInPath ? "bold" : "normal"}
                  fill={edge.isInPath ? '#34D399' : '#9CA3AF'}
                  opacity={edge.isInPath ? 1 : 0.7}
                  className="transition-all duration-300"
                >
                  {edge.char}
                </text>
                {renderEdge && renderEdge(edge, fromPos, toPos)}
              </g>
            );
          })}
        </svg>

        {/* 渲染节点 */}
        <div className="relative" style={{ width, height, zIndex: 1 }}>
          {nodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            return (
              <div
                key={node.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(node.id, el);
                }}
                className="absolute"
                style={{
                  left: pos.x - nodeSize / 2,
                  top: pos.y - nodeSize / 2,
                  width: nodeSize,
                  height: nodeSize,
                }}
              >
                {renderNode(node)}
              </div>
            );
          })}
        </div>
      </div>

      {renderLegend && renderLegend()}
      {renderFooter && renderFooter()}
    </div>
  );
}
