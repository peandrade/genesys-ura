# Genesys Neon Lab

API REST de laboratório para integração entre Genesys Cloud, Scripts, Architect, Data Actions e Neon PostgreSQL.

## Objetivo

O projeto simula um processo de identificação de clientes durante uma URA:

1. Consultar cliente pelo telefone de origem.
2. Solicitar CPF quando o telefone não for localizado.
3. Consultar cliente pelo CPF.
4. Permitir atendimento sem cadastro.
5. Permitir cadastro pelo Script do operador.
6. Permitir associação de novo telefone a cliente existente.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Neon
- Zod
- Vercel

## Endpoints

### Verificação de saúde

```http
GET /api/health