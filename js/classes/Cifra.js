/**
 * Representação de linhas cifradas, cada linha
 * que contém cifra em cima são contadas como
 * linhas cifradas. Linhas que não têm cifra são linhas
 * estáticas
 */
class Cifra {
  constructor({ afinacao, linha, linhaCifra, linhaLetra, fimParagrafo }) {
    // Linha onde fica a tablatura, permite que seja ordenada juntamento com as cifras
    this.linha = linha || 0;
    this.afinacao = afinacao;
    this.linhaCifra = linhaCifra || "";
    this.linhaLetra = linhaLetra || "";
    this.fimParagrafo = fimParagrafo || false;
    this.notacoes = [];
  }

  static extrairDaCifra(afinacao, cifra) {
    let cifras = [];
    const cifraByLine = cifra.split("\n");
    // Regex para identificar padrão de tablatura
    const regexLinhaTablatura = new RegExp(/(.+)\|-(.+)/, "gi");
    const regexNota = new RegExp(/[ABCDEF]([\w#()]{1,7})?/, "g"),
      regexWhiteSpaces = new RegExp(/[ ]{2}/, "g");
    const regexLinhaTexto = new RegExp(
      /[1-9A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ:" ]+/,
      "gi"
    );

    let escapedAcordes = acordes.map((acorde) => escapeRegExp(acorde));
    let regexAcordes = escapedAcordes.join("|");
    // console.log(regexAcordes)

    /*
    tmpCifraHtml.replace(
      new RegExp(escapeRegExp(tablatura.tablaturaStringOriginal[0])),
      "<span>$&"
    );
    */

    const isLinhaCifra = (linha) =>
      Boolean(linha.match(regexNota) && linha.match(regexWhiteSpaces));

    cifraByLine.forEach((linha, index) => {
      let cifra = new Cifra({ afinacao });
      // Verifica se a linha não é uma tablatura
      if (!linha.match(regexLinhaTablatura)) {
        // Verifica se é uma linhaCifra
        if (isLinhaCifra(linha)) {
          // Se for uma cifra cria uma new cifra e verifica as duas próximas linhas para ver se tem letra ou parágrafo
          cifra.linhaCifra = linha;

          if (
            cifraByLine[index + 1] &&
            !isLinhaCifra(cifraByLine[index + 1]) &&
            cifraByLine[index + 1].match(regexLinhaTexto)
          ) {
            // Adiciona linha de letra
            cifra.linhaLetra = cifraByLine[index + 1];
          }

          if (
            typeof cifraByLine[index + 2] !== "undefined" &&
            !isLinhaCifra(cifraByLine[index + 2])
          ) {
            // Adiciona linha de espaço entre parágrafo
            cifra.fimParagrafo = true;
          }

          cifra.linha = index;
          cifras.push(cifra);
        } else {
          // Pode ser só um texto, incorporar depois. Mas aí as linhas seguintes não podem ser cifra.
        }
      }
    });

    console.log(cifras);
    return cifras;
  }

  render(modo = "desktop", caracteresPorLinha = 124) {
    let html = "";
    if (this.linhaCifra) {
      let tmpCifraHtml = this.linhaCifra.replace(
        new RegExp(/[ABCDEF]([\w#()]{1,7})?/, "g"),
        "<span class='cifra'>$&</span>"
      );
      html += `${tmpCifraHtml}\n`;
    }
    if (this.linhaLetra) {
      html += `${this.linhaLetra}\n`;
    }
    if (this.fimParagrafo) {
      html += `\n\n`;
    }

    console.log(html);
    return html;
  }
}
