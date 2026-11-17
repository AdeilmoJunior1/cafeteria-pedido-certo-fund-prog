# Cafeteria Pedido Certo — v0.1

**Demonstração pública:** [abrir a Cafeteria Pedido Certo](https://adeilmojunior1.github.io/cafeteria-pedido-certo-fund-prog/) · [abrir testes](https://adeilmojunior1.github.io/cafeteria-pedido-certo-fund-prog/tests.html)

## Objetivo, usuário e escopo

Protótipo educacional para o atendente do balcão de uma pequena cafeteria montar um pedido e conferir os valores com o cliente antes de finalizá-lo. Atende um pedido por vez, com quatro produtos fixos e uma regra de desconto.

Fluxo: consultar cardápio → selecionar produto → informar quantidade → adicionar → conferir resumo → finalizar.

Não implementa login, estoque, mesas, comandas, entrega, pagamento, emissão fiscal, relatórios nem histórico permanente.

## Arquivos

```text
index.html
styles.css
regras.js
script.js
tests.html
tests.js
README.md
TESTES.md
```

- `index.html`: estrutura, formulário, resumo, mensagens e confirmação.
- `styles.css`: aparência responsiva, contraste e foco visível.
- `regras.js`: regras de negócio sem acesso ao DOM, expostas em `window.CafeteriaRegras`.
- `script.js`: integração entre formulário, funções e apresentação.
- `tests.html` e `tests.js`: testes automáticos sem bibliotecas, reutilizando `regras.js`.
- `TESTES.md`: roteiro manual e modelo de registro da execução.

## Execução local

1. Extraia o ZIP mantendo os oito arquivos na mesma pasta.
2. Abra `index.html` diretamente no navegador.
3. Monte o pedido e confira o resumo antes de finalizar.
4. Abra `tests.html` ou use o link no rodapé para executar os testes das regras.
5. Recarregue `tests.html` para repetir os testes; recarregue `index.html` para iniciar outro pedido.

Não é necessário Node.js, Python, servidor, instalação de dependências, conta de serviço, chave de API ou etapa de build. Os scripts são clássicos, carregados com `defer`, com `regras.js` antes do script consumidor. Não há módulos, `fetch` nem recursos externos.

## Publicação no GitHub Pages a partir de uma branch

1. Crie um repositório no GitHub e envie os oito arquivos para a raiz da branch escolhida, por exemplo `main`. Não envie apenas o ZIP.
2. Confirme que `index.html` está na raiz do repositório, não em uma subpasta.
3. Nas configurações do repositório, abra a seção Pages.
4. Escolha a origem de implantação a partir de uma branch (opção normalmente denominada `Deploy from a branch`).
5. Selecione a branch que contém a entrega e a pasta raiz (`/(root)`). Salve a configuração.
6. Aguarde a implantação e confira o endereço apresentado pelo GitHub Pages. O endereço de um site de projeto costuma ter a forma `https://usuario.github.io/nome-do-repositorio/`; use o endereço efetivamente informado pelo GitHub.
7. Abra o site e execute os testes manuais. Confira carregamento do CSS, cardápio e resumo.
8. Acesse `tests.html` no mesmo endereço-base: `https://usuario.github.io/nome-do-repositorio/tests.html`.

A disponibilidade do Pages depende das permissões e configurações do repositório. A nomenclatura da interface do GitHub pode mudar. Os caminhos da aplicação são relativos (`./`), permitindo publicação em uma subpasta de site sem configuração de roteamento.

## Cardápio fixo

| ID | Produto | Preço fictício |
|---|---|---:|
| cafe-espresso | Café espresso | R$ 6,00 |
| cappuccino | Cappuccino | R$ 10,00 |
| pao-de-queijo | Pão de queijo | R$ 5,00 |
| sanduiche | Sanduíche | R$ 15,00 |

Não há cadastro, edição nem exclusão de produtos.

## Regras e funções relevantes

| Regra | Implementação em regras.js |
|---|---|
| RN01 — somente produtos fixos | `validarProdutoEQuantidade`, também usada por `calcularPedido` |
| RN02 — inteiro positivo | `validarProdutoEQuantidade`, com `Number` e `Number.isSafeInteger`, sem `parseInt` |
| Inclusão e acumulação | `adicionarItem`, que retorna um novo pedido válido ou preserva o anterior |
| RN03 — preço × quantidade acumulada | `calcularPedido` |
| RN04 — soma dos itens | `calcularPedido` |
| RN05 — 10% a partir de 3.000 centavos | `calcularTotaisDoSubtotal` |
| RN06 — subtotal menos desconto e formato brasileiro | `calcularTotaisDoSubtotal` e `formatarMoeda` |
| RN07 — impedir finalização vazia | `finalizarPedido` |
| Bloqueio depois de finalizar | `finalizarPedido` e `adicionarItem`; a interface também desabilita os controles |

Todos os valores monetários usados nos cálculos são inteiros em centavos. O desconto é `Math.round(subtotalCentavos / 10)` apenas quando o subtotal é maior ou igual a 3.000. Há um único arredondamento do desconto. O valor formatado nunca é usado como entrada de cálculo.

O limite numérico seguro do JavaScript é verificado também na quantidade acumulada, multiplicação e soma. Isso evita aceitar pedidos que não poderiam ser representados exatamente; não introduz um limite comercial de quantidade.

## Como a interface usa as regras

`script.js` mantém a variável `pedido` em memória. No envio do formulário, passa o ID e a entrada de quantidade para `adicionarItem`. Se `ok` for falso, apresenta a mensagem, indica o campo inválido e mantém o estado anterior. Se for verdadeiro, guarda o pedido retornado e chama `calcularPedido` para montar as linhas e os totais.

Na finalização, chama `finalizarPedido`. Somente um retorno bem-sucedido revela a confirmação com subtotal, desconto e total. O resumo permanece visível, o formulário é desabilitado e a própria lógica recusa novas inclusões. O foco é levado à confirmação.

As funções de negócio podem ser testadas sem DOM. `tests.js` usa exatamente `window.CafeteriaRegras`, sem copiar a implementação. O DOM é usado apenas para mostrar os resultados dos testes.

## Checklist de rastreabilidade

| Requisito | Arquivo/função | Verificação |
|---|---|---|
| Quatro produtos e preços corretos | `regras.js`/`cardapio`; `script.js`/`apresentarCardapio` | CA01 automático dos dados e manual da exibição |
| Seleção, quantidade, produtos diferentes | `index.html`; `adicionarItem` | CA02, CA03 e CA04 |
| Acumular produto em uma linha | `adicionarItem`; `apresentarResumo` | CA05 |
| Recusar entradas inválidas sem alterar pedido | `validarProdutoEQuantidade`; `adicionarItem` | CA06 e RN01 |
| Item, subtotal, desconto e total | `calcularPedido`; `calcularTotaisDoSubtotal` | CA02–CA05 e testes de limites |
| Limites 2.999, 3.000 e 3.001 centavos | `calcularTotaisDoSubtotal` | Três testes diretos em `tests.js` |
| Finalização vazia recusada | `finalizarPedido`; mensagem no DOM | CA07 automático e manual |
| Confirmação e bloqueio após finalizar | `finalizarPedido`; `script.js` | CA08 automático da lógica e manual da interface |
| Teclado, foco, rótulos e mensagens | `index.html`; `styles.css`; `script.js` | Roteiro manual de acessibilidade |
| Local e Pages, sem dependências | Caminhos relativos e scripts clássicos | Roteiro manual nos dois ambientes |
| Testes compartilhando regras | `tests.html`, `tests.js`, `regras.js` | Abrir `tests.html` |
| Escopo e limitações documentados | `README.md` e `TESTES.md` | Revisão da equipe |

## Situação dos testes

O site público foi implantado pelo GitHub Pages a partir da branch `main`, pasta raiz. Nesta revisão, `index.html` e `tests.html` responderam com HTTP 200; a suíte publicada executou 25 testes: 25 aprovados e 0 reprovados. Também foi exercitado no site o fluxo CA03/CA08. Os resultados locais e publicados estão registrados em `TESTES.md`.

Ao abrir `tests.html`, a página executa os testes e exibe aprovado/reprovado, esperado e observado para aquela execução. A equipe deve executar também os testes manuais e registrar navegador, data, responsável e resultados em `TESTES.md`. Uma aprovação dos testes de negócio não comprova, sozinha, o funcionamento da interface.

Não foram verificados teclado, leitor de tela, responsividade ou outros navegadores.

## Limitações

- Protótipo educacional, não sistema comercial completo.
- Preços fictícios.
- Um pedido por vez, armazenado apenas em memória.
- Recarregar ou fechar a página perde o pedido; não há persistência nem recuperação.
- Após finalizar, novas inclusões são bloqueadas. Para outra demonstração, recarregue a página.
- Não há pagamento real.
- O layout e a acessibilidade precisam de revisão prática da equipe nos navegadores usados em sala.

## Identificação e preservação da v0.1

Depois de revisar e testar, identifique o commit da entrega com a tag `v0.1`, pela interface do GitHub ou com Git, se disponível:

```bash
git tag -a v0.1 -m "Cafeteria Pedido Certo v0.1"
git push origin v0.1
```

Git não é necessário para executar a aplicação. A tag não é criada automaticamente pelo ZIP. Não mova, sobrescreva nem apague `v0.1` quando houver evolução posterior. Faça as mudanças em novos commits e use outra tag para uma futura versão. Pages publicado pela branch acompanha essa branch; a tag preserva o código da entrega, não congela automaticamente o site publicado.

A equipe deve revisar a solução, executar os testes e registrar as próprias contribuições, sem tratar a geração de código como comprovação de funcionamento.
