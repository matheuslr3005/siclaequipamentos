import type { Metadata } from "next";
import { credits } from "@/lib/credits";

export const metadata: Metadata = { title: "Créditos das fotos — Sicla Equipamentos" };

const Page = () => (
  <main className="mx-auto max-w-3xl px-5 py-24 md:py-32">
    <a href="/" className="eyebrow text-sicla-bright hover:text-white">
      ← Voltar ao site
    </a>
    <h1 className="font-display mt-6 text-6xl text-white">Créditos das fotos</h1>
    <p className="mt-4 text-steel-200">
      As fotos de fundo das etapas e dos materiais vêm do Wikimedia Commons, com licenças que permitem o uso. As fotos de
      produtos são da própria Sicla.
    </p>
    <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
      {credits.map((c) => (
        <li key={c.use} className="py-4">
          <a href={c.page} target="_blank" rel="noreferrer" className="text-white underline-offset-4 hover:underline">
            {c.title}
          </a>
          <p className="mt-1 font-mono text-xs text-steel-300">
            {c.artist} · {c.license}
          </p>
        </li>
      ))}
    </ul>
  </main>
);

export default Page;
