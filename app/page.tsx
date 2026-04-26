import { Container, SectionHeader } from "@/components/ui/Container";
import { Hero } from "@/components/home/Hero";
import { PromoMarquee } from "@/components/home/Marquee";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { WhyMJ } from "@/components/home/WhyMJ";
import { Testimonials } from "@/components/home/Testimonials";
import { getFeatured } from "@/lib/products";
import { getT } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";

export default async function HomePage() {
  const { t } = await getT();
  const adminView = await isAdmin();
  const featured = await getFeatured(8);

  return (
    <>
      <Hero />
      <PromoMarquee />

      <Container className="py-16 md:py-24">
        <SectionHeader
          eyebrow={t("home.collections.eyebrow")}
          title={t("home.collections.title")}
          description={t("home.collections.desc")}
        />
        <CategoryShowcase />
      </Container>

      <Container className="py-16 md:py-24">
        <SectionHeader
          eyebrow={t("home.featured.eyebrow")}
          title={t("home.featured.title")}
          description={t("home.featured.desc")}
        />
        <FeaturedSection products={featured} isAdminView={adminView} />
      </Container>

      <Container className="py-16 md:py-20">
        <SectionHeader eyebrow={t("home.why.eyebrow")} title={t("home.why.title")} />
        <WhyMJ />
      </Container>

      <Container className="py-16 md:py-24">
        <SectionHeader
          eyebrow={t("home.testimonials.eyebrow")}
          title={t("home.testimonials.title")}
          description={t("home.testimonials.desc")}
        />
        <Testimonials />
      </Container>
    </>
  );
}
