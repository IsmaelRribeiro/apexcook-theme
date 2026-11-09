# Deploy — ApexCook theme

- Loja: 1674jn-p8.myshopify.com
- APEX_THEME_ID: `gid://shopify/OnlineStoreTheme/211288555862` (UNPUBLISHED, duplicado do Horizon 4.4.0 da loja em 2026-11-09)
- Preview: https://1674jn-p8.myshopify.com/?preview_theme_id=211288555862
- Editor: Shopify admin → Online Store → Themes → ApexCook → Customize
- Zenith (`…/210761122134`) é o tema MAIN e nunca é alterado; nunca publicar via API.

## Upsert
1. `node scripts/changed-files.mjs` lista os arquivos (relativos a `theme/`) alterados desde `horizon-4.4.0`.
2. Enviar com `themeFilesUpsert(themeId: APEX_THEME_ID, files: [...])`, no máximo 50 por chamada.
   Texto: `{filename, body: {type: TEXT, value}}`; binários (woff2): `{type: BASE64, value}`.
3. Conferir `userErrors: []` e `upsertedThemeFiles`.

## Baseline
- Theme Check no Horizon puro: 0 erros, 7 avisos (3 arquivos), `shopify` CLI 5.0.1 offline OK.
