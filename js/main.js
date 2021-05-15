$(document).ready(function () {
  function trocarCifra(cifra) {
    $.ajax({
      url: `examples/${cifra}.txt`,
      dataType: "text",
      success: function (data) {
        $("#cifra").text(data);
        Tablatura.extrairDaCifra(afinacoesPorApelido["D"], data);
      },
    });
  }

  // Ao trocar campo select de cifras, popula os dados de cifras
  $("#cifras").change((e) => trocarCifra(e.target.value));
  $("#cifras").change();
});
