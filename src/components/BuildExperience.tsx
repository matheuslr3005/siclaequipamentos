"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { build, stages } from "@/lib/progress";
import { whatsappLink } from "@/lib/site";

const VesselScene = dynamic(() => import("./VesselScene"), { ssr: false });

const DURATION = 14; // segundos para montar o equipamento inteiro

const stageAt = (p: number) => {
  const i = stages.findIndex((s) => p >= s.from && p < s.to);
  return i === -1 ? stages.length - 1 : i;
};

export const BuildExperience = () => {
  const section = useRef<HTMLElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(false);
  const [inView, setInView] = useState(true);

  const play = () => {
    tween.current?.kill();
    build.progress = 0;
    build.smooth = 0;
    setDone(false);
    setActive(0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      build.progress = 1;
      build.smooth = 1;
      setActive(stages.length - 1);
      setDone(true);
      return;
    }
    tween.current = gsap.to(build, {
      progress: 1,
      duration: DURATION,
      ease: "none",
      delay: 1,
      onUpdate: () => {
        const p = build.progress;
        setActive((prev) => {
          const next = stageAt(p);
          return prev === next ? prev : next;
        });
      },
      onComplete: () => setDone(true),
    });
  };

  useEffect(() => {
    play();
    return () => {
      tween.current?.kill();
    };
  }, []);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stage = stages[active];

  return (
    <section ref={section} id="top" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <VesselScene active={inView} />
      </div>

      {/* leitura do texto sobre a cena */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_50%,transparent_35%,#07090c_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-ink via-ink/70 to-transparent lg:block" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-ink via-ink/80 to-transparent lg:hidden" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      {/* texto */}
      <div className="relative z-10 flex h-full flex-col justify-start px-5 pt-24 md:px-10 lg:justify-center lg:pb-24 lg:pt-16">
        <div className="max-w-[44rem] lg:max-w-[40rem]">
          <p className="eyebrow mb-4 text-sicla-bright">Caldeiraria de alta qualidade</p>
          <h1 className="font-display text-[clamp(3rem,min(8.4vw,14.5vh),8.4rem)] text-white">
            Do aço bruto ao equipamento <em className="text-sicla-bright">pronto.</em>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-steel-200 md:text-lg">
            A Sicla fabrica caldeiraria sob projeto. Acompanhe ao lado um equipamento sendo construído, do corte à
            pintura.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={whatsappLink("Olá! Gostaria de solicitar um orçamento de caldeiraria.")}
              target="_blank"
              rel="noreferrer"
              className="btn btn-solid"
            >
              Solicitar orçamento
            </a>
            <a href="#produtos" className="btn btn-line">
              O que fabricamos
            </a>
          </div>
        </div>
      </div>

      {/* HUD da montagem */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 px-5 pb-7 md:px-10 md:pb-9">
        <div className="flex items-end justify-between gap-6">
          {!done && (
            <div key={stage.id} className="stage-in">
              <p className="eyebrow text-arc">
                Fabricando · etapa {stage.index}/{String(stages.length).padStart(2, "0")}
              </p>
              <p className="font-display mt-1 text-[clamp(1.6rem,3vw,2.6rem)] text-white">{stage.title}</p>
            </div>
          )}
          {done && (
            <button type="button" onClick={play} className="btn btn-line !px-4 !py-2.5 !text-[11px]">
              ↻ Ver de novo
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
