import type { NextFunction, Request, Response } from "express";

import { timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

function compararChaves(chaveRecebida: string, chaveEsperada: string): boolean {
  const recebida = Buffer.from(chaveRecebida);
  const esperada = Buffer.from(chaveEsperada);

  if (recebida.length !== esperada.length) {
    return false;
  }

  return timingSafeEqual(recebida, esperada);
}

export function validarApiKey(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const apiKey = request.header("x-api-key");

  if (!apiKey || !compararChaves(apiKey, env.API_KEY)) {
    response.status(401).json({
      sucesso: false,
      status: "NAO_AUTORIZADO",
      mensagem: "Chave de API inválida ou não informada",
    });

    return;
  }

  next();
}
