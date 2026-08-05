import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: env.NODE_ENV !== "production",
});

pool.on("error", (error) => {
  console.error("Erro inesperado no pool PostgreSQL:", {
    name: error.name,
    message: error.message,
  });
});

export async function testarConexao(): Promise<void> {
  const resultado = await pool.query<{
    banco: string;
    horario: Date;
  }>(`
    SELECT
      current_database() AS banco,
      NOW() AS horario
  `);

  const conexao = resultado.rows[0];

  if (!conexao) {
    throw new Error("O Neon não retornou dados no teste de conexão");
  }

  console.log("Conexão com o Neon realizada:", {
    banco: conexao.banco,
    horario: conexao.horario,
  });
}
