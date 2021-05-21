/**
 * Carlos R. L. Rodrigues
 * http://jsfromhell.com/array/combine [rev. #1]
 *
 * @param {Array} a Array para recombinar
 * @param {int} q numero de itens no agrupamento
 */
function combine(a, q) {
  var n = a.length - 1,
    l = n - q + 1,
    x = 0,
    c = [],
    z = -1,
    p,
    j,
    d,
    i;
  if (q > n || q < 2) return c;
  for (p = [], i = q; (p[--i] = i); );
  while (x <= l) {
    for (c[++z] = [], j = -1; ++j < q; c[z][j] = a[p[j]]);
    if (++p[j - 1] > n)
      while (j--)
        if ((!j && x++, (d = p[j]) < l + j)) {
          while (j < q) p[j++] = ++d;
          break;
        }
  }
  return c;
}

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

  /**
   * Verifica se as notas na mesma casa são tocáveis, notas tocáveis são aquelas que estão numa distância máxima de 4 casas
   * @param {Afinacao} afinacao
   * @param {array} coluna Array de Notacao
   */
  static notasTocaveis(afinacao, coluna, distancaMaxima = 4) {
    let newColuna = [];
    if (coluna.length >= 2) {
      // Notas sendo tocadas juntas
      // console.log("----------");
      const notacoesEmColunas = [];
      // Invertendo matriz de linhas para colunas e guardando em notacoesEmColunas
      coluna.forEach((notacao, i) => {
        notacao.notacoes.forEach((detalhe, j) => {
          if (!notacoesEmColunas[j]) {
            notacoesEmColunas[j] = [];
          }
          // tempId é o Id do item da coluna que ele se encontra, para poder readicionar depois no final dos calculos
          notacoesEmColunas[j].push({ ...detalhe, tempId: i });
        });
      });

      notacoesEmColunas.forEach((colunaNotacaoDetalhada) => {
        if (
          colunaNotacaoDetalhada.reduce(
            (acc, cur) => acc + parseInt(cur.valor),
            0
          ) >= 0
        ) {
          // Verifica se todos os dígitos da coluna são números
          const allTheSame = (array) => {
            const elementValue = array[0].valor;
            let bool = true;
            for (let j = 1; j < array.length; j++) {
              if (parseInt(array[j].valor) !== parseInt(elementValue)) {
                bool = false;
                break;
              }
            }
            return bool;
          };

          const distanciaEntreColunas = (colunaBinaria) =>
            Math.abs(
              parseInt(colunaBinaria[0].valor) -
                parseInt(colunaBinaria[1].valor)
            );

          const converterCasaParaNota = (notacaoDetalhada) => {
            console.log(notacaoDetalhada);
            const calculoBrutoNota =
              afinacao.cordas[notacaoDetalhada.cordaIndex].nota.numero +
              parseInt(notacaoDetalhada.valor);
            if (calculoBrutoNota < 12) {
              return calculoBrutoNota;
            } else {
              return calculoBrutoNota % 12;
            }
          };

          const encontrarNotaProximaVazia = (colunaNotacaoDetalhada) => {
            let cordasVazias = [];
            afinacao.cordas.forEach((corda, cordaIndex) => {
              if (
                coluna.filter((notacao) => notacao.cordaIndex === cordaIndex)
                  .length === 0
              ) {
                cordasVazias.push(corda);
              }
            });

            console.log(colunaNotacaoDetalhada);
            for (let i = 0; i < cordasVazias.length; i++) {
              // tem que encontrar uma corda onde a nota seja igual à converterCasaParaNota(colunaNotacaoDetalhada[1]) e a distancia para a casa colunaNotacaoDetalhada[0].valor seja menor que a distancia máxima

              // Convertendo uma nota para a casa onde ela fica na corda
              let casaNaCorda =
                converterCasaParaNota(colunaNotacaoDetalhada[1]) -
                cordasVazias[i].nota.numero;
              if (casaNaCorda < 0) {
                casaNaCorda += 12;
              } else if (casaNaCorda > cordasVazias[i].limiteDeCasas) {
                casaNaCorda -= 12;
              }
              // Verifica se a casa encontrada está próxima, se não tiver tenta oitavar
              if (
                casaNaCorda <
                  parseInt(colunaNotacaoDetalhada[0].valor) - distancaMaxima &&
                casaNaCorda + 12 < cordasVazias[i].limiteDeCasas
              ) {
                casaNaCorda += 12;
              }

              // Verificando se está próximo se estiver próximas as casas para o loop, por isso o for
              if (
                casaNaCorda >
                  colunaNotacaoDetalhada[0].valor - distancaMaxima &&
                casaNaCorda < colunaNotacaoDetalhada[0].valor + distancaMaxima
              ) {
                colunaNotacaoDetalhada[1] = {
                  ...colunaNotacaoDetalhada[1],
                  valor: String(casaNaCorda),
                  cordaIndex: i,
                };
              }
            }
            console.log(colunaNotacaoDetalhada);
          };

          if (
            allTheSame(colunaNotacaoDetalhada) === false &&
            colunaNotacaoDetalhada.length >= 3
          ) {
            // Verifica se todos os números da coluna não são iguais para poupar combinação, só combina se os números forem diferentes
            const combinacaoDeNotas = combine(colunaNotacaoDetalhada, 2);
            // Caso na análise não tenha nada que distancie mais do que a distancia máxima de casas, não faz nada
            let maiorQueDistanciaMaxima = false;
            // console.log(combinacaoDeNotas);
          } else if (colunaNotacaoDetalhada.length === 2) {
            if (
              distanciaEntreColunas(colunaNotacaoDetalhada) > distancaMaxima
            ) {
              encontrarNotaProximaVazia(colunaNotacaoDetalhada);
              // console.log(colunaNotacaoDetalhada);
            }
          }

          colunaNotacaoDetalhada.forEach((notacaoDetalhada) => {
            const tempId = notacaoDetalhada.tempId;
            delete notacaoDetalhada.tempId;
            newColuna[tempId] = {
              ...coluna[tempId],
              match: notacaoDetalhada.valor,
              length: notacaoDetalhada.valor.length,
              cordaIndex: notacaoDetalhada.cordaIndex,
              print: notacaoDetalhada.valor,
              notacoes: [],
            };
            newColuna[tempId].notacoes.push(notacaoDetalhada);
          });
        }
      });
      console.log(newColuna);
    }
    if (newColuna.length <= 0) newColuna = coluna;
    return newColuna;
  }
}

class Notacao {
  /**
   *
   * @param {string} match // O match do regex à procura de notações, partindo de uma string escrita em texto corrido
   * @param {int} index // Em que indexOf da linha o registro deu match, útil na substituição
   * @param {int} length // tamanho da string match
   * @param {array} notacoes // string match com mais detalhes, dividido em pequenos objetos que define se é uma nota ou um efeito
   * @param {int} ordem // coluna em que o match aparece, uma coluna é o momento em que notas devem ser tocadas simultâneamente
   * @param {int} tablaturaIndex // qual o index da tablatura de appState.tablaturas, essa notação pertence
   * @param {int} cordaIndex // o index da corda da tablatura que essa notação pertence
   * @param {string} print // O texto corrigido que deve aparecer por extenso na tablatura
   */
  constructor({
    match,
    index,
    length,
    notacoes,
    ordem,
    tablaturaIndex,
    cordaIndex,
    print,
  }) {
    this.index = index;
    this.match = match;
    this.length = length || this.match.length;
    this.notacoes = notacoes || Notacao.getNotacoes(this.match);
    this.ordem = ordem;
    this.tablaturaIndex = tablaturaIndex;
    this.cordaIndex = cordaIndex;
    this.print = print || this.match;
  }

  /** Extrai os matches das notações, detalhando mais eles na diferenciação de notas e efeitos */
  static getNotacoes(notacao) {
    let notas = notacao.match.split(/\D/).filter((nota) => nota !== ""),
      efeitos = notacao.match.split(/\d+/).filter((efeito) => efeito !== "");

    // Primeiramente verifica posicionamento dos dígitos
    notas.forEach((nota, i, a) => {
      let indexOfString = notacao.match.indexOf(nota);
      a[i] = {
        valor: nota,
        tipo: "nota",
        index: indexOfString,
        cordaIndex: notacao.cordaIndex,
      };
    });

    // Verifica posicionamento dos efeitos
    efeitos.forEach((efeito, i, a) => {
      let indexOfString = notacao.match.indexOf(efeito);
      a[i] = {
        valor: efeito,
        tipo: "efeito",
        index: indexOfString,
        cordaIndex: notacao.cordaIndex,
      };
    });

    // Une as notações diferenciando efeitos e notas
    const notacoes = [...notas, ...efeitos].sort((a, b) =>
      a.index > b.index ? 1 : b.index > a.index ? -1 : 0
    );

    return notacoes;
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
        print: match,
        notacoes,
        length: match.length,
      };
    });

    this.notacoes = notacoesAtuais;

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
    appState.tablaturas.forEach((tablatura, i) => {
      if (!i) $("#tablaturas").text(""); // Primeira linha "0"

      let notacoesAtuaisEmColunas = {};
      // Verificando qual a ultima coluna
      let ultimaColuna =
        tablatura.notacoes[tablatura.notacoes.length - 1].ordem;
      // Visualizando as notações por colunas
      for (let i = 0; i <= ultimaColuna; i++) {
        let coluna = tablatura.notacoes.filter(
          (notacao) => notacao.ordem === i
        );

        if (coluna.length) {
          notacoesAtuaisEmColunas[i] = coluna;
        }
      }

      // Zerando a tablatura
      let tablaturaString = [];

      /**
       * Foi solicitado que, se tivessem duas notações numa mesma coluna
       * com slides, sendo que as notações possuissem quantidade de dígitos
       * diferentes, a barra deveria ser centralizada, ou seja:
       * 9/12  >>>  9/12
       * 11/14 >>> 11/14
       * @param {array} coluna
       */
      const alinhamentoSlides = (coluna) => {
        return coluna;
      };

      Object.values(notacoesAtuaisEmColunas).forEach((coluna) => {
        coluna = Afinacao.notasTocaveis(tablatura.afinacao, coluna);
        coluna = alinhamentoSlides(coluna);
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

        tablatura.cordas.forEach((corda, cordaIndex) => {
          let string;
          if (tablaturaString[cordaIndex]) {
            string = tablaturaString[cordaIndex];
          } else {
            string = `${corda.nota.notacao.padStart(2, " ")}|-`;
          }
          if (notacaoCordas[cordaIndex]) {
            string = `${string}${notacaoCordas[cordaIndex].print.padEnd(
              biggerLength,
              "-"
            )}-`;
          } else {
            string = `${string}${"".padEnd(biggerLength, "-")}-`;
          }
          tablaturaString[cordaIndex] = string;
        });
      });

      tablatura.tablaturaString = tablaturaString;

      if (modo === "desktop") {
        tablatura.tablaturaString.forEach((linha) => {
          $("#tablaturas").append(linha);
          $("#tablaturas").append("\n");
        });
      } else if (modo === "mobile") {
        tablatura.tablaturaStringMobile.forEach((bloco) => {
          bloco.forEach((linha) => {
            $("#tablaturas").append(linha);
            $("#tablaturas").append("\n");
          });
          $("#tablaturas").append("\n");
        });
      } else {
        $("#tablaturas").append(
          "Modo de renderização de tablaturas não reconhecido"
        );
      }
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

      // Adiciona as notações com mais detalhes para que possa ser feita as alterações de notas
      indexedMatchesTablatura.forEach((notacao, i, a) => {
        a[i] = new Notacao({
          ...notacao,
          notacoes: Notacao.getNotacoes(notacao),
        });
      });

      tablatura.notacoes = indexedMatchesTablatura;
      tablatura.notacoesOriginais = indexedMatchesTablatura;
      indexedMatches.push(indexedMatchesTablatura);
    });

    return tablaturas;
  }
}
