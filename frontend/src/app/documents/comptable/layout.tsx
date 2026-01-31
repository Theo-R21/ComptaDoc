import RoleGuard from "@/src/provider/RoleGuard";


export default function DocumentsLayout({ children }) {
    return (
        <RoleGuard allowedRoles={["comptable"]}>
            {children}
        </RoleGuard>
    );
}
