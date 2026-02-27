export async function getCurrentUser() {
    const res = await fetch(`${process.env.API_URL}/api/auth/me`, {
        cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
}