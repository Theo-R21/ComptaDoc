import { describe, test, expect } from "vitest"
import { ZodError } from "zod"
import {documentCreateSchema} from "@/lib/validation/document.schema";

const getFieldError = (error: ZodError, field: string): string | undefined =>
    error.issues.find(i => i.path[0] === field)?.message

describe("documentCreateSchema", () => {
    const validDoc = {
        path: new File(["content"], "test.pdf", { type: "application/pdf" }),
        nom: "Facture janvier",
        type: "550e8400-e29b-41d4-a716-446655440000",
        date_publication: "2024-01-15",
    }

    test("valide un document complet", () => {
        expect(documentCreateSchema.safeParse(validDoc).success).toBe(true)
    })

    test("rejette si path est null", () => {
        const result = documentCreateSchema.safeParse({ ...validDoc, path: null })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "path")).toBe("Vous n'avez pas déposé de fichier")
    })

    test("rejette si nom vide", () => {
        const result = documentCreateSchema.safeParse({ ...validDoc, nom: "" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "nom")).toBe("Le nom est obligatoire")
    })

    test("rejette si type n'est pas un UUID valide", () => {
        const result = documentCreateSchema.safeParse({ ...validDoc, type: "pas-un-uuid" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "type")).toBe("UUID invalide")
    })

    test("rejette si type vide", () => {
        const result = documentCreateSchema.safeParse({ ...validDoc, type: "" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "type")).toBe("Le type est obligatoire")
    })

    test("rejette si date_publication vide", () => {
        const result = documentCreateSchema.safeParse({ ...validDoc, date_publication: "" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "date_publication")).toBe("La date de publication est obligatoire")
    })
})