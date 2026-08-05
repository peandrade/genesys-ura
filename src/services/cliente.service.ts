import {
  associarTelefoneAoCliente,
  buscarClientePorCpf,
  buscarClientesPorTelefone,
  cadastrarClienteComTelefone,
  clienteExistePorId,
  verificarTelefoneDoCliente,
} from "../repositores/cliente.repository.js";

import { normalizarTelefone } from "../utils/telefone.js";

import { mascararCpf, validarCpf } from "../utils/cpf.js";

import type {
  AssociarTelefoneInput,
  CadastrarClienteInput,
} from "../schemas/cliente.schema.js";

import { obterErroPostgres } from "../utils/postgres.js";

function obterPrimeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "Cliente";
}

function obterCodigoFinal(clienteId: string): string {
  return clienteId.padStart(4, "0").slice(-4);
}

export async function consultarPorTelefone(telefoneInformado: string) {
  const telefone = normalizarTelefone(telefoneInformado);

  if (!telefone.valido) {
    return {
      httpStatus: 400,
      body: {
        sucesso: false,
        status: "TELEFONE_INVALIDO",
        quantidade: 0,
        cliente: null,
        mensagem: telefone.motivo,
      },
    };
  }

  const clientes = await buscarClientesPorTelefone(telefone.normalizado);

  if (clientes.length === 0) {
    return {
      httpStatus: 200,
      body: {
        sucesso: true,
        status: "NAO_ENCONTRADO",
        quantidade: 0,
        telefoneNormalizado: telefone.normalizado,
        cliente: null,
      },
    };
  }

  if (clientes.length > 1) {
    return {
      httpStatus: 200,
      body: {
        sucesso: true,
        status: "MULTIPLOS_CLIENTES",
        quantidade: clientes.length,
        telefoneNormalizado: telefone.normalizado,
        cliente: null,
      },
    };
  }

  const cliente = clientes[0];

  if (!cliente) {
    throw new Error("Estado inconsistente na consulta por telefone");
  }

  return {
    httpStatus: 200,
    body: {
      sucesso: true,
      status: "ENCONTRADO",
      quantidade: 1,
      telefoneNormalizado: telefone.normalizado,
      cliente: {
        id: cliente.id,
        nomeConfirmacao: obterPrimeiroNome(cliente.nome),
        codigoFinal: obterCodigoFinal(cliente.id),
        telefoneConfirmado: cliente.telefoneConfirmado,
      },
    },
  };
}

export async function consultarPorCpf(
  cpfInformado: string,
  telefoneOrigem?: string
) {
  const cpf = validarCpf(cpfInformado);

  if (!cpf.valido) {
    return {
      httpStatus: 400,
      body: {
        sucesso: false,
        status: "CPF_INVALIDO",
        cliente: null,
        telefoneAssociado: false,
        mensagem: cpf.motivo,
      },
    };
  }

  const cliente = await buscarClientePorCpf(cpf.normalizado);

  if (!cliente) {
    return {
      httpStatus: 200,
      body: {
        sucesso: true,
        status: "NAO_ENCONTRADO",
        cpfMascarado: mascararCpf(cpf.normalizado),
        cliente: null,
        telefoneAssociado: false,
      },
    };
  }

  let telefoneAssociado = false;
  let telefoneNormalizado: string | null = null;

  if (telefoneOrigem) {
    const telefone = normalizarTelefone(telefoneOrigem);

    if (telefone.valido) {
      telefoneNormalizado = telefone.normalizado;

      telefoneAssociado = await verificarTelefoneDoCliente(
        cliente.id,
        telefone.normalizado
      );
    }
  }

  return {
    httpStatus: 200,
    body: {
      sucesso: true,
      status: "ENCONTRADO",
      cpfMascarado: mascararCpf(cliente.cpf),
      telefoneNormalizado,
      telefoneAssociado,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
      },
    },
  };
}

export async function cadastrarNovoCliente(dados: CadastrarClienteInput) {
  const cpf = validarCpf(dados.cpf);

  if (!cpf.valido) {
    return {
      httpStatus: 400,
      body: {
        sucesso: false,
        status: "CPF_INVALIDO",
        criado: false,
        cliente: null,
        mensagem: cpf.motivo,
      },
    };
  }

  const telefone = normalizarTelefone(dados.telefone);

  if (!telefone.valido) {
    return {
      httpStatus: 400,
      body: {
        sucesso: false,
        status: "TELEFONE_INVALIDO",
        criado: false,
        cliente: null,
        mensagem: telefone.motivo,
      },
    };
  }

  const emailNormalizado =
    dados.email && dados.email.trim() ? dados.email.trim().toLowerCase() : null;

  try {
    const cliente = await cadastrarClienteComTelefone({
      cpf: cpf.normalizado,
      nome: dados.nome.trim(),
      email: emailNormalizado,
      telefone: telefone.normalizado,
      conversationId: dados.conversationId?.trim() || null,
      criadoPor: dados.criadoPor?.trim() || null,
    });

    return {
      httpStatus: 201,
      body: {
        sucesso: true,
        status: "CADASTRO_REALIZADO",
        criado: true,
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          cpfMascarado: mascararCpf(cliente.cpf),
          email: cliente.email,
          telefone: cliente.telefone,
        },
        mensagem: "Cliente cadastrado com sucesso",
      },
    };
  } catch (error) {
    const erroPostgres = obterErroPostgres(error);

    if (
      erroPostgres?.code === "23505" &&
      erroPostgres.constraint === "uq_clientes_cpf"
    ) {
      const clienteExistente = await buscarClientePorCpf(cpf.normalizado);

      return {
        httpStatus: 409,
        body: {
          sucesso: false,
          status: "CLIENTE_JA_EXISTE",
          criado: false,
          cliente: clienteExistente
            ? {
                id: clienteExistente.id,
                nome: clienteExistente.nome,
                cpfMascarado: mascararCpf(clienteExistente.cpf),
              }
            : null,
          mensagem: "Já existe um cliente cadastrado com esse CPF",
        },
      };
    }

    throw error;
  }
}

export async function associarNovoTelefone(dados: AssociarTelefoneInput) {
  const telefone = normalizarTelefone(dados.telefone);

  if (!telefone.valido) {
    return {
      httpStatus: 400,
      body: {
        sucesso: false,
        status: "TELEFONE_INVALIDO",
        associado: false,
        telefone: null,
        mensagem: telefone.motivo,
      },
    };
  }

  const clienteExiste = await clienteExistePorId(dados.clienteId);

  if (!clienteExiste) {
    return {
      httpStatus: 404,
      body: {
        sucesso: false,
        status: "CLIENTE_NAO_ENCONTRADO",
        associado: false,
        telefone: null,
        mensagem: "O cliente informado não existe ou está inativo",
      },
    };
  }

  const telefoneJaAssociado = await verificarTelefoneDoCliente(
    dados.clienteId,
    telefone.normalizado
  );

  if (telefoneJaAssociado) {
    return {
      httpStatus: 409,
      body: {
        sucesso: false,
        status: "TELEFONE_JA_ASSOCIADO",
        associado: false,
        telefone: {
          numero: telefone.normalizado,
        },
        mensagem: "Este telefone já está associado ao cliente",
      },
    };
  }

  try {
    const telefoneCriado = await associarTelefoneAoCliente({
      clienteId: dados.clienteId,
      telefone: telefone.normalizado,
      principal: dados.principal,
      confirmado: dados.confirmado,
      conversationId: dados.conversationId?.trim() || null,
      criadoPor: dados.criadoPor?.trim() || null,
    });

    return {
      httpStatus: 201,
      body: {
        sucesso: true,
        status: "TELEFONE_ASSOCIADO",
        associado: true,
        telefone: telefoneCriado,
        mensagem: "Telefone associado ao cliente com sucesso",
      },
    };
  } catch (error) {
    const erroPostgres = obterErroPostgres(error);

    if (
      erroPostgres?.code === "23505" &&
      erroPostgres.constraint === "uq_telefones_cliente_numero"
    ) {
      return {
        httpStatus: 409,
        body: {
          sucesso: false,
          status: "TELEFONE_JA_ASSOCIADO",
          associado: false,
          telefone: {
            numero: telefone.normalizado,
          },
          mensagem: "Este telefone já está associado ao cliente",
        },
      };
    }

    throw error;
  }
}
