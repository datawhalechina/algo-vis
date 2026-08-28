# 引导课程逐步动画实施任务板

规格：[引导式课程逐步动画修复设计](../superpowers/specs/2026-08-28-guided-lesson-step-animation-design.md)

## 用户旅程

- 作为初学者，我希望每次点击一个流程关节都能看到输入、计算和输出在画面中发生变化，从而理解结果是怎样得到的。
- 作为学习者，我希望能前进、后退、直接跳转和自动播放，并且公式、说明与动画始终指向同一个步骤。
- 作为调试者，我希望每一帧都有可核对的中间值和断言，从而能定位第一处错误。
- 作为移动端学习者，我希望在 320px 宽度下仍能看清实体、标签和控制按钮，不出现页面横向溢出或内容遮挡。

## 工作项

| ID | 工作项 | Owner | 文件范围 | 状态 | 合并门禁 |
| --- | --- | --- | --- | --- | --- |
| CORE-RED | 156 课场景契约与 CUDA 201 回归测试 | root | `tests/guidedLessonScenes.contract.test.ts` | Running | 测试因缺少目标实现而失败 |
| CORE | 场景类型、校验器、构造器、共享动画渲染器 | root | `src/config/lessonSceneTypes.ts`、`src/config/sceneBuilders/**`、`src/components/visualizers/AnimatedLessonScene*` | Backlog | 契约测试通过，六类场景可渲染 |
| AI | 63 个 AI 场景与稳定关节 | ai-owner | `src/config/aiLessonBlueprints/**`、`src/config/lessonScenes/ai/**` | Backlog | 63/63 契约通过，独立 review 通过 |
| CUDA | 21 个 CUDA 场景与 CUDA 201 七帧 | cuda-owner | `src/config/cudaLessonBlueprints/**`、`src/config/lessonScenes/cuda/**` | Backlog | 21/21 契约通过，201 专项与 review 通过 |
| DRL | 36 个强化学习场景与共享协议迁移 | drl-owner | `src/config/drlLessonBlueprints.ts`、`src/config/lessonScenes/drl/**` | Backlog | 36/36 契约通过，独立 review 通过 |
| CONCEPT | 36 个计算机基础场景与稳定关节 | concept-owner | `src/config/conceptLessonBlueprints/**`、`src/config/lessonScenes/concepts/**` | Backlog | 36/36 契约通过，独立 review 通过 |
| INTEGRATION | 路由包装器、E2E、构建和热更新 | root | guided visualizer、四个包装器、Playwright、Vite、workflow | Backlog | lint/test/build/E2E/截图全通过 |

共享协议在 CORE 的 RED/GREEN 检查点后冻结。内容 owner 不修改共享类型、构造器、测试或其他领域文件；reviewer 只写 `docs/reviews/` 下的审查报告。
