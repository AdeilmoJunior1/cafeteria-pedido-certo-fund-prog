# Cafeteria Pedido Certo — v0.2

## Objetivo

Protótipo educacional para o atendente montar e conferir um pedido de uma pequena cafeteria. A aplicação atende um pedido por vez e permite incluir, editar, remover e finalizar itens.

## Versões

- **v0.1:** inclusão e acúmulo de itens, desconto de 10% a partir de R$ 30,00.
- **v0.2:** edição e remoção de itens; desconto de 10% a partir de R$ 40,00.

O commit de referência da v0.1 identificado nesta revisão é `ad800de`. Não existia tag `v0.1` no repositório local. Não mova nem recrie uma tag já existente.

## Execução

1. Abra `index.html` diretamente no navegador.
2. Monte o pedido no formulário.
3. Use **Alterar** para substituir uma quantidade ou **Remover** para excluir a linha.
4. Confira o resumo e clique em **Finalizar pedido**.
5. Abra `tests.html` para executar a suíte automática.

Não são necessários Node.js, servidor, instalação, build, backend ou recursos externos. Os scripts clássicos devem ser carregados nesta ordem: `regras.js` e depois `script.js` ou `tests.js`.

## Publicação no GitHub Pages

Mantenha `index.html` na raiz da branch publicada e configure Pages para a branch e a pasta raiz. Todos os caminhos são relativos. O pedido é perdido ao recarregar ou fechar a página.

## Regras e arquivos

- `regras.js`: cardápio, validações, cálculo em centavos, edição, remoção e finalização.
- `script.js`: integração com o DOM e controles de inclusão, edição e remoção.
- `index.html`: cardápio, formulário, resumo e confirmação.
- `styles.css`: apresentação, foco, mensagens e responsividade.
- `tests.html` e `tests.js`: testes automáticos que reutilizam `regras.js`.
- `TESTES.md`: roteiro manual e registro de execução.
- `CHANGELOG.md`: histórico técnico das mudanças.

## Mudanças da v0.2

- RN05 foi alterada de R$ 30,00 para R$ 40,00.
- RF08 permite substituir a quantidade acumulada de um item.
- RF09 permite remover a linha inteira de um produto.
- RN08 exige quantidade inteira maior que zero para edição.
- RN10 bloqueia inclusões, edições e remoções após a finalização.
- Os valores são mantidos em centavos inteiros.

Não há cadastro de clientes, estoque, pagamento real, emissão fiscal, histórico permanente ou backend.
