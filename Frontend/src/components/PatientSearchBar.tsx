// src/components/features/patients/PatientSearchBar.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { ChangeEvent } from "react";

interface PatientSearchBarProps {
  searchTerm: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  isLoading?: boolean;
}

export function PatientSearchBar({ searchTerm, onSearchChange, onClearSearch, isLoading }: PatientSearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <div className="relative flex-grow sm:flex-grow-0 sm:w-72">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by patient name..."
          value={searchTerm}
          onChange={onSearchChange}
          className="pl-8 w-full"
          aria-label="Search patients by name"
        />
      </div>
      {searchTerm && (
        <Button variant="ghost" onClick={onClearSearch} disabled={isLoading}>
          <X className="mr-2 h-4 w-4" /> Clear Search
        </Button>
      )}
    </div>
  );
}