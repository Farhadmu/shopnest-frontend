"use client";

import { useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

type StoreSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

export default function StoreSearch({
  value,
  onChange,
  onClear,
}: StoreSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 shadow-xl backdrop-blur-xl">
        {/* Search Icon */}
        <div className="flex items-center pl-3">
          <FaSearch className="text-sm text-white/50" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search stores, products..."
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/50 sm:text-base"
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <FaTimes className="text-sm" />
          </button>
        )}

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          className="shrink-0 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:px-6"
        >
          Search
        </button>
      </div>
    </div>
  );
}