"use client";

import React from "react";
import { useWishlist } from "@/lib/contexts/WishlistContext";
import detailedProductsData from "@/lib/mock-data/detailedProducts.json";
import { ProductVariant } from "@/lib/types/product"; // Assuming ProductVariant type is suitable
import { Trash2, HeartCrack } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedSection } from "@/app/components/FramerMotion"; // Removed unused 'itemVariants'
import ProductCard from "@/app/components/ProductCard"; // Import ProductCard
import { CollectionProductNode } from "@/lib/types/collection"; // Import CollectionProductNode type



// Define a type for the fetched data structure


export default function ClientWishlistPage() {
  const { wishlistedVariantIds, removeFromWishlist } = useWishlist();

  const wishlistItems: ProductVariant[] = [];

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

  // Filter detailedProductsData to find matching wishlist items
  wishlistedVariantIds.forEach((variantId) => {
    for (const productEntry of detailedProductsData) {
      const foundVariant = productEntry.product.variants.edges.find(
        (edge) => edge.node.id === variantId
      )?.node;
      if (foundVariant) {
        wishlistItems.push(foundVariant);
        break; // Found the variant, move to the next wishlisted ID
      }
    }
  });

  if (wishlistItems.length === 0) {
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
          The items previously in your wishlist might no longer be available or are not in the mock data.
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
        {wishlistItems?.filter(item => item && item.product && item.product.id).map((item) => {
          // Safety check for item and item.product
          if (!item || !item.product || !item.product.id) {
            return null;
          }

          // Removed unused variables: currencySymbol, imageUrl, altText

          // Adapt ProductVariant data to CollectionProductNode structure for ProductCard
          const productForCard: CollectionProductNode = {
            id: item.product.id,
            title: item.product.title,
            handle: item.product.handle,
            description: item.product.description || "",
            seo: item.product.seo || { title: item.product.title, description: "" },
            featuredImage: item.image || item.product.featuredImage || null,
            priceRange: {
              minVariantPrice: {
                amount: item.price.amount,
                currencyCode: item.price.currencyCode,
              },
            },
            compareAtPriceRange: {
              minVariantPrice: item.compareAtPrice
                ? {
                    amount: item.compareAtPrice.amount,
                    currencyCode: item.compareAtPrice.currencyCode,
                  }
                : {
                    amount: "0",
                    currencyCode: item.price.currencyCode,
                  },
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
                    availableForSale: item.availableForSale,
                    selectedOptions: item.selectedOptions,
                    price: item.price,
                    compareAtPrice: item.compareAtPrice,
                    quantityAvailable: item.quantityAvailable,
                    image: item.image,
                    title: item.title,
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
