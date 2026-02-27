import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookieHeader = req.headers.get("cookie") ?? "";

    let res = await fetch(`${process.env.API_URL}/auth/users/me/`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
    });

    if (res.status === 401) {
        const refreshRes = await fetch(`${process.env.API_URL}/auth/refresh/`, {
            method: "POST",
            headers: { Cookie: cookieHeader },
            cache: "no-store",
        });

        if (!refreshRes.ok) {
            return NextResponse.json(null, { status: 401 });
        }

        const response = NextResponse.next();

        const setCookie = refreshRes.headers.get("set-cookie");
        if (setCookie) {
            response.headers.set("set-cookie", setCookie);
        }

        res = await fetch(`${process.env.API_URL}/auth/users/me/`, {
            headers: { Cookie: setCookie ?? cookieHeader },
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(null, { status: 401 });
        }

        const user = await res.json();
        return NextResponse.json(user, {
            headers: response.headers,
        });
    }

    if (!res.ok) {
        return NextResponse.json(null, { status: 401 });
    }

    const user = await res.json();
    return NextResponse.json(user);
}