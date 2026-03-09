import { describe, test, expect } from "vitest"
import { ZodError } from "zod"
import {societeCreateSchema, societeEditSchema} from "@/lib/validation/societe.schema";

const getFieldError = (error: ZodError, field: string): string | undefined =>
    error.issues.find(i => i.path[0] === field)?.message

const validCreate = {
    user_id: "550e8400-e29b-41d4-a716-446655440000",
    nom: "Ma Société SARL",
    scte: "12345678901234",
}

describe("societeCreateSchema", () => {
    test("valide une société complète", () => {
        expect(societeCreateSchema.safeParse(validCreate).success).toBe(true)
    })

    test("rejette si user_id vide", () => {
        const result = societeCreateSchema.safeParse({ ...validCreate, user_id: "" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "user_id")).toBe("Le propriétaire est obligatoire")
    })

    test("rejette si user_id n'est pas un UUID", () => {
        const result = societeCreateSchema.safeParse({ ...validCreate, user_id: "pas-un-uuid" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "user_id")).toBe("UUID invalide")
    })

    test("rejette si nom vide", () => {
        const result = societeCreateSchema.safeParse({ ...validCreate, nom: "" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "nom")).toBe("Le nom de la société est obligatoire")
    })

    test("rejette si scte trop court (< 10 caractères)", () => {
        const result = societeCreateSchema.safeParse({ ...validCreate, scte: "12345" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "scte")).toBeDefined()
    })

    test("accepte un matricule de 10 caractères minimum", () => {
        expect(societeCreateSchema.safeParse({ ...validCreate, scte: "1234567890" }).success).toBe(true)
    })
})

describe("societeEditSchema", () => {
    test("valide sans user_id (optionnel)", () => {
        expect(societeEditSchema.safeParse({ nom: "Ma Société", scte: "12345678901234" }).success).toBe(true)
    })

    test("accepte user_id si fourni", () => {
        expect(societeEditSchema.safeParse({
            user_id: "550e8400-e29b-41d4-a716-446655440000",
            nom: "Ma Société",
            scte: "12345678901234",
        }).success).toBe(true)
    })

    test("rejette si nom vide", () => {
        const result = societeEditSchema.safeParse({ nom: "", scte: "12345678901234" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "nom")).toBe("Le nom de la société est obligatoire")
    })

    test("rejette si scte trop court", () => {
        const result = societeEditSchema.safeParse({ nom: "Société", scte: "123" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "scte")).toBeDefined()
    })
})