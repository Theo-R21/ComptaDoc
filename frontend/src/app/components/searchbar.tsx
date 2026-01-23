"use client";

import { CiSearch } from "react-icons/ci";

type SearchbarProps = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function Searchbar({
  placeholder = "Rechercher...",
  value,
  onChange,
}: SearchbarProps) {
  return (
    <div className="relative w-full">

      <CiSearch
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-primary2 pointer-events-none"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          pl-10 pr-4 py-2
          text-sm
          text-primary1
          bg-white
          border border-primary1/50
          rounded-md
          focus:outline-none
          focus:ring-1 focus:ring-primary1
          hover:border-primary1
        "
      />
    </div>
  );
}
