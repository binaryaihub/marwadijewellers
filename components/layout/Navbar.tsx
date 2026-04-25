"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { useT } from "@/lib/i18n/Provider";
import { LocaleToggle } from "@/components/i18n/LocaleToggle";

export function Navbar() {
  const { t } = useT();
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const count = cartCount(items);
  const [bounce, setBounce] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/shop/women", label: t("nav.women") },
    { href: "/shop/men", label: t("nav.men") },
    { href: "/shop", label: t("nav.all") },
    { href: "/about", label: t("nav.about") },
  ];

  useEffect(() => {
    if (count === 0) return;
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 500);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <>
      <header className="glass-nav sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Marwadi Jewellers home">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-mj-ink hover:text-mj-maroon-700 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-mj-gold-500 transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LocaleToggle className="hidden sm:inline-flex" />
            <Link
              href="/shop"
              aria-label={t("nav.search")}
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full text-mj-ink hover:bg-mj-cream"
            >
              <Search className="size-5" />
            </Link>
            <button
              type="button"
              aria-label={t("nav.openCart")}
              onClick={() => setOpen(true)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-mj-ink hover:bg-mj-cream"
            >
              <ShoppingBag className={cn("size-5", bounce && "cart-bounce")} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-mj-maroon-700 px-1 text-[10px] font-bold text-mj-gold-200">
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label={t("nav.openMenu")}
              onClick={() => setMobileOpen(true)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-mj-ink hover:bg-mj-cream"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-mj-maroon-900/40 backdrop-blur-sm"
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="fixed inset-y-0 right-0 z-50 w-[80%] max-w-xs bg-mj-ivory shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-mj-line">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label={t("nav.closeMenu")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-mj-cream"
                >
                  <X className="size-5" />
                </button>
              </div>
              <ul className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-4 py-3 text-base font-medium text-mj-ink hover:bg-mj-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-mj-ink hover:bg-mj-cream"
                  >
                    {t("nav.contact")}
                  </Link>
                </li>
              </ul>
              <div className="px-5 pt-3 pb-6 border-t border-mj-line">
                <p className="text-xs uppercase tracking-[0.2em] text-mj-mute mb-2">{t("lang.toggle.aria")}</p>
                <LocaleToggle />
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
