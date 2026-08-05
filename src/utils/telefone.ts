export type ResultadoNormalizacaoTelefone =
  | {
      valido: true;
      original: string;
      normalizado: string;
    }
  | {
      valido: false;
      original: string;
      motivo: string;
    };

export function normalizarTelefone(
  valor: string
): ResultadoNormalizacaoTelefone {
  const original = valor.trim();

  if (!original) {
    return {
      valido: false,
      original,
      motivo: "Telefone não informado",
    };
  }

  let digitos = original.replace(/\D/g, "");

  if (digitos.startsWith("00")) {
    digitos = digitos.slice(2);
  }

  if (
    !digitos.startsWith("55") &&
    (digitos.length === 10 || digitos.length === 11)
  ) {
    digitos = `55${digitos}`;
  }

  if (digitos.length < 8 || digitos.length > 15) {
    return {
      valido: false,
      original,
      motivo: "Telefone possui quantidade inválida de dígitos",
    };
  }

  if (digitos.startsWith("0")) {
    return {
      valido: false,
      original,
      motivo: "Código de país inválido",
    };
  }

  return {
    valido: true,
    original,
    normalizado: `+${digitos}`,
  };
}
