import { describe, test, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import {GET} from "@/lib/route";

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => mockFetch.mockReset())

const makeReq = (cookie = "session=abc") =>
    new NextRequest("http://localhost/api/auth/me", {
        headers: { cookie },
    })

const mockOkUser = (user = { id: 1, email: "jean@test.com" }) => ({
    ok: true,
    status: 200,
    json: async () => user,
    headers: new Headers(),
})

describe("GET /api/auth/me", () => {

    test("retourne le user si authentifié (200)", async () => {
        mockFetch.mockResolvedValueOnce(mockOkUser())

        const res = await GET(makeReq())
        const body = await res.json()

        expect(res.status).toBe(200)
        expect(body.email).toBe("jean@test.com")
    })

    test("retourne 401 si Django répond autre chose que 200 sans 401", async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 500, headers: new Headers() })

        const res = await GET(makeReq())
        expect(res.status).toBe(401)
    })


    test("tente un refresh si Django répond 401", async () => {
        mockFetch
            .mockResolvedValueOnce({ status: 401, ok: false, headers: new Headers() })   // me/ → 401
            .mockResolvedValueOnce({ ok: true, headers: new Headers() })                  // refresh/ → OK
            .mockResolvedValueOnce(mockOkUser())                                           // me/ retry → OK

        const res = await GET(makeReq())
        expect(res.status).toBe(200)
        expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    test("retourne 401 si le refresh échoue", async () => {
        mockFetch
            .mockResolvedValueOnce({ status: 401, ok: false, headers: new Headers() })
            .mockResolvedValueOnce({ ok: false, status: 401, headers: new Headers() })

        const res = await GET(makeReq())
        expect(res.status).toBe(401)
        expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    test("retourne 401 si le retry après refresh échoue", async () => {
        mockFetch
            .mockResolvedValueOnce({ status: 401, ok: false, headers: new Headers() })
            .mockResolvedValueOnce({ ok: true, headers: new Headers() })
            .mockResolvedValueOnce({ ok: false, status: 401, headers: new Headers() })

        const res = await GET(makeReq())
        expect(res.status).toBe(401)
    })

    test("⚠️ propage le cookie set-cookie après refresh au browser", async () => {
        mockFetch
            .mockResolvedValueOnce({ status: 401, ok: false, headers: new Headers() })
            .mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ "set-cookie": "access_token=newtoken123; HttpOnly" }),
            })
            .mockResolvedValueOnce(mockOkUser())

        const res = await GET(makeReq())

        expect(res.status).toBe(200)
        expect(res.headers.get("set-cookie")).toContain("access_token=newtoken123")
    })


    test("transfère le cookie du browser vers Django", async () => {
        mockFetch.mockResolvedValueOnce(mockOkUser())

        await GET(makeReq("session=mon-cookie-secret"))

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/auth/users/me/"),
            expect.objectContaining({
                headers: expect.objectContaining({ Cookie: "session=mon-cookie-secret" }),
            })
        )
    })
})