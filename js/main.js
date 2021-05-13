$(document).ready(function () {
  $.ajax({
    url: "examples/a_sereia_e_o_nego_dagua.txt",
    dataType: "text",
    success: function (data) {
      $("#cifra").text(data);
      Tablatura.extrairDaCifra(data)
    },
  });
});
