import { useParams, Link, useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { Filter, ArrowLeft, BookOpen } from "lucide-react";
import { getBookBySlug, getConceptsByBookId, conceptCategoryNames } from "@/dataconcepts/data";
import { ConceptCategory } from "@/types/concepts";
import { Difficulty } from "@/types";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import { Tooltip } from "antd";

function ConceptListPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState<ConceptCategory | "all">(
    (searchParams.get('category') as ConceptCategory) || "all"
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">(
    (searchParams.get('difficulty') as Difficulty) || "all"
  );

  const book = useMemo(() => {
    return slug ? getBookBySlug(slug) : undefined;
  }, [slug]);

  const bookConcepts = useMemo(() => {
    if (!book) return [];
    return getConceptsByBookId(book.id);
  }, [book]);

  const filteredConcepts = useMemo(() => {
    return bookConcepts.filter((concept) => {
      const categoryMatch = selectedCategory === "all" || concept.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === "all" || concept.difficulty === selectedDifficulty;
      return categoryMatch && difficultyMatch;
    });
  }, [bookConcepts, selectedCategory, selectedDifficulty]);

  // 按分类分组
  const groupedConcepts = useMemo(() => {
    const groups = new Map<ConceptCategory, typeof bookConcepts>();
    
    filteredConcepts.forEach((concept) => {
      if (!groups.has(concept.category)) {
        groups.set(concept.category, []);
      }
      groups.get(concept.category)!.push(concept);
    });

    return groups;
  }, [filteredConcepts]);

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
  useScrollRestore(`/concepts/book/${slug}`);

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return "text-green-600 bg-green-50 border-green-200";
      case Difficulty.MEDIUM:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case Difficulty.HARD:
        return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const getDifficultyText = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return "简单";
      case Difficulty.MEDIUM:
        return "中等";
      case Difficulty.HARD:
        return "困难";
    }
  };

  const availableCategories = useMemo(() => {
    return Array.from(new Set(bookConcepts.map((c) => c.category)));
  }, [bookConcepts]);

  if (!book) {
    return (
      <div className="w-full px-4 md:px-10 lg:px-24 xl:px-32 2xl:px-40">
        <div className="pt-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">书籍不存在</h1>
          <Link to="/concepts" className="text-blue-600 hover:text-blue-700">
            返回书架
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      {/* 返回按钮和书籍信息 */}
      <div className="mb-8 pt-12">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
            <Link
              to="/concepts"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition font-medium"
            >
              <ArrowLeft size={20} />
              <span>返回书架</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                书架详情
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {bookConcepts.length} 个概念
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                {availableCategories.length} 个分类
              </span>
            </div>
          </div>

          <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-lg text-gray-700 mb-3">{book.subtitle}</p>
                )}
                <p className="text-gray-700 mb-4">{book.description}</p>
                <div className="flex flex-wrap gap-2">
                  {book.category.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md font-medium"
                    >
                      {conceptCategoryNames[cat]}
                    </span>
                  ))}
                  {book.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-white/80 text-gray-700 rounded-md border border-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {bookConcepts.length}
          </div>
          <div className="text-gray-600">概念总数</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {availableCategories.length}
          </div>
          <div className="text-gray-600">分类数量</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-cyan-600 mb-2">
            {filteredConcepts.length}
          </div>
          <div className="text-gray-600">当前筛选</div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">概念筛选</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">分类</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  updateSearchParams('category', 'all');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                全部 ({bookConcepts.length})
              </button>
              {availableCategories.map((cat) => {
                const count = bookConcepts.filter((c) => c.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      updateSearchParams('category', cat);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {conceptCategoryNames[cat]} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">难度</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedDifficulty("all");
                  updateSearchParams('difficulty', 'all');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedDifficulty === "all"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                全部
              </button>
              <button
                onClick={() => {
                  setSelectedDifficulty(Difficulty.EASY);
                  updateSearchParams('difficulty', Difficulty.EASY);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedDifficulty === Difficulty.EASY
                    ? "bg-green-600 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                简单 ({bookConcepts.filter(c => c.difficulty === Difficulty.EASY).length})
              </button>
              <button
                onClick={() => {
                  setSelectedDifficulty(Difficulty.MEDIUM);
                  updateSearchParams('difficulty', Difficulty.MEDIUM);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedDifficulty === Difficulty.MEDIUM
                    ? "bg-yellow-600 text-white"
                    : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                }`}
              >
                中等 ({bookConcepts.filter(c => c.difficulty === Difficulty.MEDIUM).length})
              </button>
              <button
                onClick={() => {
                  setSelectedDifficulty(Difficulty.HARD);
                  updateSearchParams('difficulty', Difficulty.HARD);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedDifficulty === Difficulty.HARD
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                困难 ({bookConcepts.filter(c => c.difficulty === Difficulty.HARD).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 概念列表 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            概念列表
          </h2>
          <span className="text-sm text-gray-600">
            {groupedConcepts.size} 个分类
          </span>
        </div>
        
        {groupedConcepts.size === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-12 text-center text-gray-500">
            {bookConcepts.length === 0 ? "该书籍暂无概念" : "没有找到符合筛选条件的概念"}
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(groupedConcepts.entries())
              .sort((a, b) => b[1].length - a[1].length)
              .map(([category, categoryConcepts]) => (
                <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {conceptCategoryNames[category]}
                      </h3>
                      <span className="px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded-full border border-blue-200">
                        {categoryConcepts.length} 个概念
                      </span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {categoryConcepts.map((concept) => (
                      <Link
                        key={concept.id}
                        to={`/concepts/${concept.id}`}
                        className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-base font-medium text-gray-900">
                                {concept.title}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(concept.difficulty)}`}>
                                {getDifficultyText(concept.difficulty)}
                              </span>
                            </div>
                            <Tooltip title={concept.description} placement="top">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {concept.description}
                              </p>
                            </Tooltip>
                            {concept.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {concept.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
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
          <li>点击概念进入详细页面查看可视化演示</li>
          <li>每个概念都配有详细的解释和示例</li>
          <li>可以按分类和难度筛选概念</li>
          <li>概念之间有关联关系，便于系统学习</li>
        </ul>
      </div>
    </div>
  );
}

export default ConceptListPage;

