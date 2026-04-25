import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getT } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <Container className="py-24 text-center" size="narrow">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mj-gold-600">{t("notfound.eyebrow")}</p>
      <h1 className="font-display text-4xl md:text-6xl mt-2">{t("notfound.title")}</h1>
      <p className="mt-4 text-mj-mute">{t("notfound.desc")}</p>
      <Link href="/" className="inline-block mt-8">
        <Button>{t("notfound.cta")}</Button>
      </Link>
    </Container>
  );
}
