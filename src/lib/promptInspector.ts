export type CategoryId =
  | 'role'
  | 'objective'
  | 'context'
  | 'input'
  | 'task'
  | 'quality'
  | 'reasoning'
  | 'constraints'
  | 'output'
  | 'deliverables'
  | 'tone'
  | 'validation';

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  shortLabel: string;
  weight: number;
  question: string;
  hints: string[];
  patterns: RegExp[];
  booster?: (prompt: string) => number;
}

export interface CategoryScore extends CategoryDefinition {
  score: number;
  status: 'missing' | 'partial' | 'strong';
  evidence: string;
  recommendation: string;
}

export interface InspectionResult {
  score: number;
  grade: 'Fraco' | 'Basico' | 'Bom' | 'Forte' | 'Excelente';
  summary: string;
  categories: CategoryScore[];
  gaps: string[];
  improvedPrompt: string;
}

const containsAny = (prompt: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(prompt));

const countHits = (prompt: string, patterns: RegExp[]) =>
  patterns.reduce((total, pattern) => total + (pattern.test(prompt) ? 1 : 0), 0);

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'role',
    label: 'Papel / Especialidade',
    shortLabel: 'Papel',
    weight: 8,
    question: 'O prompt define quem o modelo deve ser?',
    hints: ['especialista em...', 'aja como...', 'voce e...', 'atue como...'],
    patterns: [/aja como/i, /atue como/i, /voce e/i, /especialista/i, /consultor/i, /analista/i, /engenheiro/i],
  },
  {
    id: 'objective',
    label: 'Objetivo',
    shortLabel: 'Objetivo',
    weight: 12,
    question: 'Existe um resultado central claro?',
    hints: ['objetivo', 'preciso que', 'quero que', 'crie', 'analise', 'explique'],
    patterns: [/objetivo/i, /preciso que/i, /quero que/i, /crie/i, /analise/i, /explique/i, /gere/i, /resuma/i],
    booster: (prompt) => (prompt.trim().split(/\s+/).length > 20 ? 2 : 0),
  },
  {
    id: 'context',
    label: 'Contexto',
    shortLabel: 'Contexto',
    weight: 12,
    question: 'O modelo recebe informacoes de fundo suficientes?',
    hints: ['contexto', 'cenario', 'publico', 'empresa', 'situacao', 'premissas'],
    patterns: [/contexto/i, /cenario/i, /publico/i, /empresa/i, /situacao/i, /premissas/i, /background/i],
  },
  {
    id: 'input',
    label: 'Entrada',
    shortLabel: 'Entrada',
    weight: 8,
    question: 'O prompt explica quais dados serao fornecidos?',
    hints: ['entrada', 'dados', 'texto abaixo', 'arquivo', 'codigo', 'logs'],
    patterns: [/entrada/i, /dados/i, /texto abaixo/i, /arquivo/i, /codigo/i, /logs?/i, /conteudo/i],
  },
  {
    id: 'task',
    label: 'Tarefa Detalhada',
    shortLabel: 'Tarefa',
    weight: 12,
    question: 'A tarefa esta quebrada em acoes verificaveis?',
    hints: ['passo a passo', 'etapas', 'verifique', 'compare', 'identifique', 'liste'],
    patterns: [/passo a passo/i, /etapas/i, /verifique/i, /compare/i, /identifique/i, /liste/i, /classifique/i],
    booster: (prompt) => (/\n\s*[-*0-9]/.test(prompt) ? 2 : 0),
  },
  {
    id: 'quality',
    label: 'Criterios de Qualidade',
    shortLabel: 'Qualidade',
    weight: 10,
    question: 'O prompt diz como avaliar uma boa resposta?',
    hints: ['criterios', 'considere bom se', 'priorize', 'precisao', 'clareza'],
    patterns: [/criterios?/i, /qualidade/i, /priorize/i, /precisao/i, /clareza/i, /completo/i, /evidencias/i],
  },
  {
    id: 'reasoning',
    label: 'Processo de Analise',
    shortLabel: 'Analise',
    weight: 8,
    question: 'O prompt orienta o modelo a analisar antes de responder?',
    hints: ['analise antes', 'avalie', 'pense nas premissas', 'compare opcoes'],
    patterns: [/analise antes/i, /avalie/i, /premissas/i, /compare opcoes/i, /incertezas/i, /trade-?offs/i],
  },
  {
    id: 'constraints',
    label: 'Restricoes / Negativos',
    shortLabel: 'Restricoes',
    weight: 8,
    question: 'O prompt fala o que evitar ou nao assumir?',
    hints: ['nao', 'evite', 'sem', 'nao invente', 'nao assuma', 'limite'],
    patterns: [/nao /i, /evite/i, /sem /i, /nao invente/i, /nao assuma/i, /limite/i, /restri/i],
  },
  {
    id: 'output',
    label: 'Formato de Saida',
    shortLabel: 'Saida',
    weight: 8,
    question: 'A saida esperada esta especificada?',
    hints: ['formato', 'saida', 'markdown', 'json', 'tabela', 'bullets'],
    patterns: [/formato/i, /saida/i, /markdown/i, /json/i, /tabela/i, /bullets?/i, /topicos/i],
  },
  {
    id: 'deliverables',
    label: 'Entregaveis Minimos',
    shortLabel: 'Entregaveis',
    weight: 6,
    question: 'Existe uma lista do que obrigatoriamente deve aparecer?',
    hints: ['entregaveis', 'inclua', 'deve conter', 'obrigatorio', 'minimo'],
    patterns: [/entregaveis/i, /inclua/i, /deve conter/i, /obrigatorio/i, /minimo/i, /retorne/i],
  },
  {
    id: 'tone',
    label: 'Tom e Publico',
    shortLabel: 'Tom',
    weight: 4,
    question: 'O prompt define linguagem, publico ou nivel tecnico?',
    hints: ['tom', 'publico', 'iniciante', 'executivo', 'tecnico', 'formal'],
    patterns: [/tom/i, /publico/i, /iniciante/i, /executivo/i, /tecnico/i, /formal/i, /didatico/i],
  },
  {
    id: 'validation',
    label: 'Validacao Final',
    shortLabel: 'Validacao',
    weight: 4,
    question: 'O modelo deve revisar lacunas antes de finalizar?',
    hints: ['revise', 'valide', 'auto-checagem', 'aponte lacunas', 'pergunte se faltar'],
    patterns: [/revise/i, /valide/i, /auto-?checagem/i, /lacunas/i, /pergunte/i, /se faltar/i],
  },
];

const recommendations: Record<CategoryId, string> = {
  role: 'Defina um papel claro para calibrar conhecimento, profundidade e postura.',
  objective: 'Declare o resultado principal em uma frase objetiva.',
  context: 'Inclua cenario, publico, restricoes do negocio e premissas relevantes.',
  input: 'Explique qual conteudo sera analisado e onde ele aparece no prompt.',
  task: 'Quebre a tarefa em etapas observaveis para reduzir ambiguidade.',
  quality: 'Diga quais criterios tornam a resposta boa: precisao, clareza, cobertura e evidencias.',
  reasoning: 'Oriente o modelo a comparar, explicitar premissas e apontar incertezas sem expor raciocinio interno longo.',
  constraints: 'Liste o que evitar: inventar dados, assumir contexto ausente, fugir do escopo ou usar formato errado.',
  output: 'Especifique o formato final: Markdown, JSON, tabela, checklist, resumo executivo ou codigo.',
  deliverables: 'Defina os itens obrigatorios que a resposta deve conter.',
  tone: 'Indique publico e tom para ajustar linguagem e nivel tecnico.',
  validation: 'Peça uma checagem final de lacunas, riscos e perguntas pendentes.',
};

export function inspectPrompt(prompt: string): InspectionResult {
  const trimmed = prompt.trim();
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const categories = CATEGORIES.map<CategoryScore>((category) => {
    const hits = countHits(normalized, category.patterns);
    const raw = Math.min(category.weight, hits * (category.weight / 2) + (category.booster?.(normalized) ?? 0));
    const score = trimmed ? Math.round(raw) : 0;
    const ratio = score / category.weight;
    const status = ratio >= 0.75 ? 'strong' : ratio >= 0.35 ? 'partial' : 'missing';

    return {
      ...category,
      score,
      status,
      evidence:
        status === 'strong'
          ? 'Sinal forte encontrado.'
          : status === 'partial'
            ? 'Existe algum sinal, mas ainda falta especificidade.'
            : 'Nao encontrei sinal claro desta dimensao.',
      recommendation: recommendations[category.id],
    };
  });

  const score = Math.min(
    100,
    Math.round(categories.reduce((total, category) => total + category.score, 0)),
  );

  const grade =
    score >= 90 ? 'Excelente' : score >= 80 ? 'Forte' : score >= 60 ? 'Bom' : score >= 40 ? 'Basico' : 'Fraco';

  const gaps = categories
    .filter((category) => category.status !== 'strong')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)
    .map((category) => category.recommendation);

  return {
    score,
    grade,
    summary: buildSummary(score, categories, trimmed),
    categories,
    gaps,
    improvedPrompt: buildImprovedPrompt(trimmed, categories),
  };
}

function buildSummary(score: number, categories: CategoryScore[], prompt: string) {
  if (!prompt) return 'Cole um prompt para calcular a matriz de qualidade.';

  const strong = categories.filter((category) => category.status === 'strong').length;
  const missing = categories.filter((category) => category.status === 'missing').length;

  if (score >= 80) {
    return `Prompt forte: ${strong} dimensoes bem cobertas. A melhoria agora esta nos detalhes de validacao e formato.`;
  }

  if (score >= 60) {
    return `Prompt bom, mas ainda irregular: ${missing} dimensoes ausentes ou fracas podem gerar resposta incompleta.`;
  }

  return `Prompt com risco alto de resposta generica. Priorize objetivo, contexto, tarefa e formato de saida.`;
}

function inferObjective(prompt: string) {
  if (!prompt) return '[descreva em uma frase o resultado que voce quer]';
  const firstLine = prompt
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);
  return firstLine ? firstLine.replace(/^[-*#\s]+/, '') : '[descreva em uma frase o resultado que voce quer]';
}

function buildImprovedPrompt(prompt: string, categories: CategoryScore[]) {
  const missing = (id: CategoryId) => categories.find((category) => category.id === id)?.status !== 'strong';
  const original = prompt || '[cole aqui o pedido original]';

  return [
    '# Papel',
    missing('role')
      ? 'Atue como um especialista no assunto, com postura critica, objetiva e orientada a resultado.'
      : '[mantenha o papel definido no prompt original].',
    '',
    '# Objetivo',
    inferObjective(prompt),
    '',
    '# Contexto',
    missing('context')
      ? 'Contexto disponivel: [adicione publico-alvo, cenario, restricoes, dados importantes e premissas].'
      : '[use o contexto fornecido no prompt original].',
    '',
    '# Entrada',
    'Analise a entrada abaixo e use apenas as informacoes fornecidas, sinalizando quando algo estiver ausente.',
    '',
    '```text',
    original,
    '```',
    '',
    '# Tarefa',
    '- Identifique o pedido principal.',
    '- Separe requisitos explicitos de premissas implicitas.',
    '- Aponte lacunas, ambiguidades e riscos de interpretacao.',
    '- Produza a resposta final seguindo o formato solicitado.',
    '',
    '# Criterios de Qualidade',
    '- Seja preciso, claro e acionavel.',
    '- Nao invente fatos, dados, fontes ou requisitos.',
    '- Explique premissas importantes e indique incertezas.',
    '- Priorize utilidade pratica em vez de resposta generica.',
    '',
    '# Restricoes',
    '- Nao fuja do escopo.',
    '- Nao assuma contexto ausente sem avisar.',
    '- Se faltar informacao essencial, faça ate 3 perguntas objetivas antes de concluir.',
    '',
    '# Saida',
    missing('output')
      ? 'Responda em Markdown, com secoes curtas, checklist de lacunas e proximos passos.'
      : '[mantenha o formato de saida solicitado no prompt original].',
    '',
    '# Validacao Final',
    'Antes de finalizar, revise se a resposta cobre objetivo, contexto, tarefa, restricoes e entregaveis minimos.',
  ].join('\n');
}

export function exportMarkdown(result: InspectionResult, sourcePrompt: string) {
  const categoryLines = result.categories
    .map((category) => `- ${category.label}: ${category.score}/${category.weight} (${category.status})`)
    .join('\n');

  const gaps = result.gaps.map((gap) => `- ${gap}`).join('\n');

  return [
    '# Prompt Inspector',
    '',
    `Score: ${result.score}/100`,
    `Classificacao: ${result.grade}`,
    '',
    '## Resumo',
    result.summary,
    '',
    '## Matriz',
    categoryLines,
    '',
    '## Lacunas Prioritarias',
    gaps || '- Nenhuma lacuna prioritaria.',
    '',
    '## Prompt Original',
    '```text',
    sourcePrompt.trim(),
    '```',
    '',
    '## Prompt Melhorado',
    result.improvedPrompt,
  ].join('\n');
}

export function hasPromptStructure(prompt: string) {
  return containsAny(prompt, [/^#/m, /\n\s*[-*]\s+/m, /```/]);
}
