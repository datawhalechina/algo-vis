import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { parseMathSegments } from "@/utils/mathSegments";

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * 渲染包含行内数学公式的文本。
 * 用 $...$ 包裹的部分会通过 KaTeX 渲染，其余为普通文本。
 *
 * 示例：
 *   "注意力公式为 $\text{softmax}(QK^T/\sqrt{d_k})V$，其中 $d_k$ 为维度"
 */
export function MathText({ text, className }: MathTextProps) {
  const segments = parseMathSegments(text);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "inline-math") {
          return (
            <InlineMath
              key={`${segment.type}-${index}`}
              math={segment.value}
              renderError={() => (
                <code className="text-red-700 bg-red-50">{segment.value}</code>
              )}
            />
          );
        }

        if (segment.type === "block-math") {
          return (
            <span
              key={`${segment.type}-${index}`}
              className="block max-w-full overflow-x-auto py-2 text-center"
            >
              <BlockMath
                math={segment.value}
                renderError={() => (
                  <code className="text-red-700 bg-red-50">{segment.value}</code>
                )}
              />
            </span>
          );
        }

        return <span key={`${segment.type}-${index}`}>{segment.value}</span>;
      })}
    </span>
  );
}
