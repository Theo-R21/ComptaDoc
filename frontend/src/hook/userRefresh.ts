interface ApiFetchInit extends Omit<RequestInit, "signal"> {
    onUploadProgress?: (percent: number) => void
    signal?: AbortSignal
}

function xhrFetch(url: string, init: ApiFetchInit): Promise<Response> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && init.onUploadProgress) {
                const pct = Math.round((e.loaded / e.total) * 95)
                init.onUploadProgress(pct)
            }
        })

        xhr.addEventListener("load", () => {
            const response = new Response(xhr.response, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: new Headers(
                    xhr.getAllResponseHeaders()
                        .trim()
                        .split("\r\n")
                        .reduce((acc: Record<string, string>, line) => {
                            const [key, ...rest] = line.split(": ")
                            acc[key] = rest.join(": ")
                            return acc
                        }, {})
                ),
            })
            resolve(response)
        })

        xhr.addEventListener("error", () => reject(new Error("Erreur réseau")))
        xhr.addEventListener("abort", () => reject(new Error("Requête annulée")))

        init.signal?.addEventListener("abort", () => xhr.abort())

        xhr.open((init.method ?? "GET").toUpperCase(), url)
        xhr.withCredentials = true

        if (init.headers) {
            const headers = new Headers(init.headers as HeadersInit)
            headers.forEach((value, key) => {
                if (key.toLowerCase() !== "content-type") {
                    xhr.setRequestHeader(key, value)
                }
            })
        }

        xhr.send(init.body as XMLHttpRequestBodyInit)
    })
}

export async function apiFetch(
    input: string,
    init?: ApiFetchInit,
    router?: any
) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}${input}`
    const useXhr = !!init?.onUploadProgress

    const doFetch = () =>
        useXhr
            ? xhrFetch(url, init!)
            : fetch(url, {...init, credentials: "include"})

    let res = await doFetch()

    if (res.status === 401) {
        const refreshRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,
            {method: "POST", credentials: "include"}
        )

        if (refreshRes.ok) {
            res = await doFetch()
        }
    }

    if (res.status === 403 && router) {
        router.replace("/403")
        return null
    }

    return res
}