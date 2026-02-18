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

export default function UserDropdown() {
    const {user, logout } = useCurrentUser();

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none cursor-pointer">
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

            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem className="cursor-pointer">
                    <i className="ri-user-line"></i>
                    Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <i className="ri-settings-line"></i>
                    Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 cursor-pointer"
                >
                    <i className="ri-logout-box-line"></i>
                    Déconnexion
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
