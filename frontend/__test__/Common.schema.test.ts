import { describe, test, expect } from "vitest"
import {emailSchema, phoneSchema, requiredString} from "@/lib/validation/common.schema";

describe("requiredString", () => {
    const schema = requiredString("Champ obligatoire.")

    test("accepte une chaîne non vide", () => {
        expect(schema.safeParse("Jean").success).toBe(true)
    })

    test("rejette une chaîne vide", () => {
        const result = schema.safeParse("")
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toBe("Champ obligatoire.")
    })

    test("rejette undefined", () => {
        expect(schema.safeParse(undefined).success).toBe(false)
    })
})

describe("emailSchema", () => {
    test("accepte un email valide", () => {
        expect(emailSchema.safeParse("jean@test.com").success).toBe(true)
    })

    test("accepte un email avec sous-domaine", () => {
        expect(emailSchema.safeParse("jean@mail.test.com").success).toBe(true)
    })

    test("rejette un email sans @", () => {
        const result = emailSchema.safeParse("jean-test.com")
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toBe("Format d'email invalide.")
    })

    test("rejette un email vide", () => {
        const result = emailSchema.safeParse("")
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toBe("L'email est obligatoire.")
    })

    test("trim les espaces avant validation", () => {
        expect(emailSchema.safeParse("  jean@test.com  ").success).toBe(true)
    })
})


describe("phoneSchema", () => {
    test("accepte un numéro français 06", () => {
        expect(phoneSchema.safeParse("0612345678").success).toBe(true)
    })

    test("accepte un numéro français +33", () => {
        expect(phoneSchema.safeParse("+33612345678").success).toBe(true)
    })

    test("accepte un numéro français 0033", () => {
        expect(phoneSchema.safeParse("0033612345678").success).toBe(true)
    })

    test("accepte un numéro luxembourgeois +352", () => {
        expect(phoneSchema.safeParse("+35227123456").success).toBe(true)
    })

    test("accepte un numéro luxembourgeois sans indicatif", () => {
        expect(phoneSchema.safeParse("27123456").success).toBe(true)
    })

    test("rejette un numéro trop court", () => {
        expect(phoneSchema.safeParse("061234").success).toBe(false)
    })

    test("rejette un numéro vide", () => {
        const result = phoneSchema.safeParse("")
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toBe("Le numéro de téléphone est obligatoire.")
    })

    test("rejette un numéro avec lettres", () => {
        expect(phoneSchema.safeParse("06ABCDEFGH").success).toBe(false)
    })
})