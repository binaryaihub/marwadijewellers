import { Container } from "@/components/ui/Container";
import { CheckoutBody } from "@/components/checkout/CheckoutBody";
import { CheckoutGuard } from "@/components/checkout/CheckoutGuard";
import { getT } from "@/lib/i18n/server";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const { t } = await getT();
  return (
    <Container className="py-10 md:py-14">
      <h1 className="font-display text-3xl md:text-5xl text-mj-ink mb-2">{t("checkout.title")}</h1>
      <p className="text-mj-mute mb-8">{t("checkout.sub")}</p>
      <CheckoutGuard />
      <CheckoutBody />
    </Container>
  );
}
