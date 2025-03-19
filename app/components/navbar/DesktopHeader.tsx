import React, { useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Country } from "@/lib/countries";
import { MenuItem } from "@/lib/types/menu";
import CountriesCombobox from "../CountriesCombobox";
import { motion, AnimatePresence } from "framer-motion";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { getCookie } from "@/utils/CookieUtils";
import LugdiUtils from "@/utils/LugdiUtils";
import { useRouter } from "next/navigation";

interface DesktopHeaderProps {
  menuItems: MenuItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountrySlug: string;
  handleCountryChange: (slug: string, name: string) => void;
  countries: Country[];
}

export default function DesktopHeader({
  menuItems,
  searchQuery,
  setSearchQuery,
  selectedCountrySlug,
  handleCountryChange,
  countries,
}: DesktopHeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  return (
    <>
      <header className="hidden md:flex relative z-50 w-full backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4">
          {/* Main header row */}
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div
              className="text-3xl font-light tracking-wider"
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

            {/* Desktop Navigation - Hidden on tablet */}
            <div className="hidden lg:block">
              <NavigationMenu>
                <NavigationMenuList className="flex space-x-8">
                  {menuItems.map((item) => (
                    <NavigationMenuItem key={item.url}>
                      <NavigationMenuLink asChild>
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Link
                            href={item.url}
                            className="text-sm font-medium uppercase tracking-wider hover:text-primary transition-colors"
                          >
                            {item.title}
                          </Link>
                        </motion.div>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Actions Group */}
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Search Input - Expandable */}
              <AnimatePresence>
                {isSearchExpanded ? (
                  <motion.div
                    className="absolute left-0 top-0 w-full h-full bg-background/95 backdrop-blur-md flex items-center justify-center px-4 md:px-8 z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative w-full max-w-2xl">
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
                        className="h-12 pl-12 pr-12 text-lg border-primary/20 rounded-full focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />

                      {searchQuery.length > 0 ? (
                        <Link href={`/search/${searchQuery}`}>
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/60" />
                        </Link>
                      ) : (
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary/60" />
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        onClick={() => setIsSearchExpanded(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSearchExpanded(true)}
                      className="rounded-full bg-neutral-100 dark:bg-neutral-900 cursor-pointer"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Country Selector */}
              <div className="hidden md:block">
                <CountriesCombobox
                  countries={countries}
                  selectedSlug={selectedCountrySlug}
                  onCountrySelect={handleCountryChange}
                />
              </div>

              {/* User Account */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={`/account`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-neutral-100 dark:bg-neutral-900 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Shopping Cart */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={`/cart`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-neutral-100 dark:bg-neutral-900 relative cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* Mobile Menu Toggle - Shown on tablet and mobile */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="rounded-full bg-neutral-100 dark:bg-neutral-900 cursor-pointer"
                >
                  {isMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Tablet Navigation - Shows below main header */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {menuItems.map((item) => (
                    <motion.div
                      key={item.url}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Link
                        href={item.url}
                        className="text-sm text-center font-medium uppercase tracking-wider transition-colors block py-2"
                      >
                        {item.title}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="md:hidden mt-4 col-span-2">
                    <CountriesCombobox
                      countries={countries}
                      selectedSlug={selectedCountrySlug}
                      onCountrySelect={handleCountryChange}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Push content below when menu is open on mobile/tablet */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
