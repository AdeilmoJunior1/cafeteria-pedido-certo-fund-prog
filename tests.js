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

  registrar("CA03 — limite inclusivo de R$ 30,00", {
    subtotalCentavos: 3000, descontoCentavos: 300, totalCentavos: 2700
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

  registrar("CA08 — finalizar e impedir inclusão na lógica", {
    ok: true, finalizado: true,
    subtotalCentavos: 3000, descontoCentavos: 300, totalCentavos: 2700,
    inclusaoAceita: false, pedidoPreservado: true, segundaFinalizacaoAceita: false
  }, function () {
    const resultado = regras.finalizarPedido(montarPedido([
      ["sanduiche", 1], ["cappuccino", 1], ["pao-de-queijo", 1]
    ]));
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

  [
    { subtotalCentavos: 2999, descontoCentavos: 0, totalCentavos: 2999 },
    { subtotalCentavos: 3000, descontoCentavos: 300, totalCentavos: 2700 },
    { subtotalCentavos: 3001, descontoCentavos: 300, totalCentavos: 2701 }
  ].forEach(function (esperado) {
    registrar("Limite direto — " + esperado.subtotalCentavos + " centavos", esperado, function () {
      return regras.calcularTotaisDoSubtotal(esperado.subtotalCentavos);
    });
  });

  registrar("Arredondamento único — meio centavo", {
    subtotalCentavos: 3005, descontoCentavos: 301, totalCentavos: 2704
  }, function () {
    return regras.calcularTotaisDoSubtotal(3005);
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
