import { Router } from "express";
import { pool } from "../database/neon.js";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response) => {
  const inicio = Date.now();

  await pool.query("SELECT 1");

  response.status(200).json({
    status: "ok",
    servico: "genesys-neon-lab",
    banco: "conectado",
    tempoRespostaMs: Date.now() - inicio,
    horario: new Date().toISOString(),
  });
});
