import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Layout from './components/layout/Layout'
import './App.css'

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'))
const ProblemListPage = lazy(() => import('./pages/ProblemListPage'))
const ProblemPage = lazy(() => import('./pages/ProblemPage'))
const AiHomePage = lazy(() => import('./pages/AiHomePage'))
const AiProblemPage = lazy(() => import('./pages/AiProblemPage'))

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
    <Router>
      <Layout>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problems" element={<ProblemListPage />} />
            <Route path="/problem/:id" element={<ProblemPage />} />
            <Route path="/ai" element={<AiHomePage />} />
            <Route path="/ai/:id" element={<AiProblemPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  )
}

export default App

