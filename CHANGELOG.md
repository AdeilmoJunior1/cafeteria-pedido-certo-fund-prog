# Changelog

## v0.2

### M01 — Correção do pedido

- Adicionada edição pela substituição da quantidade acumulada (RF08).
- Adicionada remoção da linha inteira do produto (RF09).
- O pedido vazio e os totais zerados são apresentados após remover todos os itens.
- Edição inválida preserva pedido e valores anteriores (RN08).
- Inclusão, edição e remoção são bloqueadas na lógica e na interface após finalizar (RN10).

### M02 — Limite do desconto

- RN05: alteração histórica de R$ 30,00 para R$ 40,00.
- O limite de R$ 40,00 continua inclusivo.
- Continua aplicado um desconto de 10%, arredondado uma única vez para o centavo.
- Lógica, interface, testes e instruções usam o limite de 4.000 centavos.

### Histórico preservado

- A v0.1 continua consultável pelo commit `ad800de`.
- Não existia uma tag `v0.1` no repositório local desta revisão.
- Os cenários da v0.1 com R$ 30,00 e desconto de R$ 3,00 permanecem identificados como comportamento histórico, não como expectativa atual.

### Arquivos afetados

`index.html`, `styles.css`, `regras.js`, `script.js`, `tests.html`, `tests.js`, `README.md` e `TESTES.md`.
