import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool, testarConexao } from "./database/neon.js";

async function iniciarServidor(): Promise<void> {
  await testarConexao();

  const servidor = app.listen(env.PORT, () => {
    console.log(`API disponível em http://localhost:${env.PORT}`);
  });

  async function encerrar(sinal: NodeJS.Signals): Promise<void> {
    console.log(`Sinal ${sinal} recebido. Encerrando...`);

    servidor.close(async () => {
      await pool.end();
      console.log("Servidor e pool encerrados");
      process.exit(0);
    });
  }

  process.on("SIGINT", encerrar);
  process.on("SIGTERM", encerrar);
}

iniciarServidor().catch(async (error: unknown) => {
  console.error("Falha ao iniciar a aplicação:", error);
  await pool.end();
  process.exit(1);
});
