import { site } from "@/lib/site";

export const Footer = () => (
  <footer className="bg-ink px-5 py-14 md:px-10">
    <div className="mx-auto flex max-w-[88rem] flex-col gap-10 md:flex-row md:items-end md:justify-between">
      <div className="flex items-center gap-5">
        <img src="/brand/logo-dark.png" alt="Sicla Equipamentos" className="h-28 w-auto" />
      </div>
      <nav className="eyebrow flex flex-wrap gap-x-8 gap-y-3 text-steel-300">
        <a href="#produtos" className="hover:text-white">Produtos</a>
        <a href="#etapas" className="hover:text-white">Como fabricamos</a>
        <a href="#materiais" className="hover:text-white">Materiais</a>
        <a href="#qualidade" className="hover:text-white">Qualidade</a>
        <a href="#contato" className="hover:text-white">Contato</a>
      </nav>
    </div>
    <p className="eyebrow mx-auto mt-12 max-w-[88rem] border-t border-white/10 pt-6 text-steel-400">
      © {new Date().getFullYear()} {site.name} · {site.tagline} ·{" "}
      <a href="/creditos" className="underline-offset-4 hover:text-white hover:underline">
        Créditos das fotos
      </a>
    </p>
  </footer>
);
