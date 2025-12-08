import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/ScrollToTop'
import './App.css'

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'))
const ProblemListPage = lazy(() => import('./pages/ProblemListPage'))
const ProblemPage = lazy(() => import('./pages/ProblemPage'))
const AiHomePage = lazy(() => import('./pages/AiHomePage'))
const AiProblemPage = lazy(() => import('./pages/AiProblemPage'))
const CudaHomePage = lazy(() => import('./pages/CudaHomePage'))
const CudaProblemPage = lazy(() => import('./pages/CudaProblemPage'))
const ConceptsHomePage = lazy(() => import('./pages/ConceptsHomePage'))
const ConceptListPage = lazy(() => import('./pages/ConceptListPage'))

/**
 * 页面加载占位组件
 */
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">加载中...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router
      // GitHub Pages 部署在子路径时，保证首次进入 `${base}/` 能正确匹配到路由
      basename={import.meta.env.BASE_URL}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problems" element={<ProblemListPage />} />
            <Route path="/problem/:id" element={<ProblemPage />} />
            <Route path="/ai" element={<AiHomePage />} />
            <Route path="/ai/:id" element={<AiProblemPage />} />
            <Route path="/cuda" element={<CudaHomePage />} />
            <Route path="/cuda/:id" element={<CudaProblemPage />} />
            <Route path="/concepts" element={<ConceptsHomePage />} />
            <Route path="/concepts/book/:slug" element={<ConceptListPage />} />
            <Route path="/concepts/:id" element={<div>Concept Detail Page (待实现)</div>} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  )
}

export default App

