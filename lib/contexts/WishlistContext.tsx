"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { WishlistContextType } from "@/lib/types/wishlist";
import { toast } from "sonner";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const STORAGE_KEY = "lugdi_wishlist_v1"; // Simple key for local storage

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [wishlistedVariantIds, setWishlistedVariantIds] = useState<string[]>(
    []
  );
  const [isInitialized, setIsInitialized] = useState(false); // Prevent premature local storage writes

  // Load initial state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedItems = localStorage.getItem(STORAGE_KEY);
        if (storedItems) {
          setWishlistedVariantIds(JSON.parse(storedItems));
        }
      } catch (error) {
        console.error("Error reading wishlist from localStorage:", error);
        localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
      } finally {
        setIsInitialized(true); // Mark initialization complete
      }
    }
  }, []);

  // Save state to localStorage whenever it changes (after initialization)
  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistedVariantIds));
      } catch (error) {
        console.error("Error saving wishlist to localStorage:", error);
        toast.error("Could not save wishlist changes.");
      }
    }
  }, [wishlistedVariantIds, isInitialized]);

  const addToWishlist = useCallback((variantId: string) => {
    setWishlistedVariantIds((prevIds) => {
      if (!prevIds.includes(variantId)) {
        toast.success("Added to wishlist!");
        return [...prevIds, variantId];
      }
      return prevIds; // Already exists, return same array
    });
  }, []);

  const removeFromWishlist = useCallback((variantId: string) => {
    setWishlistedVariantIds((prevIds) => {
      if (prevIds.includes(variantId)) {
        toast.success("Removed from wishlist!");
        return prevIds.filter((id) => id !== variantId);
      }
      return prevIds; // Doesn't exist, return same array
    });
  }, []);

  const isItemInWishlist = useCallback(
    (variantId: string): boolean => {
      return wishlistedVariantIds.includes(variantId);
    },
    [wishlistedVariantIds]
  );

  const clearWishlist = useCallback(() => {
    setWishlistedVariantIds([]);
    toast.info("Wishlist cleared.");
    // localStorage update will happen via the useEffect hook
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistedVariantIds,
        addToWishlist,
        removeFromWishlist,
        isItemInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
