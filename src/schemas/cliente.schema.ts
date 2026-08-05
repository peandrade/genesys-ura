import { z } from "zod";

export const consultaTelefoneSchema = z.object({
  telefone: z
    .string()
    .trim()
    .min(8, "Telefone não informado")
    .max(40, "Telefone excedeu o tamanho permitido"),
});

export const consultaCpfSchema = z.object({
  cpf: z
    .string()
    .trim()
    .min(11, "CPF não informado")
    .max(20, "CPF excedeu o tamanho permitido"),

  telefoneOrigem: z
    .string()
    .trim()
    .max(40, "Telefone excedeu o tamanho permitido")
    .optional(),
});

export const cadastrarClienteSchema = z.object({
  cpf: z
    .string()
    .trim()
    .min(11, "CPF não informado")
    .max(20, "CPF excedeu o tamanho permitido"),

  nome: z
    .string()
    .trim()
    .min(3, "Nome deve possuir pelo menos 3 caracteres")
    .max(150, "Nome excedeu o tamanho permitido"),

  telefone: z
    .string()
    .trim()
    .min(8, "Telefone não informado")
    .max(40, "Telefone excedeu o tamanho permitido"),

  email: z
    .string()
    .trim()
    .email("E-mail possui formato inválido")
    .max(254, "E-mail excedeu o tamanho permitido")
    .optional()
    .or(z.literal("")),

  conversationId: z
    .string()
    .trim()
    .max(100, "Conversation ID excedeu o tamanho permitido")
    .optional(),

  criadoPor: z
    .string()
    .trim()
    .max(100, "Identificação do operador excedeu o limite")
    .optional(),
});

export const associarTelefoneSchema = z.object({
  clienteId: z.string().trim().regex(/^\d+$/, "Cliente ID deve ser numérico"),

  telefone: z
    .string()
    .trim()
    .min(8, "Telefone não informado")
    .max(40, "Telefone excedeu o tamanho permitido"),

  principal: z.boolean().optional().default(false),

  confirmado: z.boolean().optional().default(false),

  conversationId: z
    .string()
    .trim()
    .max(100, "Conversation ID excedeu o tamanho permitido")
    .optional(),

  criadoPor: z
    .string()
    .trim()
    .max(100, "Identificação do operador excedeu o limite")
    .optional(),
});

export type ConsultaTelefoneInput = z.infer<typeof consultaTelefoneSchema>;

export type ConsultaCpfInput = z.infer<typeof consultaCpfSchema>;

export type CadastrarClienteInput = z.infer<typeof cadastrarClienteSchema>;

export type AssociarTelefoneInput = z.infer<typeof associarTelefoneSchema>;
