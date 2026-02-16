import {z} from "zod"
import {emailSchema, phoneSchema, requiredString} from "./common.schema"

export const userCreateSchema = z.object({
    first_name: requiredString("Le prénom est obligatoire."),
    last_name: requiredString("Le nom est obligatoire."),
    email: emailSchema,
    phone: phoneSchema,
    password: z.string().min(1, {message: "Le mot de passe est obligatoire."}),
    password2: z.string().min(1, {message: "La confirmation est obligatoire."})
}).refine((data) => data.password === data.password2, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["password2"]
})

export const userEditSchema = z.object({
    first_name: requiredString("Le prénom est obligatoire."),
    last_name: requiredString("Le nom est obligatoire."),
    email: emailSchema,
    phone: phoneSchema,
})

export const resetPasswordSchema = z.object({
    password1: z.string().min(1, {message: "Le mot de passe est obligatoire."}),
    password2: z.string().min(1, {message: "La confirmation est obligatoire."}),
}).refine((data) => data.password1 === data.password2, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["password2"],
});

export const emailUserSchema= z.object({
    email: emailSchema
})