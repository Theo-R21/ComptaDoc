import {AuthGuard} from "@/src/provider/AuthGuard";


export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    return <AuthGuard allowedRoles={["comptable", "client"]}>{children}</AuthGuard>;

}