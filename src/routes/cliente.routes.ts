import { Router } from "express";

import {
  associarTelefoneSchema,
  cadastrarClienteSchema,
  consultaCpfSchema,
  consultaTelefoneSchema,
} from "../schemas/cliente.schema.js";

import {
  associarNovoTelefone,
  cadastrarNovoCliente,
  consultarPorCpf,
  consultarPorTelefone,
} from "../services/cliente.service.js";

export const clienteRouter = Router();

clienteRouter.post("/consultar-telefone", async (request, response) => {
  const validacao = consultaTelefoneSchema.safeParse(request.body);

  if (!validacao.success) {
    response.status(400).json({
      sucesso: false,
      status: "ENTRADA_INVALIDA",
      quantidade: 0,
      cliente: null,
      erros: validacao.error.flatten().fieldErrors,
    });

    return;
  }

  const resultado = await consultarPorTelefone(validacao.data.telefone);

  response.status(resultado.httpStatus).json(resultado.body);
});

clienteRouter.post("/consultar-cpf", async (request, response) => {
  const validacao = consultaCpfSchema.safeParse(request.body);

  if (!validacao.success) {
    response.status(400).json({
      sucesso: false,
      status: "ENTRADA_INVALIDA",
      cliente: null,
      telefoneAssociado: false,
      erros: validacao.error.flatten().fieldErrors,
    });

    return;
  }

  const resultado = await consultarPorCpf(
    validacao.data.cpf,
    validacao.data.telefoneOrigem
  );

  response.status(resultado.httpStatus).json(resultado.body);
});

clienteRouter.post("/", async (request, response) => {
  const validacao = cadastrarClienteSchema.safeParse(request.body);

  if (!validacao.success) {
    response.status(400).json({
      sucesso: false,
      status: "ENTRADA_INVALIDA",
      criado: false,
      cliente: null,
      erros: validacao.error.flatten().fieldErrors,
    });

    return;
  }

  const resultado = await cadastrarNovoCliente(validacao.data);

  response.status(resultado.httpStatus).json(resultado.body);
});

clienteRouter.post("/associar-telefone", async (request, response) => {
  const validacao = associarTelefoneSchema.safeParse(request.body);

  if (!validacao.success) {
    response.status(400).json({
      sucesso: false,
      status: "ENTRADA_INVALIDA",
      associado: false,
      telefone: null,
      erros: validacao.error.flatten().fieldErrors,
    });

    return;
  }

  const resultado = await associarNovoTelefone(validacao.data);

  response.status(resultado.httpStatus).json(resultado.body);
});
