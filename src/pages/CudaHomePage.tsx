import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cudaProblems } from "@/datacuda/data";
import { CudaCategory, cudaCategoryNames } from "@/types/cuda";
import { Filter } from "lucide-react";
import { CudaGroupCard } from "@/components/CudaGroupCard";
import { useScrollRestore } from "@/hooks/useScrollRestore";

function CudaHomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<CudaCategory | "all">(
        (searchParams.get('category') as CudaCategory) || "all"
    );

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
    useScrollRestore("/cuda");

    // 统计数据
    const stats = useMemo(() => {
        const categories = new Set(cudaProblems.map((p) => p.category)).size;
        const tags = new Set(cudaProblems.flatMap((p) => p.tags)).size;
        return {
            total: cudaProblems.length,
            categories,
            tags,
        };
    }, []);

    // 按分类分组
    const groupedProblems = useMemo(() => {
        const map = new Map<CudaCategory, typeof cudaProblems>();

        // 初始化所有分类
        Object.values(CudaCategory).forEach((category) => {
            map.set(category as CudaCategory, []);
        });

        // 分组
        cudaProblems.forEach((problem) => {
            if (selectedCategory === 'all' || selectedCategory === problem.category) {
                if (!map.has(problem.category)) {
                    map.set(problem.category, []);
                }
                map.get(problem.category)!.push(problem);
            }
        });

        return Array.from(map.entries())
            .filter(([, items]) => items.length > 0)
            // 保持原有顺序
            .sort((a, b) => {
                const order = Object.values(CudaCategory);
                return order.indexOf(a[0]) - order.indexOf(b[0]);
            });
    }, [selectedCategory]);

    const categoryStats = useMemo(() => {
        const stats: Record<string, number> = {};
        cudaProblems.forEach((p) => {
            stats[p.category] = (stats[p.category] || 0) + 1;
        });
        return stats;
    }, []);

    return (
        <div className="w-full px-4 md:px-10 lg:px-24 xl:px-32 2xl:px-40">
            <div className="mb-8 pt-12 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    CUDA 算子开发与优化
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    深入理解 GPU 架构，掌握高性能算子开发与优化技巧
                </p>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                        {stats.total}
                    </div>
                    <div className="text-gray-600">核心算子</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                        {stats.categories}
                    </div>
                    <div className="text-gray-600">算子分类</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        {stats.tags}
                    </div>
                    <div className="text-gray-600">技术标签</div>
                </div>
            </div>

            {/* 筛选区域 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">算子筛选</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setSelectedCategory("all");
                            updateSearchParams('category', 'all');
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === "all"
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        全部 ({cudaProblems.length})
                    </button>
                    {Object.values(CudaCategory).map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                updateSearchParams('category', category);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === category
                                    ? "bg-primary-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {cudaCategoryNames[category]} ({categoryStats[category] || 0})
                        </button>
                    ))}
                </div>
            </div>

            {/* 内容列表 */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        算子分类概览
                    </h2>
                    <span className="text-sm text-gray-600">
                        {groupedProblems.length} 个分类
                    </span>
                </div>

                {groupedProblems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-12 text-center text-gray-500">
                        没有找到符合条件的算子
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {groupedProblems.map(([category, problems]) => (
                            <CudaGroupCard
                                key={category}
                                title={cudaCategoryNames[category]}
                                count={problems.length}
                                problems={problems}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    💡 学习路线建议
                </h3>
                <ul className="text-blue-800 space-y-1 list-disc list-inside">
                    <li>建议从 <strong>逐元素操作</strong> 开始，熟悉 Grid-Block-Thread 映射关系</li>
                    <li>接着学习 <strong>规约操作</strong>，掌握 Shared Memory 和 Bank Conflict 优化</li>
                    <li>深入 <strong>矩阵乘法</strong>，理解 Tiling 和 Tensor Core 的使用</li>
                    <li>最后挑战 <strong>扫描与排序</strong> 等高阶算法，掌握 Block 间同步技巧</li>
                </ul>
            </div>
        </div>
    );
}

export default CudaHomePage;
