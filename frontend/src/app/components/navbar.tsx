"use client";

import Link from "next/link";
import {useCurrentUser} from "@/src/hook/useCurrent";
import UserDropdown from "@/src/app/components/dropdown";

export default function Navbar() {
  const { user } = useCurrentUser();

  return (
<>
      {user ? (
        <aside className="flex h-screen w-72 flex-col justify-between bg-violet-200 text-violet-900 shadow-lg max-md:w-20 transition-all duration-500">
          <div className="flex items-center gap-2 border-b border-violet-300 p-4 max-md:justify-center">
            <i className="ri-menu-line"></i>
            <span className="font-bold text-lg max-md:hidden">MonApp</span>
          </div>

          <nav className="flex flex-col gap-2 p-4 flex-1">
            <Link
              href="#"
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-violet-300 transition max-md:justify-center"
            >
              <i className="ri-home-line"></i>
              <span className="max-md:hidden">Accueil</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-violet-300 transition max-md:justify-center"
            >
              <i className="ri-dashboard-2-line"></i>
              <span className="max-md:hidden">Dashboard</span>
            </Link>

            <Link
              href="/trajet"
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-violet-300 transition max-md:justify-center"
            >
              <i className="ri-car-line"></i>
              <span className="max-md:hidden">Trajet</span>
            </Link>

            <Link
              href="/garage"
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-violet-300 transition max-md:justify-center"
            >
              <i className="ri-database-line"></i>
              <span className="max-md:hidden">Garage</span>
            </Link>

            <Link
              href="/user"
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-violet-300 transition max-md:justify-center"
            >
              <i className="ri-group-3-line"></i>
              <span className="max-md:hidden">Utilisateurs</span>
            </Link>
          </nav>

          <div className="border-t border-violet-300 p-4 flex items-center justify-between max-md:flex-col max-md:gap-2">
            <UserDropdown />
            <i className="ri-expand-up-down-fill"></i>
          </div>
        </aside>
      ) : null}
    </>
  );
}
