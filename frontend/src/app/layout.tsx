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
      <body>
          <UserProvider>
            <div className="flex min-h-screen w-full bg-neutral-50">
              <Navbar/>
              {children}
            </div>
          </UserProvider>
      </body>
    </html>
  );
}