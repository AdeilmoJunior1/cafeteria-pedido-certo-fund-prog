(function () {
  "use strict";
  const regras = window.CafeteriaRegras;
  let pedido = regras.criarPedido();
  const elementos = {
    cardapio: document.getElementById("cardapio"),
    formulario: document.getElementById("formulario"),
    campos: document.getElementById("campos-inclusao"),
    produto: document.getElementById("produto"),
    quantidade: document.getElementById("quantidade"),
    mensagem: document.getElementById("mensagem"),
    vazio: document.getElementById("pedido-vazio"),
    tabela: document.getElementById("tabela-pedido"),
    itens: document.getElementById("itens-pedido"),
    subtotal: document.getElementById("subtotal"),
    desconto: document.getElementById("desconto"),
    total: document.getElementById("total"),
    finalizar: document.getElementById("finalizar"),
    confirmacao: document.getElementById("confirmacao"),
    valoresConfirmados: document.getElementById("valores-confirmados")
  };

  function mostrarMensagem(texto, tipo) {
    elementos.mensagem.textContent = texto;
    elementos.mensagem.dataset.tipo = tipo;
  }

  function apresentarCardapio() {
    regras.cardapio.forEach(function (produto) {
      const linha = document.createElement("li");
      const nome = document.createElement("span");
      const preco = document.createElement("span");
      nome.textContent = produto.nome;
      preco.textContent = regras.formatarMoeda(produto.precoCentavos);
      linha.append(nome, preco);
      elementos.cardapio.appendChild(linha);
      const opcao = document.createElement("option");
      opcao.value = produto.id;
      opcao.textContent = produto.nome;
      elementos.produto.appendChild(opcao);
    });
  }

  function acrescentarCelula(linha, texto, cabecalho) {
    const celula = document.createElement(cabecalho ? "th" : "td");
    if (cabecalho) {
      celula.scope = "row";
    }
    celula.textContent = texto;
    linha.appendChild(celula);
  }

  function apresentarResumo() {
    const resumo = regras.calcularPedido(pedido);
    elementos.itens.textContent = "";
    resumo.itens.forEach(function (item) {
      const linha = document.createElement("tr");
      acrescentarCelula(linha, item.nome, true);
      acrescentarCelula(linha, String(item.quantidade), false);
      acrescentarCelula(linha, regras.formatarMoeda(item.precoUnitarioCentavos), false);
      acrescentarCelula(linha, regras.formatarMoeda(item.valorCentavos), false);
      const celulaAcoes = document.createElement("td");
      const acoes = document.createElement("div");
      acoes.className = "acoes-item";

      const rotuloEdicao = document.createElement("label");
      rotuloEdicao.htmlFor = "editar-" + item.produtoId;
      rotuloEdicao.className = "sr-only";
      rotuloEdicao.textContent = "Nova quantidade de " + item.nome;

      const campoEdicao = document.createElement("input");
      campoEdicao.id = "editar-" + item.produtoId;
      campoEdicao.className = "campo-edicao";
      campoEdicao.type = "text";
      campoEdicao.inputMode = "numeric";
      campoEdicao.value = String(item.quantidade);
      campoEdicao.disabled = pedido.finalizado;
      campoEdicao.setAttribute("aria-label", "Nova quantidade de " + item.nome);

      const botaoEditar = document.createElement("button");
      botaoEditar.type = "button";
      botaoEditar.className = "botao-editar";
      botaoEditar.textContent = "Alterar";
      botaoEditar.dataset.acao = "editar";
      botaoEditar.dataset.produto = item.produtoId;
      botaoEditar.disabled = pedido.finalizado;

      const botaoRemover = document.createElement("button");
      botaoRemover.type = "button";
      botaoRemover.className = "botao-remover";
      botaoRemover.textContent = "Remover";
      botaoRemover.dataset.acao = "remover";
      botaoRemover.dataset.produto = item.produtoId;
      botaoRemover.disabled = pedido.finalizado;

      acoes.append(rotuloEdicao, campoEdicao, botaoEditar, botaoRemover);
      celulaAcoes.appendChild(acoes);
      linha.appendChild(celulaAcoes);
      elementos.itens.appendChild(linha);
    });
    const temItens = resumo.itens.length > 0;
    elementos.vazio.hidden = temItens;
    elementos.tabela.hidden = !temItens;
    elementos.subtotal.textContent = regras.formatarMoeda(resumo.subtotalCentavos);
    elementos.desconto.textContent = regras.formatarMoeda(resumo.descontoCentavos);
    elementos.total.textContent = regras.formatarMoeda(resumo.totalCentavos);
    elementos.campos.disabled = pedido.finalizado;
    // Disponível no pedido vazio para apresentar a orientação da RN07.
    elementos.finalizar.disabled = pedido.finalizado;
  }

  function limparErrosDosCampos() {
    elementos.produto.removeAttribute("aria-invalid");
    elementos.quantidade.removeAttribute("aria-invalid");
  }

  elementos.formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    limparErrosDosCampos();
    const resultado = regras.adicionarItem(
      pedido,
      elementos.produto.value,
      elementos.quantidade.value
    );
    if (!resultado.ok) {
      mostrarMensagem(resultado.mensagem, "erro");
      if (resultado.campo) {
        elementos[resultado.campo].setAttribute("aria-invalid", "true");
        elementos[resultado.campo].focus();
      }
      return;
    }
    pedido = resultado.pedido;
    apresentarResumo();
    mostrarMensagem(resultado.mensagem, "sucesso");
  });

  elementos.itens.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao || pedido.finalizado) {
      return;
    }
    const produtoId = botao.dataset.produto;
    if (botao.dataset.acao === "remover") {
      const resultado = regras.removerItem(pedido, produtoId);
      if (!resultado.ok) {
        mostrarMensagem(resultado.mensagem, "erro");
        return;
      }
      pedido = resultado.pedido;
      apresentarResumo();
      mostrarMensagem(resultado.mensagem, "sucesso");
      return;
    }

    const campo = document.getElementById("editar-" + produtoId);
    campo.removeAttribute("aria-invalid");
    const resultado = regras.editarItem(pedido, produtoId, campo.value);
    if (!resultado.ok) {
      mostrarMensagem(resultado.mensagem, "erro");
      campo.setAttribute("aria-invalid", "true");
      campo.focus();
      return;
    }
    pedido = resultado.pedido;
    apresentarResumo();
    mostrarMensagem(resultado.mensagem, "sucesso");
  });

  elementos.finalizar.addEventListener("click", function () {
    const resultado = regras.finalizarPedido(pedido);
    if (!resultado.ok) {
      mostrarMensagem(resultado.mensagem, "erro");
      if (!pedido.finalizado) {
        elementos.produto.focus();
      }
      return;
    }
    pedido = resultado.pedido;
    const resumo = resultado.resumo;
    apresentarResumo();
    elementos.valoresConfirmados.textContent =
      "Subtotal: " + regras.formatarMoeda(resumo.subtotalCentavos) +
      ". Desconto: " + regras.formatarMoeda(resumo.descontoCentavos) +
      ". Total: " + regras.formatarMoeda(resumo.totalCentavos) + ".";
    elementos.confirmacao.hidden = false;
    mostrarMensagem(resultado.mensagem, "sucesso");
    elementos.confirmacao.focus();
  });

  apresentarCardapio();
  apresentarResumo();
})();
