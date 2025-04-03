"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ProductFilters, {
  AvailableFilters,
  ActiveFilters,
} from "@/app/components/ProductFilters";

interface CollectionFiltersProps {
  availableFilters: AvailableFilters;
  activeFilters: ActiveFilters;
  onFilterChange: (optionName: string, value: string, checked: boolean) => void;
  onClearFilters: () => void;
}

export default function CollectionFilters({
  availableFilters,
  activeFilters,
  onFilterChange,
  onClearFilters,
}: CollectionFiltersProps) {
  const activeFilterCount = Object.values(activeFilters).reduce(
    (count, values) => count + values.length,
    0
  );

  // Don't render anything if there are no filters available
  if (Object.keys(availableFilters).length === 0) {
    return null;
  }

  return (
    <div className="md:col-span-4 flex justify-end md:justify-start mb-4 md:mb-0">
      {/* Desktop: Sheet Trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="hidden md:inline-flex">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <ProductFilters
              availableFilters={availableFilters}
              activeFilters={activeFilters}
              onFilterChange={onFilterChange}
              onClearFilters={onClearFilters}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile: Stacked Filters */}
      <div className="block md:hidden w-full">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-start mb-2">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ProductFilters
              availableFilters={availableFilters}
              activeFilters={activeFilters}
              onFilterChange={onFilterChange}
              onClearFilters={onClearFilters}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
