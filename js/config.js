let bancoDeCifras = [
  {
    tom: "Am",
    nome: "boate_azul",
    afinacao: "D"
  },
  {
    tom: "E",
    nome: "a_sereia_e_o_nego_dagua",
    afinacao: "E"
  },
  {
    tom: "E",
    nome: "a_volta_que_o_mundo_da",
    afinacao: "E"
  },
  {
    tom: "E",
    nome: "empreitada_perigosa",
    afinacao: "E"
  },
  {
    tom: "E",
    nome: "pagode_em_brasilia",
    afinacao: "E"
  },
  {
    tom: "E",
    nome: "quando_a_lua_vem_surgindo",
    afinacao: "E"
  }
]

let appState = {
  tom: "E",
  tomOriginal: "E",
  afinacao: "E",
  afinacaoOriginal: "E",
  tablaturas: [],
  cifraOriginal: "", // Útil para reconhecimento de padrões na hora de fazer a substituição
};

const renderDependingOnWindowSize = () => {
  // Get width and height of the window excluding scrollbars
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
const variantes = ["m", "m7", "M", "7M"];
acordes.forEach((acorde) => {
  variantes.forEach((variante) => {
    acordes.push(`${acorde}${variante}`);
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
