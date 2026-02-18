import {redirect} from "next/navigation";
import {getCurrentUser} from "@/src/lib/auth";


export default async function DocumentLayout({
                                                children,
                                            }: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/authentification");
    }

    if (user.is_superuser) {
        return <>{children}</>;
    }

    return <>{children}</>;
}