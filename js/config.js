let bancoDeCifras = [
  {
    tom: "A",
    nome: "panela_velha",
    afinacao: "D",
  },
  {
    tom: "D",
    nome: "cubanita",
    afinacao: "D",
  },
  {
    tom: "Am",
    nome: "boate_azul",
    afinacao: "D",
  },
  {
    tom: "E",
    nome: "a_sereia_e_o_nego_dagua",
    afinacao: "E",
  },
  {
    tom: "E",
    nome: "a_volta_que_o_mundo_da",
    afinacao: "E",
  },
  {
    tom: "E",
    nome: "empreitada_perigosa",
    afinacao: "E",
  },
  {
    tom: "E",
    nome: "pagode_em_brasilia",
    afinacao: "E",
  },
  {
    tom: "E",
    nome: "quando_a_lua_vem_surgindo",
    afinacao: "E",
  },
];

let appState = {
  tom: "E",
  tomOriginal: "E",
  afinacao: "E",
  afinacaoOriginal: "E",
  tablaturas: [],
  cifras: [],
  cifraOriginal: "", // Útil para reconhecimento de padrões na hora de fazer a substituição
  linhas: [],
};

const checkCifraLines = (cifra) => {
  const cifrasByLine = cifra.split("\n"),
    linesDescription = [];
  cifrasByLine.forEach((line, index) => {
    linesDescription.push({
      length: line.length,
      order: index,
      start: index - 1 >= 0 ? linesDescription[index - 1].end + 1 : 0,
      end:
        index - 1 >= 0
          ? linesDescription[index - 1].end + 1 + line.length
          : line.length,
    });
  });
  return linesDescription;
};

const renderDependingOnWindowSize = () => {
  // Get width and height of the window excluding scrollbars

  /**
   *
   * @param {string} mode "mobile" or "" Modo de exibição com ou sem quebra de linhas
   * @param {int} tablaturaNum Número de notações por linha
   * @param {int} cifraChar Número de caracteres por linha na cifra
   */
  const render = (mode, tablaturaNum, cifraChar) => {
    // Verifica quem vem primeiro ordenando instancias de Cifra e Tablatura pela linha
    const instanciasTablaturaCifra = [
      ...appState.tablaturas,
      ...appState.cifras,
    ].sort((a, b) => (a.linha > b.linha ? 1 : b.linha > a.linha ? -1 : 0));
    let cifraRenderizada = "";

    instanciasTablaturaCifra.forEach((instancia) => {
      if (instancia instanceof Tablatura) {
        tablatura.render(mode, tablaturaNum, cifraRenderizada);
      } else if (instancia instanceof Cifra) {
        cifra.render(mode, cifraChar, cifraRenderizada);
      }
    });

    console.log(cifraRenderizada);
    return cifraRenderizada;
  };

  const w = document.documentElement.clientWidth;
  if (w < 340) {
    Tablatura.render("mobile");
  } else if (w < 680) {
    Tablatura.render("mobile", 16);
  } else {
    Tablatura.render();
  }
};

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

let dicionarioTons = {
  C: 1,
  "C#": 2,
  D: 3,
  "D#": 4,
  E: 5,
  F: 6,
  "F#": 7,
  G: 8,
  "G#": 9,
  A: 10,
  "A#": 11,
  B: 12,
};

// Adicionando tons menores
Object.entries(dicionarioTons).forEach((tom) => {
  dicionarioTons[`${tom[0]}m`] = tom[1];
});

let acordes = [...Object.keys(dicionarioNotas)];
// Adicionando variantes de notas
const variantes = ["7", "m", "m7", "m7(b5)", "M", "maj7", "M7"];
acordes.forEach((acorde) => {
  variantes.forEach((variante) => {
    acordes.push(`${acorde}${variante}`);
  });
});
// Adicionando baixos
acordes.forEach((acorde) => {
  Object.keys(dicionarioNotas).forEach((baixo) => {
    acordes.push(`${acorde}/${baixo}`);
  });
});

const tons = {
  C: 1,
  "C#": 2,
  D: 3,
  "D#": 4,
  E: 5,
  F: 6,
  "F#": 7,
  G: 8,
  "G#": 9,
  A: 10,
  "A#": 11,
  B: 12,
};

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
