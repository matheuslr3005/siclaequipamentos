type Item = { code: string; title: string; text: string; src: string; alt: string; className: string; pos?: string };

const items: Item[] = [
  {
    code: "01",
    title: "Painéis tubulares e trocadores",
    text: "Painéis de tubos soldados, coletores e conexões flangeadas, identificados peça a peça.",
    src: "/produtos/painel.jpg",
    alt: "Painel tubular de grande porte com coletores e a plaqueta SICLA, dentro da fábrica",
    className: "lg:col-span-5 lg:row-span-2 h-[34rem] lg:h-auto",
  },
  {
    code: "02",
    title: "Serpentinas tubulares",
    text: "Tubos calandrados em espiral, com coletores e suportes soldados.",
    src: "/produtos/serpentina.jpg",
    alt: "Serpentina de tubos de aço calandrados formando um anel",
    className: "lg:col-span-7 h-[22rem] lg:h-[27rem]",
    pos: "50% 55%",
  },
  {
    code: "03",
    title: "Tampas e chapas reforçadas",
    text: "Chapas circulares com nervuras e olhais de içamento.",
    src: "/produtos/tampa.jpg",
    alt: "Tampa circular de aço com nervuras radiais e braços de içamento",
    className: "lg:col-span-4 h-[26rem] lg:h-[27rem]",
    pos: "50% 40%",
  },
  {
    code: "04",
    title: "Cones e silos",
    text: "Cascos cônicos com flanges e reforços, prontos para transporte.",
    src: "/produtos/cone.jpg",
    alt: "Casco cônico de aço com flange reforçada sobre carreta",
    className: "lg:col-span-3 h-[26rem] lg:h-[27rem]",
    pos: "60% 50%",
  },
];

const others = ["Vasos de pressão", "Tanques e reservatórios", "Skids e estruturas", "Dutos e chaminés"];

export const Products = () => (
  <section id="produtos" className="relative bg-paper py-24 text-ink md:py-36">
    <div className="mx-auto max-w-[88rem] px-5 md:px-10">
      <div data-reveal>
        <p className="eyebrow text-sicla">O que fabricamos</p>
        <h2 className="font-display mt-4 text-[clamp(2.6rem,6.4vw,6.6rem)]">
          <span className="block lg:whitespace-nowrap">Feito sob medida,</span>
          <em className="block text-sicla lg:whitespace-nowrap">do desenho à entrega.</em>
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-steel-600">
          Cada peça nasce do projeto do cliente. Alguns dos equipamentos que já saíram da nossa fábrica:
        </p>
      </div>

      <div className="mt-14 grid gap-3 lg:grid-cols-12">
        {items.map((it, i) => (
          <figure
            key={it.code}
            data-reveal
            data-delay={(i % 2) * 0.08}
            className={`group relative overflow-hidden bg-steel-800 ${it.className}`}
          >
            <img
              src={it.src}
              alt={it.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
              style={{ objectPosition: it.pos ?? "50% 50%" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
              <span className="eyebrow text-arc">{it.code}</span>
              <h3 className="font-display mt-2 text-[clamp(1.8rem,2.6vw,2.6rem)]">{it.title}</h3>
              <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-white/80">{it.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div data-reveal className="mt-14 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-ink/20 pt-6">
        <span className="eyebrow text-steel-400">Também fabricamos</span>
        {others.map((o) => (
          <span key={o} className="font-display text-2xl text-ink/80 md:text-3xl">
            {o}
          </span>
        ))}
      </div>
    </div>
  </section>
);
