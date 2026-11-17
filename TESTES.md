# Testes — Cafeteria Pedido Certo v0.1

## Situação inicial da entrega

**Testes preparados, não executados no ambiente de geração.** Não existem resultados efetivamente observados registrados nesta entrega. Os resultados abaixo são expectativas, não afirmações de aprovação.

A equipe deve revisar o código, executar os testes, registrar evidências e descrever suas próprias contribuições. Não substituir execução por leitura do código.

## Execução observada nesta revisão

Em 17/11/2026, a página `tests.html` foi aberta como arquivo local no navegador integrado e executou **25 testes aprovados e 0 reprovados**. Também foram exercitados os fluxos da interface no mesmo ambiente local: CA01–CA08 apresentaram os resultados esperados. Para CA06 na interface, foram testadas as entradas vazia, `0`, `-1`, `1.5` e `abc`; as outras entradas inválidas listadas abaixo foram cobertas pelos testes automáticos das regras.

O projeto foi publicado como repositório público [AdeilmoJunior1/cafeteria-pedido-certo-fund-prog](https://github.com/AdeilmoJunior1/cafeteria-pedido-certo-fund-prog). O GitHub Pages foi configurado pela branch `main`, pasta raiz. Em 17/11/2026, as páginas `index.html` e `tests.html` responderam com HTTP 200; a suíte automática no endereço publicado executou **25 testes aprovados e 0 reprovados**. No site publicado, CA03/CA08 foram exercitados e exibiram subtotal de R$ 30,00, desconto de R$ 3,00 e total de R$ 27,00; a confirmação manteve o resumo e bloqueou os controles de inclusão e finalização.

Não foram verificados teclado, leitor de tela, responsividade ou outros navegadores. A versão do navegador integrado não foi exposta. Estes resultados não substituem a revisão e os registros próprios da equipe.

## Preparação

1. Extraia os arquivos para a mesma pasta.
2. Abra `index.html` no navegador. Não é necessário servidor.
3. Abra `tests.html` em outra aba para os testes automáticos.
4. Anote data, responsável, navegador/versão, sistema operacional e ambiente (local ou Pages).
5. Nos testes manuais, recarregue `index.html` antes de cada caso independente. CA05 usa duas inclusões no mesmo pedido; CA06 preserva um pedido anterior; CA08 verifica o estado finalizado.
6. Repita a suíte manual e automática no endereço publicado no GitHub Pages.

## Testes automáticos

`tests.html` carrega `regras.js` antes de `tests.js` e executa os casos automaticamente. Cada linha mostra APROVADO/REPROVADO, esperado e observado. Uma exceção aparece no campo observado e reprova o caso. Recarregue para repetir.

São preparados testes para:

- Dados fixos do cardápio (CA01), não sua apresentação visual.
- Totais de CA02, CA03 e CA04.
- Acumulação e linha única em CA05.
- Recusa e preservação do pedido em CA06: vazio, espaços, zero, negativo, fração com ponto, fração com vírgula, texto, infinito e inteiro inseguro.
- Produto fora do cardápio (RN01).
- Pedido vazio não finalizado (CA07).
- Finalização válida, totais, bloqueio de inclusão e recusa de segunda finalização (parte lógica de CA08).
- Limites diretos de subtotal: 2.999 → desconto 0 / total 2.999; 3.000 → desconto 300 / total 2.700; 3.001 → desconto 300 / total 2.701.
- Arredondamento de meio centavo, formatação brasileira, preservação do objeto anterior, recusa de item adulterado e proteção de valor inseguro.

Os testes diretos dos limites não criam novos produtos. Os números monetários são centavos, exceto no teste textual de formatação. Esses testes não verificam DOM, visual, foco, anúncios do leitor de tela ou publicação.

## Testes manuais obrigatórios

### CA01 — abrir a aplicação

1. Abra ou recarregue `index.html`.
2. Confira título e indicação de protótipo com preços fictícios.
3. Confira os quatro produtos no cardápio e na seleção.

Esperado: Café espresso R$ 6,00; Cappuccino R$ 10,00; Pão de queijo R$ 5,00; Sanduíche R$ 15,00. Nenhum produto extra. Pedido vazio, valores zerados, resumo disponível e informação “10% de desconto em pedidos a partir de R$ 30,00”.

### CA02 — subtotal abaixo do desconto

1. Recarregue a aplicação.
2. Selecione Café espresso, informe 2 e clique em Adicionar.
3. Selecione Pão de queijo, informe 1 e clique em Adicionar.

Esperado: duas linhas; café com quantidade 2, preço R$ 6,00 e valor R$ 12,00; pão com quantidade 1, preço e valor R$ 5,00. Subtotal R$ 17,00, desconto R$ 0,00 e total R$ 17,00.

### CA03 — limite inclusivo

1. Recarregue.
2. Adicione 1 Sanduíche, 1 Cappuccino e 1 Pão de queijo.

Esperado: valores dos itens R$ 15,00, R$ 10,00 e R$ 5,00; subtotal R$ 30,00, desconto R$ 3,00 e total R$ 27,00.

### CA04 — acima do limite

1. Recarregue.
2. Adicione 3 Sanduíches.

Esperado: uma linha, quantidade 3, preço unitário R$ 15,00, valor R$ 45,00; subtotal R$ 45,00, desconto R$ 4,50 e total R$ 40,50.

### CA05 — produto repetido

1. Recarregue.
2. Adicione 1 Café espresso.
3. Adicione mais 2 Cafés espresso.

Esperado: uma única linha de café, quantidade acumulada 3, preço R$ 6,00, valor R$ 18,00; subtotal R$ 18,00, desconto R$ 0,00 e total R$ 18,00.

### CA06 — quantidade inválida preserva pedido

1. Recarregue e adicione 1 Café espresso.
2. Selecione Pão de queijo.
3. Tente adicionar, separadamente: campo vazio, `0`, `-1`, `1.5` e `abc`. Teste também espaços e `1,5`.
4. Após cada tentativa, confira linhas e valores.

Esperado em cada tentativa: inclusão recusada, mensagem clara em português próxima ao formulário, foco no campo quantidade e indicação `aria-invalid`. O pedido continua com uma linha de café, quantidade 1, subtotal e total R$ 6,00, desconto R$ 0,00. Não deve truncar `1.5` para 1.

### CA07 — finalizar sem itens

1. Recarregue.
2. Clique em Finalizar pedido sem incluir produtos.

Esperado: orientação para adicionar ao menos um item válido; nenhuma confirmação exibida; controles de inclusão continuam disponíveis, pedido não finalizado e valores zerados.

### CA08 — finalizar pedido válido

1. Recarregue e monte o pedido de CA03.
2. Confira o resumo antes de finalizar.
3. Clique em Finalizar pedido.
4. Confira a confirmação e tente usar os controles de inclusão.

Esperado: confirmação na própria página com subtotal R$ 30,00, desconto R$ 3,00 e total R$ 27,00. Resumo permanece visível. Foco vai à confirmação. Seleção, quantidade, Adicionar e Finalizar ficam desabilitados. Não há pagamento nem mudança dos itens. O teste automático verifica também o bloqueio na lógica, independentemente da desabilitação visual.

## Verificações adicionais da interface

### Seleção ausente

Recarregue e clique em Adicionar sem selecionar produto. Esperado: mensagem para selecionar produto pertencente ao cardápio, foco na seleção e nenhum item incluído. A recusa de ID inexistente é testada diretamente em `tests.js`.

### Teclado e acessibilidade

1. Execute um pedido usando Tab, Shift+Tab, setas na seleção e Enter/Espaço nos botões.
2. Confira rótulos visíveis, foco visível e ordem compreensível.
3. Com leitor de tela, provoque erro de quantidade e finalize um pedido válido.
4. Confira que as mensagens são anunciadas pela região `aria-live` e que a confirmação recebe foco.

Esperado: fluxo utilizável sem mouse e mensagens compreensíveis. Registrar ferramenta utilizada; se leitor de tela não estiver disponível, marcar essa parte como não executada, não aprovada.

### Responsividade

Confira em largura de aproximadamente 360 px e em tela de computador. Esperado: painéis empilhados na tela estreita, controles legíveis e tabela rolável dentro do seu contêiner quando necessário, sem esconder valores.

### Memória e recarga

Adicione um item ou finalize um pedido e recarregue. Esperado: pedido reiniciado, confirmação oculta, valores zerados. Isso é uma limitação documentada, não persistência defeituosa.

### Local e GitHub Pages

Execute os testes por abertura local e depois no endereço publicado. No Pages, confira que `index.html`, CSS e scripts carregam sob o caminho do repositório e que `tests.html` abre no mesmo site. Não foram observados resultados de implantação nesta entrega.

## Registro de execução pela equipe

Preencha apenas após executar. Para casos automáticos, registre o resultado mostrado por `tests.html` e guarde captura ou transcrição com esperado/observado. Para testes manuais, descreva o que efetivamente ocorreu.

- Data:
- Responsável:
- Navegador e versão:
- Sistema operacional:
- Ambiente e endereço:
- Commit/tag revisado:
- Evidências:

| Caso | Esperado | Observado | Situação inicial |
|---|---|---|---|
| CA01 | Quatro produtos e preços corretos | Não observado | Preparado; não executado |
| CA02 | 17,00 / 0,00 / 17,00 | Não observado | Preparado; não executado |
| CA03 | 30,00 / 3,00 / 27,00 | Não observado | Preparado; não executado |
| CA04 | 45,00 / 4,50 / 40,50 | Não observado | Preparado; não executado |
| CA05 | Uma linha, quantidade 3, R$ 18,00 | Não observado | Preparado; não executado |
| CA06 | Recusa e preservação para cada entrada | Não observado | Preparado; não executado |
| CA07 | Orientação, sem confirmação | Não observado | Preparado; não executado |
| CA08 | Confirmação correta, resumo mantido, bloqueio | Não observado | Preparado; não executado |
| Limite 2.999 | Desconto 0, total 2.999 centavos | Não observado | Preparado; não executado |
| Limite 3.000 | Desconto 300, total 2.700 centavos | Não observado | Preparado; não executado |
| Limite 3.001 | Desconto 300, total 2.701 centavos | Não observado | Preparado; não executado |
| Demais automáticos | Conforme colunas de tests.html | Não observado | Preparado; não executado |
| Teclado/leitor de tela | Fluxo e anúncios acessíveis | Não observado | Preparado; não executado |
| Responsividade | Conteúdo legível e utilizável | Não observado | Preparado; não executado |
| Recarga | Pedido reiniciado | Não observado | Preparado; não executado |
| Local/Pages | Aplicação e testes carregam | Não observado | Preparado; não executado |

## Contribuições da equipe

Registre quem revisou regras, interface, testes, documentação e publicação; quais correções foram feitas; quais testes foram repetidos; e quais limitações continuam sem verificação. Identifique a entrega revisada com a tag `v0.1`, preservando-a em evoluções futuras.
