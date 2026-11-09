"use client";

import { useState } from "react";
import { site, whatsappLink } from "@/lib/site";

const types = ["Vaso de pressão", "Tanque / reservatório", "Trocador de calor", "Silo / funil", "Skid / estrutura", "Dutos / chaminé", "Outro"];

const field =
  "w-full border-b border-ink/25 bg-transparent py-3 text-lg text-ink outline-none transition-colors placeholder:text-steel-400 focus:border-sicla";

export const Contact = () => {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const msg = [
      "Olá! Vim pelo site e gostaria de um orçamento.",
      `Nome: ${f.get("nome")}`,
      `Empresa: ${f.get("empresa")}`,
      `Telefone: ${f.get("telefone")}`,
      `E-mail: ${f.get("email")}`,
      `Equipamento: ${f.get("tipo")}`,
      `Detalhes: ${f.get("detalhes")}`,
    ].join("\n");
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  return (
    <section id="contato" className="brushed relative py-24 text-white md:py-36">
      <div className="relative mx-auto grid max-w-[88rem] gap-16 px-5 md:px-10 lg:grid-cols-[1fr_1.05fr]">
        <div data-reveal>
          <p className="eyebrow text-sicla-bright">Orçamento</p>
          <h2 className="font-display mt-4 text-[clamp(3rem,7vw,7rem)]">
            Conte o que você precisa. A gente responde com <em className="text-sicla-bright">prazo e proposta.</em>
          </h2>
          <dl className="mt-14 space-y-6">
            <div>
              <dt className="eyebrow text-steel-400">WhatsApp</dt>
              <dd className="mt-1 font-mono text-lg text-white">
                <a className="hover:text-sicla-bright" href={whatsappLink("Olá! Vim pelo site da Sicla.")} target="_blank" rel="noreferrer">
                  Falar agora
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-steel-400">E-mail</dt>
              <dd className="mt-1 font-mono text-lg text-white">
                <a className="hover:text-sicla-bright" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-steel-400">Onde estamos</dt>
              <dd className="mt-1 font-mono text-lg text-white">{site.city}</dd>
            </div>
          </dl>
        </div>

        <form data-reveal data-delay="0.1" onSubmit={onSubmit} className="space-y-9 bg-white p-8 text-ink md:p-12">
          <div className="grid gap-9 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow text-steel-400">Nome</span>
              <input name="nome" required className={field} placeholder="Seu nome" />
            </label>
            <label className="block">
              <span className="eyebrow text-steel-400">Empresa</span>
              <input name="empresa" className={field} placeholder="Nome da empresa" />
            </label>
          </div>
          <div className="grid gap-9 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow text-steel-400">Telefone / WhatsApp</span>
              <input name="telefone" type="tel" required className={field} placeholder="(00) 00000-0000" autoComplete="tel" />
            </label>
            <label className="block">
              <span className="eyebrow text-steel-400">E-mail</span>
              <input name="email" type="email" required className={field} placeholder="voce@empresa.com.br" autoComplete="email" />
            </label>
          </div>
          <label className="block">
            <span className="eyebrow text-steel-400">Equipamento</span>
            <select name="tipo" className={`${field} appearance-none`} defaultValue={types[0]}>
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow text-steel-400">Detalhes do projeto</span>
            <textarea
              name="detalhes"
              rows={4}
              className={`${field} resize-none`}
              placeholder="Medidas, material, pressão de trabalho, prazo..."
            />
          </label>
          <button type="submit" className="btn btn-solid w-full justify-center">
            {sent ? "Abrimos o WhatsApp — enviar de novo" : "Enviar pelo WhatsApp"}
          </button>
        </form>
      </div>
    </section>
  );
};
