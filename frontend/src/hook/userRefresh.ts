export async function apiFetch(input: string, init?: RequestInit, router?: any) {
  let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${input}`, {
    ...init,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${input}`, {
        ...init,
        credentials: "include",
      });
    }
  }

  if (res.status === 403 && router) {
    router.replace("/403");
    return null;
  }

  return res;
}
