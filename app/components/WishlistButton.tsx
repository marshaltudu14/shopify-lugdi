"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/contexts/WishlistContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WishlistButtonProps {
  variantId: string;
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  variantId,
  className,
}) => {
  const { addToWishlist, removeFromWishlist, isItemInWishlist } = useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Update local state when context changes
  useEffect(() => {
    setIsInWishlist(isItemInWishlist(variantId));
  }, [isItemInWishlist, variantId]);

  const handleToggleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent potential parent link navigation
    event.stopPropagation(); // Prevent event bubbling

    if (isInWishlist) {
      removeFromWishlist(variantId);
    } else {
      addToWishlist(variantId);
    }
    // Local state will update via the useEffect hook listening to context changes
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-full", className)}
            onClick={handleToggleWishlist}
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors duration-200",
                isInWishlist
                  ? "fill-red-500 text-red-500"
                  : "text-gray-500 hover:text-red-500"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WishlistButton;
