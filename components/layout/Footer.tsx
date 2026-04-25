"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { Container } from "@/components/ui/Container";
import { useT } from "@/lib/i18n/Provider";

export function Footer() {
  const { t } = useT();
  const upiId = process.env.NEXT_PUBLIC_UPI_ID ?? "yourupi@okicici";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+91XXXXXXXXXX";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com";

  return (
    <footer className="bg-mj-maroon-900 text-mj-ivory mt-24 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-mj-gold-500 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-mj-gold-300 blur-3xl" />
      </div>

      <Container className="relative pt-16 pb-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="[&_*]:!text-mj-ivory">
              <Logo />
            </div>
            <p className="mt-4 text-sm text-mj-ivory/70 leading-relaxed">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-mj-gold-500 hover:text-mj-maroon-900 transition-colors"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-mj-gold-500 hover:text-mj-maroon-900 transition-colors"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href={`https://wa.me/${wa.replace(/\D/g, "")}`}
                aria-label="WhatsApp"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-mj-gold-500 hover:text-mj-maroon-900 transition-colors"
              >
                <MessageCircle className="size-4" />
              </a>
            </div>
          </div>

          <FooterCol title={t("footer.shop")}>
            <FooterLink href="/shop/women">{t("nav.women")}</FooterLink>
            <FooterLink href="/shop/men">{t("nav.men")}</FooterLink>
            <FooterLink href="/shop">{t("footer.allCollections")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.help")}>
            <FooterLink href="/contact">{t("footer.contactUs")}</FooterLink>
            <FooterLink href="/policies/shipping">{t("footer.shipping")}</FooterLink>
            <FooterLink href="/policies/returns">{t("footer.returns")}</FooterLink>
            <FooterLink href="/policies/privacy">{t("footer.privacy")}</FooterLink>
          </FooterCol>

          <FooterCol title={t("footer.payConnect")}>
            <li className="text-sm text-mj-ivory/70">
              {t("footer.upi")}: <span className="font-mono text-mj-gold-300">{upiId}</span>
            </li>
            <li className="text-sm text-mj-ivory/70">
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-mj-gold-300 transition-colors">
                <Mail className="size-3.5" /> {email}
              </a>
            </li>
            <li className="text-sm text-mj-ivory/70">
              <a
                href={`https://wa.me/${wa.replace(/\D/g, "")}`}
                className="flex items-center gap-2 hover:text-mj-gold-300 transition-colors"
              >
                <MessageCircle className="size-3.5" /> {wa}
              </a>
            </li>
          </FooterCol>
        </div>

        <div className="mj-divider mt-12 opacity-60" />

        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-mj-ivory/60">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.note")}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-mj-gold-300 text-sm font-semibold uppercase tracking-[0.2em] mb-4">{title}</h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-mj-ivory/70 hover:text-mj-gold-300 transition-colors">
        {children}
      </Link>
    </li>
  );
}
