import { describe, test, expect } from "vitest"
import type { UserModel } from "@/src/models/user/user.model"
import {hasRole} from "@/lib/permissions";

const makeUser = (overrides: Partial<UserModel> = {}): UserModel => ({
    id: "1",
    email: "jean@test.com",
    first_name: "Jean",
    last_name: "Dupont",
    phone: "0612345678",
    is_superuser: false,
    roles: [],
    ...overrides,
})

describe("hasRole", () => {
    test("retourne false si user est null", () => {
        expect(hasRole(null, ["admin"])).toBe(false)
    })

    test("retourne true si user est superuser, peu importe le rôle", () => {
        const user = makeUser({ is_superuser: true, roles: [] })
        expect(hasRole(user, ["admin"])).toBe(true)
        expect(hasRole(user, ["n'importe-quoi"])).toBe(true)
    })

    test("retourne true si le user a le rôle requis", () => {
        const user = makeUser({ roles: [{ id: "1", label: "admin" }, { id: "2", label: "viewer" }] })
        expect(hasRole(user, ["admin"])).toBe(true)
    })

    test("retourne true si le user a au moins un des rôles requis", () => {
        const user = makeUser({ roles: [{ id: "1", label: "viewer" }] })
        expect(hasRole(user, ["admin", "viewer"])).toBe(true)
    })

    test("retourne false si le user n'a aucun des rôles requis", () => {
        const user = makeUser({ roles: [{ id: "1", label: "viewer" }] })
        expect(hasRole(user, ["admin"])).toBe(false)
    })

    test("retourne false si le user n'a aucun rôle", () => {
        const user = makeUser({ roles: [] })
        expect(hasRole(user, ["admin"])).toBe(false)
    })

    test("retourne false si roles est undefined", () => {
        const user = makeUser({ roles: undefined })
        expect(hasRole(user, ["admin"])).toBe(false)
    })
})