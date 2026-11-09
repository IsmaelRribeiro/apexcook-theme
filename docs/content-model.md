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
