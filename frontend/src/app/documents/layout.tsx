import {AuthGuard} from "@/src/provider/AuthGuard";


export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["comptable", "client"]}>{children}</AuthGuard>;
}