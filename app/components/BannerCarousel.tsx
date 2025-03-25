"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
// Carousel components and UI
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

interface Banner {
  image: string;
  headline?: string;
  subtitle?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [activeIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Transform text size based on scroll (larger to smaller)
  const textScale = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Zoom effect for the image on scroll (contained within its container)
  const imageScale = useTransform(scrollY, [0, 300], [1, 1.15]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <Carousel
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
        className="w-full"
      >
        <CarouselContent>
          {/* Map through the banners array if it exists */}
          {banners?.map((banner, index) => (
            <CarouselItem key={index}>
              {/* Only render if there's a valid image */}
              {banner.image && (
                <div className="relative h-[75vh] md:h-screen overflow-hidden">
                  {/* Container with overflow hidden to ensure zoom stays contained */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Parallax image effect with zoom on scroll - contained in parent */}
                    <motion.div
                      className="absolute inset-0 w-full h-full"
                      style={{
                        scale: imageScale,
                        transformOrigin: "center center",
                      }}
                    >
                      <Image
                        src={banner.image}
                        alt="Banner Image"
                        fill
                        sizes="100vw"
                        priority
                        className="object-cover"
                      />
                    </motion.div>
                  </div>

                  {/* Elegant gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

                  {/* Text that shrinks on scroll */}
                  {banner.headline && (
                    <motion.div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4">
                      <motion.div
                        initial={{ opacity: 0, filter: "blur(8px)" }}
                        animate={{
                          opacity: index === activeIndex ? 1 : 0,
                          filter:
                            index === activeIndex ? "blur(0px)" : "blur(8px)",
                        }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="text-center"
                        style={{ scale: textScale }}
                      >
                        {/* Original larger text size that shrinks on scroll */}
                        <h2 className="text-7xl lg:text-9xl font-bold tracking-[0.1em] mb-6">
                          {banner.headline}
                        </h2>

                        {/* Optional subtitle with elegant animation */}
                        {banner.subtitle && (
                          <motion.p
                            className="text-xl md:text-2xl max-w-3xl mx-auto font-light tracking-wider"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                              opacity: index === activeIndex ? 1 : 0,
                              y: index === activeIndex ? 0 : 20,
                            }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                          >
                            {banner.subtitle}
                          </motion.p>
                        )}

                        {/* Decorative line element */}
                        <motion.div
                          className="w-24 h-px bg-white/70 mx-auto mt-8"
                          initial={{ width: 0 }}
                          animate={{ width: index === activeIndex ? 96 : 0 }}
                          transition={{ duration: 1, delay: 0.6 }}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
