import { useEffect, useRef, ReactNode } from "react";
import { gsap } from "gsap";
import dagre from "dagre";

/**
 * 图节点状态
 */
export interface GraphNodeState {
  id: number;
  label?: string;
  value?: number | string;
  x?: number; // 节点x坐标（用于自定义布局）
  y?: number; // 节点y坐标
  isCurrent?: boolean;
  isVisited?: boolean;
  isInQueue?: boolean;
  isProcessed?: boolean;
  inDegree?: number;
  customState?: Record<string, any>;
}

/**
 * 图边状态
 */
export interface GraphEdgeState {
  from: number;
  to: number;
  weight?: number;
  label?: string;
  isCurrent?: boolean;
  isVisited?: boolean;
  isHighlighted?: boolean;
  customState?: Record<string, any>;
}

/**
 * GraphTemplate 属性
 */
export interface GraphTemplateProps {
  // 节点数据
  nodes: GraphNodeState[];
  
  // 边数据（邻接表或边列表）
  edges: GraphEdgeState[];
  
  // 核心渲染函数
  renderNode: (node: GraphNodeState) => ReactNode;
  renderEdge?: (edge: GraphEdgeState) => ReactNode;
  
  // 布局配置
  layout?: {
    type?: 'circle' | 'grid' | 'hierarchical' | 'custom'; // 布局类型
    nodeSize?: number; // 节点大小
    nodeSpacing?: number; // 节点间距
    width?: number; // 画布宽度
    height?: number; // 画布高度
  };
  
  // 方向
  directed?: boolean; // 是否为有向图
  
  // 自定义渲染
  renderHeader?: () => ReactNode;
  renderFooter?: () => ReactNode;
  renderLegend?: () => ReactNode;
  
  // 样式
  className?: string;
}

/**
 * 计算圆形布局的节点位置
 */
function calculateCircleLayout(
  nodeCount: number,
  width: number,
  height: number,
  nodeSize: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - nodeSize - 50;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  return positions;
}

/**
 * 计算网格布局的节点位置
 */
function calculateGridLayout(
  nodeCount: number,
  width: number,
  height: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const cols = Math.ceil(Math.sqrt(nodeCount));
  const rows = Math.ceil(nodeCount / cols);
  
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  for (let i = 0; i < nodeCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.push({
      x: col * cellWidth + cellWidth / 2,
      y: row * cellHeight + cellHeight / 2,
    });
  }

  return positions;
}

/**
 * 计算层次布局的节点位置（使用 dagre 算法）
 * dagre 专门用于有向图的层次布局，比手动实现的效果更好
 */
function calculateHierarchicalLayout(
  nodes: GraphNodeState[],
  edges: GraphEdgeState[],
  width: number,
  height: number
): { x: number; y: number }[] {
  // 创建 dagre 图
  const g = new dagre.graphlib.Graph();
  
  // 设置图的属性（优化后的参数）
  g.setGraph({
    rankdir: 'TB', // Top to Bottom
    align: 'UL', // 左上对齐
    nodesep: 100, // 同层节点间距
    edgesep: 50, // 边间距
    ranksep: 120, // 层级间距（适中）
    marginx: 40,
    marginy: 40,
    ranker: 'network-simplex', // 网络单纯形算法
  });
  
  // 设置默认边属性
  g.setDefaultEdgeLabel(() => ({}));
  
  // 添加节点
  nodes.forEach((node) => {
    g.setNode(node.id.toString(), {
      label: node.label || node.id.toString(),
      width: 50,
      height: 50,
    });
  });
  
  // 添加边
  edges.forEach((edge) => {
    g.setEdge(edge.from.toString(), edge.to.toString());
  });
  
  // 执行布局
  dagre.layout(g);
  
  // 提取位置并缩放到指定尺寸
  const positions: { x: number; y: number }[] = [];
  const graphWidth = g.graph().width || width;
  const graphHeight = g.graph().height || height;
  
  // 计算缩放比例（留出边距）
  const scaleX = (width - 100) / graphWidth;
  const scaleY = (height - 100) / graphHeight;
  const scale = Math.min(scaleX, scaleY, 1); // 不放大，只缩小
  
  nodes.forEach((node, index) => {
    const dagreNode = g.node(node.id.toString());
    if (dagreNode) {
      // 应用缩放并居中
      positions[index] = {
        x: dagreNode.x * scale + (width - graphWidth * scale) / 2,
        y: dagreNode.y * scale + (height - graphHeight * scale) / 2,
      };
    } else {
      // 降级：如果 dagre 没有计算出位置，使用简单布局
      positions[index] = {
        x: width / 2,
        y: (index + 1) * (height / (nodes.length + 1)),
      };
    }
  });
  
  return positions;
}

/**
 * 通用图可视化模板
 */
export function GraphTemplate({
  nodes,
  edges,
  renderNode,
  renderEdge,
  layout = {},
  directed = true,
  renderHeader,
  renderFooter,
  renderLegend,
  className = '',
}: GraphTemplateProps) {
  const {
    type = 'circle',
    nodeSize = 40,
    width = 800,
    height = 600,
  } = layout;

  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // 计算节点位置
  const nodePositions = (() => {
    // 如果节点已有自定义位置，使用它们
    if (nodes.every(n => n.x !== undefined && n.y !== undefined)) {
      return nodes.map(n => ({ x: n.x!, y: n.y! }));
    }

    // 否则根据布局类型计算
    switch (type) {
      case 'grid':
        return calculateGridLayout(nodes.length, width, height);
      case 'hierarchical':
        return calculateHierarchicalLayout(nodes, edges, width, height);
      case 'circle':
      default:
        return calculateCircleLayout(nodes.length, width, height, nodeSize);
    }
  })();

  // 节点动画（D3/dagre 计算 + gsap 渲染）
  useEffect(() => {
    nodeRefs.current.forEach((element, id) => {
      const node = nodes.find(n => n.id === id);
      const pos = nodePositions[id];
      if (!element || !node || !pos) return;

      // 1. 位置动画（平滑过渡）
      gsap.to(element, {
        left: pos.x - nodeSize / 2,
        top: pos.y - nodeSize / 2,
        duration: 0.5,
        ease: "power2.out",
      });

      // 2. 状态动画（缩放 - 仅用于当前节点高亮）
      if (node.isCurrent) {
        gsap.to(element, {
          scale: 1.1,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(element, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    });
  }, [nodes, nodePositions, nodeSize]);

  return (
    <div className={`graph-template ${className}`}>
      {renderHeader && renderHeader()}

      <div className="relative bg-white rounded-lg border border-gray-200 p-4">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {/* 渲染边 */}
          <defs>
            {/* 简洁的箭头标记 */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
            >
              <polygon points="0 0, 10 5, 0 10" fill="#D1D5DB" />
            </marker>
            <marker
              id="arrowhead-current"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
            >
              <polygon points="0 0, 10 5, 0 10" fill="#FBBF24" />
            </marker>
            <marker
              id="arrowhead-visited"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
            >
              <polygon points="0 0, 10 5, 0 10" fill="#34D399" />
            </marker>
          </defs>

          {edges.map((edge, idx) => {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            
            if (!fromPos || !toPos) return null;

            // 计算边的起点和终点（紧贴节点边缘）
            // 起点：从源节点底部边缘出发
            // 终点：紧贴目标节点顶部边缘（箭头头部会覆盖在节点上）
            const radius = nodeSize / 2;
            
            const startX = fromPos.x;
            const startY = fromPos.y + radius - 1;  // 底部边缘，稍微往内1px
            const endX = toPos.x;
            const endY = toPos.y - radius + 9;      // 顶部边缘，箭头头部长度约9px，让箭头紧贴

            const strokeColor = edge.isCurrent
              ? '#FBBF24'
              : edge.isVisited
              ? '#34D399'
              : '#D1D5DB';
            
            const strokeWidth = 2; // 固定线宽，不随状态变化
            const opacity = edge.isCurrent ? 1 : edge.isVisited ? 0.8 : 0.6;
            
            const markerEnd = directed
              ? edge.isCurrent
                ? 'url(#arrowhead-current)'
                : edge.isVisited
                ? 'url(#arrowhead-visited)'
                : 'url(#arrowhead)'
              : undefined;

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
                  markerEnd={markerEnd}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                {edge.label && (
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 - 5}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6B7280"
                  >
                    {edge.label}
                  </text>
                )}
                {renderEdge && renderEdge(edge)}
              </g>
            );
          })}
        </svg>

        {/* 渲染节点 */}
        <div className="relative" style={{ width, height, zIndex: 1 }}>
          {nodes.map((node, idx) => {
            const pos = nodePositions[idx];
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
