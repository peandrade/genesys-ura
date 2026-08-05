import express from "express";

import { validarApiKey } from "./middlewares/api-key.middleware.js";

import { tratarErros } from "./middlewares/error.middleware.js";

import { clienteRouter } from "./routes/cliente.routes.js";

import { healthRouter } from "./routes/health.routes.js";

export const app = express();

app.disable("x-powered-by");

app.use(
  express.json({
    limit: "20kb",
  })
);

app.get("/", (_request, response) => {
  response.status(200).json({
    servico: "genesys-neon-lab",
    versao: "1.0.0",
    status: "online",
  });
});

app.use("/api/health", healthRouter);

app.use("/api/clientes", validarApiKey, clienteRouter);

app.use((_request, response) => {
  response.status(404).json({
    sucesso: false,
    status: "ROTA_NAO_ENCONTRADA",
    mensagem: "O endpoint solicitado não existe",
  });
});

app.use(tratarErros);

export default app;
