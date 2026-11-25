(function () {
  "use strict";
  const regras = window.CafeteriaRegras;
  const testes = [];

  function registrar(nome, esperado, executar) {
    testes.push({ nome: nome, esperado: esperado, executar: executar });
  }

  function montarPedido(entradas) {
    let pedido = regras.criarPedido();
    entradas.forEach(function (entrada) {
      const resultado = regras.adicionarItem(pedido, entrada[0], entrada[1]);
      if (!resultado.ok) {
        throw new Error(resultado.mensagem);
      }
      pedido = resultado.pedido;
    });
    return pedido;
  }

  function obterTotais(pedido) {
    const resumo = regras.calcularPedido(pedido);
    return {
      subtotalCentavos: resumo.subtotalCentavos,
      descontoCentavos: resumo.descontoCentavos,
      totalCentavos: resumo.totalCentavos
    };
  }

  registrar("CA01 — dados do cardápio (exibição exige teste manual)", [
    { id: "cafe-espresso", nome: "Café espresso", precoCentavos: 600 },
    { id: "cappuccino", nome: "Cappuccino", precoCentavos: 1000 },
    { id: "pao-de-queijo", nome: "Pão de queijo", precoCentavos: 500 },
    { id: "sanduiche", nome: "Sanduíche", precoCentavos: 1500 }
  ], function () {
    return regras.cardapio;
  });

  registrar("CA02 — 2 cafés e 1 pão de queijo", {
    subtotalCentavos: 1700, descontoCentavos: 0, totalCentavos: 1700
  }, function () {
    return obterTotais(montarPedido([["cafe-espresso", 2], ["pao-de-queijo", 1]]));
  });

  registrar("CA03 — limite antigo não concede desconto em R$ 30,00", {
    subtotalCentavos: 3000, descontoCentavos: 0, totalCentavos: 3000
  }, function () {
    return obterTotais(montarPedido([["sanduiche", 1], ["cappuccino", 1], ["pao-de-queijo", 1]]));
  });

  registrar("CA04 — 3 sanduíches", {
    subtotalCentavos: 4500, descontoCentavos: 450, totalCentavos: 4050
  }, function () {
    return obterTotais(montarPedido([["sanduiche", 3]]));
  });

  registrar("CA05 — acumular café na mesma linha", {
    linhas: 1, quantidade: 3, valorCentavos: 1800,
    subtotalCentavos: 1800, descontoCentavos: 0, totalCentavos: 1800
  }, function () {
    const resumo = regras.calcularPedido(montarPedido([["cafe-espresso", 1], ["cafe-espresso", 2]]));
    return {
      linhas: resumo.itens.length,
      quantidade: resumo.itens[0].quantidade,
      valorCentavos: resumo.itens[0].valorCentavos,
      subtotalCentavos: resumo.subtotalCentavos,
      descontoCentavos: resumo.descontoCentavos,
      totalCentavos: resumo.totalCentavos
    };
  });

  const invalidas = [
    { nome: "vazia", valor: "" },
    { nome: "somente espaços", valor: "   " },
    { nome: "zero", valor: "0" },
    { nome: "negativa", valor: "-1" },
    { nome: "fracionária com ponto", valor: "1.5" },
    { nome: "fracionária com vírgula", valor: "1,5" },
    { nome: "não numérica", valor: "abc" },
    { nome: "infinita", valor: Infinity },
    { nome: "acima do inteiro seguro", valor: "9007199254740992" }
  ];
  invalidas.forEach(function (entrada) {
    registrar("CA06 — quantidade " + entrada.nome, {
      ok: false, mensagemClara: true, mesmaReferencia: true, pedidoPreservado: true
    }, function () {
      const pedido = montarPedido([["cafe-espresso", 1]]);
      const antes = JSON.stringify(pedido);
      const resultado = regras.adicionarItem(pedido, "pao-de-queijo", entrada.valor);
      return {
        ok: resultado.ok,
        mensagemClara: typeof resultado.mensagem === "string" && resultado.mensagem.length > 0,
        mesmaReferencia: resultado.pedido === pedido,
        pedidoPreservado: JSON.stringify(pedido) === antes && JSON.stringify(resultado.pedido) === antes
      };
    });
  });

  registrar("RN01 — produto fora do cardápio", {
    ok: false, campo: "produto", pedidoPreservado: true
  }, function () {
    const pedido = montarPedido([["cafe-espresso", 1]]);
    const antes = JSON.stringify(pedido);
    const resultado = regras.adicionarItem(pedido, "produto-inexistente", 1);
    return {
      ok: resultado.ok,
      campo: resultado.campo,
      pedidoPreservado: JSON.stringify(pedido) === antes && resultado.pedido === pedido
    };
  });

  registrar("CA07 — finalizar pedido vazio", {
    ok: false, finalizado: false, semResumoConfirmado: true,
    mensagem: "Adicione ao menos um item válido antes de finalizar."
  }, function () {
    const resultado = regras.finalizarPedido(regras.criarPedido());
    return {
      ok: resultado.ok,
      finalizado: resultado.pedido.finalizado,
      semResumoConfirmado: resultado.resumo === undefined,
      mensagem: resultado.mensagem
    };
  });

  registrar("CA08 — 4 cappuccinos e finalizar bloqueando alterações", {
    ok: true, finalizado: true,
    subtotalCentavos: 4000, descontoCentavos: 400, totalCentavos: 3600,
    inclusaoAceita: false, pedidoPreservado: true, segundaFinalizacaoAceita: false
  }, function () {
    const resultado = regras.finalizarPedido(montarPedido([["cappuccino", 4]]));
    const antes = JSON.stringify(resultado.pedido);
    const inclusao = regras.adicionarItem(resultado.pedido, "cafe-espresso", 1);
    const segundaFinalizacao = regras.finalizarPedido(resultado.pedido);
    return {
      ok: resultado.ok,
      finalizado: resultado.pedido.finalizado,
      subtotalCentavos: resultado.resumo.subtotalCentavos,
      descontoCentavos: resultado.resumo.descontoCentavos,
      totalCentavos: resultado.resumo.totalCentavos,
      inclusaoAceita: inclusao.ok,
      pedidoPreservado: JSON.stringify(resultado.pedido) === antes && inclusao.pedido === resultado.pedido,
      segundaFinalizacaoAceita: segundaFinalizacao.ok
    };
  });

  registrar("CA09 — editar 3 sanduíches para 1", {
    subtotalCentavos: 1500, descontoCentavos: 0, totalCentavos: 1500, quantidade: 1
  }, function () {
    let pedido = montarPedido([["sanduiche", 3]]);
    pedido = regras.editarItem(pedido, "sanduiche", 1).pedido;
    const resumo = regras.calcularPedido(pedido);
    return {
      subtotalCentavos: resumo.subtotalCentavos,
      descontoCentavos: resumo.descontoCentavos,
      totalCentavos: resumo.totalCentavos,
      quantidade: resumo.itens[0].quantidade
    };
  });

  registrar("CA10 — editar cruza o limite em sentido decrescente", {
    subtotalAnterior: 5000, descontoAnterior: 500,
    subtotalNovo: 3500, descontoNovo: 0, totalNovo: 3500
  }, function () {
    let pedido = montarPedido([["sanduiche", 3], ["pao-de-queijo", 1]]);
    const anterior = regras.calcularPedido(pedido);
    pedido = regras.editarItem(pedido, "sanduiche", 2).pedido;
    const novo = regras.calcularPedido(pedido);
    return {
      subtotalAnterior: anterior.subtotalCentavos,
      descontoAnterior: anterior.descontoCentavos,
      subtotalNovo: novo.subtotalCentavos,
      descontoNovo: novo.descontoCentavos,
      totalNovo: novo.totalCentavos
    };
  });

  ["", "   ", "0", "-1", "1.5", "1,5", "abc", Infinity].forEach(function (entrada) {
    registrar("CA11 — edição inválida: " + String(entrada), {
      ok: false, mesmaReferencia: true, pedidoPreservado: true
    }, function () {
      const pedido = montarPedido([["sanduiche", 3]]);
      const antes = JSON.stringify(pedido);
      const resultado = regras.editarItem(pedido, "sanduiche", entrada);
      return {
        ok: resultado.ok,
        mesmaReferencia: resultado.pedido === pedido,
        pedidoPreservado: JSON.stringify(pedido) === antes && JSON.stringify(resultado.pedido) === antes
      };
    });
  });

  registrar("CA12 — remover todos os itens", {
    vazio: true, subtotalCentavos: 0, descontoCentavos: 0,
    totalCentavos: 0, finalizacaoAceita: false
  }, function () {
    let pedido = montarPedido([["cafe-espresso", 1]]);
    pedido = regras.removerItem(pedido, "cafe-espresso").pedido;
    const resumo = regras.calcularPedido(pedido);
    const finalizacao = regras.finalizarPedido(pedido);
    return {
      vazio: resumo.itens.length === 0,
      subtotalCentavos: resumo.subtotalCentavos,
      descontoCentavos: resumo.descontoCentavos,
      totalCentavos: resumo.totalCentavos,
      finalizacaoAceita: finalizacao.ok
    };
  });

  registrar("CA13 — operações diretas bloqueadas após finalizar", {
    inclusaoAceita: false, edicaoAceita: false, remocaoAceita: false, pedidoPreservado: true
  }, function () {
    const finalizado = regras.finalizarPedido(montarPedido([["cafe-espresso", 1]])).pedido;
    const antes = JSON.stringify(finalizado);
    const inclusao = regras.adicionarItem(finalizado, "cafe-espresso", 1);
    const edicao = regras.editarItem(finalizado, "cafe-espresso", 2);
    const remocao = regras.removerItem(finalizado, "cafe-espresso");
    return {
      inclusaoAceita: inclusao.ok,
      edicaoAceita: edicao.ok,
      remocaoAceita: remocao.ok,
      pedidoPreservado: JSON.stringify(finalizado) === antes &&
        inclusao.pedido === finalizado && edicao.pedido === finalizado && remocao.pedido === finalizado
    };
  });

  registrar("CA14 — remover café mantém somente sanduíche", {
    linhas: 1, produtoId: "sanduiche", subtotalCentavos: 1500,
    descontoCentavos: 0, totalCentavos: 1500
  }, function () {
    let pedido = montarPedido([["sanduiche", 1], ["cafe-espresso", 1]]);
    pedido = regras.removerItem(pedido, "cafe-espresso").pedido;
    const resumo = regras.calcularPedido(pedido);
    return {
      linhas: resumo.itens.length,
      produtoId: resumo.itens[0].produtoId,
      subtotalCentavos: resumo.subtotalCentavos,
      descontoCentavos: resumo.descontoCentavos,
      totalCentavos: resumo.totalCentavos
    };
  });

  registrar("Edição crescente cruza R$ 40,00", {
    subtotalAnterior: 3000, descontoAnterior: 0,
    subtotalNovo: 4500, descontoNovo: 450, totalNovo: 4050
  }, function () {
    let pedido = montarPedido([["sanduiche", 2]]);
    const anterior = regras.calcularPedido(pedido);
    pedido = regras.editarItem(pedido, "sanduiche", 3).pedido;
    const novo = regras.calcularPedido(pedido);
    return {
      subtotalAnterior: anterior.subtotalCentavos,
      descontoAnterior: anterior.descontoCentavos,
      subtotalNovo: novo.subtotalCentavos,
      descontoNovo: novo.descontoCentavos,
      totalNovo: novo.totalCentavos
    };
  });

  registrar("Remoção elimina desconto", {
    subtotalNovo: 500, descontoNovo: 0, totalNovo: 500
  }, function () {
    let pedido = montarPedido([["sanduiche", 3], ["pao-de-queijo", 1]]);
    pedido = regras.removerItem(pedido, "sanduiche").pedido;
    const novo = regras.calcularPedido(pedido);
    return {
      subtotalNovo: novo.subtotalCentavos,
      descontoNovo: novo.descontoCentavos,
      totalNovo: novo.totalCentavos
    };
  });

  registrar("Produto inválido e item inexistente não alteram pedido", {
    editarAceita: false, removerAceita: false, pedidoPreservado: true
  }, function () {
    const pedido = montarPedido([["cafe-espresso", 1]]);
    const antes = JSON.stringify(pedido);
    const editar = regras.editarItem(pedido, "item-inexistente", 2);
    const remover = regras.removerItem(pedido, "item-inexistente");
    return {
      editarAceita: editar.ok,
      removerAceita: remover.ok,
      pedidoPreservado: JSON.stringify(pedido) === antes &&
        editar.pedido === pedido && remover.pedido === pedido
    };
  });

  [
    { subtotalCentavos: 3999, descontoCentavos: 0, totalCentavos: 3999 },
    { subtotalCentavos: 4000, descontoCentavos: 400, totalCentavos: 3600 },
    { subtotalCentavos: 4001, descontoCentavos: 400, totalCentavos: 3601 }
  ].forEach(function (esperado) {
    registrar("Limite direto — " + esperado.subtotalCentavos + " centavos", esperado, function () {
      return regras.calcularTotaisDoSubtotal(esperado.subtotalCentavos);
    });
  });

  registrar("Arredondamento único — meio centavo", {
    subtotalCentavos: 4005, descontoCentavos: 401, totalCentavos: 3604
  }, function () {
    return regras.calcularTotaisDoSubtotal(4005);
  });

  registrar("RN06 — formato brasileiro com duas casas", [
    "R$ 0,00", "R$ 6,00", "R$ 27,00", "R$ 40,50"
  ], function () {
    return [0, 600, 2700, 4050].map(function (valor) {
      // Intl pode usar espaço não separável; normalizamos só no teste textual.
      return regras.formatarMoeda(valor).replace(/[\u00a0\u202f]/g, " ");
    });
  });

  registrar("Inclusão válida não altera o objeto anterior", {
    ok: true, anteriorPreservado: true, quantidadeNova: 3
  }, function () {
    const pedido = montarPedido([["cafe-espresso", 1]]);
    const antes = JSON.stringify(pedido);
    const resultado = regras.adicionarItem(pedido, "cafe-espresso", 2);
    return {
      ok: resultado.ok,
      anteriorPreservado: JSON.stringify(pedido) === antes,
      quantidadeNova: resultado.pedido.itens[0].quantidade
    };
  });

  registrar("Finalização recusa item adulterado", {
    ok: false, finalizado: false, semResumoConfirmado: true
  }, function () {
    const pedido = { itens: [{ produtoId: "fora-do-cardapio", quantidade: 1 }], finalizado: false };
    const resultado = regras.finalizarPedido(pedido);
    return {
      ok: resultado.ok,
      finalizado: resultado.pedido.finalizado,
      semResumoConfirmado: resultado.resumo === undefined
    };
  });

  registrar("Proteção contra valor monetário inseguro", {
    ok: false, pedidoPreservado: true
  }, function () {
    const pedido = regras.criarPedido();
    const antes = JSON.stringify(pedido);
    const resultado = regras.adicionarItem(pedido, "sanduiche", Number.MAX_SAFE_INTEGER);
    return { ok: resultado.ok, pedidoPreservado: JSON.stringify(pedido) === antes && resultado.pedido === pedido };
  });

  function mostrarCelula(linha, valor) {
    const celula = document.createElement("td");
    const texto = document.createElement("pre");
    texto.textContent = JSON.stringify(valor, null, 2);
    celula.appendChild(texto);
    linha.appendChild(celula);
  }

  const corpo = document.getElementById("resultados-testes");
  let aprovados = 0;
  testes.forEach(function (teste) {
    let observado;
    let aprovado = false;
    try {
      observado = teste.executar();
      aprovado = JSON.stringify(observado) === JSON.stringify(teste.esperado);
    } catch (erro) {
      observado = { erro: erro.message };
    }
    if (aprovado) {
      aprovados += 1;
    }
    const linha = document.createElement("tr");
    const nome = document.createElement("th");
    nome.scope = "row";
    nome.textContent = teste.nome;
    linha.appendChild(nome);
    const situacao = document.createElement("td");
    situacao.textContent = aprovado ? "APROVADO" : "REPROVADO";
    situacao.className = aprovado ? "resultado-aprovado" : "resultado-reprovado";
    linha.appendChild(situacao);
    mostrarCelula(linha, teste.esperado);
    mostrarCelula(linha, observado);
    corpo.appendChild(linha);
  });
  document.getElementById("situacao-testes").textContent =
    "Execução concluída: " + aprovados + " aprovado(s), " +
    (testes.length - aprovados) + " reprovado(s), " + testes.length + " teste(s).";
})();
