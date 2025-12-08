import { Link } from "react-router-dom";
import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { books } from "@/dataconcepts/data";
import { conceptCategoryNames } from "@/types/concepts";
import { useScrollRestore } from "@/hooks/useScrollRestore";

function ConceptsHomePage() {
  // 使用 Zustand store 管理滚动位置
  useScrollRestore("/concepts");

  const stats = useMemo(() => {
    const totalConcepts = books.reduce((sum, book) => sum + book.conceptCount, 0);
    const categories = new Set(books.flatMap((b) => b.category)).size;
    return {
      totalBooks: books.length,
      totalConcepts,
      categories,
    };
  }, []);

  return (
    <div className="w-full px-4 md:px-10 lg:px-24 xl:px-32 2xl:px-40">
      {/* 标题部分 */}
      <div className="mb-8 pt-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          计算机术语/概念可视化
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          通过可视化方式深入理解计算机科学核心概念，系统学习数据结构、算法、操作系统等基础知识
        </p>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalBooks}
          </div>
          <div className="text-gray-600">书籍总数</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-cyan-600 mb-2">
            {stats.totalConcepts}
          </div>
          <div className="text-gray-600">概念总数</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-sky-600 mb-2">
            {stats.categories}
          </div>
          <div className="text-gray-600">知识分类</div>
        </div>
      </div>

      {/* 书架列表 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            知识书架
          </h2>
          <span className="text-sm text-gray-600">
            {books.length} 本书籍
          </span>
        </div>
        
        {books.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-12 text-center text-gray-500">
            暂无书籍
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/concepts/book/${book.slug}`}
                className="group bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-300"
              >
                <div className="mb-4">
                  <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <BookOpen className="w-12 h-12 text-blue-600 opacity-60" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                    {book.title}
                  </h3>
                  {book.subtitle && (
                    <p className="text-sm text-gray-600 mb-2">
                      {book.subtitle}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {book.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {book.category.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
                      >
                        {conceptCategoryNames[cat]}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {book.conceptCount} 个概念
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 使用提示
        </h3>
        <ul className="text-blue-800 space-y-1 list-disc list-inside">
          <li>点击书籍进入概念列表页面</li>
          <li>每个概念都配有详细的可视化演示</li>
          <li>可以按分类浏览相关书籍</li>
          <li>概念之间有关联关系，便于系统学习</li>
        </ul>
      </div>
    </div>
  );
}

export default ConceptsHomePage;

