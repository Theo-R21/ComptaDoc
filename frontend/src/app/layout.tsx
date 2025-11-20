import "./globals.css";
import {UserProvider} from "@/src/provider/UserContext";
import Navbar from "@/src/app/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-50">
          <UserProvider>
            <div className="flex h-dvh w-dvw">
              <Navbar/>
              {children}
            </div>
          </UserProvider>
      </body>
    </html>
  );
}