import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Find your order" };

export default async function OrdersIndex() {
  const { t } = await getT();
  return (
    <Container className="py-12 md:py-16" size="narrow">
      <h1 className="font-display text-3xl md:text-4xl mb-3">{t("orders.title")}</h1>
      <p className="text-mj-mute mb-6">{t("orders.desc")}</p>
      <form action="/orders/lookup" className="flex gap-2">
        <input
          name="id"
          required
          placeholder={t("orders.placeholder")}
          className="flex-1 h-11 rounded-full border border-mj-line bg-white px-5 text-sm focus:border-mj-gold-500 focus:outline-none"
        />
        <Button>{t("orders.find")}</Button>
      </form>
      <p className="mt-8 text-sm text-mj-mute">
        {t("orders.noOrder")}{" "}
        <Link href="/shop" className="text-mj-maroon-700 underline underline-offset-4 decoration-mj-gold-500">
          {t("orders.browse")}
        </Link>
      </p>
    </Container>
  );
}
