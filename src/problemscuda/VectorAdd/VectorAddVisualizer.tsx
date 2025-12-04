import { useEffect, useRef, useState } from "react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { generateVectorAddSteps, VectorAddInput, CODE_SNIPPETS } from "./algorithm";
import { motion } from "framer-motion";
import { Check, Info, ArrowDown, ArrowUp } from "lucide-react";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { getVectorAddCoreIdea } from "@/config/cudaProblemCoreIdeas";

const VectorAddVisualizer = () => {
    const [focusedBlock, setFocusedBlock] = useState<number | null>(null);
    const [focusedThread, setFocusedThread] = useState<number | null>(null);
    const [codeWindow, setCodeWindow] = useState<{ open: boolean; x: number; y: number; width: number; height: number }>({
        open: true,
        x: 80,
        y: 180,
        width: 420,
        height: 500,
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const resizeStart = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (isDragging) {
                setCodeWindow((prev) => ({
                    ...prev,
                    x: e.clientX - dragOffset.current.x,
                    y: e.clientY - dragOffset.current.y,
                }));
            } else if (isResizing) {
                const deltaX = e.clientX - resizeStart.current.x;
                const deltaY = e.clientY - resizeStart.current.y;
                setCodeWindow((prev) => ({
                    ...prev,
                    width: Math.max(260, resizeStart.current.width + deltaX),
                    height: Math.max(240, resizeStart.current.height + deltaY),
                }));
            }
        };
        const handleUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
        };
    }, [isDragging, isResizing]);

    const startDrag = (e: React.MouseEvent) => {
        dragOffset.current = {
            x: e.clientX - codeWindow.x,
            y: e.clientY - codeWindow.y,
        };
        setIsDragging(true);
    };

    const startResize = (e: React.MouseEvent) => {
        e.stopPropagation();
        resizeStart.current = {
            x: e.clientX,
            y: e.clientY,
            width: codeWindow.width,
            height: codeWindow.height,
        };
        setIsResizing(true);
    };

    const getStages = (level: string, line?: string) => {
        const stagesByLevel: Record<string, { key: string; label: string }[]> = {
            baseline: [
                { key: "idx", label: "计算 idx" },
                { key: "compute", label: "计算 A+B" },
                { key: "store", label: "写回 C" },
            ],
            "grid-stride": [
                { key: "loop", label: "循环 stride" },
                { key: "compute", label: "计算 A+B" },
                { key: "store", label: "写回 C" },
            ],
            vectorized: [
                { key: "load", label: "加载 float4" },
                { key: "compute", label: "计算 A+B" },
                { key: "store", label: "写回 C4" },
            ],
        };

        const stageOrder = stagesByLevel[level] || stagesByLevel["baseline"];
        const activeKey =
            line === "kernel_idx"
                ? "idx"
                : line === "kernel_loop"
                ? "loop"
                : line === "kernel_load"
                ? "load"
                : line === "kernel_store"
                ? "store"
                : line === "kernel_compute"
                ? "compute"
                : undefined;

        return stageOrder.map((stage) => {
            const status =
                activeKey === stage.key
                    ? "active"
                    : activeKey
                    ? stageOrder.findIndex((s) => s.key === stage.key) <
                      stageOrder.findIndex((s) => s.key === activeKey)
                        ? "done"
                        : "pending"
                    : "pending";
            return { ...stage, status };
        });
    };

    return (
        <>
        <ConfigurableVisualizer<VectorAddInput, any>
            config={{
                defaultInput: {
                    optimizationLevel: "baseline",
                    dataSize: 8,
                    threadsPerBlock: 4,
                },
                algorithm: generateVectorAddSteps,
                inputTypes: [
                    { type: "number", key: "dataSize", label: "数据大小 (N)", min: 4, max: 32 },
                    { type: "number", key: "threadsPerBlock", label: "Block 大小 (threadsPerBlock)", min: 1, max: 8 },
                ],
                inputFields: [
                    { type: "number", key: "dataSize", label: "数据大小 (N)" },
                    { type: "number", key: "threadsPerBlock", label: "Block 大小 (threadsPerBlock)" },
                ],
                testCases: [
                    {
                        label: "示例 1",
                        value: {
                            optimizationLevel: "baseline",
                            dataSize: 8,
                            threadsPerBlock: 4,
                        },
                    },
                    {
                        label: "示例 2",
                        value: {
                            optimizationLevel: "baseline",
                            dataSize: 16,
                            threadsPerBlock: 4,
                        },
                    },
                    {
                        label: "示例 3",
                        value: {
                            optimizationLevel: "baseline",
                            dataSize: 24,
                            threadsPerBlock: 8,
                        },
                    },
                ],
                render: ({ data, visualization }) => {
                    const input = visualization.input as VectorAddInput;
                    const { host, device, activeThreads, highlightLine } = data;
                    const description = visualization.currentStepData?.description || "准备开始...";
                    
                    // Direct mapping from input since we now control threadsPerBlock
                    const block = input.threadsPerBlock; 
                    // Calculate grid based on optimization level logic but using user's block size
                    let grid = 0;
                    if (input.optimizationLevel === "baseline") {
                        grid = Math.ceil(input.dataSize / block);
                    } else if (input.optimizationLevel === "grid-stride") {
                        // For visualization of grid stride, we keep a small fixed grid or 
                        // make it dependent. Let's keep consistent with algorithm.ts logic
                        grid = 2; // Fixed as per algorithm.ts
                    } else if (input.optimizationLevel === "vectorized") {
                        grid = Math.ceil(Math.ceil(input.dataSize / 4) / block);
                    }

                    // ... (rest of render)

                    const levels = [
                        { id: "baseline", label: "Baseline", desc: "基础并行" },
                        { id: "grid-stride", label: "Grid-Stride", desc: "循环处理" },
                        { id: "vectorized", label: "Vectorized", desc: "向量化读写" },
                    ];

                    const mergedCoreIdea = getVectorAddCoreIdea(input.optimizationLevel);
                    const isTransferring = highlightLine?.includes("memcpy");
                    const isComputing = highlightLine?.includes("kernel");
                    const codeSnippet = CODE_SNIPPETS[input.optimizationLevel].replace(
                        /%THREADS_PER_BLOCK%/g,
                        String(block || 0)
                    );
                    const threadsByBlock = (() => {
                        if (!activeThreads || activeThreads.length === 0) return [];
                        const groups: Record<number, any[]> = {};
                        const safeBlock = block || 1;
                        activeThreads.forEach((t: any) => {
                            const blockId = typeof t.blockId === "number" ? t.blockId : Math.floor((t.tid ?? 0) / safeBlock);
                            if (!groups[blockId]) groups[blockId] = [];
                            groups[blockId].push(t);
                        });
                        const blockCount = grid || Object.keys(groups).length || 0;
                        return Array.from({ length: blockCount }, (_, i) => groups[i] || []);
                    })();

                    const blockThreads =
                        focusedBlock !== null && focusedBlock >= 0 && focusedBlock < threadsByBlock.length
                            ? threadsByBlock[focusedBlock]
                            : threadsByBlock[0] || [];

                    const chosenThread =
                        blockThreads.find((t: any) => t.tid === focusedThread) ||
                        blockThreads.find((t: any) => t.active) ||
                        blockThreads[0];

                    const registerA =
                        typeof chosenThread?.idx === "number" ? device?.A?.[chosenThread.idx] ?? host?.A?.[chosenThread.idx] : undefined;
                    const registerB =
                        typeof chosenThread?.idx === "number" ? device?.B?.[chosenThread.idx] ?? host?.B?.[chosenThread.idx] : undefined;
                    const registerC =
                        typeof chosenThread?.idx === "number" ? device?.C?.[chosenThread.idx] ?? host?.C?.[chosenThread.idx] : undefined;

                    const stages = getStages(input.optimizationLevel, highlightLine);

                    const gridStrideOffsets = (() => {
                        if (input.optimizationLevel !== "grid-stride") return [];
                        const offsets = new Set<number>();
                        visualization.steps.forEach((s) => {
                            const off = (s as any)?.variables?.offset;
                            if (typeof off === "number") offsets.add(off);
                        });
                        return Array.from(offsets).sort((a, b) => a - b);
                    })();

                    return (
                        <div className="space-y-6">
                            {mergedCoreIdea && <CoreIdeaBox {...mergedCoreIdea} />}

                            {/* 1. 调参部分 (Parameters) */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                    {levels.map((level, idx) => (
                                        <div
                                            key={level.id}
                                            className={`flex items-center flex-1 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors
                                                ${input.optimizationLevel === level.id ? "bg-blue-50/50" : ""}`}
                                            onClick={() => visualization.setInput({ ...input, optimizationLevel: level.id as any })}
                                        >
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-colors
                                                ${input.optimizationLevel === level.id
                                                    ? "bg-blue-600 text-white shadow-md"
                                                    : "bg-gray-100 text-gray-400"}
                                            `}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-semibold ${input.optimizationLevel === level.id ? "text-blue-700" : "text-gray-600"}`}>
                                                    {level.label}
                                                </div>
                                                <div className="text-xs text-gray-400">{level.desc}</div>
                                            </div>
                                            {input.optimizationLevel === level.id && (
                                                <motion.div layoutId="active-indicator" className="ml-auto text-blue-600">
                                                    <Check size={16} />
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            className="px-3 py-1 text-xs rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                            onClick={() => setCodeWindow((prev) => ({ ...prev, open: !prev.open }))}
                                        >
                                            {codeWindow.open ? "关闭代码浮窗" : "打开代码浮窗"}
                                        </button>
                                    </div>
                                </div>

                            {/* 2. 数据变化面板 (Current Operation) */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className={`rounded-lg shadow-sm border-2 p-5 transition-all ${
                                    isTransferring ? 'bg-blue-50 border-blue-300' :
                                    isComputing ? 'bg-purple-50 border-purple-300' :
                                    'bg-gray-50 border-gray-200'
                                }`}>
                                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                        <Info size={18} className={`${
                                            isTransferring ? 'text-blue-600' :
                                            isComputing ? 'text-purple-600' :
                                            'text-gray-600'
                                        }`} />
                                        当前操作
                                    </h3>
                                    <p className={`text-sm font-medium ${
                                        isTransferring ? 'text-blue-700' :
                                        isComputing ? 'text-purple-700' :
                                        'text-gray-700'
                                    }`}>
                                        {description}
                                    </p>
                                </div>
                            </div>

                            {/* 4. 可视化面板 (Visualization) */}
                            <div className="grid grid-cols-1 gap-6">
                                {/* Memory & Threads */}
                                <div className="space-y-6 overflow-y-auto h-[600px] pr-2">

                                    {/* Host Memory */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-700">Host Memory (CPU)</h3>
                                            <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">System RAM</span>
                                        </div>
                                        <div className="space-y-3">
                                            {['A', 'B', 'C'].map((arrName) => (
                                                <div key={arrName} className="flex items-center gap-3">
                                                    <span className="w-4 text-xs font-mono font-bold text-gray-500">{arrName}</span>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {host?.[arrName]?.map((val: any, idx: number) => (
                                                            <div key={idx} className={`
                                                                w-8 h-8 flex items-center justify-center text-xs border rounded transition-colors
                                                                ${val === null ? "bg-gray-50 text-gray-300 border-dashed" : "bg-blue-50 border-blue-200 text-blue-700 font-medium"}
                                                            `}>
                                                                {val ?? "?"}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Data Transfer Animation Area */}
                                    <div className="h-12 flex items-center justify-center">
                                        {highlightLine?.includes("memcpy") && (
                                            <motion.div
                                                initial={{ opacity: 0, y: highlightLine === "memcpy_h2d" ? -10 : 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-xs font-bold text-blue-600 flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200 shadow-sm"
                                            >
                                                {highlightLine === "memcpy_h2d" ? (
                                                    <>
                                                        <ArrowDown className="animate-bounce" size={16} />
                                                        <span>PCIe Bus: Host &rarr; Device</span>
                                                        <ArrowDown className="animate-bounce" size={16} />
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowUp className="animate-bounce" size={16} />
                                                        <span>PCIe Bus: Device &rarr; Host</span>
                                                        <ArrowUp className="animate-bounce" size={16} />
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Device Memory */}
                                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-200">Device Memory (GPU)</h3>
                                            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded">Global Memory</span>
                                        </div>
                                        <div className="space-y-3">
                                            {['A', 'B', 'C'].map((arrName) => (
                                                <div key={arrName} className="flex items-center gap-3">
                                                    <span className="w-4 text-xs font-mono font-bold text-gray-400">{arrName}</span>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {device?.[arrName]?.map((val: any, idx: number) => (
                                                            <div key={idx} className={`
                                                                w-8 h-8 flex items-center justify-center text-xs border rounded transition-colors
                                                                ${val === null 
                                                                    ? "bg-gray-800 text-gray-600 border-dashed border-gray-700" 
                                                                    : "bg-green-900/30 border-green-700 text-green-400 font-medium"}
                                                            `}>
                                                                {val === 0 ? (highlightLine === "cuda_malloc" ? "0" : "?") : (val ?? "?")}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Active Threads */}
                                    {activeThreads && activeThreads.length > 0 && (
                                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-semibold text-gray-700">Active Threads</h3>
                                                <div className="text-xs text-gray-400">
                                                    Block: {block} | Grid: {grid}
                                                </div>
                                            </div>
                                        <div className="space-y-3">
                                            {threadsByBlock.map((threads, blockId) => (
                                                    <div
                                                        key={blockId}
                                                        className={`rounded border p-3 bg-gray-50 transition-colors cursor-pointer ${
                                                            focusedBlock === blockId ? "border-blue-300 bg-blue-50/60" : "border-gray-100"
                                                        }`}
                                                        onClick={() => {
                                                            setFocusedBlock(blockId);
                                                            setFocusedThread(null);
                                                        }}
                                                    >
                                                        <div className="text-[11px] font-semibold text-gray-500 mb-2">
                                                            Block {blockId}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {threads.map((t: any, i: number) => (
                                                                <motion.div
                                                                    key={`${blockId}-${i}`}
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className={`
                                                                        p-2 rounded border text-xs flex flex-col items-center min-w-[60px] transition-colors
                                                                        ${t.active ? "bg-green-50 border-green-200 shadow-sm" : "bg-gray-50 border-gray-100 opacity-50"}
                                                                        ${focusedThread === t.tid ? "ring-2 ring-blue-300" : ""}
                                                                    `}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFocusedBlock(blockId);
                                                                        setFocusedThread(t.tid);
                                                                    }}
                                                                >
                                                                    <span className="font-bold text-gray-600">T{t.threadInBlock ?? t.tid}</span>
                                                                    <span className="text-[10px] text-gray-400">tid:{t.tid}</span>
                                                                    <span className="font-mono text-[10px] text-gray-500">idx:{t.idx}</span>
                                                                    {t.type === 'float4' && <span className="text-[8px] text-purple-500 font-semibold">float4</span>}
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Block 透视 */}
                                    {blockThreads && blockThreads.length > 0 && (
                                        <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-sm font-semibold text-blue-700">Block 透视</h3>
                                                <div className="text-xs text-blue-500">
                                                    Block {focusedBlock ?? 0} · Threads: {blockThreads.length}
                                                </div>
                                            </div>

                                            {input.optimizationLevel === "grid-stride" && gridStrideOffsets.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3 text-[11px]">
                                                    {gridStrideOffsets.map((offset) => {
                                                        const isCurrent = (visualization.currentStepData as any)?.variables?.offset === offset;
                                                        return (
                                                            <button
                                                                key={offset}
                                                                onClick={() => {
                                                                    const target = visualization.steps.findIndex(
                                                                        (s: any) => s?.variables?.offset === offset && s?.variables?.phase === "kernel_running"
                                                                    );
                                                                    if (target >= 0) visualization.jumpToStep(target);
                                                                }}
                                                                className={`px-2 py-1 rounded-full border ${
                                                                    isCurrent
                                                                        ? "bg-blue-600 text-white border-blue-600"
                                                                        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                                                }`}
                                                            >
                                                                循环 offset {offset}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="mb-3">
                                                <div className="text-[11px] font-semibold text-gray-500 mb-1">Warp/Lane 视图</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.from({ length: block }).map((_, i) => {
                                                        const thread = blockThreads.find((t: any) => t.threadInBlock === i);
                                                        const isSelected = thread && thread.tid === chosenThread?.tid;
                                                        const isActive = thread?.active;
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`
                                                                    w-8 h-8 flex items-center justify-center rounded text-[10px] border cursor-pointer
                                                                    ${isActive ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 text-gray-400"}
                                                                    ${isSelected ? "ring-2 ring-blue-300" : ""}
                                                                `}
                                                                onClick={() => {
                                                                    if (thread) {
                                                                        setFocusedBlock(focusedBlock ?? 0);
                                                                        setFocusedThread(thread.tid);
                                                                    }
                                                                }}
                                                            >
                                                                {i}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                                                    <div className="text-xs font-semibold text-gray-600 mb-2">Thread 状态</div>
                                                    <div className="text-xs text-gray-700 space-y-1">
                                                        <div>Block: {focusedBlock ?? 0}</div>
                                                        <div>Thread (block 内): {chosenThread?.threadInBlock ?? "-"}</div>
                                                        <div>tid: {chosenThread?.tid ?? "-"}</div>
                                                        <div>idx: {chosenThread?.idx ?? "-"}</div>
                                                    </div>
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-16 text-[11px] text-gray-500">A[idx]</span>
                                                            <span className="flex-1 px-2 py-1 rounded bg-white border text-gray-700 text-xs">
                                                                {registerA ?? "?"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-16 text-[11px] text-gray-500">B[idx]</span>
                                                            <span className="flex-1 px-2 py-1 rounded bg-white border text-gray-700 text-xs">
                                                                {registerB ?? "?"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-16 text-[11px] text-gray-500">C[idx]</span>
                                                            <span className="flex-1 px-2 py-1 rounded bg-white border text-gray-700 text-xs">
                                                                {registerC ?? "?"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                                                    <div className="text-xs font-semibold text-gray-600 mb-2">Thread 时间线</div>
                                                    <div className="space-y-2">
                                                        {stages.map((stage) => (
                                                            <div key={stage.key} className="flex items-center gap-2 text-xs">
                                                                <div
                                                                    className={`
                                                                        w-2 h-2 rounded-full
                                                                        ${stage.status === "active"
                                                                            ? "bg-blue-500 animate-pulse"
                                                                            : stage.status === "done"
                                                                            ? "bg-green-500"
                                                                            : "bg-gray-300"}
                                                                    `}
                                                                />
                                                                <span
                                                                    className={`
                                                                        ${stage.status === "active"
                                                                            ? "text-blue-700 font-semibold"
                                                                            : stage.status === "done"
                                                                            ? "text-green-700"
                                                                            : "text-gray-500"}
                                                                    `}
                                                                >
                                                                    {stage.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                            </div>
                                            <div
                                                onMouseDown={startResize}
                                                className="absolute bottom-1 right-1 w-3 h-3 border border-slate-400 rounded-sm cursor-se-resize bg-slate-600/70 hover:bg-slate-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                </div>
                            </div>
                            
                            {/* 5. 结果面板 (Result) */}
                            {visualization.steps.length > 0 &&
                                visualization.currentStep === visualization.steps.length - 1 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-center text-green-800"
                                >
                                    <Check className="mr-2" size={20} />
                                    <span className="font-semibold">Execution Completed Successfully</span>
                                </motion.div>
                                )}

                                {/* Code Floating Window */}
                                {codeWindow.open && (
                                    <div
                                        className="fixed z-50 max-h-[75vh] shadow-2xl border border-slate-700 rounded-lg overflow-hidden"
                                        style={{ left: codeWindow.x, top: codeWindow.y, width: codeWindow.width, height: codeWindow.height }}
                                    >
                                        <div
                                            className="bg-slate-800 px-4 py-2 text-xs text-slate-200 font-mono border-b border-slate-700 flex justify-between items-center cursor-grab active:cursor-grabbing select-none"
                                            onMouseDown={startDrag}
                                        >
                                            <span>vector_add.cu</span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-100">{input.optimizationLevel}</span>
                                                <button
                                                    className="text-slate-300 hover:text-white"
                                                    onClick={() => setCodeWindow((prev) => ({ ...prev, open: false }))}
                                                >
                                                    关闭
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative bg-slate-900 p-4 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre scrollbar-thin scrollbar-thumb-slate-700" style={{ height: codeWindow.height - 48 }}>
                                            {codeSnippet.split('\n').map((line, i) => {
                                                let isHighlighted = false;
                                                // Heuristic mapping
                                                if (highlightLine === "init_host" && line.includes("malloc")) isHighlighted = true;
                                                if (highlightLine === "cuda_malloc" && line.includes("cudaMalloc")) isHighlighted = true;
                                                if (highlightLine === "memcpy_h2d" && line.includes("cudaMemcpyHostToDevice")) isHighlighted = true;
                                                if (highlightLine === "kernel_launch" && line.includes("<<<")) isHighlighted = true;
                                                if (highlightLine === "memcpy_d2h" && line.includes("cudaMemcpyDeviceToHost")) isHighlighted = true;
                                                if (highlightLine === "free" && line.includes("Free")) isHighlighted = true;

                                                if (highlightLine === "kernel_idx" && line.includes("int idx")) isHighlighted = true;
                                                if (highlightLine === "kernel_loop" && line.includes("for (int i")) isHighlighted = true;
                                                if (highlightLine === "kernel_load" && line.includes("float4 a")) isHighlighted = true;
                                                if (highlightLine === "kernel_compute" && (line.includes("C[idx]") || line.includes("C[i]"))) isHighlighted = true;
                                                if (highlightLine === "kernel_store" && line.includes("C4[idx]")) isHighlighted = true;

                                                return (
                                                    <div key={i} className={`${isHighlighted ? "bg-blue-900/50 text-blue-200 w-full block px-2 -mx-2 rounded border-l-2 border-blue-400" : "pl-2"}`}>
                                                        <span className="text-slate-600 w-6 inline-block text-right mr-4 select-none">{i + 1}</span>
                                                        {line}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    },
                }}
            />
        </>
    );
};

export default VectorAddVisualizer;
