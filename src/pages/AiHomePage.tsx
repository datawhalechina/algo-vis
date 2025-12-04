import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { aiProblems } from "@/dataai/data";
import { AIDomain, aiDomainNames } from "@/types/ai";
import { Filter } from "lucide-react";
import { AiGroupCard } from "@/components/AiGroupCard";
import { useAppStore } from "@/store/useAppStore";
import { useScrollRestore } from "@/hooks/useScrollRestore";

// 定义分类组别
const domainGroups = {
  应用领域: [
    AIDomain.VISION,
    AIDomain.NLP,
    AIDomain.LLM,
    AIDomain.SPEECH,
    AIDomain.MULTIMODAL,
  ],
  模型架构: [
    AIDomain.CNN,
    AIDomain.RNN,
    AIDomain.TRANSFORMER,
    AIDomain.GRAPH_NEURAL_NETWORK,
  ],
  生成模型: [
    AIDomain.DIFFUSION,
    AIDomain.GAN,
    AIDomain.VAE,
  ],
  学习范式: [
    AIDomain.REINFORCEMENT_LEARNING,
    AIDomain.SELF_SUPERVISED,
    AIDomain.TRANSFER_LEARNING,
    AIDomain.CONTINUAL_LEARNING,
    AIDomain.META_LEARNING,
    AIDomain.FEDERATED_LEARNING,
  ],
  研究方向: [
    AIDomain.EXPLAINABLE_AI,
    AIDomain.NEURAL_RENDERING,
    AIDomain.NEURAL_ARCHITECTURE_SEARCH,
  ],
};

function AiHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDomain, setSelectedDomain] = useState<AIDomain | "all">(
    (searchParams.get('domain') as AIDomain) || "all"
  );

  const { getProgressStats } = useAppStore();
  const aiStats = useMemo(() => {
    const domains = new Set(aiProblems.map((p) => p.domain)).size;
    const tags = new Set(aiProblems.flatMap((p) => p.tags)).size;
    return {
      total: aiProblems.length,
      domains,
      tags,
    };
  }, []);

  const progressStats = getProgressStats(aiProblems.length);

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams, { replace: true });
  };

  // 使用 Zustand store 管理滚动位置
  useScrollRestore("/ai");

  const grouped = useMemo(() => {
    const map = new Map<AIDomain, typeof aiProblems>();
    
    // 初始化所有域
    Object.values(AIDomain).forEach((domain) => {
      map.set(domain as AIDomain, []);
    });

    // 按选中的域过滤并分组
    aiProblems.forEach((problem) => {
      if (selectedDomain === 'all' || selectedDomain === problem.domain) {
        if (!map.has(problem.domain)) {
          map.set(problem.domain, []);
        }
        map.get(problem.domain)!.push(problem);
      }
    });

    return Array.from(map.entries()).filter(([, items]) => items.length > 0);
  }, [selectedDomain]);

  // 按分类组别组织数据
  const groupedByCategory = useMemo(() => {
    const result: Array<{ category: string; domains: Array<[AIDomain, typeof aiProblems]> }> = [];
    
    Object.entries(domainGroups).forEach(([category, domains]) => {
      const categoryDomains = grouped.filter(([domain]) => domains.includes(domain));
      if (categoryDomains.length > 0) {
        result.push({
          category,
          domains: categoryDomains,
        });
      }
    });
    
    return result;
  }, [grouped]);

  const availableDomains = useMemo(() => {
    const domains = new Set(aiProblems.map((p) => p.domain));
    return Array.from(domains);
  }, []);

  const domainStats = useMemo(() => {
    const stats: Record<string, number> = {};
    aiProblems.forEach((p) => {
      stats[p.domain] = (stats[p.domain] || 0) + 1;
    });
    return stats;
  }, []);

  // 获取域所属的分类组别
  const getDomainCategory = (domain: AIDomain): string | null => {
    for (const [category, domains] of Object.entries(domainGroups)) {
      if (domains.includes(domain)) {
        return category;
      }
    }
    return null;
  };

  // 按分类组别组织筛选按钮
  const domainsByCategory = useMemo(() => {
    const result: Record<string, AIDomain[]> = {};
    availableDomains.forEach((domain) => {
      const category = getDomainCategory(domain);
      if (category) {
        if (!result[category]) {
          result[category] = [];
        }
        result[category].push(domain);
      }
    });
    return result;
  }, [availableDomains]);

  return (
    <div className="w-full px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI 算法可视化题库
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          通过动画和图解深入理解 AI 模型原理，让抽象的算法变得直观易懂
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {aiStats.total}
          </div>
          <div className="text-gray-600">题目总数</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {progressStats.completed}
          </div>
          <div className="text-gray-600">已完成</div>
          {aiStats.total > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {progressStats.completionRate}%
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {progressStats.favorite}
          </div>
          <div className="text-gray-600">已收藏</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">题目筛选</h2>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700 mb-2">算法类型</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedDomain("all");
                updateSearchParams('domain', 'all');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedDomain === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              全部 ({aiProblems.length})
            </button>
          </div>
          
          {/* 按分类组别显示筛选按钮 */}
          {Object.entries(domainsByCategory).map(([category, domains]) => (
            <div key={category} className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {category}
              </div>
              <div className="flex flex-wrap gap-2">
                {domains.map((domain) => (
                  <button
                    key={domain}
                    onClick={() => {
                      setSelectedDomain(domain);
                      updateSearchParams('domain', domain);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedDomain === domain
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {aiDomainNames[domain]} ({domainStats[domain] || 0})
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            算法类型分类
          </h2>
          <span className="text-sm text-gray-600">
            {grouped.length} 个分组
          </span>
        </div>
        
        {grouped.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-12 text-center text-gray-500">
            没有找到符合条件的题目
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByCategory.map(({ category, domains }) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <h3 className="text-lg font-semibold text-gray-700 px-3">
                    {category}
                  </h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {domains
                    .sort((a, b) => b[1].length - a[1].length)
                    .map(([domain, domainProblems]) => (
                      <AiGroupCard
                        key={domain}
                        title={aiDomainNames[domain]}
                        count={domainProblems.length}
                        problems={domainProblems}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 使用提示
        </h3>
        <ul className="text-blue-800 space-y-1 list-disc list-inside">
          <li>点击题目进入可视化页面</li>
          <li>使用播放/暂停按钮控制动画</li>
          <li>可以单步执行来仔细观察每一步的变化</li>
          <li>代码高亮会同步显示当前执行的代码行</li>
        </ul>
      </div>
    </div>
  );
}

export default AiHomePage;

