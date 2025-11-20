import { VisualizationStep } from '@/types';

export function generateIsomorphicStringsSteps(s: string, t: string): VisualizationStep[] {
  const steps: VisualizationStep[] = [];
  const mapST = new Map<string, string>();
  const mapTS = new Map<string, string>();
  let stepId = 0;

  steps.push({
    id: stepId++,
    description: '初始化两个映射表：s->t 和 t->s，用于检查双向映射关系',
    data: { s, t },
    variables: { i: -1, isIsomorphic: true },
    code: '2',
  });

  for (let i = 0; i < s.length; i++) {
    const charS = s[i];
    const charT = t[i];

    steps.push({
      id: stepId++,
      description: `检查位置 ${i}：s[${i}] = '${charS}', t[${i}] = '${charT}'`,
      data: { s, t },
      variables: {
        i,
        charS,
        charT,
        mapST: Object.fromEntries(mapST),
        mapTS: Object.fromEntries(mapTS),
      },
      code: '4',
    });

    // 检查 s -> t 的映射
    if (mapST.has(charS)) {
      if (mapST.get(charS) !== charT) {
        steps.push({
          id: stepId++,
          description: `冲突！'${charS}' 已映射到 '${mapST.get(charS)}'，但现在需要映射到 '${charT}'`,
          data: { s, t },
          variables: {
            i,
            charS,
            charT,
            conflict: true,
            isIsomorphic: false,
            mapST: Object.fromEntries(mapST),
            mapTS: Object.fromEntries(mapTS),
          },
          code: '7',
        });
        return steps;
      }
    } else {
      mapST.set(charS, charT);
      steps.push({
        id: stepId++,
        description: `添加映射：'${charS}' -> '${charT}'`,
        data: { s, t },
        variables: {
          i,
          charS,
          charT,
          mapST: Object.fromEntries(mapST),
          mapTS: Object.fromEntries(mapTS),
        },
        code: '9',
      });
    }

    // 检查 t -> s 的映射
    if (mapTS.has(charT)) {
      if (mapTS.get(charT) !== charS) {
        steps.push({
          id: stepId++,
          description: `冲突！'${charT}' 已映射到 '${mapTS.get(charT)}'，但现在需要映射到 '${charS}'`,
          data: { s, t },
          variables: {
            i,
            charS,
            charT,
            conflict: true,
            isIsomorphic: false,
            mapST: Object.fromEntries(mapST),
            mapTS: Object.fromEntries(mapTS),
          },
          code: '12',
        });
        return steps;
      }
    } else {
      mapTS.set(charT, charS);
      steps.push({
        id: stepId++,
        description: `添加反向映射：'${charT}' -> '${charS}'`,
        data: { s, t },
        variables: {
          i,
          charS,
          charT,
          mapST: Object.fromEntries(mapST),
          mapTS: Object.fromEntries(mapTS),
        },
        code: '14',
      });
    }
  }

  steps.push({
    id: stepId++,
    description: '所有字符检查完成，两个字符串同构！',
    data: { s, t },
    variables: {
      isIsomorphic: true,
      finished: true,
      mapST: Object.fromEntries(mapST),
      mapTS: Object.fromEntries(mapTS),
    },
    code: '17',
  });

  return steps;
}
