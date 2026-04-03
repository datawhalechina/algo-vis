import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * 渲染包含行内数学公式的文本。
 * 用 $...$ 包裹的部分会通过 KaTeX 渲染，其余为普通文本。
 *
 * 示例：
 *   "注意力公式为 $\text{softmax}(QK^T/\sqrt{d_k})V$，其中 $d_k$ 为维度"
 */
export function MathText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
