"use client";

import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { AddressForm } from "./AddressForm";
import { OrderSummary } from "./OrderSummary";
import { useT } from "@/lib/i18n/Provider";

export function CheckoutBody() {
  const { t } = useT();
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="mj-card bg-white p-6 md:p-8">
          <PaymentMethodPicker />
        </div>
        <div className="mj-card bg-white p-6 md:p-8">
          <h2 className="font-display text-xl mb-5">{t("checkout.address")}</h2>
          <AddressForm />
        </div>
      </div>
      <div className="lg:sticky lg:top-24 h-fit">
        <OrderSummary />
      </div>
    </div>
  );
}
