# Testes — Cafeteria Pedido Certo v0.2

## Situação desta revisão

**Executado parcialmente neste ambiente.** A suíte automática foi executada no navegador local integrado: 41 testes aprovados e 0 reprovados. Também foi feito um smoke test da interface para edição, remoção e finalização. Outros testes manuais de teclado, leitor de tela, responsividade e publicação permanecem preparados e não executados.

## Como executar

1. Abra `index.html` diretamente no navegador.
2. Abra `tests.html` na mesma pasta ou pelo GitHub Pages.
3. Recarregue `tests.html` para repetir.
4. Confira `APROVADO/REPROVADO`, esperado e observado em cada linha.
5. Execute os testes manuais abaixo em pelo menos um navegador local.

## Testes automáticos

`tests.html` carrega `regras.js` antes de `tests.js`. Os casos cobrem cardápio, inclusão, acumulação, edição, remoção, finalização, produto inválido, limite de desconto, arredondamento e bloqueio pós-finalização.

Casos principais:

| Caso | Esperado |
|---|---|
| CA01 | Quatro produtos e preços corretos |
| CA02 | 2 cafés + 1 pão: R$ 17,00 / R$ 0,00 / R$ 17,00 |
| CA03 | 1 sanduíche + 1 cappuccino + 1 pão: R$ 30,00 / R$ 0,00 / R$ 30,00 |
| CA04 | 3 sanduíches: R$ 45,00 / R$ 4,50 / R$ 40,50 |
| CA05 | Café acumulado em uma linha: quantidade 3, R$ 18,00 |
| CA06 | Inclusão inválida recusa e preserva pedido |
| CA07 | Finalização vazia recusa |
| CA08 | 4 cappuccinos: R$ 40,00 / R$ 4,00 / R$ 36,00 |
| CA09 | 3 sanduíches editados para 1: R$ 15,00 / R$ 0,00 / R$ 15,00 |
| CA10 | 3 sanduíches + pão editados para 2 sanduíches + pão: R$ 35,00 / R$ 0,00 / R$ 35,00 |
| CA11 | Quantidades de edição vazia, zero, negativa, fracionária e não numérica são recusadas |
| CA12 | Remover todos os itens gera pedido vazio e bloqueia finalização |
| CA13 | Após finalizar, inclusão, edição e remoção são bloqueadas na lógica |
| CA14 | Remover café deixa somente sanduíche: R$ 15,00 |

## Testes de fronteira

| Pedido ou subtotal | Esperado |
|---|---|
| 4 cafés + 1 sanduíche | R$ 39,00 / R$ 0,00 / R$ 39,00 |
| 4 cappuccinos | R$ 40,00 / R$ 4,00 / R$ 36,00 |
| 1 café + 1 cappuccino + 5 pães | R$ 41,00 / R$ 4,10 / R$ 36,90 |
| 3.999 centavos | desconto 0 / total 3.999 |
| 4.000 centavos | desconto 400 / total 3.600 |
| 4.001 centavos | desconto 400 após arredondamento / total 3.601 |

## Testes manuais obrigatórios

Para cada caso independente, recarregue `index.html`.

### CA01–CA05

Confira os quatro produtos e execute os pedidos descritos acima. Compare linhas, quantidades, subtotal, desconto e total.

### CA06 e CA11

Tente incluir ou editar com campo vazio, `0`, `-1`, `1.5`, `1,5`, `abc` e espaços. Esperado: mensagem clara, campo marcado com `aria-invalid`, foco no campo e pedido anterior intacto.

### CA07 e CA12

Finalize vazio e depois remova todos os itens de um pedido. Esperado: orientação para incluir ao menos um item válido, estado vazio legível e valores zerados.

### CA09, CA10 e CA14

Edite ou remova itens e confira o resumo recalculado imediatamente. Esperado: edição substitui a quantidade; remoção exclui a linha inteira.

### CA13

Finalize um pedido válido e tente incluir, editar e remover. Esperado: resumo e itens preservados; controles desabilitados; mensagens claras se chamadas forem tentadas.

### Acessibilidade e teclado

Execute o fluxo com Tab, Shift+Tab e Enter/Espaço. Confira rótulos, foco visível, região `aria-live`, confirmação com foco e conteúdo rolável em tela estreita.

## Registro de execução

Registro observado nesta revisão:

- Data: 24/11/2026
- Responsável:
- Navegador e versão: navegador integrado disponível nesta sessão
- Sistema operacional: Windows
- Ambiente: arquivo local (`index.html` e `tests.html`)
- Commit/branch revisado: branch `feature/v0.2`, antes do commit final
- Evidências: suíte automática 41/41; smoke test local da interface

| Caso | Observado | Situação |
|---|---|---|
| Suíte automática | 41 aprovados, 0 reprovados | Executado |
| Fronteiras da interface | Não observado integralmente | Preparado — não executado |
| Edição e remoção | 3 sanduíches editados para 1 exibiram R$ 15,00; remoção exibiu pedido vazio | Executado no smoke test |
| Finalização bloqueada | 4 cappuccinos exibiram R$ 40,00 / R$ 4,00 / R$ 36,00 e controles desabilitados | Executado no smoke test |
| Teclado/acessibilidade | Não observado | Preparado — não executado |
| Responsividade | Não observado | Preparado — não executado |
| Local/GitHub Pages | Não observado | Preparado — não executado |

A aprovação dos testes automáticos não substitui os testes manuais da interface.
