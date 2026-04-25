import { notFound } from "next/navigation";
import { Container, SectionHeader } from "@/components/ui/Container";
import { getT } from "@/lib/i18n/server";
import type { DictKey } from "@/lib/i18n/dict";

const SLUGS = ["shipping", "returns", "privacy"] as const;
type Slug = (typeof SLUGS)[number];

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(SLUGS as readonly string[]).includes(slug)) return {};
  const { t } = await getT();
  return { title: t(`policy.${slug}.title` as DictKey) };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(SLUGS as readonly string[]).includes(slug)) return notFound();
  const policy = slug as Slug;
  const { t } = await getT();
  const vars = { email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com" };

  return (
    <Container className="py-12 md:py-20" size="narrow">
      <SectionHeader
        eyebrow={t(`policy.${policy}.eyebrow` as DictKey)}
        title={t(`policy.${policy}.title` as DictKey)}
      />
      <div className="space-y-4 text-mj-ink/85 leading-relaxed">
        <p>{t(`policy.${policy}.p1` as DictKey, vars)}</p>
        <p>{t(`policy.${policy}.p2` as DictKey, vars)}</p>
        <p>{t(`policy.${policy}.p3` as DictKey, vars)}</p>
        <p>{t(`policy.${policy}.p4` as DictKey, vars)}</p>
      </div>
    </Container>
  );
}
