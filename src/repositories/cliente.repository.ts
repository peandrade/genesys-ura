import type { PoolClient } from "pg";
import { pool } from "../database/neon.js";

export interface ClientePorTelefone {
  id: string;
  nome: string;
  numeroNormalizado: string;
  telefoneConfirmado: boolean;
}

export interface ClientePorCpf {
  id: string;
  nome: string;
  cpf: string;
}

interface ClienteTelefoneRow {
  id: string;
  nome: string;
  numero_normalizado: string;
  telefone_confirmado: boolean;
}

interface ClienteCpfRow {
  id: string;
  nome: string;
  cpf: string;
}

export async function buscarClientesPorTelefone(
  telefone: string
): Promise<ClientePorTelefone[]> {
  const resultado = await pool.query<ClienteTelefoneRow>(
    `
      SELECT DISTINCT
        c.id::text AS id,
        c.nome,
        t.numero_normalizado,
        t.confirmado AS telefone_confirmado
      FROM clientes c
      INNER JOIN telefones t
        ON t.cliente_id = c.id
      WHERE t.numero_normalizado = $1
        AND t.ativo = TRUE
        AND c.ativo = TRUE
      ORDER BY id
    `,
    [telefone]
  );

  return resultado.rows.map((row) => ({
    id: row.id,
    nome: row.nome,
    numeroNormalizado: row.numero_normalizado,
    telefoneConfirmado: row.telefone_confirmado,
  }));
}

export async function buscarClientePorCpf(
  cpf: string
): Promise<ClientePorCpf | null> {
  const resultado = await pool.query<ClienteCpfRow>(
    `
      SELECT
        id::text AS id,
        nome,
        cpf
      FROM clientes
      WHERE cpf = $1
        AND ativo = TRUE
      LIMIT 1
    `,
    [cpf]
  );

  const cliente = resultado.rows[0];

  if (!cliente) {
    return null;
  }

  return {
    id: cliente.id,
    nome: cliente.nome,
    cpf: cliente.cpf,
  };
}

export async function verificarTelefoneDoCliente(
  clienteId: string,
  telefone: string
): Promise<boolean> {
  const resultado = await pool.query<{
    telefone_associado: boolean;
  }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM telefones
        WHERE cliente_id = $1
          AND numero_normalizado = $2
          AND ativo = TRUE
      ) AS telefone_associado
    `,
    [clienteId, telefone]
  );

  return resultado.rows[0]?.telefone_associado ?? false;
}

export interface NovoCliente {
  cpf: string;
  nome: string;
  email: string | null;
  telefone: string;
  conversationId: string | null;
  criadoPor: string | null;
}

export interface ClienteCriado {
  id: string;
  cpf: string;
  nome: string;
  email: string | null;
  telefone: string;
}

export interface NovoTelefoneCliente {
  clienteId: string;
  telefone: string;
  principal: boolean;
  confirmado: boolean;
  conversationId: string | null;
  criadoPor: string | null;
}

export interface TelefoneAssociado {
  id: string;
  clienteId: string;
  telefone: string;
  principal: boolean;
  confirmado: boolean;
}

interface ClienteCriadoRow {
  id: string;
  cpf: string;
  nome: string;
  email: string | null;
}

interface TelefoneCriadoRow {
  id: string;
  cliente_id: string;
  numero_normalizado: string;
  principal: boolean;
  confirmado: boolean;
}

export async function cadastrarClienteComTelefone(
  dados: NovoCliente
): Promise<ClienteCriado> {
  const conexao = await pool.connect();

  try {
    await conexao.query("BEGIN");

    const clienteResultado = await conexao.query<ClienteCriadoRow>(
      `
            INSERT INTO clientes (
              cpf,
              nome,
              email,
              ativo,
              origem_cadastro,
              conversation_id,
              criado_por
            )
            VALUES (
              $1,
              $2,
              $3,
              TRUE,
              'GENESYS_SCRIPT',
              $4,
              $5
            )
            RETURNING
              id::text AS id,
              cpf,
              nome,
              email
          `,
      [
        dados.cpf,
        dados.nome,
        dados.email,
        dados.conversationId,
        dados.criadoPor,
      ]
    );

    const cliente = clienteResultado.rows[0];

    if (!cliente) {
      throw new Error("O banco não retornou o cliente criado");
    }

    await conexao.query(
      `
          INSERT INTO telefones (
            cliente_id,
            numero_normalizado,
            principal,
            confirmado,
            ativo,
            origem_cadastro,
            conversation_id,
            criado_por
          )
          VALUES (
            $1,
            $2,
            TRUE,
            FALSE,
            TRUE,
            'GENESYS_SCRIPT',
            $3,
            $4
          )
        `,
      [cliente.id, dados.telefone, dados.conversationId, dados.criadoPor]
    );

    await conexao.query("COMMIT");

    return {
      id: cliente.id,
      cpf: cliente.cpf,
      nome: cliente.nome,
      email: cliente.email,
      telefone: dados.telefone,
    };
  } catch (error) {
    await desfazerTransacao(conexao);
    throw error;
  } finally {
    conexao.release();
  }
}

async function desfazerTransacao(conexao: PoolClient): Promise<void> {
  try {
    await conexao.query("ROLLBACK");
  } catch (rollbackError) {
    console.error("Falha ao desfazer transação:", {
      mensagem:
        rollbackError instanceof Error
          ? rollbackError.message
          : "Erro desconhecido",
    });
  }
}

export async function clienteExistePorId(clienteId: string): Promise<boolean> {
  const resultado = await pool.query<{
    existe: boolean;
  }>(
    `
        SELECT EXISTS (
          SELECT 1
          FROM clientes
          WHERE id = $1
            AND ativo = TRUE
        ) AS existe
      `,
    [clienteId]
  );

  return resultado.rows[0]?.existe ?? false;
}

export async function associarTelefoneAoCliente(
  dados: NovoTelefoneCliente
): Promise<TelefoneAssociado> {
  const conexao = await pool.connect();

  try {
    await conexao.query("BEGIN");

    /*
     * Se o novo telefone for marcado como principal,
     * removemos a marcação dos outros telefones ativos
     * antes de criar o novo vínculo.
     */
    if (dados.principal) {
      await conexao.query(
        `
            UPDATE telefones
            SET principal = FALSE
            WHERE cliente_id = $1
              AND principal = TRUE
              AND ativo = TRUE
          `,
        [dados.clienteId]
      );
    }

    const resultado = await conexao.query<TelefoneCriadoRow>(
      `
            INSERT INTO telefones (
              cliente_id,
              numero_normalizado,
              principal,
              confirmado,
              ativo,
              origem_cadastro,
              conversation_id,
              criado_por
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              TRUE,
              'GENESYS_SCRIPT',
              $5,
              $6
            )
            RETURNING
              id::text AS id,
              cliente_id::text AS cliente_id,
              numero_normalizado,
              principal,
              confirmado
          `,
      [
        dados.clienteId,
        dados.telefone,
        dados.principal,
        dados.confirmado,
        dados.conversationId,
        dados.criadoPor,
      ]
    );

    const telefone = resultado.rows[0];

    if (!telefone) {
      throw new Error("O banco não retornou o telefone associado");
    }

    await conexao.query("COMMIT");

    return {
      id: telefone.id,
      clienteId: telefone.cliente_id,
      telefone: telefone.numero_normalizado,
      principal: telefone.principal,
      confirmado: telefone.confirmado,
    };
  } catch (error) {
    await desfazerTransacao(conexao);
    throw error;
  } finally {
    conexao.release();
  }
}
