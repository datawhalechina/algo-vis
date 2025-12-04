import { Heart } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-gray-600">
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart size={16} className="text-red-500 fill-red-500" />
            <span>for curious problem solvers</span>
          </div>
          <p className="text-sm">
            © 2025 算法可视化实验室 · 帮助你更好的学习与理解算法
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

