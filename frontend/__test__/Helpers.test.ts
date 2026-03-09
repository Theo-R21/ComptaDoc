import { describe, test, expect } from "vitest"
import { ZodError, z } from "zod"
import {formatZodErrors} from "@/lib/validation/helpers";

const getZodError = (schema: z.ZodTypeAny, data: unknown): ZodError => {
    const result = schema.safeParse(data)
    if (result.success) throw new Error("Expected error")
    return result.error
}

describe("formatZodErrors", () => {
    test("retourne le premier message par champ", () => {
        const schema = z.object({
            email: z.email("Email invalide"),
            name: z.string().min(1, "Nom obligatoire"),
        })
        const error = getZodError(schema, { email: "pas-un-email", name: "" })
        const formatted = formatZodErrors(error)

        expect(formatted.email).toBe("Email invalide")
        expect(formatted.name).toBe("Nom obligatoire")
    })

    test("ne garde que le premier message si plusieurs erreurs sur un champ", () => {
        const schema = z.object({
            password: z.string()
                .min(1, "Obligatoire")
                .min(8, "Trop court"),
        })
        const error = getZodError(schema, { password: "" })
        const formatted = formatZodErrors(error)

        expect(formatted.password).toBe("Obligatoire")
    })

    test("ne plante pas sur une erreur globale sans path", () => {
        const schema = z.object({ a: z.string(), b: z.string() })
            .refine(() => false, { message: "Erreur globale" })

        const error = getZodError(schema, { a: "x", b: "y" })
        const formatted = formatZodErrors(error)

        expect(typeof formatted).toBe("object")
    })
})