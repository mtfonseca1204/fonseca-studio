# Fonseca Studio — Portfolio

Personal portfolio for **Matheus Fonseca**, Senior Product Designer. Live at [fonseca.studio](https://fonseca.studio).

## Stack

- Static HTML, CSS, and vanilla JavaScript
- Deployed on [Vercel](https://vercel.com)
- Google Fonts: Space Grotesk, Inter, JetBrains Mono

## Site map

| Page | File |
|------|------|
| Home | `index.html` |
| Creative Side | `fun.html` |
| About | `about.html` |
| Case studies | `project-*.html` |
| 3D motion (Hedgehog) | `hedgehog-3d.html` |

## Project structure

```
Site/
├── index.html              # Homepage — selected work, clients, testimonials
├── about.html              # About page
├── fun.html                # Creative Side — side projects & hackathons
├── project-*.html          # Case study pages
├── styles.css              # Global styles
├── script.js               # Interactions, lazy media, nav, modals
├── api/chat.js             # FonsecaLLM serverless function (disabled in UI)
├── vercel.json             # Cache headers
├── robots.txt
├── sitemap.xml
├── MatheusFonsecaCV.pdf    # Resume
└── [asset folders]/        # Per-project images, videos, covers
```

## Case studies

- **Hedgehog** — `project-hedgehog-product.html`, `project-hedgehog.html`, `hedgehog-3d.html`
- **Transparent.space** — `project-transparent-space.html`, `project-transparent-space-brand.html`
- **Petrobras Saúde** — `project-petrobras-saude.html`
- **Unimed Seguros** — `project-unimed-seguros.html`
- **Picnic, AURA, NØRA, Caramel** — brand / side projects

## Local development

No build step. Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy

Push to `main` on GitHub — Vercel redeploys automatically.

```bash
git push origin main
```

## Notes

- **FonsecaLLM** (AI assistant) is scaffolded but disabled. To re-enable, uncomment `initFonsecaLLM();` at the bottom of `script.js`.
- Contact links use `data-copy-email` (copy to clipboard), not `mailto:`.
- Large `.mov` / `.mp4` assets are lazy-loaded on the homepage for performance.
