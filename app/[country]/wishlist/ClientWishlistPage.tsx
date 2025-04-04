"use client";

import React from "react";
import { useWishlist } from "@/lib/contexts/WishlistContext";
import { useQuery } from "@apollo/client";
import { GET_WISHLIST_ITEMS_DETAILS } from "@/lib/queries/wishlist";
import { ProductVariant } from "@/lib/types/product"; // Assuming ProductVariant type is suitable
import { Loader2, Trash2, HeartCrack } from "lucide-react";
// Removed unused Image import
import Link from "next/link";
import { Button } from "@/components/ui/button";
// Removed unused getCurrencySymbol import
// Removed unused 'cn' import
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedSection } from "@/app/components/FramerMotion"; // Removed unused 'itemVariants'
import ProductCard from "@/app/components/ProductCard"; // Import ProductCard
import { CollectionProductNode } from "@/lib/types/collection"; // Import CollectionProductNode type

interface ClientWishlistPageProps {
  countryCode: string; // Receive country code for the query context
}

// Define a type for the fetched data structure
interface WishlistQueryData {
  nodes: (ProductVariant | null)[]; // The query returns an array where items might be null if not found
}

interface WishlistQueryVars {
  ids: string[];
  country: string;
}

export default function ClientWishlistPage({
  countryCode,
}: ClientWishlistPageProps) {
  const { wishlistedVariantIds, removeFromWishlist } = useWishlist();

  const { loading, error, data } = useQuery<
    WishlistQueryData,
    WishlistQueryVars
  >(GET_WISHLIST_ITEMS_DETAILS, {
    variables: { ids: wishlistedVariantIds, country: countryCode },
    skip: wishlistedVariantIds.length === 0, // Skip query if wishlist is empty
    fetchPolicy: "cache-and-network", // Ensure fresh data but use cache if available
  });

  const wishlistItems = data?.nodes?.filter(
    (node): node is ProductVariant => node !== null
  ); // Filter out null results

  if (wishlistedVariantIds.length === 0) {
    return (
      <AnimatedSection
        delay={0.1}
        className="flex flex-col items-center justify-center min-h-screen text-center px-4"
      >
        <HeartCrack
          className="w-16 h-16 text-muted-foreground mb-4"
          strokeWidth={1}
        />
        <h2 className="text-2xl font-semibold mb-2">Your Wishlist is Empty</h2>
        <p className="text-muted-foreground mb-6">
          Add items you love to your wishlist to keep track of them.
        </p>
        <Link href="/">
          <Button>Start Shopping</Button>
        </Link>
      </AnimatedSection>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center text-red-600 px-4">
        <p>Error loading wishlist items: {error.message}</p>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    // This case might happen if items were removed from Shopify after being wishlisted
    return (
      <AnimatedSection
        delay={0.1}
        className="flex flex-col items-center justify-center min-h-screen text-center px-4"
      >
        <HeartCrack
          className="w-16 h-16 text-muted-foreground mb-4"
          strokeWidth={1}
        />
        <h2 className="text-2xl font-semibold mb-2">
          No Items Found in Wishlist
        </h2>
        <p className="text-muted-foreground mb-6">
          The items previously in your wishlist might no longer be available.
        </p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </AnimatedSection>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          // Removed unused variables: currencySymbol, imageUrl, altText

          // Adapt ProductVariant data to CollectionProductNode structure for ProductCard
          const productForCard: CollectionProductNode = {
            // Removed __typename as it's not in the interface
            id: item.product.id, // Use product ID
            title: item.product.title,
            handle: item.product.handle,
            featuredImage: item.image || item.product.featuredImage || null, // Prioritize variant image, fallback to null
            priceRange: {
              minVariantPrice: item.price,
            },
            compareAtPriceRange: {
              minVariantPrice: item.compareAtPrice || {
                amount: "0",
                currencyCode: item.price.currencyCode,
              }, // Provide default if null
            },
            availableForSale: item.availableForSale,
            totalInventory: item.quantityAvailable, // Map quantityAvailable
            options: [], // Provide default empty array as item.product doesn't have options
            variants: {
              // Adapt the variant structure to match CollectionProductNode['variants']['edges'][0]['node']
              edges: [
                {
                  node: {
                    id: item.id,
                    availableForSale: item.availableForSale, // Add availableForSale
                    selectedOptions: item.selectedOptions, // Add selectedOptions
                    // Add other fields from ProductVariant if needed by CollectionProductNode variant type
                    // price: item.price,
                    // compareAtPrice: item.compareAtPrice,
                    // quantityAvailable: item.quantityAvailable,
                    // image: item.image,
                    // title: item.title, // Variant title
                    // product: { id: item.product.id, title: item.product.title, handle: item.product.handle } // Basic product info if needed
                  },
                },
              ],
            },
            // Add other fields if ProductCard requires them, potentially with default values
            // e.g., descriptionHtml: item.product.descriptionHtml || "",
            // options: item.product.options || [],
            // seo: item.product.seo || { title: "", description: "" },
            // tags: item.product.tags || [],
            // updatedAt: item.product.updatedAt || "",
          };

          return (
            <AnimatedSection
              key={item.id}
              className="relative group" // Removed border, padding, flex, min-h-screen
            >
              {/* Render ProductCard */}
              <ProductCard product={productForCard} />

              {/* Keep the Remove Button, positioned absolutely */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {" "}
                {/* Added z-10 */}
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full h-8 w-8 cursor-pointer" // Added cursor-pointer
                        onClick={(e) => {
                          e.preventDefault(); // Prevent link navigation if card is wrapped in Link
                          e.stopPropagation();
                          removeFromWishlist(item.id);
                        }}
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AnimatedSection>
          );
        })}
      </div>
    </div>
  );
}
