BEGIN;

INSERT INTO clientes (
    cpf,
    nome,
    email,
    ativo,
    origem_cadastro
)
VALUES
    (
        '52998224725',
        'Cliente Teste Alpha',
        'alpha@example.com',
        TRUE,
        'IMPORTACAO_TESTE'
    ),
    (
        '11144477735',
        'Cliente Teste Beta',
        'beta@example.com',
        TRUE,
        'IMPORTACAO_TESTE'
    ),
    (
        '12345678909',
        'Cliente Teste Gamma',
        NULL,
        TRUE,
        'IMPORTACAO_TESTE'
    ),
    (
        '98765432100',
        'Cliente Teste Inativo',
        'inativo@example.com',
        FALSE,
        'IMPORTACAO_TESTE'
    )
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO telefones (
    cliente_id,
    numero_normalizado,
    principal,
    confirmado,
    ativo,
    origem_cadastro
)
SELECT
    id,
    '+5521900000001',
    TRUE,
    TRUE,
    TRUE,
    'IMPORTACAO_TESTE'
FROM clientes
WHERE cpf = '52998224725'
ON CONFLICT (cliente_id, numero_normalizado)
DO NOTHING;

INSERT INTO telefones (
    cliente_id,
    numero_normalizado,
    principal,
    confirmado,
    ativo,
    origem_cadastro
)
SELECT
    id,
    '+5521900000002',
    TRUE,
    TRUE,
    TRUE,
    'IMPORTACAO_TESTE'
FROM clientes
WHERE cpf = '11144477735'
ON CONFLICT (cliente_id, numero_normalizado)
DO NOTHING;

INSERT INTO telefones (
    cliente_id,
    numero_normalizado,
    principal,
    confirmado,
    ativo,
    origem_cadastro
)
SELECT
    id,
    '+5521900000003',
    TRUE,
    FALSE,
    TRUE,
    'IMPORTACAO_TESTE'
FROM clientes
WHERE cpf = '12345678909'
ON CONFLICT (cliente_id, numero_normalizado)
DO NOTHING;

COMMIT;