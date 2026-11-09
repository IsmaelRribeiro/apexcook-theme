# Content model (criado em 2026-11-09)

## Metaobjects (storefront PUBLIC_READ)
| Tipo | ID | Campos |
|---|---|---|
| apex_spec_row | gid://shopify/MetaobjectDefinition/63405916502 | group, label*, value* |
| apex_comparison_row | gid://shopify/MetaobjectDefinition/63405949270 | attribute*, apexcook_value, coated_value, icon |
| apex_review | gid://shopify/MetaobjectDefinition/63405982038 | rating* (1–5), author*, title, body, review_date*, source*, size, photos, product* |
| apex_testimonial | gid://shopify/MetaobjectDefinition/63406014806 | media, quote*, author*, source* |

## Metafields de produto (apex.*)
promo_line, was_label (Was|RRP), addons (list.product_reference), size_guide (rich text), care_support (rich text), specs (→ apex_spec_row), comparison (→ apex_comparison_row)

## Metafields de artigo (recipe.*)
prep_minutes, servings, difficulty (Easy|Medium|Hard), ingredients (multi-line), product (product_reference)

## Coleções (publicadas no canal Loja virtual, publication 374064939350)
cookware 717861781846 · tableware 717861814614 · bundles 717861847382 · knives 717861912918 · accessories 717861945686

## Menu
apexcook-main (gid://shopify/Menu/338410570070): Shop, Cookware, Tableware, Bundles, Knives, Accessories

## Dados de teste (tag `apex-test-data` — APAGAR antes do lançamento)
- Titanium Pro Frying Pan `gid://shopify/Product/11456327319894` (provisório até chegarem os dados da CJ): 22 cm £49.99 (Was £69.99, estoque 0), 24 cm £54.99 (Was £74.99, estoque 3), 26 cm £59.99 (Was £79.99), 28 cm £64.99 (sem compare-at)
- Add-ons: Titanium Spatula 11456326926678 (£14.99, Was £19.99), Tempered Glass Lid 11456326992214 (£19.99), Silicone Handle Sleeve 11456327024982 (£7.99, estoque 0)
- Specs 672571883862, 672571916630, 672571949398, 672571982166
- Comparison 672572014934, 672572047702, 672572080470, 672572113238, 672572146006
- Reviews (source "Test data") 672572178774 (5★), 672572211542 (5★), 672572244310 (4★), 672572277078 (1★)
- Testimonials 672572309846, 672572342614
