import type { NextFunction, Request, Response } from "express";

export function tratarErros(
  error: unknown,
  request: Request,
  response: Response,
  next: NextFunction
): void {
  void request;
  void next;

  const mensagem = error instanceof Error ? error.message : "Erro desconhecido";

  console.error("Erro não tratado na API:", {
    mensagem,
  });

  response.status(500).json({
    sucesso: false,
    status: "ERRO_INTERNO",
    mensagem: "Não foi possível processar a solicitação",
  });
}
