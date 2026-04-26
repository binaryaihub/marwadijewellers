import { Container, SectionHeader } from "@/components/ui/Container";
import { getT } from "@/lib/i18n/server";

export const metadata = {
  title: "About us — Marwadi Jewellers",
  description:
    "Marwadi Jewellers brings Rajasthani-inspired imitation jewellery online — quality you can trust, prices you'll love. Hand-finished by Indian artisans.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const { t } = await getT();
  return (
    <Container className="py-12 md:py-20" size="narrow">
      <SectionHeader eyebrow={t("about.eyebrow")} title={t("about.title")} description={t("about.desc")} />

      <div className="prose prose-neutral max-w-none [&_p]:text-mj-ink/85 [&_p]:leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-3">
        <p>{t("about.p1")}</p>
        <h2>{t("about.h.what")}</h2>
        <p>{t("about.p.what")}</p>
        <h2>{t("about.h.why")}</h2>
        <p>{t("about.p.why")}</p>
        <h2>{t("about.h.ship")}</h2>
        <p>{t("about.p.ship")}</p>
      </div>
    </Container>
  );
}
