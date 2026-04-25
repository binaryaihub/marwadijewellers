"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, User } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/Provider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useT();
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const count = cartCount(items);

  if (pathname?.startsWith("/admin")) return null;

  const tabs: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; onClick?: () => void }[] = [
    { href: "/", label: t("tab.home"), icon: Home },
    { href: "/shop", label: t("tab.shop"), icon: Heart },
    { href: "#cart", label: t("tab.cart"), icon: ShoppingBag, onClick: () => setOpen(true) },
    { href: "/orders", label: t("tab.account"), icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-mj-line bg-white/95 backdrop-blur safe-bottom">
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || (tab.href !== "/" && pathname?.startsWith(tab.href));
          const isCart = tab.href === "#cart";
          const content = (
            <span className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px]", active ? "text-mj-maroon-700" : "text-mj-mute")}>
              <span className="relative">
                <Icon className="size-5" />
                {isCart && count > 0 && (
                  <span className="absolute -top-1.5 -right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-mj-maroon-700 px-1 text-[9px] font-bold text-mj-gold-200">
                    {count}
                  </span>
                )}
              </span>
              {tab.label}
            </span>
          );
          return (
            <li key={tab.href}>
              {tab.onClick ? (
                <button onClick={tab.onClick} className="w-full">
                  {content}
                </button>
              ) : (
                <Link href={tab.href}>{content}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
