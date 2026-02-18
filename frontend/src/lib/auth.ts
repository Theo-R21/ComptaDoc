import { cookies } from "next/headers";

export async function getCurrentUser() {
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(`${process.env.API_URL}/auth/users/me/`, {
        headers: {
            Cookie: cookieHeader,
        },
        cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
}
