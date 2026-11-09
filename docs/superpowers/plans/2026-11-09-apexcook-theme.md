# ApexCook Theme: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o tema Shopify "ApexCook" sobre o Horizon 4.4.0 (Home, PDP, Basket, categorias, busca, About e Recipes), em inglês britânico, e entregá-lo sem publicar na loja 1674jn-p8.myshopify.com para revisão do dono.

**Architecture:** Fork local do Horizon 4.4.0, que é a mesma versão instalada na loja, versionado em git em `theme/`. As novas funcionalidades são seções e blocos com prefixo `apex-`, que seguem o `AGENTS.md` do Horizon: Liquid para renderizar, `Component` de `@theme/component` para interações, CSS em `{% stylesheet %}` no dono e textos de interface em `locales/en.default.json`. A lógica pura (totais, frete grátis, avaliações) fica em módulos ES isolados em `theme/assets/`, testados com `node --test`. Conteúdo editável fica em metafields e metaobjects criados pela Admin API. A publicação dos arquivos usa `themeFilesUpsert` num tema duplicado do Horizon.

**Tech Stack:** Shopify Liquid (Online Store 2.0, theme blocks), JavaScript ES modules (framework do Horizon), CSS, Node 20+ (`node:test`), Shopify CLI (somente `theme check`), Shopify Admin GraphQL (via conector), Google Sans Flex (Fontsource).

**Spec:** `docs/superpowers/specs/2026-11-09-apexcook-theme-design.md`

## Global Constraints

- Base: Horizon **4.4.0**, de `https://github.com/Shopify/horizon` (igual ao tema `gid://shopify/OnlineStoreTheme/210748735830` da loja).
- O tema de trabalho se chama **"ApexCook"** e fica com role **UNPUBLISHED** durante todo o plano. **Nunca** chamar `themePublish`. O Zenith (`…/210761122134`) **nunca** é alterado.
- Textos de interface em **inglês britânico**: "Basket" (nunca "Cart" visível), "Colour", "Delivery". Moeda GBP. Preços sempre com "VAT inclusive" / "Incl. VAT".
- Fonte: **Google Sans Flex** variável, `.woff2` em `theme/assets/`, `font-display: swap`. **Nenhuma** requisição a `fonts.googleapis.com` ou `fonts.gstatic.com`. Licença OFL incluída como `theme/assets/google-sans-flex-OFL.txt`.
- Menu: **Shop · Cookware · Tableware · Bundles · Knives · Accessories**.
- Abas da PDP: **Features · Specs · Reviews · Support**, com âncoras `#features`, `#specs`, `#reviews`, `#support`.
- Valores monetários em JS sempre em **pence inteiros**.
- Frete grátis: setting `apex_free_delivery_threshold` (em £, inteiro), padrão **50**. Qualifica quando `cart.total_price >= threshold * 100`.
- "Save £X" e o preço anterior só aparecem com `compare_at_price > price`. O rótulo vem do metafield `apex.was_label` (`Was` | `RRP`), com padrão `Was`.
- Cada avaliação e depoimento mostra **origem e data**, e nenhuma é filtrada por nota no servidor.
- Animações: só `transform`/`opacity`. `prefers-reduced-motion: reduce` desliga todas. Cada seção animada tem o setting `enable_animation` (padrão `true`).
- Sem dependências de runtime novas no tema (sem bibliotecas JS externas).
- Toda mutação na loja (metafields, menus, produtos, arquivos de tema) acontece só depois de o dono aprovar este plano. Produtos de teste exigem que o dono confirme antes que a loja está protegida por senha.

## Review Focus

1. **Tamanho esgotado selecionado:** o botão vira "Sold out" desabilitado, os adicionais continuam marcáveis e o total continua correto. Teste na Task 8, Step 6.
2. **Adicional esgotado:** o toggle fica desabilitado e o adicional nunca entra no payload de `/cart/add.js`. Teste em `bundle.test.mjs` (`cartAddItems ignores unavailable addons`).
3. **`/cart/add.js` responde 422** (estoque insuficiente de um item): o cliente continua na PDP, a mensagem de erro aparece na live region do buy box e a seleção é mantida. Teste na Task 8, Step 6.
4. **Produto sem avaliações, sem compare-at ou sem adicionais:** as seções somem sem deixar espaço vazio, nunca aparece "Save £0.00" e não sai JSON-LD AggregateRating. Testes em `reviews.test.mjs` (`ratingSummary of empty list`) e na Task 10, Step 5.
5. **Subtotal exatamente igual ao limite de frete** e limite zero ou negativo: conta como "qualified". Testes em `free-delivery.test.mjs`.

---

## File Structure

```
apexcook/
  package.json                      # scripts: test, check; devDeps: @shopify/cli, @fontsource-variable/google-sans-flex
  tests/
    bundle.test.mjs                 # bundleTotal, cartAddItems
    free-delivery.test.mjs          # freeDeliveryProgress
    reviews.test.mjs                # filterReviews, sortReviews, ratingSummary, paginate
    locale.test.mjs                 # en.default.json em inglês britânico
  docs/deploy.md                    # IDs do tema, comandos de upsert, checklist de verificação
  scripts/changed-files.mjs         # lista os arquivos do tema alterados desde a base (para o upsert)
  theme/                            # fork do Horizon 4.4.0
    assets/
      apex-bundle.js                # lógica pura: totais e payload dos adicionais
      apex-free-delivery.js         # lógica pura: progresso do frete grátis
      apex-reviews.js               # lógica pura: filtros, ordenação e resumo das avaliações
      apex-buy-box.js               # Component <apex-buy-box>
      apex-free-delivery-bar.js     # Component <apex-free-delivery-bar>
      apex-reviews-list.js          # Component <apex-reviews-list>
      apex-reveal.js                # animações de entrada e scroll
      apex-card-cta.js              # Component <apex-card-cta> (add sem recarregar no basket)
      google-sans-flex.woff2, google-sans-flex-OFL.txt
    snippets/
      apex-fonts.liquid             # @font-face + preload
      apex-motion-styles.liquid     # CSS das animações + reduced motion
      apex-price-was.liquid         # preço, Was/RRP, Save £X
      apex-product-card.liquid      # card dos "Cooked with"
    blocks/
      apex-card-cta.liquid          # botão Add / Choose size do card
      apex-promo-line.liquid, apex-rating-link.liquid, apex-size-guide.liquid,
      apex-addons.liquid, apex-buy-box.liquid, apex-trust-badges.liquid,
      apex-free-delivery-bar.liquid, apex-mobile-checkout-bar.liquid, apex-footer-company.liquid
    sections/
      apex-split-hero.liquid, apex-bento-mosaic.liquid, apex-media-banner.liquid,
      apex-benefits.liquid, apex-faq.liquid, apex-pdp-anchor-nav.liquid,
      apex-testimonials.liquid, apex-press.liquid, apex-sticky-story.liquid,
      apex-compare-slider.liquid, apex-comparison-table.liquid, apex-use-cards.liquid,
      apex-specs.liquid, apex-reviews.liquid, apex-support.liquid,
      apex-recipe-meta.liquid, apex-cooked-with.liquid, apex-tag-filter.liquid
    templates/ index.json, product.json, cart.json, collection.json, search.json,
               page.about.json, blog.json, article.recipe.json
    (modificados) layout/theme.liquid, snippets/scripts.liquid, blocks/_product-card.liquid,
               config/settings_schema.json, config/settings_data.json,
               locales/en.default.json, locales/en.default.schema.json,
               sections/header-group.json, sections/footer-group.json
```

---

### Task 1: Workspace, ferramentas e tema de trabalho na loja

**Files:**
- Create: `package.json`, `docs/deploy.md`, `scripts/changed-files.mjs`, `theme/` (cópia de `/tmp/horizon-src`, sem `.git`)

**Interfaces:**
- Produces: `npm test` (roda `node --test tests/`), `npm run check` (roda `shopify theme check --path theme --fail-level error`), `node scripts/changed-files.mjs` (imprime um caminho por linha, relativo a `theme/`, de cada arquivo alterado ou criado desde a tag git `horizon-4.4.0`), e o ID do tema ApexCook registrado em `docs/deploy.md` como `APEX_THEME_ID`.

- [ ] **Step 1:** Copiar `/tmp/horizon-src` para `apexcook/theme/` (clonar de novo `--depth 1` se `/tmp` tiver sido limpo) e confirmar `"theme_version": "4.4.0"` em `theme/config/settings_schema.json`. Commit `chore: import Horizon 4.4.0` e criar a tag `horizon-4.4.0`.
- [ ] **Step 2:** Criar `package.json` com `"type": "module"`, os scripts acima e devDependencies `@shopify/cli` e `@fontsource-variable/google-sans-flex@5.3.2`. Rodar `npm install`.
- [ ] **Step 3:** Rodar `npm run check`. Esperado: 0 erros no Horizon puro. Se o CLI não rodar offline, registrar em `docs/deploy.md` e usar `npx @shopify/theme-check-node` via script Node como alternativa.
- [ ] **Step 4:** Criar `scripts/changed-files.mjs` (usa `git diff --name-only horizon-4.4.0 -- theme/` mais os arquivos não rastreados). Verificação: rodar e ver saída vazia.
- [ ] **Step 5:** Pedir ao dono a confirmação de que a loja está protegida por senha (*Online Store → Preferences*). Depois, executar a mutação `themeDuplicate(id: "gid://shopify/OnlineStoreTheme/210748735830", name: "ApexCook")`. Esperado: novo tema com `role: UNPUBLISHED`. Se faltar permissão, parar e reportar (alternativa: Shopify CLI com senha do Theme Access, fornecida pelo dono).
- [ ] **Step 6:** Registrar `APEX_THEME_ID`, a URL de preview `https://1674jn-p8.myshopify.com/?preview_theme_id=<id>` e o procedimento de upsert (lotes de até 50 arquivos, `body.type` `TEXT` ou `BASE64` para woff2) em `docs/deploy.md`. Commit `chore: tooling and ApexCook working theme`.

### Task 2: Lógica pura testada (adicionais, frete grátis, avaliações)

**Files:**
- Create: `theme/assets/apex-bundle.js`, `theme/assets/apex-free-delivery.js`, `theme/assets/apex-reviews.js`
- Test: `tests/bundle.test.mjs`, `tests/free-delivery.test.mjs`, `tests/reviews.test.mjs`
- Modify: `theme/snippets/scripts.liquid` (import map: `@theme/apex-bundle`, `@theme/apex-free-delivery`, `@theme/apex-reviews`)

**Interfaces (Produces):**
- `bundleTotal(baseCents: number, addons: {priceCents: number, selected: boolean, available: boolean}[]): number`
- `cartAddItems(main: {variantId: number, quantity: number}, addons: {variantId: number, selected: boolean, available: boolean}[]): {items: {id: number, quantity: number}[]}`: o item principal vem primeiro, cada adicional entra com quantidade 1, ignora adicionais não selecionados ou indisponíveis e remove variantIds duplicados.
- `freeDeliveryProgress(totalCents: number, thresholdCents: number): {qualified: boolean, remainingCents: number, percent: number}`: `percent` é inteiro entre 0 e 100.
- `Review = {rating: 1|2|3|4|5, author: string, title: string, body: string, date: string /* YYYY-MM-DD */, source: string, size: string|null, photos: string[]}`
- `filterReviews(reviews: Review[], f: {rating?: number, size?: string, withPhotos?: boolean}): Review[]`
- `sortReviews(reviews: Review[], mode: 'newest'|'highest'|'lowest'): Review[]` (não altera o array original; empate desfeito por data mais recente)
- `ratingSummary(reviews: Review[]): {average: number /* 1 casa decimal */, count: number, distribution: {1:number,2:number,3:number,4:number,5:number}}`
- `paginate<T>(items: T[], page: number, perPage = 10): {items: T[], page: number, totalPages: number}` (`page` é limitado ao intervalo válido)

- [ ] **Step 1: Escrever os testes que falham**

```js
// tests/bundle.test.mjs
test('bundleTotal sums selected available addons', () =>
  assert.equal(bundleTotal(24950, [{priceCents:1500,selected:true,available:true},{priceCents:900,selected:false,available:true}]), 26450));
test('bundleTotal ignores selected but unavailable addons', () =>
  assert.equal(bundleTotal(24950, [{priceCents:1500,selected:true,available:false}]), 24950));
test('cartAddItems puts main first, addons qty 1', () =>
  assert.deepEqual(cartAddItems({variantId:1,quantity:2},[{variantId:7,selected:true,available:true}]), {items:[{id:1,quantity:2},{id:7,quantity:1}]}));
test('cartAddItems ignores unavailable addons', () =>
  assert.deepEqual(cartAddItems({variantId:1,quantity:1},[{variantId:7,selected:true,available:false}]).items, [{id:1,quantity:1}]));
test('cartAddItems dedupes addon ids', () =>
  assert.equal(cartAddItems({variantId:1,quantity:1},[{variantId:7,selected:true,available:true},{variantId:7,selected:true,available:true}]).items.length, 2));

// tests/free-delivery.test.mjs
test('below threshold', () => assert.deepEqual(freeDeliveryProgress(3800, 5000), {qualified:false, remainingCents:1200, percent:76}));
test('exactly at threshold qualifies', () => assert.deepEqual(freeDeliveryProgress(5000, 5000), {qualified:true, remainingCents:0, percent:100}));
test('above threshold clamps', () => assert.equal(freeDeliveryProgress(9000, 5000).percent, 100));
test('zero threshold always qualifies', () => assert.equal(freeDeliveryProgress(0, 0).qualified, true));
test('empty basket', () => assert.deepEqual(freeDeliveryProgress(0, 5000), {qualified:false, remainingCents:5000, percent:0}));

// tests/reviews.test.mjs  (fixture: 4 reviews, ratings 5,5,4,1, uma com foto, sizes '28 cm','24 cm')
test('ratingSummary', () => assert.deepEqual(ratingSummary(fx), {average:3.8,count:4,distribution:{1:1,2:0,3:0,4:1,5:2}}));
test('ratingSummary of empty list', () => assert.deepEqual(ratingSummary([]), {average:0,count:0,distribution:{1:0,2:0,3:0,4:0,5:0}}));
test('filter by rating', () => assert.equal(filterReviews(fx,{rating:5}).length, 2));
test('filter withPhotos', () => assert.equal(filterReviews(fx,{withPhotos:true}).length, 1));
test('filter by size', () => assert.ok(filterReviews(fx,{size:'28 cm'}).every(r => r.size === '28 cm')));
test('sort lowest keeps negatives visible', () => assert.equal(sortReviews(fx,'lowest')[0].rating, 1));
test('sort does not mutate', () => { const c=[...fx]; sortReviews(fx,'highest'); assert.deepEqual(fx,c); });
test('paginate clamps page', () => assert.equal(paginate(Array(23).fill(0), 9).page, 3));
```

- [ ] **Step 2:** `npm test`. Esperado: FAIL (módulos inexistentes).
- [ ] **Step 3:** Implementar os três módulos com as assinaturas acima (`export function`), sem dependências e sem acesso ao DOM.
- [ ] **Step 4:** `npm test`. Esperado: todos PASS.
- [ ] **Step 5:** Adicionar as 3 entradas ao import map em `snippets/scripts.liquid`, no formato das existentes. Rodar `npm run check` (0 erros). Commit `feat: pure logic for bundle, free delivery and reviews`.

### Task 3: Identidade (fonte, cores, settings globais, carrinho em página)

**Files:**
- Create: `theme/snippets/apex-fonts.liquid`, `theme/assets/google-sans-flex.woff2`, `theme/assets/google-sans-flex-OFL.txt`
- Modify: `theme/layout/theme.liquid` (render `apex-fonts` no `<head>`, antes de `stylesheets`), `theme/config/settings_schema.json`, `theme/config/settings_data.json`

**Interfaces (Produces):**
- Settings globais: `settings.apex_free_delivery_threshold` (range 0–200, step 5, padrão 50, unidade £), `settings.apex_hero_product` (product picker, usado no basket vazio e nas categorias vazias), `settings.apex_company_name`, `settings.apex_company_address`, `settings.apex_company_email` (texto). Todos ficam no grupo de settings "ApexCook", com rótulos em `en.default.schema.json`.
- CSS custom property `--apex-font: 'Google Sans Flex', system-ui, sans-serif`.

- [ ] **Step 1:** Copiar o `.woff2` variável (subconjunto latin, eixo `wght`) de `node_modules/@fontsource-variable/google-sans-flex/files/` para `theme/assets/google-sans-flex.woff2` e o texto da OFL para `google-sans-flex-OFL.txt`.
- [ ] **Step 2:** Em `apex-fonts.liquid`: `<link rel="preload" as="font" type="font/woff2" crossorigin>`, `@font-face` com `font-weight: 100 1000` e `font-display: swap`, e a sobrescrita das variáveis de família de fonte do Horizon (body, subheading, heading, accent; os nomes exatos estão em `snippets/theme-styles-variables.liquid`) para `var(--apex-font)`.
- [ ] **Step 3:** Em `settings_data.json` (preset atual): esquema de cores principal com fundo `#FFFFFF`, texto `#111111`, botão primário `#E00000` com texto `#FFFFFF`; um esquema "inverse" com fundo `#000000` e texto `#FFFFFF`; um esquema "muted" com fundo `#F4F4F4`; raio de botões e inputs em 0; `cart_type: "page"`. Adicionar os settings do grupo ApexCook ao `settings_schema.json`.
- [ ] **Step 4:** Verificar: `npm run check` com 0 erros e `grep -r "fonts.googleapis\|fonts.gstatic" theme/` sem resultado. Commit `feat: ApexCook brand foundation`.

### Task 4: Inglês britânico nos textos de interface

**Files:**
- Modify: `theme/locales/en.default.json`
- Test: `tests/locale.test.mjs`

- [ ] **Step 1: Teste que falha**

```js
const values = flatten(JSON.parse(readFileSync('theme/locales/en.default.json','utf8'))); // [keyPath, string][]
test('no visible "cart" wording', () =>
  assert.deepEqual(values.filter(([,v]) => /\bcarts?\b/i.test(v)).map(([k]) => k), []));
test('no US spelling of colour', () =>
  assert.deepEqual(values.filter(([,v]) => /\bcolors?\b/i.test(v)).map(([k]) => k), []));
test('apex namespace present', () => {
  const m = Object.fromEntries(values);
  assert.equal(m['apex.buy_box.add_to_basket'], 'Add to basket');
  assert.equal(m['apex.buy_box.vat_inclusive'], 'VAT inclusive');
  assert.equal(m['apex.card.choose_size'], 'Choose size');
});
```

- [ ] **Step 2:** `node --test tests/locale.test.mjs`. Esperado: FAIL.
- [ ] **Step 3:** Substituir cart→basket e color→colour **nos valores** (as chaves continuam iguais). Criar o namespace `apex` com todos os textos de interface das Tasks 6–13, em inglês britânico:
  - `apex.card`: `add` "Add", `choose_size` "Choose size", `added` "Added".
  - `apex.buy_box`: `add_to_basket` "Add to basket", `sold_out` "Sold out", `vat_inclusive` "VAT inclusive", `incl_vat` "Incl. VAT", `save` "Save {{ amount }}", `total` "Total", `clear_all` "Clear all", `free_delivery_over` "Free delivery over {{ amount }}", `error_generic` "Sorry, we couldn't add that to your basket. Please try again.".
  - `apex.addons`: `add` "Add", `added` "Added", `see_more` "See more".
  - `apex.size_guide.link` "Which size should I buy?".
  - `apex.trust`: `delivery` "Delivery 3–7 working days", `returns` "30-day returns", `guarantee` "10-year guarantee", `secure` "Secure checkout".
  - `apex.free_delivery`: `remaining` "You're {{ amount }} away from free delivery", `qualified` "You've got free delivery".
  - `apex.reviews`: `title` "Reviews", `based_on` "Based on {{ count }} reviews", `empty` "Be the first to review", `source_date` "Review from {{ source }} · {{ date }}", `filter_rating` "Rating", `filter_size` "Pan size", `with_photos` "With photos", `sort_newest` "Most recent", `sort_highest` "Highest rated", `sort_lowest` "Lowest rated", `results` "Showing {{ count }} reviews".
  - `apex.nav`: `features` "Features", `specs` "Specs", `reviews` "Reviews", `support` "Support", `compare` "See how it compares".
  - `apex.specs.expand_all` "Expand all".
  - `apex.basket.empty_cta` "Shop the Titanium Pro".
  - `apex.recipe`: `prep_time` "{{ minutes }} min", `serves` "Serves {{ count }}", `difficulty` "Difficulty", `cooked_with` "Cooked with".
- [ ] **Step 4:** `npm test` (PASS) e `npm run check` (0 erros). Commit `feat: British English storefront copy`.

### Task 5: Modelo de conteúdo na loja (metafields, metaobjects, menu)

**Files:**
- Create: `docs/content-model.md` (registro das definições criadas, com os IDs retornados)

**Interfaces (Produces), referência para todas as tasks seguintes:**
- Metafields de produto, namespace `apex`:

| Chave | Tipo | Observação |
|---|---|---|
| `promo_line` | `single_line_text_field` | |
| `was_label` | `single_line_text_field` | validação `choices: ["Was","RRP"]` |
| `addons` | `list.product_reference` | |
| `size_guide` | `rich_text_field` | |
| `care_support` | `rich_text_field` | |
| `specs` | `list.metaobject_reference` | → `apex_spec_row` |
| `comparison` | `list.metaobject_reference` | → `apex_comparison_row` |

- Metaobjects, todos com `access.storefront: PUBLIC_READ`:

| Tipo | Campos |
|---|---|
| `apex_spec_row` | `group` (single_line), `label` (single_line), `value` (single_line) |
| `apex_comparison_row` | `attribute` (single_line), `apexcook_value` (single_line), `coated_value` (single_line), `icon` (file_reference) |
| `apex_review` | `rating` (number_integer, 1–5), `author`, `title`, `body` (multi_line), `review_date` (date), `source` (single_line, **obrigatório**), `size` (single_line), `photos` (list.file_reference), `product` (product_reference) |
| `apex_testimonial` | `media` (file_reference), `quote` (multi_line), `author`, `source` (single_line, **obrigatório**) |

- Metafields de artigo, namespace `recipe`: `prep_minutes` (number_integer), `servings` (number_integer), `difficulty` (single_line, `choices: ["Easy","Medium","Hard"]`), `ingredients` (multi_line_text_field, um por linha), `product` (product_reference).
- Menu `main-menu` com os itens: Shop → `/collections/all`, Cookware, Tableware, Bundles, Knives, Accessories → `/collections/<handle>`. Criar as coleções vazias que faltarem, com esses handles: `cookware`, `tableware`, `bundles`, `knives`, `accessories`.

- [ ] **Step 1:** Consultar `metafieldDefinitions(ownerType: PRODUCT, namespace: "apex")` e `metaobjectDefinitions`. Esperado: vazio (registrar o resultado).
- [ ] **Step 2:** Criar as definições com `metaobjectDefinitionCreate` (metaobjects primeiro) e depois `metafieldDefinitionCreate`, descobrindo os inputs com `graphql_schema`. Cada resposta deve ter `userErrors: []`.
- [ ] **Step 3:** Criar as coleções e o menu (`collectionCreate`, `menuCreate`/`menuUpdate`).
- [ ] **Step 4:** Repetir as consultas do Step 1. Esperado: todas as definições e chaves da tabela presentes. Registrar os IDs em `docs/content-model.md`. Commit `docs: content model`.

### Task 6: Home

**Files:**
- Create: `sections/apex-split-hero.liquid`, `sections/apex-bento-mosaic.liquid`, `sections/apex-media-banner.liquid`, `sections/apex-benefits.liquid`, `sections/apex-faq.liquid`, `blocks/apex-card-cta.liquid`, `assets/apex-card-cta.js`, `assets/apex-reveal.js`, `snippets/apex-motion-styles.liquid`
- Modify: `blocks/_product-card.liquid` (incluir `"apex-card-cta"` na lista de blocks do schema), `templates/index.json`, `layout/theme.liquid` (render `apex-motion-styles` e carregar `apex-reveal.js` como módulo, gated por `[data-apex-reveal]`)

**Interfaces:**
- Produces:
  - O atributo `data-apex-reveal` em qualquer elemento ativa a entrada suave (fade + translateY 24px → 0, 500 ms). As seções o aplicam só quando `section.settings.enable_animation`.
  - `<apex-card-cta>`: para produto com uma só variante, renderiza um `<form action="/cart/add">` nativo com `id` e `return_to=/cart`. Para produto com variantes, renderiza um link para `product.url` com `apex.card.choose_size`. Quando `template.name == 'cart'`, o submit é interceptado (POST `/cart/add.js` e depois `sectionRenderer.renderSection('<id da main-cart>')`).
  - `sections/apex-benefits.liquid`: blocos `benefit` (icon image, title, text, link). É reutilizada na PDP.
  - `sections/apex-media-banner.liquid`: settings `video` (video), `mobile_image` (image), `heading`, `button_label`, `button_link`, `color_scheme`. O vídeo usa `autoplay muted loop playsinline`. Abaixo de 750 px, renderiza só a `mobile_image`.

- [ ] **Step 1:** Implementar as seções conforme a spec §3, com settings e presets para cada uma. O hero usa o esquema de cor de destaque (vermelho), e a imagem fica em cima no celular. O mosaico tem 1 bloco grande e 4 pequenos, cada um com `image` e `link` (grade 2×2 no celular). O FAQ tem blocos `question`/`answer`, botão "Expand all" (reutilizar `accordion-custom.js`) e JSON-LD `FAQPage` gerado a partir dos blocos.
- [ ] **Step 2:** Implementar `apex-card-cta` (block e JS) e `apex-reveal.js`. Com reduced motion, `apex-reveal.js` não registra o observer e `apex-motion-styles` zera as transições.
- [ ] **Step 3:** Montar `templates/index.json` na ordem: split hero → bento → product-list ("Complete your ApexCook kitchen", card com `apex-card-cta`) → product-list ("Simplify your life") → media banner → benefits → faq. Os textos provisórios saem da spec, em inglês.
- [ ] **Step 4:** `npm run check` (0 erros). Fazer o upsert dos arquivos de `node scripts/changed-files.mjs` para `APEX_THEME_ID`. No preview (navegador integrado do dono), conferir em 390 px e 1280 px:
  - todas as seções aparecem;
  - *Add* num produto de uma variante leva a `/cart` com o item;
  - *Choose size* abre a PDP;
  - com "reduzir movimento" ativo, nada anima.
- [ ] **Step 5:** Commit `feat: home sections`.

### Task 7: Dados de teste

**Files:**
- Modify: `docs/content-model.md` (IDs dos produtos de teste)

- [ ] **Step 1:** Com o link da frigideira enviado pelo dono, criar o produto "Titanium Pro Frying Pan", com variante Size 22/24/26/28 cm, preço e compare-at conforme o dono, e o tamanho 22 cm com estoque 0 para testar o caso de esgotado. Se o link ainda não chegou, usar um produto provisório com o mesmo formato e marcar como pendência.
- [ ] **Step 2:** Criar 3 adicionais (uma variante cada, um deles com estoque 0), 4 `apex_spec_row`, 5 `apex_comparison_row`, 4 `apex_review` (notas 5, 5, 4, 1, todas com `source` e data, uma com foto) e 2 `apex_testimonial`. Ligar tudo ao produto.
- [ ] **Step 3:** Consultar o produto com os metafields. Esperado: todas as referências resolvem. Commit `docs: test data ids`.

### Task 8: PDP, área de compra

**Files:**
- Create: `blocks/apex-promo-line.liquid`, `blocks/apex-rating-link.liquid`, `blocks/apex-size-guide.liquid`, `blocks/apex-addons.liquid`, `blocks/apex-buy-box.liquid`, `blocks/apex-trust-badges.liquid`, `snippets/apex-price-was.liquid`, `assets/apex-buy-box.js`, `sections/apex-pdp-anchor-nav.liquid`
- Modify: `templates/product.json`

**Interfaces:**
- Consumes: `bundleTotal`, `cartAddItems` (Task 2); `apex.*` (Task 5); `apex.buy_box.*`, `apex.addons.*` (Task 4).
- Produces:
  - `snippets/apex-price-was.liquid` com parâmetros `product`, `variant` e `compact: boolean`. Renderiza preço, "Was"/"RRP" riscado e "Save £X" **somente** se `variant.compare_at_price > variant.price`.
  - `<apex-buy-box>` recebe os eventos de troca de variante do Horizon (o mesmo evento que `variant-picker.js` emite, verificado em `assets/events.js`) e o evento interno `apex:addon-toggle` (`detail: {variantId:number, priceCents:number, available:boolean, selected:boolean}`) disparado por `apex-addons`.
  - `apex-pdp-anchor-nav` é uma barra fixa com as 4 abas mais o link "See how it compares" (`#compare`) e o mini resumo (nome, preço, botão que rola até o buy box).

- [ ] **Step 1:** Implementar os blocos conforme a spec §4.1, todos aceitos por `_product-details` via `@theme`.
  - O size guide abre em `<dialog>` (reutilizar `@theme/dialog`).
  - Os adicionais são botões `aria-pressed`, e os indisponíveis ficam `disabled` com "Sold out".
  - O buy box mostra uma linha por item, o total com `apex.buy_box.vat_inclusive`, *Clear all* e uma live region `role="status"` para erros.
  - Sem JS, o buy box é um `<form action="/cart/add">` nativo só com a variante principal.
- [ ] **Step 2:** Implementar `apex-buy-box.js`: recalcula o total com `bundleTotal` a cada evento. No submit: `fetch('/cart/add.js', {method:'POST', body: JSON.stringify(cartAddItems(...))})`. Se der certo, vai para `location.assign('/cart')`. Se falhar (status ≠ 200), mostra `description` da resposta ou `apex.buy_box.error_generic` na live region, mantém a seleção e reabilita o botão. Requisições concorrentes são abortadas com `AbortController`.
- [ ] **Step 3:** `templates/product.json`: anchor nav → product-information (galeria do Horizon com zoom; detalhes: promo line, title, rating link, price via apex-price-was, variant-picker em botões, size guide, addons, buy box, trust badges). Ativar o sticky add-to-cart do Horizon só no celular.
- [ ] **Step 4:** `npm test` e `npm run check` (0 erros). Fazer o upsert.
- [ ] **Step 5 (preview, 390 px e 1280 px):**
  - marcar 2 adicionais faz o total somar os dois;
  - *Clear all* volta ao preço base;
  - *Add to basket* leva ao basket com 3 linhas.
- [ ] **Step 6 (Review Focus 1 e 3):**
  - Selecionar 22 cm: o botão fica "Sold out" desabilitado e o total continua correto.
  - Com quantidade 999 num tamanho com estoque baixo: a resposta 422 mostra a mensagem na live region, a URL não muda e os adicionais continuam marcados.
  - O adicional esgotado não pode ser marcado.
- [ ] **Step 7:** Commit `feat: PDP buy area`.

### Task 9: PDP, história do produto e animações

**Files:**
- Create: `sections/apex-testimonials.liquid`, `sections/apex-press.liquid`, `sections/apex-sticky-story.liquid`, `sections/apex-compare-slider.liquid`, `sections/apex-comparison-table.liquid`, `sections/apex-use-cards.liquid`, `sections/apex-specs.liquid`, `sections/apex-support.liquid`
- Modify: `templates/product.json`, `snippets/apex-motion-styles.liquid`

**Interfaces:**
- Consumes: `data-apex-reveal` (Task 6), `apex-benefits` e `apex-media-banner` (Task 6), metafields `apex.specs`, `apex.comparison`, `apex.care_support` e metaobjects `apex_testimonial` (Task 5).
- Produces: as âncoras `#features` (primeira seção desta task), `#compare` (comparison table), `#specs` e `#support`.

- [ ] **Step 1:** Implementar as seções conforme a spec §4.2:
  - `apex-sticky-story`: imagem `position: sticky` com blocos `step` (heading, text) e animação de opacidade entre os passos. Cobre "No Hidden Chemicals" e "PFAS-free".
  - `apex-compare-slider`: reutiliza o bloco/JS `comparison-slider` do Horizon, com rótulos "Toxic"/"Safe" editáveis e controle por teclado.
  - `apex-comparison-table`: lê `product.metafields.apex.comparison`. Os ✓ entram com `transition-delay` por linha. Some se a lista estiver vazia.
  - `apex-specs`: agrupa por `group`, usa acordeão com "Expand all" e some se estiver vazio.
  - `apex-testimonials`: mostra "{source}" visível em cada card.
- [ ] **Step 2:** Montar `templates/product.json` na ordem da spec §4.2, com `apex-support` por último (as reviews entram antes dele, na Task 10). Todas as seções com `enable_animation` usam `data-apex-reveal`.
- [ ] **Step 3:** `npm run check` (0 erros) e upsert. No preview: as abas pulam para as seções certas, a imagem do sticky story fica fixa durante os passos, o slider responde a arraste e às setas do teclado, e com reduced motion nada se move.
- [ ] **Step 4:** Remover temporariamente o metafield `comparison` do produto de teste e confirmar que a seção some sem deixar espaço vazio. Depois, restaurar. Commit `feat: PDP story sections and scroll motion`.

### Task 10: PDP, avaliações

**Files:**
- Create: `sections/apex-reviews.liquid`, `assets/apex-reviews-list.js`
- Modify: `templates/product.json`, `blocks/apex-rating-link.liquid` (usa o mesmo resumo)

**Interfaces:**
- Consumes: `filterReviews`, `sortReviews`, `ratingSummary`, `paginate` (Task 2) e o metaobject `apex_review` (Task 5).
- Produces: `#reviews`. Liquid itera `shop.metaobjects.apex_review.values`, filtra por `product.id`, renderiza as 10 primeiras de forma estática e emite `<script type="application/json" data-apex-reviews>` com `Review[]`.

- [ ] **Step 1:** Implementar o resumo (média, total, barras de distribuição), os filtros (estrelas, tamanho, com foto), a ordenação, a paginação e a linha `apex.reviews.source_date` em cada avaliação. O JSON-LD `AggregateRating` só sai quando `count > 0`.
- [ ] **Step 2:** `apex-reviews-list.js` re-renderiza a lista a partir do JSON usando as funções puras e anuncia `apex.reviews.results` numa live region.
- [ ] **Step 3:** `npm test` e `npm run check` e upsert. No preview: filtrar 1★ mostra a avaliação negativa, a ordenação "Lowest rated" a coloca primeiro e as notas e o total batem com `ratingSummary`.
- [ ] **Step 4 (Review Focus 4):** num produto sem avaliações, aparece "Be the first to review" e o HTML não contém `AggregateRating`. Commit `feat: reviews with source and date`.

### Task 11: Basket

**Files:**
- Create: `blocks/apex-free-delivery-bar.liquid`, `assets/apex-free-delivery-bar.js`, `blocks/apex-mobile-checkout-bar.liquid`
- Modify: `templates/cart.json`

**Interfaces:**
- Consumes: `freeDeliveryProgress` (Task 2), `settings.apex_free_delivery_threshold` e `settings.apex_hero_product` (Task 3), `apex-card-cta` no modo basket (Task 6), `apex-trust-badges` (Task 8).
- Produces: `<apex-free-delivery-bar>` recalcula com `cart.total_price` a cada evento de atualização do carrinho do Horizon (o mesmo usado por `cart-icon.js`).

- [ ] **Step 1:** Montar `templates/cart.json` sobre `main-cart`:
  - título;
  - free delivery bar;
  - produtos (Horizon);
  - resumo (Horizon, com `cart-discount` e accelerated checkout ativos), com o texto "VAT inclusive" e os trust badges;
  - mobile checkout bar (fixa abaixo de 750 px, com total e Checkout);
  - `product-recommendations` com intent `complementary`, título "Complete your kitchen", 4 itens e card com `apex-card-cta`.
  - Basket vazio: texto do Horizon mais um botão `apex.basket.empty_cta` para `settings.apex_hero_product.url`.
- [ ] **Step 2:** `npm run check` e upsert.
- [ ] **Step 3 (preview):**
  - com £38 no basket, a barra diz "You're £12.00 away…";
  - ao aumentar a quantidade até passar de £50, a barra muda para "You've got free delivery" sem recarregar;
  - um código de desconto inválido mostra o erro abaixo do campo;
  - *Add* em "Complete your kitchen" atualiza a lista sem recarregar;
  - em 390 px, a barra fixa mostra o total;
  - com o basket vazio, aparece o CTA da frigideira.
- [ ] **Step 4:** Commit `feat: basket page`.

### Task 12: Cabeçalho, rodapé, categorias e busca

**Files:**
- Create: `blocks/apex-footer-company.liquid`
- Modify: `sections/header-group.json`, `sections/footer-group.json`, `templates/collection.json`, `templates/search.json`

**Interfaces:**
- Consumes: menu `main-menu` (Task 5), settings `apex_company_*` e `apex_hero_product` (Task 3), `apex-card-cta` (Task 6).

- [ ] **Step 1:**
  - Header com `main-menu` e os ícones de busca, basket e conta, sem announcement bar.
  - Footer com a policy list (Horizon), os ícones de pagamento e `apex-footer-company`, que renderiza nome, endereço e e-mail e não renderiza nada se estiverem vazios.
- [ ] **Step 2:**
  - Collection: grade 4 colunas no desktop e 2 no celular, filtros do Horizon (preço, tamanho, disponibilidade), ordenação, card com `apex-card-cta` e estado vazio com link para `settings.apex_hero_product`.
  - Search: predictive search com produtos e artigos, e estado sem resultado com o mesmo link.
- [ ] **Step 3:** `npm run check` e upsert. No preview: o menu leva às 6 coleções, a coleção vazia mostra o link e a busca "pan" sugere o produto. Commit `feat: header, footer, collections, search`.

### Task 13: About e Recipes

**Files:**
- Create: `templates/page.about.json`, `templates/article.recipe.json`, `sections/apex-recipe-meta.liquid`, `sections/apex-cooked-with.liquid`, `sections/apex-tag-filter.liquid`, `snippets/apex-product-card.liquid`
- Modify: `templates/blog.json`

**Interfaces:**
- Consumes: os metafields `recipe.*` (Task 5) e as seções `apex-split-hero`, `apex-benefits` e `apex-media-banner` (Task 6).
- Produces: `snippets/apex-product-card.liquid` com o parâmetro `product`. Renderiza imagem, título, `apex-price-was` (compact) e o mesmo CTA de `apex-card-cta`.

- [ ] **Step 1:** About: hero, media-with-content do Horizon, benefits e media banner.
- [ ] **Step 2:** Blog: cards com imagem, título, `recipe.prep_minutes` e `recipe.difficulty`, mais `apex-tag-filter` (links `/blogs/<handle>/tagged/<tag>`).
- [ ] **Step 3:** Receita:
  - meta (tempo, porções, dificuldade, ingredientes como lista);
  - conteúdo do Horizon;
  - "Cooked with" (some se `recipe.product` estiver vazio);
  - JSON-LD `Recipe` (name, image, totalTime `PT{n}M`, recipeYield, recipeIngredient, datePublished).
- [ ] **Step 4:** Criar a página "About" (template `page.about`), o blog "Recipes" e 1 receita de teste. `npm run check` e upsert. No preview: os filtros por tag funcionam, o JSON-LD da receita é JSON válido (`JSON.parse` no console) e o "Cooked with" adiciona o produto. Commit `feat: about and recipes`.

### Task 14: Verificação final e entrega para revisão

**Files:**
- Modify: `docs/deploy.md` (resultados)

- [ ] **Step 1:** `npm test` (todos PASS), `npm run check` (0 erros) e upsert completo. Conferir que o tema ApexCook continua `UNPUBLISHED` e o Zenith continua `MAIN` (consulta `themes`).
- [ ] **Step 2:** Lighthouse no perfil de celular, na Home e na PDP do preview: desempenho ≥ 80 e acessibilidade ≥ 90. Rodar com `npx lighthouse` se houver Chrome no workspace e a loja estiver acessível. Caso contrário, pelo DevTools no navegador do dono, registrando como o teste foi feito.
- [ ] **Step 3:** Repassar a checklist da spec §7.2 inteira no preview (390 px e 1280 px) e registrar o resultado item a item em `docs/deploy.md`.
- [ ] **Step 4:** Revisão independente do branch inteiro, com spec e plano em mãos.
- [ ] **Step 5:** Enviar ao dono o link de preview e a checklist de lançamento (spec §8), somando a ela: aplicar logo, cores e fonte no checkout pelo editor de checkout da Shopify (*Settings → Checkout → Customize*). No plano Basic isso é feito no editor, não pela API. **Não publicar.** Commit `docs: verification results`.
