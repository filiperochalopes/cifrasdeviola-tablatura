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
      if (!notacao.estatico) {
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
              // Sobe uma oitava
              valor = String(
                notaAlvo.numero -
                  this.cordas[notacao.cordaIndex].nota.numero +
                  12
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
        a[i] = new Notacao({
          ...notacao,
          match,
          print: match,
          notacoes,
          length: match.length,
        });
      } else {
        a[i] = new Notacao({
          ...notacao,
        });
      }
    });

    this.notacoes = notacoesAtuais;

    console.log(
      `Tom trocado. Tom original: ${appState.tomOriginal}, Tom novo: ${appState.tom}, variação de notas: ${variacaoTom}`
    );
  }

  /**
   * Método estático que renderiza as tablaturas
   * Para utilizar a quebra de tablatura, utilizar o
   * modo='mobile'
   */
  static render(modo = "desktop", colunasPorLinha = 12) {
    /**
     * Foi solicitado que, se tivessem duas notações numa mesma coluna
     * com slides, sendo que as notações possuissem quantidade de dígitos
     * diferentes, a barra deveria ser centralizada, ou seja:
     * 9/12  >>>  9/12
     * 11/14 >>> 11/14
     * @param {array} coluna
     */
    const alinhamentoSlides = (coluna) => {
      let matchIndex = null,
        deveAlinhar = false,
        newColuna = [];
      coluna.forEach((linha) => {
        const match = linha.match.match(/\/|s/);
        if (match && matchIndex !== null && matchIndex !== match.index) {
          deveAlinhar = true;
        }
        if (match) matchIndex = match.index;
      });
      if (deveAlinhar) {
        // Verifica qual das notações tem o maior length, assim, todos devem se pasear nele
        const biggerLength = coluna.sort((a, b) =>
          a.length < b.length ? 1 : b.length < a.length ? -1 : 0
        )[0].length;
        coluna.forEach((notacao) => {
          newColuna.push(
            new Notacao({
              ...notacao,
              notacoes: [...notacao.notacoes],
              print: notacao.match.padStart(biggerLength, "-"),
            })
          );
        });
      }
      return newColuna.length ? newColuna : coluna;
    };

    let cifraHtml = appState.cifraOriginal;

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
      let tablaturaString = [],
        tablaturaStringMobile = [];

      Object.values(notacoesAtuaisEmColunas).forEach((coluna, colunaIndex) => {
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

        // Criando strings de renderização inteiras
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
              notacaoCordas[cordaIndex].estatico ? " " : "-"
            )}${notacaoCordas[cordaIndex].estatico ? " " : "-"}`;
          } else {
            // Não tem nenhuma notação no registro dessa corda, nessa coluna
            const temEstaticoNaColuna = coluna.filter(
              (notacao) => notacao.estatico === true
            ).length;
            string = `${string}${"".padEnd(
              biggerLength,
              temEstaticoNaColuna ? " " : "-"
            )}${temEstaticoNaColuna ? " " : "-"}`;
          }
          tablaturaString[cordaIndex] = string;
        });

        // Criando blocos de strings para quebra em renderização mobile
        tablatura.cordas.forEach((corda, cordaIndex) => {
          let string;
          const indexLinhaQuebrada =
            Math.ceil((colunaIndex + 1) / colunasPorLinha) - 1;

          if (!tablaturaStringMobile[indexLinhaQuebrada])
            tablaturaStringMobile[indexLinhaQuebrada] = [];

          if (tablaturaStringMobile[indexLinhaQuebrada][cordaIndex]) {
            string = tablaturaStringMobile[indexLinhaQuebrada][cordaIndex];
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

          tablaturaStringMobile[indexLinhaQuebrada][cordaIndex] = string;
        });
      });

      tablatura.tablaturaString = tablaturaString;
      tablatura.tablaturaStringMobile = tablaturaStringMobile;

      let html = "";
      if (modo === "desktop") {
        tablatura.tablaturaString.forEach((linha, linhaIndex) => {
          if (!linhaIndex) html += `<span data-tablatura="${i}">`;
          html += `${linha}\n`;
        });
        html += "</span>";
      } else if (modo === "mobile") {
        tablatura.tablaturaStringMobile.forEach((bloco, blocoIndex) => {
          bloco.forEach((linha, linhaIndex) => {
            if (!linhaIndex)
              html += `<span data-tablatura="${i}" data-bloco="${blocoIndex}">`;
            html += `${linha}\n`;
          });
          html += "</span>\n";
        });
      } else {
        $("#tablaturas").append(
          "Modo de renderização de tablaturas não reconhecido"
        );
      }
      html += "\n\n";

      $("#tablaturas").append(html);

      const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      };

      cifraHtml = cifraHtml.replace(
        new RegExp(escapeRegExp(tablatura.tablaturaStringOriginal[0])),
        "<span>$&"
      );
      console.log(
        `/${escapeRegExp(
          tablatura.tablaturaStringOriginal[
            tablatura.tablaturaStringOriginal.length - 1
          ]
        )}\\s\\n/`
      );
      cifraHtml = cifraHtml.replace(
        new RegExp(
          `${escapeRegExp(
            tablatura.tablaturaStringOriginal[
              tablatura.tablaturaStringOriginal.length - 1
            ]
          )}\\s\\n`,
          "s"
        ),
        "$&</span>"
      );
    });

    $("#cifra").html(cifraHtml);

    if (modo === "desktop") {
      $("#cifra span").each(function (index) {
        $(this).html(
          `${appState.tablaturas[index].tablaturaString
            .map((linha) => `${linha}\n`)
            .join("")}\n\n`
        );
      });
    } else if (modo === "mobile") {
      $("#cifra span").each(function (index) {
        $(this).html(
          `${appState.tablaturas[index].tablaturaStringMobile.map((bloco) =>
            `${bloco.map((linha) => `${linha}\n`).join("")}\n`
          ).join("")}\n\n`
        );
      });
    } else {
      $("#cifra span").each(function (index) {
        $(this).html(`Modo de renderização desconhecido\n\n`);
      });
    }
  }

  /**
   * Extrair linhas de tablatura da cifra. O tom original de
   * toda cifra é considerado como Mi. Pois todos os exemplos passados
   * para construção desse script tiveram esse teor
   *
   * @param {Afinacao} afinacao afinação em que a cifra se encontra
   * @param {string} cifra String da cifra
   */
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
          /((\d+)?h(\d+)?)|((\d+)?p(\d+)?)|(\d+(~|v))|((\d+)?(\/|s)(\d+)?)|(\s+?\[.+\]\s)|\(\d+\)|(\d+)|\[.*\]|\(\D+\)/,
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
        const estatico =
          notacao.match.match(new RegExp(/\(\D+\)|\[.+\]/)) !== null;
        a[i] = new Notacao({
          ...notacao,
          estatico,
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
