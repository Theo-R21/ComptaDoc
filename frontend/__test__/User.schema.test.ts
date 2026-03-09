import { describe, test, expect } from "vitest"
import { ZodError } from "zod"
import {userCreateSchema, userEditSchema, emailUserSchema, resetPasswordSchema} from "@/lib/validation/user.schema";

// Zod v4 — accès aux erreurs par champ via issues
const getFieldError = (error: ZodError, field: string): string | undefined =>
    error.issues.find(i => i.path[0] === field)?.message

const validUser = {
    first_name: "Jean",
    last_name: "Dupont",
    email: "jean@test.com",
    phone: "0612345678",
    password: "secret123",
    password2: "secret123",
}

describe("userCreateSchema", () => {
    test("valide un utilisateur complet", () => {
        expect(userCreateSchema.safeParse(validUser).success).toBe(true)
    })

    test("rejette si prénom vide", () => {
        const result = userCreateSchema.safeParse({ ...validUser, first_name: "" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "first_name")).toBe("Le prénom est obligatoire.")
    })

    test("rejette si nom vide", () => {
        const result = userCreateSchema.safeParse({ ...validUser, last_name: "" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "last_name")).toBe("Le nom est obligatoire.")
    })

    test("rejette si email invalide", () => {
        const result = userCreateSchema.safeParse({ ...validUser, email: "pas-un-email" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "email")).toBeDefined()
    })

    test("rejette si mot de passe vide", () => {
        const result = userCreateSchema.safeParse({ ...validUser, password: "" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "password")).toBe("Le mot de passe est obligatoire.")
    })

    test("rejette si les mots de passe ne correspondent pas", () => {
        const result = userCreateSchema.safeParse({ ...validUser, password2: "autrepassword" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "password2")).toBe("Les mots de passe ne correspondent pas.")
    })

    test("accepte si les mots de passe correspondent exactement", () => {
        expect(userCreateSchema.safeParse({ ...validUser, password: "abc", password2: "abc" }).success).toBe(true)
    })
})

describe("userEditSchema", () => {
    const validEdit = {
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean@test.com",
        phone: "0612345678",
    }

    test("valide une édition correcte", () => {
        expect(userEditSchema.safeParse(validEdit).success).toBe(true)
    })

    test("rejette si prénom manquant", () => {
        const result = userEditSchema.safeParse({ ...validEdit, first_name: "" })
        expect(result.success).toBe(false)
    })

    test("rejette si email manquant", () => {
        const result = userEditSchema.safeParse({ ...validEdit, email: "" })
        expect(result.success).toBe(false)
    })

    test("rejette si téléphone invalide", () => {
        const result = userEditSchema.safeParse({ ...validEdit, phone: "00000" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "phone")).toBe("Numéro français ou luxembourgeois invalide.")
    })
})

describe("resetPasswordSchema", () => {
    test("valide si les mots de passe correspondent", () => {
        expect(resetPasswordSchema.safeParse({ password1: "abc123", password2: "abc123" }).success).toBe(true)
    })

    test("rejette si les mots de passe ne correspondent pas", () => {
        const result = resetPasswordSchema.safeParse({ password1: "abc123", password2: "xyz456" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "password2")).toBe("Les mots de passe ne correspondent pas.")
    })

    test("rejette si password1 vide", () => {
        const result = resetPasswordSchema.safeParse({ password1: "", password2: "" })
        expect(result.success).toBe(false)
        if (!result.success) expect(getFieldError(result.error, "password1")).toBe("Le mot de passe est obligatoire.")
    })
})

describe("emailUserSchema", () => {
    test("valide un email correct", () => {
        expect(emailUserSchema.safeParse({ email: "jean@test.com" }).success).toBe(true)
    })

    test("rejette un email invalide", () => {
        expect(emailUserSchema.safeParse({ email: "pas-un-email" }).success).toBe(false)
    })

    test("rejette un email vide", () => {
        expect(emailUserSchema.safeParse({ email: "" }).success).toBe(false)
    })
})