"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, alt, label }: { images: string[]; alt: string; label?: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : ["placeholder://pendant/x"];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-mj-cream mj-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <ProductImage src={list[active]} alt={alt} priority label={label} />
          </motion.div>
        </AnimatePresence>
      </div>

      {list.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "aspect-square overflow-hidden rounded-xl border-2 bg-mj-cream transition-all",
                active === i ? "border-mj-gold-500 scale-100" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <ProductImage src={img} alt={`${alt} ${i + 1}`} label={label} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
