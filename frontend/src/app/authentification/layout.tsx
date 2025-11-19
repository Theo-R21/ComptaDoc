export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="h-screen w-screen bg-primary1">
      <div className="grid h-full w-full grid-cols-3 overflow-hidden">
        <div className="col-span-2 flex items-center justify-center p-12 max-lg:hidden">
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-center text-6xl font-bold text-white">
              Bienvenue sur ComptaDoc
            </h1>
            <p className="text-center text-xl text-gray-300">
              Le site de partage de document pour la comptabilité
            </p>
          </div>
        </div>

        <div className="col-span-1 flex flex-col items-center justify-center bg-white p-8 max-lg:col-span-3">
          {children}
        </div>
      </div>
    </main>
  )
}