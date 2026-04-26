"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressInput } from "@/lib/validators";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-store";
import { useCheckoutMethod } from "@/lib/checkout-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/Toast";
import { Lock } from "lucide-react";
import { useT } from "@/lib/i18n/Provider";

export function AddressForm() {
  const { t } = useT();
  const items = useCart((s) => s.items);
  const method = useCheckoutMethod((s) => s.method);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (data) => {
    if (items.length === 0) {
      toast(t("valid.cartEmpty"), "error");
      router.push("/shop");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          paymentMethod: method,
          address: data,
          items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to place order");
      // Don't clear the cart here — the CheckoutGuard on /checkout would
      // race the navigation and bounce the user to /cart. The pay page
      // clears the cart on mount instead (CartClearOnMount).
      router.push(`/checkout/pay/${json.orderId}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Something went wrong", "error");
      setSubmitting(false);
    }
  });

  const fieldErr = (msg?: string): string | undefined => {
    if (!msg) return undefined;
    const map: Record<string, string> = {
      "Please enter your full name": t("valid.name"),
      "Enter a valid 10-digit Indian mobile number": t("valid.phone"),
      "Enter a valid email": t("valid.email"),
      "Address required": t("valid.address"),
      "Enter a valid 6-digit pincode": t("valid.pincode"),
    };
    return map[msg] ?? msg;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="customerName">{t("checkout.field.name")}</Label>
        <Input id="customerName" autoComplete="name" {...register("customerName")} />
        <FieldError message={fieldErr(errors.customerName?.message)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerPhone">{t("checkout.field.phone")}</Label>
          <Input id="customerPhone" inputMode="tel" autoComplete="tel" {...register("customerPhone")} />
          <FieldError message={fieldErr(errors.customerPhone?.message)} />
        </div>
        <div>
          <Label htmlFor="customerEmail">{t("checkout.field.email")}</Label>
          <Input id="customerEmail" type="email" autoComplete="email" {...register("customerEmail")} />
          <FieldError message={fieldErr(errors.customerEmail?.message)} />
        </div>
      </div>

      <div>
        <Label htmlFor="addressLine1">{t("checkout.field.address1")}</Label>
        <Input id="addressLine1" autoComplete="address-line1" {...register("addressLine1")} />
        <FieldError message={fieldErr(errors.addressLine1?.message)} />
      </div>
      <div>
        <Label htmlFor="addressLine2">{t("checkout.field.address2")}</Label>
        <Input id="addressLine2" autoComplete="address-line2" {...register("addressLine2")} />
      </div>
      <div>
        <Label htmlFor="landmark">{t("checkout.field.landmark")}</Label>
        <Input id="landmark" {...register("landmark")} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">{t("checkout.field.city")}</Label>
          <Input id="city" autoComplete="address-level2" {...register("city")} />
          <FieldError message={fieldErr(errors.city?.message)} />
        </div>
        <div>
          <Label htmlFor="state">{t("checkout.field.state")}</Label>
          <Input id="state" autoComplete="address-level1" {...register("state")} />
          <FieldError message={fieldErr(errors.state?.message)} />
        </div>
        <div>
          <Label htmlFor="pincode">{t("checkout.field.pincode")}</Label>
          <Input id="pincode" inputMode="numeric" autoComplete="postal-code" {...register("pincode")} />
          <FieldError message={fieldErr(errors.pincode?.message)} />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full mt-2" disabled={submitting}>
        <Lock className="size-4" />
        {submitting
          ? t("checkout.placing")
          : method === "cod"
            ? t("checkout.placeOrder.cod")
            : t("checkout.placeOrder")}
      </Button>
      <p className="text-center text-xs text-mj-mute">
        {method === "cod" ? t("checkout.smallNote.cod") : t("checkout.smallNote")}
      </p>
    </form>
  );
}
