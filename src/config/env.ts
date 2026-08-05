import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL não foi configurada")
    .startsWith("postgres", "DATABASE_URL deve ser uma conexão PostgreSQL"),

  API_KEY: z.string().min(16, "API_KEY deve possuir no mínimo 16 caracteres"),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  console.error(
    "Variáveis de ambiente inválidas:",
    resultado.error.flatten().fieldErrors
  );

  throw new Error(
    "Não foi possível iniciar a aplicação por erro de configuração"
  );
}

export const env = resultado.data;
