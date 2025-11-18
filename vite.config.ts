import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
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
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // 状态管理
          'vendor-store': ['zustand'],
          
          // 动画库
          'vendor-animation': ['framer-motion', 'gsap'],
          
          // 图形可视化库（预留，未来使用）
          'vendor-visualization': ['d3', 'cytoscape', 'vis-network', 'vis-data'],
          
          // 图标库（轻量）
          'vendor-icons': ['lucide-react'],
          
          // 代码高亮库（较大，单独分包）
          'vendor-highlighter': ['react-syntax-highlighter'],
        },
      },
    },
    // 调整 chunk 大小警告限制
    chunkSizeWarningLimit: 650,
  },
});
