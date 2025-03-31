import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { GlowingEffect } from "./glowing-effect"; // Import the GlowingEffect

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Define the props interface explicitly
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, // Use ButtonHTMLAttributes
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  glowVariant?: "vip-gold" | null; // Add prop to control glow
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>( // Use forwardRef
  (
    { className, variant, size, asChild = false, glowVariant, ...props },
    ref
  ) => {
    // Add ref
    const Comp = asChild ? Slot : "button";
    const showGlow = glowVariant === "vip-gold";

    // Apply relative positioning only when glow is active
    const wrapperClassName = cn(showGlow && "relative");

    return (
      // Wrap the component to contain the glow effect
      <div className={wrapperClassName}>
        <Comp
          data-slot="button"
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref} // Pass ref to the underlying component
          {...props}
        />
        {showGlow && (
          <GlowingEffect
            variant="vip-gold"
            glow={true}
            // Adjust proximity/spread/blur as needed for buttons
            proximity={10}
            spread={15}
            blur={5}
            movementDuration={1}
            borderWidth={1}
            disabled={props.disabled} // Pass disabled state to the effect
          />
        )}
      </div>
    );
  }
);
Button.displayName = "Button"; // Add display name for forwardRef

export { Button, buttonVariants };
