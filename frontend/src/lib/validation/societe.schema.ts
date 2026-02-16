import { z } from "zod"

export const societeCreateSchema = z.object({
  user_id: z.number({
    message: "Le propriétaire est obligatoire"
  }),

  nom: z.string().min(1, {
    message: "Le nom de la société est obligatoire"
  }),

  scte: z
    .string()
    .min(1, { message: "Le matricule ou SIRET est obligatoire" })
    .min(10, { message: "Le matricule semble invalide" })
})
