import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // 如果部署到 GitHub Pages 且仓库名不是 username.github.io，需要设置 base
  // 例如：base: '/leetcode-view/'
  // 可以通过环境变量 VITE_BASE_PATH 设置，或在 GitHub Actions 中自动设置
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // 状态管理
          "vendor-store": ["zustand"],

          // 动画库
          "vendor-animation": ["framer-motion", "gsap"],

          // 图形可视化库（预留，未来使用）
          "vendor-visualization": [
            "d3",
            "cytoscape",
            "vis-network",
            "vis-data",
          ],

          // 图标库（轻量）
          "vendor-icons": ["lucide-react"],

          // 代码高亮库（较大，单独分包）
          "vendor-highlighter": ["react-syntax-highlighter"],
        },
      },
    },
    // 调整 chunk 大小警告限制
    chunkSizeWarningLimit: 650,
  },
});
