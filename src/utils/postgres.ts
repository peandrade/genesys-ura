export interface ErroPostgres {
  code?: string;
  constraint?: string;
  detail?: string;
  message?: string;
}

export function obterErroPostgres(error: unknown): ErroPostgres | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const possivelErro = error as Record<string, unknown>;

  return {
    code: typeof possivelErro.code === "string" ? possivelErro.code : undefined,

    constraint:
      typeof possivelErro.constraint === "string"
        ? possivelErro.constraint
        : undefined,

    detail:
      typeof possivelErro.detail === "string" ? possivelErro.detail : undefined,

    message:
      typeof possivelErro.message === "string"
        ? possivelErro.message
        : undefined,
  };
}
