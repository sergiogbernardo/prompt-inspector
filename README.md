# Prompt Inspector

Prompt Inspector is a browser-based prompt evaluator. Paste a prompt, get a
score, inspect the quality matrix, find missing dimensions and generate a more
structured version.

Everything runs locally in the browser. There is no backend, no account and no
API key.

## Methodology

The app evaluates prompts across twelve dimensions:

- **Role / expertise** — who the model should be.
- **Objective** — the main result expected.
- **Context** — scenario, audience, constraints and assumptions.
- **Input** — what data or content the model will receive.
- **Detailed task** — concrete steps or checks.
- **Quality criteria** — what makes the answer good.
- **Analysis process** — compare, validate assumptions and surface uncertainty.
- **Constraints / negatives** — what not to do or assume.
- **Output format** — Markdown, JSON, table, checklist, code, etc.
- **Minimum deliverables** — what must appear in the answer.
- **Tone and audience** — technical level and communication style.
- **Final validation** — last pass for gaps, risks and missing information.

## Features

- 0-100 prompt score.
- Matrix-style diagnostic per dimension.
- Prioritized gap list.
- Heuristic prompt rewrite.
- Copy improved prompt or full Markdown report.
- Local history with `localStorage`.
- Matrix visual background.

## Stack

React + TypeScript + Vite + Tailwind CSS. Designed for GitHub Pages.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The Vite `base` is `/prompt-inspector/` to match GitHub Pages. Deployment is
automated by `.github/workflows/deploy.yml` on every push to `main`.

## Limitations

This first version uses transparent local heuristics. It does not call an LLM,
so it evaluates structure and prompt completeness rather than deep semantic
quality.
