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
    this.linhaCifraOriginal = linhaCifra || "";
    this.linhaCifra = linhaCifra || "";
    this.linhaLetra = linhaLetra || "";
    this.fimParagrafo = fimParagrafo || false;
  }

  static extrairDaCifra(afinacao, cifra) {
    let cifras = [];
    const cifraByLine = cifra.split("\n");
    // Regex para identificar padrão de tablatura
    const regexLinhaTablatura = new RegExp(/(.+)\|-(.+)/, "gi");
    const regexNota = new RegExp(/[ABCDEFG]([\w#()]{1,7})?/, "g"),
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
          cifra.linhaCifraOriginal = linha;

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

    return cifras;
  }

  render(modo = "desktop", caracteresPorLinha = 124) {
    let html = "";
    if (this.linhaCifra) {
      let tmpCifraHtml = this.linhaCifra.replace(
        new RegExp(/[ABCDEFG]([\w#()]{1,7})?/, "g"),
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

    return html;
  }

  alterarTom() {
    const numeroTomOriginal = dicionarioTons[appState.tomOriginal],
      numeroTomAtual = dicionarioTons[appState.tom],
      variacaoTom = numeroTomAtual - numeroTomOriginal;

    const trocaNota = (nota, variacaoTom) => {
      // Captura nota e vê o índice dela
      const notaIndex = dicionarioNotas[nota],
        // Verifica o tom que está para indicar as notas que pertencem a esse tom
        tom = appState.tom,
        padroesTom = {
          maior: [0, 2, 4, 5, 7, 9, 11],
          menor: [0, 2, 3, 5, 7, 8, 11],
        },
        padraoTom = tom.includes("m")
          ? padroesTom["menor"]
          : padroesTom["maior"];

      let ordemNotas = ["C", "D", "E", "F", "G", "A", "B"];
      let notas = {};

      // Reordenando `ordemNotas` com base no tom atual
      let tmpOrdemNotas = [...ordemNotas];
      // Verifica qual a primeira nota da ordem
      tmpOrdemNotas[0] = tom.match(RegExp(/[ABCDEFG]/))[0];
      // Verifica em que index da ordem está essa nota
      let index0 = ordemNotas.findIndex((nota) => nota === tmpOrdemNotas[0]);
      const getIndexNota = (index) => {
        return index >= 7 ? index - 7 : index < 0 ? index + 7 : index;
      };
      // Adicionando demais notas na ordem
      for (let i = 1; i < 7; i++) {
        tmpOrdemNotas[i] = ordemNotas[getIndexNota(index0 + i)];
      }

      ordemNotas = [...tmpOrdemNotas];

      /** Função que ajusta o index caso passe das 12 notas */
      const getIndexSemitom = (index) => {
        return index > 12 ? index - 12 : index <= 0 ? index + 12 : index;
      };

      let notasPreferenciais = [];
      for (let i = 0; i < 7; i++) {
        let notaAtual = Object.entries(dicionarioNotas).filter(
          (notaBuscada) => {
            return (
              notaBuscada[0].includes(ordemNotas[i]) &&
              notaBuscada[1] ===
                getIndexSemitom(dicionarioNotas[tom] + padraoTom[i])
            );
          }
        )[0];
        notasPreferenciais[i] = notaAtual[0];
      }

      let notaAtual = Object.entries(dicionarioNotas).filter((notaBuscada) => {
        return notaBuscada[1] === getIndexSemitom(notaIndex + variacaoTom);
      });

      if (notaAtual.length === 1) {
        return notaAtual[0][0];
      } else {
        let notaPreferencial = notaAtual.filter((notaBuscada) =>
          notasPreferenciais.includes(notaBuscada[0])
        );
        if (notaPreferencial.length > 0) {
          return notaPreferencial[0][0];
        } else {
          console.log(nota, notaAtual, notaIndex+variacaoTom)
          return notaAtual[0][0];
        }
      }
    };

    const regexNotaIndividual = new RegExp(
      /(Ab|A#|A|Bb|B#|B|Cb|C#|C|Db|D#|D|Eb|E#|E|Fb|F#|F|Gb|G#|G|A)/,
      "g"
    );

    this.linhaCifra = this.linhaCifraOriginal;
    this.linhaCifra = this.linhaCifra.replace(regexNotaIndividual, (m) =>
      trocaNota(m, variacaoTom)
    );
  }
}
