const steps = [
  { t: "Material rastreado", d: "Certificados de cada corrida de aço e identificação das peças ao longo de toda a fabricação." },
  { t: "Soldagem qualificada", d: "Procedimentos e soldadores qualificados antes de a primeira peça ser unida." },
  { t: "Ensaios", d: "Inspeção visual, líquido penetrante e outros ensaios, conforme exigido pelo projeto." },
  { t: "Teste e dossiê", d: "Teste hidrostático e documentação completa entregues junto com o equipamento." },
];

export const Quality = () => (
  <section id="qualidade" className="relative overflow-hidden bg-sicla py-24 text-white md:py-36">
    <img
      src="/brand/mark-dark.png"
      alt=""
      aria-hidden
      className="pointer-events-none absolute -right-24 -top-10 w-[34rem] opacity-[0.07] md:-right-10"
    />
    <div className="relative mx-auto max-w-[88rem] px-5 md:px-10">
      <div data-reveal className="max-w-3xl">
        <p className="eyebrow text-white/70">Qualidade</p>
        <h2 className="font-display mt-4 text-[clamp(3rem,7vw,7rem)]">
          Cada cordão de solda tem <em>rastro e responsável.</em>
        </h2>
      </div>
      <ol className="mt-20 grid gap-px bg-white/25 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.t} data-reveal data-delay={i * 0.08} className="flex min-h-72 flex-col justify-between bg-sicla p-8">
            <span className="font-display outline-num text-7xl [--outline:rgb(255_255_255/0.55)]">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="font-display text-3xl">{s.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/80">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
