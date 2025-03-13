import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, ShoppingCart, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Country } from "@/lib/countries";
import { MenuItem } from "@/lib/types/menu";
import CountriesCombobox from "../CountriesCombobox";
import { motion, AnimatePresence } from "framer-motion";
import { getCookie } from "@/utils/CookieUtils";
import LugdiUtils from "@/utils/LugdiUtils";
import { useRouter } from "next/navigation";

interface MobileHeaderProps {
  menuItems: MenuItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountrySlug: string;
  handleCountryChange: (slug: string, name: string) => void;
  countries: Country[];
}

export default function MobileHeader({
  menuItems,
  searchQuery,
  setSearchQuery,
  selectedCountrySlug,
  handleCountryChange,
  countries,
}: MobileHeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const router = useRouter();

  return (
    <>
      <header className="md:hidden relative z-50 w-full backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between p-4">
          {/* Menu Button with Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-neutral-100 dark:bg-neutral-900"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </motion.div>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-full max-w-xs border-r border-neutral-200 dark:border-neutral-800"
            >
              <SheetHeader className="mb-6">
                <SheetTitle>
                  <div className="flex items-center justify-between">
                    <motion.div
                      className="text-2xl font-light tracking-wider"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Link href="/" className="flex items-center">
                        <h1>lugdi</h1>
                        <span className="ml-1 text-xs font-light uppercase tracking-widest text-neutral-500">
                          {getCookie(LugdiUtils.location_name_country_cookie)}
                        </span>
                      </Link>
                    </motion.div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              {/* Search Input */}
              <div className="relative px-1 mb-6">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (searchQuery.length > 0) {
                        router.push(`/search/${searchQuery}`);
                        setIsSearchExpanded(false); // Close the search bar after submitting
                      }
                    }
                  }}
                  className="h-10 pl-12 pr-12 text-sm border-primary/20 rounded-full focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />

                {searchQuery.length > 0 ? (
                  <Link href={`/search/${searchQuery}`}>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
                  </Link>
                ) : (
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
                )}
              </div>

              {/* Navigation Links */}
              <nav className="mb-6">
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
                  className="space-y-1"
                >
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.url}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SheetClose asChild>
                        <Link href={item.url}>
                          <Button
                            className="w-full justify-start text-left font-light tracking-wide"
                            variant="ghost"
                          >
                            {item.title}
                          </Button>
                        </Link>
                      </SheetClose>
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>

              <Separator className="my-3" />

              {/* Country Selector */}
              <div className="space-y-2 flex flex-col items-center justify-center">
                <p className="text-sm text-neutral-500 font-light">Region:</p>
                <CountriesCombobox
                  countries={countries}
                  selectedSlug={selectedCountrySlug}
                  onCountrySelect={handleCountryChange}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <motion.div
            className="text-2xl font-light tracking-wider absolute left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center">
              <h1>lugdi</h1>
              <span className="ml-1 text-xs font-light uppercase tracking-widest text-neutral-500">
                {getCookie(LugdiUtils.location_name_country_cookie)}
              </span>
            </Link>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Search Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="rounded-full bg-neutral-100 dark:bg-neutral-900"
              >
                <Search className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Cart Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-neutral-100 dark:bg-neutral-900 relative"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Theme Switcher */}
            <ThemeSwitcher />
          </div>
        </div>

        {/* Expandable Search Bar */}
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.div
              className="w-full px-4 pb-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (searchQuery.length > 0) {
                        router.push(`/search/${searchQuery}`);
                        setIsSearchExpanded(false); // Close the search bar after submitting
                      }
                    }
                  }}
                  className="h-10 pl-12 pr-12 text-sm border-primary/20 rounded-full focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />

                {searchQuery.length > 0 ? (
                  <Link href={`/search/${searchQuery}`}>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
                  </Link>
                ) : (
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/60" />
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setIsSearchExpanded(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
