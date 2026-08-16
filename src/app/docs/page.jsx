"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Workflow,
  Bot,
  ShieldCheck,
  Wrench,
  BookMarked,
  Settings,
  Mic,
  Search,
  Copy,
  CheckCircle2,
  FileJson,
  ArrowRight,
} from "lucide-react";
import docs from "@/data/auroraDocs.json";

const ICONS = {
  Workflow,
  Bot,
  ShieldCheck,
  Wrench,
  BookMarked,
  Settings,
  Mic,
};

const CodeBlock = ({ value }) => (
  <pre className="max-h-80 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11.5px] leading-relaxed text-slate-200">
    <code>{JSON.stringify(value, null, 2)}</code>
  </pre>
);

const SectionCard = ({ section }) => {
  const Icon = ICONS[section.icon] || Workflow;
  return (
    <section id={section.id} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
            <Icon size={18} />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold tracking-tight text-slate-900">{section.label}</h2>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-500">{section.description}</p>
          </div>
        </div>
        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 sm:inline-flex">
          {section.summary}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-600">Key capabilities</h3>
            <div className="space-y-2">
              {section.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-600">How to use</h3>
            <ol className="space-y-2">
              {section.howTo.map((step, index) => (
                <li key={step} className="flex gap-2 text-[12.5px] text-slate-600">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileJson size={14} className="text-slate-500" />
              <h3 className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">JSON shape</h3>
            </div>
            <CodeBlock value={section.dataShape} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-600">Tips</h3>
            <ul className="space-y-2">
              {section.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-[12.5px] text-slate-600">
                  <ArrowRight size={13} className="mt-0.5 shrink-0 text-slate-400" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const filteredSections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return docs.sections;
    return docs.sections.filter((section) =>
      `${section.label} ${section.summary} ${section.description} ${section.features.join(" ")}`
        .toLowerCase()
        .includes(needle)
    );
  }, [query]);

  return (
    <main className="min-h-full bg-[#f8fafc] px-5 py-6 lg:px-7">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <BookOpen size={13} /> {docs.meta.productName} · v{docs.meta.version}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{docs.meta.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{docs.meta.subtitle}</p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search docs..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-slate-300 focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sections</p>
              <nav className="space-y-1">
                {docs.sections.map((section) => {
                  const Icon = ICONS[section.icon] || Workflow;
                  return (
                    <a key={section.id} href={`#${section.id}`} className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                      <Icon size={14} className="text-slate-400" />
                      <span>{section.label}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Copy size={14} className="text-slate-500" />
                <h2 className="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Docs JSON template</h2>
              </div>
              <p className="mb-3 text-[11.5px] leading-relaxed text-slate-500">Use this schema to add new documentation sections.</p>
              <CodeBlock value={docs.docTemplate} />
            </div>
          </aside>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-[16px] font-semibold text-slate-900">{docs.quickStart.title}</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {docs.quickStart.steps.map((step, index) => (
                  <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">{index + 1}</span>
                    <h3 className="text-[13px] font-semibold text-slate-800">{step.title}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{step.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {filteredSections.map((section) => <SectionCard key={section.id} section={section} />)}

            {filteredSections.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="text-sm font-medium text-slate-600">No docs found</p>
                <p className="mt-1 text-xs text-slate-400">Try a different search term.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
