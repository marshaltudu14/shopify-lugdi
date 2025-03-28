"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "framer-motion";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white" | "vip-gold";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          const targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    const getGradientStyle = () => {
      if (variant === "white") {
        return `repeating-conic-gradient(
          from 236.84deg at 50% 50%,
          var(--black),
          var(--black) calc(25% / var(--repeating-conic-gradient-times))
        )`;
      }

      if (variant === "vip-gold") {
        return `
          radial-gradient(circle, #FFD700 10%, #FFD70000 20%),
          radial-gradient(circle at 40% 40%, #FFA500 5%, #FFA50000 15%),
          radial-gradient(circle at 60% 60%, #DAA520 10%, #DAA52000 20%),
          radial-gradient(circle at 40% 60%, #B8860B 10%, #B8860B00 20%),
          radial-gradient(circle at 50% 50%, #FF4500 5%, #FF450000 15%),
          repeating-conic-gradient(
            from 236.84deg at 50% 50%,
            #FFD700 0%,
            #FFA500 calc(20% / var(--repeating-conic-gradient-times)),
            #FF4500 calc(40% / var(--repeating-conic-gradient-times)),
            #DAA520 calc(60% / var(--repeating-conic-gradient-times)),
            #B8860B calc(80% / var(--repeating-conic-gradient-times)),
            #FFD700 calc(100% / var(--repeating-conic-gradient-times))
          )
        `;
      }

      return `
        radial-gradient(circle, #FFD700 10%, #FFD70000 20%),
        radial-gradient(circle at 40% 40%, #FFA500 5%, #FFA50000 15%),
        radial-gradient(circle at 60% 60%, #DAA520 10%, #DAA52000 20%),
        radial-gradient(circle at 40% 60%, #B8860B 10%, #B8860B00 20%),
        repeating-conic-gradient(
          from 236.84deg at 50% 50%,
          #FFD700 0%,
          #FFA500 calc(25% / var(--repeating-conic-gradient-times)),
          #DAA520 calc(50% / var(--repeating-conic-gradient-times)),
          #B8860B calc(75% / var(--repeating-conic-gradient-times)),
          #FFD700 calc(100% / var(--repeating-conic-gradient-times))
        )
      `;
    };

    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            variant === "vip-gold" && "border-amber-500/30",
            disabled && "!block"
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": "0",
              "--active": "0",
              "--glowingeffect-border-width": `${borderWidth}px`,
              "--repeating-conic-gradient-times": "5",
              "--gradient": getGradientStyle(),
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)]",
            // Remove the dark mode override that was replacing the light mode style
            className,
            disabled && "!hidden"
          )}
        >
          <div
            className={cn(
              "glow",
              "rounded-[inherit]",
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
              "after:[mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]",
              variant === "vip-gold" && "after:mix-blend-screen"
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
