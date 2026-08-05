export interface ResultadoValidacaoCpf {
  valido: boolean;
  normalizado: string;
  motivo?: string;
}

function calcularDigito(cpfParcial: string, pesoInicial: number): number {
  const soma = cpfParcial.split("").reduce((total, digito, indice) => {
    return total + Number(digito) * (pesoInicial - indice);
  }, 0);

  const resto = soma % 11;

  return resto < 2 ? 0 : 11 - resto;
}

export function validarCpf(valor: string): ResultadoValidacaoCpf {
  const normalizado = valor.replace(/\D/g, "");

  if (normalizado.length !== 11) {
    return {
      valido: false,
      normalizado,
      motivo: "CPF deve possuir 11 dígitos",
    };
  }

  if (/^(\d)\1{10}$/.test(normalizado)) {
    return {
      valido: false,
      normalizado,
      motivo: "CPF não pode possuir todos os dígitos iguais",
    };
  }

  const base = normalizado.slice(0, 9);

  const primeiroDigito = calcularDigito(base, 10);
  const segundoDigito = calcularDigito(`${base}${primeiroDigito}`, 11);

  const digitosCalculados = `${primeiroDigito}${segundoDigito}`;

  const digitosInformados = normalizado.slice(9);

  if (digitosCalculados !== digitosInformados) {
    return {
      valido: false,
      normalizado,
      motivo: "Dígitos verificadores do CPF são inválidos",
    };
  }

  return {
    valido: true,
    normalizado,
  };
}

export function mascararCpf(cpf: string): string {
  const normalizado = cpf.replace(/\D/g, "");

  if (normalizado.length !== 11) {
    return "***.***.***-**";
  }

  return `***.***.${normalizado.slice(6, 9)}-**`;
}
