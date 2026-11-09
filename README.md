# Sicla Equipamentos — site

Next.js + React Three Fiber + GSAP. Um vaso de pressão 3D é montado conforme o scroll.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Onde mexer

- `src/lib/site.ts` — **WhatsApp, e-mail e cidade** (os valores atuais são placeholders).
- `src/lib/progress.ts` — textos e faixas de scroll de cada etapa da fabricação.
- `src/components/VesselScene.tsx` — cena 3D (chapa → calandra → solda → tampos → bocais → selas → pintura).
- `src/components/Products.tsx`, `Process.tsx`, `Quality.tsx`, `Segments.tsx` — conteúdo das seções.
- `public/brand/` — logo em fundo transparente (versões para fundo claro e escuro).

> Os textos de materiais, processos, ensaios e segmentos são genéricos de caldeiraria e precisam ser confirmados com a Sicla.
