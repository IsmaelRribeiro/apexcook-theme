# Deploy — ApexCook theme

- Loja: 1674jn-p8.myshopify.com
- Tema de trabalho: o tema ligado ao GitHub (branch `shopify` de IsmaelRribeiro/apexcook-theme). O duplicado via API (`…/211288555862`) fica obsoleto e pode ser apagado pelo dono.
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

## Deploy via GitHub (a partir de 2026-11-09)
- Tema de trabalho: `apexcook-theme/shopify` (gid://shopify/OnlineStoreTheme/211291177302), ligado ao branch `shopify`.
- Preview: https://1674jn-p8.myshopify.com/?preview_theme_id=211291177302
1. Trazer o que a Shopify gravou: `git fetch origin shopify` e aplicar o diff dos commits "Update from Shopify…" em `theme/` (`git diff A B | sed 's#[ab]/#&theme/#' | git apply`).
2. Publicar: `scripts/publish-theme.sh "mensagem"` (commita theme/ em cima de origin/shopify; nunca force-push).
3. Conferir checksums: `scripts/md5.sh <arquivos>` vs `checksumMd5` da Admin API.
