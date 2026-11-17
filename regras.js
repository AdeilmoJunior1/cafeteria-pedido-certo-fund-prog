(function () {
  "use strict";

  // O namespace único evita conflitos com outros scripts clássicos.
  const cardapio = Object.freeze([
    Object.freeze({ id: "cafe-espresso", nome: "Café espresso", precoCentavos: 600 }),
    Object.freeze({ id: "cappuccino", nome: "Cappuccino", precoCentavos: 1000 }),
    Object.freeze({ id: "pao-de-queijo", nome: "Pão de queijo", precoCentavos: 500 }),
    Object.freeze({ id: "sanduiche", nome: "Sanduíche", precoCentavos: 1500 })
  ]);

  const formatador = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function buscarProduto(produtoId) {
    return cardapio.find(function (produto) {
      return produto.id === produtoId;
    });
  }

  function criarPedido() {
    return { itens: [], finalizado: false };
  }

  function validarProdutoEQuantidade(produtoId, entradaQuantidade) {
    const produto = buscarProduto(produtoId);
    if (!produto) {
      return {
        ok: false,
        campo: "produto",
        mensagem: "Selecione um produto pertencente ao cardápio."
      };
    }

    const tipo = typeof entradaQuantidade;
    const tipoAceito = tipo === "string" || tipo === "number";
    if (!tipoAceito || (tipo === "string" && entradaQuantidade.trim() === "")) {
      return {
        ok: false,
        campo: "quantidade",
        mensagem: "Informe uma quantidade inteira maior que zero."
      };
    }

    // Number preserva frações; parseInt poderia aceitar 1.5 como 1.
    const quantidade = Number(entradaQuantidade);
    if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
      return {
        ok: false,
        campo: "quantidade",
        mensagem: "Quantidade inválida. Use um número inteiro maior que zero e dentro do limite numérico seguro."
      };
    }
    return { ok: true, produto: produto, quantidade: quantidade };
  }

  function validarCentavos(valor) {
    if (!Number.isSafeInteger(valor) || valor < 0) {
      throw new Error("O valor deve ser um inteiro não negativo em centavos.");
    }
  }

  function calcularTotaisDoSubtotal(subtotalCentavos) {
    validarCentavos(subtotalCentavos);
    let descontoCentavos = 0;

    // RN05: o limite de 3.000 centavos é inclusivo.
    // Dividir por 10 calcula 10%; arredondamos uma única vez.
    if (subtotalCentavos >= 3000) {
      descontoCentavos = Math.round(subtotalCentavos / 10);
    }
    return {
      subtotalCentavos: subtotalCentavos,
      descontoCentavos: descontoCentavos,
      totalCentavos: subtotalCentavos - descontoCentavos
    };
  }

  function calcularPedido(pedido) {
    const itens = pedido.itens.map(function (item) {
      const validacao = validarProdutoEQuantidade(item.produtoId, item.quantidade);
      if (!validacao.ok) {
        throw new Error("O pedido contém um item inválido.");
      }
      const produto = validacao.produto;
      const valorCentavos = produto.precoCentavos * validacao.quantidade;
      validarCentavos(valorCentavos);
      return {
        produtoId: produto.id,
        nome: produto.nome,
        quantidade: validacao.quantidade,
        precoUnitarioCentavos: produto.precoCentavos,
        valorCentavos: valorCentavos
      };
    });

    const subtotalCentavos = itens.reduce(function (subtotal, item) {
      const soma = subtotal + item.valorCentavos;
      validarCentavos(soma);
      return soma;
    }, 0);
    const totais = calcularTotaisDoSubtotal(subtotalCentavos);
    return {
      itens: itens,
      subtotalCentavos: totais.subtotalCentavos,
      descontoCentavos: totais.descontoCentavos,
      totalCentavos: totais.totalCentavos
    };
  }

  function adicionarItem(pedido, produtoId, entradaQuantidade) {
    if (pedido.finalizado) {
      return {
        ok: false,
        mensagem: "Este pedido já foi finalizado. Novas inclusões estão bloqueadas.",
        pedido: pedido
      };
    }
    const validacao = validarProdutoEQuantidade(produtoId, entradaQuantidade);
    if (!validacao.ok) {
      return {
        ok: false,
        campo: validacao.campo,
        mensagem: validacao.mensagem,
        pedido: pedido
      };
    }

    // Trabalhamos numa cópia: uma inclusão recusada não muda o estado anterior.
    const itens = pedido.itens.map(function (item) {
      return { produtoId: item.produtoId, quantidade: item.quantidade };
    });
    const existente = itens.find(function (item) {
      return item.produtoId === produtoId;
    });
    if (existente) {
      existente.quantidade += validacao.quantidade;
    } else {
      itens.push({ produtoId: produtoId, quantidade: validacao.quantidade });
    }
    const novoPedido = { itens: itens, finalizado: false };
    try {
      // Verifica também quantidade acumulada e valores monetários seguros.
      calcularPedido(novoPedido);
    } catch (erro) {
      return {
        ok: false,
        campo: "quantidade",
        mensagem: "Não foi possível adicionar: a quantidade ou o valor acumulado excede o limite numérico seguro.",
        pedido: pedido
      };
    }
    return {
      ok: true,
      mensagem: "Item adicionado. Confira o resumo do pedido.",
      pedido: novoPedido
    };
  }

  function finalizarPedido(pedido) {
    if (pedido.finalizado) {
      return { ok: false, mensagem: "Este pedido já foi finalizado.", pedido: pedido };
    }
    if (pedido.itens.length === 0) {
      return {
        ok: false,
        mensagem: "Adicione ao menos um item válido antes de finalizar.",
        pedido: pedido
      };
    }
    let resumo;
    try {
      resumo = calcularPedido(pedido);
    } catch (erro) {
      return {
        ok: false,
        mensagem: "O pedido contém itens inválidos e não pode ser finalizado.",
        pedido: pedido
      };
    }
    return {
      ok: true,
      mensagem: "Pedido finalizado. Novas inclusões estão bloqueadas.",
      pedido: {
        itens: pedido.itens.map(function (item) {
          return { produtoId: item.produtoId, quantidade: item.quantidade };
        }),
        finalizado: true
      },
      resumo: resumo
    };
  }

  function formatarMoeda(centavos) {
    validarCentavos(centavos);
    // A divisão só prepara a exibição. Texto formatado nunca entra nos cálculos.
    return formatador.format(centavos / 100);
  }

  window.CafeteriaRegras = Object.freeze({
    cardapio: cardapio,
    criarPedido: criarPedido,
    validarProdutoEQuantidade: validarProdutoEQuantidade,
    adicionarItem: adicionarItem,
    calcularTotaisDoSubtotal: calcularTotaisDoSubtotal,
    calcularPedido: calcularPedido,
    finalizarPedido: finalizarPedido,
    formatarMoeda: formatarMoeda
  });
})();
