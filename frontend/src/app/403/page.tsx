export default function ForbiddenPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-5">
            <h1 className="text-5xl font-bold text-red-600">403</h1>
            <p className="mt-4 text-xl text-primary1">Accès refusé : vous n’avez pas la permission de voir cette page.</p>
        </div>
    )
}
