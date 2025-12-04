import { VisualizationStep } from "@/types";
import { ProblemInput, InputValue } from "@/types/visualization";

export interface VectorAddInput extends ProblemInput {
  optimizationLevel: "baseline" | "grid-stride" | "vectorized";
  dataSize: number;
  threadsPerBlock: number;
  [key: string]: InputValue;
}

export const CODE_SNIPPETS = {
  baseline: `__global__ void vectorAdd(const float *A, const float *B, float *C, int N) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < N) {
        C[idx] = A[idx] + B[idx];
    }
}

int main() {
    // 1. Allocate Host Memory
    float *h_A = (float*)malloc(size);
    float *h_B = (float*)malloc(size);
    float *h_C = (float*)malloc(size);

    // 2. Initialize Host Data
    init(h_A, h_B, N);

    // 3. Allocate Device Memory
    float *d_A, *d_B, *d_C;
    cudaMalloc(&d_A, size);
    cudaMalloc(&d_B, size);
    cudaMalloc(&d_C, size);

    // 4. Copy Host to Device
    cudaMemcpy(d_A, h_A, size, cudaMemcpyHostToDevice);
    cudaMemcpy(d_B, h_B, size, cudaMemcpyHostToDevice);

    // 5. Launch Kernel
    int threadsPerBlock = %THREADS_PER_BLOCK%;
    int blocksPerGrid = (N + threadsPerBlock - 1) / threadsPerBlock;
    vectorAdd<<<blocksPerGrid, threadsPerBlock>>>(d_A, d_B, d_C, N);

    // 6. Copy Device to Host
    cudaMemcpy(h_C, d_C, size, cudaMemcpyDeviceToHost);

    // 7. Free Memory
    cudaFree(d_A); cudaFree(d_B); cudaFree(d_C);
    free(h_A); free(h_B); free(h_C);
}`,
  "grid-stride": `__global__ void vectorAdd(const float *A, const float *B, float *C, int N) {
    int stride = blockDim.x * gridDim.x;
    int tid = blockIdx.x * blockDim.x + threadIdx.x;
    
    for (int i = tid; i < N; i += stride) {
        C[i] = A[i] + B[i];
    }
}

int main() {
    // 1. Allocate Host Memory
    float *h_A = (float*)malloc(size);
    float *h_B = (float*)malloc(size);
    float *h_C = (float*)malloc(size);

    // 2. Initialize Host Data
    init(h_A, h_B, N);

    // 3. Allocate Device Memory
    float *d_A, *d_B, *d_C;
    cudaMalloc(&d_A, size);
    cudaMalloc(&d_B, size);
    cudaMalloc(&d_C, size);

    // 4. Copy Host to Device
    cudaMemcpy(d_A, h_A, size, cudaMemcpyHostToDevice);
    cudaMemcpy(d_B, h_B, size, cudaMemcpyHostToDevice);

    // 5. Launch Kernel (Fixed Grid Size)
    // Grid size is decoupled from data size N
    int threadsPerBlock = %THREADS_PER_BLOCK%;
    int blocksPerGrid = 2; // Fixed number of blocks for demo
    vectorAdd<<<blocksPerGrid, threadsPerBlock>>>(d_A, d_B, d_C, N);

    // 6. Copy Device to Host
    cudaMemcpy(h_C, d_C, size, cudaMemcpyDeviceToHost);

    // 7. Free Memory
    cudaFree(d_A); cudaFree(d_B); cudaFree(d_C);
    free(h_A); free(h_B); free(h_C);
}`,
  vectorized: `__global__ void vectorAdd(const float *A, const float *B, float *C, int N) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    
    // Reinterpret cast to float4 pointers
    float4 *A4 = (float4*)A;
    float4 *B4 = (float4*)B;
    float4 *C4 = (float4*)C;
    
    if (idx < N / 4) {
        float4 a = A4[idx];
        float4 b = B4[idx];
        float4 c;
        c.x = a.x + b.x; c.y = a.y + b.y;
        c.z = a.z + b.z; c.w = a.w + b.w;
        C4[idx] = c;
    }
}

int main() {
    // 1. Allocate Host Memory
    float *h_A = (float*)malloc(size);
    float *h_B = (float*)malloc(size);
    float *h_C = (float*)malloc(size);

    // 2. Initialize Host Data
    init(h_A, h_B, N);

    // 3. Allocate Device Memory
    float *d_A, *d_B, *d_C;
    cudaMalloc(&d_A, size);
    cudaMalloc(&d_B, size);
    cudaMalloc(&d_C, size);

    // 4. Copy Host to Device
    cudaMemcpy(d_A, h_A, size, cudaMemcpyHostToDevice);
    cudaMemcpy(d_B, h_B, size, cudaMemcpyHostToDevice);

    // 5. Launch Kernel (N/4 threads needed)
    int threadsPerBlock = %THREADS_PER_BLOCK%;
    int blocksPerGrid = (N/4 + threadsPerBlock - 1) / threadsPerBlock;
    vectorAdd<<<blocksPerGrid, threadsPerBlock>>>(d_A, d_B, d_C, N);

    // 6. Copy Device to Host
    cudaMemcpy(h_C, d_C, size, cudaMemcpyDeviceToHost);

    // 7. Free Memory
    cudaFree(d_A); cudaFree(d_B); cudaFree(d_C);
    free(h_A); free(h_B); free(h_C);
}`,
};

export function generateVectorAddSteps(
  input: VectorAddInput
): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  let stepId = 0;

  const { optimizationLevel, dataSize, threadsPerBlock } = input;

  // Use user-defined threadsPerBlock directly
  let blockDim = threadsPerBlock;
  let gridDim = 1;

  if (optimizationLevel === "baseline") {
    gridDim = Math.ceil(dataSize / blockDim);
  } else if (optimizationLevel === "grid-stride") {
    // For grid-stride, we fix gridDim to something small to show looping,
    // or we could make it dynamic. Let's keep it fixed for demo purposes or
    // calculate it such that it doesn't cover full dataSize instantly.
    // Let's use a fixed small number of blocks to force striding if N is large.
    gridDim = 2;
  } else if (optimizationLevel === "vectorized") {
    const vecElements = Math.ceil(dataSize / 4);
    gridDim = Math.ceil(vecElements / blockDim);
  }

  const totalThreads = blockDim * gridDim;

  // Initial Data
  const dataA = Array.from({ length: dataSize }, (_, i) => i + 1);
  const dataB = Array.from({ length: dataSize }, (_, i) => (i + 1) * 10);
  // --- Step 1: Host Init ---
  steps.push({
    id: stepId++,
    description: "在 Host 端分配并初始化内存 (h_A, h_B)。",
    data: {
      host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
      device: { A: null, B: null, C: null },
      activeThreads: [],
      highlightLine: "init_host", // Abstract line ID
    },
    variables: { phase: "host_init" },
  });

  // --- Step 2: Device Malloc ---
  steps.push({
    id: stepId++,
    description: "在 Device 端分配内存 (cudaMalloc)。",
    data: {
      host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
      device: {
        A: new Array(dataSize).fill(0),
        B: new Array(dataSize).fill(0),
        C: new Array(dataSize).fill(0),
      }, // 0 indicates allocated but empty/garbage
      activeThreads: [],
      highlightLine: "cuda_malloc",
    },
    variables: { phase: "cuda_malloc" },
  });

  // --- Step 3: H2D Copy ---
  steps.push({
    id: stepId++,
    description: "将数据从 Host 拷贝到 Device (cudaMemcpy HostToDevice)。",
    data: {
      host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
      device: { A: dataA, B: dataB, C: new Array(dataSize).fill(0) },
      activeThreads: [],
      highlightLine: "memcpy_h2d",
    },
    variables: { phase: "memcpy_h2d" },
  });

  // --- Step 4: Kernel Launch ---
  steps.push({
    id: stepId++,
    description: `启动 Kernel：gridDim=${gridDim}, blockDim=${blockDim}。`,
    data: {
      host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
      device: { A: dataA, B: dataB, C: new Array(dataSize).fill(0) },
      activeThreads: [],
      highlightLine: "kernel_launch",
    },
    variables: { phase: "kernel_launch" },
  });

  // --- Kernel Execution Logic ---
  const deviceC = new Array(dataSize).fill(0); // Initial device C state

  if (optimizationLevel === "baseline") {
    // Baseline Logic
    const activeThreads = [];
    for (let i = 0; i < totalThreads; i++) {
      const blockId = Math.floor(i / blockDim);
      const threadInBlock = i % blockDim;
      activeThreads.push({
        tid: i,
        blockId,
        threadInBlock,
        idx: i,
        active: i < dataSize,
      });
    }

    steps.push({
      id: stepId++,
      description: "Kernel: 计算全局索引 idx。",
      data: {
        host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
        device: { A: dataA, B: dataB, C: [...deviceC] },
        activeThreads,
        highlightLine: "kernel_idx",
      },
      variables: { phase: "kernel_running" },
    });

    steps.push({
      id: stepId++,
      description: "Kernel: 边界检查与计算。",
      data: {
        host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
        device: { A: dataA, B: dataB, C: [...deviceC] },
        activeThreads,
        highlightLine: "kernel_compute",
      },
      variables: { phase: "kernel_running" },
    });

    // Perform Compute
    activeThreads.forEach((t) => {
      if (t.active) {
        deviceC[t.idx] = dataA[t.idx] + dataB[t.idx];
      }
    });

    steps.push({
      id: stepId++,
      description: "Kernel: 写入结果到 Device 内存。",
      data: {
        host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
        device: { A: dataA, B: dataB, C: [...deviceC] },
        activeThreads,
        highlightLine: "kernel_compute",
      },
      variables: { phase: "kernel_running" },
    });
  } else if (optimizationLevel === "grid-stride") {
    // Grid Stride Logic
    const stride = totalThreads;

    for (let offset = 0; offset < dataSize; offset += stride) {
      const currentActiveThreads = [];
      for (let i = 0; i < totalThreads; i++) {
        const idx = offset + i;
        const blockId = Math.floor(i / blockDim);
        const threadInBlock = i % blockDim;
        currentActiveThreads.push({
          tid: i,
          blockId,
          threadInBlock,
          idx,
          active: idx < dataSize,
        });
      }

      steps.push({
        id: stepId++,
        description: `Kernel: 循环处理 stride=${stride}, offset=${offset}。`,
        data: {
          host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
          device: { A: dataA, B: dataB, C: [...deviceC] },
          activeThreads: currentActiveThreads,
          highlightLine: "kernel_loop",
        },
        variables: { phase: "kernel_running", offset },
      });

      // Compute
      currentActiveThreads.forEach((t) => {
        if (t.active) {
          deviceC[t.idx] = dataA[t.idx] + dataB[t.idx];
        }
      });

      steps.push({
        id: stepId++,
        description: "Kernel: 计算并写入当前块。",
        data: {
          host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
          device: { A: dataA, B: dataB, C: [...deviceC] },
          activeThreads: currentActiveThreads,
          highlightLine: "kernel_compute",
        },
        variables: { phase: "kernel_running", offset },
      });
    }
  } else if (optimizationLevel === "vectorized") {
    // Vectorized Logic
    const float4Count = Math.ceil(dataSize / 4);
    const activeThreads = [];
    for (let i = 0; i < totalThreads; i++) {
      if (i < float4Count) {
        const blockId = Math.floor(i / blockDim);
        const threadInBlock = i % blockDim;
        activeThreads.push({
          tid: i,
          blockId,
          threadInBlock,
          idx: i,
          active: true,
          type: "float4",
        });
      }
    }

    steps.push({
      id: stepId++,
      description: "Kernel: 读取 float4 数据。",
      data: {
        host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
        device: { A: dataA, B: dataB, C: [...deviceC] },
        activeThreads,
        highlightLine: "kernel_load",
      },
      variables: { phase: "kernel_running" },
    });

    // Compute & Store
    for (let i = 0; i < totalThreads; i++) {
      if (i < float4Count) {
        const baseIdx = i * 4;
        for (let j = 0; j < 4; j++) {
          if (baseIdx + j < dataSize) {
            deviceC[baseIdx + j] = dataA[baseIdx + j] + dataB[baseIdx + j];
          }
        }
      }
    }

    steps.push({
      id: stepId++,
      description: "Kernel: 计算并写入 float4 结果。",
      data: {
        host: { A: dataA, B: dataB, C: new Array(dataSize).fill(null) },
        device: { A: dataA, B: dataB, C: [...deviceC] },
        activeThreads,
        highlightLine: "kernel_store",
      },
      variables: { phase: "kernel_running" },
    });
  }

  // --- Step 5: D2H Copy ---
  steps.push({
    id: stepId++,
    description: "将结果从 Device 拷贝回 Host (cudaMemcpy DeviceToHost)。",
    data: {
      host: { A: dataA, B: dataB, C: [...deviceC] },
      device: { A: dataA, B: dataB, C: deviceC },
      activeThreads: [],
      highlightLine: "memcpy_d2h",
    },
    variables: { phase: "memcpy_d2h" },
  });

  // --- Step 6: Free ---
  steps.push({
    id: stepId++,
    description: "释放内存 (cudaFree, free)。",
    data: {
      host: { A: dataA, B: dataB, C: deviceC },
      device: { A: null, B: null, C: null }, // Memory freed
      activeThreads: [],
      highlightLine: "free",
    },
    variables: { phase: "finished", finished: true },
  });

  return steps;
}
