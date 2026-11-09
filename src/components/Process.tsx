"use client";

import { useRef, useState } from "react";
import gsap from "gsap";

const materials = [
  { id: "carbono", name: "Aço carbono", use: "Estruturas, tanques e vasos de uso geral" },
  { id: "inox", name: "Aço inoxidável 304 / 316L", use: "Alimentos, bebidas, química e farmacêutico" },
  { id: "baixa-liga", name: "Aços de baixa liga", use: "Serviço com temperatura e pressão elevadas" },
  { id: "outras-ligas", name: "Outras ligas", use: "Sob consulta, conforme o projeto" },
];

const processes = [
  "Corte plasma e oxicorte",
  "Calandragem e dobra",
  "Soldagem TIG, MIG e arco submerso",
  "Usinagem e furação",
  "Jateamento e pintura",
  "Teste hidrostático",
];

const CARD_W = 300;
const CARD_H = 215;

export const Process = () => {
  const card = useRef<HTMLDivElement>(null);
  const move = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!card.current) return;
    if (!move.current) {
      move.current = {
        x: gsap.quickTo(card.current, "x", { duration: 0.45, ease: "power3.out" }),
        y: gsap.quickTo(card.current, "y", { duration: 0.45, ease: "power3.out" }),
      };
    }
    // fica ao lado do cursor, sem sair da tela
    const x = Math.min(e.clientX + 32, window.innerWidth - CARD_W - 16);
    const y = Math.min(Math.max(e.clientY - CARD_H / 2, 88), window.innerHeight - CARD_H - 16);
    move.current.x(x);
    move.current.y(y);
  };

  return (
    <section id="materiais" className="relative bg-paper py-24 text-ink md:py-36">
      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <div data-reveal>
          <p className="eyebrow text-sicla">Materiais</p>
          <h2 className="font-display mt-4 text-[clamp(3rem,7vw,7rem)]">
            O aço certo para cada <em className="text-sicla">serviço.</em>
          </h2>
        </div>

        <ul
          className="mt-16 border-t-2 border-ink"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          {materials.map((m, i) => (
            <li
              key={m.id}
              data-reveal
              onMouseEnter={() => setHover(m.id)}
              className="group grid items-baseline gap-2 border-b border-ink/20 py-6 transition-colors duration-300 hover:bg-ink hover:text-white md:grid-cols-[4rem_1.2fr_1fr] md:gap-8 md:px-4 md:py-8"
            >
              <span className="font-mono text-xs text-steel-400 group-hover:text-arc">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-[clamp(2.2rem,4.6vw,4.4rem)] transition-transform duration-500 group-hover:translate-x-3">
                {m.name}
              </span>
              <span className="max-w-sm text-base leading-relaxed text-steel-600 group-hover:text-steel-200 md:justify-self-end">
                {m.use}
              </span>
              {/* em telas de toque não existe hover: mostra a foto direto */}
              <img
                src={`/materiais/${m.id}.jpg`}
                alt={m.name}
                loading="lazy"
                className="hidden aspect-[16/9] w-full max-w-sm object-cover [@media(hover:none)]:block"
              />
            </li>
          ))}
        </ul>

        {/* mini janela que acompanha o mouse */}
        <div
          ref={card}
          aria-hidden
          className={`pointer-events-none fixed left-0 top-0 z-40 overflow-hidden border border-ink/20 bg-ink shadow-[0_30px_60px_-20px_rgb(7_9_12/0.6)] transition-[opacity,scale] duration-300 [@media(hover:none)]:hidden ${
            hover ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
          style={{ width: CARD_W, height: CARD_H }}
        >
          {materials.map((m) => (
            <img
              key={m.id}
              src={`/materiais/${m.id}.jpg`}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                hover === m.id ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent p-3 pt-8">
            <span className="eyebrow text-white">{materials.find((m) => m.id === hover)?.name ?? ""}</span>
          </div>
        </div>

        <div data-reveal className="mt-24">
          <p className="eyebrow text-sicla">Processos</p>
          <p className="font-display mt-6 text-[clamp(2.2rem,5vw,5rem)] leading-[1.02] text-ink/25">
            {processes.map((p, i) => (
              <span key={p}>
                <span className="transition-colors duration-300 hover:text-sicla">{p}</span>
                {i < processes.length - 1 && <span className="mx-3 text-arc md:mx-5">/</span>}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
};
