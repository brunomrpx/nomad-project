# Landing Page de Venda de Itens (Mudança Nômade) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Astro site that lists items for sale (photo, title, description, price, status) with a WhatsApp contact button per item, publishable to GitHub Pages, where adding a new item is a matter of editing one data file.

**Architecture:** Astro static site generator, no backend. Items and site config live in typed TypeScript data files. A small pure-function module (`src/lib/items.ts`) handles price formatting, status-based sorting, and WhatsApp link construction — these are the only pieces with real logic, so they're the only pieces that get unit tests. Photos are optimized at build time via `astro:assets`. Deploy is fully automated via GitHub Actions on push to `main`.

**Tech Stack:** Astro 5, TypeScript, Vitest (unit tests for `src/lib/items.ts`), GitHub Actions (`withastro/action` + `actions/deploy-pages`) for GitHub Pages deploy.

**Spec:** `docs/superpowers/specs/2026-08-15-moving-sale-landing-page-design.md`

## Global Constraints

- Site content and copy: Portuguese (pt-BR).
- No backend, database, authentication, or custom contact form — contact is via WhatsApp (`wa.me`) links only.
- `status` field is restricted to exactly three values: `"disponivel"`, `"reservado"`, `"vendido"`.
- `price` is stored as a plain number (reais), never pre-formatted, in data files.
- WhatsApp number is stored in international format, digits only (e.g. `5511999999999`).
- No categories, search, filtering, or pagination (spec assumes < 20 items).
- Deploy target: GitHub Pages at `https://brunomrpx.github.io/nomad-landing-page`, base path `/nomad-landing-page`, deployed via GitHub Actions on push to `main`.

---

## File Structure

```
package.json
astro.config.mjs
tsconfig.json
.gitignore
README.md
src/
  lib/
    items.ts          # Item/ItemStatus types + formatPrice/sortItemsByStatus/buildWhatsappLink
    items.test.ts      # Vitest unit tests for the above
  data/
    site.ts            # site-wide config (title, intro, whatsappNumber)
    items.ts            # the actual list of items for sale
  components/
    ItemCard.astro     # renders one item (photo, title, price, status badge, CTA)
  pages/
    index.astro         # renders header + grid of ItemCard
  assets/
    items/
      exemplo/
        1.png            # placeholder photo for the example item
.github/
  workflows/
    deploy.yml           # build + publish to GitHub Pages on push to main
```

---

### Task 1: Project scaffolding (Astro + TypeScript + Vitest)

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: working `npm run build`, `npm run dev`, `npm test` commands that later tasks rely on

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "nomad-landing-page",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install Astro**

Run: `npm install astro@^5`
Expected: `astro` added to `dependencies` in `package.json`, `package-lock.json` created.

- [ ] **Step 3: Install Vitest**

Run: `npm install -D vitest@^3`
Expected: `vitest` added to `devDependencies` in `package.json`.

- [ ] **Step 4: Create `astro.config.mjs`**

```js
import { defineConfig } from "astro/config";

export default defineConfig({});
```

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.DS_Store
```

- [ ] **Step 7: Create `src/pages/index.astro`**

```astro
---
---
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Em construção</title>
  </head>
  <body>
    <p>Em construção.</p>
  </body>
</html>
```

- [ ] **Step 8: Verify the build works**

Run: `npm run build`
Expected: build succeeds, `dist/index.html` is created.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/pages/index.astro
git commit -m "chore: scaffold Astro + TypeScript + Vitest project"
```

---

### Task 2: Item helpers (`formatPrice`, `sortItemsByStatus`, `buildWhatsappLink`)

**Files:**
- Create: `src/lib/items.ts`
- Test: `src/lib/items.test.ts`

**Interfaces:**
- Consumes: nothing beyond Task 1's project setup
- Produces (relied on by Tasks 3 and 4):
  - `type ItemStatus = "disponivel" | "reservado" | "vendido"`
  - `interface Item { id: string; title: string; description: string; price: number; photos: string[]; status: ItemStatus }`
  - `formatPrice(price: number): string`
  - `sortItemsByStatus(items: Item[]): Item[]`
  - `buildWhatsappLink(whatsappNumber: string, item: Item): string`

- [ ] **Step 1: Write failing tests for `formatPrice`**

Create `src/lib/items.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatPrice } from "./items";

describe("formatPrice", () => {
  it("formats a value below 1000 without a thousands separator", () => {
    expect(formatPrice(800)).toBe("R$ 800,00");
  });

  it("formats a value at or above 1000 with a thousands separator", () => {
    expect(formatPrice(1500)).toBe("R$ 1.500,00");
  });

  it("formats a value with cents", () => {
    expect(formatPrice(99.9)).toBe("R$ 99,90");
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test`
Expected: FAIL — `./items` has no exported member `formatPrice` (module doesn't exist yet).

- [ ] **Step 3: Implement `formatPrice`**

Create `src/lib/items.ts`:

```ts
export type ItemStatus = "disponivel" | "reservado" | "vendido";

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  photos: string[];
  status: ItemStatus;
}

export function formatPrice(price: number): string {
  const [intPart, centsPart] = price.toFixed(2).split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${withThousands},${centsPart}`;
}
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm test`
Expected: PASS — all 3 `formatPrice` tests green.

- [ ] **Step 5: Write failing tests for `sortItemsByStatus`**

Append to `src/lib/items.test.ts`:

```ts
import { sortItemsByStatus, type Item } from "./items";

function makeItem(id: string, status: Item["status"]): Item {
  return {
    id,
    title: `Item ${id}`,
    description: "",
    price: 100,
    photos: [],
    status,
  };
}

describe("sortItemsByStatus", () => {
  it("puts disponivel items before reservado/vendido, preserving relative order within each group", () => {
    const items = [
      makeItem("a", "vendido"),
      makeItem("b", "disponivel"),
      makeItem("c", "reservado"),
      makeItem("d", "disponivel"),
    ];

    const sorted = sortItemsByStatus(items);

    expect(sorted.map((i) => i.id)).toEqual(["b", "d", "a", "c"]);
  });
});
```

Update the existing `import { formatPrice } from "./items";` line to a single combined import:

```ts
import { formatPrice, sortItemsByStatus, type Item } from "./items";
```

(remove the now-duplicate second import line you just added)

- [ ] **Step 6: Run the tests and confirm the new test fails**

Run: `npm test`
Expected: FAIL — `./items` has no exported member `sortItemsByStatus`.

- [ ] **Step 7: Implement `sortItemsByStatus`**

Append to `src/lib/items.ts`:

```ts
const STATUS_RANK: Record<ItemStatus, number> = {
  disponivel: 0,
  reservado: 1,
  vendido: 1,
};

export function sortItemsByStatus(items: Item[]): Item[] {
  return [...items].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
}
```

- [ ] **Step 8: Run the tests and confirm they pass**

Run: `npm test`
Expected: PASS — `sortItemsByStatus` test green.

- [ ] **Step 9: Write failing test for `buildWhatsappLink`**

Append to `src/lib/items.test.ts`:

```ts
describe("buildWhatsappLink", () => {
  it("builds a wa.me link with the item title and formatted price in the message", () => {
    const item = makeItem("sofa", "disponivel");
    item.title = "Sofá cinza";
    item.price = 800;

    const link = buildWhatsappLink("5511999999999", item);
    const url = new URL(link);

    expect(url.origin + url.pathname).toBe("https://wa.me/5511999999999");
    expect(url.searchParams.get("text")).toBe(
      "Olá! Tenho interesse em: Sofá cinza — R$ 800,00"
    );
  });
});
```

Update the import line at the top of `src/lib/items.test.ts` to include `buildWhatsappLink`:

```ts
import { formatPrice, sortItemsByStatus, buildWhatsappLink, type Item } from "./items";
```

- [ ] **Step 10: Run the tests and confirm the new test fails**

Run: `npm test`
Expected: FAIL — `./items` has no exported member `buildWhatsappLink`.

- [ ] **Step 11: Implement `buildWhatsappLink`**

Append to `src/lib/items.ts`:

```ts
export function buildWhatsappLink(whatsappNumber: string, item: Item): string {
  const message = `Olá! Tenho interesse em: ${item.title} — ${formatPrice(item.price)}`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 12: Run all tests and confirm everything passes**

Run: `npm test`
Expected: PASS — all tests green (3 `formatPrice` + 1 `sortItemsByStatus` + 1 `buildWhatsappLink`).

- [ ] **Step 13: Commit**

```bash
git add src/lib/items.ts src/lib/items.test.ts
git commit -m "feat: add item helper functions (formatPrice, sortItemsByStatus, buildWhatsappLink)"
```

---

### Task 3: Data files (site config + items list)

**Files:**
- Create: `src/data/site.ts`
- Create: `src/data/items.ts`
- Create: `src/assets/items/exemplo/1.png`

**Interfaces:**
- Consumes: `Item`, `ItemStatus` types from `src/lib/items.ts` (Task 2)
- Produces (relied on by Task 4):
  - `site: { title: string; intro: string; whatsappNumber: string }` from `src/data/site.ts`
  - `items: Item[]` from `src/data/items.ts`

- [ ] **Step 1: Create `src/data/site.ts`**

```ts
export const site = {
  title: "Itens à venda — mudança nômade",
  intro:
    "Estamos nos mudando para viver como nômades e vendendo alguns itens antes de partir. Interessou? É só chamar no WhatsApp.",
  whatsappNumber: "5511999999999",
};
```

- [ ] **Step 2: Create the placeholder photo for the example item**

Run:

```bash
mkdir -p src/assets/items/exemplo
node -e "require('fs').writeFileSync('src/assets/items/exemplo/1.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'))"
```

Expected: `src/assets/items/exemplo/1.png` exists (a valid 1×1 pixel PNG, used only as a placeholder so the build has a real image to process — replace it with a real photo before actually listing an item for sale).

- [ ] **Step 3: Create `src/data/items.ts`**

```ts
import type { Item } from "../lib/items";

export const items: Item[] = [
  {
    id: "exemplo",
    title: "Item de exemplo",
    description:
      "Isto é um item de exemplo — substitua por um item de verdade em src/data/items.ts.",
    price: 50,
    photos: ["1.png"],
    status: "disponivel",
  },
];
```

- [ ] **Step 4: Type-check the data files**

Run: `npx tsc --noEmit`
Expected: no errors (the example item satisfies the `Item` type).

- [ ] **Step 5: Commit**

```bash
git add src/data/site.ts src/data/items.ts src/assets/items/exemplo/1.png
git commit -m "feat: add site config and example item data"
```

---

### Task 4: ItemCard component + index page

**Files:**
- Create: `src/components/ItemCard.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes:
  - `Item`, `formatPrice`, `buildWhatsappLink`, `sortItemsByStatus` from `src/lib/items.ts` (Task 2)
  - `site`, `items` from `src/data/site.ts` / `src/data/items.ts` (Task 3)
  - `ItemCard.astro` Props: `{ item: Item }`
- Produces: the rendered site (`dist/index.html` after build)

- [ ] **Step 1: Create `src/components/ItemCard.astro`**

```astro
---
import { Image } from "astro:assets";
import type { Item } from "../lib/items";
import { formatPrice, buildWhatsappLink } from "../lib/items";
import { site } from "../data/site";

interface Props {
  item: Item;
}

const { item } = Astro.props;

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/items/**/*.{jpeg,jpg,png,webp}",
  { eager: true }
);
const mainPhotoPath = `/src/assets/items/${item.id}/${item.photos[0]}`;
const mainPhoto = images[mainPhotoPath]?.default;

const statusLabel: Record<Item["status"], string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

const isAvailable = item.status === "disponivel";
const whatsappLink = buildWhatsappLink(site.whatsappNumber, item);
---

<article class:list={["card", { unavailable: !isAvailable }]}>
  {mainPhoto && <Image src={mainPhoto} alt={item.title} width={400} height={300} />}
  <h2>{item.title}</h2>
  <p>{item.description}</p>
  <p class="price">{formatPrice(item.price)}</p>
  {!isAvailable && <span class="badge">{statusLabel[item.status]}</span>}
  <a class="cta" href={whatsappLink} target="_blank" rel="noopener noreferrer">
    Tenho interesse
  </a>
</article>

<style>
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
  }
  .card.unavailable {
    opacity: 0.5;
  }
  .card img {
    width: 100%;
    height: auto;
    border-radius: 4px;
  }
  .price {
    font-weight: bold;
  }
  .badge {
    display: inline-block;
    background: #333;
    color: white;
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }
  .cta {
    display: inline-block;
    margin-top: 0.5rem;
    background: #25d366;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
  }
</style>
```

- [ ] **Step 2: Replace `src/pages/index.astro`**

```astro
---
import { site } from "../data/site";
import { items } from "../data/items";
import { sortItemsByStatus } from "../lib/items";
import ItemCard from "../components/ItemCard.astro";

const sortedItems = sortItemsByStatus(items);
---

<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{site.title}</title>
  </head>
  <body>
    <header>
      <h1>{site.title}</h1>
      <p>{site.intro}</p>
    </header>
    <main class="grid">
      {sortedItems.map((item) => <ItemCard item={item} />)}
    </main>
    <style>
      .grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 1rem;
      }
      @media (min-width: 640px) {
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (min-width: 1024px) {
        .grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    </style>
  </body>
</html>
```

- [ ] **Step 3: Build the site**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 4: Verify the rendered output contains the expected content**

Run:

```bash
grep -q "Item de exemplo" dist/index.html && echo OK_TITLE
grep -q "R\$ 50,00" dist/index.html && echo OK_PRICE
grep -q "wa.me/5511999999999" dist/index.html && echo OK_WHATSAPP
grep -q "Tenho interesse" dist/index.html && echo OK_CTA
```

Expected: all four `OK_*` lines printed.

- [ ] **Step 5: Verify the tests still pass**

Run: `npm test`
Expected: PASS — unaffected by this task's changes.

- [ ] **Step 6: Commit**

```bash
git add src/components/ItemCard.astro src/pages/index.astro
git commit -m "feat: render item grid with ItemCard on the home page"
```

---

### Task 5: README with usage instructions

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: file paths and commands established in Tasks 1–4 (documents them, doesn't change behavior)
- Produces: nothing consumed by other tasks — this is the last piece a human (not an engineer) needs to operate the site day to day

- [ ] **Step 1: Create `README.md`**

```markdown
# Itens à venda — mudança nômade

Landing page simples para divulgar itens que estamos vendendo antes da mudança.

## Como adicionar um item novo

1. Coloque a(s) foto(s) em `src/assets/items/<id-do-item>/` (ex: `src/assets/items/sofa-cinza/1.jpg`).
2. Abra `src/data/items.ts` e adicione um novo objeto à lista `items`:

   \`\`\`ts
   {
     id: "sofa-cinza",
     title: "Sofá 3 lugares cinza",
     description: "Poucos meses de uso, tecido impermeável.",
     price: 800,
     photos: ["1.jpg"],
     status: "disponivel",
   }
   \`\`\`
3. Rode:

   \`\`\`bash
   git add .
   git commit -m "add sofá cinza"
   git push
   \`\`\`
4. Em 1–2 minutos o site atualiza sozinho em https://brunomrpx.github.io/nomad-landing-page.

## Marcar um item como reservado ou vendido

Edite o campo `status` do item em `src/data/items.ts` para `"reservado"` ou `"vendido"`, depois `git commit` + `git push`. O item continua visível, mas some da parte de cima da lista e fica marcado.

## Configuração geral do site

Edite `src/data/site.ts` para trocar o título, o texto de introdução, ou o número de WhatsApp (formato internacional, só dígitos: `55` + DDD + número, sem espaços ou símbolos).

## Rodando localmente

\`\`\`bash
npm install
npm run dev      # abre em http://localhost:4321
npm run build    # gera o site em dist/
npm test         # roda os testes das funções utilitárias (src/lib/items.ts)
\`\`\`
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with item registration instructions"
```

---

### Task 6: GitHub Pages deploy

**Files:**
- Modify: `astro.config.mjs`
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `npm run build` from Task 1
- Produces: automated deploy to `https://brunomrpx.github.io/nomad-landing-page` on push to `main`

- [ ] **Step 1: Set `site` and `base` in `astro.config.mjs`**

Replace the contents of `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://brunomrpx.github.io",
  base: "/nomad-landing-page",
});
```

- [ ] **Step 2: Verify the build still works with the base path set**

Run: `npm run build`
Expected: build succeeds. Check that asset/link paths in the output are prefixed with `/nomad-landing-page`:

```bash
grep -q '/nomad-landing-page/' dist/index.html && echo OK_BASE
```

Expected: `OK_BASE` printed.

- [ ] **Step 3: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs .github/workflows/deploy.yml
git commit -m "ci: deploy to GitHub Pages via GitHub Actions"
```

- [ ] **Step 5: Push and enable GitHub Pages (manual, one-time)**

This step can't be automated from the command line — it's a one-time setting in the GitHub UI:

1. Push the repo to GitHub: `git remote add origin git@github.com:brunomrpx/nomad-landing-page.git` (create the repo on GitHub first if it doesn't exist yet), then `git push -u origin main`.
2. In the GitHub repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Push again (or re-run the workflow from the **Actions** tab) — the site will be live at `https://brunomrpx.github.io/nomad-landing-page` a couple minutes later.

---

## Self-Review Notes

- **Spec coverage:** listing items with photo/description/price (Task 4), WhatsApp CTA per item (Task 2 + 4), status handling with visual de-emphasis + reordering (Task 2 + 4), easy item registration via data file (Task 3 + README in Task 5), image optimization via `astro:assets` (Task 4), GitHub Pages deploy (Task 6). No spec requirement is without a task.
- **Placeholder scan:** no "TBD"/"TODO"/vague instructions remain; the only "placeholder"-flavored content is the example item and 1×1 PNG in Task 3, which are real, working, buildable content (not unwritten instructions) that the couple is explicitly told to replace with real listings.
- **Type consistency:** `Item`/`ItemStatus` defined once in `src/lib/items.ts` (Task 2) and imported everywhere else (Tasks 3–4) rather than redefined; `formatPrice`/`sortItemsByStatus`/`buildWhatsappLink` signatures match between their Task 2 definition and their Task 4 call sites.
