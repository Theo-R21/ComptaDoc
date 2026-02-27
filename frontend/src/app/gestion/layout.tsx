import {AuthGuard} from "@/src/provider/AuthGuard";


export default async function GestionLayout({
                                                children,
                                            }: {
    children: React.ReactNode;
}) {
      return <AuthGuard allowedRoles={["comptable"]}>{children}</AuthGuard>;
}