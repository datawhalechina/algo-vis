import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Bot, ListChecks } from "lucide-react";
import { problems } from "@/data";
import { aiProblems } from "@/problemAI/data";
import { useAppStore } from "@/store/useAppStore";

function HomePage() {
  const { getProgressStats } = useAppStore();
  const progressStats = getProgressStats(problems.length);

  const aiStats = useMemo(() => {
    const domains = new Set(aiProblems.map((p) => p.domain)).size;
    const tags = new Set(aiProblems.flatMap((p) => p.tags)).size;
    return {
      total: aiProblems.length,
      domains,
      tags,
    };
  }, []);

  return (
    <div className="w-full px-4">
      <section className="text-center py-12 space-y-4">
        <p className="text-primary-600 font-semibold tracking-wide">
          一套界面，两条学习路径
        </p>
        <h1 className="text-4xl font-bold text-gray-900">
          LeetCode 热题 100 & AI 模型可视化
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          题目解法、动画演示、注意力权重在同一平台集中呈现。选择经典算法题列表，或跳转到 AI
          模块查看视觉/语音等方向的模型推理过程。
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Link
          to="/problems"
          className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600">
              <ListChecks className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-primary-500 font-semibold">
                热题 100
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                题目列表 + 解题动画
              </h2>
              <p className="text-gray-600">
                按题型/解法自动分组，支持进度统计、收藏管理和可视化播放控制。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {progressStats.total}
                </p>
                <p className="text-xs text-gray-500">题目总数</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {progressStats.completed}
                </p>
                <p className="text-xs text-gray-500">已完成</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-500">
                  {progressStats.favorite}
                </p>
                <p className="text-xs text-gray-500">收藏</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-gray-500">点击进入题目分组列表</span>
              <span className="text-primary-600 font-semibold">立即进入 →</span>
            </div>
          </div>
        </Link>

        <Link
          to="/ai"
          className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/70 to-transparent opacity-0 group-hover:opacity-100 transition pointer-events-none" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-emerald-500 font-semibold">
                AI 模块
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                模型推理过程可视化
              </h2>
              <p className="text-gray-600">
                视觉 / 语音 / NLP 等方向，统一采用题目列表式布局，展示注意力、概率等内部状态。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {aiStats.total}
                </p>
                <p className="text-xs text-gray-500">可视化案例</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {aiStats.domains}
                </p>
                <p className="text-xs text-gray-500">模型方向</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {aiStats.tags}
                </p>
                <p className="text-xs text-gray-500">重点标签</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-gray-500">进入后按方向浏览 AI 题目</span>
              <span className="text-emerald-600 font-semibold">去探索 →</span>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}

export default HomePage;


