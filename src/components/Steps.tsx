"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { stages } from "@/lib/progress";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const Steps = () => {
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: list.current, start: "top 65%", end: "bottom 65%", scrub: true },
        },
      );
    },
    { scope: list },
  );

  return (
    <section id="etapas" className="brushed relative py-24 md:py-36">
      <div className="mx-auto max-w-[88rem] px-5 md:px-10">
        <div data-reveal className="max-w-4xl">
          <p className="eyebrow text-arc">Como fabricamos</p>
          <h2 className="font-display mt-4 text-[clamp(3rem,7vw,7rem)] text-white">
            Da chapa à entrega, em <em className="text-sicla-bright">sete etapas.</em>
          </h2>
        </div>

        <ol ref={list} className="relative mt-20">
          <div className="absolute bottom-0 left-[6px] top-0 w-px bg-white/10">
            <div ref={line} className="h-full origin-top bg-gradient-to-b from-sicla-bright via-sicla-bright to-arc" />
          </div>
          {stages.map((s) => (
            <li key={s.id} data-reveal className="relative isolate border-t border-white/10">
              {/* foto de fundo, bem leve */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -inset-x-5 -z-10 overflow-hidden md:-inset-x-10 [mask-image:linear-gradient(90deg,transparent,black_18%,black_82%,transparent)]"
              >
                <img
                  src={`/etapas/${s.id}.jpg`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover opacity-[0.18]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-steel-900/70 via-transparent to-steel-900/70" />
              </div>
              <div className="relative grid gap-5 py-10 pl-10 md:grid-cols-[9rem_1.2fr_1fr] md:gap-10 md:py-16 md:pl-16">
                <span className="absolute left-0 top-12 h-[13px] w-[13px] rotate-45 border border-sicla-bright bg-ink md:top-[4.5rem]" />
                <span className="font-display outline-num text-[clamp(4.5rem,9vw,8.5rem)]">{s.index}</span>
                <div>
                  <h3 className="font-display text-[clamp(2.2rem,4vw,3.8rem)] text-white">{s.title}</h3>
                  <p className="mt-4 max-w-lg text-lg leading-relaxed text-steel-200">{s.text}</p>
                </div>
                <dl className="grid content-start gap-5 sm:grid-cols-2 md:grid-cols-1">
                  {s.spec.map(([k, v]) => (
                    <div key={k} className="border-l-2 border-sicla-bright/70 pl-4">
                      <dt className="eyebrow text-steel-400">{k}</dt>
                      <dd className="mt-1 font-mono text-sm text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
