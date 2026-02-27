"use client";
import Link from "next/link";
import {useCurrentUser} from "@/src/hook/useCurrent";
import UserDropdown from "@/src/app/components/dropdown";
import {MdOutlineDashboard} from "react-icons/md";
import {RiFoldersLine, RiGroup2Line} from "react-icons/ri";
import {hasRole} from "@/src/lib/permissions";
import Image from "next/image";
import Logo1 from "@/public/Logo_SimplyLux_Text.svg";
import Logo2 from "@/public/Logo_SimplyLux.svg";

export default function Navbar() {
    const {user} = useCurrentUser();
    if (!user) return null;

    return (

        <aside className="sticky top-0 h-screen flex flex-col justify-between bg-primary1 shadow-lg w-64">
            <div className="flex items-center justify-center border-b border-primary2 max-md:justify-center">
                <Image
                    src={Logo1}
                    alt="SimplyLux"
                    width={150}
                    height={40}
                    className="max-md:hidden"
                />
                <Image
                    src={Logo2}
                    alt="SimplyLux"
                    width={36}
                    height={36}
                    className="hidden max-md:block"
                />
            </div>

            <nav className="flex flex-col gap-2 p-4 flex-1">
                <Link href="/dashboard"
                      className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary2 transition max-md:justify-center">
                    <MdOutlineDashboard className="text-calltoaction1 text-2xl"/>
                    <span className="max-md:hidden">Dashboard</span>
                </Link>

                <Link href="/documents/societe"
                      className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary2 cursor-pointer transition max-md:justify-center text-left">
                    <RiFoldersLine className="text-calltoaction1 text-2xl"/>
                    <span className="max-md:hidden">Documents</span>
                </Link>

                {hasRole(user, ["comptable"]) && (
                    <Link href="/gestion"
                          className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary2 transition max-md:justify-center">
                        <RiGroup2Line className="text-calltoaction1 text-2xl"/>
                        <span className="max-md:hidden">Gestions utilisateurs</span>
                    </Link>
                )}
            </nav>

            <div
                className="border-t border-primary2 p-4 flex items-center justify-between max-md:flex-col max-md:gap-2">
                {user ? <UserDropdown/> : <span className="text-white/50">Chargement...</span>}
                <i className="ri-expand-up-down-fill"></i>
            </div>
        </aside>
    );
}
