import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Country } from "@/lib/countries";

interface CountriesComboboxProps {
  countries: Country[];
  selectedSlug: string;
  onCountrySelect: (slug: string, name: string) => void;
}

export default function CountriesCombobox({
  countries,
  selectedSlug,
  onCountrySelect,
}: CountriesComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    const found = countries.find((country) => country.slug === selectedSlug);
    if (found) setSelectedName(found.name);
  }, [countries, selectedSlug]);

  const filteredCountries = countries
    .filter(
      (country) =>
        country.active && // Filter only active countries
        country.name.toLowerCase().includes(searchValue.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleSelect = (countryName: string) => {
    const found = countries.find((c) => c.name === countryName);
    if (found) {
      onCountrySelect(found.slug, found.name);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[150px] justify-center cursor-pointer"
        >
          {selectedName || "Select Country..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="Search country..."
            value={searchValue}
            onValueChange={(val) => setSearchValue(val)}
          />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {filteredCountries.map((country) => (
                <CommandItem
                  key={country.slug}
                  value={country.name}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  {country.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedName === country.name
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
