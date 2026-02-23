export default function AuthenticationLayout({
                                                 children,
                                             }: {
    children: React.ReactNode
}) {
    return (
        <main className="h-screen w-screen bg-primary1 overflow-hidden relative">

            <div
                className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary2/40 rounded-full blur-3xl pointer-events-none"/>
            <div
                className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-primary2/40 rounded-full blur-3xl pointer-events-none"/>

            <div className="relative grid h-full w-full grid-cols-3">

                <div className="col-span-2 flex items-center justify-center p-12 max-lg:hidden">
                    <div className="flex flex-col items-center gap-4">
                        <h1 className="text-center text-6xl font-bold text-white">
                            Bienvenue sur ComptaDoc
                        </h1>
                        <p className="text-center text-xl text-white/60">
                            Le site de partage de document pour la comptabilité
                        </p>
                    </div>
                </div>

                <div className="col-span-1 flex items-center justify-center px-6 py-8 max-lg:col-span-3">
                    <div
                        className="w-full h-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl p-8 flex flex-col justify-center">
                        {children}
                    </div>
                </div>

            </div>
        </main>
    )
}