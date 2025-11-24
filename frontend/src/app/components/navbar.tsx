"use client";

import Link from "next/link";
import {useCurrentUser} from "@/src/hook/useCurrent";
import UserDropdown from "@/src/app/components/dropdown";
import {MdOutlineDashboard} from "react-icons/md";
import {RiFoldersLine, RiGroup2Line} from "react-icons/ri";

export default function Navbar() {
    const {user} = useCurrentUser();

    return (
        <>
            {user ? (
                <aside
                    className="flex h-screen w-72 flex-col justify-between bg-primary1 shadow-lg transition-all duration-500">
                    <div className="flex items-center gap-2 border-b border-primary2 p-4 max-md:justify-center">
                        <span className="font-bold text-2xl max-md:hidden">SimplyLux</span>
                    </div>

                    <nav className="flex flex-col gap-2 p-4 flex-1">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary2 transition max-md:justify-center"
                        >
                            <MdOutlineDashboard className="text-calltoaction1 text-2xl"/>
                            <span className="max-md:hidden">Dashboard</span>
                        </Link>

                        <Link
                            href="/documents"
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary2 transition max-md:justify-center"
                        >
                            <RiFoldersLine className="text-calltoaction1 text-2xl"/>
                            <span className="max-md:hidden">Documents</span>
                        </Link>

                        <Link
                            href="/gestion"
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-primary2 transition max-md:justify-center"
                        >
                            <RiGroup2Line className="text-calltoaction1 text-2xl"/>
                            <span className="max-md:hidden">Gestions utilisateurs</span>
                        </Link>

                    </nav>

                    <div
                        className="border-t border-primary2 p-4 flex items-center justify-between max-md:flex-col max-md:gap-2">
                        <UserDropdown/>
                        <i className="ri-expand-up-down-fill"></i>
                    </div>
                </aside>
            ) : null}
        </>
    );
}
