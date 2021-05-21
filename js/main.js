$(document).ready(function () {
  function trocarCifra(cifra) {
    $.ajax({
      url: `examples/${cifra}.txt`,
      dataType: "text",
      success: function (data) {
        $("#cifra").text(data);
        appState.tablaturas = Tablatura.extrairDaCifra(
          afinacoesPorApelido["E"],
          data
        );
        Tablatura.render();
      },
    });
  }

  // Populando select de afinações
  afinacoes.forEach((afinacao) => {
    $("select#afinacao").append(
      `<option value="${afinacao.apelido}" ${
        appState.afinacao === afinacao.apelido ? "selected" : ""
      }>${afinacao.nome}</option>`
    );
  });

  // Ao trocar campo select de cifras, popula os dados de cifras
  $("#cifras").change((e) => trocarCifra(e.target.value));
  $("#cifras").change();

  // Regulagem de tons, preenchendo tom principal
  $("input#tom").val(appState.tom);
  // Alterando tom pelo botão de "Reduzir Meio Tom"
  $("button#reduzir_meio_tom").click(() => {
    let novoTom = Object.entries(dicionarioTons).filter(
      (nota) => nota[1] === dicionarioTons[appState.tom] - 1
    );
    if (!novoTom.length) {
      novoTom = "B";
    } else {
      novoTom = novoTom[0][0];
    }
    appState.tom = novoTom;
    $("input#tom").val(appState.tom);
    appState.tablaturas.forEach((tablatura) => tablatura.alterarTom(novoTom));
  });
  // Alterando tom pelo botão de "Aumentar Meio Tom"
  $("button#aumentar_meio_tom").click(() => {
    let novoTom = Object.entries(dicionarioTons).filter(
      (nota) => nota[1] === dicionarioTons[appState.tom] + 1
    );
    if (!novoTom.length) {
      novoTom = "C";
    } else {
      novoTom = novoTom[0][0];
    }
    appState.tom = novoTom;
    $("input#tom").val(appState.tom);
    appState.tablaturas.forEach((tablatura) => tablatura.alterarTom(novoTom));
  });
  // Alterando tom direto pela digitação
  $("input#tom").change((e) => {
    let novoTom = e.target.value;
    if (Object.keys(dicionarioNotas).includes(novoTom)) {
      novoTom = Object.entries(dicionarioTons).filter(
        (tom) => tom[1] === dicionarioNotas[novoTom]
      )[0][0];
    } else {
      novoTom = appState.tom;
    }
    appState.tom = novoTom;
    appState.tablaturas.forEach((tablatura) => tablatura.alterarTom(novoTom));
    $("input#tom").val(appState.tom);
  });

  // Setando afinação inicial
  $("select#afinacao").val(appState.afinacao);
});
