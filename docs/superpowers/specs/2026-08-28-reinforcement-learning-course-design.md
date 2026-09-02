# Reinforcement Learning Course Redesign

## Goal

Turn the reinforcement-learning area into a complete beginner-friendly visual course. Preserve free browsing through topic cards, but expose a recommended sequence, prerequisites, rendered mathematics, and a clickable timeline for revisiting any animation step.

The classical syllabus follows the public course structure in Wang Shusen's `wangshusen/DRL` repository. LLM alignment and distributed LLM RL are clearly labeled as modern extensions rather than part of the original course.

## Information Architecture

The course uses these ordered chapters:

1. Foundations and MDPs
2. Value-based learning
3. Policy-based learning
4. Actor-Critic methods
5. Monte Carlo foundations
6. Temporal-difference learning
7. Advanced value-based learning
8. Policy gradients with baselines
9. Trust regions and partial observation
10. Continuous control
11. Multi-agent reinforcement learning
12. Imitation learning
13. Modern extension: LLM reinforcement learning and alignment
14. Modern extension: distributed LLM reinforcement learning systems

The current `verl Framework` category becomes `Distributed LLM RL Systems`. Existing content about controllers, workers, Actor/Rollout, rewards, advantage calculation, training loops, and parameter resharding remains useful, but all core explanations become framework-neutral. Named frameworks such as verl may appear only in an implementation-comparison or further-reading context.

## Browsing Experience

The DRL home page keeps the existing card catalog. It adds:

- numbered chapter order;
- a compact recommended-path strip;
- prerequisite labels and completion state;
- a distinction between the classical course and modern extensions;
- truthful availability state, with no card leading to a dead placeholder.

Users can still open any topic directly. The recommended path guides beginners without blocking experienced users.

## Lesson Experience

Desktop lessons use a responsive two-pane workbench. The left pane contains the conceptual explanation and learning goals. The right pane contains the interactive visualizer. Small screens stack the same content vertically and keep all controls reachable.

Every lesson follows the same teaching rhythm:

1. Intuition and a concrete scenario
2. Definition of symbols
3. Formula or algorithm decomposition
4. One state transition or update at a time
5. Result interpretation and common misconception
6. A short takeaway

Existing bespoke visualizers are retained. Missing DRL lessons receive a reusable `GuidedLessonVisualizer` driven by structured lesson steps. Each step can provide a title, explanation, formula, callout, visual state, and variables. This gives every listed DRL topic a working visual lesson while allowing important topics to graduate to bespoke animation later.

## Formula Rendering

A shared math-rich text renderer supports:

- inline `$...$` and `\\(...\\)` formulas;
- block `$$...$$` and `\\[...\\]` formulas;
- plain text around multiple formulas;
- graceful fallback that displays the original source when KaTeX cannot parse an expression;
- horizontal scrolling for long block formulas on narrow screens.

All DRL descriptions, goals, inputs, outputs, examples, hero notes, step descriptions, and formula panels use this renderer. Content is stored as valid LaTeX with escaped backslashes.

## Step Navigation

The shared playback control gains a real step timeline:

- every step is directly clickable;
- previous, next, reset, play, pause, and speed controls remain available;
- jumping pauses playback and immediately restores the complete visual state for that step;
- completed, current, and future steps have distinct accessible states;
- the timeline scrolls horizontally on small screens and keeps the current step visible;
- buttons expose labels and keyboard focus states.

This behavior is implemented in the shared `VisualizationLayout`, so existing visualizers gain it without individual rewrites.

## Content Mapping

Existing topics are retained and reordered under the new chapters. A Monte Carlo topic is added as the missing conceptual bridge. Existing IDs remain stable to preserve links and saved progress. The former IDs `30030` through `30036` keep their URLs but receive framework-neutral titles and content.

The seven distributed-system lessons become:

1. Distributed LLM RL system overview
2. Centralized orchestration and worker groups
3. Distributed on-policy training loop
4. Actor and rollout generation
5. Critic and advantage estimation
6. Reward services and verifiable rewards
7. Training-inference resource switching and parameter resharding

## Error Handling

- Unknown lesson IDs show a clear recovery link.
- Invalid formulas render their source text instead of crashing the lesson.
- Empty or invalid generated step sets show a readable empty state.
- A registry/data consistency check ensures every DRL catalog entry resolves to a visualizer.

## Verification

Acceptance requires:

- TypeScript and Vite production build passes.
- Lint passes or existing unrelated lint debt is reported separately.
- Every DRL ID resolves without a development-placeholder message.
- No visible `verl Framework` category or branded core lesson title remains.
- Inline and block formulas render as KaTeX, with no raw delimiters visible.
- Clicking arbitrary past and future steps updates both description and visual state.
- Desktop and mobile screenshots show no overlapping controls, clipped formulas, or inaccessible panes.
- Browser console remains free of runtime errors on the DRL catalog and representative lesson pages.

## Source

Primary curriculum reference: https://github.com/wangshusen/DRL
