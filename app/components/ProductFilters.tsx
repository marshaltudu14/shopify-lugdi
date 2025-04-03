"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Type for the structure of available filters derived from products
export interface AvailableFilters {
  [optionName: string]: Set<string>; // e.g., { Color: Set{'Red', 'Blue'}, Size: Set{'S', 'M'} }
}

// Type for the structure of currently active/selected filters
export interface ActiveFilters {
  [optionName: string]: string[]; // e.g., { Color: ['Red'], Size: [] }
}

interface ProductFiltersProps {
  availableFilters: AvailableFilters;
  activeFilters: ActiveFilters;
  onFilterChange: (optionName: string, value: string, checked: boolean) => void;
  onClearFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  availableFilters,
  activeFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const filterOptions = Object.entries(availableFilters).filter(
    ([, values]) => values.size > 0
  ); // Only show options with values

  const hasActiveFilters = Object.values(activeFilters).some(
    (values) => values.length > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-sm"
          >
            <X className="mr-1 h-4 w-4" /> Clear All
          </Button>
        )}
      </div>

      {filterOptions.length > 0 ? (
        <Accordion
          type="multiple"
          // defaultValue={filterOptions.map(([name]) => name)} // Removed: Sections will be closed by default
          className="w-full"
        >
          {filterOptions.map(([optionName, values]) => (
            <AccordionItem value={optionName} key={optionName}>
              <AccordionTrigger className="text-base">
                {optionName}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-2">
                  {Array.from(values)
                    .sort() // Sort values alphabetically
                    .map((value) => {
                      const isChecked =
                        activeFilters[optionName]?.includes(value) ?? false;
                      const id = `filter-${optionName}-${value}`;

                      return (
                        <div key={id} className="flex items-center space-x-2">
                          <Checkbox
                            id={id}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              onFilterChange(
                                optionName,
                                value,
                                Boolean(checked)
                              )
                            }
                          />
                          <Label
                            htmlFor={id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {value}
                          </Label>
                        </div>
                      );
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-muted-foreground">
          No filters available for the current products.
        </p>
      )}
    </div>
  );
};

export default ProductFilters;
