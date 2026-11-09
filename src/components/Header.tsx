import { whatsappLink } from "@/lib/site";

const links = [
  { href: "#produtos", label: "Produtos" },
  { href: "#etapas", label: "Como fabricamos" },
  { href: "#materiais", label: "Materiais" },
  { href: "#qualidade", label: "Qualidade" },
  { href: "#contato", label: "Contato" },
];

export const Header = () => (
  <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-ink/75 px-5 py-3 backdrop-blur-md md:px-10">
    <a href="#top" className="flex items-center gap-3" aria-label="Sicla Equipamentos — início">
      <img src="/brand/mark-dark.png" alt="" className="h-9 w-auto" />
      <span className="hidden font-sans text-[11px] font-medium uppercase tracking-[0.34em] text-white sm:block">
        Sicla Equipamentos
      </span>
    </a>
    <nav className="hidden items-center gap-9 md:flex">
      {links.map((l) => (
        <a key={l.href} href={l.href} className="eyebrow text-steel-200 transition-colors hover:text-white">
          {l.label}
        </a>
      ))}
    </nav>
    <a
      href={whatsappLink("Olá! Gostaria de solicitar um orçamento de caldeiraria.")}
      target="_blank"
      rel="noreferrer"
      className="btn btn-solid !px-4 !py-2.5 !text-[11px]"
    >
      Orçamento
    </a>
  </header>
);
