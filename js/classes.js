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
    this.cordas = afinacao.cordas;
    // Notações organizadas por tempo e cordas, as linhas são na verdade em colunas seguindo a sequencia das cordas da presente afinação
    this.notacoes = notacoes || [];
    this.notacoesOriginais = [];
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

    let notacoesAtuais = [];
    this.notacoesOriginais.forEach((notacao) => {
      notacoesAtuais.push({ ...notacao, notacoes: [...notacao.notacoes] });
    });

    notacoesAtuais.forEach((notacao, i, a) => {
      const notacoes = notacao.notacoes.map((n) => {
        let valor = n.valor;
        if (n.tipo === "nota") {
          if (
            parseInt(valor) + variacaoTom >= 0 &&
            parseInt(valor) + variacaoTom <=
              this.cordas[notacao.cordaIndex].limiteDeCasas
          ) {
            // Caso a nota esteja dentro das casas do braço
            valor = String(parseInt(valor) + variacaoTom);
          } else if (parseInt(valor) + variacaoTom < 0) {
            // Caso o valor esteja abaixo da linha do traste
            // A nota alvo é dada pela verificação da corda
            let notaAlvo =
              this.cordas[notacao.cordaIndex].nota.numero + variacaoTom;
            notaAlvo = new Nota(
              Object.entries(dicionarioTons).filter(
                (tom) => tom[1] === notaAlvo
              )[0][0]
            );
            // TODO Verificar se é possível transpor em corda anterior
            // Sobe uma oitava
            valor = String(
              notaAlvo.numero - this.cordas[notacao.cordaIndex].nota.numero + 12
            );
            console.log(
              this.cordas[notacao.cordaIndex].nota.numero,
              12,
              notaAlvo
            );
          } else if (
            parseInt(valor) + variacaoTom >
            this.cordas[notacao.cordaIndex].limiteDeCasas
          ) {
            // Caso o valor esteja acima do limite das casas do braço
            valor = String(parseInt(valor) + variacaoTom - 12);
          }
        }
        return { ...n, valor };
      });

      const match = notacoes
        .reduce((acc, cur) => [...acc, cur.valor], [])
        .join("");
      a[i] = {
        ...notacao,
        match,
        notacoes,
        length: match.length,
      };
    });

    this.notacoes = notacoesAtuais;

    let notacoesAtuaisEmColunas = {};
    // Verificando qual a ultima coluna
    let ultimaColuna = notacoesAtuais[notacoesAtuais.length - 1].ordem;
    // Visualizando as notações por colunas
    for (let i = 0; i <= ultimaColuna; i++) {
      let coluna = notacoesAtuais.filter((notacao) => notacao.ordem === i);

      if (coluna.length) {
        notacoesAtuaisEmColunas[i] = coluna;
      }
    }

    // Zerando a tablatura
    let tablaturaString = [];
    Object.values(notacoesAtuaisEmColunas).forEach((coluna) => {
      // Verifica qual a notacao de maior tamanho
      let biggerLength = 0;
      coluna.forEach((linha) => {
        if (linha.length > biggerLength) biggerLength = linha.length;
      });
      // Organizando as colunas por linhas
      let notacaoCordas = coluna.reduce(
        (acc, cur) => ({ ...acc, [cur.cordaIndex]: cur }),
        {}
      );
      // console.log(notacaoCordas);
      this.cordas.forEach((corda, cordaIndex) => {
        let string;
        if (tablaturaString[cordaIndex]) {
          string = tablaturaString[cordaIndex];
        } else {
          string = `${corda.nota.notacao.padStart(2, " ")}|`;
        }
        if (notacaoCordas[cordaIndex]) {
          string = `${string}-${notacaoCordas[cordaIndex].match.padEnd(
            biggerLength,
            "-"
          )}-`;
        } else {
          string = `${string}-${"".padEnd(biggerLength, "-")}-`;
        }
        tablaturaString[cordaIndex] = string;
      });
    });

    this.tablaturaString = tablaturaString;
    Tablatura.render();

    console.log(
      `Tom trocado. Tom original: ${appState.tomOriginal}, Tom novo: ${appState.tom}, variação de notas: ${variacaoTom}`
    );
  }

  /**
   * Método estático que renderiza as tablaturas
   * Para utilizar a quebra de tablatura, utilizar o
   * modo='mobile'
   */
  static render(modo = "desktop") {
    // console.log(this.tablaturaStringOriginal);
    appState.tablaturas.forEach((tablatura, i) => {
      if (!i) $("#tablaturas").text(""); // Primeira linha "0"
      tablatura.tablaturaString.forEach((linha, i) => {
        $("#tablaturas").append(linha);
        $("#tablaturas").append("\n");
      });
      $("#tablaturas").append("\n\n");
    });
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

        // linha = linha.replace(/.+\|/, "");
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

      /** Extrai os matches das notações, detalhando mais eles na diferenciação de notas e efeitos */
      const extrairNotacoes = (string) => {
        let notas = string.split(/\D/).filter((nota) => nota !== ""),
          efeitos = string.split(/\d+/).filter((efeito) => efeito !== "");

        // Primeiramente verifica posicionamento dos dígitos
        notas.forEach((nota, i, a) => {
          let indexOfString = string.indexOf(nota);
          a[i] = {
            valor: nota,
            tipo: "nota",
            index: indexOfString,
          };
        });

        // Verifica posicionamento dos efeitos
        efeitos.forEach((efeito, i, a) => {
          let indexOfString = string.indexOf(efeito);
          a[i] = {
            valor: efeito,
            tipo: "efeito",
            index: indexOfString,
          };
        });

        // Une as notações diferenciando efeitos e notas
        const notacoes = [...notas, ...efeitos].sort((a, b) =>
          a.index > b.index ? 1 : b.index > a.index ? -1 : 0
        );

        return notacoes;
      };

      // Adiciona as notações com mais detalhes para que possa ser feita as alterações de notas
      indexedMatchesTablatura.forEach((notacao, i, a) => {
        a[i] = { ...notacao, notacoes: extrairNotacoes(notacao.match) };
      });

      tablatura.notacoes = indexedMatchesTablatura;
      tablatura.notacoesOriginais = indexedMatchesTablatura;
      indexedMatches.push(indexedMatchesTablatura);
    });

    return tablaturas;
  }
}
