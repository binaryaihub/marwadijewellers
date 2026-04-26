import { Container, SectionHeader } from "@/components/ui/Container";
import { MessageCircle, Mail, Instagram } from "lucide-react";
import { getT } from "@/lib/i18n/server";

export const metadata = {
  title: "Contact — Marwadi Jewellers",
  description:
    "Reach Marwadi Jewellers on WhatsApp +91 6376785873 or email marwadijeweller@gmail.com. Order help, custom enquiries, support.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { t } = await getT();
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+91XXXXXXXXXX";
  const upiId = process.env.NEXT_PUBLIC_UPI_ID ?? "yourupi@okicici";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com";

  return (
    <Container className="py-12 md:py-20" size="narrow">
      <SectionHeader eyebrow={t("contact.eyebrow")} title={t("contact.title")} description={t("contact.desc")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={`https://wa.me/${wa.replace(/\D/g, "")}`}
          className="mj-card bg-white p-6 hover:bg-mj-gold-100/40 transition-colors"
        >
          <MessageCircle className="size-6 text-mj-maroon-700" />
          <p className="font-display text-xl mt-3">{t("contact.whatsapp")}</p>
          <p className="text-sm text-mj-mute mt-1">{wa}</p>
          <p className="text-xs text-mj-mute mt-2">{t("contact.whatsapp.hint")}</p>
        </a>

        <a href={`mailto:${email}`} className="mj-card bg-white p-6 hover:bg-mj-gold-100/40 transition-colors">
          <Mail className="size-6 text-mj-maroon-700" />
          <p className="font-display text-xl mt-3">{t("contact.email")}</p>
          <p className="text-sm text-mj-mute mt-1 break-all">{email}</p>
          <p className="text-xs text-mj-mute mt-2">{t("contact.email.hint")}</p>
        </a>

        <a href="https://instagram.com" className="mj-card bg-white p-6 hover:bg-mj-gold-100/40 transition-colors">
          <Instagram className="size-6 text-mj-maroon-700" />
          <p className="font-display text-xl mt-3">{t("contact.instagram")}</p>
          <p className="text-sm text-mj-mute mt-1">@marwadijewellers</p>
          <p className="text-xs text-mj-mute mt-2">{t("contact.instagram.hint")}</p>
        </a>

        <div className="mj-card bg-white p-6">
          <p className="font-display text-xl">{t("footer.upi")}</p>
          <p className="font-mono text-sm text-mj-maroon-800 mt-2">{upiId}</p>
          <p className="text-xs text-mj-mute mt-2">{t("contact.upi.hint")}</p>
        </div>
      </div>
    </Container>
  );
}
