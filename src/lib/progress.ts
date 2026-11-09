/** Estado mutável compartilhado entre o scroll (GSAP) e a cena 3D (useFrame). */
export const build = {
  /** 0 → 1 ao longo da seção de montagem. */
  progress: 0,
  /** versão suavizada de progress (a cena escreve aqui). */
  smooth: 0,
};

export type Stage = {
  id: string;
  index: string;
  title: string;
  from: number;
  to: number;
  text: string;
  spec: [string, string][];
};

export const stages: Stage[] = [
  {
    id: "chapa",
    index: "01",
    title: "Chapa",
    from: 0,
    to: 0.12,
    text: "Tudo começa em aço bruto, com rastreio de corrida e certificado de material.",
    spec: [
      ["Material", "Aço carbono / inox"],
      ["Espessura", "6 a 50 mm"],
    ],
  },
  {
    id: "calandra",
    index: "02",
    title: "Calandragem",
    from: 0.12,
    to: 0.34,
    text: "A chapa é curvada em rolos até virar virola, no raio exato do projeto.",
    spec: [
      ["Processo", "Calandra de 3 rolos"],
      ["Tolerância", "Ovalização controlada"],
    ],
  },
  {
    id: "solda",
    index: "03",
    title: "Soldagem",
    from: 0.34,
    to: 0.5,
    text: "Cordões longitudinais e circunferenciais, com procedimento qualificado.",
    spec: [
      ["Processo", "TIG · MIG · Arco submerso"],
      ["Inspeção", "Visual + líquido penetrante"],
    ],
  },
  {
    id: "tampos",
    index: "04",
    title: "Tampos",
    from: 0.5,
    to: 0.66,
    text: "Tampos elípticos 2:1 encaixam nas extremidades e fecham o vaso.",
    spec: [
      ["Geometria", "Elíptico 2:1"],
      ["União", "Solda de topo"],
    ],
  },
  {
    id: "bocais",
    index: "05",
    title: "Bocais e boca de visita",
    from: 0.66,
    to: 0.8,
    text: "Bocais flangeados, boca de visita e conexões de instrumentação.",
    spec: [
      ["Flanges", "ANSI / DIN"],
      ["Acesso", "Boca de visita"],
    ],
  },
  {
    id: "suportes",
    index: "06",
    title: "Selas e suportes",
    from: 0.8,
    to: 0.9,
    text: "Selas dimensionadas para o peso em operação e para a carga de teste.",
    spec: [
      ["Fixação", "Chumbadores"],
      ["Apoio", "Selas bipartidas"],
    ],
  },
  {
    id: "entrega",
    index: "07",
    title: "Pintura e entrega",
    from: 0.9,
    to: 1,
    text: "Jateamento, pintura, teste e dossiê. O equipamento sai pronto para operar.",
    spec: [
      ["Preparo", "Jato abrasivo"],
      ["Entrega", "Data book completo"],
    ],
  },
];
