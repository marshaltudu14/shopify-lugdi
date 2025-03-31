"use client";

import React from "react";
import { useWishlist } from "@/lib/contexts/WishlistContext";
import { useQuery } from "@apollo/client";
import { GET_WISHLIST_ITEMS_DETAILS } from "@/lib/queries/wishlist";
import { ProductVariant } from "@/lib/types/product"; // Assuming ProductVariant type is suitable
import { Loader2, Trash2, HeartCrack } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "@/lib/countries";
// Removed unused 'cn' import
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnimatedSection } from "@/app/components/FramerMotion"; // Removed unused 'itemVariants'

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
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center text-red-600 px-4">
        <p>Error loading wishlist items: {error.message}</p>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    // This case might happen if items were removed from Shopify after being wishlisted
    return (
      <AnimatedSection
        delay={0.1}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => {
          const currencySymbol = getCurrencySymbol(item.price.currencyCode);
          const imageUrl = item.image?.url || item.product.featuredImage?.url; // Fallback to product image
          const altText =
            item.image?.altText ||
            item.product.featuredImage?.altText ||
            item.product.title;

          return (
            <AnimatedSection
              key={item.id}
              className="border rounded-lg p-4 flex flex-col justify-between relative group"
            >
              <Link
                href={`/products/${item.product.handle}?variant=${item.id}`}
                className="block mb-4"
              >
                <div className="aspect-square overflow-hidden rounded-md mb-4 relative bg-muted">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={altText}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg truncate">
                  {item.product.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {item.title}
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-medium text-primary">
                    {currencySymbol}
                    {Number(item.price.amount).toFixed(2)}
                  </span>
                  {item.compareAtPrice?.amount &&
                    Number(item.compareAtPrice.amount) >
                      Number(item.price.amount) && (
                      <span className="text-sm line-through text-muted-foreground">
                        {currencySymbol}
                        {Number(item.compareAtPrice.amount).toFixed(2)}
                      </span>
                    )}
                </div>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full h-8 w-8"
                        onClick={() => removeFromWishlist(item.id)}
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
