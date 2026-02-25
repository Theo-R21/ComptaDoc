"use client";
import Image from "next/image";

import {useCurrentUser} from "@/src/hook/useCurrent";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/src/app/components/ui/dropdown-menu"
import {useRouter} from "next/navigation";

export default function UserDropdown() {
    const {user, logout} = useCurrentUser();
    const router = useRouter();

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-primary2 transition-colors focus:outline-none cursor-pointer">
                <Image
                    src="/avatar.webp"
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="rounded-full"
                />
                <div className="flex flex-col items-start">
            <span className="hidden md:inline text-sm font-medium">
              {user.first_name} {user.last_name}
            </span>
                    <span className="hidden md:inline text-sm font-medium text-gray-400">
              {user.email}
            </span>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border border-primary3 bg-white shadow-lg p-2"
            >
                <DropdownMenuLabel className="text-primary1 font-semibold">
                    Mon compte
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="bg-primary3"/>

                <DropdownMenuItem
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-secondary1 hover:bg-primary3 hover:text-primary1 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/profile/`)}>
                    <i className="ri-user-line text-primary2"></i>
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-secondary1 hover:bg-primary3 hover:text-primary1 transition-colors cursor-pointer">
                    <i className="ri-settings-line text-primary2"></i>
                    Paramètres
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-primary3"/>

                <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                >
                    <i className="ri-logout-box-line"></i>
                    Déconnexion
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
