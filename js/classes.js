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

class Nota {
  constructor(notacao, notaNumero) {
    this.notacao = notacao;
    this.notaNumero = notaNumero || dicionarioNotas[notacao];
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

const afinacoes = [
  {
    nome: "Cebolão de D",
    apelido: "D",
    cordas: [
      new Corda("D"),
      new Corda("A"),
      new Corda("F#"),
      new Corda("D"),
      new Corda("A"),
    ],
  },
  {
    nome: "Cebolão de E",
    apelido: "E",
    cordas: [
      new Corda("E"),
      new Corda("B"),
      new Corda("G#"),
      new Corda("E"),
      new Corda("B"),
    ],
  },
];

// Encontrando notas numa tablatura
new RegExp(
  "((d+)?h(d+)?)|((d+)?p(d+)?)|(d+(~|v))|((d+)?(/|s)(d+)?)|(d+)",
  "gi"
);
// Frases para excluir, pois não fazem parte da tablatura
new RegExp("riff(.+)", "gi");

class Tablatura {
  constructor(cordas, notacoes) {
    (this.cordas = cordas), [];
    this.notacoes = notacoes || null;
  }

  /** Extrair linhas de tablatura da cifra */
  static extrairDaCifra(cifra) {
    let tablatura, linhasTablatura;
    const tablaturas = [];

    // Econtrando tablaturas
    const regexLinhaTablatura = new RegExp(/(.+)\|-(.+)/, "gi");
    linhasTablatura = cifra.match(regexLinhaTablatura);
    console.log(linhasTablatura);

    new Tablatura(
      [
        new Corda("E"),
        new Corda("M"),
        new Corda("G#"),
        new Corda("E"),
        new Corda("B"),
      ],
      tablatura
    );

    $("#tablaturas").text("");
    linhasTablatura.forEach((tablatura) =>
      $("#tablaturas").append(`${tablatura}\n`)
    );

    return tablaturas;
  }
}
