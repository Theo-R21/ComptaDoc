import {z} from "zod"

export const documentCreateSchema = z.object({
    path: z.any().refine((file) => !!file, {
        message: "Vous n'avez pas déposé de fichier"
    }),

    nom: z.string().min(1, {message: "Le nom est obligatoire"}),

    type: z
        .string()
        .min(1, {message: "Le type est obligatoire"})
        .check(z.uuid({error: "UUID invalide"})),

    date_publication: z
        .string()
        .min(1, {message: "La date de publication est obligatoire"})
})
