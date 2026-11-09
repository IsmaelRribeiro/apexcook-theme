# ApexCook: Tema Shopify (spec de design)

- **Data:** 2026-11-09
- **Status:** aguardando revisão do dono
- **Loja:** 1674jn-p8.myshopify.com (plano Basic, GBP, Reino Unido)

## 1. Objetivo e contexto

A ApexCook é um e-commerce de utensílios de cozinha para o Reino Unido. O produto principal é uma frigideira de titânio, e os anúncios pagos levam o tráfego até a página dela.

O objetivo deste trabalho é criar um tema Shopify próprio a partir dos esboços no Figma (Home e PDP). As demais páginas seguem o funcionamento das referências da Samsung UK, com a identidade da ApexCook.

**Critério de sucesso:** quem chega pelo anúncio entende o produto, confia na loja e compra rapidamente, inclusive no celular. O tema é editável pelo dono no editor visual da Shopify, sem código.

### Decisões já tomadas
| Tema | Decisão |
|---|---|
| Situação da loja | A loja existe e está vazia. Zenith é o tema publicado e Horizon está guardado sem publicar. Não há produtos. |
| Abordagem | Duplicar o **Horizon** como tema **"ApexCook"** (sem publicar) e criar nele seções próprias |
| Idioma | Apenas **inglês britânico** (Basket, Colour, Delivery) |
| Fonte | **Google Sans Flex** (OFL 1.1), variável, hospedada no próprio tema |
| Carrinho | **Página inteira** (/cart), estilo Samsung. *Add to basket* leva o cliente ao basket. |
| Adicionais na PDP | **Marcar para levar junto**: tudo entra no basket com um único clique |
| Avaliações | Lançamento com avaliações cadastradas à mão, **todas** (inclusive negativas), **com origem e data visíveis**. Depois, troca para **Trustpilot**. |
| Entrega | **Grátis acima de um valor**, com barra de progresso (padrão £50, configurável) |
| Animações | Animações de rolagem leves, respeitando "reduzir movimento" |
| Aba Support (PDP) | Seção de cuidados e suporte |
| Páginas | Home, PDP, Basket, Categorias, Busca, Políticas, About, Recipes (blog e receita) |
| Fora do escopo | Personalização da área do cliente (fica o padrão da Shopify), troca de aparelho usado, seguro, parcelamento, consulta de frete por CEP, realidade aumentada |

## 2. Estrutura global

### 2.1 Tema
- Base: cópia do Horizon renomeada para "ApexCook", com role UNPUBLISHED até a aprovação final.
- Zenith continua publicado durante todo o desenvolvimento e serve de reserva depois do lançamento.
- Todo o conteúdo editável fica em seções e blocos do editor (Online Store 2.0). Nenhum texto de marketing fica fixo no código.

### 2.2 Identidade visual (Theme settings)
- **Cores:** vermelho ApexCook (botões e destaques), preto (seções de impacto), branco (fundo) e cinza claro (cards e caixa de compra). Todas configuráveis.
- **Tipografia:** Google Sans Flex variável em `.woff2` dentro de `assets/`, com `@font-face` próprio, `font-display: swap` e preload na PDP e na Home. O arquivo de licença OFL vai junto. A fonte substitui a do Horizon em títulos e textos. Nada é carregado dos servidores do Google.
- **Botões:** retangulares, vermelhos, com texto branco.

### 2.3 Cabeçalho
Logo, menu **Shop · Cookware · Tableware · Bundles · Knives · Accessories** (definido em *Navigation*) e ícones de busca, basket (com contador) e conta.

### 2.4 Rodapé
Links das políticas (Delivery, Returns, Privacy, Terms), contato, ícones de pagamento e **dados da empresa** (razão social, endereço e e-mail), que são obrigatórios para quem vende online no Reino Unido.

### 2.5 Modelo de conteúdo
| Dado | Onde fica |
|---|---|
| Frigideira e tamanhos | Produto com a variante **Size** (22/24/26/28 cm) |
| Preço anterior | Compare-at price. O rótulo "Was" ou "RRP" é escolhido por um metafield do produto. O "Save £X" só aparece se houver compare-at. |
| Linha de promoção da PDP | Metafield de texto do produto |
| Especificações | Metaobject `spec_row` (grupo, rótulo, valor) ligado ao produto por um metafield de lista |
| Comparativo | Metaobject `comparison_row` (atributo, valor ApexCook, valor "coated pan", ícone) ligado ao produto |
| Alegações (PFAS-free etc.) | Blocos de texto das seções da PDP, editáveis |
| Adicionais | Metafield de lista de produtos `addons` no produto |
| Avaliações | Metaobject `review`: nota (1–5), autor, título, texto, data, **origem** (texto, ex.: "Amazon UK"), tamanho comprado (opcional), fotos (opcional), produto |
| Depoimentos | Metaobject `testimonial`: mídia (imagem ou vídeo), texto, autor, **origem** |
| Guia de tamanhos | Metafield de texto rico do produto |
| Cuidados e suporte | Metafield de texto rico do produto, mais links para as políticas |
| Receitas | Artigos de blog com metafields: tempo, porções, dificuldade, ingredientes, produto usado |

## 3. Home

As seções seguem a ordem do Figma. Todas podem ser reordenadas, duplicadas ou escondidas no editor.

1. **Hero dividido:** bloco vermelho com uma linha pequena e o título à esquerda, imagem à direita e link opcional. No celular, a imagem fica em cima.
2. **Mosaico "Black Shop":** título, 1 imagem grande e 4 pequenas, cada uma com link. No celular, a grande fica em cima e as pequenas em grade 2×2.
3. **Vitrine de produtos** ("Complete your ApexCook kitchen"): 4 cards (imagem, nome, subtítulo, botão) vindos de uma coleção escolhida. O botão é *Add* para produto com uma só variante (adiciona e vai ao basket) ou *Choose size* para produto com tamanhos (vai à PDP). No celular, vira carrossel.
4. **Segunda vitrine** ("Simplify your life"): a mesma seção com outra coleção.
5. **Banner de mídia (faixa preta):** vídeo sem som em loop no desktop e imagem no celular, com título curto e botão opcional.
6. **Benefícios** ("Join ApexCook"): 4 cards com ícone, título, texto e link. É uma seção reutilizável.
7. **FAQ:** acordeão com *Expand all* e marcação FAQPage (JSON-LD).

## 4. PDP (página da frigideira)

### 4.1 Área de compra
- **Topo:** linha de promoção (metafield), título, estrelas com nota e número de avaliações (link para #reviews).
- **Barra fixa ao rolar:** nome, preço, *Add to basket* e as abas **Features · Specs · Reviews · Support**, com o link "See how it compares" levando ao comparativo.
- **Galeria (esquerda):** imagem principal, miniaturas, galeria em tela cheia com zoom e carrossel de deslizar no celular.
- **Coluna direita:**
  - **Choose your size:** botões em cm. A troca de tamanho atualiza preço, galeria e URL. Tamanho sem estoque aparece desabilitado com "Out of stock".
  - **Which size should I buy?:** link que abre o guia de tamanhos (metafield) em painel.
  - **Add-ons:** cada item mostra imagem, nome, preço, "Was" riscado e "Save £X". O botão *Add* alterna para "Added ✓". Até 3 itens visíveis, com *See more* para os demais.
  - **Caixa de compra (cinza):** a frigideira e o tamanho, mais uma linha por adicional marcado, **Total "VAT inclusive"** atualizado na hora, *Clear all*, "Was"/"RRP" e "Save £X" (só com compare-at), botão **Add to basket** e o aviso "Free delivery over £X".
  - **Selos:** *Delivery 3–7 working days · 30-day returns · 10-year guarantee*, cada um com link para a política correspondente.

**Comportamento do Add to basket:** uma única chamada a `/cart/add.js` com a frigideira e todos os adicionais marcados, seguida de redirecionamento para `/cart`. Se falhar (falta de estoque, por exemplo), aparece uma mensagem abaixo do botão e o cliente continua na página.

### 4.2 História do produto (em ordem)
1. **Features** (#features): abertura.
2. **"What people are saying":** 4 depoimentos (metaobject `testimonial`) com a origem visível.
3. **Chef highlights + "Featured in":** 2 cards e uma faixa de logos, todos editáveis.
4. **"No Hidden Chemicals":** texto sobre o titânio em fundo preto.
5. **"PFAS-free. Truly.":** banner com imagem.
6. **Toxic vs Safe:** controle deslizante de comparação entre duas imagens, que funciona com arraste, toque e teclado.
7. **"How Titanium Pro Compares":** tabela de duas colunas vinda dos metaobjects `comparison_row`.
8. **"One Pan for Everything":** 4 cards de usos, em carrossel no celular.
9. **Benefícios:** a mesma seção da Home.
10. **Specs** (#specs): acordeão agrupado com *Expand all*.
11. **Reviews** (#reviews): nota média, total, barras de distribuição, filtros (estrelas, tamanho, com foto), ordenação (mais recentes, nota mais alta, nota mais baixa) e paginação. Cada avaliação mostra **origem e data**. Sem avaliações, aparece "Be the first to review". Marcação Product + AggregateRating (JSON-LD) só com avaliações reais.
12. **Support** (#support): como usar e limpar, garantia de 10 anos, entrega e devoluções, e contato.

A troca futura para o Trustpilot substitui a fonte de dados da seção 11 pelo widget ou app do Trustpilot, sem mudar o restante da página.

### 4.3 Animações de rolagem
- **Entrada suave:** títulos e cards fazem fade com leve deslocamento ao entrar na tela.
- **Imagem fixa:** nas seções 4 e 5, a imagem fica parada enquanto os textos passam.
- **Comparativo:** os ✓ aparecem linha por linha.
- **Implementação:** CSS scroll-driven animations, com IntersectionObserver como alternativa, sem bibliotecas externas. Versão reduzida no celular.
- **Acessibilidade:** `prefers-reduced-motion: reduce` desliga todas as animações. Cada seção tem o setting "Enable animation".

## 5. Basket (/cart)
- **Desktop, duas colunas.** À esquerda, os itens: imagem, nome, tamanho, preço (com "Was"), quantidade − / +, *Remove* e total da linha. À direita, resumo fixo: *Subtotal*, *Delivery*, campo *Discount code*, **Total "VAT inclusive"**, **Checkout**, botões de pagamento expresso (dynamic checkout) e os selos *Secure checkout · 30-day returns*.
- **Barra de frete grátis:** "You're £X away from free delivery" ou "You've got free delivery ✓". O valor fica em Theme settings (padrão £50).
- **"Complete your kitchen":** 4 recomendações complementares (Shopify product recommendations). O *Add* atualiza o basket sem recarregar a página (Section Rendering API).
- **Celular:** os itens em cima, o resumo embaixo e uma barra fixa no rodapé com o total e o *Checkout*.
- **Situações especiais:**
  - basket vazio: mensagem, link para a frigideira e uma vitrine;
  - falta de estoque ou limite de quantidade: aviso na própria linha;
  - código de desconto inválido: mensagem abaixo do campo;
  - falha de rede: o item volta ao estado anterior e aparece um aviso.
- **Checkout:** o padrão da Shopify, com logo, cores e fonte dentro do que o plano Basic permite.

## 6. Demais páginas
- **Categorias:** título, descrição, banner opcional e grade (4 colunas no desktop, 2 no celular) com o card da Home. Filtros (preço, tamanho, disponibilidade) e ordenação, com os filtros em painel no celular. Categoria vazia mostra mensagem e link para a frigideira.
- **Busca:** sugestões enquanto o cliente digita (produtos e receitas) e página de resultados com a mesma grade. Sem resultado, mostra sugestões e o link para a frigideira.
- **Políticas:** layout de texto limpo. O conteúdo é editado no painel e não faz parte do tema.
- **About:** página montada com seções reaproveitadas (hero, imagem + texto, benefícios, banner de mídia).
- **Recipes (lista):** cards com foto, título, tempo e dificuldade, e filtro por tags.
- **Receita:** foto, tempo, porções, dificuldade, ingredientes, modo de preparo, bloco **"Cooked with"** (card do produto com *Add*) e marcação Recipe (JSON-LD).

## 7. Testes e publicação

### 7.1 Fluxo de trabalho
1. Duplicar o Horizon como "ApexCook" via Admin API (`themeDuplicate`). Se o conector não tiver permissão, usar a Shopify CLI com uma senha do Theme Access.
2. Desenvolver numa cópia local versionada com git e enviar os arquivos com `themeFilesUpsert`.
3. **Dados de teste:** cadastrar a frigideira real (quando o dono enviar o link) e alguns adicionais de exemplo. Antes disso, confirmar com o dono que a loja está protegida por senha.

### 7.2 Verificações antes da entrega
- **Theme Check** sem erros.
- **Fluxos no preview:**
  - escolher tamanho, marcar adicionais e ver o total atualizar;
  - *Add to basket* e chegar ao basket com tudo dentro;
  - alterar quantidade e remover itens;
  - barra de frete antes e depois do valor mínimo;
  - código de desconto inválido;
  - basket vazio e item sem estoque.
- **Layout:** celular (360–430 px) e desktop (≥1280 px).
- **Animações:** funcionam e se desligam com reduced motion.
- **Lighthouse (perfil de celular) na Home e na PDP:** desempenho ≥ 80 e acessibilidade ≥ 90.

### 7.3 Revisão e publicação
1. Enviar o link de preview ao dono.
2. Ajustar conforme os pedidos.
3. Publicar o "ApexCook" só com a aprovação do dono. O Zenith fica como reserva, e a volta leva um clique.

## 8. Checklist de lançamento (fora do tema, responsabilidade do dono)
- [ ] Renomear a loja de "Minha loja 2" para ApexCook.
- [ ] Ajustar o fuso horário para Europe/London.
- [ ] Criar a regra de frete grátis em *Settings → Shipping* com o mesmo valor do tema.
- [ ] Publicar os textos das políticas (Delivery, Returns, Privacy, Terms), incluindo o direito legal de cancelamento em 14 dias.
- [ ] Preencher os dados da empresa no rodapé.
- [ ] Ter comprovação das alegações (PFAS-free, non-toxic, comparativos, 10 anos de garantia, "medical titanium"), conforme as regras da ASA/CAP.
- [ ] Usar só preços "Was"/"RRP" reais e praticados (orientação da CMA sobre preços).
- [ ] Publicar as avaliações e depoimentos sem filtrar as negativas e com origem (DMCC Act 2024).
- [ ] Usar só imagens, fotos de pessoas e logos de imprensa com autorização.
- [ ] Remover a senha da loja no lançamento.
- [ ] Depois: instalar o Trustpilot e trocar a fonte das avaliações.

## 9. Pendências de insumos
- Link da frigideira (fornecedor ou especificações) para cadastrar o produto real.
- Imagens e vídeos finais (hero, mosaico, banner, depoimentos, titânio, usos).
- Logo da ApexCook.
- Textos finais em inglês. Placeholders em inglês serão usados até lá.
