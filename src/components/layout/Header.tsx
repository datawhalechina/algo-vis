import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Code2, Github } from "lucide-react";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "首页" },
    { path: "/problems", label: "题目总览" },
    { path: "/ai", label: "AI 题解" },
  ];

  const isTopLevel = navItems.some((item) => item.path === location.pathname);
  const showBackButton = !isTopLevel;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                <ArrowLeft size={16} />
                返回
              </button>
            )}

            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold text-primary-600 hover:text-primary-700 transition"
            >
              <Code2 size={32} />
              <span>LeetCode 可视化</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2 ml-6">
              {navItems.map((item) => {
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      isActive
                        ? "bg-primary-50 text-primary-700 border border-primary-100 shadow-inner"
                        : "text-gray-600 hover:text-primary-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <a
            href="https://github.com/Hoshino-wind/leetcode-view"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition font-medium"
          >
            <Github size={20} />
            <span>GitHub</span>
          </a>
        </div>

        <nav className="mt-4 flex md:hidden gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 min-w-[110px] text-center px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive
                    ? "bg-primary-50 text-primary-700 border border-primary-100 shadow-inner"
                    : "text-gray-600 bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default Header;

