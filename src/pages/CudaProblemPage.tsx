import { Suspense, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Cpu,
    Loader2,
    Sparkles,
} from "lucide-react";
import { cudaProblems, getCudaProblemById } from "@/datacuda/data";
import { cudaCategoryNames } from "@/types/cuda";
import { Difficulty } from "@/types";
import { getCudaVisualizer } from "@/problemscuda";
import { useAppStore } from "@/store/useAppStore";
import { useScrollRestore } from "@/hooks/useScrollRestore";
import { MathText } from "@/components/MathText";
import { getCudaProgressId } from "@/utils/progressIds";

function VisualizerLoading() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
                <p className="text-gray-600">加载 CUDA 可视化组件中...</p>
            </div>
        </div>
    );
}

function CudaVisualizerRenderer({ problemId }: { problemId: number }) {
    const VisualizerComponent = getCudaVisualizer(problemId);

    if (!VisualizerComponent) {
        return (
            <div className="flex min-h-80 items-center justify-center p-8 text-gray-600">
                <div className="text-center">
                    <p className="mb-2 text-lg font-semibold">交互讲解加载失败</p>
                    <Link to="/cuda" className="text-sm font-semibold text-indigo-700 hover:underline">
                        返回 CUDA 列表重新选择
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <Suspense fallback={<VisualizerLoading />}>
            <VisualizerComponent key={problemId} />
        </Suspense>
    );
}

function getDifficultyBadge(difficulty: Difficulty) {
    switch (difficulty) {
        case Difficulty.EASY:
            return {
                label: "简单",
                className: "text-green-600 bg-green-50 border border-green-200",
            };
        case Difficulty.MEDIUM:
            return {
                label: "中等",
                className: "text-yellow-600 bg-yellow-50 border border-yellow-200",
            };
        case Difficulty.HARD:
            return {
                label: "困难",
                className: "text-red-600 bg-red-50 border border-red-200",
            };
        default:
            return {
                label: difficulty,
                className: "text-gray-600 bg-gray-50 border border-gray-200",
            };
    }
}

function CudaProblemPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentId = Number(id);
    const progressId = getCudaProgressId(currentId);
    const problem = getCudaProblemById(currentId);
    const descriptionContainerRef = useRef<HTMLDivElement>(null);

    const {
        isCompleted,
        isFavorite,
        isInProgress,
        markAsCompleted,
        markAsInProgress,
        toggleFavorite,
    } = useAppStore();

    // 使用 Zustand store 管理左侧描述区域的滚动位置
    useScrollRestore(`/cuda/${currentId}`, descriptionContainerRef);

    const completed = isCompleted(progressId);
    const favorite = isFavorite(progressId);
    const inProgress = isInProgress(progressId);

    const currentIndex = cudaProblems.findIndex((item) => item.id === currentId);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < cudaProblems.length - 1;

    const handlePrevious = () => {
        if (hasPrevious) {
            navigate(`/cuda/${cudaProblems[currentIndex - 1].id}`);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            navigate(`/cuda/${cudaProblems[currentIndex + 1].id}`);
        }
    };

    const handleComplete = () => {
        markAsCompleted(progressId);
        if (hasNext) {
            handleNext();
        } else {
            navigate("/cuda");
        }
    };

    const handleStartLearning = () => {
        markAsInProgress(progressId);
    };

    if (!problem) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">CUDA 算子未找到</h2>
                <Link to="/cuda" className="text-primary-600 hover:underline">
                    返回 CUDA 模块首页
                </Link>
            </div>
        );
    }

    const badge = getDifficultyBadge(problem.difficulty);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50">
            <div className="px-4 py-3 bg-white border-b border-gray-200 shadow-sm sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        to="/cuda"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition font-medium"
                    >
                        <ArrowLeft size={20} />
                        <span>返回 CUDA 列表</span>
                    </Link>

                    <div className="order-3 flex min-w-0 basis-full flex-wrap items-center justify-center gap-2 lg:order-none lg:basis-auto">
                        <span className="text-gray-500 font-mono text-sm flex items-center gap-1">
                            <Cpu size={16} />
                            CUDA#{problem.id}
                        </span>
                        <h2 className="text-lg font-bold text-gray-900">
                            {problem.title}
                        </h2>
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}
                        >
                            {badge.label}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full text-indigo-600 bg-indigo-50 border border-indigo-200">
                            {cudaCategoryNames[problem.category]}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={!hasPrevious}
                            aria-label="上一个 CUDA 主题"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} aria-hidden="true" />
                            <span className="hidden sm:inline">上一个</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => toggleFavorite(progressId)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition ${favorite
                                ? "bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                            aria-label={favorite ? "取消收藏" : "收藏 CUDA 主题"}
                            title={favorite ? "取消收藏" : "收藏"}
                        >
                            <Sparkles size={16} />
                        </button>

                        {!completed ? (
                            <button
                                type="button"
                                onClick={inProgress ? handleComplete : handleStartLearning}
                                aria-label={inProgress ? "学完并进入下一个 CUDA 主题" : "开始学习"}
                                className={`inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium rounded-lg transition shadow-sm ${inProgress
                                    ? "text-white bg-green-600 hover:bg-green-700"
                                    : "text-white bg-indigo-600 hover:bg-indigo-700"
                                    }`}
                            >
                                {inProgress ? (
                                    <>
                                        <CheckCircle2 size={16} />
                                        <span className="hidden sm:inline">学完</span>
                                    </>
                                ) : (
                                    <>
                                        <BookOpen size={16} />
                                        <span className="hidden sm:inline">开始学习</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="inline-flex items-center gap-1 px-4 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle2 size={16} />
                                <span className="hidden sm:inline">已完成</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!hasNext}
                            aria-label="下一个 CUDA 主题"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="hidden sm:inline">下一个</span>
                            <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto grid max-w-screen-2xl lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.22fr)]">
                <div ref={descriptionContainerRef} className="min-w-0 border-b border-gray-200 bg-gray-50 lg:border-b-0 lg:border-r">
                    <div className="p-6 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                场景简介
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                <MathText text={problem.description} />
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                学习目标
                            </h3>
                            <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                {problem.learningGoals.map((goal) => (
                                    <li key={goal}><MathText text={goal} /></li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                输入输出
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                        输入
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                        {problem.inputs.map((inputDesc) => (
                                            <li key={inputDesc}><MathText text={inputDesc} /></li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                        输出
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                        {problem.outputs.map((outputDesc) => (
                                            <li key={outputDesc}><MathText text={outputDesc} /></li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                示例
                            </h3>
                            {problem.examples.map((example, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                                    <div className="font-mono text-sm">
                                        <div className="mb-2">
                                            <span className="text-gray-600 font-semibold">
                                                输入：
                                            </span>
                                            <span className="text-gray-900"><MathText text={example.input} /></span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-gray-600 font-semibold">
                                                输出：
                                            </span>
                                            <span className="text-gray-900"><MathText text={example.output} /></span>
                                        </div>
                                        {example.explanation && (
                                            <div>
                                                <span className="text-gray-600 font-semibold">
                                                    解释：
                                                </span>
                                                <span className="text-gray-900">
                                                    <MathText text={example.explanation} />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {problem.heroNote && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                                <div className="text-sm text-indigo-700"><MathText text={problem.heroNote} /></div>
                            </div>
                        )}

                        {problem.visualizationFocus && problem.visualizationFocus.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    可视化重点
                                </h3>
                                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                    {problem.visualizationFocus.map((focus) => (
                                        <li key={focus}><MathText text={focus} /></li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                技术标签
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {problem.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 text-xs font-medium rounded-full text-blue-600 bg-blue-50 border border-blue-200"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="min-w-0 bg-white">
                    <CudaVisualizerRenderer problemId={problem.id} />
                </div>
            </div>
        </div>
    );
}

export default CudaProblemPage;
