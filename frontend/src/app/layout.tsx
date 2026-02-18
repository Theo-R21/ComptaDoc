import "./globals.css";
import { UserProvider } from "@/src/provider/UserContext";
import Navbar from "@/src/app/components/navbar";

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <UserProvider>
          <div className="flex min-h-screen w-full bg-neutral-50">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
