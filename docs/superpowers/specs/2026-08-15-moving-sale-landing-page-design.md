# Landing page para venda de itens (mudança para vida nômade)

## Contexto e objetivo

O casal está se tornando "nômade digital" — sem endereço fixo, alugando
Airbnbs em cidades que quer conhecer ou revisitar. Para viabilizar essa
mudança, precisam vender itens que não vão levar. O objetivo deste
projeto é uma landing page simples para divulgar esses itens em grupos
de amigos (WhatsApp), com foto, descrição, valor e um jeito fácil de
quem tiver interesse entrar em contato.

Não é uma loja: não há carrinho, pagamento, contas de usuário ou
painel administrativo. É essencialmente um catálogo estático,
compartilhável por link.

## Requisitos

- Listar itens à venda com foto(s), título, descrição e preço.
- Botão de contato por item que abre o WhatsApp com mensagem
  pré-preenchida referenciando o item.
- Marcar itens como `disponivel`, `reservado` ou `vendido`; itens não
  disponíveis continuam visíveis (evita perguntas repetidas em
  grupos), mas ficam visualmente diferenciados e no fim da lista.
- Cadastro de item novo deve ser trivial: editar um arquivo de dados e
  publicar — sem painel admin, sem backend, sem autenticação.
- Volume esperado: até ~20 itens. Não há necessidade de categorias,
  busca ou paginação.
- Fotos tiradas de celular (tipicamente pesadas, 3–5MB) precisam
  carregar rápido em conexão móvel, já que o link circula por
  WhatsApp e é aberto majoritariamente em celular.

## Não-objetivos

- Sem backend, banco de dados ou autenticação.
- Sem formulário de contato próprio (usa WhatsApp diretamente).
- Sem suporte a múltiplos idiomas (site em português).
- Sem categorização/filtro/busca (volume baixo não justifica).

## Arquitetura

**Astro**, gerando site 100% estático, publicado via **GitHub Pages**
com deploy automático por **GitHub Actions** a cada push na `main`.

Motivo da escolha (Astro): otimização de imagem automática no build
(redimensionamento, compressão, formatos modernos via componente
`<Image>`), o que resolve o problema real de fotos pesadas de celular
sem exigir que o casal trate as imagens manualmente antes de subir.

Motivo da escolha (GitHub Pages): o site é totalmente estático (a
otimização de imagem acontece em build-time, não em runtime), então
não há necessidade de uma plataforma com runtime como Vercel. Só duas
pessoas mexem direto na `main`, então a ausência de preview
deployments por PR (recurso que o Vercel teria e o GitHub Pages não)
não é uma perda relevante aqui.

### Estrutura de diretórios

```
src/
  data/
    site.ts        # config global do site
    items.ts        # lista de itens à venda
  assets/
    items/
      <item-id>/
        1.jpg
        2.jpg
  components/
    ItemCard.astro
  pages/
    index.astro
.github/
  workflows/
    deploy.yml       # build + publish para GitHub Pages
```

### Modelo de dados

`src/data/site.ts`:
```ts
export const site = {
  title: "…",
  intro: "…",          // texto curto opcional contando a mudança
  whatsappNumber: "55XXXXXXXXXXX", // formato internacional, sem símbolos
};
```

`src/data/items.ts`:
```ts
export type ItemStatus = "disponivel" | "reservado" | "vendido";

export interface Item {
  id: string;           // usado para localizar a pasta de fotos
  title: string;
  description: string;
  price: number;        // em reais, sem formatação
  photos: string[];     // nomes de arquivo dentro de assets/items/<id>/
  status: ItemStatus;
}

export const items: Item[] = [ /* … */ ];
```

## Fluxo de cadastro de item (uso diário)

1. Colocar as fotos em `src/assets/items/<id-do-item>/`.
2. Adicionar um objeto `Item` em `src/data/items.ts`.
3. `git commit` + `git push` na `main`.
4. GitHub Actions builda e publica automaticamente (~1–2 min).

Marcar um item como vendido/reservado é uma edição de uma linha
(campo `status`) no mesmo arquivo.

## UI / UX

- Página única (`index.astro`).
- Topo: título do site + texto de introdução opcional (a história da
  mudança) + link geral de WhatsApp.
- Grid responsivo de cards: 1 coluna no celular, 2–3 colunas em telas
  maiores.
- Cada `ItemCard`: foto principal (via `<Image>` do Astro, otimizada),
  título, descrição, preço formatado em R$, selo de status quando não
  `disponivel`, botão "Tenho interesse" (verde, estilo WhatsApp).
- Itens com status `reservado` ou `vendido`: renderizados com opacidade
  reduzida, selo visível, e ordenados para o fim da grid (itens
  `disponivel` primeiro).
- Botão de contato monta um link `https://wa.me/<numero>?text=<mensagem
  codificada>`, com mensagem do tipo `Olá! Tenho interesse em: [título]
  — R$ [preço]`.

## Deploy / CI

- Workflow do GitHub Actions (`actions/deploy-pages` + build do
  Astro) disparado em push para `main`.
- Se publicado em `usuario.github.io/<repo>`, configurar `base` no
  `astro.config.mjs` de acordo; se um domínio próprio for apontado
  depois, remover o `base`.

## Riscos / decisões em aberto

- Nenhum bloqueador identificado. Caso o casal decida usar domínio
  próprio no futuro, é só ajustar DNS + `astro.config.mjs`, sem
  mudança estrutural.
