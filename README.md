# Itens à venda — mudança nômade

Landing page simples para divulgar itens que estamos vendendo antes da mudança.

## Antes de publicar pela primeira vez

Antes do primeiro `git push` para `main` (ou seja, antes do site ir ao ar de verdade), confira:

1. Troque o `whatsappNumber` em `src/data/site.ts` pelo número de WhatsApp de vocês — o valor que está lá agora é só um placeholder e não recebe mensagens.
2. Apague o item `exemplo` de `src/data/items.ts` (e a pasta de fotos `src/assets/items/exemplo/`) antes de adicionar os itens reais.

## Como adicionar um item novo

1. Coloque a(s) foto(s) em `src/assets/items/<id-do-item>/` (ex: `src/assets/items/sofa-cinza/1.jpg`).
2. Abra `src/data/items.ts` e adicione um novo objeto à lista `items`:

   ```ts
   {
     id: "sofa-cinza",
     title: "Sofá 3 lugares cinza",
     description: "Poucos meses de uso, tecido impermeável.",
     price: 800,
     photos: ["1.jpg"],
     status: "disponivel",
   }
   ```
3. Rode:

   ```bash
   git add .
   git commit -m "add sofá cinza"
   git push
   ```
4. Em 1–2 minutos o site atualiza sozinho em https://brunomrpx.github.io/nomad-landing-page.

## Marcar um item como reservado ou vendido

Edite o campo `status` do item em `src/data/items.ts` para `"reservado"` ou `"vendido"`, depois `git commit` + `git push`. O item continua visível, mas some da parte de cima da lista e fica marcado.

## Configuração geral do site

Edite `src/data/site.ts` para trocar o título, o texto de introdução, ou o número de WhatsApp (formato internacional, só dígitos: `55` + DDD + número, sem espaços ou símbolos).

## Rodando localmente

```bash
npm install
npm run dev      # abre em http://localhost:4321
npm run build    # gera o site em dist/
npm test         # roda os testes das funções utilitárias (src/lib/items.ts)
```
