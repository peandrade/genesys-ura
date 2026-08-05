BEGIN;

CREATE TABLE IF NOT EXISTS clientes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    cpf VARCHAR(11) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(254),

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    origem_cadastro VARCHAR(50) NOT NULL DEFAULT 'IMPORTACAO_TESTE',
    conversation_id VARCHAR(100),
    criado_por VARCHAR(100),

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_clientes_cpf UNIQUE (cpf),

    CONSTRAINT ck_clientes_cpf_formato
        CHECK (cpf ~ '^[0-9]{11}$'),

    CONSTRAINT ck_clientes_nome
        CHECK (char_length(trim(nome)) >= 3),

    CONSTRAINT ck_clientes_email
        CHECK (
            email IS NULL
            OR char_length(trim(email)) >= 5
        )
);

CREATE TABLE IF NOT EXISTS telefones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    cliente_id BIGINT NOT NULL,

    numero_normalizado VARCHAR(16) NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    confirmado BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    origem_cadastro VARCHAR(50) NOT NULL DEFAULT 'IMPORTACAO_TESTE',
    conversation_id VARCHAR(100),
    criado_por VARCHAR(100),

    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_telefones_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_telefones_numero_formato
        CHECK (
            numero_normalizado ~ '^\+[1-9][0-9]{7,14}$'
        )
);

CREATE INDEX IF NOT EXISTS idx_telefones_numero_normalizado
    ON telefones (numero_normalizado);

CREATE INDEX IF NOT EXISTS idx_telefones_cliente_id
    ON telefones (cliente_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_telefones_cliente_numero
    ON telefones (
        cliente_id,
        numero_normalizado
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_telefones_principal_ativo
    ON telefones (cliente_id)
    WHERE principal = TRUE
      AND ativo = TRUE;

COMMIT;