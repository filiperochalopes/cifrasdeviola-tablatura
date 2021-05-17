/**
 * Relação das 12 notas ocidentais, atribuindo o mesmo número
 * a notas equivalentes numa mesma oitava
 */
const dicionarioNotas = {
  Cb: 12,
  C: 1,
  "C#": 2,
  Db: 2,
  D: 3,
  "D#": 4,
  Eb: 4,
  E: 5,
  "E#": 6,
  Fb: 5,
  F: 6,
  "F#": 7,
  Gb: 7,
  G: 8,
  "G#": 9,
  Ab: 9,
  A: 10,
  "A#": 11,
  Bb: 11,
  B: 12,
  "B#": 1,
};

const dicionarioTons = {
  C: 1,
  "C#": 2,
  D: 3,
  "D#": 4,
  E: 5,
  F: 6,
  "F#": 7,
  G: 8,
  Ab: 9,
  A: 10,
  Bb: 11,
  B: 12,
};

class Nota {
  constructor(notacao, numero) {
    this.notacao = notacao;
    this.numero = numero || dicionarioNotas[notacao];
  }

  /** Captura uma nota pelo seu número */
  static capturarNota = (numero) => {
    // 64
    let notaNumero;
    // Se > 12 divido o valor por 12 que é o número de notas em uma oitava
    if (numero > 12) {
      notaNumero = numero % 12;
    } else {
      notaNumero = numero;
    }

    // Aqui não leva em consideração o tom para dar o nome da nota, já que é irrelevante para a tablatura que só leva o número das casas
    const notacao = Object.entries(dicionarioNotas).filter(
      (nota) => nota[1] === numero
    )[0];
    return new Nota(notacao, notaNumero);
  };
}

class Corda {
  constructor(notacao, limiteDeCasas) {
    this.nota = new Nota(notacao, dicionarioNotas[notacao]);
    this.limiteDeCasas = limiteDeCasas || 19;
  }
}

class Afinacao {
  constructor(nome, apelido, cordas) {
    this.nome = nome;
    this.apelido = apelido;
    this.cordas = cordas || [];
  }
}

const afinacoes = [
  new Afinacao("Cebolão de D", "D", [
    new Corda("D"),
    new Corda("A"),
    new Corda("F#"),
    new Corda("D"),
    new Corda("A"),
  ]),
  new Afinacao("Cebolão de E", "E", [
    new Corda("E"),
    new Corda("B"),
    new Corda("G#"),
    new Corda("E"),
    new Corda("B"),
  ]),
];

const afinacoesPorApelido = afinacoes.reduce((acc, cur) => {
  return { ...acc, [cur.apelido]: cur };
}, {});

// Frases para excluir, pois não fazem parte da tablatura
new RegExp("riff(.+)", "gi");

class Tablatura {
  constructor(afinacao, notacoes, tablaturaString) {
    // Afinação que define a ordem das cordas iniciais de criação
    this.afinacao = afinacao;
    this.cordas = afinacao.cordas.reduce((acc, cur) => {
      return { ...acc, [cur.apelido]: cur };
    }, {});
    // Notações organizadas por tempo e cordas, as linhas são na verdade em colunas seguindo a sequencia das cordas da presente afinação
    this.notacoes = notacoes || [];
    // Raw da tablatura como extraída. Útil para análise e substituição ao trocar de tom ou afinação
    this.tablaturaString = tablaturaString || [];
    this.tablaturaStringOriginal = tablaturaString || [];

    this.init();
  }

  init() {
    this.tablaturaStringOriginal = this.tablaturaString;
  }

  trocarAfinacao() {
    console.log("Afinação trocada");
  }

  alterarTom() {
    const numeroTomOriginal = dicionarioTons[appState.tomOriginal],
      numeroTomAtual = dicionarioTons[appState.tom],
      variacaoTom = numeroTomAtual - numeroTomOriginal;
    console.log(
      `Tom trocado. Tom original: ${appState.tomOriginal}, Tom novo: ${appState.tom}, variação de notas: ${variacaoTom}`
    );
  }

  render() {
    console.log(this.tablaturaStringOriginal);
    this.tablaturaString.forEach((linha) => {
      $("#tablaturas").append(linha);
      $("#tablaturas").append("\n");
    });
    $("#tablaturas").append("\n\n");
  }

  /** Extrair linhas de tablatura da cifra */
  static extrairDaCifra(afinacao, cifra) {
    let tablatura, linhasTablatura;
    const tablaturas = [];
    const numeroCordas = afinacao.cordas.length;

    // Econtrando tablaturas
    const regexLinhaTablatura = new RegExp(/(.+)\|-(.+)/, "gi");
    linhasTablatura = cifra.match(regexLinhaTablatura);

    //  Verifica se o número de cordas da afinação bate com as tablaturas  da cifra
    if (linhasTablatura.length % numeroCordas !== 0) {
      console.error(
        "Há uma incompatibilidade entre o número de cordas e o número de tablaturas na cifra"
      );
    }

    let linhasTablaturaIndex = 0;
    for (let i = 0; i < linhasTablatura.length / 5; i++) {
      //  Cria array de agrupamento de cordas, formando um pacote de tablatura com cinco cordas
      const tablaturaAtual = new Tablatura(afinacao, []);
      for (let j = 0; j < numeroCordas; j++) {
        //  Adiciona as notacoes às linhas
        tablaturaAtual.tablaturaString.push(
          linhasTablatura[linhasTablaturaIndex]
        );
        linhasTablaturaIndex++;
      }
      tablaturas.push(tablaturaAtual);
    }

    // lista com as notações encontradas com a ordem de quem veio primeiro
    let indexedMatches = [];
    tablaturas.forEach((tablatura, i) => {
      let indexedMatchesTablatura = [];
      tablatura.tablaturaString.forEach((linha, j) => {
        // Encontrando notas numa tablatura e também textos de estrofe como "Riff 2" para que possa ser excluído
        const notacaoRegEx = new RegExp(
          /((\d+)?h(\d+)?)|((\d+)?p(\d+)?)|(\d+(~|v))|((\d+)?(\/|s)(\d+)?)|(\s+?\[.+\]\s)|(\d+)/,
          "gi"
        );

        linha = linha.replace(/.+\|/, "");
        let indexes = [],
          result;
        while ((result = notacaoRegEx.exec(linha))) {
          indexes.push({
            match: result[0],
            index: result.index,
            length: result[0].length,
            cordaIndex: j,
            tablaturaIndex: i,
          });
        }
        indexedMatchesTablatura.push(indexes);
      });

      indexedMatchesTablatura = indexedMatchesTablatura
        .reduce((acc, cur) => {
          return [...acc, ...cur];
        }, [])
        .sort((a, b) => (a.index > b.index ? 1 : b.index > a.index ? -1 : 0));

      // A ordem em que os itens devem aparecer, que são, no caso as colunas de notações, ou ainda o tempo da tablatura. No tempo 0 vão as primeiras notas a serem tocadas
      let ordem = 0;
      indexedMatchesTablatura.forEach((notacao, k, arr) => {
        indexedMatchesTablatura.forEach((notacaoAnalisada, l) => {
          if (k !== l) {
            if (
              (notacaoAnalisada.index <= notacao.index + notacao.length - 1 &&
                notacaoAnalisada.index >= notacao.index) ||
              notacaoAnalisada.index === notacao.index
            ) {
              // O dedilhado das duas notações são ao mesmo tempo
              if (!notacaoAnalisada.ordem) {
                arr[l].ordem = ordem;
              }
            }
          }
        });
        if (!notacao.ordem) {
          arr[k].ordem = ordem;
          ordem++;
        }
      });

      // Separa por colunas, ou seja: "ordem"
      let orderedMatchesTablatura = [];
      for (let o = 0; o < ordem; o++) {
        orderedMatchesTablatura.push(
          indexedMatchesTablatura.filter((match) => match.ordem === o)
        );
      }

      // Retirando arrays em branco
      orderedMatchesTablatura = orderedMatchesTablatura.filter(
        (match) => match.length > 0
      );
      indexedMatches.push(indexedMatchesTablatura);
    });

    $("#tablaturas").text("");
    tablaturas.forEach((tablatura) => tablatura.render());

    return tablaturas;
  }
}
