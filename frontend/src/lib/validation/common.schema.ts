import { z } from "zod"

export const requiredString = (message: string) =>
  z.string().min(1, { message })

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "L'email est obligatoire." })
  .pipe(z.email({ message: "Format d'email invalide." }));

export const phoneSchema = z
  .string()
  .min(1, { message: "Le numéro de téléphone est obligatoire." })
  .refine((value) => {
    const cleaned = value.replace(/[^\d+]/g, "")
    const french = /^(?:\+33|0033|0)[1-9]\d{8}$/
    const lux = /^(?:\+352|00352)?[2-9]\d{7,8}$/
    return french.test(cleaned) || lux.test(cleaned)
  }, {
    message: "Numéro français ou luxembourgeois invalide."
  })
