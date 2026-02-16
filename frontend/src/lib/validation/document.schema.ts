import { z } from "zod"

export const documentCreateSchema = z.object({
  path: z.any().refine((file) => !!file, {
    message: "Vous n'avez pas déposé de fichier"
  }),

  nom: z.string().min(1, { message: "Le nom est obligatoire" }),

  type: z.number().nullable().refine((val) => val !== null, {
    message: "Vous n'avez pas sélectionné de type"
  }),

  date_publication: z
    .string()
    .min(1, { message: "La date de publication est obligatoire" })
})
