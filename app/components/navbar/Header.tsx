//components/navbar/Header.tsx

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useQuery } from "@apollo/client";
import { GET_MENU, GetMenuResponse } from "@/lib/queries/menu";
import { countries } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { initializeApollo } from "@/lib/apollo/apollo-client";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import { MenuItem } from "@/lib/types/menu";
import { getCookie, setCookie } from "@/utils/CookieUtils";
import LugdiUtils from "@/utils/LugdiUtils";
import { Skeleton } from "@/components/ui/skeleton";
import MobileBottomNav from "./MobileBottomNav";
// Removed getActiveTheme and themeConfig imports

// Removed HeaderProps interface

export default function Header(/* Removed props */) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountrySlug, setSelectedCountrySlug] = useState("");
  const [, setSelectedCountryName] = useState("");
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const client = initializeApollo();
  const { data } = useQuery<GetMenuResponse>(GET_MENU, {
    variables: { handle: "main-menu" },
    client,
  });

  const handleCountryChange = (slug: string, name: string) => {
    setSelectedCountrySlug(slug);
    setSelectedCountryName(name);
    setCookie(LugdiUtils.location_cookieName, slug, 30);
    setCookie(LugdiUtils.location_name_country_cookie, name, 30);
    window.location.reload();
  };

  useEffect(() => {
    const slug = getCookie(LugdiUtils.location_cookieName);
    const name = getCookie(LugdiUtils.location_name_country_cookie);

    if (slug && name) {
      setSelectedCountrySlug(slug);
      setSelectedCountryName(name);
    } else {
      const defaultCountry = countries[0];
      setSelectedCountrySlug(defaultCountry.slug);
      setSelectedCountryName(defaultCountry.name);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(currentScrollY <= lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  function ensureStartWith(stringToCheck: string, startsWith: string) {
    return stringToCheck.startsWith(startsWith)
      ? stringToCheck
      : `${startsWith}${stringToCheck}`;
  }

  // activeTheme logic removed as it's no longer used in this component

  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    ? ensureStartWith(process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, "https://")
    : "";

  const menuItems: MenuItem[] =
    data?.menu?.items.map((item) => ({
      ...item,
      url: item.url.replace(domain, ""),
    })) || [];

  // Removed activeTheme logic
  // const activeTheme = getActiveTheme(selectedCountrySlug, themeConfig);

  return (
    <>
      <div
        className={cn(
          "sticky top-0 z-50 w-full transition-transform duration-300 backdrop-blur-lg",
          showHeader ? "translate-y-0" : "-translate-y-full"
        )}
      >
        {/* Show India Launch Offer Banner if country is India */}
        {selectedCountrySlug === "in" && (
          <div className="coupon-notice text-center text-xs sm:text-sm font-medium py-1.5 px-4 shadow-md">
            {/* Removed activeTheme logic, always show default offer for India */}
            <>
              🎉 Get 100 INR off your first order over 1000 INR! Use code{" "}
              <span className="font-bold tracking-wider">LUGDIINDIA100</span> 🎉
            </>
          </div>
        )}{" "}
        {/* Moved closing parenthesis here */}
        <Suspense fallback={<Skeleton className="h-16 w-full" />}>
          <DesktopHeader
            menuItems={menuItems}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCountrySlug={selectedCountrySlug}
            handleCountryChange={handleCountryChange}
            countries={countries}
            // Removed logoDecorationClass prop pass-through
          />
          <MobileHeader
            menuItems={menuItems}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCountrySlug={selectedCountrySlug}
            handleCountryChange={handleCountryChange}
            countries={countries}
            // Removed logoDecorationClass prop pass-through
          />
        </Suspense>
      </div>
      <MobileBottomNav />
    </>
  );
}
