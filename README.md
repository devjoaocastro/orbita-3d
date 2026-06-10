# ÓRBITA® — Agência Criativa 3D

Site one-page completamente 3D, com a câmara a viajar por um mundo WebGL
enquanto se faz scroll. Construído com React Three Fiber.

## Stack

- **Vite + React 19 + TypeScript**
- **three.js + @react-three/fiber** — cena 3D
- **@react-three/drei** — `ScrollControls` (scroll → câmara), `Float`, `Sparkles`, `Environment`
- **@react-three/postprocessing** — Bloom, Noise (grão), Vignette
- **maath** — easing/damping das animações

## Correr

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + build de produção
```

## Estrutura

| Ficheiro | O quê |
|---|---|
| `src/App.tsx` | Canvas, ScrollControls, header fixo, barra de progresso |
| `src/components/Experience.tsx` | Mundo 3D: rig da câmara, 6 secções, luzes, post FX |
| `src/components/Interface.tsx` | Conteúdo HTML sobreposto (tipografia, listas, CTAs) |
| `src/scrollBus.ts` | Liga botões DOM (nav/CTA) ao scroll do canvas |
| `src/styles.css` | Design system: Unbounded + Space Grotesk, blend modes |

## Interações 3D

- **Hero** — blob líquido que muda de cor/distorção ao hover; anéis wireframe ligados ao scroll
- **Manifesto** — giroscópio de anéis que acelera ao hover
- **Serviços** — 4 primitivas flutuantes que crescem e giram ao hover
- **Trabalho** — cartões 3D **com imagens curadas (Unsplash)** que levantam e inclinam-se para o cursor (fallback colorido se offline)
- **Estúdio** — galáxia de 2 400 partículas com núcleo brilhante
- **Contacto** — torus knot metálico; **clicar dá-lhe um impulso de rotação**

## Awwwards layer

- **Cometa de luz** que percorre uma linha a serpentear por todas as
  secções, conduzido pelo scroll, com trail néon (`drei <Trail>`) + bloom
- **Cursor custom** (ponto + anel com lag) que expande sobre interativos
  DOM e 3D, em `mix-blend-mode: difference`
- **Marquees infinitos** com texto outline gigante (Manifesto e Contact)
- **Números fantasma** outline por secção (`data-num` + `::before`)
- **Scroll hint** animado no hero; entrada do hero com stagger
- Paralaxe da câmara com o rato, partículas ambiente em todo o percurso,
  cada secção escala/roda ao entrar/sair do viewport
- Copy em **EN**
