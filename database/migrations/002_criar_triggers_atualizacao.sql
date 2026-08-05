BEGIN;

CREATE OR REPLACE FUNCTION atualizar_data_modificacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clientes_atualizado_em
ON clientes;

CREATE TRIGGER trg_clientes_atualizado_em
BEFORE UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION atualizar_data_modificacao();

DROP TRIGGER IF EXISTS trg_telefones_atualizado_em
ON telefones;

CREATE TRIGGER trg_telefones_atualizado_em
BEFORE UPDATE ON telefones
FOR EACH ROW
EXECUTE FUNCTION atualizar_data_modificacao();

COMMIT;