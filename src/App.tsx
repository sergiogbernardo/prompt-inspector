import { useEffect, useMemo, useState } from 'react';
import MatrixRain from './components/MatrixRain';
import { exportMarkdown, hasPromptStructure, inspectPrompt, type CategoryScore } from './lib/promptInspector';

const SAMPLE_PROMPT = `Atue como um revisor senior de prompts.

Objetivo: avalie o prompt abaixo e diga como melhora-lo.

Contexto: o usuario quer usar o prompt com um LLM para gerar respostas tecnicas mais precisas.

Tarefa:
- pontue clareza, contexto, formato e restricoes;
- aponte lacunas;
- gere uma versao revisada.

Saida: responda em Markdown com score, diagnostico e prompt melhorado.

Nao invente contexto ausente. Se algo for essencial, pergunte antes.`;

interface HistoryItem {
  id: string;
  score: number;
  title: string;
  prompt: string;
  createdAt: string;
}

const STORAGE_KEY = 'prompt-inspector-history-v1';

function readHistory(): HistoryItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(items: HistoryItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 8)));
}

export default function App() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPT);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState<'improved' | 'report' | null>(null);

  const result = useMemo(() => inspectPrompt(prompt), [prompt]);
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;
  const structured = hasPromptStructure(prompt);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const saveCurrent = () => {
    const title = prompt.trim().split('\n').find(Boolean)?.slice(0, 64) || 'Prompt sem titulo';
    const next = [
      {
        id: crypto.randomUUID(),
        score: result.score,
        title,
        prompt,
        createdAt: new Date().toISOString(),
      },
      ...history.filter((item) => item.prompt !== prompt),
    ].slice(0, 8);
    setHistory(next);
    writeHistory(next);
  };

  const copyText = async (kind: 'improved' | 'report') => {
    const text = kind === 'improved' ? result.improvedPrompt : exportMarkdown(result, prompt);
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100">
      <MatrixRain />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-px bg-emerald-300/50 shadow-[0_0_24px_rgba(52,211,153,0.9)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-20 bg-emerald-400/5 blur-3xl" />

      <div className="relative z-10">
        <header className="border-b border-emerald-500/10 bg-black/75 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-300/70">Sabion Labs</p>
              <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Prompt Inspector</h1>
            </div>
            <a
              href="https://sabion.io/"
              aria-label="Hub de Projetos"
              title="Hub de Projetos"
              className="flex shrink-0 items-center transition hover:scale-105"
            >
              <img
                src={`${import.meta.env.BASE_URL}hub-icon.png`}
                alt="Hub de Projetos"
                className="h-8 w-8"
              />
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 lg:px-6">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="panel min-h-[440px]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="panel-title">Entrada</p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-white">Prompt para inspecionar</h2>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => setPrompt(SAMPLE_PROMPT)}>
                    Exemplo
                  </button>
                  <button className="btn-secondary" onClick={() => setPrompt('')}>
                    Limpar
                  </button>
                </div>
              </div>

              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                spellCheck={false}
                className="input min-h-[330px] resize-y leading-6"
                placeholder="Cole aqui o prompt que voce quer avaliar..."
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Signal label="Palavras" value={String(wordCount)} />
                <Signal label="Estrutura" value={structured ? 'detectada' : 'baixa'} />
                <Signal label="Modo" value="heuristico local" />
              </div>
            </div>

            <ScorePanel score={result.score} grade={result.grade} summary={result.summary} />
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="panel">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="panel-title">Matrix</p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-white">Dimensoes do prompt</h2>
                </div>
                <button className="btn-primary" onClick={saveCurrent}>
                  Salvar
                </button>
              </div>

              <div className="grid gap-3">
                {result.categories.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="panel">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="panel-title">Refactor</p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-white">Prompt melhorado</h2>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-secondary" onClick={() => copyText('report')}>
                      {copied === 'report' ? 'Copiado' : 'Copiar relatorio'}
                    </button>
                    <button className="btn-primary" onClick={() => copyText('improved')}>
                      {copied === 'improved' ? 'Copiado' : 'Copiar prompt'}
                    </button>
                  </div>
                </div>

                <pre className="max-h-[470px] overflow-auto rounded-lg border border-emerald-500/10 bg-slate-950/80 p-4 font-mono text-sm leading-6 text-slate-200">
                  {result.improvedPrompt}
                </pre>
              </div>

              <div className="panel">
                <p className="panel-title">Lacunas prioritarias</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {result.gaps.map((gap) => (
                    <li key={gap} className="rounded-lg border border-amber-400/15 bg-amber-400/5 px-3 py-2">
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="panel-title">Historico local</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-white">Ultimas inspecoes</h2>
              </div>
              <button
                className="btn-secondary"
                onClick={() => {
                  setHistory([]);
                  writeHistory([]);
                }}
              >
                Limpar historico
              </button>
            </div>

            {history.length ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {history.map((item) => (
                  <button
                    key={item.id}
                    className="rounded-lg border border-emerald-500/15 bg-black/50 p-4 text-left transition hover:border-emerald-300/50 hover:bg-emerald-400/5"
                    onClick={() => setPrompt(item.prompt)}
                  >
                    <span className="font-mono text-xs text-emerald-300">{item.score}/100</span>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 font-mono text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Nada salvo ainda. As inspecoes ficam apenas neste navegador.</p>
            )}
          </section>
        </main>

        <footer className="border-t border-emerald-500/10 py-6 text-center text-sm text-slate-500">
          <p className="font-mono">© {new Date().getFullYear()} Sergio Bernardo · Prompt Inspector · roda 100% no navegador</p>
        </footer>
      </div>
    </div>
  );
}

function ScorePanel({ score, grade, summary }: { score: number; grade: string; summary: string }) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <aside className="panel flex flex-col justify-between">
      <div>
        <p className="panel-title">Score</p>
        <div className="mt-6 grid place-items-center">
          <div className="relative h-40 w-40">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="52" stroke="rgba(51,65,85,0.8)" strokeWidth="10" fill="none" />
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="url(#scoreGradient)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0" x2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-4xl font-semibold text-white">{score}</p>
                <p className="font-mono text-xs uppercase tracking-wider text-emerald-300">{grade}</p>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm leading-6 text-slate-300">{summary}</p>
      </div>

      <div className="mt-6 rounded-lg border border-sky-400/15 bg-sky-400/5 p-4 text-sm text-slate-300">
        Avaliacao por heuristica local: nenhuma informacao sai do navegador.
      </div>
    </aside>
  );
}

function CategoryRow({ category }: { category: CategoryScore }) {
  const percent = Math.round((category.score / category.weight) * 100);
  const statusClass =
    category.status === 'strong'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
      : category.status === 'partial'
        ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
        : 'border-rose-400/30 bg-rose-400/10 text-rose-100';

  return (
    <article className="rounded-lg border border-emerald-500/10 bg-black/45 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{category.label}</h3>
          <p className="mt-1 text-xs text-slate-400">{category.question}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 font-mono text-[11px] uppercase ${statusClass}`}>
          {category.status}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-slate-500">
        <span>{category.evidence}</span>
        <span>
          {category.score}/{category.weight}
        </span>
      </div>
    </article>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-500/10 bg-black/50 px-3 py-2">
      <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm text-emerald-200">{value}</p>
    </div>
  );
}
